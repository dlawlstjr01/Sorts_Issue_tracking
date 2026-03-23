import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";

const tabs = [
  { key: "saved", label: "저장한 기사" },
  { key: "recent", label: "최근 본 기사" },
];
const PAGINATION_GROUP_SIZE = 10;

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeSummaryValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join(" ");
  }
  return String(value || "").trim();
}

function normalizeDetailValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return String(value || "").replace(/\r/g, "").trim();
}

function normalizeCompactText(value) {
  return normalizeDetailValue(value).replace(/\s+/g, " ").trim();
}

function splitReadableBlocks(value) {
  const text = normalizeDetailValue(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+-\s+/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return [];

  const splitLongBlock = (block) => {
    const normalized = String(block || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    if (normalized.length <= 150) return [normalized];

    const sentences =
      normalized
        .match(/[^.!?。！？…]+(?:[.!?。！？…]+["'”’)\]]*|$)/g)
        ?.map((item) => item.trim())
        .filter(Boolean) || [normalized];

    if (sentences.length <= 1) return [normalized];

    const chunks = [];
    let current = "";

    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length > 150 && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = next;
      }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  const blocks = [];
  const seen = new Set();

  text
    .split(/\n{2,}|\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap(splitLongBlock)
    .forEach((block) => {
      const normalized = String(block || "").replace(/\s+/g, " ").trim();
      if (!normalized || normalized.length < 6) return;

      const key = normalized.toLowerCase();
      if (seen.has(key)) return;

      seen.add(key);
      blocks.push(normalized);
    });

  return blocks;
}

function normalizeKeywordArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  const text = String(value || "").trim();
  if (!text) return [];

  return text
    .replace(/^\[|\]$/g, "")
    .split(/[#,|/·•\n\r\t]+|,\s*/)
    .map((item) => String(item || "").replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

function isPlaceholderSummary(text) {
  const normalized = String(text || "").trim();
  return (
    !normalized ||
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
  const normalizedTerms = [...new Set((terms || []).map((term) => String(term || "").trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length
  );

  if (!content || normalizedTerms.length === 0) return [{ text: content, hit: false }];

  const escaped = normalizedTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  return content
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      hit: normalizedTerms.some((term) => part.toLowerCase() === term.toLowerCase()),
    }));
}

function renderHighlightedText(text, terms) {
  return buildHighlightChunks(text, terms).map((chunk, index) =>
    chunk.hit ? (
      <mark key={`hl-${index}-${chunk.text}`} className="archive-mark">
        {chunk.text}
      </mark>
    ) : (
      <React.Fragment key={`tx-${index}-${chunk.text}`}>{chunk.text}</React.Fragment>
    )
  );
}

function pickSummary(raw) {
  const summary = [raw?.summary, raw?.short_summary, raw?.ultra_short, raw?.description]
    .map(normalizeSummaryValue)
    .find((text) => text && !isPlaceholderSummary(text));

  return summary || "요약 정보가 없습니다.";
}

function buildRawData(raw, overrides = {}) {
  return {
    ...raw,
    id: raw.id ?? "",
    issueSummaryId: raw.issueSummaryId ?? raw.issue_summary_id ?? "",
    issue_summary_id: raw.issue_summary_id ?? raw.issueSummaryId ?? "",
    article_id: raw.article_id ?? raw.article_pk ?? raw.id ?? "",
    url: raw.url || "",
    content: raw.content || "",
    body: raw.body || raw.content || "",
    summary: raw.summary || "",
    short_summary: raw.short_summary || "",
    ultra_short: raw.ultra_short || "",
    description: raw.description || "",
    background: raw.background || "",
    thumbnail: raw.thumbnail || "",
    keywords: raw.keywords || "",
    saved_at: raw.saved_at || "",
    viewed_at: raw.viewed_at || "",
    last_viewed_at: raw.last_viewed_at || "",
    published_at: raw.published_at || "",
    created_at: raw.created_at || "",
    ...overrides,
  };
}

function mapSavedIssueFromServer(row) {
  const raw = row || {};
  const issueSummaryId = raw.issue_summary_id ?? raw.issue_summary_pk ?? "";
  const archiveId = raw.archive_id ?? "";
  const articleId = raw.article_id ?? raw.article_pk ?? "";

  return {
    id: String(issueSummaryId || archiveId || ""),
    title: raw.title || raw.article_title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.saved_at || raw.published_at || raw.issue_created_at || raw.article_created_at),
    summary: pickSummary(raw),
    keywords: normalizeKeywordArray(raw.keywords),
    raw: buildRawData(raw, {
      id: issueSummaryId || archiveId || "",
      issueSummaryId,
      issue_summary_id: issueSummaryId,
      article_id: articleId,
      viewed_at: raw.viewed_at || raw.saved_at || "",
      created_at: raw.issue_created_at || raw.article_created_at || raw.created_at || "",
    }),
  };
}

function mapRecentItemFromServer(row) {
  const raw = row || {};
  const articleId = raw.article_id ?? raw.id ?? "";

  return {
    id: String(articleId || raw.url || ""),
    title: raw.title || raw.article_title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.last_viewed_at || raw.viewed_at || raw.published_at || raw.created_at),
    summary: pickSummary(raw),
    keywords: normalizeKeywordArray(raw.keywords),
    raw: buildRawData(raw, {
      id: articleId,
      article_id: articleId,
      viewed_at: raw.last_viewed_at || raw.viewed_at || raw.created_at || "",
      created_at: raw.created_at || "",
    }),
  };
}

function getSavedItemKey(item) {
  return String(item?.raw?.issueSummaryId || item?.raw?.issue_summary_id || item?.id || "");
}

function getRecentItemKey(item) {
  return String(
    item?.id ||
      item?.raw?.id ||
      item?.raw?.article_id ||
      item?.raw?.url ||
      `${String(item?.title || "").trim()}_${String(item?.date || "").trim()}`
  );
}

function getRecentArticleId(item) {
  return String(item?.raw?.article_id || item?.raw?.id || item?.id || "").trim();
}

export default function ArchivePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState("saved");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [savedItems, setSavedItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [selectedSavedKeys, setSelectedSavedKeys] = useState(new Set());
  const [selectedRecentKeys, setSelectedRecentKeys] = useState(new Set());
  const [selectedArticleDetail, setSelectedArticleDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });

  const confirmActionRef = useRef(null);
  const selectAllCheckboxRef = useRef(null);
  const pageSize = 10;

  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { y: -2, scale: 1.03 },
        whileTap: { y: 0, scale: 0.98 },
        transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.55 },
      };

  useEffect(() => {
    setSelectedArticleDetail(null);
    setPage(1);
    setError("");
  }, [activeTab]);

  useEffect(() => {
    const loadItems = async () => {
      const isSaved = activeTab === "saved";
      const url = isSaved ? "/issue-archives/my" : "/user-log/recent";
      const mapper = isSaved ? mapSavedIssueFromServer : mapRecentItemFromServer;
      const setter = isSaved ? setSavedItems : setRecentItems;
      const emptyMessage = isSaved
        ? "저장한 기사를 불러오지 못했습니다."
        : "최근 본 기사를 불러오지 못했습니다.";

      try {
        setLoading(true);
        setError("");

        const res = await axios.get(url, { withCredentials: true });
        const items = isSaved
          ? Array.isArray(res.data?.items)
            ? res.data.items
            : []
          : Array.isArray(res.data)
          ? res.data
          : [];

        setter(items.map(mapper));
      } catch (e) {
        console.error(`[${url}] failed:`, e);
        setter([]);
        setError(e?.response?.data?.message || emptyMessage);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [activeTab]);

  useEffect(() => {
    const keySet = new Set(savedItems.map(getSavedItemKey).filter(Boolean));
    setSelectedSavedKeys((prev) => (!prev.size ? prev : new Set([...prev].filter((key) => keySet.has(key)))));
  }, [savedItems]);

  useEffect(() => {
    const keySet = new Set(recentItems.map(getRecentItemKey).filter(Boolean));
    setSelectedRecentKeys((prev) => (!prev.size ? prev : new Set([...prev].filter((key) => keySet.has(key)))));
  }, [recentItems]);

  useEffect(() => {
    if (!selectedArticleDetail) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedArticleDetail(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedArticleDetail]);

  const listItems = activeTab === "saved" ? savedItems : recentItems;

  const filteredResult = useMemo(() => {
    const q = query.trim().toLowerCase();

    const items = listItems.filter((item) => {
      if (!q) return true;
      const keywordText = Array.isArray(item?.keywords)
        ? item.keywords.join(" ").toLowerCase()
        : String(item?.keywords || "").toLowerCase();
      const titleText = String(item?.title || "").toLowerCase();
      return keywordText.includes(q) || titleText.includes(q);
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

    const sorted =
      sort === "oldest"
        ? [...items].sort((a, b) => getSortValue(a) - getSortValue(b))
        : [...items].sort((a, b) => getSortValue(b) - getSortValue(a));

    const start = (page - 1) * pageSize;

    return {
      items: sorted.slice(start, start + pageSize),
      total: sorted.length,
    };
  }, [listItems, query, sort, page]);

  const filtered = filteredResult.items;
  const totalPages = Math.max(1, Math.ceil(filteredResult.total / pageSize));
  const visiblePages = useMemo(() => {
    const pages = [];
    const groupStart =
      Math.floor((Math.max(1, page) - 1) / PAGINATION_GROUP_SIZE) * PAGINATION_GROUP_SIZE + 1;
    const groupEnd = Math.min(totalPages, groupStart + PAGINATION_GROUP_SIZE - 1);

    for (let i = groupStart; i <= groupEnd; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);
  const visibleSelectableKeys = useMemo(
    () =>
      filtered
        .map((item) => (activeTab === "saved" ? getSavedItemKey(item) : getRecentItemKey(item)))
        .filter(Boolean),
    [activeTab, filtered]
  );
  const visibleSelectedCount = useMemo(() => {
    const selectedSet = activeTab === "saved" ? selectedSavedKeys : selectedRecentKeys;
    return visibleSelectableKeys.reduce(
      (count, key) => (selectedSet.has(key) ? count + 1 : count),
      0
    );
  }, [activeTab, selectedSavedKeys, selectedRecentKeys, visibleSelectableKeys]);
  const isAllVisibleSelected =
    visibleSelectableKeys.length > 0 &&
    visibleSelectedCount === visibleSelectableKeys.length;
  const isPartiallyVisibleSelected =
    visibleSelectedCount > 0 && visibleSelectedCount < visibleSelectableKeys.length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isPartiallyVisibleSelected;
    }
  }, [isPartiallyVisibleSelected]);

  const highlightTerms = useMemo(
    () => [...new Set([query].map((term) => String(term || "").trim()).filter(Boolean))],
    [query]
  );

  const selectedArticleDetailTerms = useMemo(() => {
    if (!selectedArticleDetail) return [];
    return [...new Set([query].map((term) => String(term || "").trim()).filter(Boolean))];
  }, [selectedArticleDetail, query]);
  const selectedArticleSummaryBlocks = useMemo(
    () => splitReadableBlocks(selectedArticleDetail?.summary).slice(0, 5),
    [selectedArticleDetail?.summary]
  );
  const selectedArticleBodyText = useMemo(
    () =>
      normalizeDetailValue(
        selectedArticleDetail?.raw?.content ||
          selectedArticleDetail?.raw?.body ||
          selectedArticleDetail?.raw?.description
      ),
    [
      selectedArticleDetail?.raw?.content,
      selectedArticleDetail?.raw?.body,
      selectedArticleDetail?.raw?.description,
    ]
  );
  const selectedArticleBodyBlocks = useMemo(() => {
    if (!selectedArticleBodyText) return [];

    const summaryCompact = normalizeCompactText(selectedArticleDetail?.summary);
    if (summaryCompact && normalizeCompactText(selectedArticleBodyText) === summaryCompact) {
      return [];
    }

    return splitReadableBlocks(selectedArticleBodyText).slice(0, 8);
  }, [selectedArticleBodyText, selectedArticleDetail?.summary]);
  const archiveDetailEstimatedReadMinutes = useMemo(() => {
    const characters = [...selectedArticleSummaryBlocks, ...selectedArticleBodyBlocks]
      .join("")
      .replace(/\s+/g, "").length;
    return Math.max(1, Math.round(characters / 650));
  }, [selectedArticleSummaryBlocks, selectedArticleBodyBlocks]);

  const openArticleDetail = (item) => {
    if (item) setSelectedArticleDetail(item);
  };

  const closeArticleDetail = () => {
    setSelectedArticleDetail(null);
  };

  const handlePageChange = (targetPage) => {
    setPage(Math.max(1, Math.min(totalPages, targetPage)));
  };

  const openItem = (item) => {
    const articleId = item?.raw?.article_id;
    if (!articleId) {
      setError("기사 상세 페이지로 이동할 article_id가 없습니다.");
      return;
    }
    closeArticleDetail();
    navigate(`/?view=article&id=${articleId}`);
  };

  const toggleSavedSelection = (item) => {
    const key = getSavedItemKey(item);
    if (!key) return;

    setSelectedSavedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleRecentSelection = (item) => {
    const key = getRecentItemKey(item);
    if (!key) return;

    setSelectedRecentKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleVisibleSelection = () => {
    if (!visibleSelectableKeys.length) return;

    const applyToggle = (prev) => {
      const next = new Set(prev);
      const shouldUnselectAll = visibleSelectableKeys.every((key) => next.has(key));

      if (shouldUnselectAll) {
        visibleSelectableKeys.forEach((key) => next.delete(key));
      } else {
        visibleSelectableKeys.forEach((key) => next.add(key));
      }

      return next;
    };

    if (activeTab === "saved") {
      setSelectedSavedKeys(applyToggle);
      return;
    }

    setSelectedRecentKeys(applyToggle);
  };

  const handleRemoveSaved = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const issueSummaryId = item?.raw?.issueSummaryId || item?.raw?.issue_summary_id || item?.id;
    if (!issueSummaryId) return;

    try {
      await axios.delete(`/issue-archives/${issueSummaryId}`, { withCredentials: true });

      setSavedItems((prev) =>
        prev.filter(
          (savedItem) =>
            String(savedItem?.raw?.issueSummaryId || savedItem?.raw?.issue_summary_id || savedItem?.id) !==
            String(issueSummaryId)
        )
      );

      setSelectedSavedKeys((prev) => {
        const next = new Set(prev);
        next.delete(String(issueSummaryId));
        return next;
      });
    } catch (e) {
      console.error("[handleRemoveSaved] failed:", e);
      setError(e?.response?.data?.message || "저장 해제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteSelectedSaved = () => {
    if (selectedSavedKeys.size === 0) return;

    const count = selectedSavedKeys.size;
    confirmActionRef.current = async () => {
      try {
        await Promise.all(
          [...selectedSavedKeys].map((issueSummaryId) =>
            axios.delete(`/issue-archives/${issueSummaryId}`, { withCredentials: true })
          )
        );

        setSavedItems((prev) => prev.filter((item) => !selectedSavedKeys.has(getSavedItemKey(item))));
        setSelectedSavedKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleDeleteSelectedSaved] failed:", e);
        setError(e?.response?.data?.message || "선택 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({ open: true, message: `선택한 기사 ${count}개를 삭제할까요?` });
  };

  const handleClearSaved = () => {
    if (savedItems.length === 0) return;

    confirmActionRef.current = async () => {
      try {
        await Promise.all(
          savedItems.map((item) =>
            axios.delete(`/issue-archives/${getSavedItemKey(item)}`, { withCredentials: true })
          )
        );

        setSavedItems([]);
        setSelectedSavedKeys(new Set());
        setPage(1);
      } catch (e) {
        console.error("[handleClearSaved] failed:", e);
        setError(e?.response?.data?.message || "전체 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({ open: true, message: "저장한 기사 전체를 삭제할까요?" });
  };

  const handleRemoveRecent = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError("최근 본 기사 삭제 기능은 아직 백엔드 API가 없습니다.");
  };

  const handleDeleteSelectedRecent = () => {
    if (selectedRecentKeys.size === 0) return;

    const selectedItems = recentItems.filter((item) =>
      selectedRecentKeys.has(getRecentItemKey(item))
    );
    const articleIds = [
      ...new Set(
        selectedItems
          .map(getRecentArticleId)
          .map((id) => String(id || "").trim())
          .filter((id) => /^\d+$/.test(id))
      ),
    ];

    if (articleIds.length === 0) {
      setError("삭제할 최근 본 기사 정보를 찾을 수 없습니다.");
      return;
    }

    const count = articleIds.length;
    confirmActionRef.current = async () => {
      try {
        const results = await Promise.allSettled(
          articleIds.map((articleId) =>
            axios.delete(`/user-log/recent/${articleId}`, { withCredentials: true })
          )
        );

        const successIds = articleIds.filter(
          (_, index) => results[index]?.status === "fulfilled"
        );
        const failedResults = results.filter((result) => result.status === "rejected");

        if (successIds.length > 0) {
          const successIdSet = new Set(successIds.map(String));
          setRecentItems((prev) =>
            prev.filter((item) => !successIdSet.has(getRecentArticleId(item)))
          );
          setSelectedRecentKeys(new Set());
          setPage(1);
        }

        if (failedResults.length > 0) {
          const firstError = failedResults[0];
          setError(
            firstError?.reason?.response?.data?.message ||
              `선택한 최근 본 기사 ${failedResults.length}개를 삭제하지 못했습니다.`
          );
          return;
        }

        setError("");
      } catch (e) {
        console.error("[handleDeleteSelectedRecent] failed:", e);
        setError(e?.response?.data?.message || "선택 삭제 중 오류가 발생했습니다.");
      }
    };

    setConfirmModal({
      open: true,
      message: `선택한 최근 본 기사 ${count}개를 삭제할까요?`,
    });
  };

  const handleClearRecent = () => {
    if (recentItems.length === 0) return;
    setError("최근 본 기사 전체 삭제 기능은 아직 백엔드 API가 없습니다.");
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

  const renderArchiveCard = ({
    item,
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
      if (
        target &&
        typeof target.closest === "function" &&
        (
          target.closest(".archive-item-check") ||
          target.closest(".archive-item-remove") ||
          target.closest(".archive-item-more") ||
          target.closest(".archive-item-origin")
        )
      ) {
        return;
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
                <input type="checkbox" checked={Boolean(itemKey && isSelected)} disabled={!itemKey} readOnly />
              </label>
            )}
            <span className="archive-item-cat">{item.category}</span>
          </div>

        </div>

        <div className="archive-item-title clamp-2">{renderHighlightedText(item.title, highlightTerms)}</div>
        <div className="archive-item-summary clamp-3">{renderHighlightedText(item.summary, highlightTerms)}</div>

        {!!item?.keywords?.length && (
          <div className="archive-item-keywords" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {item.keywords.slice(0, 8).map((keyword, idx) => (
              <span
                key={`${item.id}-kw-${idx}`}
                className="archive-keyword-chip"
                style={{ padding: "4px 10px", borderRadius: 999, background: "#f3f6fb", fontSize: 12, color: "#334155" }}
              >
                #{renderHighlightedText(keyword, highlightTerms)}
              </span>
            ))}
          </div>
        )}

        <div className="archive-item-foot">
          <span className="archive-item-keywords-empty"> </span>
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
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="page archive-page">
      <div className="login-head">
        <div className="pageTitle">아카이브</div>
        <div className="pageDesc">저장한 기사 / 최근 본 기사</div>
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
                {...motionProps}
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          <div className="archive-toolbar">
            <div className="archive-toolbar-main">
              <label className="archive-item-check archive-select-all-check archive-select-all-inline">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={isAllVisibleSelected}
                  onChange={toggleVisibleSelection}
                  disabled={loading || visibleSelectableKeys.length === 0}
                  aria-label="toggle select all visible items"
                />
              </label>
              <input
                className="archive-search"
                type="text"
                placeholder="키워드 또는 제목으로 검색하세요"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="archive-sort">
              <motion.button type="button" className={sort === "latest" ? "active" : ""} onClick={() => setSort("latest")} {...motionProps}>
                최신순
              </motion.button>

              <motion.button type="button" className={sort === "oldest" ? "active" : ""} onClick={() => setSort("oldest")} {...motionProps}>
                오래된순
              </motion.button>

              {activeTab === "saved" && (
                <>
                  <motion.button
                    type="button"
                    className="archive-clear"
                    onClick={handleDeleteSelectedSaved}
                    disabled={loading || selectedSavedKeys.size === 0}
                    {...motionProps}
                  >
                    삭제
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
                    {...motionProps}
                  >
                    삭제
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <div className="archive-content-row">
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
                  const isSavedTab = activeTab === "saved";
                  const itemKey = isSavedTab ? getSavedItemKey(item) : getRecentItemKey(item);
                  const isSelected = isSavedTab ? selectedSavedKeys.has(itemKey) : selectedRecentKeys.has(itemKey);

                  return renderArchiveCard({
                    item,
                    selectable: true,
                    itemKey,
                    isSelected,
                    onToggleSelect: isSavedTab ? toggleSavedSelection : toggleRecentSelection,
                    onRemove: isSavedTab ? handleRemoveSaved : handleRemoveRecent,
                    removeAriaLabel: isSavedTab ? "remove saved issue" : "remove recent article",
                    hideRemove: !isSavedTab,
                  });
                })}

              {!loading && !error && filtered.length === 0 && (
                <div className="archive-empty">
                  {activeTab === "saved"
                    ? "검색한 키워드 또는 제목과 일치하는 저장한 기사가 없습니다."
                    : "검색한 키워드 또는 제목과 일치하는 최근 본 기사가 없습니다."}
                </div>
              )}

              <div className="als-pagination" aria-label={`현재 ${page}페이지, 전체 ${totalPages}페이지`}>
                <button
                  type="button"
                  className="als-page-btn"
                  onClick={() => handlePageChange(page - PAGINATION_GROUP_SIZE)}
                  disabled={loading || page <= 1}
                  aria-label="10페이지 이전"
                >
                  ◀◀
                </button>

                <button
                  type="button"
                  className="als-page-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={loading || page <= 1}
                  aria-label="이전 페이지"
                >
                  ◀
                </button>

                {visiblePages.map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`als-page-btn ${num === page ? "active" : ""}`}
                    onClick={() => handlePageChange(num)}
                    disabled={loading}
                    aria-current={num === page ? "page" : undefined}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  className="als-page-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={loading || page >= totalPages}
                  aria-label="다음 페이지"
                >
                  ▶
                </button>

                <button
                  type="button"
                  className="als-page-btn"
                  onClick={() => handlePageChange(page + PAGINATION_GROUP_SIZE)}
                  disabled={loading || page >= totalPages}
                  aria-label="10페이지 다음"
                >
                  ▶▶
                </button>
              </div>
            </div>

            <aside className="archive-inline-ad" aria-label="스폰서 광고">
              <section className="right-ad-card2">
                <div className="right-ad-tag">광고</div>
                <div className="right-ad-title">프리미엄 아카이브</div>
                <p className="right-ad-copy">저장 기사 태그 분석과 맞춤 알림 기능을 체험해보세요.</p>
                <div className="right-ad-visual" aria-hidden="true" />
              </section>
            </aside>
          </div>
        </section>

        <aside className="archive-aside">
          <SideMenuCard collapsible showScrollTop />
        </aside>
      </div>

      {selectedArticleDetail && (
        <div className="archive-article-modal-overlay" role="presentation" onClick={closeArticleDetail}>
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
              </div>

              <div className="archive-item-actions">
                <span className="archive-item-date">{selectedArticleDetail.date}</span>
              </div>
            </div>

            <h3 id="archive-article-modal-title" className="archive-article-modal-title">
              {renderHighlightedText(selectedArticleDetail.title, selectedArticleDetailTerms)}
            </h3>

            <div className="archive-article-modal-reading-meta">
              <span className="archive-article-modal-pill">
                약 {archiveDetailEstimatedReadMinutes}분 읽기
              </span>
              <span className="archive-article-modal-pill subtle">
                요약 {selectedArticleSummaryBlocks.length || 1}개 단락
              </span>
              {!!selectedArticleDetail?.keywords?.length && (
                <span className="archive-article-modal-pill subtle">
                  키워드 {selectedArticleDetail.keywords.length}개
                </span>
              )}
            </div>

            {selectedArticleSummaryBlocks.length > 0 ? (
              <section className="archive-article-modal-section archive-article-modal-section-summary">
                <div className="archive-article-modal-section-title">핵심 내용</div>
                <div className="archive-article-modal-copy">
                  {selectedArticleSummaryBlocks.map((block, index) => (
                    <p
                      key={`archive-summary-${selectedArticleDetail.id}-${index}`}
                      className="archive-article-modal-paragraph archive-article-modal-paragraph-summary"
                    >
                      {renderHighlightedText(block, selectedArticleDetailTerms)}
                    </p>
                  ))}
                </div>
              </section>
            ) : (
              <p className="archive-article-modal-summary">
                {renderHighlightedText(selectedArticleDetail.summary, selectedArticleDetailTerms)}
              </p>
            )}

            {selectedArticleBodyBlocks.length > 0 && (
              <section className="archive-article-modal-section">
                <div className="archive-article-modal-section-title">본문 미리보기</div>
                <div className="archive-article-modal-copy archive-article-modal-copy-body">
                  {selectedArticleBodyBlocks.map((block, index) => (
                    <p
                      key={`archive-body-${selectedArticleDetail.id}-${index}`}
                      className="archive-article-modal-paragraph"
                    >
                      {renderHighlightedText(block, selectedArticleDetailTerms)}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {!!selectedArticleDetail?.keywords?.length && (
              <div className="archive-article-modal-keywords">
                <div className="archive-article-modal-section-title">관련 키워드</div>
                <div className="archive-article-modal-keyword-list">
                  {selectedArticleDetail.keywords.slice(0, 12).map((keyword, idx) => (
                    <span
                      key={`detail-kw-${idx}`}
                      className="archive-keyword-chip archive-article-modal-keyword-chip"
                    >
                      #{renderHighlightedText(keyword, selectedArticleDetailTerms)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="archive-article-modal-foot">
              <button
                type="button"
                className="mp-btn"
                onClick={() => openItem(selectedArticleDetail)}
                disabled={!selectedArticleDetail?.raw?.article_id}
              >
                본문 보기
              </button>

              <button type="button" className="mp-btn" onClick={closeArticleDetail}>
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
