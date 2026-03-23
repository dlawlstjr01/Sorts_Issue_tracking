import axios from "axios";

let glossaryCache = null;
const GLOSSARY_CACHE_KEY = "glossaryCache:v1";

function readGlossaryCache() {
  if (glossaryCache) return glossaryCache;
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(GLOSSARY_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : null;
    if (!items) return null;

    glossaryCache = items;
    return items;
  } catch (error) {
    console.error("failed to read glossary cache:", error);
    return null;
  }
}

function writeGlossaryCache(items) {
  glossaryCache = Array.isArray(items) ? items : [];
  if (typeof window === "undefined") return glossaryCache;

  try {
    sessionStorage.setItem(
      GLOSSARY_CACHE_KEY,
      JSON.stringify({
        items: glossaryCache,
      })
    );
  } catch (error) {
    console.error("failed to write glossary cache:", error);
  }

  return glossaryCache;
}

export async function fetchGlossary() {
  const cached = readGlossaryCache();
  if (cached) return cached;

  const res = await axios.get("/search/glossary");
  return writeGlossaryCache(res.data?.glossary || []);
}
