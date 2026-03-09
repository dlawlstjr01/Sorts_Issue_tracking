import axios from "axios";

// fetchNews export
export const fetchNews = (
  { page = 1, size = 100, q = "", dateFrom = null, dateTo = null },
  config = {}
) => {
  const params = { page, size, q };

  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  return axios.get("/news", { params, ...config });
};

export const fetchIssues = ({ category = "", limit = 6 } = {}) => {
  return axios.get("/tracking/issues", {
    params: { category, limit }
  });
};