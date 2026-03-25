import axios from "axios";

export const getIssues = async () => {
  const response = await axios.get("/news/issues", {
    withCredentials: true,
  });

  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

export const getIssueById = async (id) => {
  if (!id) return null;

  const response = await axios.get(`/news/articles/${id}`, {
    withCredentials: true,
  });

  return response?.data || null;
};