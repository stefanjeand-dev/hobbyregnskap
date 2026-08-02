import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Hobbyregnskap – frittstående, installerbar PWA.
// Alt kjører klient-side (localStorage), ingen runtime-nettverkskall.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        name: "Hobbyregnskap",
        short_name: "Hobbyregnskap",
        description:
          "Enkelt regnskap for hobbyprosjekter – inntekter, utgifter og resultat. Alt lagres lokalt på enheten din.",
        lang: "nb",
        theme_color: "#E7E2D0",
        background_color: "#E7E2D0",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache hele app-shellet → full offline-støtte.
        // Kun woff2 (ikke legacy woff) – alle moderne nettlesere støtter woff2.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        // Service worker kun i produksjonsbygg; testes via `npm run preview`.
        enabled: false,
      },
    }),
  ],
});
