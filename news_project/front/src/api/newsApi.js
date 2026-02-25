import axios from "axios";

export const fetchNews = ({ page = 1, size = 12, category, q } = {}) => {
  return axios.get("/news", {
    params: { page, size, category, q },
    withCredentials: true, 
  });
};