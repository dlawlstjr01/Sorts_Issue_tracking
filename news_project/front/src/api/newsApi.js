import axios from "axios";

//  fetchNews export
export const fetchNews = ({ page = 1, size = 100, q }, config = {}) => {
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
