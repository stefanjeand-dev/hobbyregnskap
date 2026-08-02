import { TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";

// Én transaksjonsrad med ikon, kategori/dato/kommentar, beløp og handlinger.
export default function TxnRow({ txn, onEdit, onDelete }) {
  const isIncome = txn.type === "income";
  return (
    <div
      className="flex items-center justify-between py-3 gap-3"
      style={{ borderBottom: `1px solid ${COLORS.line}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 32,
            height: 32,
            background: isIncome ? COLORS.incomeBg : COLORS.expenseBg,
            color: isIncome ? COLORS.income : COLORS.expense,
          }}
        >
          {isIncome ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: COLORS.ink }}>
            {txn.category}
          </p>
          <p className="text-xs truncate" style={{ color: COLORS.inkSoft }}>
            {new Date(txn.date + "T00:00:00").toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {txn.comment ? ` · ${txn.comment}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: isIncome ? COLORS.income : COLORS.expense,
            fontWeight: 600,
          }}
        >
          {isIncome ? "+" : "−"}
          {formatKr(txn.amount)}
        </span>
        <button onClick={() => onEdit(txn)} aria-label="Rediger transaksjon" className="p-1">
          <Pencil size={15} style={{ color: COLORS.inkSoft }} />
        </button>
        <button onClick={() => onDelete(txn.id)} aria-label="Slett transaksjon" className="p-1">
          <Trash2 size={15} style={{ color: COLORS.inkSoft }} />
        </button>
      </div>
    </div>
  );
}
