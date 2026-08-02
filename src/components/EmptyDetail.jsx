import { FolderPlus, ChevronLeft } from "lucide-react";
import { COLORS } from "../constants";

// Desktop-placeholder i høyre kolonne når ingen prosjekter finnes / er valgt.
export default function EmptyDetail({ hasProjects, onAddProject }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-2xl h-full min-h-[60vh] px-8"
      style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.inkSoft }}
    >
      {hasProjects ? (
        <>
          <ChevronLeft size={28} style={{ color: COLORS.line }} />
          <p className="text-sm mt-3">Velg et prosjekt til venstre</p>
          <p className="text-xs mt-1">for å se transaksjoner og oversikt.</p>
        </>
      ) : (
        <>
          <FolderPlus size={28} style={{ color: COLORS.line }} />
          <p className="text-sm mt-3">Ingen prosjekter ennå.</p>
          <button
            onClick={onAddProject}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: COLORS.ink, color: COLORS.paper }}
          >
            Opprett ditt første prosjekt
          </button>
        </>
      )}
    </div>
  );
}
