// Lagring: 100 % klient-side via localStorage (erstatter artefaktets window.storage).

import { STORAGE_KEY } from "../constants";

// Frisk, tom datastruktur (nytt objekt hver gang → ingen delt referanse).
export const emptyData = () => ({
  projects: [],
  transactions: [],
  transfers: [],
  customCategories: { income: [], expense: [] },
});

// Normaliser en (muligens delvis) struktur til full form.
export const normalizeData = (parsed) => ({
  projects: Array.isArray(parsed?.projects) ? parsed.projects : [],
  transactions: Array.isArray(parsed?.transactions) ? parsed.transactions : [],
  transfers: Array.isArray(parsed?.transfers) ? parsed.transfers : [],
  customCategories: {
    income: Array.isArray(parsed?.customCategories?.income)
      ? parsed.customCategories.income
      : [],
    expense: Array.isArray(parsed?.customCategories?.expense)
      ? parsed.customCategories.expense
      : [],
  },
});

// Les inn datasettet synkront (brukes som lazy initializer i App).
export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return normalizeData(JSON.parse(raw));
  } catch {
    // Korrupt eller utilgjengelig lagring – start tomt.
    return emptyData();
  }
};

// Skriv datasettet. Returnerer true ved suksess, false ved feil
// (f.eks. QuotaExceededError eller privat-modus uten skrivetilgang).
export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};
