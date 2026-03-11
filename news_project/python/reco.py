import os
import re
import math
import random
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

# -----------------------------
# FastAPI
# -----------------------------
app = FastAPI(title="Reco API", version="2.0.0")

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
        ORDER BY published_at DESC, id DESC
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

def load_all():
    global DF, ITEMS, ID2IDX, VECT, SVD, KM, X_NORM, ITEM_CAT, N_CATS, CAT_LABELS

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

    print(f"[RecoAPI] loaded items={len(ITEMS)} topics={n_topics} cats={N_CATS}")

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
            ) AS pref_score,
            COUNT(*) AS view_count,
            MAX(l.created_at) AS last_seen_at
        FROM log l
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
# Recommend
# -----------------------------
def recommend(user_id: int, k: int) -> List[Dict[str, Any]]:
    global X_NORM

    k = max(1, min(int(k), 50))
    n = len(ITEMS)

    if n == 0 or X_NORM is None:
        return []

    pref_rows = fetch_user_pref_rows(user_id)

    if not pref_rows:
        base_scores = np.array(
            [calc_recency_score(item.get("published_at")) for item in ITEMS],
            dtype=np.float32,
        )
        if len(base_scores) == 0:
            return []

        pre = min(PRE_N, len(base_scores))
        if pre <= 0:
            return []

        cand_idx = np.argpartition(-base_scores, kth=pre - 1)[:pre]
        scores = base_scores[cand_idx]

        picked_idx = diversify_rerank(
            cand_idx=cand_idx,
            scores=scores,
            k=k,
            min_unique_cats=MIN_UNIQUE_CATS_IN_TOPK_DEFAULT,
        )

        out = []
        for rank, idx in enumerate(picked_idx):
            it = dict(ITEMS[idx])
            it["score"] = float(k - rank) / float(k)
            if not it.get("category"):
                it["category"] = "etc"
            out.append(it)
        return out

    seen_ids = []
    seen_idx = []
    pref_score_map = {}

    for row in pref_rows:
        aid = str(row.get("article_id", "")).strip()
        if not aid:
            continue
        seen_ids.append(aid)
        pref_score_map[aid] = float(row.get("pref_score") or 0.0)
        if aid in ID2IDX:
            seen_idx.append(ID2IDX[aid])

    if not seen_idx:
        return []

    weights = np.array(
        [max(pref_score_map.get(ITEMS[idx]["id"], 0.1), 0.1) for idx in seen_idx],
        dtype=np.float32,
    )
    weights = weights / (weights.sum() + 1e-12)

    user_vec = np.average(X_NORM[np.array(seen_idx, dtype=np.int32)], axis=0, weights=weights)
    user_vec = user_vec / (np.linalg.norm(user_vec) + 1e-12)

    scores_all = (X_NORM @ user_vec).astype(np.float32)

    for idx in seen_idx:
        scores_all[idx] = -1e9

    for i in range(n):
        scores_all[i] += calc_recency_score(ITEMS[i].get("published_at"))

    pre = min(PRE_N, n - len(seen_idx)) if n > len(seen_idx) else 0
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
    for rank, idx in enumerate(picked_idx):
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
    load_all()

@app.get("/health")
def health():
    return {"ok": True, "items": len(ITEMS), "cats": N_CATS}

@app.get("/reload")
def reload_items():
    load_all()
    return {"ok": True, "items": len(ITEMS), "cats": N_CATS}

@app.get("/reco")
def reco(
    userId: int = Query(..., ge=1),
    k: int = Query(K_DEFAULT, ge=1, le=50),
):
    items = recommend(user_id=userId, k=k)
    return {"items": items}