// Rene hjelpefunksjoner for id-er, datoer og formatering.
// Videreført uendret fra artefaktet.

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatKr = (n) => `${Math.round(n).toLocaleString("nb-NO")} kr`;

export const monthLabel = (key) => {
  const d = new Date(key + "-02");
  const s = d.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const monthShort = (key) => {
  const d = new Date(key + "-02");
  const s = d.toLocaleDateString("nb-NO", { month: "short" });
  return s.replace(".", "");
};

// NFD-dekomponer, fjern kombinerende diakritiske merker, deretter slug.
// Tilsvarer accent-fjerningen i artefaktet, men med ren ASCII-kilde (\p{Mn}).
export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
