import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
const base = process.env.PUBLIC_BASE_PATH || "/travel-tips/";
const publicUrl = process.env.PUBLIC_SITE_URL || `https://starrystarry-nights.github.io${base}`;
export default defineConfig({
  root: resolve("standalone"), base,
  publicDir: resolve("public"),
  plugins: [react(), { name: "public-metadata", transformIndexHtml: html => html.replaceAll("__PUBLIC_URL__", publicUrl) }],
  resolve: { alias: { "@": resolve("."), "next/image": resolve("standalone/image.tsx") } },
  build: { outDir: resolve("dist-public"), emptyOutDir: true },
});
