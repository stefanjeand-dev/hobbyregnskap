// Fargepalett, standardkategorier og lagringsnøkler.
// Palett «Nattledger» – mørk, kullblå bunn med pergament-tekst (se teknisk brief).

export const COLORS = {
  paper: "#1E232B",
  paperDark: "#161A20",
  card: "#262C36",
  ink: "#EDE7D8",
  inkSoft: "#9A8F7E",
  income: "#7FA88C",
  incomeBg: "#28352C",
  expense: "#E0876A",
  expenseBg: "#3A2A24",
  line: "#3A3F48",
  gold: "#D4AF6A",
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
