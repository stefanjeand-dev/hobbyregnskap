// JSON-eksport/import for manuell synk mellom egne enheter.
// Full-fidelity: bevarer prosjekter, transaksjoner, id-er og egne kategorier,
// slik at import gjenskaper nøyaktig samme tilstand på mottakende enhet.

import { APP_ID, BACKUP_VERSION } from "../constants";
import { todayISO } from "./format";
import { downloadBlob } from "./csv";
import { normalizeData } from "./storage";

// Bygg konvolutten som skrives til fil.
export const buildBackup = (data) => ({
  app: APP_ID,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  data: {
    projects: data.projects,
    transactions: data.transactions,
    customCategories: data.customCategories,
  },
});

const backupFilename = () => `hobbyregnskap-backup-${todayISO()}.json`;

// Eksporter: prøv native del (navigator.share med fil) på mobil, med vanlig
// nedlasting som fallback (desktop / manglende støtte).
// Returnerer "shared" | "downloaded" | "cancelled".
export const shareOrDownloadJson = async (data) => {
  const json = JSON.stringify(buildBackup(data), null, 2);
  const filename = backupFilename();
  const blob = new Blob([json], { type: "application/json" });

  if (typeof navigator !== "undefined" && typeof navigator.canShare === "function") {
    try {
      const file = new File([blob], filename, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Hobbyregnskap – sikkerhetskopi",
          text: "Sikkerhetskopi av hobbyregnskapet (JSON).",
        });
        return "shared";
      }
    } catch (err) {
      // Bruker avbrøt delingen bevisst → ikke last ned i tillegg.
      if (err && err.name === "AbortError") return "cancelled";
      // Annen delingsfeil → fall videre til nedlasting under.
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
};

// Parse + valider en importfil. Kaster Error med lesbar melding ved feil.
// Godtar både konvolutt ({ app, data }) og en rå datastruktur.
export const parseBackup = (text) => {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("Filen er ikke gyldig JSON.");
  }

  const payload = obj && obj.app === APP_ID && obj.data ? obj.data : obj;

  if (
    !payload ||
    !Array.isArray(payload.projects) ||
    !Array.isArray(payload.transactions)
  ) {
    throw new Error(
      "Fant ikke gyldige hobbyregnskap-data i filen (mangler prosjekter/transaksjoner)."
    );
  }

  return normalizeData(payload);
};
