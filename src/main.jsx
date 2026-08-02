import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

// Self-hostede fonter – bundles i appen, ingen runtime-nettverkskall.
// Familienavnene ("Fraunces", "Inter", "IBM Plex Mono") matcher font-family i koden.
// Kun latin + latin-ext-subsett (dekker æøå) for å holde offline-precache liten.
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/fraunces/latin-700.css";
import "@fontsource/fraunces/latin-ext-500.css";
import "@fontsource/fraunces/latin-ext-600.css";
import "@fontsource/fraunces/latin-ext-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-ext-400.css";
import "@fontsource/inter/latin-ext-500.css";
import "@fontsource/inter/latin-ext-600.css";
import "@fontsource/inter/latin-ext-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-ext-500.css";
import "@fontsource/ibm-plex-mono/latin-ext-600.css";

import "./index.css";
import App from "./App.jsx";

// Registrer service worker (produksjon). autoUpdate → ny versjon aktiveres selv.
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
