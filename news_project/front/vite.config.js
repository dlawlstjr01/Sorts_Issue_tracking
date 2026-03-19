import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

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
    },
  },
});