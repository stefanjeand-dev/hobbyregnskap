import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serverer prosjektsider under /<repo>/, så appen ligger på
// https://<bruker>.github.io/hobbyregnskap/. `base` må matche dette slik at
// alle asset-URL-er, manifestet og service worker-scope blir riktige.
// (Sett til "/" om du senere flytter til eget domene eller <bruker>.github.io.)
const base = "/hobbyregnskap/";

// Hobbyregnskap – frittstående, installerbar PWA.
// Alt kjører klient-side (localStorage), ingen runtime-nettverkskall.
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        id: base,
        name: "Hobbyregnskap",
        short_name: "Hobbyregnskap",
        description:
          "Enkelt regnskap for hobbyprosjekter – inntekter, utgifter og resultat. Alt lagres lokalt på enheten din.",
        lang: "nb",
        theme_color: "#E7E2D0",
        background_color: "#E7E2D0",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
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
