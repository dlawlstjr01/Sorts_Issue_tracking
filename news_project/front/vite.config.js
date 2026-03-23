import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const BACKEND_TARGET = "http://127.0.0.1:5000";
const PROXY_PATHS = [
  "/auth",
  "/news",
  "/log",
  "/reco",
  "/tracking",
  "/issue-archives",
  "/user-log",
];

function createProxyOptions() {
  return {
    target: BACKEND_TARGET,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    configure(proxy) {
      proxy.on("error", (err, req, res) => {
        const method = req?.method || "REQ";
        const url = req?.url || "";
        const code = err?.code || "PROXY_ERROR";

        console.error(`[vite-proxy] ${method} ${url} -> ${BACKEND_TARGET} (${code})`);

        if (!res || typeof res.writeHead !== "function") return;
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        }
        if (!res.writableEnded) {
          res.end(JSON.stringify({ message: "Backend connection failed" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/news": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/log": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/reco": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/tracking": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/issue-archives": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/user-log": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/search": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/notices": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
