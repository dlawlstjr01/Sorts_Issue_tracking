import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/news": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/log": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/reco": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/tracking": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});