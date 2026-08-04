import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";
import { buildOverview } from "../lib/overview";
import OverviewContent from "./OverviewContent";

// Samlet oversikt på tvers av alle prosjekter. Bruker samme buildOverview +
// OverviewContent som per-prosjekt-visningen, men på hele transaksjonssettet.
// Full mobilskjerm, eller høyre kolonne på desktop.
export default function AllOverview({ transactions, overallTotal, isDesktop = false, onBack }) {
  const overview = useMemo(() => buildOverview(transactions), [transactions]);
  const pad = isDesktop ? "" : "px-5";

  return (
    <div className={isDesktop ? "" : "pt-8 pb-4"}>
      <div className={pad}>
        {!isDesktop && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs mb-4"
            style={{ color: COLORS.inkSoft }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
        )}
        <h1
          className="text-2xl"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}
        >
          Alle prosjekter
        </h1>
        <span
          className="text-2xl block mt-1"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: overallTotal >= 0 ? COLORS.income : COLORS.expense,
          }}
        >
          {overallTotal >= 0 ? "+" : ""}
          {formatKr(overallTotal)}
        </span>
      </div>

      <div className={`${pad} mt-4`}>
        <OverviewContent {...overview} />
      </div>
    </div>
  );
}
