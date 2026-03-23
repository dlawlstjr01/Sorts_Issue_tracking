import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchNews } from "../../api/newsApi";
import SideMenuCard from "../../components/SideMenuCard";
import { rememberArticleDetail } from "../../utils/articleDetail";
import { resolveThumbnailUrl, withImageFallback } from "../../utils/imageUrl";
import "../../CSS/common.css";
import "../../CSS/main.css";
import "../../CSS/sub.css";

const PAGE_SIZE = 30;
const PAGINATION_GROUP_SIZE = 10;
const ARTICLE_LIST_NEWS_CACHE_PREFIX = "articleListNews:v1:";
const ARTICLE_LIST_PRESS_CACHE_PREFIX = "articleListPresses:v1:";
const ARTICLE_LIST_CACHE_TTL = 1000 * 60 * 3;

const FILTER_TABS = [
  { key: "period", label: "기간" },
  { key: "press", label: "언론사" },
];

const PRESS_INITIALS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const HANGUL_INITIALS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const PRESS_INITIAL_GROUPS = { "ㄲ": "ㄱ", "ㄸ": "ㄷ", "ㅃ": "ㅂ", "ㅆ": "ㅅ", "ㅉ": "ㅈ", "ㅋ": "ㄱ", "ㅌ": "ㄷ" };
const PRESS_ALPHABETS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const PRESS_DOMAIN_RULES = [
  { press: "스포츠경향", domains: ["sports.khan.co.kr", "sportskhan.net"] },
  { press: "스포츠동아", domains: ["sports.donga.com"] },
  { press: "스타뉴스", domains: ["star.mt.co.kr"] },
  { press: "텐아시아", domains: ["tenasia.co.kr", "tenasia.hankyung.com"] },
  { press: "조선일보", domains: ["chosun.com"] },
  { press: "중앙일보", domains: ["joongang.co.kr"] },
  { press: "동아일보", domains: ["donga.com"] },
  { press: "한겨레", domains: ["hani.co.kr"] },
  { press: "경향신문", domains: ["khan.co.kr"] },
  { press: "한국일보", domains: ["hankookilbo.com"] },
  { press: "서울신문", domains: ["seoul.co.kr"] },
  { press: "국민일보", domains: ["kmib.co.kr"] },
  { press: "세계일보", domains: ["segye.com"] },
  { press: "문화일보", domains: ["munhwa.com"] },
  { press: "매일경제", domains: ["mk.co.kr"] },
  { press: "한국경제", domains: ["hankyung.com"] },
  { press: "서울경제", domains: ["sedaily.com"] },
  { press: "파이낸셜뉴스", domains: ["fnnews.com"] },
  { press: "머니투데이", domains: ["mt.co.kr"] },
  { press: "이데일리", domains: ["edaily.co.kr"] },
  { press: "아시아경제", domains: ["asiae.co.kr"] },
  { press: "헤럴드경제", domains: ["heraldcorp.com"] },
  { press: "연합뉴스", domains: ["yna.co.kr"] },
  { press: "뉴시스", domains: ["newsis.com"] },
  { press: "KBS", domains: ["kbs.co.kr"] },
  { press: "MBC", domains: ["mbc.co.kr"] },
  { press: "SBS", domains: ["sbs.co.kr"] },
  { press: "YTN", domains: ["ytn.co.kr"] },
  { press: "JTBC", domains: ["jtbc.co.kr"] },
  { press: "TV조선", domains: ["tvchosun.com"] },
  { press: "채널A", domains: ["ichannela.com"] },
  { press: "MBN", domains: ["mbn.co.kr"] },
  { press: "오마이뉴스", domains: ["ohmynews.com"] },
  { press: "프레시안", domains: ["pressian.com"] },
  { press: "미디어오늘", domains: ["mediatoday.co.kr"] },
  { press: "디지털타임스", domains: ["dt.co.kr"] },
  { press: "전자신문", domains: ["etnews.com"] },
  { press: "ZDNET Korea", domains: ["zdnet.co.kr"] },
  { press: "부산일보", domains: ["busan.com"] },
  { press: "매일신문", domains: ["imaeil.com"] },
  { press: "강원일보", domains: ["kwnews.co.kr"] },
  { press: "경인일보", domains: ["kyeongin.com"] },
  { press: "노컷뉴스", domains: ["nocutnews.co.kr"] },
  { press: "뉴스1", domains: ["news1.kr"] },
  { press: "뉴스핌", domains: ["newspim.com"] },
  { press: "데일리안", domains: ["dailian.co.kr"] },
  { press: "아이뉴스24", domains: ["inews24.com"] },
  { press: "이코노미스트", domains: ["economist.co.kr"] },
  { press: "시사IN", domains: ["sisain.co.kr"] },
  { press: "시사저널", domains: ["sisajournal.com"] },
  { press: "폴리뉴스", domains: ["polinews.co.kr"] },
  { press: "서울파이낸스", domains: ["seoulfn.com"] },
  { press: "비즈니스포스트", domains: ["businesspost.co.kr"] },
  { press: "더벨", domains: ["thebell.co.kr"] },
  { press: "블로터", domains: ["bloter.net"] },
  { press: "디지털데일리", domains: ["ddaily.co.kr"] },
  { press: "헬로디디", domains: ["hellodd.com"] },
  { press: "보안뉴스", domains: ["boannews.com"] },
  { press: "더팩트", domains: ["tf.co.kr"] },
  { press: "머니S", domains: ["moneys.co.kr"] },
  { press: "뉴스토마토", domains: ["newstomato.com"] },
  { press: "아주경제", domains: ["ajunews.com"] },
  { press: "브릿지경제", domains: ["viva100.com"] },
  { press: "비즈워치", domains: ["bizwatch.co.kr"] },
  { press: "KNN", domains: ["knn.co.kr"] },
  { press: "TBC", domains: ["tbc.co.kr"] },
  { press: "CJB", domains: ["cjb.co.kr"] },
  { press: "JTV", domains: ["jtv.co.kr"] },
  { press: "ubc울산방송", domains: ["ubc.co.kr"] },
  { press: "G1방송", domains: ["g1tv.co.kr", "g1.kr"] },
  { press: "KBC광주방송", domains: ["ikbc.co.kr", "kbc.co.kr"] },
  { press: "TJB대전방송", domains: ["tjb.co.kr"] },
  { press: "OBS경인TV", domains: ["obs.co.kr"] },
  { press: "연합뉴스TV", domains: ["yonhapnewstv.co.kr"] },
  { press: "국제신문", domains: ["kookje.co.kr"] },
  { press: "대구일보", domains: ["idaegu.com"] },
  { press: "전북일보", domains: ["jjan.kr"] },
  { press: "전남일보", domains: ["jnilbo.com"] },
  { press: "광주일보", domains: ["kwangju.co.kr"] },
  { press: "충청일보", domains: ["ccdailynews.com"] },
  { press: "충청타임즈", domains: ["cctimes.kr"] },
  { press: "중부일보", domains: ["joongboo.com"] },
  { press: "한라일보", domains: ["ihalla.com"] },
  { press: "제민일보", domains: ["jemin.com"] },
  { press: "기호일보", domains: ["kihoilbo.co.kr"] },
  { press: "경기일보", domains: ["kgnews.co.kr"] },
  { press: "강원도민일보", domains: ["kado.net"] },
  { press: "충북일보", domains: ["inews365.com"] },
  { press: "대전일보", domains: ["daejonilbo.com"] },
  { press: "중도일보", domains: ["joongdo.co.kr"] },
  { press: "경상일보", domains: ["ksilbo.co.kr"] },
  { press: "영남일보", domains: ["yeongnam.com"] },
  { press: "경남신문", domains: ["knnews.co.kr"] },
  { press: "경남도민일보", domains: ["idomin.com"] },
  { press: "전북도민일보", domains: ["domin.co.kr"] },
  { press: "경북일보", domains: ["kyongbuk.co.kr"] },
  { press: "광남일보", domains: ["gwangnam.co.kr"] },
  { press: "무등일보", domains: ["mdilbo.com"] },
  { press: "남도일보", domains: ["namdonews.com"] },
  { press: "농민신문", domains: ["nongmin.com"] },
  { press: "스포츠서울", domains: ["sportsseoul.com"] },
  { press: "스포티비뉴스", domains: ["spotvnews.co.kr"] },
  { press: "OSEN", domains: ["osen.co.kr"] },
  { press: "마이데일리", domains: ["mydaily.co.kr"] },
  { press: "엑스포츠뉴스", domains: ["xportsnews.com"] },
  { press: "일간스포츠", domains: ["isplus.com"] },
  { press: "TV리포트", domains: ["tvreport.co.kr"] },
  { press: "뉴스엔", domains: ["newsen.com"] },
];

const PRESS_DOMAIN_SET = new Set(PRESS_DOMAIN_RULES.map(({ press }) => press));

const DOMAIN_TO_PRESS_RULES = PRESS_DOMAIN_RULES.flatMap(({ press, domains }) =>
  (domains || []).map((domain) => ({
    press,
    domain: String(domain || "").toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""),
  }))
)
  .filter((rule) => rule.domain)
  .sort((a, b) => b.domain.length - a.domain.length);

const NAVER_OID_TO_PRESS = { "001": "연합뉴스", "003": "뉴시스", "005": "국민일보", "008": "머니투데이", "009": "매일경제", "011": "서울신문", "014": "파이낸셜뉴스", "015": "한국경제", "016": "헤럴드경제", "018": "이데일리", "020": "동아일보", "021": "문화일보", "022": "세계일보", "023": "조선일보", "025": "중앙일보", "028": "한겨레", "031": "아이뉴스24", "032": "경향신문", "052": "YTN", "055": "SBS", "056": "KBS", "057": "MBC", "079": "노컷뉴스", "081": "서울경제", "277": "아주경제", "421": "뉴스1", "437": "JTBC", "448": "TV조선", "449": "채널A" };

const PRESS_ITEMS = ["한겨레", "한국일보", "서울신문", "국민일보", "세계일보", "머니투데이", "이데일리", "동아일보", "KBS", "MBN", "오마이뉴스", "프레시안", "ZDNET Korea", "뉴스1", "뉴스핌", "아이뉴스24", "매경이코노미", "주간조선", "주간동아", "한겨레21", "주간경향", "조세일보", "한국세정신문", "인더스트리뉴스", "메디칼타임즈", "청년의사", "약업신문", "의학신문", "KNN", "KBS부산", "KBS대구", "KBS광주", "KBS전주", "KBS청주", "KBS춘천", "KBS제주", "경남신문", "축산신문", "해양수산신문", "OSEN"];

const PRESS_FILTER_ITEMS = PRESS_ITEMS.filter((name) => PRESS_DOMAIN_SET.has(name));
const PRESS_FILTER_SET = new Set(PRESS_FILTER_ITEMS);
const PRESS_NAME_BY_TEXT_PRIORITY = [...PRESS_ITEMS].sort((a, b) => b.length - a.length);

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

function readTimedCache(storageKey) {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const ts = Number(parsed?.ts) || 0;
    if (!ts || Date.now() - ts > ARTICLE_LIST_CACHE_TTL) return null;

    return parsed?.value ?? null;
  } catch (error) {
    console.error("failed to read article list cache:", error);
    return null;
  }
}

function writeTimedCache(storageKey, value) {
  if (typeof window === "undefined") return value;

  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ts: Date.now(),
        value,
      })
    );
  } catch (error) {
    console.error("failed to write article list cache:", error);
  }

  return value;
}

function makePressCacheKey(keyword, range) {
  return JSON.stringify({
    q: String(keyword || "").trim(),
    from: String(range?.start || ""),
    to: String(range?.end || ""),
  });
}

function makeNewsCacheKey(page, keyword, range, presses) {
  const selectedPressArray =
    presses instanceof Set ? Array.from(presses) : Array.isArray(presses) ? presses : [];

  return JSON.stringify({
    page: Math.max(1, Number(page) || 1),
    q: String(keyword || "").trim(),
    from: String(range?.start || ""),
    to: String(range?.end || ""),
    presses: selectedPressArray.map((item) => String(item || "").trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, "ko")),
  });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPublishedDate(raw) {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw).slice(0, 10);
  return formatDate(parsed);
}

function createDefaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return { start: formatDate(start), end: formatDate(end) };
}

function extractHostFromUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || ""));
    return String(url.hostname || "").toLowerCase().trim().replace(/^www\./, "");
  } catch (_) {
    return "";
  }
}

function extractNaverOid(rawUrl) {
  const raw = String(rawUrl || "");
  try {
    const url = new URL(raw);
    const oid = url.searchParams.get("oid");
    if (/^\d{3}$/.test(oid || "")) return oid;
    const pathMatch = url.pathname.match(/\/article\/(\d{3})\/\d+/);
    if (pathMatch) return pathMatch[1];
  } catch (_) { }

  const queryMatch = raw.match(/[?&]oid=(\d{3})/);
  if (queryMatch) return queryMatch[1];

  const pathMatch = raw.match(/\/article\/(\d{3})\/\d+/);
  if (pathMatch) return pathMatch[1];

  return "";
}

function resolvePressByUrl(rawUrl) {
  const host = extractHostFromUrl(rawUrl);
  if (!host) return null;

  if (host === "news.naver.com" || host.endsWith(".naver.com")) {
    const oid = extractNaverOid(rawUrl);
    if (oid && NAVER_OID_TO_PRESS[oid]) return NAVER_OID_TO_PRESS[oid];
  }

  for (const rule of DOMAIN_TO_PRESS_RULES) {
    if (host === rule.domain || host.endsWith(`.${rule.domain}`)) return rule.press;
  }
  return null;
}

function buildNewsDedupKey(item) {
  const title = String(item?.title || "").trim();
  const published = String(item?.published_at || item?.created_at || "").trim();
  if (title && published) return `title:${title}|published:${published}`;

  const url = String(item?.url || "").trim();
  if (url) return `url:${url}`;

  if (title || published) return `title:${title}|published:${published}`;
  return `id:${String(item?.id || "")}`;
}

function dedupeNewsItems(items) {
  const dedup = new Map();

  for (const item of items || []) {
    const key = buildNewsDedupKey(item);
    const current = dedup.get(key);

    if (!current) {
      dedup.set(key, item);
      continue;
    }

    const currentTs = new Date(current.published_at || current.created_at || 0).getTime() || 0;
    const nextTs = new Date(item.published_at || item.created_at || 0).getTime() || 0;
    if (nextTs >= currentTs) dedup.set(key, item);
  }

  return Array.from(dedup.values());
}

function getHangulInitial(char) {
  const first = String(char || "").trim().charAt(0);
  if (!first) return "";

  const code = first.charCodeAt(0);
  const HANGUL_START = 0xac00;
  const HANGUL_END = 0xd7a3;

  if (code < HANGUL_START || code > HANGUL_END) return "";

  const index = Math.floor((code - HANGUL_START) / 588);
  const initial = HANGUL_INITIALS[index] || "";
  if (!initial) return "";

  const grouped = PRESS_INITIAL_GROUPS[initial] || initial;
  return PRESS_INITIALS.includes(grouped) ? grouped : "";
}

function normalizePressCandidate(raw) {
  return String(raw || "")
    .trim()
    .replace(/^[\s"'“”‘’\[\]()[\]{}<>]+/, "")
    .replace(/[\s"'“”‘’\[\]()[\]{}<>.,!?]+$/, "")
    .trim();
}

function extractPressFromTitleTail(rawTitle) {
  const title = String(rawTitle || "").trim();
  if (!title) return null;

  const separators = [" - ", " | ", " / ", " · ", " — "];
  for (const sep of separators) {
    if (!title.includes(sep)) continue;

    const tail = normalizePressCandidate(title.split(sep).pop());
    if (!tail) continue;
    if (PRESS_ITEMS.includes(tail)) return tail;
    if (tail.length < 2 || tail.length > 24) continue;
    if (!/[가-힣A-Za-z]/.test(tail)) continue;
    if (/기자$/.test(tail)) continue;
    if (/(신문|일보|뉴스|경제|저널|타임즈|투데이|TV|방송|포스트|리포트)$/i.test(tail)) return tail;
  }

  return null;
}

function resolvePressByText(rawTitle, rawContent) {
  const text = `${String(rawTitle || "")} ${String(rawContent || "")}`;
  if (!text) return null;

  for (const pressName of PRESS_NAME_BY_TEXT_PRIORITY) {
    if (text.includes(pressName)) return pressName;
  }

  return extractPressFromTitleTail(rawTitle);
}

function parseDateParam(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fallback;
  return raw;
}

function parsePageParam(value, fallback = 1) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(1, Math.floor(num));
}

function parseArticleListSearch(search) {
  const defaults = createDefaultDateRange();
  const sp = new URLSearchParams(search || "");

  const selectedPressFilter = new Set(
    sp
      .getAll("pf")
      .map((item) => String(item || "").trim())
      .filter((token) => PRESS_INITIALS.includes(token) || /^[A-Z]$/.test(token))
  );

  const selectedPress = new Set(
    sp
      .getAll("sp")
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  );

  return {
    query: String(sp.get("q") || "").trim(),
    dateRange: {
      start: parseDateParam(sp.get("from"), defaults.start),
      end: parseDateParam(sp.get("to"), defaults.end),
    },
    page: parsePageParam(sp.get("page"), 1),
    selectedPressFilter,
    selectedPress,
  };
}

function buildArticleListSearch({ query, dateRange, page, selectedPressFilter, selectedPress }) {
  const sp = new URLSearchParams();
  sp.set("view", "article-list");

  const keyword = String(query || "").trim();
  if (keyword) sp.set("q", keyword);
  if (dateRange?.start) sp.set("from", dateRange.start);
  if (dateRange?.end) sp.set("to", dateRange.end);

  const nextPage = Math.max(1, Number(page) || 1);
  if (nextPage > 1) sp.set("page", String(nextPage));

  Array.from(selectedPressFilter || [])
    .sort((a, b) => a.localeCompare(b, "ko"))
    .forEach((token) => sp.append("pf", token));

  Array.from(selectedPress || [])
    .sort((a, b) => a.localeCompare(b, "ko"))
    .forEach((name) => sp.append("sp", name));

  return `?${sp.toString()}`;
}

export default function ArticleListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialSearchState = useMemo(() => parseArticleListSearch(location.search), [location.search]);
  const initialNewsCacheRef = useRef(
    readTimedCache(
      `${ARTICLE_LIST_NEWS_CACHE_PREFIX}${makeNewsCacheKey(
        initialSearchState.page,
        initialSearchState.query,
        initialSearchState.dateRange,
        initialSearchState.selectedPress
      )}`
    )
  );
  const initialPressCacheRef = useRef(
    readTimedCache(
      `${ARTICLE_LIST_PRESS_CACHE_PREFIX}${makePressCacheKey(
        initialSearchState.query,
        initialSearchState.dateRange
      )}`
    )
  );

  const [query, setQuery] = useState(initialSearchState.query);
  const [activeTab, setActiveTab] = useState("period");
  const [selectedPressFilter, setSelectedPressFilter] = useState(() => new Set(initialSearchState.selectedPressFilter));
  const [selectedPress, setSelectedPress] = useState(() => new Set(initialSearchState.selectedPress));
  const [dateRange, setDateRange] = useState(initialSearchState.dateRange);

  const [newsItems, setNewsItems] = useState(() => initialNewsCacheRef.current?.items || []);
  const [currentPage, setCurrentPage] = useState(initialSearchState.page);
  const [total, setTotal] = useState(() => Number(initialNewsCacheRef.current?.total) || 0);
  const [error, setError] = useState("");
  const [availablePresses, setAvailablePresses] = useState(() => initialPressCacheRef.current || []);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpWrapRef = useRef(null);
  const requestSeqRef = useRef(0);
  const pressCacheRef = useRef(new Map());

  const [loadingArticles, setLoadingArticles] = useState(() => !initialNewsCacheRef.current);
  const [loadingPresses, setLoadingPresses] = useState(false);

  const selectedCount = selectedPress.size + (query.trim() ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visiblePages = useMemo(() => {
    const pages = [];
    const groupStart =
      Math.floor((Math.max(1, currentPage) - 1) / PAGINATION_GROUP_SIZE) * PAGINATION_GROUP_SIZE + 1;
    const groupEnd = Math.min(totalPages, groupStart + PAGINATION_GROUP_SIZE - 1);
    for (let i = groupStart; i <= groupEnd; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const sortedPressItems = useMemo(() => {
    const isKoreanStart = (value) => /^[가-힣]/.test(value);
    const isEnglishStart = (value) => /^[A-Za-z]/.test(value);
    const groupRank = (value) => {
      if (isKoreanStart(value)) return 0;
      if (isEnglishStart(value)) return 1;
      return 2;
    };

    return [...availablePresses].sort((a, b) => {
      const nameA = String(a?.name || "");
      const nameB = String(b?.name || "");

      const rankA = groupRank(nameA);
      const rankB = groupRank(nameB);

      if (rankA !== rankB) return rankA - rankB;
      if (rankA === 1) {
        return nameA.localeCompare(nameB, "en", { sensitivity: "base", numeric: true });
      }
      return nameA.localeCompare(nameB, "ko", { sensitivity: "base", numeric: true });
    });
  }, [availablePresses]);

  const filteredPressItems = useMemo(() => {
    if (selectedPressFilter.size === 0) return sortedPressItems;

    const koreanTokens = new Set();
    const englishTokens = new Set();

    selectedPressFilter.forEach((token) => {
      if (PRESS_INITIALS.includes(token)) koreanTokens.add(token);
      if (/^[A-Z]$/.test(token)) englishTokens.add(token);
    });

    return sortedPressItems.filter((item) => {
      const name = String(item?.name || "").trim();
      const first = name.charAt(0);
      if (!first) return false;

      if (/[A-Za-z]/.test(first)) return englishTokens.has(first.toUpperCase());

      const initial = getHangulInitial(first);
      return initial ? koreanTokens.has(initial) : false;
    });
  }, [selectedPressFilter, sortedPressItems]);

  const resetDateRange = () => setDateRange(createDefaultDateRange());

  const loadNews = async (targetPage, keyword, range = dateRange, presses = selectedPress) => {
    const requestId = ++requestSeqRef.current;
    const selectedPressArray =
      presses instanceof Set ? Array.from(presses) : Array.isArray(presses) ? presses : [];
    const cacheKey = makeNewsCacheKey(targetPage, keyword, range, selectedPressArray);
    const cachedPayload = readTimedCache(`${ARTICLE_LIST_NEWS_CACHE_PREFIX}${cacheKey}`);

    try {
      if (cachedPayload) {
        setNewsItems(Array.isArray(cachedPayload?.items) ? cachedPayload.items : []);
        setTotal(Number(cachedPayload?.total) || 0);
        setCurrentPage(targetPage);
        setLoadingArticles(false);
      } else {
        setLoadingArticles(true);
      }
      setError("");

      const hasSelectedPresses = selectedPressArray.length > 0;
      const hasKeyword = Boolean(String(keyword || "").trim());

      const response = await fetchNews({
        page: targetPage,
        size: PAGE_SIZE,
        q: keyword || undefined,
        dateFrom: range?.start,
        dateTo: range?.end,
        presses: selectedPressArray,
        includePresses: false,
        includeTotal: !(hasSelectedPresses || hasKeyword),
      });

      if (requestId !== requestSeqRef.current) return;

      const data = response?.data || {};
      const items = Array.isArray(data.items) ? data.items : [];

      const normalizedItems = items.map((item) => ({
        ...item,
        thumbnail: resolveThumbnailUrl(item?.thumbnail, THUMB_FALLBACK),
        press_name: item?.press_name || "기타",
      }));

      const dedupedItems = dedupeNewsItems(normalizedItems);
      const resolvedTotal =
        data.total === null || data.total === undefined
          ? dedupedItems.length
          : Number(data.total) || 0;

      writeTimedCache(`${ARTICLE_LIST_NEWS_CACHE_PREFIX}${cacheKey}`, {
        items: dedupedItems,
        total: resolvedTotal,
      });

      setNewsItems(dedupedItems);
      setTotal(resolvedTotal);
      setCurrentPage(targetPage);
    } catch (err) {
      if (requestId !== requestSeqRef.current) return;

      if (!cachedPayload) {
        setError(err?.response?.data?.message || "뉴스 기사를 불러오지 못했습니다.");
        setNewsItems([]);
        setTotal(0);
        setCurrentPage(1);
      }
    } finally {
      if (requestId === requestSeqRef.current) {
        setLoadingArticles(false);
      }
    }
  };

  useEffect(() => {
    loadNews(
      initialSearchState.page,
      initialSearchState.query,
      initialSearchState.dateRange,
      initialSearchState.selectedPress
    );

    loadPresses(initialSearchState.query, initialSearchState.dateRange);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSearchOpen) setIsHelpOpen(false);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isHelpOpen) return;

    const handleOutsideClick = (event) => {
      if (helpWrapRef.current && !helpWrapRef.current.contains(event.target)) setIsHelpOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsHelpOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHelpOpen]);

  useEffect(() => {
    if (!availablePresses.length) return;

    const availableSet = new Set(
      availablePresses.map((item) => String(item?.name || "").trim()).filter(Boolean)
    );

    setSelectedPress((prev) => {
      const next = new Set([...prev].filter((name) => availableSet.has(name)));
      return next.size === prev.size ? prev : next;
    });
  }, [availablePresses]);

  useEffect(() => {
    loadPresses(query.trim(), dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  const togglePressFilter = (name) => {
    setSelectedPressFilter((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const togglePress = (name) => {
    setSelectedPress((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const applyQuickRange = (unit, amount) => {
    const end = new Date();
    const start = new Date(end);
    if (unit === "day") start.setDate(start.getDate() - amount);
    if (unit === "month") start.setMonth(start.getMonth() - amount);
    setDateRange({ start: formatDate(start), end: formatDate(end) });
  };

  const syncListUrl = (
    targetPage,
    keyword = query,
    range = dateRange,
    pressFilter = selectedPressFilter,
    presses = selectedPress
  ) => {
    const search = buildArticleListSearch({
      query: keyword,
      dateRange: range,
      page: targetPage,
      selectedPressFilter: pressFilter,
      selectedPress: presses,
    });

    navigate({ pathname: location.pathname, search }, { replace: true });
  };

  const resetFilters = () => {
    const emptyPressFilter = new Set();
    const emptyPress = new Set();
    const nextRange = createDefaultDateRange();

    setQuery("");
    setSelectedPressFilter(emptyPressFilter);
    setSelectedPress(emptyPress);
    setDateRange(nextRange);
    setError("");

    syncListUrl(1, "", nextRange, emptyPressFilter, emptyPress);

    const cacheKey = makePressCacheKey("", nextRange);
    const cachedPresses = pressCacheRef.current.get(cacheKey);
    if (cachedPresses) {
      setAvailablePresses(cachedPresses);
    } else {
      loadPresses("", nextRange);
    }

    loadNews(1, "", nextRange, emptyPress);
  };

  const runSearch = async () => {
    if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
      setError("시작일이 종료일보다 늦습니다.");
      return;
    }

    const keyword = query.trim();

    syncListUrl(1, keyword, dateRange, selectedPressFilter, selectedPress);

    loadNews(1, keyword, dateRange, selectedPress);
    loadPresses(keyword, dateRange);
  };

  const handlePageChange = (targetPage) => {
    if (loadingArticles) return;
    if (targetPage < 1 || targetPage > totalPages) return;

    const keyword = query.trim();
    syncListUrl(targetPage, keyword, dateRange, selectedPressFilter, selectedPress);
    loadNews(targetPage, keyword, dateRange, selectedPress);
  };

  const openArticleDetail = (item) => {
    const normalized = rememberArticleDetail({
      ...item,
      issueSummaryId: item?.issueSummaryId || item?.issue_summary_id || "",
      issue_summary_id: item?.issue_summary_id || item?.issueSummaryId || "",
    });

    if (!normalized) return;

    navigate(`/?view=article&id=${encodeURIComponent(normalized.id)}`, {
      state: {
        article: normalized,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const loadPresses = async (keyword, range, { force = false } = {}) => {
    const cacheKey = makePressCacheKey(keyword, range);
    const storageKey = `${ARTICLE_LIST_PRESS_CACHE_PREFIX}${cacheKey}`;
    const storedCache = !force ? readTimedCache(storageKey) : null;

    if (!force && pressCacheRef.current.has(cacheKey)) {
      const cached = pressCacheRef.current.get(cacheKey);
      setAvailablePresses(cached);
      return cached;
    }

    if (!force && storedCache) {
      pressCacheRef.current.set(cacheKey, storedCache);
      setAvailablePresses(storedCache);
      return storedCache;
    }

    try {
      if (!storedCache) setLoadingPresses(true);

      const response = await fetchNews({
        page: 1,
        size: 1,
        q: keyword || undefined,
        dateFrom: range?.start,
        dateTo: range?.end,
        presses: [],
        includePresses: true,
        includeTotal: false,
      });

      const data = response?.data || {};
      const backendPressesRaw = Array.isArray(data.presses) ? data.presses : [];

      const normalizedPresses = backendPressesRaw
        .map((item) => {
          if (typeof item === "string") {
            return { name: String(item).trim(), count: 1 };
          }

          return {
            name: String(item?.name || "").trim(),
            count: Number(item?.count) || 0,
          };
        })
        .filter((item) => item.name && item.name !== "기타" && item.count > 0);

      pressCacheRef.current.set(cacheKey, normalizedPresses);
      writeTimedCache(storageKey, normalizedPresses);
      setAvailablePresses(normalizedPresses);
      return normalizedPresses;
    } catch (err) {
      console.error("[loadPresses] failed:", err);
      return [];
    } finally {
      setLoadingPresses(false);
    }
  };

  return (
    <div className="page article-search-page">
      <section className="als-step-card">
        <button
          type="button"
          className="als-step-head step-1"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          aria-expanded={isSearchOpen}
          aria-controls="als-search-body"
        >
          <span className="als-step-title">뉴스 검색</span>
          <span className="als-step-toggle">{isSearchOpen ? "-" : "+"}</span>
        </button>

        {isSearchOpen && (
          <div className="als-step-body" id="als-search-body">
            <div className="als-search-row">
              <label className="als-search-input">
                <span className="als-search-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26">
                    <path
                      d="M10.5 3a7.5 7.5 0 0 1 5.95 12.07l4.24 4.24-1.42 1.42-4.24-4.24A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="기본 검색어 또는 언론사를 입력하세요."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      runSearch();
                    }
                  }}
                />
              </label>

              <div className="als-help-wrap" ref={helpWrapRef}>
                <button
                  type="button"
                  className="als-help-btn"
                  onClick={() => setIsHelpOpen((prev) => !prev)}
                  aria-expanded={isHelpOpen}
                  aria-controls="als-help-popover"
                >
                  <span className="als-help-badge">i</span>
                  검색도움말
                </button>

                {isHelpOpen && (
                  <div id="als-help-popover" className="als-help-popover" role="dialog" aria-label="검색 도움말">
                    <div className="als-help-popover-title">검색 도움말</div>
                    <ul className="als-help-list">
                      <li>검색어는 공백으로 여러 단어를 입력할 수 있습니다.</li>
                      <li>언론사명만 입력해도 해당 언론사 기사 검색이 가능합니다.</li>
                      <li>기간/언론사를 선택한 뒤 적용하기를 누르세요.</li>
                      <li>검색어 없이도 필터 조건만으로 검색할 수 있습니다.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="als-tab-row">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`als-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span className="als-tab-mark">{activeTab === tab.key ? "+" : "−"}</span>
                </button>
              ))}
            </div>

            <div className="als-filter-body is-matrix">
              <div className="als-lane">
                <div className="als-date-filter compact">
                  <div className="als-date-row">
                    <label className="als-date-field">
                      <span>시작일</span>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
                      />
                    </label>
                    <label className="als-date-field">
                      <span>종료일</span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="als-date-quick">
                    <button type="button" onClick={() => applyQuickRange("day", 7)}>
                      최근 7일
                    </button>
                    <button type="button" onClick={() => applyQuickRange("month", 1)}>
                      최근 1개월
                    </button>
                    <button type="button" onClick={() => applyQuickRange("month", 3)}>
                      최근 3개월
                    </button>
                  </div>
                </div>
              </div>

              <div className="als-lane">
                <div className="als-lane-chip-wrap">
                  {PRESS_INITIALS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`als-chip-btn ${selectedPressFilter.has(name) ? "active" : ""}`}
                      onClick={() => togglePressFilter(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="als-lane-chip-wrap als-alpha-chip-wrap">
                  {PRESS_ALPHABETS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`als-chip-btn ${selectedPressFilter.has(name) ? "active" : ""}`}
                      onClick={() => togglePressFilter(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="als-lane-chip-wrap als-press-chip-wrap">
                  {filteredPressItems.map((item) => {
                    const pressName = String(item?.name || "").trim();
                    const pressCount = Number(item?.count) || 0;

                    if (!pressName) return null;

                    return (
                      <button
                        key={pressName}
                        type="button"
                        className={`als-chip-btn sub ${selectedPress.has(pressName) ? "active" : ""}`}
                        onClick={() => togglePress(pressName)}
                        title={`${pressName} (${pressCount}건)`}
                      >
                        {pressName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="als-selected-row">
              <div className="als-selected-chip">
                {dateRange.start} ~ {dateRange.end}
                <button
                  type="button"
                  className="als-chip-remove"
                  onClick={resetDateRange}
                  aria-label="기간 초기화"
                >
                  ×
                </button>
              </div>

              <div className="als-selected-count">선택 {selectedCount}</div>

              <div className="als-actions">
                <button type="button" className="als-btn ghost" onClick={resetFilters}>
                  초기화
                </button>
                <button
                  type="button"
                  className="als-btn primary"
                  onClick={runSearch}
                  disabled={loadingArticles}
                >
                  {loadingArticles ? "검색 중..." : "적용하기"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="als-news-wrap">
        <div className="als-news-head">
          <div className="als-news-title-main">뉴스 기사</div>
          <div className="als-news-head-meta">
            <div className="als-news-visible">페이지 {currentPage}/{totalPages}</div>
            <div className="als-news-visible">현재 {newsItems.length}개 표시</div>
            <div className="als-news-total">총 {total}건</div>
          </div>
        </div>

        {loadingArticles && <div className="als-empty">뉴스를 불러오는 중입니다...</div>}
        {!loadingArticles && error && <div className="als-empty is-error">{error}</div>}
        {!loadingArticles && !error && newsItems.length === 0 && (
          <div className="als-empty">표시할 뉴스 기사가 없습니다.</div>
        )}

        {!loadingArticles && !error && newsItems.length > 0 && (
          <>
            <div className="als-news-grid">
              {newsItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="als-news-card"
                  onClick={() => openArticleDetail(item)}
                >
                  <div className="als-news-thumb-wrap">
                    <img
                      src={item.thumbnail || THUMB_FALLBACK}
                      alt=""
                      loading="lazy"
                      onError={withImageFallback}
                    />
                  </div>

                  <div className="als-news-body">
                    <div className="als-news-meta">
                      <span className="als-news-cat">{item.category || "기타"}</span>
                      <span className="als-news-date">
                        {formatPublishedDate(item.published_at || item.created_at)}
                      </span>
                    </div>

                    <div className="als-news-item-title">{item.title || "제목 없음"}</div>

                    <div className="als-news-meta" style={{ marginTop: 8 }}>
                      <span className="als-news-cat">{item.press_name || "기타"}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="als-pagination">
              <button
                type="button"
                className="als-page-btn"
                onClick={() => handlePageChange(currentPage - PAGINATION_GROUP_SIZE)}
                disabled={currentPage <= 1}
                aria-label="10페이지 이전"
              >
                ◀◀
              </button>

              <button
                type="button"
                className="als-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="이전 페이지"
              >
                ◀
              </button>

              {visiblePages.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`als-page-btn ${num === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="als-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="다음 페이지"
              >
                ▶
              </button>

              <button
                type="button"
                className="als-page-btn"
                onClick={() => handlePageChange(currentPage + PAGINATION_GROUP_SIZE)}
                disabled={currentPage >= totalPages}
                aria-label="10페이지 다음"
              >
                ▶▶
              </button>
            </div>
          </>
        )}
      </section>

      <SideMenuCard collapsible />

      <div className="als-floating-tools">
        <button
          type="button"
          className="als-fab dark"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="m12 6 8 8-1.4 1.4L12 8.8l-6.6 6.6L4 14l8-8Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
