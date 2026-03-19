import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { fetchNews, getNewsById } from "../../api/newsApi";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getArchiveItemKey as getLocalArchiveStorageKey,
  readArchiveItems,
  removeArchiveItem,
  removeArchiveItemsByKeys,
} from "../../utils/archiveStorage";

const tabs = [
  { key: "saved", label: "저장한 기사" },
  { key: "recent", label: "최근 본 기사" },
];

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

function buildSummarySnippet(value, maxLength = 170) {
  const normalized = normalizeSummaryValue(value).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function deriveNewsSummary(raw) {
  const source = raw || {};
  const candidate = [
    source.summary,
    source.short_summary,
    source.ultra_short,
    source.description,
    source.content,
    source.body,
  ]
    .map((value) => buildSummarySnippet(value))
    .find((text) => text && !isPlaceholderSummary(text));
  return candidate || "";
}

function isPlaceholderSummary(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return true;
  return (
    normalized === "기사를 클릭하면 상세 내용을 확인할 수 있습니다." ||
    normalized === "요약 정보가 없습니다."
  );
}

function toTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function buildHighlightChunks(text, terms) {
  const content = String(text || "");
  const normalizedTerms = [
    ...new Set(
      (terms || []).map((term) => String(term || "").trim()).filter(Boolean)
    ),
  ].sort((a, b) => b.length - a.length);

  if (!content || normalizedTerms.length === 0) {
    return [{ text: content, hit: false }];
  }

  const escaped = normalizedTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  return content
    .split(pattern)
    .filter(Boolean)
    .map((part) => {
      const hit = normalizedTerms.some(
        (term) => part.toLowerCase() === term.toLowerCase()
      );
      return { text: part, hit };
    });
}

function renderHighlightedText(text, terms) {
  return buildHighlightChunks(text, terms).map((chunk, index) =>
    chunk.hit ? (
      <mark key={`hl-${index}-${chunk.text}`} className="archive-mark">
        {chunk.text}
      </mark>
    ) : (
      <React.Fragment key={`tx-${index}-${chunk.text}`}>
        {chunk.text}
      </React.Fragment>
    )
  );
}

/**
 * 저장한 기사(DB) 응답 -> UI 아이템 변환
 */
function mapSavedIssueFromServer(row) {
  const raw = row || {};

  const summaryCandidate = [
    raw.summary,
    raw.short_summary,
    raw.ultra_short,
    raw.description,
    raw.content,
    raw.body,
  ]
    .map(normalizeSummaryValue)
    .find((text) => text && !isPlaceholderSummary(text));

  return {
    id: String(raw.issue_summary_id ?? raw.id ?? raw.archive_id ?? ""),
    title: raw.title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.saved_at || raw.published_at || raw.created_at),
    summary:
      summaryCandidate ||
      (raw.url
        ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다."
        : "요약 정보가 없습니다."),
    raw: {
      ...raw,
      source: "server",
      id: raw.issue_summary_id ?? raw.id,
      issueSummaryId: raw.issue_summary_id ?? raw.id,
      issue_summary_id: raw.issue_summary_id ?? raw.id,
      article_id: raw.article_id ?? "",
      url: raw.url || "",
      content:
        raw.content ||
        raw.description ||
        raw.short_summary ||
        raw.ultra_short ||
        "",
      short_summary: raw.short_summary || "",
      ultra_short: raw.ultra_short || "",
      saved_at: raw.saved_at || "",
      published_at: raw.published_at || "",
      created_at: raw.created_at || "",
    },
  };
}

function mapSavedIssueFromLocal(row) {
  const raw = row || {};
  const archiveKey = getLocalArchiveStorageKey(raw);

  const summaryCandidate = [
    raw.summary,
    raw.short_summary,
    raw.ultra_short,
    raw.description,
    raw.content,
    raw.body,
  ]
    .map(normalizeSummaryValue)
    .find((text) => text && !isPlaceholderSummary(text));

  return {
    id: String(raw.id ?? raw.article_id ?? raw.url ?? archiveKey ?? ""),
    title: raw.title || raw.headline || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.saved_at || raw.published_at || raw.created_at),
    summary:
      summaryCandidate ||
      (raw.url
        ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다."
        : "요약 정보가 없습니다."),
    raw: {
      ...raw,
      source: "local",
      archive_key: archiveKey,
      url: raw.url || raw.link || "",
      content:
        raw.content ||
        raw.body ||
        raw.description ||
        raw.short_summary ||
        raw.ultra_short ||
        "",
      summary: raw.summary || "",
      short_summary: raw.short_summary || "",
      ultra_short: raw.ultra_short || "",
      saved_at: raw.saved_at || "",
      created_at: raw.created_at || "",
      published_at: raw.published_at || "",
    },
  };
}

/**
 * 최근 본 기사(DB /user-log/recent) -> UI 아이템 변환
 * 기대 응답 예시:
 * {
 *   article_id,
 *   title,
 *   content,
 *   thumbnail,
 *   category,
 *   url,
 *   published_at,
 *   last_viewed_at
 * }
 */
function mapRecentItemFromServer(row) {
  const raw = row || {};

  const summaryCandidate = [
    raw.summary,
    raw.short_summary,
    raw.ultra_short,
    raw.description,
    raw.content,
  ]
    .map(normalizeSummaryValue)
    .find((text) => text && !isPlaceholderSummary(text));

  return {
    id: String(raw.article_id ?? raw.id ?? raw.url ?? ""),
    title: raw.title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.last_viewed_at || raw.published_at || raw.created_at),
    summary:
      summaryCandidate ||
      (raw.url
        ? "기사를 클릭하면 상세 내용을 확인할 수 있습니다."
        : "요약 정보가 없습니다."),
    raw: {
      ...raw,
      id: raw.article_id ?? raw.id ?? "",
      article_id: raw.article_id ?? raw.id ?? "",
      url: raw.url || "",
      content: raw.content || raw.description || "",
      viewed_at: raw.last_viewed_at || raw.viewed_at || raw.created_at || "",
      published_at: raw.published_at || "",
    },
  };
}

function mapNewsSearchItem(row) {
  const raw = row || {};
  const summaryCandidate = deriveNewsSummary(raw);

  return {
    id: String(raw.article_id ?? raw.id ?? raw.url ?? ""),
    title: raw.title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.published_at || raw.created_at || raw.updated_at),
    summary: summaryCandidate || "",
    raw: {
      ...raw,
      source: "news-search",
      id: raw.article_id ?? raw.id ?? "",
      article_id: raw.article_id ?? raw.id ?? "",
      url: raw.url || "",
      content:
        raw.content ||
        raw.body ||
        raw.description ||
        raw.short_summary ||
        raw.ultra_short ||
        "",
      published_at: raw.published_at || raw.created_at || "",
      created_at: raw.created_at || "",
    },
  };
}

function getSavedItemKey(item) {
  if (item?.raw?.source === "local") {
    const key = String(
      item?.raw?.archive_key || getLocalArchiveStorageKey(item?.raw || item) || ""
    ).trim();
    return key ? `local:${key}` : "";
  }

  const serverId = String(
    item?.raw?.issueSummaryId || item?.raw?.issue_summary_id || item?.id || ""
  ).trim();
  return serverId ? `server:${serverId}` : "";
}

function getRecentItemKey(item) {
  const articleId = String(
    item?.raw?.article_id || item?.raw?.id || item?.id || ""
  ).trim();

  return String(
    articleId ||
    item?.raw?.url ||
    `${String(item?.title || "").trim()}_${String(item?.date || "").trim()}`
  );
}

function getRecentArticleId(item) {
  return String(
    item?.raw?.article_id || item?.raw?.id || item?.id || ""
  ).trim();
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

function normalizeKeywordTerm(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function keywordTermKey(value) {
  return normalizeKeywordTerm(value).toLowerCase();
}

function parseKeywordSource(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseKeywordSource(entry));
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap((entry) => parseKeywordSource(entry));
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    if (
      (text.startsWith("[") && text.endsWith("]")) ||
      (text.startsWith("{") && text.endsWith("}"))
    ) {
      try {
        return parseKeywordSource(JSON.parse(text));
      } catch (_) {
        // fall through and treat as plain text
      }
    }
    return text.split(/[,\n|/#·]+/g);
  }
  return [value];
}

function extractArchiveItemKeywords(item) {
  const raw = item?.raw || {};
  const candidates = [
    raw.keywords,
    raw.keyword,
    raw.tags,
    raw.tag,
    raw.top_keywords,
    raw.topKeywords,
    item?.keywords,
    item?.keyword,
  ];

  const terms = candidates.flatMap((source) => parseKeywordSource(source));

  const deduped = [];
  const seen = new Set();
  terms.forEach((term) => {
    const normalized = normalizeKeywordTerm(term);
    const key = keywordTermKey(normalized);
    if (!normalized || seen.has(key)) return;
    seen.add(key);
    deduped.push(normalized);
  });

  return deduped;
}

function buildKeywordKeySet(itemKeywords) {
  return new Set(
    (Array.isArray(itemKeywords) ? itemKeywords : [])
      .map((word) => keywordTermKey(word))
      .filter(Boolean)
  );
}

function buildArchiveSearchBlob(item, keywords = null) {
  const keywordList = Array.isArray(keywords) ? keywords : extractArchiveItemKeywords(item);
  return [
    item?.title,
    item?.summary,
    item?.category,
    getDetailBody(item),
    ...keywordList,
  ]
    .map((value) => normalizeSummaryValue(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getDisplayItemKeywords(itemKeywords, activeKeywordKeySet, maxCount = 3) {
  const keywords = Array.isArray(itemKeywords) ? itemKeywords : [];
  if (keywords.length === 0) return [];
  if (!(activeKeywordKeySet instanceof Set) || activeKeywordKeySet.size === 0) {
    return keywords.slice(0, maxCount);
  }
  const matched = keywords.filter((word) => activeKeywordKeySet.has(keywordTermKey(word)));
  if (matched.length > 0) return matched.slice(0, maxCount);
  return keywords.slice(0, maxCount);
}

function buildPageNumbers(currentPage, totalPages, maxVisible = 7) {
  const current = Math.max(1, Number(currentPage) || 1);
  const total = Math.max(1, Number(totalPages) || 1);
  const max = Math.max(3, Number(maxVisible) || 7);
  if (total <= max) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const half = Math.floor(max / 2);
  let start = current - half;
  let end = current + half;

  if (start < 1) {
    start = 1;
    end = max;
  } else if (end > total) {
    end = total;
    start = total - max + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

function mergeSavedItems(serverItems, localItems) {
  const mergedByKey = new Map();

  const getDedupeKey = (item) => {
    const urlKey = String(item?.raw?.url || "").trim();
    const fallbackKey = `${String(item?.title || "").trim()}|${String(
      item?.raw?.published_at || item?.raw?.created_at || item?.date || ""
    ).trim()}`;
    return urlKey ? `url:${urlKey}` : `meta:${fallbackKey}`;
  };

  const hasUsefulSummary = (item) => {
    const summary = normalizeSummaryValue(item?.summary);
    return summary && !isPlaceholderSummary(summary);
  };

  const contentLength = (item) =>
    normalizeSummaryValue(item?.raw?.content || item?.summary || "").length;

  const addItem = (item) => {
    const dedupeKey = getDedupeKey(item);
    const current = mergedByKey.get(dedupeKey);
    if (!current) {
      mergedByKey.set(dedupeKey, item);
      return;
    }

    const currentHasSummary = hasUsefulSummary(current);
    const nextHasSummary = hasUsefulSummary(item);

    if (!currentHasSummary && nextHasSummary) {
      mergedByKey.set(dedupeKey, item);
      return;
    }

    if (currentHasSummary === nextHasSummary) {
      const currentScore = contentLength(current);
      const nextScore = contentLength(item);
      if (nextScore > currentScore) {
        mergedByKey.set(dedupeKey, item);
      }
    }
  };

  serverItems.forEach(addItem);
  localItems.forEach(addItem);
  return Array.from(mergedByKey.values());
}

export default function ArchivePage() {
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [customKeywords, setCustomKeywords] = useState([]);
  const [activeKeywordKeys, setActiveKeywordKeys] = useState(new Set());
  const [matchAllKeywords, setMatchAllKeywords] = useState(false);
  const [sort, setSort] = useState("latest");

  const [savedItems, setSavedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);

  const [selectedSavedKeys, setSelectedSavedKeys] = useState(new Set());
  const [selectedRecentKeys, setSelectedRecentKeys] = useState(new Set());

  const [selectedArticleDetail, setSelectedArticleDetail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywordNewsRows, setKeywordNewsRows] = useState([]);
  const [keywordNewsTotal, setKeywordNewsTotal] = useState(0);
  const [keywordNewsLoading, setKeywordNewsLoading] = useState(false);
  const [keywordNewsError, setKeywordNewsError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const confirmActionRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    setSelectedArticleDetail(null);
    setPage(1);
    setError("");
  }, [activeTab]);

  // 저장한 기사(DB)
  useEffect(() => {
    if (activeTab !== "saved") return;

    const loadSavedItems = async () => {
      const localMapped = readArchiveItems().map(mapSavedIssueFromLocal);
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/issue-archives/my", {
          withCredentials: true,
        });

        const serverItems = (Array.isArray(res.data?.items) ? res.data.items : []).map(
          mapSavedIssueFromServer
        );
        setSavedItems(mergeSavedItems(serverItems, localMapped));
      } catch (e) {
        console.error("[issue-archives/my] failed:", e);
        setSavedItems(localMapped);
        if (!localMapped.length) {
          setError(
            e?.response?.data?.message || "저장한 기사를 불러오지 못했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadSavedItems();
  }, [activeTab]);

  // 최근 본 기사(DB)
  useEffect(() => {
    if (activeTab !== "recent") return;

    const loadRecentItems = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/user-log/recent", {
          withCredentials: true,
        });

        const items = Array.isArray(res.data) ? res.data : [];
        setRecentItems(items.map(mapRecentItemFromServer));
      } catch (e) {
        console.error("[/user-log/recent] failed:", e);
        setRecentItems([]);
        setError(
          e?.response?.data?.message || "최근 본 기사를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecentItems();
  }, [activeTab]);

  useEffect(() => {
    const keySet = new Set(savedItems.map(getSavedItemKey).filter(Boolean));
    setSelectedSavedKeys((prev) => {
      if (!prev.size) return prev;
      return new Set([...prev].filter((key) => keySet.has(key)));
    });
  }, [savedItems]);

  useEffect(() => {
    const keySet = new Set(recentItems.map(getRecentItemKey).filter(Boolean));
    setSelectedRecentKeys((prev) => {
      if (!prev.size) return prev;
      return new Set([...prev].filter((key) => keySet.has(key)));
    });
  }, [recentItems]);

  const listItems = activeTab === "saved" ? savedItems : recentItems;

  const normalizedKeywords = useMemo(() => {
    const seen = new Set();
    const next = [];
    customKeywords.forEach((keyword) => {
      const label = normalizeKeywordTerm(keyword);
      const key = keywordTermKey(label);
      if (!label || seen.has(key)) return;
      seen.add(key);
      next.push({ label, key });
    });
    return next;
  }, [customKeywords]);

  useEffect(() => {
    const availableKeySet = new Set(normalizedKeywords.map((entry) => entry.key));
    setActiveKeywordKeys((prev) => {
      if (!prev.size) return prev;
      const next = new Set([...prev].filter((key) => availableKeySet.has(key)));
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [normalizedKeywords]);

  const activeKeywordLabels = useMemo(() => {
    return normalizedKeywords
      .filter((entry) => activeKeywordKeys.has(entry.key))
      .map((entry) => entry.label);
  }, [normalizedKeywords, activeKeywordKeys]);

  const listRows = useMemo(() => {
    return (listItems || []).map((item) => {
      const itemKeywords = extractArchiveItemKeywords(item);
      return {
        item,
        itemKeywords,
        keywordKeySet: buildKeywordKeySet(itemKeywords),
        searchBlob: buildArchiveSearchBlob(item, itemKeywords),
      };
    });
  }, [listItems]);

  const queryLower = useMemo(() => query.trim().toLowerCase(), [query]);
  const liveKeywordTerms = useMemo(() => {
    return [
      ...new Set(
        String(keywordInput || "")
          .split(/\s+/g)
          .map((term) => keywordTermKey(term))
          .filter(Boolean)
      ),
    ];
  }, [keywordInput]);

  const queryMatchedRows = useMemo(() => {
    if (!queryLower) return listRows;
    return listRows.filter((row) => row.searchBlob.includes(queryLower));
  }, [listRows, queryLower]);

  const keywordCountMap = useMemo(() => {
    const countMap = new Map();
    normalizedKeywords.forEach((entry) => {
      countMap.set(entry.key, 0);
    });
    if (!normalizedKeywords.length) return countMap;

    queryMatchedRows.forEach((row) => {
      normalizedKeywords.forEach((entry) => {
        if (!row.keywordKeySet.has(entry.key)) return;
        countMap.set(entry.key, (countMap.get(entry.key) || 0) + 1);
      });
    });
    return countMap;
  }, [normalizedKeywords, queryMatchedRows]);

  const filteredResult = useMemo(() => {
    const hasLiveKeyword = liveKeywordTerms.length > 0;
    const baseRows = listRows.filter((row) => {
      const queryHit = queryLower ? row.searchBlob.includes(queryLower) : false;
      const liveKeywordHit = hasLiveKeyword
        ? liveKeywordTerms.some((term) => row.keywordKeySet.has(term))
        : false;

      if (queryLower && hasLiveKeyword) return queryHit || liveKeywordHit;
      if (queryLower) return queryHit;
      if (hasLiveKeyword) return liveKeywordHit;
      return true;
    });

    const activeKeywordTerms = normalizedKeywords
      .filter((entry) => activeKeywordKeys.has(entry.key))
      .map((entry) => entry.key);
    const chipTerms = hasLiveKeyword ? [] : activeKeywordTerms;

    const rows = baseRows.filter((row) => {
      if (chipTerms.length === 0) return true;
      const hitCount = chipTerms.filter((term) =>
        row.keywordKeySet.has(term)
      ).length;
      return matchAllKeywords ? hitCount === chipTerms.length : hitCount > 0;
    });

    const getSortValue = (item) =>
      toTimestamp(
        item?.raw?.saved_at ||
          item?.raw?.viewed_at ||
          item?.raw?.last_viewed_at ||
          item?.raw?.published_at ||
          item?.raw?.created_at ||
          item?.date
      );

    const sortedRows =
      sort === "oldest"
        ? [...rows].sort((a, b) => getSortValue(a.item) - getSortValue(b.item))
        : [...rows].sort((a, b) => getSortValue(b.item) - getSortValue(a.item));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      rows: sortedRows.slice(start, end),
      total: sortedRows.length,
    };
  }, [
    listRows,
    queryLower,
    normalizedKeywords,
    activeKeywordKeys,
    liveKeywordTerms,
    matchAllKeywords,
    sort,
    page,
    pageSize,
  ]);

  const filtered = filteredResult.rows;
  const archiveTotalPages = Math.max(1, Math.ceil(filteredResult.total / pageSize));

  const keywordQueryText = useMemo(() => {
    const liveText = normalizeKeywordTerm(keywordInput);
    if (liveText) return liveText;
    return activeKeywordLabels.join(" ").trim();
  }, [keywordInput, activeKeywordLabels]);
  const useKeywordNewsFallback = false;

  useEffect(() => {
    if (!useKeywordNewsFallback || !keywordQueryText || filteredResult.total > 0) {
      setKeywordNewsRows([]);
      setKeywordNewsTotal(0);
      setKeywordNewsError("");
      setKeywordNewsLoading(false);
      return;
    }

    let cancelled = false;

    const loadKeywordNews = async () => {
      try {
        setKeywordNewsLoading(true);
        setKeywordNewsError("");

        const response = await fetchNews({
          page,
          size: pageSize,
          q: keywordQueryText,
          includeTotal: true,
        });
        const items = Array.isArray(response?.data?.items) ? response.data.items : [];
        const totalRaw = Number(response?.data?.total);

        const deduped = [];
        const seen = new Set();
        items.forEach((entry) => {
          const item = mapNewsSearchItem(entry);
          const key = String(item?.raw?.article_id || item?.id || item?.raw?.url || "").trim();
          if (!key || seen.has(key)) return;
          seen.add(key);
          deduped.push(item);
        });

        const missingSummaryTargets = deduped.filter(
          (item) => !normalizeSummaryValue(item?.summary)
        );
        let detailSummaryMap = new Map();

        if (missingSummaryTargets.length > 0) {
          const detailResults = await Promise.all(
            missingSummaryTargets.map(async (item) => {
              const articleId = String(item?.raw?.article_id || item?.id || "").trim();
              if (!articleId || !/^\d+$/.test(articleId)) return null;
              try {
                const detailResponse = await getNewsById(articleId);
                const detail = detailResponse?.data || {};
                const summary = deriveNewsSummary(detail);
                const content = buildSummarySnippet(
                  detail?.content || detail?.body || detail?.description || "",
                  240
                );
                if (!summary && !content) return null;
                return { articleId, summary, content };
              } catch (_) {
                return null;
              }
            })
          );

          detailSummaryMap = new Map(
            detailResults.filter(Boolean).map((entry) => [entry.articleId, entry])
          );
        }

        const normalizedItems = deduped.map((item) => {
          const articleId = String(item?.raw?.article_id || item?.id || "").trim();
          const detailHit = detailSummaryMap.get(articleId);
          const summary =
            detailHit?.summary ||
            item.summary ||
            buildSummarySnippet(item?.raw?.content || item?.raw?.description || "") ||
            "요약 정보가 없습니다.";
          return {
            ...item,
            summary,
            raw: {
              ...item.raw,
              content: detailHit?.content || item?.raw?.content || "",
            },
          };
        });

        const rows = normalizedItems.map((item) => {
          const itemKeywords = extractArchiveItemKeywords(item);
          return {
            item,
            itemKeywords,
            keywordKeySet: buildKeywordKeySet(itemKeywords),
            searchBlob: buildArchiveSearchBlob(item, itemKeywords),
          };
        });

        if (!cancelled) {
          setKeywordNewsRows(rows);
          setKeywordNewsTotal(
            Number.isFinite(totalRaw) && totalRaw > 0
              ? totalRaw
              : (page - 1) * pageSize + rows.length
          );
        }
      } catch (e) {
        if (!cancelled) {
          setKeywordNewsRows([]);
          setKeywordNewsTotal(0);
          setKeywordNewsError(
            e?.response?.data?.message || "키워드 기사 검색 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) setKeywordNewsLoading(false);
      }
    };

    loadKeywordNews();
    return () => {
      cancelled = true;
    };
  }, [keywordQueryText, filteredResult.total, page, pageSize, useKeywordNewsFallback]);

  useEffect(() => {
    if (useKeywordNewsFallback && keywordQueryText && filteredResult.total === 0) return;
    if (page > archiveTotalPages) {
      setPage(archiveTotalPages);
    }
  }, [page, archiveTotalPages, keywordQueryText, filteredResult.total, useKeywordNewsFallback]);

  const openArticleDetail = (item) => {
    if (!item) return;
    setSelectedArticleDetail(item);
  };

  const closeArticleDetail = () => {
    setSelectedArticleDetail(null);
  };

  const openItem = (item) => {
    const url = item?.raw?.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddKeyword = (event) => {
    event.preventDefault();
    const term = normalizeKeywordTerm(keywordInput);
    const key = keywordTermKey(term);
    if (!term || !key) return;

    setCustomKeywords((prev) => {
      if (prev.some((keyword) => keywordTermKey(keyword) === key)) return prev;
      return [...prev, term];
    });
    setActiveKeywordKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setKeywordInput("");
    setPage(1);
  };

  const toggleKeywordFilter = (keyword) => {
    const key = keywordTermKey(keyword);
    if (!key) return;
    setActiveKeywordKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPage(1);
  };

  const removeKeywordFilter = (keyword) => {
    const key = keywordTermKey(keyword);
    if (!key) return;
    setCustomKeywords((prev) => prev.filter((entry) => keywordTermKey(entry) !== key));
    setActiveKeywordKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setPage(1);
  };

  const toggleSavedSelection = (item) => {
    const key = getSavedItemKey(item);
    if (!key) return;

    setSelectedSavedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleRecentSelection = (item) => {
    const key = getRecentItemKey(item);
    if (!key) return;

    setSelectedRecentKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleRemoveSaved = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const savedKey = getSavedItemKey(item);
    if (!savedKey) return;
    const isLocal = savedKey.startsWith("local:");

    try {
      if (isLocal) {
        removeArchiveItem(item?.raw || item);
      } else {
        const issueSummaryId = savedKey.replace(/^server:/, "").trim();
        if (!issueSummaryId) return;
        await axios.delete(`/issue-archives/${encodeURIComponent(issueSummaryId)}`, {
          withCredentials: true,
        });
      }

      setSavedItems((prev) =>
        prev.filter((savedItem) => getSavedItemKey(savedItem) !== savedKey)
      );

      setSelectedSavedKeys((prev) => {
        const next = new Set(prev);
        next.delete(savedKey);
        return next;
      });
    } catch (e) {
      console.error("[handleRemoveSaved] failed:", e);
      setError(e?.response?.data?.message || "저장 해제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteSelectedSaved = () => {
    if (selectedSavedKeys.size === 0) return;

    const selectedKeys = [...selectedSavedKeys]
      .map((key) => String(key || "").trim())
      .filter(Boolean);
    const selectedKeySet = new Set(selectedKeys);
    const serverIds = selectedKeys
      .filter((key) => key.startsWith("server:"))
      .map((key) => key.replace(/^server:/, "").trim())
      .filter(Boolean);
    const localArchiveKeys = selectedKeys
      .filter((key) => key.startsWith("local:"))
      .map((key) => key.replace(/^local:/, "").trim())
      .filter(Boolean);

    const count = selectedKeys.length;

    confirmActionRef.current = async () => {
      try {
        if (serverIds.length) {
          await Promise.all(
            serverIds.map((issueSummaryId) =>
              axios.delete(`/issue-archives/${encodeURIComponent(issueSummaryId)}`, {
                withCredentials: true,
              })
            )
          );
        }
        if (localArchiveKeys.length) {
          removeArchiveItemsByKeys(localArchiveKeys);
        }

        setSavedItems((prev) =>
          prev.filter((item) => !selectedKeySet.has(getSavedItemKey(item)))
        );
        setSelectedSavedKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleDeleteSelectedSaved] failed:", e);
        setError(e?.response?.data?.message || "선택 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({
      open: true,
      message: `선택한 기사 ${count}개를 삭제할까요?`,
    });
  };

  const handleClearSaved = () => {
    if (savedItems.length === 0) return;

    confirmActionRef.current = async () => {
      try {
        const serverIds = [];
        const localArchiveKeys = [];

        savedItems.forEach((item) => {
          const key = getSavedItemKey(item);
          if (!key) return;
          if (key.startsWith("server:")) {
            const issueSummaryId = key.replace(/^server:/, "").trim();
            if (issueSummaryId) serverIds.push(issueSummaryId);
            return;
          }
          if (key.startsWith("local:")) {
            const archiveKey = key.replace(/^local:/, "").trim();
            if (archiveKey) localArchiveKeys.push(archiveKey);
          }
        });

        if (serverIds.length) {
          await Promise.all(
            serverIds.map((issueSummaryId) =>
              axios.delete(`/issue-archives/${encodeURIComponent(issueSummaryId)}`, {
                withCredentials: true,
              })
            )
          );
        }
        if (localArchiveKeys.length) {
          removeArchiveItemsByKeys(localArchiveKeys);
        }

        setSavedItems([]);
        setSelectedSavedKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleClearSaved] failed:", e);
        setError(e?.response?.data?.message || "전체 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({
      open: true,
      message: "저장한 기사 전체를 삭제할까요?",
    });
  };

  // 최근 본 기사 삭제
  const handleRemoveRecent = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const articleId = getRecentArticleId(item);
    if (!articleId || !/^\d+$/.test(articleId)) {
      setError("삭제할 최근 기사 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      await axios.delete(`/user-log/recent/${encodeURIComponent(articleId)}`, {
        withCredentials: true,
      });

      setRecentItems((prev) =>
        prev.filter((recentItem) => getRecentArticleId(recentItem) !== articleId)
      );

      setSelectedRecentKeys((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    } catch (e) {
      console.error("[handleRemoveRecent] failed:", e);
      setError(e?.response?.data?.message || "최근 본 기사 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteSelectedRecent = () => {
    if (selectedRecentKeys.size === 0) return;

    const targetIds = [...selectedRecentKeys]
      .map((id) => String(id || "").trim())
      .filter((id) => /^\d+$/.test(id));

    if (targetIds.length === 0) {
      setError("삭제할 최근 기사 ID를 찾을 수 없습니다.");
      return;
    }

    const count = targetIds.length;

    confirmActionRef.current = async () => {
      try {
        await Promise.all(
          targetIds.map((articleId) =>
            axios.delete(`/user-log/recent/${encodeURIComponent(articleId)}`, {
              withCredentials: true,
            })
          )
        );

        const targetSet = new Set(targetIds);
        setRecentItems((prev) =>
          prev.filter((item) => !targetSet.has(getRecentArticleId(item)))
        );
        setSelectedRecentKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleDeleteSelectedRecent] failed:", e);
        setError(e?.response?.data?.message || "최근 본 기사 선택 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({
      open: true,
      message: `선택한 기사 ${count}개를 삭제할까요?`,
    });
  };

  const handleClearRecent = () => {
    if (recentItems.length === 0) return;

    confirmActionRef.current = async () => {
      try {
        await axios.delete("/user-log/recent", {
          withCredentials: true,
        });

        setRecentItems([]);
        setSelectedRecentKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleClearRecent] failed:", e);
        setError(e?.response?.data?.message || "최근 본 기사 전체 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({
      open: true,
      message: "최근 본 기사 전체를 삭제할까요?",
    });
  };

  const closeConfirmModal = () => {
    confirmActionRef.current = null;
    setConfirmModal({ open: false, message: "" });
  };

  const handleConfirmModal = async () => {
    const action = confirmActionRef.current;
    closeConfirmModal();
    if (action) await action();
  };

  useEffect(() => {
    if (!selectedArticleDetail) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedArticleDetail(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedArticleDetail]);

  const highlightTerms = useMemo(() => {
    return [
      ...new Set(
        [query, keywordInput, ...activeKeywordLabels]
          .map((term) => String(term || "").trim())
          .filter(Boolean)
      ),
    ];
  }, [query, keywordInput, activeKeywordLabels]);

  const renderArchiveCard = ({
    item,
    itemKeywords = [],
    selectable = false,
    itemKey = "",
    isSelected = false,
    onToggleSelect = null,
    onRemove = null,
    removeAriaLabel = "",
    hideRemove = false,
  }) => {
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
        key={`${activeTab}-${item.id}`}
        className="archive-item archive-item-compact"
        role="button"
        tabIndex={0}
        onClick={handleOpenDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            openArticleDetail(item);
          }
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
            {!hideRemove && onRemove && (
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

        <div className="archive-item-title clamp-2">
          {renderHighlightedText(item.title, highlightTerms)}
        </div>

        <div className="archive-item-summary clamp-3">
          {renderHighlightedText(item.summary, highlightTerms)}
        </div>

        <div className="archive-item-foot">
          {itemKeywords.length > 0 ? (
            <div className="archive-item-keywords">
              {itemKeywords.map((keyword) => (
                <span
                  key={`${itemKey || item.id}-kw-${keyword}`}
                  className="archive-item-keyword-chip"
                >
                  {renderHighlightedText(keyword, highlightTerms)}
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

  const selectedArticleDetailTerms = useMemo(() => {
    if (!selectedArticleDetail) return [];
    return [
      ...new Set(
        [query, keywordInput, ...activeKeywordLabels]
          .map((term) => String(term || "").trim())
          .filter(Boolean)
      ),
    ];
  }, [selectedArticleDetail, query, keywordInput, activeKeywordLabels]);

  const isKeywordFallbackMode =
    useKeywordNewsFallback &&
    !loading && !error && filtered.length === 0 && Boolean(keywordQueryText);
  const showKeywordNewsFallback = isKeywordFallbackMode && keywordNewsRows.length > 0;
  const displayRows = showKeywordNewsFallback ? keywordNewsRows : filtered;
  const fallbackTotalPages = Math.max(1, Math.ceil(keywordNewsTotal / pageSize));
  const totalPages = isKeywordFallbackMode ? fallbackTotalPages : archiveTotalPages;
  const visiblePageNumbers = useMemo(
    () => buildPageNumbers(page, totalPages, 7),
    [page, totalPages]
  );

  useEffect(() => {
    if (!isKeywordFallbackMode) return;
    if (page > fallbackTotalPages) {
      setPage(fallbackTotalPages);
    }
  }, [isKeywordFallbackMode, page, fallbackTotalPages]);

  return (
    <div className="page archive-page">
      <div className="login-head">
        <div className="pageTitle">아카이브</div>
        <div className="pageDesc">저장한 기사 / 최근 본 기사</div>
      </div>

      <div className="archive-layout">
        <section className="archive-main">
          <div className="archive-tabs">
            <div className="archive-tab-group">
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

            <div className="archive-keywords-wrap archive-keywords-inline">
              <form className="archive-keyword-form" onSubmit={handleAddKeyword}>
                <input
                  type="text"
                  className="archive-keyword-input"
                  placeholder="키워드 검색 (입력 즉시 적용)"
                  value={keywordInput}
                  onChange={(event) => {
                    setKeywordInput(event.target.value);
                    setPage(1);
                  }}
                />
                <button
                  type="submit"
                  className="archive-keyword-add"
                  disabled={!normalizeKeywordTerm(keywordInput)}
                >
                  키워드 추가
                </button>
              </form>

              <div className="archive-keyword-controls">
                <label className="archive-match-toggle">
                  <input
                    type="checkbox"
                    checked={matchAllKeywords}
                    onChange={(event) => {
                      setMatchAllKeywords(event.target.checked);
                      setPage(1);
                    }}
                    disabled={activeKeywordKeys.size <= 1}
                  />
                  모든 키워드 일치
                </label>
                <span className="archive-match-meta">
                  활성 {activeKeywordKeys.size} / 등록 {normalizedKeywords.length}
                </span>
              </div>

              {normalizedKeywords.length > 0 && (
                <div className="archive-keyword-list is-animated">
                  <div className="archive-keywords">
                    {normalizedKeywords.map((entry) => (
                      <div className="archive-keyword-item" key={`kw-${entry.key}`}>
                        <button
                          type="button"
                          className={`archive-keyword ${
                            activeKeywordKeys.has(entry.key) ? "active" : ""
                          }`}
                          onClick={() => toggleKeywordFilter(entry.label)}
                        >
                          <span className="archive-keyword-label">{entry.label}</span>
                          <span className="archive-keyword-count">
                            {keywordCountMap.get(entry.key) || 0}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="archive-keyword-remove"
                          onClick={() => removeKeywordFilter(entry.label)}
                          aria-label={`${entry.label} remove`}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                <>
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
                </>
              )}

              {activeTab === "recent" && (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="archive-list">
            {loading && <div className="archive-empty">불러오는 중...</div>}

            {error && !loading && (
              <div className="archive-empty" style={{ color: "crimson" }}>
                {error}
              </div>
            )}

            {!loading && !error && keywordNewsLoading && (
              <div className="archive-empty">키워드 기사 검색 중...</div>
            )}

            {!loading && !error && !keywordNewsLoading && keywordNewsError && (
              <div className="archive-empty" style={{ color: "crimson" }}>
                {keywordNewsError}
              </div>
            )}

            {showKeywordNewsFallback && (
              <div className="archive-empty">
                아카이브에서 찾지 못해 전체 기사 검색 결과를 표시합니다.
              </div>
            )}

            {!loading &&
              !error &&
              isKeywordFallbackMode &&
              !keywordNewsLoading &&
              !keywordNewsError &&
              keywordNewsRows.length === 0 && (
                <div className="archive-empty">키워드에 맞는 기사가 없습니다.</div>
              )}

            {!loading &&
              !error &&
              displayRows.map((row) => {
                const item = row.item;
                const itemKey =
                  activeTab === "saved"
                    ? getSavedItemKey(item)
                    : getRecentItemKey(item);
                const itemKeywords = getDisplayItemKeywords(
                  row.itemKeywords,
                  activeKeywordKeys
                );

                const isSelected =
                  activeTab === "saved"
                    ? selectedSavedKeys.has(itemKey)
                    : selectedRecentKeys.has(itemKey);

                const toggleSelection =
                  activeTab === "saved"
                    ? toggleSavedSelection
                    : toggleRecentSelection;

                const removeHandler =
                  activeTab === "saved"
                    ? handleRemoveSaved
                    : handleRemoveRecent;

                const removeAria =
                  activeTab === "saved"
                    ? "remove saved issue"
                    : "remove recent article";

                return renderArchiveCard({
                  item,
                  itemKeywords,
                  selectable: !showKeywordNewsFallback,
                  itemKey,
                  isSelected,
                  onToggleSelect: showKeywordNewsFallback ? null : toggleSelection,
                  onRemove: showKeywordNewsFallback ? null : removeHandler,
                  removeAriaLabel: removeAria,
                  hideRemove: true,
                });
              })}

            {!loading &&
              !error &&
              !keywordNewsLoading &&
              !isKeywordFallbackMode &&
              !showKeywordNewsFallback &&
              filtered.length === 0 && (
              <div className="archive-empty">
                {activeTab === "saved"
                  ? "저장한 기사가 없습니다."
                  : "최근 본 기사가 없습니다."}
              </div>
            )}

            {totalPages > 1 && (
              <div className="archive-pagination">
              <button
                type="button"
                className="archive-page-btn"
                disabled={page <= 1 || loading || keywordNewsLoading}
                onClick={() => setPage(1)}
              >
                {"<<"}
              </button>

              <button
                type="button"
                className="archive-page-btn"
                disabled={page <= 1 || loading || keywordNewsLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {"<"}
              </button>

                            {visiblePageNumbers.map((pageNo) => (
                <button
                  key={"archive-page-" + pageNo}
                  type="button"
                  className={pageNo === page ? "archive-page-btn active" : "archive-page-btn"}
                  disabled={loading || keywordNewsLoading}
                  onClick={() => setPage(pageNo)}
                >
                  {pageNo}
                </button>
              ))}

              <button
                type="button"
                className="archive-page-btn"
                disabled={loading || keywordNewsLoading || page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                {">"}
              </button>

              <button
                type="button"
                className="archive-page-btn"
                disabled={loading || keywordNewsLoading || page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                {">>"}
              </button>
              </div>
            )}
          </div>
        </section>

        <aside className="archive-aside">
          <SideMenuCard collapsible showScrollTop />
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
                <span className="archive-item-cat">
                  {selectedArticleDetail.category}
                </span>
              </div>

              <div className="archive-item-actions">
                <span className="archive-item-date">
                  {selectedArticleDetail.date}
                </span>
              </div>
            </div>

            <h3
              id="archive-article-modal-title"
              className="archive-article-modal-title"
            >
              {renderHighlightedText(
                selectedArticleDetail.title,
                selectedArticleDetailTerms
              )}
            </h3>

            <p className="archive-article-modal-summary">
              {renderHighlightedText(
                selectedArticleDetail.summary,
                selectedArticleDetailTerms
              )}
            </p>

            <div className="archive-article-modal-body">
              {renderHighlightedText(
                getDetailBody(selectedArticleDetail),
                selectedArticleDetailTerms
              )}
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

              <button
                type="button"
                className="mp-btn"
                onClick={closeArticleDetail}
              >
                닫기
              </button>
            </div>
          </section>
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



