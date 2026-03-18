const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "project-db-cgi.smhrd.com",
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || "cgi_25K_DA1_p3_3",
  password: process.env.DB_PASSWORD || "smhrd3",
  database: process.env.DB_NAME || "cgi_25K_DA1_p3_3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

module.exports = db;