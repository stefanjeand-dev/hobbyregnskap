import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Genererer PWA-ikoner + favicon + apple-touch-icon fra én kilde-SVG.
// Kjør: npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: minimal2023Preset,
  images: ["public/icon.svg"],
});
