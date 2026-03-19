import axios from "axios";

let glossaryCache = null;

export async function fetchGlossary() {
  if (glossaryCache) return glossaryCache;

  const res = await axios.get("/search/glossary");
  glossaryCache = res.data?.glossary || [];
  return glossaryCache;
}