// Fargepalett, standardkategorier og lagringsnøkler.
// Palett «Tømmer» – varm, kobber/mose-basert (se teknisk brief).

export const COLORS = {
  paper: "#EFE6D8",
  paperDark: "#E1D2B8",
  card: "#F7F0E3",
  ink: "#3B2A20",
  inkSoft: "#8A7361",
  income: "#5C7A4C",
  incomeBg: "#E2E8D9",
  expense: "#BE5B2E",
  expenseBg: "#F3DFCF",
  line: "#D9C6A8",
  gold: "#A67C2E",
};

export const DEFAULT_CATEGORIES = {
  income: ["Salg", "Oppdrag", "Donasjon", "Refusjon", "Annet"],
  expense: ["Materialer", "Utstyr", "Kurs", "Frakt", "Programvare", "Annet"],
};

// localStorage-nøkkel for hele datasettet.
export const STORAGE_KEY = "hobbyregnskap-data";

// Brukes til å merke JSON-sikkerhetskopier (se lib/backup.js).
export const APP_ID = "hobbyregnskap";
export const BACKUP_VERSION = 1;
