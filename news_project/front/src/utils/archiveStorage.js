const ARCHIVE_STORAGE_KEY = "archive";
const ARCHIVE_LIMIT = 500;

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function readArchiveList() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw).filter((item) => item && typeof item === "object");
}

export function readArchiveItems() {
  return readArchiveList();
}

function writeArchiveList(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {
    // Ignore storage exceptions.
  }
}

function getCandidateId(item) {
  return (
    item?.id ??
    item?.article_id ??
    item?.articleId ??
    item?.news_id ??
    item?.newsId ??
    ""
  );
}

export function getArchiveItemKey(item) {
  if (!item) return "";
  const raw = item?.raw && typeof item.raw === "object" ? item.raw : item;
  const directId = getCandidateId(item) || getCandidateId(raw);
  if (directId !== null && directId !== undefined && String(directId).trim()) {
    return `id:${String(directId).trim()}`;
  }

  const url = String(raw?.url || raw?.link || item?.url || item?.link || "").trim();
  if (url) return `url:${url}`;

  const title = String(item?.title || raw?.title || "").trim();
  const published = String(
    raw?.published_at || raw?.created_at || item?.published_at || item?.created_at || ""
  ).trim();
  if (title || published) return `title:${title}|published:${published}`;
  return "";
}

export function normalizeArchiveItem(item) {
  const raw = item?.raw && typeof item.raw === "object" ? item.raw : item || {};
  const id =
    getCandidateId(item) ||
    getCandidateId(raw) ||
    raw?.url ||
    raw?.link ||
    item?.url ||
    item?.link ||
    `${Date.now()}`;

  const url = raw?.url || raw?.link || item?.url || item?.link || "";
  const title = item?.title || raw?.title || raw?.headline || "(제목 없음)";
  const category = item?.category || raw?.category || "기타";
  const published =
    raw?.published_at || raw?.created_at || item?.published_at || item?.created_at || "";
  const summary = firstNonEmpty(
    item?.summary,
    raw?.summary,
    item?.short_summary,
    raw?.short_summary,
    item?.ultra_short,
    raw?.ultra_short,
    item?.description,
    raw?.description
  );
  const shortSummary = firstNonEmpty(
    item?.short_summary,
    raw?.short_summary,
    item?.description,
    raw?.description,
    summary
  );
  const ultraShort = firstNonEmpty(item?.ultra_short, raw?.ultra_short, summary);
  const content = firstNonEmpty(
    item?.content,
    raw?.content,
    item?.body,
    raw?.body,
    item?.description,
    raw?.description,
    shortSummary,
    ultraShort
  );

  return {
    id: String(id),
    title,
    category,
    url,
    summary,
    short_summary: shortSummary,
    ultra_short: ultraShort,
    description: firstNonEmpty(item?.description, raw?.description),
    content,
    published_at: published,
    saved_at: new Date().toISOString(),
    raw: {
      ...raw,
      url,
      summary,
      short_summary: shortSummary,
      ultra_short: ultraShort,
      description: firstNonEmpty(item?.description, raw?.description),
      content,
    },
  };
}

export function getArchiveKeySet(items = null) {
  const list = Array.isArray(items) ? items : readArchiveList();
  const keys = new Set();
  list.forEach((entry) => {
    const key = getArchiveItemKey(entry);
    if (key) keys.add(key);
  });
  return keys;
}

export function toggleArchiveItem(item) {
  const key = getArchiveItemKey(item);
  if (!key) {
    return { saved: false, items: readArchiveList(), key: "" };
  }

  const list = readArchiveList();
  const next = [];
  let removed = false;

  for (const entry of list) {
    const entryKey = getArchiveItemKey(entry);
    if (entryKey === key) {
      removed = true;
      continue;
    }
    next.push(entry);
  }

  if (!removed) {
    next.unshift(normalizeArchiveItem(item));
  }

  const limited = next.slice(0, ARCHIVE_LIMIT);
  writeArchiveList(limited);

  return {
    saved: !removed,
    items: limited,
    key,
  };
}

export function upsertArchiveItem(item) {
  const key = getArchiveItemKey(item);
  if (!key) {
    return { upserted: false, items: readArchiveList(), key: "" };
  }

  const normalized = normalizeArchiveItem(item);
  const list = readArchiveList();
  const next = [];
  let replaced = false;

  for (const entry of list) {
    const entryKey = getArchiveItemKey(entry);
    if (entryKey === key) {
      if (!replaced) {
        next.push(normalized);
        replaced = true;
      }
      continue;
    }
    next.push(entry);
  }

  if (!replaced) {
    next.unshift(normalized);
  }

  const limited = next.slice(0, ARCHIVE_LIMIT);
  writeArchiveList(limited);

  return {
    upserted: true,
    replaced,
    items: limited,
    key,
  };
}

export function removeArchiveItem(item) {
  const key = getArchiveItemKey(item);
  if (!key) {
    return { removed: false, items: readArchiveList(), key: "" };
  }

  const list = readArchiveList();
  const next = list.filter((entry) => getArchiveItemKey(entry) !== key);
  writeArchiveList(next);

  return {
    removed: next.length !== list.length,
    items: next,
    key,
  };
}

export function removeArchiveItemsByKeys(keys = []) {
  const keySet = new Set(Array.isArray(keys) ? keys : []);
  if (keySet.size === 0) return { removed: false, items: readArchiveList() };

  const list = readArchiveList();
  const next = list.filter((entry) => !keySet.has(getArchiveItemKey(entry)));
  writeArchiveList(next);

  return {
    removed: next.length !== list.length,
    items: next,
  };
}

export function clearArchiveItems() {
  if (typeof window === "undefined") return { items: [] };
  try {
    window.localStorage.removeItem(ARCHIVE_STORAGE_KEY);
  } catch (_) {
    // Ignore storage exceptions.
  }
  return { items: [] };
}

export { ARCHIVE_STORAGE_KEY };
