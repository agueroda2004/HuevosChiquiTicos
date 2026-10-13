import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["logo.png", "apple-touch-icon.png"],
      manifest: {
        name: "Huevos ChiquiTicos",
        short_name: "ChiquiTicos",
        description: "Sistema de administración para la granja de codornices.",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#faeed6",
        theme_color: "#2e1405",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      // Local full-stack dev: `pnpm server:dev` (Express on :3001) behind `pnpm dev`.
      "/api": "http://localhost:3001",
    },
  },
});
