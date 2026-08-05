import { useState } from "react";
import { COLORS } from "../constants";
import { todayISO } from "../lib/format";
import Sheet from "./Sheet";

// Skjema for å legge til / redigere en overføring til driftskonto.
// Egen datastruktur { amount, date, comment } – helt adskilt fra transaksjoner.
export default function AddTransferSheet({ editingTransfer, onSave, onDelete, onClose }) {
  const isEdit = !!editingTransfer;
  // Retning: 'in' = innskudd til driftskonto, 'out' = uttak. Gamle poster
  // uten type-felt behandles som 'in'.
  const [type, setType] = useState(editingTransfer ? editingTransfer.type || "in" : "in");
  const [amount, setAmount] = useState(
    editingTransfer ? String(editingTransfer.amount).replace(".", ",") : ""
  );
  const [date, setDate] = useState(editingTransfer ? editingTransfer.date : todayISO());
  const [comment, setComment] = useState(editingTransfer ? editingTransfer.comment || "" : "");

  const canSave = () => parseFloat(amount.replace(",", ".")) > 0 && date;

  const handleSave = () => {
    const num = parseFloat(amount.replace(",", "."));
    if (!(num > 0)) return;
    onSave(
      { type, amount: num, date, comment: comment.trim() },
      editingTransfer ? editingTransfer.id : null
    );
    onClose();
  };

  return (
    <Sheet
      title={isEdit ? "Rediger overføring" : "Ny overføring — driftskonto"}
      onClose={onClose}
    >
      <div
        className="flex rounded-lg overflow-hidden mb-4"
        style={{ border: `1px solid ${COLORS.line}` }}
      >
        {["in", "out"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="flex-1 py-2.5 text-sm font-medium"
            style={{
              background: type === t ? COLORS.card : "transparent",
              color: type === t ? COLORS.gold : COLORS.inkSoft,
            }}
          >
            {t === "in" ? "Inn til driftskonto" : "Ut fra driftskonto"}
          </button>
        ))}
      </div>

      <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>
        {type === "in"
          ? "Registrerer at penger er flyttet ut av prosjektene og over til sparekontoen din."
          : "Registrerer at penger er tatt ut av sparekontoen og tilbake i bruk."}{" "}
        Påvirker ikke resultat-tallene.
      </p>

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>
        Beløp
      </label>
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-3 rounded-lg text-lg mt-1 mb-4 outline-none"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
        }}
      />

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>
        Dato
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-3 rounded-lg text-sm mt-1 mb-4 outline-none"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
        }}
      />

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>
        Kommentar (valgfritt)
      </label>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="F.eks. Kvartalsoverføring"
        className="w-full px-3 py-3 rounded-lg text-sm mt-1 mb-5 outline-none"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
        }}
      />

      <button
        onClick={handleSave}
        disabled={!canSave()}
        className="w-full py-3 rounded-lg text-sm font-semibold"
        style={{
          background: canSave() ? COLORS.ink : COLORS.line,
          color: COLORS.paper,
          opacity: canSave() ? 1 : 0.7,
        }}
      >
        {isEdit ? "Lagre endringer" : "Lagre overføring"}
      </button>
      {isEdit && (
        <button
          onClick={() => {
            onDelete(editingTransfer.id);
            onClose();
          }}
          className="w-full text-center text-xs mt-3"
          style={{ color: COLORS.expense }}
        >
          Slett denne overføringen
        </button>
      )}
    </Sheet>
  );
}
