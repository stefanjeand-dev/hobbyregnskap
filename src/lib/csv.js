// CSV-eksport for regnskapsformål (Excel / regnskapsfører / Skatteetaten).
// Logikken er videreført uendret fra artefaktet.

import { slugify } from "./format";

// BOM (U+FEFF) foran innholdet slik at Excel tolker æøå riktig.
// Bygges fra tegnkode for å holde kilden ren ASCII (ingen usynlige tegn).
const BOM = String.fromCharCode(0xfeff);

const csvField = (val) => {
  const str = String(val ?? "");
  return /[;"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const buildCsv = (txns, projectsById) => {
  const header = ["Prosjekt", "Dato", "Type", "Kategori", "Beløp (kr)", "Kommentar"];
  const rows = [...txns]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => [
      projectsById[t.projectId] || "",
      t.date,
      t.type === "income" ? "Inntekt" : "Utgift",
      t.category,
      String(t.amount).replace(".", ","),
      t.comment || "",
    ]);
  return [header, ...rows].map((r) => r.map(csvField).join(";")).join("\r\n");
};

// Generisk nedlasting av en Blob – delt mellom CSV- og JSON-eksport.
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadCsv = (csvContent, filename) => {
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, filename);
};

// Eksporter transaksjoner på tvers av prosjekter for valgt år.
// `transactions` er allerede filtrert på året; `year` inngår i filnavnet.
export const exportAllCsv = (transactions, projectsById, year) => {
  const csv = buildCsv(transactions, projectsById);
  downloadCsv(csv, `hobbyregnskap-alle-prosjekter-${year}.csv`);
};

// Eksporter ett prosjekts transaksjoner for valgt år.
// `transactions` er allerede filtrert på året; `year` inngår i filnavnet.
export const exportProjectCsv = (project, transactions, projectsById, year) => {
  const txns = transactions.filter((t) => t.projectId === project.id);
  const csv = buildCsv(txns, projectsById);
  downloadCsv(csv, `hobbyregnskap-${slugify(project.name)}-${year}.csv`);
};

// Eksporter driftskonto-bevegelsene for valgt år (egen struktur, ikke
// transaksjoner). `transfers` er allerede filtrert på året; `year` inngår i
// filnavnet. Retning ('in'/'out') skrives som «Inn»/«Ut»; poster uten type = «Inn».
export const exportTransfersCsv = (transfers, year) => {
  const header = ["Dato", "Type", "Beløp (kr)", "Kommentar"];
  const rows = [...transfers]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => [
      t.date,
      t.type === "out" ? "Ut" : "Inn",
      String(t.amount).replace(".", ","),
      t.comment || "",
    ]);
  const csv = [header, ...rows].map((r) => r.map(csvField).join(";")).join("\r\n");
  downloadCsv(csv, `hobbyregnskap-driftskonto-${year}.csv`);
};
