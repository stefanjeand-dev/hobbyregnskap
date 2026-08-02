import { ChevronRight } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";

// Prosjektkort med kvittering-form (takket underkant). `active` uthever det
// valgte prosjektet i desktop-master/detalj-visningen.
export default function ReceiptCard({ project, total, count, onClick, active = false }) {
  const positive = total >= 0;
  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-4 active:scale-[0.98] transition-transform"
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <div
        style={{
          background: COLORS.card,
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 91%, 94% 100%, 88% 91%, 82% 100%, 76% 91%, 70% 100%, 64% 91%, 58% 100%, 52% 91%, 46% 100%, 40% 91%, 34% 100%, 28% 91%, 22% 100%, 16% 91%, 10% 100%, 4% 91%, 0% 100%)",
          paddingBottom: "18px",
          boxShadow: active ? `inset 0 0 0 2px ${COLORS.gold}` : undefined,
        }}
        className="px-5 pt-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}
            >
              {project.name}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>
              {count} {count === 1 ? "transaksjon" : "transaksjoner"}
            </p>
          </div>
          <ChevronRight
            size={18}
            style={{ color: active ? COLORS.gold : COLORS.inkSoft, marginTop: 4 }}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: COLORS.inkSoft }}
          >
            Netto
          </span>
          <span
            className="text-xl"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: positive ? COLORS.income : COLORS.expense,
              fontWeight: 600,
            }}
          >
            {positive ? "+" : ""}
            {formatKr(total)}
          </span>
        </div>
      </div>
    </button>
  );
}
