import gc
import glob
import math
import os
import re
import zipfile
from collections import Counter, defaultdict, OrderedDict
from typing import Any, Dict, List, Optional, Sequence, Tuple
from urllib.parse import urlsplit

import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.cluster import MiniBatchKMeans
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer

SEED = int(os.getenv("SEED", "42"))
np.random.seed(SEED)

ARTIFACT_DIR = os.getenv("ARTIFACT_DIR", "/app/reco_artifacts")
ITEM_PATH = os.getenv("COUNTER_ITEM_PATH", os.path.join(ARTIFACT_DIR, "items.csv"))
INTERACTION_PATH = os.getenv("COUNTER_INTERACTION_PATH", "")

K_DEFAULT = int(os.getenv("RECO_K_DEFAULT", "20"))
K_MAX = int(os.getenv("RECO_MAX_K", "50"))

POSITIVE_EVENTS = {"click", "view", "read", "open"}


def clean_text(s: Any) -> str:
    s = str(s or "").lower()
    s = re.sub(r"http\S+", " ", s)
    s = re.sub(r"[^0-9a-zA-Z가-힣\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def resolve_data_path(rel_or_abs: str) -> str:
    if os.path.isabs(rel_or_abs) and os.path.exists(rel_or_abs):
        return rel_or_abs
    cands = [
        rel_or_abs,
        os.path.join("/app", rel_or_abs),
        os.path.join(os.getcwd(), rel_or_abs),
        os.path.join(os.path.dirname(__file__), rel_or_abs),
    ]
    for p in cands:
        if os.path.exists(p):
            return p
    base = os.path.basename(rel_or_abs)
    for root in ["/app", os.path.dirname(__file__)]:
        hits = glob.glob(os.path.join(root, "**", base), recursive=True)
        if hits:
            return sorted(hits, key=len)[0]
    raise FileNotFoundError(f"Cannot resolve path: {rel_or_abs}")


def read_head_csv_or_zip(path: str, nrows: int = 5000) -> pd.DataFrame:
    if path.lower().endswith(".zip"):
        with zipfile.ZipFile(path) as zf:
            csvs = [f for f in zf.namelist() if f.lower().endswith(".csv")]
            if not csvs:
                raise ValueError(f"No CSV in zip: {path}")
            csv_name = max(csvs, key=lambda x: zf.getinfo(x).file_size)
            with zf.open(csv_name) as f:
                return pd.read_csv(f, nrows=nrows)
    return pd.read_csv(path, nrows=nrows)


def iter_csv_or_zip(path: str, usecols=None, chunksize: int = 100000):
    if path.lower().endswith(".zip"):
        with zipfile.ZipFile(path) as zf:
            csvs = [f for f in zf.namelist() if f.lower().endswith(".csv")]
            if not csvs:
                raise ValueError(f"No CSV in zip: {path}")
            csv_name = max(csvs, key=lambda x: zf.getinfo(x).file_size)
            with zf.open(csv_name) as f:
                for ch in pd.read_csv(f, usecols=usecols, chunksize=chunksize):
                    yield ch
    else:
        for ch in pd.read_csv(path, usecols=usecols, chunksize=chunksize):
            yield ch


def pick_column(df: pd.DataFrame, preferred: Optional[str], candidates: Sequence[str], required: bool, label: str) -> Optional[str]:
    if preferred and preferred in df.columns:
        return preferred
    for c in candidates:
        if c in df.columns:
            return c
    if required:
        raise ValueError(f"Cannot find {label}. candidates={list(candidates)}")
    return None


def parse_time_series(s: pd.Series) -> np.ndarray:
    num = pd.to_numeric(s, errors="coerce")
    if float(num.notna().mean()) >= 0.85:
        return num.fillna(-1).astype(np.int64).values
    dt = pd.to_datetime(s, errors="coerce", utc=True)
    vals = (dt.view("int64") // 10 ** 9).astype(np.int64)
    vals[dt.isna().values] = -1
    return vals


def topk_indices(scores: np.ndarray, k: int) -> np.ndarray:
    scores = np.asarray(scores, dtype=np.float32)
    if k <= 0:
        return np.array([], dtype=np.int32)
    if len(scores) <= k:
        return np.argsort(-scores).astype(np.int32)
    idx = np.argpartition(-scores, kth=k - 1)[:k]
    idx = idx[np.argsort(-scores[idx])]
    return idx.astype(np.int32)


def rank_norm(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float32)
    n = len(x)
    if n <= 1:
        return np.zeros(n, dtype=np.float32)
    order = np.argsort(x)
    out = np.empty(n, dtype=np.float32)
    out[order] = np.linspace(0.0, 1.0, n, dtype=np.float32)
    return out


def canon_full(x: str) -> str:
    x = str(x).strip()
    if not x or x.lower() == "nan":
        return ""
    try:
        x2 = x if "://" in x else "http://" + x
        sp = urlsplit(x2)
        netloc = sp.netloc.lower().replace("www.", "")
        path = sp.path.rstrip("/")
        q = sp.query.strip()
        return f"{netloc}{path}?{q}" if q else f"{netloc}{path}"
    except Exception:
        return x


def canon_noquery(x: str) -> str:
    x = str(x).strip()
    if not x or x.lower() == "nan":
        return ""
    try:
        x2 = x if "://" in x else "http://" + x
        sp = urlsplit(x2)
        netloc = sp.netloc.lower().replace("www.", "")
        path = sp.path.rstrip("/")
        return f"{netloc}{path}"
    except Exception:
        return x


def canon_pathonly(x: str) -> str:
    x = str(x).strip()
    if not x or x.lower() == "nan":
        return ""
    try:
        x2 = x if "://" in x else "http://" + x
        sp = urlsplit(x2)
        return sp.path.rstrip("/")
    except Exception:
        return x


CANON_FUNCS = {
    "full": canon_full,
    "noquery": canon_noquery,
    "pathonly": canon_pathonly,
}


def norm_series(s: pd.Series, mode: str) -> pd.Series:
    return s.astype(str).map(CANON_FUNCS[mode])


def build_alias_map(items_df: pd.DataFrame) -> Dict[str, int]:
    alias: Dict[str, int] = {}
    ambig = set()
    for r in items_df.itertuples(index=False):
        idx = int(r.item_idx)
        keys = [str(r.key)]
        u = str(r.url)
        if u and u.lower() != "nan":
            keys += [canon_full(u), canon_noquery(u), canon_pathonly(u)]
        rid = str(r.id)
        if rid and rid.lower() != "nan":
            keys.append(rid.strip())
        for k in keys:
            if not k or k in ambig:
                continue
            old = alias.get(k)
            if old is None:
                alias[k] = idx
            elif old != idx:
                ambig.add(k)
                alias.pop(k, None)
    return alias


def rerank_diverse(cand: np.ndarray, scores: np.ndarray, item_cat: np.ndarray, n_cats: int, k: int, min_unique: int, pre_n: int, mmr_lambda: float, repeat_penalty: float) -> List[int]:
    if len(cand) == 0:
        return []
    order = np.argsort(-scores)
    pre = order[: min(pre_n, len(order))]
    cand_pre = cand[pre]
    score_pre = scores[pre]

    by_cat: Dict[int, List[Tuple[int, float]]] = defaultdict(list)
    for it, sc in zip(cand_pre.tolist(), score_pre.tolist()):
        by_cat[int(item_cat[int(it)])].append((int(it), float(sc)))
    for c in list(by_cat.keys()):
        by_cat[c].sort(key=lambda x: -x[1])

    cats_sorted = sorted(by_cat.keys(), key=lambda c: -by_cat[c][0][1]) if by_cat else []
    chosen, chosen_set, chosen_cats = [], set(), Counter()
    target_unique = min(min_unique, n_cats, k)

    progressed = True
    while len(chosen) < k and len(chosen_cats) < target_unique and progressed:
        progressed = False
        for c in cats_sorted:
            if len(chosen) >= k or len(chosen_cats) >= target_unique:
                break
            if c in chosen_cats or not by_cat[c]:
                continue
            it, _ = by_cat[c].pop(0)
            if it in chosen_set:
                continue
            chosen.append(it)
            chosen_set.add(it)
            chosen_cats[c] += 1
            progressed = True

    remaining: List[Tuple[int, float]] = []
    for c in cats_sorted:
        remaining.extend(by_cat[c])
    remaining.sort(key=lambda x: -x[1])

    while len(chosen) < k and remaining:
        best_idx, best_val = None, None
        for idx, (it, sc) in enumerate(remaining):
            c = int(item_cat[it])
            val = mmr_lambda * sc - (1.0 - mmr_lambda) * (repeat_penalty * chosen_cats[c])
            if best_val is None or val > best_val:
                best_val = val
                best_idx = idx
        it, _ = remaining.pop(best_idx)
        if it in chosen_set:
            continue
        chosen.append(it)
        chosen_set.add(it)
        chosen_cats[int(item_cat[it])] += 1

    if len(chosen) < k:
        for it in cand[order].tolist():
            if len(chosen) >= k:
                break
            if int(it) in chosen_set:
                continue
            chosen.append(int(it))
            chosen_set.add(int(it))

    return chosen[:k]


class CounterRecoService:
    def __init__(self):
        self.item_source = os.getenv("COUNTER_ITEM_SOURCE", "db_then_csv").strip().lower()
        if self.item_source not in {"csv", "db", "db_then_csv"}:
            self.item_source = "db_then_csv"

        self.db_host = os.getenv("DB_HOST", "project-db-cgi.smhrd.com")
        self.db_port = int(os.getenv("DB_PORT", "3307"))
        self.db_user = os.getenv("DB_USER", "cgi_25K_DA1_p3_3")
        self.db_password = os.getenv("DB_PASSWORD", "smhrd3")
        self.db_name = os.getenv("DB_NAME", "cgi_25K_DA1_p3_3")

        self.max_items = int(os.getenv("COUNTER_MAX_ITEMS", "50000"))
        self.max_users = int(os.getenv("COUNTER_MAX_USERS", "200000"))
        self.max_seq_per_user = int(os.getenv("COUNTER_MAX_SEQ_PER_USER", "500"))
        self.chunk_items = int(os.getenv("COUNTER_CHUNKSIZE_ITEMS", "60000"))
        self.chunk_inter = int(os.getenv("COUNTER_CHUNKSIZE_INTER", "200000"))
        self.min_items_required = int(os.getenv("COUNTER_MIN_ITEMS", "3"))

        self.text_trunc = int(os.getenv("COUNTER_TEXT_TRUNC", "900"))
        self.tfidf_max_features = int(os.getenv("COUNTER_TFIDF_MAX_FEATURES", "32000"))
        self.svd_dim = int(os.getenv("COUNTER_SVD_DIM", "64"))
        self.n_topics_target = int(os.getenv("COUNTER_N_TOPICS_TARGET", "10"))

        self.cand_size = int(os.getenv("COUNTER_CAND_SIZE", "2400"))
        self.cand_prefilter = int(os.getenv("COUNTER_CAND_PREFILTER", "900"))
        self.pre_n = int(os.getenv("COUNTER_PRE_N", "320"))
        self.recent_seeds = int(os.getenv("COUNTER_RECENT_SEEDS", "12"))
        self.sim_per_seed = int(os.getenv("COUNTER_SIM_PER_SEED", "120"))
        self.sim_cache_topn = int(os.getenv("COUNTER_SIM_CACHE_TOPN", "600"))
        self.cand_pop = int(os.getenv("COUNTER_CAND_POP", "160"))
        self.cand_rand = int(os.getenv("COUNTER_CAND_RAND", "80"))
        self.user_top_topics = int(os.getenv("COUNTER_USER_TOP_TOPICS", "6"))
        self.topic_head_per_user = int(os.getenv("COUNTER_TOPIC_HEAD_PER_USER", "360"))
        self.topic_head_size = int(os.getenv("COUNTER_TOPIC_HEAD_SIZE", "3000"))
        self.profile_recall_topn = int(os.getenv("COUNTER_PROFILE_RECALL_TOPN", "900"))
        self.profile_hist_max = int(os.getenv("COUNTER_PROFILE_HIST_MAX", "120"))
        self.i2i_window = int(os.getenv("COUNTER_I2I_WINDOW", "6"))
        self.i2i_topn = int(os.getenv("COUNTER_I2I_TOPN", "140"))
        self.i2i_recent = int(os.getenv("COUNTER_I2I_RECENT", "20"))
        self.recent_sim_hist = int(os.getenv("COUNTER_RECENT_SIM_HIST", "24"))

        self.min_unique_cats = int(os.getenv("COUNTER_MIN_UNIQUE_CATS_TOPK", "8"))
        self.mmr_lambda = float(os.getenv("COUNTER_MMR_LAMBDA", "0.94"))
        self.cat_repeat_penalty = float(os.getenv("COUNTER_CAT_REPEAT_PENALTY", "0.08"))
        self.counter_ratio = float(os.getenv("COUNTER_RATIO", "0.20"))

        self.w_content = float(os.getenv("COUNTER_W_CONTENT", "0.37"))
        self.w_recent = float(os.getenv("COUNTER_W_RECENT", "0.33"))
        self.w_i2i = float(os.getenv("COUNTER_W_I2I", "0.22"))
        self.w_pop = float(os.getenv("COUNTER_W_POP", "0.06"))
        self.w_counter = float(os.getenv("COUNTER_W_COUNTER", "0.02"))

        self.sim_cache_max = int(os.getenv("COUNTER_SIM_CACHE_MAX", "2600"))

        self.item_path: Optional[str] = None
        if self.item_source in {"csv", "db_then_csv"}:
            try:
                self.item_path = resolve_data_path(ITEM_PATH)
            except Exception:
                self.item_path = None

        self.inter_path: Optional[str] = None
        if str(INTERACTION_PATH).strip():
            try:
                self.inter_path = resolve_data_path(INTERACTION_PATH)
            except Exception:
                self.inter_path = None

        self.items = pd.DataFrame()
        self.key_to_idx: Dict[str, int] = {}
        self.alias_to_idx: Dict[str, int] = {}

        self.item_content_vec = np.zeros((0, 1), dtype=np.float32)
        self.item_cat = np.array([], dtype=np.int32)
        self.topic_arr = np.array([], dtype=np.int32)

        self.user_train_seq: List[List[int]] = []
        self.user_pos_set: List[set] = []
        self.user_topic_counter: List[Counter] = []
        self.u_ext2int: Dict[str, int] = {}

        self.pop_counter = Counter()
        self.pop_items = np.array([], dtype=np.int32)
        self.pop_score_arr = np.array([], dtype=np.float32)
        self.topic_head: Dict[int, np.ndarray] = {}
        self.topic_frame_pop: List[List[np.ndarray]] = []
        self.i2i_neighbors: Dict[int, Tuple[np.ndarray, np.ndarray]] = {}

        self.sim_cache = OrderedDict()
        self.mapping_mode = "string"
        self.best_inter_mode = "noquery"
        self.inter_item_col = ""

        self.n_items = 0
        self.n_users = 0
        self.n_topics = 0
        self.n_cats = 0
        self.loaded_item_source = "unknown"

    def _lru_get(self, key: int):
        if key not in self.sim_cache:
            return None
        v = self.sim_cache.pop(key)
        self.sim_cache[key] = v
        return v

    def _lru_put(self, key: int, value: np.ndarray):
        if key in self.sim_cache:
            self.sim_cache.pop(key)
        self.sim_cache[key] = value
        while len(self.sim_cache) > self.sim_cache_max:
            self.sim_cache.popitem(last=False)

    def _resolve_item_idx(self, raw: str) -> Optional[int]:
        keys = [raw, canon_noquery(raw), canon_full(raw), canon_pathonly(raw)]
        for k in keys:
            if not k:
                continue
            if k in self.key_to_idx:
                return int(self.key_to_idx[k])
            alt = self.alias_to_idx.get(k)
            if alt is not None:
                return int(alt)
        return None

    def _split_event(self, seq: List[int], test_n: int, min_train: int):
        if len(seq) < test_n + min_train:
            return None
        return seq[:-test_n], set(seq[-test_n:])

    def _load_items_from_db(self) -> Optional[pd.DataFrame]:
        if self.item_source not in {"db", "db_then_csv"}:
            return None
        try:
            import pymysql
        except Exception as e:
            print(f"[CounterReco] DB loader unavailable: {e}")
            return None

        conn = None
        rows: List[Dict[str, Any]] = []
        sql = """
            SELECT
                a.id,
                a.title,
                a.content,
                a.url,
                a.category AS raw_category,
                a.thumbnail,
                a.published_at,
                a.press_name,
                a.press_name AS source_input
            FROM articles a
            WHERE a.title IS NOT NULL
              AND TRIM(a.title) <> ''
              AND a.content IS NOT NULL
              AND TRIM(a.content) <> ''
            ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.id DESC
            LIMIT %s
        """
        try:
            conn = pymysql.connect(
                host=self.db_host,
                port=self.db_port,
                user=self.db_user,
                password=self.db_password,
                database=self.db_name,
                charset="utf8mb4",
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=8,
                read_timeout=30,
                write_timeout=30,
                autocommit=True,
            )
            with conn.cursor() as cur:
                cur.execute(sql, (int(self.max_items),))
                rows = cur.fetchall()
        except Exception as e:
            print(f"[CounterReco] DB load failed: {e}")
            return None
        finally:
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass

        if not rows:
            print("[CounterReco] DB load returned 0 rows")
            return None

        items = pd.DataFrame(rows)
        for c in ["id", "title", "content", "url", "raw_category", "thumbnail", "published_at", "press_name", "source_input"]:
            if c not in items.columns:
                items[c] = ""
        for c in ["id", "title", "content", "url", "raw_category", "thumbnail", "published_at", "press_name", "source_input"]:
            items[c] = items[c].fillna("").astype(str)

        keys = []
        for i, r in items.iterrows():
            key = canon_noquery(str(r.get("url", "")))
            if not key:
                key = str(r.get("id", "")).strip()
            if not key:
                key = str(i)
            keys.append(key)
        items["key"] = keys
        items = items.drop_duplicates(subset=["key"], keep="first").reset_index(drop=True)
        return items[["key", "title", "content", "url", "id", "raw_category", "thumbnail", "published_at", "press_name", "source_input"]]

    def _load_items_only(self):
        source_used = "db"
        items = self._load_items_from_db()

        if items is None:
            source_used = "csv"
            if not self.item_path:
                raise FileNotFoundError(
                    f"counter items source unavailable. item_source={self.item_source}, "
                    f"db=failed, csv_path={ITEM_PATH}"
                )

            items_head = read_head_csv_or_zip(self.item_path, nrows=6000)

            title_col = pick_column(items_head, None, ["title", "headline", "news_title", "subject", "name"], True, "item title")
            content_col = pick_column(items_head, None, ["content", "body", "text", "article", "description", "summary"], True, "item content")
            url_col = pick_column(items_head, None, ["url", "link", "news_url", "article_url"], False, "item url")
            id_col = pick_column(items_head, None, ["item_id", "news_id", "article_id", "id", "post_id"], False, "item id")
            raw_cat_col = pick_column(items_head, None, ["category", "section", "topic", "label"], False, "item category")
            thumbnail_col = pick_column(items_head, None, ["thumbnail", "thumb", "image", "image_url"], False, "item thumbnail")
            published_col = pick_column(items_head, None, ["published_at", "created_at", "datetime", "time"], False, "item published")
            press_col = pick_column(items_head, None, ["press_name", "publisher", "media"], False, "item press")
            source_col = pick_column(items_head, None, ["source"], False, "item source")

            usecols_items = [title_col, content_col]
            for c in [url_col, id_col, raw_cat_col, thumbnail_col, published_col, press_col, source_col]:
                if c and c not in usecols_items:
                    usecols_items.append(c)

            rows = []
            row_base = 0
            for ch in iter_csv_or_zip(self.item_path, usecols=usecols_items, chunksize=self.chunk_items):
                n = len(ch)
                for i, (_, r) in enumerate(ch.iterrows()):
                    rid = row_base + i
                    key = ""
                    if url_col and url_col in ch.columns:
                        key = canon_noquery(str(r[url_col]))
                    if not key and id_col and id_col in ch.columns:
                        key = str(r[id_col]).strip()
                    if not key:
                        key = str(rid)

                    rows.append(
                        {
                            "key": key,
                            "title": str(r[title_col]),
                            "content": str(r[content_col]),
                            "url": str(r[url_col]) if url_col and url_col in ch.columns else "",
                            "id": str(r[id_col]) if id_col and id_col in ch.columns else "",
                            "raw_category": str(r[raw_cat_col]) if raw_cat_col and raw_cat_col in ch.columns else "",
                            "thumbnail": str(r[thumbnail_col]) if thumbnail_col and thumbnail_col in ch.columns else "",
                            "published_at": str(r[published_col]) if published_col and published_col in ch.columns else "",
                            "press_name": str(r[press_col]) if press_col and press_col in ch.columns else "",
                            "source_input": str(r[source_col]) if source_col and source_col in ch.columns else "",
                        }
                    )
                    if len(rows) >= self.max_items:
                        break
                row_base += n
                if len(rows) >= self.max_items:
                    break

            items = pd.DataFrame(rows).dropna(subset=["title", "content"]).reset_index(drop=True)

        if len(items) < max(1, self.min_items_required):
            raise ValueError(f"Too few items in {source_used}: {len(items)}")

        items["item_idx"] = np.arange(len(items), dtype=np.int32)
        self.n_items = len(items)
        self.loaded_item_source = source_used
        self.mapping_mode = "items_only"
        self.best_inter_mode = "items_only"
        self.inter_item_col = "id"

        self.key_to_idx = dict(zip(items["key"].astype(str).tolist(), items["item_idx"].astype(int).tolist()))
        self.alias_to_idx = build_alias_map(items[["item_idx", "key", "url", "id"]].copy())

        texts = (items["title"].fillna("") + " " + items["content"].fillna("").str[: self.text_trunc]).astype(str).map(clean_text)
        min_df = max(2, int(round(self.n_items * 0.002)))
        min_df = min(min_df, max(2, self.n_items // 10))
        vect = TfidfVectorizer(
            max_features=min(self.tfidf_max_features, 5000 + self.n_items * 15),
            ngram_range=(1, 1),
            min_df=min_df,
            dtype=np.float32,
        )
        X = vect.fit_transform(texts.values)
        if X.shape[1] <= 1:
            Xr = X.toarray().astype(np.float32)
        else:
            svd_dim = max(1, min(self.svd_dim, X.shape[1] - 1))
            svd = TruncatedSVD(n_components=svd_dim, random_state=SEED)
            Xr = svd.fit_transform(X).astype(np.float32)
        Xr = Xr / (np.linalg.norm(Xr, axis=1, keepdims=True) + 1e-12)

        self.n_topics = max(2, min(self.n_topics_target, max(2, int(math.sqrt(self.n_items)) // 2)))
        self.n_topics = min(self.n_topics, max(2, self.n_items))
        km = MiniBatchKMeans(n_clusters=self.n_topics, random_state=SEED, batch_size=4096, n_init=3)
        topic_id = km.fit_predict(Xr).astype(np.int32)

        items["topic_id"] = topic_id
        src_in = items["source_input"].fillna("").astype(str).str.strip()
        domain_src = items["url"].map(lambda u: urlsplit(str(u)).netloc.lower().replace("www.", "") or "other")
        items["source"] = np.where(src_in != "", src_in, domain_src)
        items["category_for_model"] = items["source"].astype(str) + "/T" + items["topic_id"].astype(str)

        uniq = sorted(items["category_for_model"].unique().tolist())
        cat2idx = {c: i for i, c in enumerate(uniq)}
        self.item_cat = np.array([cat2idx[c] for c in items["category_for_model"].tolist()], dtype=np.int32)
        self.n_cats = len(uniq)
        self.topic_arr = items["topic_id"].astype(np.int32).values

        frame_score, frame_label = self._build_frame(Xr, topic_id)
        items["frame_score"] = frame_score
        items["frame_label"] = frame_label
        self.item_content_vec = Xr.astype(np.float32)

        # items.csv only mode: no interaction sequence available
        self.user_train_seq = []
        self.user_pos_set = []
        self.u_ext2int = {}
        self.n_users = 0

        # Build a stable popularity prior from recency if available.
        self.pop_counter = Counter()
        if "published_at" in items.columns:
            ts = pd.to_datetime(items["published_at"], errors="coerce", utc=True)
            ord_idx = np.argsort(-np.where(ts.notna(), ts.view("int64"), -1))
            base = len(ord_idx)
            for r, idx in enumerate(ord_idx.tolist()):
                self.pop_counter[int(idx)] = max(1, base - r)
        if len(self.pop_counter) == 0:
            for i in range(self.n_items):
                self.pop_counter[int(i)] = 1

        self.items = items
        self._build_candidate_materials()

        print(
            "[CounterReco] loaded(items-only)",
            {
                "item_source": self.loaded_item_source,
                "item_path": self.item_path,
                "n_items": self.n_items,
                "n_users": self.n_users,
                "n_topics": self.n_topics,
                "n_cats": self.n_cats,
            },
        )

    def load(self):
        if self.item_source in {"db", "db_then_csv"}:
            self._load_items_only()
            return
        if not self.item_path:
            raise FileNotFoundError(f"Cannot resolve item path: {ITEM_PATH}")
        if not self.inter_path:
            self._load_items_only()
            return

        items_head = read_head_csv_or_zip(self.item_path, nrows=6000)
        try:
            inter_head = read_head_csv_or_zip(self.inter_path, nrows=6000)
        except Exception:
            self.inter_path = None
            self._load_items_only()
            return

        title_col = pick_column(items_head, None, ["title", "headline", "news_title", "subject", "name"], True, "item title")
        content_col = pick_column(items_head, None, ["content", "body", "text", "article", "description", "summary"], True, "item content")
        url_col = pick_column(items_head, None, ["url", "link", "news_url", "article_url"], False, "item url")
        id_col = pick_column(items_head, None, ["item_id", "news_id", "article_id", "id", "post_id"], False, "item id")
        raw_cat_col = pick_column(items_head, None, ["category", "section", "topic", "label"], False, "item category")

        user_col = pick_column(inter_head, None, ["user_id", "user", "uid", "member_id", "account_id"], True, "interaction user")
        inter_item_col = pick_column(inter_head, None, ["item_id", "news_id", "article_id", "id", "post_id", "url", "link", "news_url", "item_idx", "idx"], True, "interaction item")
        time_col = pick_column(inter_head, None, ["timestamp", "event_time", "clicked_at", "created_at", "ts", "time", "datetime"], False, "interaction time")
        event_col = pick_column(inter_head, None, ["event", "event_type", "action", "type", "behavior"], False, "interaction event")
        self.inter_item_col = inter_item_col

        num_ratio = float(pd.to_numeric(inter_head[inter_item_col], errors="coerce").notna().mean())
        self.mapping_mode = "numeric" if num_ratio >= 0.80 else "string"

        del items_head, inter_head
        gc.collect()

        # pass1: interaction key scan
        usecols_inter_scan = [user_col, inter_item_col]
        if event_col:
            usecols_inter_scan.append(event_col)

        if self.mapping_mode == "numeric":
            key_counter = Counter()
            zeros, ones, vmin = 0, 0, None
            for ch in iter_csv_or_zip(self.inter_path, usecols=usecols_inter_scan, chunksize=self.chunk_inter):
                if event_col and event_col in ch.columns:
                    ev = ch[event_col].astype(str).str.lower().str.strip()
                    m = ev.isin(POSITIVE_EVENTS)
                    if m.sum() > 0:
                        ch = ch[m]
                nums = pd.to_numeric(ch[inter_item_col], errors="coerce").dropna().astype(np.int64)
                if len(nums) == 0:
                    continue
                zeros += int((nums == 0).sum())
                ones += int((nums == 1).sum())
                mn = int(nums.min())
                vmin = mn if vmin is None else min(vmin, mn)
                key_counter.update(nums.tolist())
                if len(key_counter) > 250000:
                    key_counter = Counter(dict(key_counter.most_common(250000)))

            row_index_base = 1 if (zeros == 0 and ones > 0 and vmin is not None and vmin >= 1) else 0
            top_keys_set = set([int(k) for k, _ in key_counter.most_common(min(len(key_counter), self.max_items))])
            top_keys_arr = np.array(list(top_keys_set), dtype=np.int64)
        else:
            mode_counters = {m: Counter() for m in ("noquery", "full", "pathonly")}
            for ch in iter_csv_or_zip(self.inter_path, usecols=usecols_inter_scan, chunksize=self.chunk_inter):
                if event_col and event_col in ch.columns:
                    ev = ch[event_col].astype(str).str.lower().str.strip()
                    m = ev.isin(POSITIVE_EVENTS)
                    if m.sum() > 0:
                        ch = ch[m]
                vals_raw = ch[inter_item_col].astype(str)
                for m in ("noquery", "full", "pathonly"):
                    kk = norm_series(vals_raw, m).values
                    mode_counters[m].update(kk.tolist())
                    if len(mode_counters[m]) > 250000:
                        mode_counters[m] = Counter(dict(mode_counters[m].most_common(250000)))

            top_keys_by_mode: Dict[str, set] = {}
            for m in ("noquery", "full", "pathonly"):
                top = [k for k, _ in mode_counters[m].most_common(min(len(mode_counters[m]), self.max_items))]
                top_keys_by_mode[m] = set([k for k in top if k])
            top_keys_arr_by_mode = {m: np.array(list(top_keys_by_mode[m]), dtype=object) for m in ("noquery", "full", "pathonly")}

        # pass2: items subset
        usecols_items = [title_col, content_col]
        if url_col:
            usecols_items.append(url_col)
        if id_col:
            usecols_items.append(id_col)
        if raw_cat_col:
            usecols_items.append(raw_cat_col)

        item_key_cols = []
        for c in [url_col, id_col, "url", "link", "news_url", "article_url", "item_id", "news_id", "article_id", "id", "post_id"]:
            if c and c in usecols_items and c not in item_key_cols:
                item_key_cols.append(c)

        picked_rows, picked_keys = [], set()
        self.best_inter_mode = "noquery"

        if self.mapping_mode == "numeric":
            row_base = 0
            for ch in iter_csv_or_zip(self.item_path, usecols=usecols_items, chunksize=self.chunk_items):
                n = len(ch)
                rows = np.arange(row_base, row_base + n, dtype=np.int64)
                row_base += n
                rows_key = rows + 1 if row_index_base == 1 else rows
                m = np.isin(rows_key, top_keys_arr)
                if m.sum() == 0:
                    continue
                sub = ch.loc[m].copy()
                sub_rows = rows_key[m]
                for kk, (_, r) in zip(sub_rows.tolist(), sub.iterrows()):
                    key = str(int(kk))
                    if key in picked_keys:
                        continue
                    picked_keys.add(key)
                    picked_rows.append({
                        "key": key,
                        "title": str(r[title_col]),
                        "content": str(r[content_col]),
                        "url": str(r[url_col]) if url_col and url_col in sub.columns else "",
                        "id": str(r[id_col]) if id_col and id_col in sub.columns else "",
                        "raw_category": str(r[raw_cat_col]) if raw_cat_col and raw_cat_col in sub.columns else "",
                    })
                    if len(picked_rows) >= self.max_items:
                        break
                if len(picked_rows) >= min(self.max_items, len(top_keys_set)):
                    break
        else:
            if not item_key_cols:
                raise ValueError("No item key candidate columns found")

            match_counts: Dict[Tuple[str, str], int] = {(c, m): 0 for c in item_key_cols for m in ("noquery", "full", "pathonly")}
            for ch in iter_csv_or_zip(self.item_path, usecols=usecols_items, chunksize=self.chunk_items):
                for c in item_key_cols:
                    if c not in ch.columns:
                        continue
                    v = ch[c].astype(str)
                    for m in ("noquery", "full", "pathonly"):
                        inter_arr = top_keys_arr_by_mode[m]
                        if inter_arr.size == 0:
                            continue
                        cnt = int(np.isin(norm_series(v, m).values, inter_arr).sum())
                        match_counts[(c, m)] += cnt

            (best_col, best_mode), _ = max(match_counts.items(), key=lambda kv: kv[1])
            self.best_inter_mode = best_mode
            top_keys_local = set(top_keys_by_mode[best_mode])

            for ch in iter_csv_or_zip(self.item_path, usecols=usecols_items, chunksize=self.chunk_items):
                if best_col not in ch.columns:
                    continue
                keys = norm_series(ch[best_col], best_mode)
                m = keys.isin(top_keys_local)
                if m.sum() == 0:
                    continue
                sub = ch.loc[m].copy()
                sub_keys = keys.loc[m].astype(str).tolist()
                for kk, (_, r) in zip(sub_keys, sub.iterrows()):
                    key = str(kk)
                    if not key or key in picked_keys:
                        continue
                    picked_keys.add(key)
                    picked_rows.append({
                        "key": key,
                        "title": str(r[title_col]),
                        "content": str(r[content_col]),
                        "url": str(r[url_col]) if url_col and url_col in sub.columns else "",
                        "id": str(r[id_col]) if id_col and id_col in sub.columns else "",
                        "raw_category": str(r[raw_cat_col]) if raw_cat_col and raw_cat_col in sub.columns else "",
                    })
                    if len(picked_rows) >= self.max_items:
                        break
                if len(picked_rows) >= min(self.max_items, len(top_keys_local)):
                    break

        items = pd.DataFrame(picked_rows).dropna(subset=["title", "content"]).reset_index(drop=True)
        if len(items) < self.min_items_required:
            raise ValueError(f"Too few mapped items: {len(items)}")

        items["item_idx"] = np.arange(len(items), dtype=np.int32)
        self.n_items = len(items)

        self.key_to_idx = dict(zip(items["key"].astype(str).tolist(), items["item_idx"].astype(int).tolist()))
        self.alias_to_idx = build_alias_map(items[["item_idx", "key", "url", "id"]].copy())

        texts = (items["title"].fillna("") + " " + items["content"].fillna("").str[: self.text_trunc]).astype(str).map(clean_text)
        min_df = max(2, int(round(self.n_items * 0.002)))
        min_df = min(min_df, max(2, self.n_items // 10))
        vect = TfidfVectorizer(max_features=min(self.tfidf_max_features, 5000 + self.n_items * 15), ngram_range=(1, 1), min_df=min_df, dtype=np.float32)
        X = vect.fit_transform(texts.values)

        if X.shape[1] <= 1:
            Xr = X.toarray().astype(np.float32)
        else:
            svd_dim = max(1, min(self.svd_dim, X.shape[1] - 1))
            svd = TruncatedSVD(n_components=svd_dim, random_state=SEED)
            Xr = svd.fit_transform(X).astype(np.float32)
        Xr = Xr / (np.linalg.norm(Xr, axis=1, keepdims=True) + 1e-12)

        self.n_topics = max(2, min(self.n_topics_target, int(math.sqrt(self.n_items)) // 2))
        km = MiniBatchKMeans(n_clusters=self.n_topics, random_state=SEED, batch_size=4096, n_init=3)
        topic_id = km.fit_predict(Xr).astype(np.int32)

        items["topic_id"] = topic_id
        items["source"] = items["url"].map(lambda u: urlsplit(str(u)).netloc.lower().replace("www.", "") or "other")
        items["category_for_model"] = items["source"].astype(str) + "/T" + items["topic_id"].astype(str)

        uniq = sorted(items["category_for_model"].unique().tolist())
        cat2idx = {c: i for i, c in enumerate(uniq)}
        self.item_cat = np.array([cat2idx[c] for c in items["category_for_model"].tolist()], dtype=np.int32)
        self.n_cats = len(uniq)
        self.topic_arr = items["topic_id"].astype(np.int32).values

        frame_score, frame_label = self._build_frame(Xr, topic_id)
        items["frame_score"] = frame_score
        items["frame_label"] = frame_label

        self.item_content_vec = Xr.astype(np.float32)

        # pass3: user sequence build
        usecols_inter = [user_col, inter_item_col]
        if event_col:
            usecols_inter.append(event_col)
        if time_col:
            usecols_inter.append(time_col)

        u_ext2int_all, u_int2ext_all, user_events = {}, {}, []
        has_time = time_col is not None

        for ch in iter_csv_or_zip(self.inter_path, usecols=usecols_inter, chunksize=self.chunk_inter):
            if event_col and event_col in ch.columns:
                ev = ch[event_col].astype(str).str.lower().str.strip()
                m = ev.isin(POSITIVE_EVENTS)
                if m.sum() > 0:
                    ch = ch[m]
            if len(ch) == 0:
                continue

            users = ch[user_col].astype(str).str.strip().values
            if self.mapping_mode == "numeric":
                raw_nums = pd.to_numeric(ch[inter_item_col], errors="coerce").fillna(-1).astype(np.int64).astype(str).values
                keys_best = keys_noq = keys_full = keys_path = raw_nums
            else:
                rawv = ch[inter_item_col].astype(str)
                keys_best = norm_series(rawv, self.best_inter_mode).astype(str).values
                keys_noq = norm_series(rawv, "noquery").astype(str).values
                keys_full = norm_series(rawv, "full").astype(str).values
                keys_path = norm_series(rawv, "pathonly").astype(str).values

            ts_vals = parse_time_series(ch[time_col]) if has_time else np.full(len(ch), -1, dtype=np.int64)

            for i in range(len(ch)):
                u_raw = users[i]
                if not u_raw:
                    continue
                key_try = [keys_best[i], keys_noq[i], keys_full[i], keys_path[i], str(ch[inter_item_col].iloc[i])]
                it = None
                for kk in key_try:
                    it = self._resolve_item_idx(str(kk))
                    if it is not None:
                        break
                if it is None:
                    continue

                if u_raw not in u_ext2int_all:
                    if len(u_ext2int_all) >= self.max_users:
                        continue
                    u_int = len(u_ext2int_all)
                    u_ext2int_all[u_raw] = u_int
                    u_int2ext_all[u_int] = u_raw
                    user_events.append([])

                u_int = u_ext2int_all[u_raw]
                if has_time:
                    user_events[u_int].append((int(ts_vals[i]), int(it)))
                else:
                    user_events[u_int].append(int(it))
                self.pop_counter[int(it)] += 1

        user_seq_all = []
        for evs in user_events:
            if has_time:
                evs = sorted(evs, key=lambda x: x[0])
                seq = [it for _, it in evs]
            else:
                seq = [int(x) for x in evs]
            if len(seq) > self.max_seq_per_user:
                seq = seq[-self.max_seq_per_user :]
            user_seq_all.append(seq)

        # event split with fallback thresholds
        tries = [(10, 20), (8, 16), (6, 12), (5, 10), (3, 6)]
        chosen = None
        for tn, mt in tries:
            ok = sum(1 for s in user_seq_all if self._split_event(s, tn, mt) is not None)
            if ok >= 30:
                chosen = (tn, mt)
                break
        if chosen is None:
            for tn, mt in tries:
                ok = sum(1 for s in user_seq_all if self._split_event(s, tn, mt) is not None)
                if ok > 0:
                    chosen = (tn, mt)
                    break
        if chosen is None:
            raise ValueError("No eligible users after split")

        test_n, min_train = chosen

        self.user_train_seq, self.user_pos_set, self.u_ext2int = [], [], {}
        for all_u, seq in enumerate(user_seq_all):
            r = self._split_event(seq, test_n, min_train)
            if r is None:
                continue
            tr, _ = r
            new_u = len(self.user_train_seq)
            u_ext = u_int2ext_all[all_u]
            self.u_ext2int[u_ext] = new_u
            self.user_train_seq.append(tr)
            self.user_pos_set.append(set(tr))

        self.n_users = len(self.user_train_seq)

        self.items = items
        self._build_candidate_materials()

        print("[CounterReco] loaded", {
            "item_source": self.loaded_item_source,
            "item_path": self.item_path,
            "inter_path": self.inter_path,
            "n_items": self.n_items,
            "n_users": self.n_users,
            "n_topics": self.n_topics,
            "n_cats": self.n_cats,
            "mapping_mode": self.mapping_mode,
            "best_inter_mode": self.best_inter_mode,
        })
    def _build_frame(self, Xr: np.ndarray, topic_id: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        D = Xr.shape[1]
        frame_axis = np.zeros((self.n_topics, D), dtype=np.float32)
        frame_center = np.zeros((self.n_topics, D), dtype=np.float32)

        g = Xr.mean(axis=0).astype(np.float32)
        Xc = (Xr - g[None, :]).astype(np.float32)
        try:
            _, _, vt = np.linalg.svd(Xc, full_matrices=False)
            gaxis = vt[0].astype(np.float32)
            gaxis = gaxis / (np.linalg.norm(gaxis) + 1e-12)
        except Exception:
            rng = np.random.default_rng(SEED)
            gaxis = rng.normal(0, 1, size=(D,)).astype(np.float32)
            gaxis = gaxis / (np.linalg.norm(gaxis) + 1e-12)

        for t in range(self.n_topics):
            idx = np.where(topic_id == t)[0]
            if len(idx) < 16:
                frame_center[t] = g
                frame_axis[t] = gaxis
                continue
            Xt = Xr[idx].astype(np.float32)
            ct = Xt.mean(axis=0).astype(np.float32)
            Xct = Xt - ct[None, :]
            try:
                _, _, vt = np.linalg.svd(Xct, full_matrices=False)
                ax = vt[0].astype(np.float32)
                ax = ax / (np.linalg.norm(ax) + 1e-12)
            except Exception:
                ax = gaxis
            frame_center[t] = ct
            frame_axis[t] = ax

        fs = np.zeros(self.n_items, dtype=np.float32)
        fl = np.zeros(self.n_items, dtype=np.int32)
        for i in range(self.n_items):
            t = int(topic_id[i])
            s = float(np.dot(Xr[i] - frame_center[t], frame_axis[t]))
            fs[i] = s
            fl[i] = 1 if s >= 0 else 0
        return fs, fl

    def _build_i2i_neighbors(self, seqs: List[List[int]], n_items: int, window: int, topn: int):
        pair = defaultdict(Counter)
        for seq in seqs:
            if len(seq) < 2:
                continue
            s = seq[-320:]
            L = len(s)
            for i in range(L):
                a = int(s[i])
                hi = min(L, i + window + 1)
                for j in range(i + 1, hi):
                    b = int(s[j])
                    if a == b:
                        continue
                    w = 1.0 / float(j - i)
                    pair[a][b] += w
                    pair[b][a] += 0.6 * w

        out = {}
        for i in range(n_items):
            cc = pair.get(i)
            if not cc:
                out[i] = (np.array([], dtype=np.int32), np.array([], dtype=np.float32))
                continue
            top = cc.most_common(topn)
            idx = np.array([int(x[0]) for x in top], dtype=np.int32)
            val = np.array([float(x[1]) for x in top], dtype=np.float32)
            val = val / (val.max() + 1e-12)
            out[i] = (idx, val)
        return out

    def _build_candidate_materials(self):
        self.pop_items = np.array(sorted(range(self.n_items), key=lambda x: -self.pop_counter.get(int(x), 0)), dtype=np.int32)
        if len(self.pop_items) == 0:
            self.pop_items = np.arange(self.n_items, dtype=np.int32)

        topic_items = defaultdict(list)
        for i in range(self.n_items):
            topic_items[int(self.topic_arr[i])].append(i)

        self.topic_head = {}
        for t in range(self.n_topics):
            arr = np.array(topic_items.get(t, []), dtype=np.int32)
            if len(arr) == 0:
                self.topic_head[t] = np.array([], dtype=np.int32)
                continue
            arr_sorted = sorted(arr.tolist(), key=lambda x: -self.pop_counter.get(int(x), 0))
            self.topic_head[t] = np.array(arr_sorted[: min(self.topic_head_size, len(arr_sorted))], dtype=np.int32)

        self.topic_frame_pop = [[np.array([], dtype=np.int32), np.array([], dtype=np.int32)] for _ in range(self.n_topics)]
        for t in range(self.n_topics):
            arr = self.topic_head[t]
            if len(arr) == 0:
                continue
            fl = self.items["frame_label"].iloc[arr].values
            self.topic_frame_pop[t][0] = arr[fl == 0][:500]
            self.topic_frame_pop[t][1] = arr[fl == 1][:500]

        self.user_topic_counter = []
        for u in range(len(self.user_train_seq)):
            cc = Counter(self.topic_arr[np.array(self.user_train_seq[u], dtype=np.int32)].tolist())
            self.user_topic_counter.append(cc)

        pop_max = max(self.pop_counter.values()) if len(self.pop_counter) else 1
        self.pop_score_arr = np.array([self.pop_counter.get(int(i), 0) / pop_max for i in range(self.n_items)], dtype=np.float32)

        self.i2i_neighbors = self._build_i2i_neighbors(self.user_train_seq, self.n_items, self.i2i_window, self.i2i_topn)

    def _get_similar_items(self, seed_item: int, topn: int) -> np.ndarray:
        seed_item = int(seed_item)
        req = int(min(max(1, topn), self.sim_cache_topn))
        cached = self._lru_get(seed_item)
        if cached is not None:
            return cached[:req]
        v = self.item_content_vec[seed_item]
        scores = self.item_content_vec @ v
        scores[seed_item] = -1e9
        idx = topk_indices(scores, min(self.sim_cache_topn, len(scores) - 1)).astype(np.int32)
        self._lru_put(seed_item, idx)
        return idx[:req]

    def _profile_recall(self, hist: List[int], topn: int) -> np.ndarray:
        if len(hist) == 0:
            return np.array([], dtype=np.int32)
        h = np.array(hist[-min(self.profile_hist_max, len(hist)):], dtype=np.int32)
        prof = self.item_content_vec[h].mean(axis=0)
        prof = prof / (np.linalg.norm(prof) + 1e-12)
        scores = (self.item_content_vec @ prof).astype(np.float32)
        scores[h] = -1e9
        return topk_indices(scores, min(topn, len(scores) - 1)).astype(np.int32)

    def _score_content(self, hist: List[int], cand: np.ndarray) -> np.ndarray:
        if len(hist) == 0:
            return np.zeros(len(cand), dtype=np.float32)
        h = np.array(hist[-min(80, len(hist)):], dtype=np.int32)
        prof = self.item_content_vec[h].mean(axis=0)
        prof = prof / (np.linalg.norm(prof) + 1e-12)
        return (self.item_content_vec[cand] @ prof).astype(np.float32)

    def _score_recent(self, hist: List[int], cand: np.ndarray) -> np.ndarray:
        if len(hist) == 0:
            return np.zeros(len(cand), dtype=np.float32)
        h = np.array(hist[-min(self.recent_sim_hist, len(hist)):], dtype=np.int32)
        hvec = self.item_content_vec[h]
        cvec = self.item_content_vec[cand]
        sim = cvec @ hvec.T
        w = np.linspace(0.55, 1.0, num=len(h), dtype=np.float32)
        return (sim * w[None, :]).max(axis=1).astype(np.float32)

    def _score_i2i(self, hist: List[int], cand: np.ndarray) -> np.ndarray:
        if len(hist) == 0:
            return np.zeros(len(cand), dtype=np.float32)
        rec = hist[-min(self.i2i_recent, len(hist)):]
        pos = {int(it): idx for idx, it in enumerate(cand.tolist())}
        out = np.zeros(len(cand), dtype=np.float32)
        nrec = len(rec)
        for j, h in enumerate(reversed(rec)):
            it = int(h)
            nei_idx, nei_w = self.i2i_neighbors.get(it, (None, None))
            if nei_idx is None or len(nei_idx) == 0:
                continue
            rw = 1.0 - 0.75 * (j / max(1, nrec - 1))
            for n, w in zip(nei_idx.tolist(), nei_w.tolist()):
                p = pos.get(int(n))
                if p is not None:
                    out[p] += rw * float(w)
        return out.astype(np.float32)

    def _build_candidate_pool(self, hist: List[int], seen_set: set, user_idx: Optional[int], seed: int) -> np.ndarray:
        rng = np.random.default_rng(seed)
        seen = set(map(int, seen_set)) if seen_set else set()
        cand_score: Dict[int, float] = defaultdict(float)

        def add_items(arr: Sequence[int], base_w: float, cap: Optional[int] = None):
            vals = list(arr)
            if cap is not None:
                vals = vals[:cap]
            for r, it in enumerate(vals):
                ii = int(it)
                if ii in seen:
                    continue
                cand_score[ii] += float(base_w) / (1.0 + 0.015 * r)

        recents = hist[-self.recent_seeds:]
        n_recent = max(1, len(recents))
        for pos_recent, seed_it in enumerate(reversed(recents)):
            seed_it = int(seed_it)
            rec_w = 1.0 - 0.55 * (pos_recent / max(1, n_recent - 1))
            seed_lab = int(self.items["frame_label"].iloc[seed_it])
            opp_lab = 1 - seed_lab

            sim = self._get_similar_items(seed_it, topn=self.sim_cache_topn)[: self.sim_per_seed]
            if len(sim):
                fl = self.items["frame_label"].iloc[sim].values
                add_items(sim[fl == opp_lab].tolist(), base_w=1.10 * rec_w)
                add_items(sim[fl == seed_lab].tolist(), base_w=0.88 * rec_w)

            nei_idx, nei_w = self.i2i_neighbors.get(seed_it, (np.array([], dtype=np.int32), np.array([], dtype=np.float32)))
            if len(nei_idx):
                for r, (n, wv) in enumerate(zip(nei_idx[:120].tolist(), nei_w[:120].tolist())):
                    ii = int(n)
                    if ii in seen:
                        continue
                    cand_score[ii] += rec_w * (0.90 * float(wv) + 0.06) / (1.0 + 0.02 * r)

            t = int(self.topic_arr[seed_it])
            head_opp = self.topic_frame_pop[t][opp_lab]
            if len(head_opp):
                add_items(head_opp.tolist(), base_w=0.55 * rec_w, cap=120)

        prof = self._profile_recall(hist, topn=self.profile_recall_topn)
        if len(prof):
            add_items(prof.tolist(), base_w=0.58, cap=self.profile_recall_topn)

        if user_idx is not None and 0 <= user_idx < len(self.user_topic_counter):
            top_topics = [t for t, _ in self.user_topic_counter[user_idx].most_common(self.user_top_topics)]
        else:
            cc = Counter(self.topic_arr[np.array(hist, dtype=np.int32)].tolist()) if len(hist) else Counter()
            top_topics = [t for t, _ in cc.most_common(self.user_top_topics)]

        for trank, t in enumerate(top_topics):
            head = self.topic_head.get(int(t), np.array([], dtype=np.int32))
            if len(head):
                tw = 0.35 - 0.04 * trank
                add_items(head.tolist(), base_w=max(0.15, tw), cap=self.topic_head_per_user)

        add_items(self.pop_items[: min(self.cand_pop, len(self.pop_items))].tolist(), base_w=0.18)
        add_items(rng.integers(0, self.n_items, size=self.cand_rand).tolist(), base_w=0.05)

        if len(cand_score) == 0:
            cand = []
        else:
            cand = [int(it) for it, _ in sorted(cand_score.items(), key=lambda kv: (-kv[1], -self.pop_counter.get(int(kv[0]), 0)))]

        if len(cand) < K_DEFAULT:
            for it in self.pop_items.tolist():
                if it in seen:
                    continue
                cand.append(int(it))
                if len(cand) >= K_DEFAULT * 5:
                    break

        return np.array(cand[: self.cand_size], dtype=np.int32)

    def _prefilter(self, hist: List[int], cand: np.ndarray) -> np.ndarray:
        if len(cand) <= self.cand_prefilter:
            return cand
        ct = rank_norm(self._score_content(hist, cand))
        sr = rank_norm(self._score_recent(hist, cand))
        si = rank_norm(self._score_i2i(hist, cand))
        pp = rank_norm(self.pop_score_arr[cand])
        s = (0.34 * ct + 0.36 * sr + 0.25 * si + 0.05 * pp).astype(np.float32)
        idx = topk_indices(s, self.cand_prefilter)
        return cand[idx]

    def _blend_scores(self, hist: List[int], cand: np.ndarray) -> np.ndarray:
        ct = rank_norm(self._score_content(hist, cand))
        sr = rank_norm(self._score_recent(hist, cand))
        si = rank_norm(self._score_i2i(hist, cand))
        pp = rank_norm(self.pop_score_arr[cand])

        if len(hist):
            seed_it = int(hist[-1])
            seed_lab = int(self.items["frame_label"].iloc[seed_it])
            opp_lab = 1 - seed_lab
            cb = (self.items["frame_label"].iloc[cand].values == opp_lab).astype(np.float32)
        else:
            cb = np.zeros(len(cand), dtype=np.float32)

        return (self.w_content * ct + self.w_recent * sr + self.w_i2i * si + self.w_pop * pp + self.w_counter * cb).astype(np.float32)

    def _rerank(self, hist: List[int], cand: np.ndarray, scores: np.ndarray, topk: int) -> List[int]:
        counter_min = max(0, int(round(self.counter_ratio * topk)))
        if counter_min <= 0 or len(hist) == 0:
            return rerank_diverse(cand, scores, self.item_cat, self.n_cats, topk, min(self.min_unique_cats, topk), self.pre_n, self.mmr_lambda, self.cat_repeat_penalty)

        seed_lab = int(self.items["frame_label"].iloc[int(hist[-1])])
        opp_lab = 1 - seed_lab
        m = (self.items["frame_label"].iloc[cand].values == opp_lab)

        cand_counter = cand[m]
        sc_counter = scores[m]

        chosen, chosen_set = [], set()
        if len(cand_counter):
            r1 = rerank_diverse(cand_counter, sc_counter, self.item_cat, self.n_cats, min(counter_min, topk, len(cand_counter)), min(self.min_unique_cats, counter_min), self.pre_n, self.mmr_lambda, self.cat_repeat_penalty)
            for it in r1:
                if it not in chosen_set:
                    chosen.append(int(it))
                    chosen_set.add(int(it))

        remain_k = topk - len(chosen)
        if remain_k > 0:
            mask_rem = np.array([int(it) not in chosen_set for it in cand.tolist()], dtype=bool)
            cand_rem, sc_rem = cand[mask_rem], scores[mask_rem]
            if len(cand_rem):
                r2 = rerank_diverse(cand_rem, sc_rem, self.item_cat, self.n_cats, min(remain_k, len(cand_rem)), min(self.min_unique_cats, remain_k), self.pre_n, self.mmr_lambda, self.cat_repeat_penalty)
                for it in r2:
                    if it not in chosen_set:
                        chosen.append(int(it))
                        chosen_set.add(int(it))

        return chosen[:topk]

    def _seen_to_indices(self, seen_ids: Sequence[str]) -> List[int]:
        out, st = [], set()
        for s in seen_ids:
            it = self._resolve_item_idx(str(s))
            if it is None or it in st:
                continue
            out.append(int(it))
            st.add(int(it))
        return out

    def _to_item(self, idx: int, score: float) -> Dict[str, Any]:
        r = self.items.iloc[int(idx)]
        category = str(r.get("raw_category", "") or "").strip() or "etc"
        url = str(r.get("url", "") or "")
        if not url:
            url = str(r.get("key", "") or "")
        thumbnail = str(r.get("thumbnail", "") or "")
        published_at = r.get("published_at", None)
        press_name = str(r.get("press_name", "") or "")
        if not press_name:
            press_name = str(r.get("source", "") or "")
        return {
            "id": str(r.get("id", r.get("key", idx))),
            "title": str(r.get("title", "") or "(untitled)"),
            "category": category,
            "category_for_model": str(r.get("category_for_model", "")),
            "url": url,
            "thumbnail": thumbnail,
            "published_at": published_at,
            "press_name": press_name,
            "source": str(r.get("source", "")),
            "topic_id": int(r.get("topic_id", 0) or 0),
            "item_idx": int(r.get("item_idx", idx)),
            "frame_label": int(r.get("frame_label", 0) or 0),
            "score": float(score),
        }

    def recommend(self, user_id: str, topk: int, seen_ids: Optional[Sequence[str]] = None) -> List[Dict[str, Any]]:
        k = max(1, min(int(topk), K_MAX))
        seen_ids = list(seen_ids or [])
        seen_idx = self._seen_to_indices(seen_ids)

        uid = str(user_id)
        u = self.u_ext2int.get(uid)

        if u is not None and 0 <= u < len(self.user_train_seq):
            hist = list(self.user_train_seq[u])
            for it in seen_idx:
                if len(hist) == 0 or int(it) != int(hist[-1]):
                    hist.append(int(it))
            if len(hist) > self.max_seq_per_user:
                hist = hist[-self.max_seq_per_user:]
        else:
            hist = list(seen_idx)

        if len(hist) == 0:
            rec = self.pop_items[:k].tolist()
            return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec)]

        seed = SEED + 173 * (abs(hash(uid)) % 1000003 + 1)
        cand = self._build_candidate_pool(hist=hist, seen_set=set(hist), user_idx=u, seed=seed)
        cand = self._prefilter(hist, cand)
        if len(cand) == 0:
            rec = self.pop_items[:k].tolist()
            return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec)]

        scores = self._blend_scores(hist, cand)
        rec = self._rerank(hist, cand, scores, k)

        if len(rec) < k:
            chosen = set(rec)
            for it in self.pop_items.tolist():
                if it in chosen:
                    continue
                rec.append(int(it))
                if len(rec) >= k:
                    break

        return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec[:k])]

    def recommend_by_seed(self, seed_key: str, topk: int) -> List[Dict[str, Any]]:
        k = max(1, min(int(topk), K_MAX))
        seed_it = self._resolve_item_idx(str(seed_key))
        if seed_it is None:
            rec = self.pop_items[:k].tolist()
            return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec)]

        hist = [int(seed_it)]
        cand = self._build_candidate_pool(hist=hist, seen_set=set(hist), user_idx=None, seed=SEED + 11)
        cand = self._prefilter(hist, cand)
        if len(cand) == 0:
            rec = self.pop_items[:k].tolist()
            return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec)]

        scores = self._blend_scores(hist, cand)
        rec = self._rerank(hist, cand, scores, k)
        return [self._to_item(int(it), float(k - i) / float(k)) for i, it in enumerate(rec)]

    def health(self) -> Dict[str, Any]:
        return {
            "ok": True,
            "mode": "counter",
            "item_source": self.loaded_item_source,
            "item_path": self.item_path,
            "interaction_path": self.inter_path,
            "n_items": int(self.n_items),
            "n_users": int(self.n_users),
            "n_topics": int(self.n_topics),
            "n_cats": int(self.n_cats),
            "mapping_mode": self.mapping_mode,
            "best_inter_mode": self.best_inter_mode,
            "inter_item_col": self.inter_item_col,
            "weights": {
                "content": self.w_content,
                "recent": self.w_recent,
                "i2i": self.w_i2i,
                "pop": self.w_pop,
                "counter": self.w_counter,
                "counter_ratio": self.counter_ratio,
            },
        }


class RecRequest(BaseModel):
    user_id: str
    topk: int = K_DEFAULT


class SeedRequest(BaseModel):
    seed_key: str
    topk: int = K_DEFAULT


SERVICE = CounterRecoService()
SERVICE.load()

app = FastAPI(title="Counter Reco API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return SERVICE.health()


@app.get("/reco")
def reco(userId: int = Query(1, ge=1), k: int = Query(K_DEFAULT, ge=1, le=K_MAX), seen: str = Query("")):
    seen_ids = [s.strip() for s in (seen or "").split(",") if s.strip()]
    items = SERVICE.recommend(user_id=str(userId), topk=k, seen_ids=seen_ids)
    return {"userId": int(userId), "k": int(k), "mode": "counter", "items": items}


@app.post("/recommend")
def recommend(req: RecRequest):
    items = SERVICE.recommend(user_id=str(req.user_id), topk=req.topk, seen_ids=[])
    return {"user_id": req.user_id, "topk": req.topk, "items": items}


@app.post("/recommend_by_seed")
def recommend_by_seed(req: SeedRequest):
    items = SERVICE.recommend_by_seed(seed_key=req.seed_key, topk=req.topk)
    return {"seed_key": req.seed_key, "topk": req.topk, "items": items}
