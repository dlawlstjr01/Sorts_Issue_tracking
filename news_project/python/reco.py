import os
import re
import math
import random
import threading
import time
from typing import List, Dict, Any, Optional

import numpy as np
import pandas as pd
import pymysql

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import KMeans

# -----------------------------
# Settings
# -----------------------------
SEED = int(os.getenv("SEED", "42"))
random.seed(SEED)
np.random.seed(SEED)

DB_HOST = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
DB_PORT = int(os.getenv("DB_PORT", "3307"))
DB_USER = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
DB_PASSWORD = os.getenv("DB_PASSWORD", "smhrd3")
DB_NAME = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

K_DEFAULT = 20
SVD_DIM = 96
N_TOPICS_TARGET = 8

MIN_UNIQUE_CATS_IN_TOPK_DEFAULT = 10
PRE_N = 260

MIN_STAY_TIME_FOR_POSITIVE = 3
STAY_TIME_WEIGHT = 1.0
SCROLL_DEPTH_WEIGHT = 0.18
VIEW_COUNT_BASE_WEIGHT = 2.5

RELOAD_INTERVAL_SEC = int(os.getenv("RELOAD_INTERVAL_SEC", "300"))  # 5분마다 기사 재적재

# -----------------------------
# FastAPI
# -----------------------------
app = FastAPI(title="Reco API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Global State
# -----------------------------
DF: Optional[pd.DataFrame] = None
ITEMS: List[Dict[str, Any]] = []
ID2IDX: Dict[str, int] = {}

VECT: Optional[TfidfVectorizer] = None
SVD: Optional[TruncatedSVD] = None
KM: Optional[KMeans] = None
X_NORM: Optional[np.ndarray] = None

ITEM_CAT: Optional[np.ndarray] = None
N_CATS: int = 0
CAT_LABELS: List[str] = []

LAST_ARTICLE_COUNT: int = 0
LAST_LOAD_TS: float = 0.0
LOAD_LOCK = threading.Lock()

# -----------------------------
# Helpers
# -----------------------------
def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )

def clean_text(s: str) -> str:
    s = str(s or "").lower()
    s = re.sub(r"http\S+", " ", s)
    s = re.sub(r"[^0-9a-zA-Z가-힣\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def safe_str(v, default=""):
    if v is None:
        return default
    return str(v)

def safe_category(v):
    v = safe_str(v, "").strip()
    return v if v else "etc"

def parse_datetime(v):
    try:
        if v is None:
            return None
        ts = pd.to_datetime(v, errors="coerce")
        if pd.isna(ts):
            return None
        return ts.to_pydatetime()
    except Exception:
        return None

def calc_recency_score(raw_published_at) -> float:
    dt = parse_datetime(raw_published_at)
    if dt is None:
        return 0.0

    now = pd.Timestamp.now().to_pydatetime()
    diff_hours = (now - dt).total_seconds() / 3600.0

    if diff_hours <= 6:
        return 0.18
    if diff_hours <= 24:
        return 0.12
    if diff_hours <= 72:
        return 0.08
    if diff_hours <= 168:
        return 0.04
    return 0.0

def calc_behavior_recency_bonus(last_seen_at) -> float:
    dt = parse_datetime(last_seen_at)
    if dt is None:
        return 0.0

    now = pd.Timestamp.now().to_pydatetime()
    diff_hours = (now - dt).total_seconds() / 3600.0

    if diff_hours <= 6:
        return 1.2
    if diff_hours <= 24:
        return 0.8
    if diff_hours <= 72:
        return 0.45
    if diff_hours <= 168:
        return 0.2
    return 0.0

def _build_category(df: pd.DataFrame, topic_id: np.ndarray):
    if "source" not in df.columns:
        df["source"] = df["category"].fillna("etc").astype(str)

    src = df["source"].astype(str).fillna("etc")
    cats = (src + "/T" + pd.Series(topic_id).astype(str)).tolist()
    uniq = sorted(list(set(cats)))
    cat2idx = {c: i for i, c in enumerate(uniq)}
    item_cat = np.array([cat2idx[c] for c in cats], dtype=np.int32)
    return item_cat, uniq

def _map_item(row: pd.Series, idx: int) -> Dict[str, Any]:
    _id = str(row.get("id", idx))
    return {
        "id": _id,
        "title": safe_str(row.get("title"), "(제목 없음)"),
        "category": safe_category(row.get("category")),
        "category_for_model": safe_str(row.get("category_for_model"), ""),
        "url": safe_str(row.get("url"), ""),
        "thumbnail": safe_str(row.get("thumbnail"), ""),
        "published_at": row.get("published_at", None),
        "score": 0.0,
    }

# -----------------------------
# Load articles from DB
# -----------------------------
def fetch_articles_from_db() -> pd.DataFrame:
    sql = """
        SELECT
            id,
            title,
            content,
            category,
            url,
            thumbnail,
            published_at
        FROM articles
        WHERE title IS NOT NULL
        AND TRIM(title) <> ''
        AND published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY published_at DESC, id DESC
        LIMIT 10000
    """

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        return pd.DataFrame(columns=[
            "id", "title", "content", "category", "url",
            "thumbnail", "published_at"
        ])

    df = pd.DataFrame(rows)

    if "content" not in df.columns:
        df["content"] = ""

    df["id"] = df["id"].astype(str)
    df["title"] = df["title"].fillna("").astype(str)
    df["content"] = df["content"].fillna("").astype(str)
    df["category"] = df.get("category", pd.Series(["etc"] * len(df))).fillna("etc").astype(str)
    df["url"] = df.get("url", pd.Series([""] * len(df))).fillna("").astype(str)
    df["thumbnail"] = df.get("thumbnail", pd.Series([""] * len(df))).fillna("").astype(str)
    df["source"] = df["category"].replace("", "etc").fillna("etc").astype(str)

    return df.reset_index(drop=True)

def get_article_count() -> int:
    sql = "SELECT COUNT(*) AS cnt FROM articles"
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
            return int((row or {}).get("cnt") or 0)
    finally:
        conn.close()

def load_all():
    global DF, ITEMS, ID2IDX, VECT, SVD, KM, X_NORM, ITEM_CAT, N_CATS, CAT_LABELS
    global LAST_ARTICLE_COUNT, LAST_LOAD_TS

    with LOAD_LOCK:
        print("[RecoAPI] load_all start")
        df = fetch_articles_from_db()
        print(f"[RecoAPI] fetched rows={len(df)}")

        if df.empty:
            DF = pd.DataFrame()
            ITEMS = []
            ID2IDX = {}
            VECT = None
            SVD = None
            KM = None
            X_NORM = None
            ITEM_CAT = np.array([], dtype=np.int32)
            N_CATS = 0
            CAT_LABELS = []
            LAST_ARTICLE_COUNT = 0
            LAST_LOAD_TS = time.time()
            print("[RecoAPI] articles table is empty")
            return

        texts = (df["title"].fillna("") + " " + df["content"].fillna("").str[:2200]).tolist()
        texts = [clean_text(t) for t in texts]
        print("[RecoAPI] text preprocessing done")

        VECT = TfidfVectorizer(max_features=80000, ngram_range=(1, 2), min_df=2)
        X = VECT.fit_transform(texts)
        print(f"[RecoAPI] tfidf done shape={X.shape}")

        if X.shape[1] <= 2:
            svd_dim = 2
        else:
            svd_dim = min(SVD_DIM, X.shape[1] - 1)

        SVD = TruncatedSVD(n_components=svd_dim, random_state=SEED)
        Xr = SVD.fit_transform(X).astype(np.float32)
        print(f"[RecoAPI] svd done shape={Xr.shape}")

        X_NORM = Xr / (np.linalg.norm(Xr, axis=1, keepdims=True) + 1e-12)

        n_items = len(df)

        if n_items < 2:
            topic_id = np.zeros(n_items, dtype=np.int32)
            KM = None
            n_topics = 1
        else:
            desired = min(N_TOPICS_TARGET, max(6, int(math.sqrt(n_items)) // 3))
            n_topics = max(2, min(desired, n_items))
            print(f"[RecoAPI] kmeans start n_topics={n_topics}")
            KM = KMeans(n_clusters=n_topics, random_state=SEED, n_init=10)
            topic_id = KM.fit_predict(X_NORM).astype(np.int32)
            print("[RecoAPI] kmeans done")

        df["topic_id"] = topic_id
        item_cat, uniq_cats = _build_category(df, topic_id)
        df["category_for_model"] = (
            df["source"].astype(str) + "/T" + df["topic_id"].astype(str)
        )

        DF = df
        ITEM_CAT = item_cat
        CAT_LABELS = uniq_cats
        N_CATS = len(uniq_cats)

        ITEMS = [_map_item(df.iloc[i], i) for i in range(n_items)]
        ID2IDX = {ITEMS[i]["id"]: i for i in range(n_items)}

        LAST_ARTICLE_COUNT = len(df)
        LAST_LOAD_TS = time.time()

        print(f"[RecoAPI] loaded items={len(ITEMS)} topics={n_topics} cats={N_CATS}")

def auto_reload_loop():
    global LAST_ARTICLE_COUNT

    while True:
        try:
            time.sleep(RELOAD_INTERVAL_SEC)
            current_count = get_article_count()
            if current_count != LAST_ARTICLE_COUNT:
                print(f"[RecoAPI] article count changed {LAST_ARTICLE_COUNT} -> {current_count}, reloading...")
                load_all()
        except Exception as e:
            print("[RecoAPI] auto_reload_loop error:", e)

# -----------------------------
# User preference from log table
# -----------------------------
def fetch_user_pref_rows(user_id: int) -> List[Dict[str, Any]]:
    sql = """
        SELECT
            l.article_id,
            SUM(
                CASE
                    WHEN IFNULL(l.stay_time, 0) >= %s
                    THEN IFNULL(l.stay_time, 0) * %s
                    ELSE 0
                END
                + IFNULL(l.scroll_depth, 0) * %s
                + %s
                + CASE
                    WHEN l.created_at IS NOT NULL THEN 0
                    ELSE 0
                  END
            ) AS pref_score,
            COUNT(*) AS view_count,
            MAX(l.created_at) AS last_seen_at
        FROM user_log l
        WHERE l.user_id = %s
          AND l.article_id IS NOT NULL
        GROUP BY l.article_id
        ORDER BY pref_score DESC, view_count DESC, last_seen_at DESC
        LIMIT 100
    """

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (
                    MIN_STAY_TIME_FOR_POSITIVE,
                    STAY_TIME_WEIGHT,
                    SCROLL_DEPTH_WEIGHT,
                    VIEW_COUNT_BASE_WEIGHT,
                    user_id,
                ),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        return []

    for row in rows:
        row["pref_score"] = float(row.get("pref_score") or 0.0)
        row["view_count"] = int(row.get("view_count") or 0)

        bonus = calc_behavior_recency_bonus(row.get("last_seen_at"))
        row["pref_score"] += bonus + math.log1p(row["view_count"]) * 0.6

    rows.sort(
        key=lambda x: (
            float(x.get("pref_score") or 0.0),
            int(x.get("view_count") or 0),
            parse_datetime(x.get("last_seen_at")) or pd.Timestamp.min.to_pydatetime(),
        ),
        reverse=True,
    )
    return rows

def fetch_guest_popular_rows(limit: int = 200) -> List[Dict[str, Any]]:
    sql = """
        SELECT
            l.article_id,
            COUNT(*) AS view_count,
            SUM(IFNULL(l.stay_time, 0)) AS total_stay_time,
            SUM(IFNULL(l.scroll_depth, 0)) AS total_scroll_depth,
            MAX(l.created_at) AS last_seen_at
        FROM user_log l
        WHERE l.article_id IS NOT NULL
        GROUP BY l.article_id
        ORDER BY view_count DESC, total_stay_time DESC, total_scroll_depth DESC, last_seen_at DESC
        LIMIT %s
    """
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (limit,))
            rows = cur.fetchall()
    finally:
        conn.close()

    return rows or []

# -----------------------------
# Diversity Rerank
# -----------------------------
def diversify_rerank(cand_idx: np.ndarray, scores: np.ndarray, k: int, min_unique_cats: int) -> List[int]:
    if len(cand_idx) == 0:
        return []

    order = np.argsort(-scores)
    sorted_idx = cand_idx[order].tolist()

    target_unique = min(min_unique_cats, N_CATS, k)
    chosen: List[int] = []
    chosen_set = set()
    chosen_cats = set()

    for idx in sorted_idx:
        if len(chosen) >= k:
            break
        c = int(ITEM_CAT[idx])
        if c in chosen_cats:
            continue
        chosen.append(idx)
        chosen_set.add(idx)
        chosen_cats.add(c)
        if len(chosen_cats) >= target_unique:
            break

    if len(chosen) < k:
        for idx in sorted_idx:
            if len(chosen) >= k:
                break
            if idx in chosen_set:
                continue
            chosen.append(idx)
            chosen_set.add(idx)

    return chosen[:k]

# -----------------------------
# Personalized Recommend
# -----------------------------
def recommend(user_id: Optional[int], k: int) -> List[Dict[str, Any]]:
    global X_NORM

    k = max(1, min(int(k), 50))
    n = len(ITEMS)

    if n == 0 or X_NORM is None:
        return []

    # 비로그인: 추천 안 함
    if user_id is None or int(user_id) <= 0:
        return []

    pref_rows = fetch_user_pref_rows(int(user_id))

    # 로그인했지만 개인 로그가 없음
    if not pref_rows:
        return []

    seen_idx = []
    pref_score_map = {}

    for row in pref_rows:
        aid = str(row.get("article_id", "")).strip()
        if not aid:
            continue

        pref_score_map[aid] = float(row.get("pref_score") or 0.0)

        if aid in ID2IDX:
            seen_idx.append(ID2IDX[aid])

    # user_log 는 있지만 현재 추천 데이터셋 ITEMS 에 매핑되는 기사가 없음
    if not seen_idx:
        return []

    weights = np.array(
        [max(pref_score_map.get(ITEMS[idx]["id"], 0.1), 0.1) for idx in seen_idx],
        dtype=np.float32,
    )
    weights = weights / (weights.sum() + 1e-12)

    user_vec = np.average(
        X_NORM[np.array(seen_idx, dtype=np.int32)],
        axis=0,
        weights=weights,
    )
    user_vec = user_vec / (np.linalg.norm(user_vec) + 1e-12)

    scores_all = (X_NORM @ user_vec).astype(np.float32)

    # 이미 본 기사 완전 제외
    for idx in seen_idx:
        scores_all[idx] = -1e9

    # 최신 기사 가산점
    for i in range(n):
        scores_all[i] += calc_recency_score(ITEMS[i].get("published_at"))

    available_n = n - len(seen_idx)
    pre = min(PRE_N, available_n) if available_n > 0 else 0

    if pre <= 0:
        return []

    cand_idx = np.argpartition(-scores_all, kth=pre - 1)[:pre]
    scores = scores_all[cand_idx]

    picked_idx = diversify_rerank(
        cand_idx=cand_idx,
        scores=scores,
        k=k,
        min_unique_cats=MIN_UNIQUE_CATS_IN_TOPK_DEFAULT,
    )

    out = []
    for idx in picked_idx:
        it = dict(ITEMS[idx])
        it["score"] = float(scores_all[idx])

        if not it.get("category"):
            it["category"] = "etc"

        out.append(it)

    return out

# -----------------------------
# Routes
# -----------------------------
@app.on_event("startup")
def on_startup():
    def bootstrap():
        try:
            load_all()
        except Exception as e:
            print("[RecoAPI] bootstrap load_all error:", e)

    threading.Thread(target=bootstrap, daemon=True).start()
    threading.Thread(target=auto_reload_loop, daemon=True).start()

@app.get("/health")
def health():
    return {
        "ok": True,
        "items": len(ITEMS),
        "cats": N_CATS,
        "last_article_count": LAST_ARTICLE_COUNT,
        "last_load_ts": LAST_LOAD_TS,
    }

@app.get("/reload")
def reload_items():
    load_all()
    return {"ok": True, "items": len(ITEMS), "cats": N_CATS}

@app.get("/reco")
def reco(userId: Optional[int] = None, k: int = 20):
    if userId is None or int(userId) <= 0:
        return {"items": []}

    items = recommend(user_id=userId, k=k)
    return {"items": items}