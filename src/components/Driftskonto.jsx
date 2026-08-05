import { useMemo } from "react";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";
import { exportTransfersCsv } from "../lib/csv";
import TransferRow from "./TransferRow";

// Driftskonto: overføringer til sparekonto, på tvers av alle prosjekter.
// Bevisst adskilt fra transaksjonene – påvirker ikke resultat/netto eller
// kategorinedbrytningen noe sted. Full mobilskjerm, eller høyre kolonne på desktop.
// Følger samme mønster som ProjectDetail (CSV-knapp, inline/FAB «+», rad-handlinger).
export default function Driftskonto({
  transfers,
  transfersTotal,
  isDesktop = false,
  onBack,
  onAddTransfer,
  onEditTransfer,
  onDeleteTransfer,
}) {
  const sorted = useMemo(
    () => [...transfers].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [transfers]
  );

  const pad = isDesktop ? "" : "px-5";

  return (
    <div className={isDesktop ? "" : "pt-8 pb-4"}>
      {/* Header */}
      <div className={pad}>
        <div className="flex items-center justify-between mb-4">
          {!isDesktop ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs"
              style={{ color: COLORS.inkSoft }}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {transfers.length > 0 && (
              <button
                onClick={() => exportTransfersCsv(transfers)}
                className="flex items-center gap-1 text-xs"
                style={{ color: COLORS.inkSoft }}
                aria-label="Eksporter driftskonto til CSV"
              >
                <Download size={13} /> CSV
              </button>
            )}
            {isDesktop && (
              <button
                onClick={onAddTransfer}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: COLORS.ink, color: COLORS.paper }}
              >
                <Plus size={14} /> Ny overføring
              </button>
            )}
          </div>
        </div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}
        >
          Driftskonto
        </h1>
        <p className="text-xs mt-1 mb-2" style={{ color: COLORS.inkSoft }}>
          Penger flyttet til sparekonto — påvirker ikke resultatet
        </p>
        <span
          className="text-2xl block"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: COLORS.gold,
          }}
        >
          {formatKr(transfersTotal)}
        </span>
      </div>

      {/* Liste */}
      <div className={`${pad} mt-4`}>
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: COLORS.inkSoft }}>
            Ingen overføringer registrert ennå.
          </div>
        ) : (
          sorted.map((t) => (
            <TransferRow
              key={t.id}
              transfer={t}
              onEdit={onEditTransfer}
              onDelete={onDeleteTransfer}
            />
          ))
        )}
      </div>

      {/* Flytende «+»-knapp (kun mobil) */}
      {!isDesktop && (
        <button
          onClick={onAddTransfer}
          className="fixed left-1/2 -translate-x-1/2 fab-offset flex items-center justify-center rounded-full shadow-lg z-40"
          style={{ width: 56, height: 56, background: COLORS.ink }}
          aria-label="Ny overføring"
        >
          <Plus size={24} color={COLORS.paper} />
        </button>
      )}
    </div>
  );
}
