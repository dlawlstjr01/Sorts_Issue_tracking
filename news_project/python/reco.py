# python/app.py
import os, re, math, random
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

import numpy as np
import pandas as pd
import crawler
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import KMeans

# -----------------------------
# Settings (당신 코드에서 가져온 핵심만)
# -----------------------------
SEED = int(os.getenv("SEED", "42"))
random.seed(SEED)
np.random.seed(SEED)

ARTIFACT_DIR = os.getenv("ARTIFACT_DIR", "/app/reco_artifacts")
ITEMS_CSV = os.path.join(ARTIFACT_DIR, "items.csv")

K_DEFAULT = 20
SVD_DIM = 96
N_TOPICS_TARGET = 8

# diversity 목표: TopK에서 unique cat 최소치
MIN_UNIQUE_CATS_IN_TOPK_DEFAULT = 16
PRE_N = 260  # rerank pre 후보 크기

# -----------------------------
# FastAPI
# -----------------------------
app = FastAPI(title="Reco API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Helpers (당신 코드에서 clean/infer 핵심만)
# -----------------------------
def clean_text(s: str) -> str:
    s = str(s or "").lower()
    s = re.sub(r"http\S+", " ", s)
    s = re.sub(r"[^0-9a-zA-Z가-힣\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# -----------------------------
# Global State (서버 시작 시 로드)
# -----------------------------
DF: Optional[pd.DataFrame] = None
ITEMS: List[Dict[str, Any]] = []
ID2IDX: Dict[str, int] = {}

# vector space
VECT: Optional[TfidfVectorizer] = None
SVD: Optional[TruncatedSVD] = None
KM: Optional[KMeans] = None
X_NORM: Optional[np.ndarray] = None  # (N, D) normalized embedding

# category
ITEM_CAT: Optional[np.ndarray] = None
N_CATS: int = 0
CAT_LABELS: List[str] = []

def _require_columns(df: pd.DataFrame, cols: List[str]):
    miss = [c for c in cols if c not in df.columns]
    if miss:
        raise ValueError(f"items.csv에 필요한 컬럼이 없습니다: {miss} (현재: {list(df.columns)[:30]})")

def _build_category(df: pd.DataFrame, topic_id: np.ndarray) -> np.ndarray:
    # category_for_model = source/topic 형태로 구성 (당신 코드 구조)
    src = df["source"].astype(str).fillna("Other")
    cats = (src + "/T" + pd.Series(topic_id).astype(str)).tolist()
    uniq = sorted(list(set(cats)))
    cat2idx = {c: i for i, c in enumerate(uniq)}
    item_cat = np.array([cat2idx[c] for c in cats], dtype=np.int32)
    return item_cat, uniq

def _map_item(row: pd.Series, idx: int) -> Dict[str, Any]:
    # Node/React에서 쓰기 편한 형태로 반환
    _id = str(row.get("id", idx))
    return {
        "id": _id,
        "title": str(row.get("title", "") or "(제목 없음)"),
        "category": str(row.get("category", "") or ""),  # 서비스 카테고리가 있으면 사용 가능
        "category_for_model": str(row.get("category_for_model", "") or ""),
        "url": str(row.get("url", "") or ""),
        "thumbnail": str(row.get("thumbnail", "") or ""),
        "published_at": row.get("published_at", None),
        "press_name": str(row.get("press_name", "") or ""),
        "score": 0.0,
    }

def load_all():
    global DF, ITEMS, ID2IDX, VECT, SVD, KM, X_NORM, ITEM_CAT, N_CATS, CAT_LABELS

    if not os.path.exists(ITEMS_CSV):
        raise FileNotFoundError(f"{ITEMS_CSV} 가 없습니다. reco_artifacts/items.csv를 넣어주세요.")

    df = pd.read_csv(ITEMS_CSV)
    # 최소 title/content는 있어야 TFIDF 가능
    _require_columns(df, ["id", "title", "content"])

    # 결측 정리
    df = df.dropna(subset=["id", "title", "content"]).reset_index(drop=True)
    df["id"] = df["id"].astype(str)
    df["title"] = df["title"].astype(str)
    df["content"] = df["content"].astype(str)

    # source가 없으면 press_name로 대체, 없으면 Other
    if "source" not in df.columns:
        if "press_name" in df.columns:
            df["source"] = df["press_name"].fillna("Other").astype(str)
        else:
            df["source"] = "Other"

    # 텍스트 구성 (당신 코드: title + content 일부)
    texts = (df["title"].fillna("") + " " + df["content"].fillna("").str[:2200]).tolist()
    texts = [clean_text(t) for t in texts]

    # TFIDF -> SVD
    VECT = TfidfVectorizer(max_features=80000, ngram_range=(1, 2), min_df=2)
    X = VECT.fit_transform(texts)

    svd_dim = min(SVD_DIM, X.shape[1] - 1) if X.shape[1] > 2 else 2
    SVD = TruncatedSVD(n_components=svd_dim, random_state=SEED)
    Xr = SVD.fit_transform(X).astype(np.float32)

    # normalize
    X_NORM = Xr / (np.linalg.norm(Xr, axis=1, keepdims=True) + 1e-12)

    n_items = len(df)

    # -----------------------------
    # ✅ FIX: n_samples < n_clusters 방지 + 너무 적으면 KMeans 스킵
    # - sklearn KMeans는 n_clusters <= n_samples 여야 함
    # - n_items가 1이면 군집화 의미 없으니 topic_id 전부 0으로
    # -----------------------------
    if n_items < 2:
        topic_id = np.zeros(n_items, dtype=np.int32)
        KM = None
        n_topics = 1
    else:
        # 기존 로직 기반으로 "원하는 토픽 수"를 먼저 계산하되,
        # 최종적으로 n_items를 넘지 않게 clamp
        desired = min(N_TOPICS_TARGET, max(6, int(math.sqrt(n_items)) // 3))
        n_topics = max(2, min(desired, n_items))  # 최소 2, 최대 n_items

        KM = KMeans(n_clusters=n_topics, random_state=SEED, n_init=10)
        topic_id = KM.fit_predict(X_NORM).astype(np.int32)

    df["topic_id"] = topic_id

    # category_for_model 생성
    item_cat, uniq_cats = _build_category(df, topic_id)
    df["category_for_model"] = (df["source"].astype(str) + "/T" + df["topic_id"].astype(str))

    DF = df
    ITEM_CAT = item_cat
    CAT_LABELS = uniq_cats
    N_CATS = len(uniq_cats)

    # items mapping
    ITEMS = [_map_item(df.iloc[i], i) for i in range(n_items)]
    ID2IDX = {ITEMS[i]["id"]: i for i in range(n_items)}

    print(f"[RecoAPI] loaded items={len(ITEMS)} topics={n_topics} cats(source/topic)={N_CATS}")
    print(f"[RecoAPI] ARTIFACT_DIR={ARTIFACT_DIR}")

# 서버 시작 시 로드
load_all()

# -----------------------------
# Diversity Rerank (당신 코드의 핵심만 살림)
# - GT lock/hits lock 없음
# - category 다양성 우선으로 TopK 구성
# -----------------------------
def diversify_rerank(cand_idx: np.ndarray, scores: np.ndarray, k: int, min_unique_cats: int) -> List[int]:
    order = np.argsort(-scores)
    sorted_idx = cand_idx[order].tolist()

    target_unique = min(min_unique_cats, N_CATS, k)
    chosen: List[int] = []
    chosen_set = set()
    chosen_cats = set()

    # 1) 카테고리 다양성 먼저 채우기
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

    # 2) 나머지는 점수순으로 채우기
    if len(chosen) < k:
        for idx in sorted_idx:
            if len(chosen) >= k:
                break
            if idx in chosen_set:
                continue
            chosen.append(idx)
            chosen_set.add(idx)

    return chosen[:k]

def recommend(user_id: int, k: int, seen_ids: List[str]) -> List[Dict[str, Any]]:
    k = max(1, min(int(k), 50))

    # seen -> index 변환
    seen_idx = [ID2IDX[s] for s in seen_ids if s in ID2IDX]

    n = len(ITEMS)
    if n == 0:
        return []

    # 후보 집합: 전체에서 일부만 (속도)
    # - seen이 있으면 seen과 유사한 것 중심
    # - 없으면 최신/랜덤 섞어서
    rng = np.random.default_rng(SEED + int(user_id) * 99991)

    if seen_idx:
        # 유저 프로필: seen 벡터 평균
        uvec = X_NORM[np.array(seen_idx, dtype=np.int32)].mean(axis=0)
        uvec = uvec / (np.linalg.norm(uvec) + 1e-12)

        # 점수 = cosine (dot)
        scores_all = (X_NORM @ uvec).astype(np.float32)

        # seen 제외
        scores_all[np.array(seen_idx, dtype=np.int32)] = -1e9

        # pre 후보 추출
        pre = min(PRE_N, n)
        cand_idx = np.argpartition(-scores_all, kth=pre - 1)[:pre]
        scores = scores_all[cand_idx]

    else:
        # seen이 없으면 랜덤/최근 기반
        pre = min(PRE_N, n)
        cand_idx = rng.choice(np.arange(n, dtype=np.int32), size=pre, replace=False)
        # 점수는 랜덤 + 약간의 순위
        scores = rng.random(pre).astype(np.float32)

    # diversity rerank
    min_unique = MIN_UNIQUE_CATS_IN_TOPK_DEFAULT
    picked_idx = diversify_rerank(cand_idx=cand_idx, scores=scores, k=k, min_unique_cats=min_unique)

    # 결과 구성
    out = []
    for rank, idx in enumerate(picked_idx):
        it = dict(ITEMS[idx])
        it["score"] = float(k - rank) / float(k)
        # category가 비어있으면 category_for_model 기반으로라도 내려줌
        if not it.get("category"):
            it["category"] = "etc"
        out.append(it)

    return out

# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
def health():
    return {"ok": True, "items": len(ITEMS), "cats": N_CATS}

@app.get("/reco")
def reco(
    userId: int = Query(1, ge=1),
    k: int = Query(K_DEFAULT, ge=1, le=50),
    seen: str = Query("", description="comma-separated item ids (recently viewed)"),
):
    seen_ids = [s.strip() for s in (seen or "").split(",") if s.strip()]
    items = recommend(user_id=userId, k=k, seen_ids=seen_ids)
    return {"items": items}

