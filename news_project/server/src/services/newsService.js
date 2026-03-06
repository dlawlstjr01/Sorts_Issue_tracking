const db = require("../config/DB");

function makeError(message, statusCode) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeDomain(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function normalizeHost(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
}

function extractHostFromUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || ""));
    return normalizeHost(url.hostname);
  } catch (_) {
    return "";
  }
}

function sortPressNames(items) {
  const isKoreanStart = (value) => /^[가-힣]/.test(value);
  const isEnglishStart = (value) => /^[A-Za-z]/.test(value);
  const groupRank = (value) => {
    if (isKoreanStart(value)) return 0;
    if (isEnglishStart(value)) return 1;
    return 2;
  };

  return [...items].sort((a, b) => {
    const rankA = groupRank(a);
    const rankB = groupRank(b);
    if (rankA !== rankB) return rankA - rankB;
    if (rankA === 1) {
      return a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
    }
    return a.localeCompare(b, "ko", { sensitivity: "base", numeric: true });
  });
}

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

const PRESS_TO_DOMAINS = new Map(
  PRESS_DOMAIN_RULES.map(({ press, domains }) => [
    press,
    [...new Set((domains || []).map(normalizeDomain).filter(Boolean))],
  ])
);

const DOMAIN_TO_PRESS_RULES = PRESS_DOMAIN_RULES.flatMap(({ press, domains }) =>
  (domains || []).map((domain) => ({
    press,
    domain: normalizeDomain(domain),
  }))
)
  .filter((rule) => rule.domain)
  .sort((a, b) => b.domain.length - a.domain.length);

const HOST_SQL =
  "LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(url, '//', -1), '/', 1), ':', 1))";
const MAX_VISIBLE_PAGES = 3000;
const MAX_KEYWORD_PRESS_DOMAINS = 40;

function resolvePressByHost(rawHost) {
  const host = normalizeHost(rawHost);
  if (!host) return null;
  for (const rule of DOMAIN_TO_PRESS_RULES) {
    if (host === rule.domain || host.endsWith(`.${rule.domain}`)) {
      return rule.press;
    }
  }
  return null;
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
    if (tail.length < 2 || tail.length > 24) continue;
    if (!/[가-힣A-Za-z]/.test(tail)) continue;
    if (/기자$/.test(tail)) continue;
    if (/(신문|일보|뉴스|경제|저널|타임즈|투데이|TV|방송|포스트|리포트)$/i.test(tail)) {
      return tail;
    }
  }

  return null;
}

function appendPressWhere(where, params, pressNames) {
  if (!Array.isArray(pressNames) || pressNames.length === 0) return;

  const pressGroups = [];
  for (const rawName of pressNames) {
    const pressName = String(rawName || "").trim();
    if (!pressName) continue;
    const domains = PRESS_TO_DOMAINS.get(pressName);
    if (!domains || domains.length === 0) {
      pressGroups.push("(title LIKE ? OR content LIKE ?)");
      params.push(`%${pressName}%`, `%${pressName}%`);
      continue;
    }

    const domainGroups = [];
    for (const domain of domains) {
      domainGroups.push(`(${HOST_SQL} = ? OR ${HOST_SQL} LIKE ?)`);
      params.push(domain, `%.${domain}`);
    }

    if (domainGroups.length) {
      pressGroups.push(`(${domainGroups.join(" OR ")})`);
    }
  }

  if (pressGroups.length) {
    where.push(`(${pressGroups.join(" OR ")})`);
  }
}

function appendKeywordWhere(where, params, rawKeyword) {
  const keyword = String(rawKeyword || "").trim();
  if (!keyword) return;

  const searchGroups = ["title LIKE ?", "content LIKE ?"];
  params.push(`%${keyword}%`, `%${keyword}%`);

  const keywordLower = keyword.toLowerCase();
  const matchedDomains = new Set();

  for (const [pressName, domains] of PRESS_TO_DOMAINS.entries()) {
    if (!String(pressName || "").toLowerCase().includes(keywordLower)) continue;
    for (const domain of domains || []) {
      if (!domain) continue;
      matchedDomains.add(domain);
      if (matchedDomains.size >= MAX_KEYWORD_PRESS_DOMAINS) break;
    }
    if (matchedDomains.size >= MAX_KEYWORD_PRESS_DOMAINS) break;
  }

  const keywordDomain = normalizeDomain(keyword);
  if (keywordDomain && keywordDomain.includes(".")) {
    matchedDomains.add(keywordDomain);
  }

  for (const domain of matchedDomains) {
    searchGroups.push(`(${HOST_SQL} = ? OR ${HOST_SQL} LIKE ?)`);
    params.push(domain, `%.${domain}`);
  }

  where.push(`(${searchGroups.join(" OR ")})`);
}

exports.listArticles = async ({
  page,
  size,
  category,
  q,
  date_from,
  date_to,
  press,
  include_presses,
}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const s = Math.min(50, Math.max(1, parseInt(size, 10) || 20));
  const offset = (p - 1) * s;
  const cappedTotalLimit = MAX_VISIBLE_PAGES * s;
  const includePresses = String(include_presses || "0") === "1";

  const where = [];
  const params = [];

  if (category) {
    where.push("category = ?");
    params.push(String(category));
  }

  appendKeywordWhere(where, params, q);

  if (date_from && isDateString(date_from)) {
    where.push("DATE(COALESCE(published_at, created_at)) >= ?");
    params.push(String(date_from));
  }

  if (date_to && isDateString(date_to)) {
    where.push("DATE(COALESCE(published_at, created_at)) <= ?");
    params.push(String(date_to));
  }

  const selectedPresses = parseCsv(press);
  appendPressWhere(where, params, selectedPresses);

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRows] = await db.query(
    `
    SELECT COUNT(*) AS cnt
    FROM (
      SELECT id
      FROM articles
      ${whereSql}
      LIMIT ?
    ) AS capped
    `,
    [...params, cappedTotalLimit + 1]
  );
  const total = Math.min(Number(countRows?.[0]?.cnt) || 0, cappedTotalLimit);

  const [rows] = await db.query(
    `
    SELECT id, url, title, thumbnail, category, published_at, created_at
    FROM articles
    ${whereSql}
    ORDER BY (published_at IS NULL), published_at DESC, id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, s, offset]
  );

  const items = rows.map((row) => {
    const pressName = resolvePressByHost(extractHostFromUrl(row.url));
    return { ...row, press_name: pressName || null };
  });

  let presses = [];
  if (includePresses) {
    const [scopeRows] = await db.query(
      `
      SELECT url, title
      FROM articles
      ${whereSql}
      ORDER BY (published_at IS NULL), published_at DESC, id DESC
      LIMIT ?
      `,
      [...params, cappedTotalLimit]
    );

    const pressSet = new Set();
    for (const row of scopeRows) {
      const pressName =
        resolvePressByHost(extractHostFromUrl(row?.url)) ||
        extractPressFromTitleTail(row?.title);
      if (pressName) pressSet.add(pressName);
    }
    presses = sortPressNames(Array.from(pressSet));
  }

  return {
    page: p,
    size: s,
    total,
    items,
    presses,
  };
};

exports.getArticle = async (id) => {
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) throw makeError("id가 올바르지 않습니다.", 400);

  const [rows] = await db.query(
    `
    SELECT id, url, title, thumbnail, content, category, published_at, created_at
    FROM articles
    WHERE id = ?
    LIMIT 1
    `,
    [articleId]
  );

  if (!rows.length) throw makeError("기사를 찾을 수 없습니다.", 404);
  const article = rows[0];
  return {
    ...article,
    press_name: resolvePressByHost(extractHostFromUrl(article.url)),
  };
};

exports.listCategories = async () => {
  const [rows] = await db.query(
    `
    SELECT category, COUNT(*) AS cnt
    FROM articles
    WHERE category IS NOT NULL AND category <> ''
    GROUP BY category
    ORDER BY cnt DESC
    `
  );

  return rows;
};
