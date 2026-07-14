import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // المشروع على بارتيشن قد لا تعمل عليه مراقبة الملفات تلقائيًا، فنستخدم polling حتى يعمل التحديث اللحظي بثبات.
    watch: { usePolling: true, interval: 250 },
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
