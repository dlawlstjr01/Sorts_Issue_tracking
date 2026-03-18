import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import SideMenuCard from "../../components/SideMenuCard";
import ConfirmModal from "../../components/ConfirmModal";

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

  const summary =
    normalizeSummaryValue(raw.short_summary) ||
    normalizeSummaryValue(raw.ultra_short) ||
    "요약 정보가 없습니다.";

  return {
    id: String(raw.issue_summary_id ?? raw.id ?? raw.archive_id ?? ""),
    title: raw.title || raw.ultra_short || "(제목 없음)",
    category: normalizeCategory(raw.category || "기타"),
    date: formatYMD(raw.saved_at || raw.created_at),
    summary,
    raw: {
      ...raw,
      id: raw.issue_summary_id ?? raw.id,
      issueSummaryId: raw.issue_summary_id ?? raw.id,
      issue_summary_id: raw.issue_summary_id ?? raw.id,
      article_id: raw.article_id ?? "",
      url: raw.url || "",
      content: raw.content || raw.short_summary || raw.ultra_short || "",
      short_summary: raw.short_summary || "",
      ultra_short: raw.ultra_short || "",
      saved_at: raw.saved_at || "",
      created_at: raw.created_at || "",
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

function getSavedItemKey(item) {
  return String(
    item?.raw?.issueSummaryId || item?.raw?.issue_summary_id || item?.id || ""
  );
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

export default function ArchivePage() {
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
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/issue-archives/my", {
          withCredentials: true,
        });

        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setSavedItems(items.map(mapSavedIssueFromServer));
      } catch (e) {
        console.error("[issue-archives/my] failed:", e);
        setSavedItems([]);
        setError(
          e?.response?.data?.message || "저장한 기사를 불러오지 못했습니다."
        );
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

    const start = (page - 1) * size;
    const end = start + size;

    return {
      items: sorted.slice(start, end),
      total: sorted.length,
    };
  }, [listItems, query, sort, page]);

  const filtered = filteredResult.items;
  const totalPages = Math.max(1, Math.ceil(filteredResult.total / size));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

    const issueSummaryId =
      item?.raw?.issueSummaryId || item?.raw?.issue_summary_id || item?.id;

    if (!issueSummaryId) return;

    try {
      await axios.delete(`/issue-archives/${issueSummaryId}`, {
        withCredentials: true,
      });

      setSavedItems((prev) =>
        prev.filter(
          (savedItem) =>
            String(
              savedItem?.raw?.issueSummaryId ||
                savedItem?.raw?.issue_summary_id ||
                savedItem?.id
            ) !== String(issueSummaryId)
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
            axios.delete(`/issue-archives/${issueSummaryId}`, {
              withCredentials: true,
            })
          )
        );

        setSavedItems((prev) =>
          prev.filter((item) => !selectedSavedKeys.has(getSavedItemKey(item)))
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
        await Promise.all(
          savedItems.map((item) => {
            const issueSummaryId = getSavedItemKey(item);
            return axios.delete(`/issue-archives/${issueSummaryId}`, {
              withCredentials: true,
            });
          })
        );

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

  // 최근 본 기사 삭제 API가 아직 없어서 비활성 처리
  const handleRemoveRecent = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError("최근 본 기사 삭제 기능은 아직 백엔드 API가 없습니다.");
  };

  const handleDeleteSelectedRecent = () => {
    if (selectedRecentKeys.size === 0) return;
    setError("최근 본 기사 선택 삭제 기능은 아직 백엔드 API가 없습니다.");
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
        [query].map((term) => String(term || "").trim()).filter(Boolean)
      ),
    ];
  }, [query]);

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
        [query].map((term) => String(term || "").trim()).filter(Boolean)
      ),
    ];
  }, [selectedArticleDetail, query]);

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
                    disabled={true}
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
                    disabled={true}
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

            {!loading &&
              !error &&
              filtered.map((item) => {
                const itemKey =
                  activeTab === "saved"
                    ? getSavedItemKey(item)
                    : getRecentItemKey(item);

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
                  selectable: true,
                  itemKey,
                  isSelected,
                  onToggleSelect: toggleSelection,
                  onRemove: removeHandler,
                  removeAriaLabel: removeAria,
                  hideRemove: activeTab === "recent",
                });
              })}

            {!loading && !error && filtered.length === 0 && (
              <div className="archive-empty">
                {activeTab === "saved"
                  ? "저장한 기사가 없습니다."
                  : "최근 본 기사가 없습니다."}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
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