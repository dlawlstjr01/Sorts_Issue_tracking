import axios from "axios";

// fetchNews export
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

export const getNewsById = (id, config = {}) => {
  const articleId = String(id ?? "").trim();
  if (!articleId) {
    return Promise.reject(new Error("article id is required"));
  }
  return axios.get(`/news/${encodeURIComponent(articleId)}`, config);
};

export const fetchIssues = ({ category = "", limit = 6 } = {}) => {
  return axios.get("/tracking/issues", {
    params: { category, limit },
  });
};

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
