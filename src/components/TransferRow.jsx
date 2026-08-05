import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";

// Én overføringsrad til/fra driftskonto. Retning styres av transfer.type
// ('in' | 'out'); gamle poster uten type behandles som 'in' (innskudd).
// Beløpet vises alltid i gull, med fortegn etter retning.
export default function TransferRow({ transfer, onEdit, onDelete }) {
  const isOut = transfer.type === "out";
  return (
    <div
      className="flex items-center justify-between py-3 gap-3"
      style={{ borderBottom: `1px solid ${COLORS.line}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 32, height: 32, background: COLORS.card, color: COLORS.gold }}
        >
          {isOut ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: COLORS.ink }}>
            {isOut ? "Ut fra driftskonto" : "Inn til driftskonto"}
          </p>
          <p className="text-xs truncate" style={{ color: COLORS.inkSoft }}>
            {new Date(transfer.date + "T00:00:00").toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {transfer.comment ? ` · ${transfer.comment}` : ""}
          </p>
        </div>
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
          {isOut ? "−" : "+"}
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
