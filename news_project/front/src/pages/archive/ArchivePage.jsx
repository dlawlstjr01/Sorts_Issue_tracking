import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";
import {
  clearArchiveItems,
  getArchiveItemKey,
  removeArchiveItem,
  removeArchiveItemsByKeys,
} from "../../utils/archiveStorage";
import { clearRecentItems, removeRecentItem, removeRecentItemsByKeys } from "../../utils/recentStorage";

// ✅ (있으면) 아카이브 컨텍스트 사용
// 없으면 아래 try/catch fallback으로 localStorage에서 읽도록 처리함
let useArchiveSafe = null;
try {
  // 경로는 프로젝트에 맞게 수정하세요
  // 예: "../../context/ArchiveContext"
  // 예: "../../contexts/ArchiveContext"
  // eslint-disable-next-line global-require, import/no-unresolved
  const m = require("../../context/ArchiveContext");
  useArchiveSafe = m.useArchive;
} catch {
  useArchiveSafe = null;
}

const tabs = [
  { key: "saved", label: "저장한 기사" },
  { key: "recent", label: "최근 본 기사" },
  { key: "keywords", label: "관심 키워드" },
];

// ✅ 메인에서 쓰던 카테고리 정규화
function normalizeCategory(raw) {
  const v = String(raw || "").toLowerCase();
  if (v.includes("polit")) return "정치";
  if (v.includes("econ")) return "경제";
  if (v.includes("soc")) return "사회";
  if (v.includes("world") || v.includes("intl")) return "국제";
  if (v === "it" || v.includes("sci")) return "IT/과학";
  if (v.includes("cult") || v.includes("ent")) return "문화";
  if (v.includes("sport")) return "스포츠";
  return raw || "기타";
}

function formatYMD(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeSummaryValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(" ");
  }
  return String(value || "").trim();
}

function isPlaceholderSummary(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return true;
  return (
    normalized === "기사를 클릭하면 상세 내용을 확인할 수 있습니다." ||
    normalized === "요약 정보가 없습니다."
  );
}

/**
 * ✅ saved/recent 공통 UI 아이템으로 안전 매핑
 * - archive 저장 구조(우리가 저장한 구조)
 * - 또는 news 아이템 구조(n.id, n.title, n.category, n.published_at, n.url 등)
 * 둘 다 대응
 */
function mapAnyToArchiveItem(x) {
  const raw = x?.raw ?? x ?? {};
  const id = x?.id ?? raw?.id ?? raw?.article_id ?? raw?.articleId ?? raw?.url ?? raw?.link ?? `${Date.now()}`;

  const title = x?.title ?? raw?.title ?? raw?.headline ?? "(제목 없음)";
  const categoryRaw = x?.category ?? raw?.category ?? "기타";
  const dateRaw =
    x?.date ??
    raw?.published_at ??
    raw?.created_at ??
    raw?.viewed_at ??
    x?.savedAt ??
    x?.saved_at;

  const url = x?.url ?? raw?.url ?? raw?.link ?? "";
  const summaryCandidate = [
    x?.summary,
    raw?.summary,
    raw?.short_summary,
    raw?.ultra_short,
    raw?.description,
  ]
    .map(normalizeSummaryValue)
    .find((text) => !isPlaceholderSummary(text));

  return {
    id: String(id),
    title,
    category: normalizeCategory(categoryRaw),
    date: formatYMD(dateRaw),
    summary:
      summaryCandidate ||
      (url ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다." : "요약 정보가 없습니다."),
    raw: { ...raw, url },
  };
}

const DEFAULT_INTEREST_KEYWORDS = ["AI", "금리", "교통", "공급망", "문화행사"];
const PRIMARY_INTEREST_KEYWORD_STORAGE_KEY = "archiveInterestKeywords";
const INTEREST_KEYWORD_STORAGE_KEYS = [
  PRIMARY_INTEREST_KEYWORD_STORAGE_KEY,
  "interestKeywords",
  "myInterestKeywords",
  "userInterestKeywords",
  "preferredKeywords",
];

function normalizeKeywordList(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const keywords = [];

  value.forEach((item) => {
    const raw =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
          ? item.label ?? item.keyword ?? item.name ?? ""
          : "";
    const keyword = String(raw || "").trim();
    const dedupeKey = keyword.toLowerCase();
    if (!keyword || seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    keywords.push(keyword);
  });

  return keywords;
}

function readStoredInterestKeywords() {
  if (typeof window === "undefined") return [];

  for (const key of INTEREST_KEYWORD_STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const normalized = normalizeKeywordList(parsed);
      if (normalized.length > 0) return normalized;
    } catch {
      // ignore malformed localStorage value
    }
  }
  return [];
}

function writeStoredInterestKeywords(keywords) {
  if (typeof window === "undefined") return;

  const normalized = normalizeKeywordList(keywords);
  const payload = JSON.stringify(normalized);
  window.localStorage.setItem(PRIMARY_INTEREST_KEYWORD_STORAGE_KEY, payload);
  // 기존 키를 읽는 코드와 호환되도록 함께 저장
  window.localStorage.setItem("interestKeywords", payload);
}

function toTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getAlertItemKey(item) {
  return String(
    getArchiveItemKey(item) ||
      item?.id ||
      item?.raw?.id ||
      item?.raw?.article_id ||
      item?.raw?.articleId ||
      item?.raw?.url ||
      item?.url ||
      `${String(item?.title || "").trim()}_${String(item?.date || "").trim()}`
  );
}

function getArticleKeywordText(item) {
  return [
    item?.title,
    item?.raw?.title,
    item?.summary,
    item?.raw?.summary,
    item?.raw?.short_summary,
    item?.raw?.ultra_short,
    item?.raw?.description,
  ]
    .map(normalizeSummaryValue)
    .filter((text) => !isPlaceholderSummary(text))
    .join(" ")
    .toLowerCase();
}

// Backward-compatible alias for older call sites.
function getArticleSummaryText(item) {
  return getArticleKeywordText(item);
}

function getMatchedKeywordLabels(item, keywordList) {
  const sourceText = getArticleKeywordText(item);
  if (!sourceText) return [];
  return keywordList.filter((keyword) =>
    sourceText.includes(String(keyword || "").trim().toLowerCase())
  );
}

function buildHighlightChunks(text, terms) {
  const content = String(text || "");
  const normalizedTerms = [...new Set((terms || []).map((term) => String(term || "").trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length);
  if (!content || normalizedTerms.length === 0) return [{ text: content, hit: false }];

  const escaped = normalizedTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  return content.split(pattern).filter(Boolean).map((part) => {
    const hit = normalizedTerms.some((term) => part.toLowerCase() === term.toLowerCase());
    return { text: part, hit };
  });
}

function getDetailBody(item) {
  return normalizeSummaryValue(
    item?.raw?.content ||
      item?.raw?.body ||
      item?.raw?.description ||
      item?.raw?.short_summary ||
      item?.raw?.summary ||
      item?.summary ||
      ""
  );
}

function getItemUpdatedStamp(item) {
  return String(
    item?.raw?.updated_at ||
      item?.raw?.updatedAt ||
      item?.raw?.published_at ||
      item?.raw?.created_at ||
      item?.raw?.saved_at ||
      item?.raw?.viewed_at ||
      item?.updated_at ||
      item?.updatedAt ||
      item?.published_at ||
      item?.created_at ||
      item?.saved_at ||
      item?.viewed_at ||
      item?.date ||
      ""
  );
}

function getAlertItemSignature(item) {
  const key = getAlertItemKey(item);
  const stamp = getItemUpdatedStamp(item);
  const keywordText = getArticleKeywordText(item);
  return `${key}::${stamp}::${keywordText}`;
}

function readLocalArray(key) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapTrackingIssueToArchiveItem(issue) {
  const relatedArticles = Array.isArray(issue?.related_articles) ? issue.related_articles : [];
  const representative =
    relatedArticles.find(
      (article) =>
        Number(article?.is_representative || 0) === 1 ||
        String(article?.id || article?.article_id || "") === String(issue?.article_id || "")
    ) || relatedArticles[0] || null;

  const title = representative?.title || issue?.title || "(제목 없음)";
  const summary = normalizeSummaryValue(
    issue?.short_summary ||
      issue?.ultra_short ||
      issue?.summary ||
      representative?.short_summary ||
      representative?.ultra_short ||
      representative?.summary ||
      representative?.description ||
      ""
  );

  const raw = {
    ...issue,
    ...(representative || {}),
    id:
      issue?.article_id ||
      representative?.id ||
      representative?.article_id ||
      issue?.id ||
      `${String(issue?.id || "").trim()}-${title}`,
    article_id:
      issue?.article_id ||
      representative?.article_id ||
      representative?.id ||
      issue?.id ||
      "",
    title,
    summary,
    category: representative?.category || issue?.category || "기타",
    published_at:
      representative?.published_at ||
      representative?.created_at ||
      issue?.updated_at ||
      issue?.created_at ||
      "",
    updated_at:
      issue?.updated_at ||
      representative?.updated_at ||
      representative?.published_at ||
      representative?.created_at ||
      issue?.created_at ||
      "",
    url: representative?.url || issue?.url || "",
  };

  return mapAnyToArchiveItem(raw);
}

export default function ArchivePage() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [interestKeywords, setInterestKeywords] = useState(() => {
    const stored = readStoredInterestKeywords();
    return stored.length > 0 ? stored : [...DEFAULT_INTEREST_KEYWORDS];
  });
  const [activeKeyword, setActiveKeyword] = useState(() => {
    const stored = readStoredInterestKeywords();
    const initial = stored.length > 0 ? stored : DEFAULT_INTEREST_KEYWORDS;
    return initial[0] || "";
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordToast, setKeywordToast] = useState("");
  const [keywordAlertQueue, setKeywordAlertQueue] = useState([]);
  const notifiedKeywordArticleSignaturesRef = useRef(new Set());
  const queuedKeywordArticleSignaturesRef = useRef(new Set());
  const seenKeywordArticleKeysRef = useRef(new Set());
  const keywordAlertInitializedRef = useRef(false);
  const keywordStatusInitializedRef = useRef(false);
  const keywordStatusSignaturesRef = useRef(new Map());
  const [keywordLiveStatusByKey, setKeywordLiveStatusByKey] = useState({});
  const [keywordMatchOnly, setKeywordMatchOnly] = useState(true);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState(null);
  // ✅ 실시간 이슈 상세 모달 상태: 선택된 카드가 있을 때만 상세를 연다.
  const [selectedTrend, setSelectedTrend] = useState(null);

  // ✅ 저장한 기사: 컨텍스트(있으면)에서 가져오고, 없으면 localStorage fallback
  const archiveCtx = useArchiveSafe ? useArchiveSafe() : null;
  const savedFromCtx = Array.isArray(archiveCtx?.archive) ? archiveCtx.archive : null;

  const [savedItems, setSavedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [mainFeedItems, setMainFeedItems] = useState([]);
  const [mainFeedLoaded, setMainFeedLoaded] = useState(false);
  const confirmActionRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });
  const [selectedSavedKeys, setSelectedSavedKeys] = useState(new Set());
  const [selectedRecentKeys, setSelectedRecentKeys] = useState(new Set());

  // ✅ 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 페이지네이션
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ✅ 관심 키워드 버튼: 숫자는 렌더 시 실제 기사 개수로 계산한다.
  const keywordItems = useMemo(
    () => interestKeywords.map((label, index) => ({ id: `kw-${index}-${label}`, label })),
    [interestKeywords]
  );

  useEffect(() => {
    writeStoredInterestKeywords(interestKeywords);
  }, [interestKeywords]);

  useEffect(() => {
    if (!keywordItems.length) {
      setActiveKeyword("");
      return;
    }
    const exists = keywordItems.some((item) => item.label === activeKeyword);
    if (!exists) setActiveKeyword(keywordItems[0].label);
  }, [keywordItems, activeKeyword]);

  useEffect(() => {
    setSelectedArticleDetail(null);
  }, [activeTab]);

  const trendingItems = [
    {
      id: "trend-1",
      title: "생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련",
      category: "IT/과학",
      views: "12.4k",
      detail: {
        summary: "기업들이 고성능 모델 유지 비용을 줄이기 위해 경량화 모델과 하이브리드 추론 전략을 병행하는 흐름입니다.",
        points: [
          "대규모 모델과 경량 모델을 혼합해 업무별로 비용을 최적화합니다.",
          "보안 이슈로 인해 온프레미스 추론 수요가 함께 증가하고 있습니다.",
          "성능 비교 지표 표준화가 미흡해 벤치마크 해석 주의가 필요합니다.",
        ],
        updatedAt: "2026-03-11 09:30",
      },
    },
    {
      id: "trend-2",
      title: "금리 변동성 확대, 유통 업계 판매 전략 조정",
      category: "경제",
      views: "9.8k",
      detail: {
        summary: "금리 불확실성이 커지면서 유통 업계가 재고 회전율 중심 전략과 단기 프로모션 비중을 높이고 있습니다.",
        points: [
          "고정비 비중이 큰 채널은 단기 할인보다 고마진 상품군 강화에 집중합니다.",
          "온라인 채널은 가격 민감 고객을 겨냥한 번들형 상품 비중을 확대합니다.",
          "중소 유통사는 금융비용 증가에 따라 발주 주기를 짧게 가져가는 추세입니다.",
        ],
        updatedAt: "2026-03-11 08:10",
      },
    },
    {
      id: "trend-3",
      title: "도시 교통 혼잡 완화 대책, 대중교통 확대 수요 분산",
      category: "사회",
      views: "8.1k",
      detail: {
        summary: "출퇴근 혼잡 구간을 중심으로 버스 노선 재배치와 환승 편의 개선을 통해 통행량 분산을 유도하고 있습니다.",
        points: [
          "혼잡 시간대 증차보다 환승 동선 단축이 체감 개선 효과가 큽니다.",
          "도심 주차 정책과 연계해야 대중교통 전환 효과가 유지됩니다.",
          "정책 성과는 최소 4주 이상 누적 데이터로 평가하는 것이 적절합니다.",
        ],
        updatedAt: "2026-03-10 19:40",
      },
    },
    {
      id: "trend-4",
      title: "기업 클라우드 이전 가속화, 보안 기준 재정립",
      category: "IT/과학",
      views: "6.7k",
      detail: null,
    },
  ];

  // ✅ saved: 컨텍스트/로컬스토리지에서 가져온 값 반영
  useEffect(() => {
    // 컨텍스트가 있으면 그거 사용
    if (Array.isArray(savedFromCtx)) {
      setSavedItems(savedFromCtx.map(mapAnyToArchiveItem));
      return undefined;
    }

    const syncSavedItems = () => {
      const saved = readLocalArray("archive");
      setSavedItems(saved.map(mapAnyToArchiveItem));
    };

    syncSavedItems();
    const pollingMs = activeTab === "keywords" ? 5000 : 12000;
    const timer = window.setInterval(syncSavedItems, pollingMs);
    return () => window.clearInterval(timer);
  }, [savedFromCtx, activeTab]);

  // ✅ recent: localStorage("recentArticles")에서 읽어서 표시
  // (나중에 서버 API 생기면 여기만 axios로 바꾸면 됨)
  useEffect(() => {
    const syncRecentItems = () => {
      const recent = readLocalArray("recentArticles");
      setRecentItems(recent.map(mapAnyToArchiveItem));
    };

    if (activeTab === "recent") {
      setLoading(true);
      setError("");
      syncRecentItems();
      setLoading(false);
    } else {
      syncRecentItems();
    }

    const pollingMs = activeTab === "keywords" ? 5000 : 12000;
    const timer = window.setInterval(syncRecentItems, pollingMs);
    return () => window.clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    let mounted = true;

    const loadMainFeedArticles = async () => {
      try {
        const res = await axios.get("/tracking/issues", {
          params: { limit: 50 },
        });
        if (!mounted) return;

        const items = res.data?.items || res.data?.issues || res.data?.data || [];
        const onlyGrouped = items.filter((item) => Number(item?.related_count || 0) >= 2);
        const mapped = onlyGrouped
          .map(mapTrackingIssueToArchiveItem)
          .filter((item) => item && item.id);

        setMainFeedItems(mapped);
        setMainFeedLoaded(true);
      } catch (e) {
        if (!mounted) return;
        setMainFeedLoaded(true);
      }
    };

    loadMainFeedArticles();
    const pollingMs = activeTab === "keywords" ? 7000 : 20000;
    const timer = window.setInterval(loadMainFeedArticles, pollingMs);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [activeTab]);

  useEffect(() => {
    const keySet = new Set(savedItems.map(getArchiveItemKey).filter(Boolean));
    setSelectedSavedKeys((prev) => {
      if (!prev.size) return prev;
      const next = new Set([...prev].filter((key) => keySet.has(key)));
      return next;
    });
  }, [savedItems]);

  useEffect(() => {
    const keySet = new Set(recentItems.map(getArchiveItemKey).filter(Boolean));
    setSelectedRecentKeys((prev) => {
      if (!prev.size) return prev;
      const next = new Set([...prev].filter((key) => keySet.has(key)));
      return next;
    });
  }, [recentItems]);

  // ✅ 탭별 목록 선택
  const listItems = activeTab === "saved" ? savedItems : recentItems;

  // ✅ 검색/정렬 + 페이지 처리
  const filteredResult = useMemo(() => {
    const q = query.trim().toLowerCase();

    const items = (listItems || []).filter((item) => {
      if (!q) return true;
      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.summary || "").toLowerCase().includes(q)
      );
    });

    const getSortValue = (item) =>
      toTimestamp(
        item?.date ||
          item?.saved_at ||
          item?.raw?.saved_at ||
          item?.raw?.viewed_at ||
          item?.raw?.published_at ||
          item?.raw?.created_at ||
          item?.published_at ||
          item?.created_at
      );

    const sorted =
      sort === "oldest"
        ? [...items].sort((a, b) => getSortValue(a) - getSortValue(b))
        : [...items].sort((a, b) => getSortValue(b) - getSortValue(a));

    // ✅ 간단한 프론트 페이지네이션(slice)
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { items: sorted.slice(start, end), total: sorted.length };
  }, [listItems, query, sort, page, pageSize]);

  const filtered = filteredResult.items;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredResult.total / pageSize)),
    [filteredResult.total, pageSize]
  );

  useEffect(() => {
    if (activeTab === "keywords") return;
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, activeTab]);

  // ✅ 관심 키워드 탭/알림은 메인페이지 실시간 이슈 기사 소스를 기준으로 동작한다.
  const keywordArticlePool = useMemo(() => {
    const merged = [...mainFeedItems];
    const deduped = new Map();

    merged.forEach((item) => {
      const key = getAlertItemKey(item);
      const prev = deduped.get(key);
      if (!prev) {
        deduped.set(key, item);
        return;
      }

      const prevStamp = toTimestamp(getItemUpdatedStamp(prev));
      const nextStamp = toTimestamp(getItemUpdatedStamp(item));
      if (nextStamp >= prevStamp) deduped.set(key, item);
    });

    return [...deduped.values()];
  }, [mainFeedItems]);

  const keywordCountsByLabel = useMemo(() => {
    const counts = {};
    keywordItems.forEach(({ label }) => {
      const lower = String(label || "").toLowerCase();
      counts[label] = keywordArticlePool.filter((item) =>
        getArticleKeywordText(item).includes(lower)
      ).length;
    });
    return counts;
  }, [keywordItems, keywordArticlePool]);

  // ✅ keywords 탭도 동일한 검색/정렬 규칙을 적용해 최신순/오래된순을 반영한다.
  const activeKeywordMatchCount = useMemo(() => {
    const targetKeyword = String(activeKeyword || "").trim().toLowerCase();
    if (!targetKeyword) return keywordArticlePool.length;
    return keywordArticlePool.filter((item) =>
      getArticleKeywordText(item).includes(targetKeyword)
    ).length;
  }, [activeKeyword, keywordArticlePool]);

  const keywordFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const targetKeyword = String(activeKeyword || "").trim().toLowerCase();

    const keywordMatched = keywordArticlePool.filter((item) => {
      if (!targetKeyword) return true;
      return getArticleKeywordText(item).includes(targetKeyword);
    });

    const baseItems = keywordMatchOnly ? keywordMatched : keywordArticlePool;

    const searched = baseItems.filter((item) => {
      if (!q) return true;
      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.summary || "").toLowerCase().includes(q)
      );
    });

    const sortValue = (item) => toTimestamp(getItemUpdatedStamp(item));
    return sort === "oldest"
      ? searched.sort((a, b) => sortValue(a) - sortValue(b))
      : searched.sort((a, b) => sortValue(b) - sortValue(a));
  }, [query, activeKeyword, sort, keywordArticlePool, keywordMatchOnly]);

  const keywordTotalPages = useMemo(
    () => Math.max(1, Math.ceil(keywordFiltered.length / pageSize)),
    [keywordFiltered.length, pageSize]
  );

  const keywordPagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return keywordFiltered.slice(start, end);
  }, [keywordFiltered, page, pageSize]);

  useEffect(() => {
    if (activeTab !== "keywords") return;
    if (page > keywordTotalPages) setPage(keywordTotalPages);
  }, [page, keywordTotalPages, activeTab]);

  useEffect(() => {
    const prev = keywordStatusSignaturesRef.current;
    const next = new Map();

    if (!keywordArticlePool.length) {
      keywordStatusSignaturesRef.current = next;
      if (keywordStatusInitializedRef.current) setKeywordLiveStatusByKey({});
      return;
    }

    const nextStatuses = {};
    keywordArticlePool.forEach((item) => {
      const key = getAlertItemKey(item);
      const signature = getAlertItemSignature(item);
      next.set(key, signature);

      if (!keywordStatusInitializedRef.current) return;
      if (!prev.has(key)) {
        nextStatuses[key] = "new";
        return;
      }
      if (prev.get(key) !== signature) {
        nextStatuses[key] = "updated";
      }
    });

    keywordStatusSignaturesRef.current = next;
    if (!keywordStatusInitializedRef.current) {
      keywordStatusInitializedRef.current = true;
      setKeywordLiveStatusByKey({});
      return;
    }
    setKeywordLiveStatusByKey(nextStatuses);
  }, [keywordArticlePool]);

  useEffect(() => {
    if (!mainFeedLoaded) return;

    const normalizedKeywords = interestKeywords
      .map((keyword) => String(keyword || "").trim())
      .filter(Boolean)
      .map((keyword) => ({ original: keyword, lower: keyword.toLowerCase() }));
    if (normalizedKeywords.length === 0) return;
    if (!keywordArticlePool.length) {
      keywordAlertInitializedRef.current = true;
      return;
    }

    const nextAlerts = [];

    keywordArticlePool.forEach((item) => {
      const searchText = getArticleKeywordText(item);
      if (!searchText) return;

      const matchedKeywords = normalizedKeywords
        .filter(({ lower }) => searchText.includes(lower))
        .map(({ original }) => original);
      if (!matchedKeywords.length) return;

      const signature = getAlertItemSignature(item);
      const articleKey = getAlertItemKey(item);
      const isUpdate = seenKeywordArticleKeysRef.current.has(articleKey);
      seenKeywordArticleKeysRef.current.add(articleKey);

      // 초기 렌더 시 이미 떠 있는 기사로는 알림을 보내지 않는다.
      if (!keywordAlertInitializedRef.current) {
        notifiedKeywordArticleSignaturesRef.current.add(signature);
        return;
      }

      if (notifiedKeywordArticleSignaturesRef.current.has(signature)) return;
      if (queuedKeywordArticleSignaturesRef.current.has(signature)) return;

      queuedKeywordArticleSignaturesRef.current.add(signature);
      nextAlerts.push({
        signature,
        title: String(item?.title || "제목 없음"),
        matchedKeywords,
        eventType: isUpdate ? "updated" : "new",
      });
    });

    if (!keywordAlertInitializedRef.current) {
      keywordAlertInitializedRef.current = true;
    }
    if (nextAlerts.length > 0) {
      setKeywordAlertQueue((prev) => [...prev, ...nextAlerts]);
    }
  }, [keywordArticlePool, interestKeywords, mainFeedLoaded]);

  useEffect(() => {
    if (keywordToast || keywordAlertQueue.length === 0) return;

    const [nextAlert, ...restAlerts] = keywordAlertQueue;
    setKeywordAlertQueue(restAlerts);
    queuedKeywordArticleSignaturesRef.current.delete(nextAlert.signature);
    notifiedKeywordArticleSignaturesRef.current.add(nextAlert.signature);

    const firstKeyword = nextAlert.matchedKeywords[0];
    const extraCount = Math.max(0, nextAlert.matchedKeywords.length - 1);
    const keywordSuffix = extraCount > 0 ? ` 외 ${extraCount}` : "";
    const eventLabel = nextAlert.eventType === "updated" ? "업데이트" : "신규";
    setKeywordToast(`관심 키워드 [${firstKeyword}${keywordSuffix}] ${eventLabel} 기사: ${nextAlert.title}`);
  }, [keywordAlertQueue, keywordToast]);

  useEffect(() => {
    if (!keywordToast) return undefined;
    const timer = window.setTimeout(() => setKeywordToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [keywordToast]);

  const handleAddInterestKeyword = (event) => {
    event.preventDefault();
    const keyword = keywordInput.trim();
    if (!keyword) return;

    const exists = interestKeywords.some(
      (item) => String(item || "").toLowerCase() === keyword.toLowerCase()
    );
    if (exists) {
      setKeywordToast(`관심 키워드 [${keyword}]는 이미 등록되어 있습니다.`);
      setKeywordInput("");
      return;
    }

    setInterestKeywords((prev) => [...prev, keyword]);
    setActiveKeyword(keyword);
    setPage(1);
    setKeywordInput("");
    setKeywordToast(`관심 키워드 [${keyword}]를 등록했습니다.`);
  };

  const handleRemoveInterestKeyword = (keyword) => {
    if (!keyword) return;
    if (interestKeywords.length <= 1) {
      setKeywordToast("관심 키워드는 최소 1개 이상 유지해야 합니다.");
      return;
    }

    setInterestKeywords((prev) =>
      prev.filter((item) => String(item || "").toLowerCase() !== String(keyword).toLowerCase())
    );
    setPage(1);
    setKeywordToast(`관심 키워드 [${keyword}]를 삭제했습니다.`);
  };

  // ✅ 목록은 축약본으로 보여주고, 상세 모달에서 전체 내용을 확인한다.
  const highlightQueryTerm = query.trim();

  const renderHighlightedText = (text, terms) =>
    buildHighlightChunks(text, terms).map((chunk, index) =>
      chunk.hit ? (
        <mark key={`hl-${index}-${chunk.text}`} className="archive-mark">
          {chunk.text}
        </mark>
      ) : (
        <React.Fragment key={`tx-${index}-${chunk.text}`}>{chunk.text}</React.Fragment>
      )
    );

  const openArticleDetail = (item) => {
    if (!item) return;
    setSelectedArticleDetail(item);
  };

  const closeArticleDetail = () => {
    setSelectedArticleDetail(null);
  };

  const renderArchiveCard = ({
    item,
    selectable = false,
    itemKey = "",
    isSelected = false,
    onToggleSelect = null,
    onRemove = null,
    removeAriaLabel = "",
    showLiveBadge = false,
  }) => {
    const matchedKeywords = getMatchedKeywordLabels(item, interestKeywords);
    const highlightTerms = [highlightQueryTerm];
    if (activeTab === "keywords") {
      highlightTerms.push(activeKeyword);
      matchedKeywords.forEach((keyword) => highlightTerms.push(keyword));
    }
    const terms = [...new Set(highlightTerms.map((term) => String(term || "").trim()).filter(Boolean))];
    const liveBadgeType = showLiveBadge ? keywordLiveStatusByKey[getAlertItemKey(item)] || "" : "";
    const liveBadgeLabel = liveBadgeType === "updated" ? "UPDATED" : liveBadgeType === "new" ? "NEW" : "";

    const handleOpenDetail = (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target && typeof target.closest === "function") {
        if (
          target.closest(".archive-item-check") ||
          target.closest(".archive-item-remove") ||
          target.closest(".archive-item-more") ||
          target.closest(".archive-item-origin")
        ) {
          return;
        }
      }
      openArticleDetail(item);
    };

    return (
      <article
        key={item.id}
        className="archive-item archive-item-compact"
        role="button"
        tabIndex={0}
        onClick={handleOpenDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter") openArticleDetail(item);
        }}
      >
        <div className="archive-item-head">
          <div className="archive-item-head-left">
            {selectable && (
              <label
                className="archive-item-check"
                onClick={(event) => {
                  event.stopPropagation();
                  if (onToggleSelect) onToggleSelect(item);
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(itemKey && isSelected)}
                  disabled={!itemKey}
                  readOnly
                />
              </label>
            )}
            <span className="archive-item-cat">{item.category}</span>
          </div>
          <div className="archive-item-actions">
            <span className="archive-item-date">{item.date}</span>
            {liveBadgeLabel && (
              <span className={`archive-item-live-badge ${liveBadgeType}`}>{liveBadgeLabel}</span>
            )}
            {onRemove && (
              <button
                type="button"
                className="archive-item-remove"
                onClick={(event) => onRemove(event, item)}
                aria-label={removeAriaLabel}
              >
                삭제
              </button>
            )}
          </div>
        </div>

        <div className="archive-item-title clamp-2">{renderHighlightedText(item.title, terms)}</div>
        <div className="archive-item-summary clamp-3">{renderHighlightedText(item.summary, terms)}</div>

        <div className="archive-item-foot">
          {matchedKeywords.length > 0 ? (
            <div className="archive-item-keywords">
              {matchedKeywords.slice(0, 3).map((keyword) => (
                <span key={`${item.id}-${keyword}`} className="archive-item-keyword-chip">
                  #{keyword}
                </span>
              ))}
            </div>
          ) : (
            <span className="archive-item-keywords-empty"> </span>
          )}
          <div className="archive-item-foot-actions">
            <button
              type="button"
              className="archive-item-more"
              onClick={(event) => {
                event.stopPropagation();
                openArticleDetail(item);
              }}
            >
              상세 보기
            </button>
            <button
              type="button"
              className="archive-item-origin"
              onClick={(event) => {
                event.stopPropagation();
                openItem(item);
              }}
              disabled={!item?.raw?.url}
            >
              원문
            </button>
          </div>
        </div>
      </article>
    );
  };

  const selectedArticleDetailKeywords = useMemo(
    () => (selectedArticleDetail ? getMatchedKeywordLabels(selectedArticleDetail, interestKeywords) : []),
    [selectedArticleDetail, interestKeywords]
  );

  const selectedArticleDetailTerms = useMemo(() => {
    if (!selectedArticleDetail) return [];
    const terms = [highlightQueryTerm, activeKeyword];
    selectedArticleDetailKeywords.forEach((keyword) => terms.push(keyword));
    return [...new Set(terms.map((term) => String(term || "").trim()).filter(Boolean))];
  }, [selectedArticleDetail, highlightQueryTerm, activeKeyword, selectedArticleDetailKeywords]);

  const selectedArticleDetailLiveBadge = selectedArticleDetail
    ? keywordLiveStatusByKey[getAlertItemKey(selectedArticleDetail)] || ""
    : "";

  const openItem = (item) => {
    const url = item?.raw?.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRemoveSaved = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    const result = removeArchiveItem(item);
    setSavedItems(result.items.map(mapAnyToArchiveItem));
  };

  const toggleSavedSelection = (item) => {
    const key = getArchiveItemKey(item);
    if (!key) return;
    setSelectedSavedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteSelectedSaved = () => {
    if (selectedSavedKeys.size === 0) return;
    const count = selectedSavedKeys.size;
    confirmActionRef.current = () => {
      const result = removeArchiveItemsByKeys([...selectedSavedKeys]);
      setSavedItems(result.items.map(mapAnyToArchiveItem));
    };
    setConfirmModal({ open: true, message: `선택한 기사 ${count}개를 삭제할까요?` });
  };

  const handleClearSaved = () => {
    if (savedItems.length === 0) return;
    confirmActionRef.current = () => {
      clearArchiveItems();
      setSavedItems([]);
      setPage(1);
    };
    setConfirmModal({ open: true, message: "저장한 기사 전체를 삭제할까요?" });
  };

  const handleRemoveRecent = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    const result = removeRecentItem(item);
    setRecentItems(result.items.map(mapAnyToArchiveItem));
  };

  const toggleRecentSelection = (item) => {
    const key = getArchiveItemKey(item);
    if (!key) return;
    setSelectedRecentKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteSelectedRecent = () => {
    if (selectedRecentKeys.size === 0) return;
    const count = selectedRecentKeys.size;
    confirmActionRef.current = () => {
      const result = removeRecentItemsByKeys([...selectedRecentKeys]);
      setRecentItems(result.items.map(mapAnyToArchiveItem));
    };
    setConfirmModal({ open: true, message: `선택한 기사 ${count}개를 삭제할까요?` });
  };

  const handleClearRecent = () => {
    if (recentItems.length === 0) return;
    confirmActionRef.current = () => {
      clearRecentItems();
      setRecentItems([]);
      setPage(1);
    };
    setConfirmModal({ open: true, message: "최근 본 기사 전체를 삭제할까요?" });
  };

  const closeConfirmModal = () => {
    confirmActionRef.current = null;
    setConfirmModal({ open: false, message: "" });
  };

  const handleConfirmModal = () => {
    const action = confirmActionRef.current;
    closeConfirmModal();
    if (action) action();
  };

  // ✅ 상세 데이터가 있는 카드만 모달을 열어 3번(비활성 처리) 기준을 지킨다.
  const openTrendDetail = (item) => {
    if (!item?.detail?.summary) return;
    setSelectedTrend(item);
  };

  // ✅ ESC 키로 상세 모달을 닫아 키보드 사용성도 맞춘다.
  useEffect(() => {
    if (!selectedTrend && !selectedArticleDetail) return undefined;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (selectedArticleDetail) {
        setSelectedArticleDetail(null);
        return;
      }
      setSelectedTrend(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedTrend, selectedArticleDetail]);

  return (
    <div className="page archive-page">
      <div className="login-head">
        <div className="pageTitle">아카이브</div>
        <div className="pageDesc">저장한 기사 / 최근 본 기사 / 관심 키워드</div>
      </div>

      <div className="archive-layout">
        <section className="archive-main">
          <div className="archive-tabs">
            {tabs.map((t) => (
              <motion.button
                key={t.key}
                type="button"
                className={`archive-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                  setError("");
                }}
                // 탭 버튼도 동일한 hover/tap 모션으로 반응성을 맞춘다.
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          <div className="archive-toolbar">
            <input
              className="archive-search"
              type="text"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <div className="archive-sort">
              <motion.button
                type="button"
                className={sort === "latest" ? "active" : ""}
                onClick={() => setSort("latest")}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                최신순
              </motion.button>
              <motion.button
                type="button"
                className={sort === "oldest" ? "active" : ""}
                onClick={() => setSort("oldest")}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                        mass: 0.55,
                      }
                }
              >
                오래된순
              </motion.button>
              {activeTab === "saved" && (
                <motion.button
                  type="button"
                  className="archive-clear"
                  onClick={handleDeleteSelectedSaved}
                  disabled={loading || selectedSavedKeys.size === 0}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          mass: 0.55,
                        }
                  }
                >
                  선택삭제
                </motion.button>
              )}
              {activeTab === "saved" && (
                <motion.button
                  type="button"
                  className="archive-clear"
                  onClick={handleClearSaved}
                  disabled={loading || savedItems.length === 0}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          mass: 0.55,
                        }
                  }
                >
                  모두삭제
                </motion.button>
              )}
              {activeTab === "recent" && (
                <motion.button
                  type="button"
                  className="archive-clear"
                  onClick={handleDeleteSelectedRecent}
                  disabled={loading || selectedRecentKeys.size === 0}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          mass: 0.55,
                        }
                  }
                >
                  선택삭제
                </motion.button>
              )}
              {activeTab === "recent" && (
                <motion.button
                  type="button"
                  className="archive-clear"
                  onClick={handleClearRecent}
                  disabled={loading || recentItems.length === 0}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          mass: 0.55,
                        }
                  }
                >
                  모두삭제
                </motion.button>
              )}
            </div>
          </div>

          {/* ✅ saved/recent 탭 */}
          {activeTab !== "keywords" && (
            <div className="archive-list">
              {loading && <div className="archive-empty">불러오는 중...</div>}
              {error && !loading && (
                <div className="archive-empty" style={{ color: "crimson" }}>
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                filtered.map((item) => {
                  const itemKey = getArchiveItemKey(item);
                  const isSelected =
                    activeTab === "saved"
                      ? selectedSavedKeys.has(itemKey)
                      : selectedRecentKeys.has(itemKey);
                  const toggleSelection =
                    activeTab === "saved" ? toggleSavedSelection : toggleRecentSelection;
                  const removeHandler =
                    activeTab === "saved" ? handleRemoveSaved : handleRemoveRecent;
                  const removeAria =
                    activeTab === "saved" ? "remove saved article" : "remove recent article";

                  return renderArchiveCard({
                    item,
                    selectable: true,
                    itemKey,
                    isSelected,
                    onToggleSelect: toggleSelection,
                    onRemove: removeHandler,
                    removeAriaLabel: removeAria,
                    showLiveBadge: false,
                  });
                })}

              {!loading && !error && filtered.length === 0 && (
                <div className="archive-empty">
                  {activeTab === "saved" ? "저장한 기사가 없습니다." : "최근 본 기사가 없습니다."}
                </div>
              )}

              {/* ✅ 페이지 버튼 */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                <button
                  type="button"
                  className="mp-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="mp-btn"
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* ✅ keywords 탭 더미 유지 */}
          {activeTab === "keywords" && (
            <div className="archive-keywords-wrap">
              <form className="archive-keyword-form" onSubmit={handleAddInterestKeyword}>
                <input
                  className="archive-keyword-input"
                  type="text"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="관심 키워드 추가 (예: 반도체)"
                  maxLength={24}
                />
                <button type="submit" className="archive-keyword-add">
                  키워드 추가
                </button>
              </form>

              <div className="archive-keyword-controls">
                <label className="archive-match-toggle">
                  <input
                    type="checkbox"
                    checked={keywordMatchOnly}
                    onChange={(event) => {
                      setKeywordMatchOnly(event.target.checked);
                      setPage(1);
                    }}
                  />
                  <span>매칭 기사만 보기</span>
                </label>
                <span className="archive-match-meta">
                  {activeKeyword || "전체"} 매칭 {activeKeywordMatchCount}건
                </span>
              </div>

              <div className="archive-keywords">
                {keywordItems.map((k) => (
                  <div key={k.id} className="archive-keyword-item">
                    <motion.button
                      type="button"
                      className={`archive-keyword ${activeKeyword === k.label ? "active" : ""}`}
                      onClick={() => {
                        setActiveKeyword(k.label);
                        setPage(1);
                      }}
                      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                      whileTap={reduceMotion ? undefined : { y: 0, scale: 0.98 }}
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 28,
                              mass: 0.55,
                            }
                      }
                    >
                      <span className="archive-keyword-label">{k.label}</span>
                      <span className="archive-keyword-count">
                        {keywordCountsByLabel[k.label] || 0}
                      </span>
                    </motion.button>
                    <button
                      type="button"
                      className="archive-keyword-remove"
                      onClick={() => handleRemoveInterestKeyword(k.label)}
                      disabled={keywordItems.length <= 1}
                      aria-label={`${k.label} 키워드 삭제`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {keywordMatchOnly && activeKeyword && activeKeywordMatchCount === 0 && (
                <div className="archive-empty">
                  현재 [{activeKeyword}] 키워드와 일치하는 기사가 없습니다. 메인페이지 기사 신규/업데이트 시
                  알림이 뜹니다.
                </div>
              )}

              <div key={activeKeyword} className="archive-keyword-list is-animated">
                {keywordPagedItems.map((item) =>
                  renderArchiveCard({
                    item,
                    showLiveBadge: true,
                  })
                )}
                {keywordPagedItems.length === 0 && (
                  <div className="archive-empty">
                    {keywordMatchOnly
                      ? "조건에 맞는 키워드 기사가 없습니다."
                      : "표시할 기사가 없습니다."}
                  </div>
                )}

                {keywordFiltered.length > 0 && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                    <button
                      type="button"
                      className="mp-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      className="mp-btn"
                      disabled={page >= keywordTotalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="archive-aside">
          <SideMenuCard collapsible showScrollTop />

          <div className="archive-side-card">
            <div className="archive-side-head">
              <div>
                <div className="archive-side-title">
                  <img
                    className="archive-side-title-icon"
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' fill='%23e0ecff'/><path d='M13 5l-4 7h4l-1 7 5-8h-4l2-6z' fill='%231d4ed8'/></svg>"
                    alt=""
                  />
                  실시간 이슈
                </div>
                <div className="archive-side-desc">최근 7일 기준 인기 기사</div>
              </div>
              <span className="archive-side-badge">LIVE</span>
            </div>

            <div className="archive-side-list">
              {trendingItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`archive-side-item ${!item.detail?.summary ? "is-disabled" : ""}`}
                  disabled={!item.detail?.summary}
                  onClick={() => openTrendDetail(item)}
                  // ✅ 상세 가능 여부를 버튼 설명에 함께 넣어 접근성을 유지한다.
                  aria-label={`${item.title} ${item.detail?.summary ? "상세 보기" : "상세 준비중"}`}
                >
                  <span className="archive-side-rank">{String(index + 1).padStart(2, "0")}</span>
                  <div className="archive-side-body">
                    <div className="archive-side-meta">
                      <span className="archive-side-cat">{item.category}</span>
                      <span className="archive-side-views">{item.views} views</span>
                    </div>
                    <div className="archive-side-title-text">{item.title}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="archive-side-footer">업데이트: 지금 시간 기준</div>
          </div>
        </aside>
      </div>

      {selectedArticleDetail && (
        <div
          className="archive-article-modal-overlay"
          role="presentation"
          onClick={closeArticleDetail}
        >
          <section
            className="archive-article-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-article-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="archive-article-modal-head">
              <div className="archive-item-head-left">
                <span className="archive-item-cat">{selectedArticleDetail.category}</span>
                {selectedArticleDetailKeywords.slice(0, 3).map((keyword) => (
                  <span key={`modal-${keyword}`} className="archive-item-keyword-chip">
                    #{keyword}
                  </span>
                ))}
              </div>
              <div className="archive-item-actions">
                <span className="archive-item-date">{selectedArticleDetail.date}</span>
                {selectedArticleDetailLiveBadge && (
                  <span className={`archive-item-live-badge ${selectedArticleDetailLiveBadge}`}>
                    {selectedArticleDetailLiveBadge === "updated" ? "UPDATED" : "NEW"}
                  </span>
                )}
              </div>
            </div>

            <h3 id="archive-article-modal-title" className="archive-article-modal-title">
              {renderHighlightedText(selectedArticleDetail.title, selectedArticleDetailTerms)}
            </h3>

            <p className="archive-article-modal-summary">
              {renderHighlightedText(selectedArticleDetail.summary, selectedArticleDetailTerms)}
            </p>

            <div className="archive-article-modal-body">
              {renderHighlightedText(getDetailBody(selectedArticleDetail), selectedArticleDetailTerms)}
            </div>

            <div className="archive-article-modal-foot">
              <button
                type="button"
                className="mp-btn"
                onClick={() => openItem(selectedArticleDetail)}
                disabled={!selectedArticleDetail?.raw?.url}
              >
                원문 보기
              </button>
              <button type="button" className="mp-btn" onClick={closeArticleDetail}>
                닫기
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedTrend && (
        <div
          className="archive-trend-modal-overlay"
          role="presentation"
          onClick={() => setSelectedTrend(null)}
        >
          <section
            className="archive-trend-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-trend-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="archive-trend-modal-head">
              <div>
                <div className="archive-trend-modal-badges">
                  <span className="archive-side-cat">{selectedTrend.category}</span>
                  <span className="archive-trend-modal-views">{selectedTrend.views} views</span>
                </div>
                <h3 id="archive-trend-modal-title" className="archive-trend-modal-title">
                  {selectedTrend.title}
                </h3>
              </div>
              <button
                type="button"
                className="mp-btn"
                onClick={() => setSelectedTrend(null)}
              >
                닫기
              </button>
            </div>

            <p className="archive-trend-modal-summary">{selectedTrend.detail?.summary}</p>

            {Array.isArray(selectedTrend.detail?.points) && selectedTrend.detail.points.length > 0 && (
              <ul className="archive-trend-modal-points">
                {selectedTrend.detail.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}

            <div className="archive-trend-modal-foot">
              <span>업데이트: {selectedTrend.detail?.updatedAt || "정보 없음"}</span>
              <span>ESC 키로 닫기</span>
            </div>
          </section>
        </div>
      )}

      {keywordToast && (
        <div className="archive-quick-toast" role="status" aria-live="polite">
          {keywordToast}
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
}
