import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./css/common.css";
import "./css/main.css";
import "./css/sub.css";

function applyFavicon() {
  if (typeof document === "undefined") return;

  const href = "/favicon-news-issue.png?v=1";
  document.title = "News ISSUE TRACKER";
  const links = [
    { rel: "icon", type: "image/png", sizes: "32x32" },
    { rel: "shortcut icon", type: "image/png" },
    { rel: "apple-touch-icon", type: "image/png" },
  ];

  links.forEach(({ rel, type, sizes }) => {
    const selector = `link[rel="${rel}"]`;
    let link = document.head.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      document.head.appendChild(link);
    }

    link.setAttribute("href", href);
    if (type) link.setAttribute("type", type);
    if (sizes) link.setAttribute("sizes", sizes);
  });
}

applyFavicon();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
