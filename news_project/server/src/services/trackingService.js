const axios = require("axios");

const BASE = process.env.TRACKING_BASE_URL;

async function getIssues({ category, limit, article_id }) {
  if (!BASE) throw new Error("TRACKING_BASE_URL is not set");

  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  if (article_id) params.article_id = article_id;

  const res = await axios.get(`${BASE}/issues`, {
    params,
    timeout: 30000,
  });

  return res.data;
}

module.exports = { getIssues };