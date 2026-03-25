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

export const fetchIssueKeywords = async () => {
  const response = await axios.get("/tracking/keywords", {
    withCredentials: true,
  });

  return Array.isArray(response?.data?.items) ? response.data.items : [];
};

export const saveIssueKeyword = async (keyword) => {
  const response = await axios.post(
    "/tracking/keywords",
    { keyword },
    { withCredentials: true }
  );

  return Array.isArray(response?.data?.items) ? response.data.items : [];
};

export const deleteIssueKeyword = async (keywordId) => {
  await axios.delete(`/tracking/keywords/${encodeURIComponent(keywordId)}`, {
    withCredentials: true,
  });
};

export const fetchKeywordAlerts = async (limit = 120) => {
  const response = await axios.get("/tracking/keyword-alerts", {
    params: { limit },
    withCredentials: true,
  });

  const data = response?.data || {};
  return {
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    items: Array.isArray(data.items) ? data.items : [],
    unreadCount: Number(data.unreadCount || 0),
  };
};

export const markKeywordAlertRead = async ({ keywordId, issueSummaryId }) => {
  await axios.post(
    "/tracking/keyword-alerts/read",
    { keywordId, issueSummaryId },
    { withCredentials: true }
  );
};

export const markAllKeywordAlertsRead = async () => {
  await axios.post(
    "/tracking/keyword-alerts/read-all",
    {},
    { withCredentials: true }
  );
};
