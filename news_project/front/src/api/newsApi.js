import axios from "axios";

//  fetchNews export
export const fetchNews = ({ page = 1, size = 100, q }, config = {}) => {
  return axios.get(`/news`, {
    params: { page, size, q },
    ...config,
  });
};