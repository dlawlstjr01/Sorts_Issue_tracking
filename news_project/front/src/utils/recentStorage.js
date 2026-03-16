import { getArchiveItemKey, normalizeArchiveItem } from "./archiveStorage";

const RECENT_STORAGE_KEY = "recentArticles";
const RECENT_LIMIT = 200;

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function readRecentList() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw).filter((item) => item && typeof item === "object");
}

function writeRecentList(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {
    // Ignore storage exceptions.
  }
}

function normalizeRecentItem(item) {
  const normalized = normalizeArchiveItem(item);
  return {
    ...normalized,
    viewed_at: new Date().toISOString(),
  };
}

export function addRecentItem(item) {
  const key = getArchiveItemKey(item);
  if (!key) return { items: readRecentList(), key: "" };

  const list = readRecentList();
  const next = [];
  for (const entry of list) {
    if (getArchiveItemKey(entry) === key) continue;
    next.push(entry);
  }
  next.unshift(normalizeRecentItem(item));

  const limited = next.slice(0, RECENT_LIMIT);
  writeRecentList(limited);
  return { items: limited, key };
}

export function removeRecentItem(item) {
  const key = getArchiveItemKey(item);
  if (!key) return { removed: false, items: readRecentList(), key: "" };

  const list = readRecentList();
  const next = list.filter((entry) => getArchiveItemKey(entry) !== key);
  writeRecentList(next);
  return { removed: next.length !== list.length, items: next, key };
}

export { RECENT_STORAGE_KEY };
