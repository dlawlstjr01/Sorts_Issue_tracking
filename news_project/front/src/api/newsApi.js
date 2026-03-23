import axios from "axios";

// 기사 목록 조회
export const fetchNews = (
  {
    page = 1,
    size = 100,
    q = "",
    dateFrom = null,
    dateTo = null,
    presses = [],
    includePresses = false,
    includeTotal = true,
  },
  config = {}
) => {
  const params = { page, size, q };

  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  if (Array.isArray(presses) && presses.length > 0) {
    params.press = presses.join(",");
  }
  if (includePresses) {
    params.include_presses = 1;
  }
  if (!includeTotal) {
    params.include_total = 0;
  }

  return axios.get("/news", { params, ...config });
};

// 기사 상세 조회
export const getNewsById = (id, config = {}) => {
  const articleId = String(id ?? "").trim();

  if (!articleId) {
    return Promise.reject(new Error("article id is required"));
  }

  return axios.get(`/news/${encodeURIComponent(articleId)}`, config);
};

// 이슈 목록 조회
export const getIssues = async (config = {}) => {
  const response = await axios.get("/news/issues", {
    withCredentials: true,
    ...config,
  });

  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

// 기사 단건 조회 (이슈에서 article_id로 본문 조회할 때 사용)
export const getIssueArticleById = async (id, config = {}) => {
  const articleId = String(id ?? "").trim();

  if (!articleId) {
    return null;
  }

  const response = await axios.get(`/news/articles/${encodeURIComponent(articleId)}`, {
    withCredentials: true,
    ...config,
  });

  return response?.data || null;
};

// 국어사전 검색
export async function searchKoreanDictionary(keyword) {
  const q = String(keyword || "").trim();

  if (!q) {
    return {
      total: 0,
      items: [],
    };
  }

  const response = await axios.get("/news/dictionary/search", {
    params: { q },
  });

  return response.data;
}

// 공지사항 조회
export const fetchNotices = (config = {}) => {
  return axios.get("/notices", config);
};