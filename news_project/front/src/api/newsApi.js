import axios from "axios";

//  fetchNews export
export const fetchNews = ({ page = 1, size = 30, q, dateFrom, dateTo }, config = {}) => {
  return axios.get(`/news`, {
    params: {
      page,
      size,
      q,
      date_from: dateFrom,
      date_to: dateTo,
    },
    ...config,
  });
};
