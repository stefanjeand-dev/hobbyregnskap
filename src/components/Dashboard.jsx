import { Settings, FolderPlus, ChevronRight } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";
import ReceiptCard from "./ReceiptCard";

// Prosjektlisten. Full mobilskjerm, eller venstre kolonne på desktop.
export default function Dashboard({
  projects,
  projectTotal,
  projectCount,
  overallTotal,
  transfersTotal,
  activeProjectId,
  onSelect,
  onAddProject,
  onOpenSettings,
  onOpenAllOverview,
  allOverviewActive = false,
  onOpenDriftskonto,
  driftskontoActive = false,
  isDesktop = false,
}) {
  return (
    <div className={isDesktop ? "" : "px-5 pt-8 pb-2"}>
      <div className={`flex items-start justify-between ${isDesktop ? "mb-6" : "pb-2"}`}>
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>
            Hobbyregnskap
          </p>
          <h1
            className="text-2xl mt-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}
          >
            Prosjektene dine
          </h1>
        </div>
        <button onClick={onOpenSettings} className="p-2" aria-label="Innstillinger">
          <Settings size={20} style={{ color: COLORS.inkSoft }} />
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={onOpenAllOverview}
          className="w-full flex items-baseline justify-between py-3 text-left active:opacity-70 transition-opacity"
          style={{ background: "none", border: "none", borderBottom: `1px solid ${COLORS.line}` }}
        >
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: allOverviewActive ? COLORS.gold : COLORS.inkSoft }}
          >
            Samlet netto, alle prosjekter
            <ChevronRight size={14} />
          </span>
          <span
            className="text-lg font-semibold"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: overallTotal >= 0 ? COLORS.income : COLORS.expense,
            }}
          >
            {overallTotal >= 0 ? "+" : ""}
            {formatKr(overallTotal)}
          </span>
        </button>
        <button
          onClick={onOpenDriftskonto}
          className="w-full flex items-baseline justify-between py-3 text-left active:opacity-70 transition-opacity"
          style={{ background: "none", border: "none", borderBottom: `1px solid ${COLORS.line}` }}
        >
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: driftskontoActive ? COLORS.gold : COLORS.inkSoft }}
          >
            Driftskonto
            <ChevronRight size={14} />
          </span>
          <span
            className="text-lg font-semibold"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.gold }}
          >
            {formatKr(transfersTotal)}
          </span>
        </button>
      </div>

      <div>
        {projects.length === 0 && (
          <div
            className="text-center py-12 rounded-xl mb-4"
            style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.inkSoft }}
          >
            <p className="text-sm">Ingen prosjekter ennå.</p>
            <p className="text-xs mt-1">Trykk under for å opprette det første.</p>
          </div>
        )}
        {projects.map((p) => (
          <ReceiptCard
            key={p.id}
            project={p}
            total={projectTotal(p.id)}
            count={projectCount(p.id)}
            active={isDesktop && p.id === activeProjectId}
            onClick={() => onSelect(p.id)}
          />
        ))}
        <button
          onClick={onAddProject}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium mt-1"
          style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.gold }}
        >
          <FolderPlus size={16} /> Nytt prosjekt
        </button>
      </div>
    </div>
  );
}
