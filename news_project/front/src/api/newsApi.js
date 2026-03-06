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

  return axios.get("/news", { params, ...config });
};

export const getNewsById = (id, config = {}) => {
  return axios.get(`/news/${id}`, config);
};
