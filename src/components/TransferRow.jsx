import { Pencil, Trash2 } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";

// Én overføringsrad til driftskonto: dato, valgfri kommentar, beløp (gull) og
// handlinger. Beløpet er alltid en overføring ut → vises i gull, ikke som +/−.
export default function TransferRow({ transfer, onEdit, onDelete }) {
  return (
    <div
      className="flex items-center justify-between py-3 gap-3"
      style={{ borderBottom: `1px solid ${COLORS.line}` }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: COLORS.ink }}>
          {new Date(transfer.date + "T00:00:00").toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {transfer.comment && (
          <p className="text-xs truncate" style={{ color: COLORS.inkSoft }}>
            {transfer.comment}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: COLORS.gold,
            fontWeight: 600,
          }}
        >
          {formatKr(transfer.amount)}
        </span>
        <button onClick={() => onEdit(transfer)} aria-label="Rediger overføring" className="p-1">
          <Pencil size={15} style={{ color: COLORS.inkSoft }} />
        </button>
        <button onClick={() => onDelete(transfer.id)} aria-label="Slett overføring" className="p-1">
          <Trash2 size={15} style={{ color: COLORS.inkSoft }} />
        </button>
      </div>
    </div>
  );
}
