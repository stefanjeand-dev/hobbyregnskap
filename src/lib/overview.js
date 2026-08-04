// Ren funksjon som beregner måned/år/kategori/graf-data fra en liste
// transaksjoner. Delt mellom per-prosjekt-oversikten (ProjectDetail) og den
// samlede oversikten over alle prosjekter (AllOverview) – ingen duplisert logikk.
//
// Aggregerer i én gjennomgang: rekkefølgen på input spiller ingen rolle.

import { monthShort } from "./format";

export const buildOverview = (txns) => {
  const monthlyMap = {};
  const yearlyMap = {};
  const catMap = { income: {}, expense: {} };

  txns.forEach((t) => {
    const mKey = t.date.slice(0, 7);
    const yKey = t.date.slice(0, 4);
    if (!monthlyMap[mKey]) monthlyMap[mKey] = { key: mKey, income: 0, expense: 0 };
    if (!yearlyMap[yKey]) yearlyMap[yKey] = { key: yKey, income: 0, expense: 0 };
    if (t.type === "income") {
      monthlyMap[mKey].income += t.amount;
      yearlyMap[yKey].income += t.amount;
    } else {
      monthlyMap[mKey].expense += t.amount;
      yearlyMap[yKey].expense += t.amount;
    }
    catMap[t.type][t.category] = (catMap[t.type][t.category] || 0) + t.amount;
  });

  // Nyeste først (samme som før).
  const monthlyData = Object.values(monthlyMap).sort((a, b) => (a.key < b.key ? 1 : -1));
  const yearlyData = Object.values(yearlyMap).sort((a, b) => (a.key < b.key ? 1 : -1));

  // Sortert synkende på beløp per kategori.
  const toSortedList = (map) =>
    Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

  const categoryBreakdown = {
    income: toSortedList(catMap.income),
    expense: toSortedList(catMap.expense),
  };

  // Graf: eldste → nyeste for de siste 12 månedene.
  const chartData = monthlyData
    .slice(0, 12)
    .slice()
    .reverse()
    .map((m) => ({ name: monthShort(m.key), Inntekt: m.income, Utgift: m.expense }));

  return { monthlyData, yearlyData, categoryBreakdown, chartData };
};
