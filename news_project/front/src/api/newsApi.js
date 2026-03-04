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