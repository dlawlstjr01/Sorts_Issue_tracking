const axios = require("axios");

const STDICT_SEARCH_API_URL = "https://stdict.korean.go.kr/api/search.do";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function toText(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (typeof value["#text"] === "string") return value["#text"].trim();
    if (typeof value.$t === "string") return value.$t.trim();
  }
  return String(value).trim();
}

function normalizeSearchResponse(data) {
  const error = data?.error;
  if (error) {
    const message = toText(error.message) || "사전 API 호출 중 오류가 발생했습니다.";
    const failure = new Error(message);
    failure.statusCode = 502;
    throw failure;
  }

  const channel = data?.channel || {};
  const total = Number(toText(channel.total) || 0);
  const rawItems = toArray(channel.item);

  const items = rawItems.map((item, index) => {
    const senses = toArray(item?.sense)
      .map((sense, senseIndex) => ({
        senseOrder: toText(sense?.sense_order) || String(senseIndex + 1),
        definition: toText(sense?.definition),
        type: toText(sense?.type),
        link: toText(sense?.link),
      }))
      .filter((sense) => sense.definition);

    const targetCode = toText(item?.target_code);
    const word = toText(item?.word);

    return {
      key: `${targetCode || word || "item"}-${index}`,
      targetCode,
      word,
      supNo: toText(item?.sup_no),
      pronunciation: toText(item?.pronunciation),
      wordGrade: toText(item?.word_grade),
      pos: toText(item?.pos),
      link: senses.find((sense) => sense.link)?.link || "",
      senses,
    };
  });

  return { total, items };
}

async function searchDictionary(keyword) {
  const q = String(keyword || "").trim();

  if (!q) {
    return {
      total: 0,
      items: [],
    };
  }

  const apiKey = String(process.env.STDICT_API_KEY || "").trim();
  if (!apiKey) {
    const error = new Error("STDICT_API_KEY가 설정되지 않았습니다.");
    error.statusCode = 500;
    throw error;
  }

  const response = await axios.get(STDICT_SEARCH_API_URL, {
    params: {
      key: apiKey,
      req_type: "json",
      q,
      start: 1,
      num: 10,
    },
    timeout: 10000,
  });

  return normalizeSearchResponse(response.data);
}

module.exports = {
  searchDictionary,
};
