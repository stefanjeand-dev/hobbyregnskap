import { X } from "lucide-react";
import { COLORS } from "../constants";

// Skjema-container. Bunn-ark på mobil, sentrert modal på desktop (≥1024px).
// Kun layout/plassering endres via CSS – samme komponent overalt.
export default function Sheet({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
      style={{ background: "rgba(37,43,30,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-2xl lg:rounded-2xl px-5 pt-5 max-h-[88vh] lg:max-h-[85vh] overflow-y-auto lg:shadow-xl"
        style={{
          background: COLORS.paper,
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-semibold"
            style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}
          >
            {title}
          </h2>
          <button onClick={onClose} aria-label="Lukk" className="p-1">
            <X size={20} style={{ color: COLORS.inkSoft }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
