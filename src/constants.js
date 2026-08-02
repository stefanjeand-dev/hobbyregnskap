// Fargepalett, standardkategorier og lagringsnøkler.
// Videreført uendret fra artefaktet (HobbyRegnskap.jsx).

export const COLORS = {
  paper: "#E7E2D0",
  paperDark: "#DBD3B8",
  card: "#F1ECDD",
  ink: "#252B1E",
  inkSoft: "#6B6D5A",
  income: "#3F6B52",
  incomeBg: "#DFE7DC",
  expense: "#A3492F",
  expenseBg: "#F0DED4",
  line: "#C6BC9C",
  gold: "#AD8226",
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
