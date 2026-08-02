import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { COLORS } from "../constants";
import { todayISO } from "../lib/format";
import Sheet from "./Sheet";

// Skjema for å legge til / redigere en transaksjon.
export default function AddTransactionSheet({
  project,
  categories,
  editingTxn,
  onAddCategory,
  onSave,
  onDelete,
  onClose,
}) {
  const isEdit = !!editingTxn;
  const [type, setType] = useState(editingTxn ? editingTxn.type : "expense");
  const [amount, setAmount] = useState(
    editingTxn ? String(editingTxn.amount).replace(".", ",") : ""
  );
  const [category, setCategory] = useState(editingTxn ? editingTxn.category : "");
  const [date, setDate] = useState(editingTxn ? editingTxn.date : todayISO());
  const [comment, setComment] = useState(editingTxn ? editingTxn.comment || "" : "");
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  const cats = categories[type];

  const chooseType = (t) => {
    setType(t);
    setCategory("");
    setAddingCat(false);
  };

  const confirmNewCat = () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    onAddCategory(type, trimmed);
    setCategory(trimmed);
    setNewCat("");
    setAddingCat(false);
  };

  const canSave = () => {
    const num = parseFloat(amount.replace(",", "."));
    return num > 0 && category && date;
  };

  const handleSave = () => {
    const num = parseFloat(amount.replace(",", "."));
    if (!(num > 0) || !category) return;
    onSave(
      { projectId: project.id, type, amount: num, category, date, comment: comment.trim() },
      editingTxn ? editingTxn.id : null
    );
    onClose();
  };

  return (
    <Sheet
      title={
        isEdit
          ? `Rediger transaksjon · ${project.name}`
          : `Ny transaksjon · ${project.name}`
      }
      onClose={onClose}
    >
      <div
        className="flex rounded-lg overflow-hidden mb-4"
        style={{ border: `1px solid ${COLORS.line}` }}
      >
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => chooseType(t)}
            className="flex-1 py-2.5 text-sm font-medium"
            style={{
              background:
                type === t
                  ? t === "income"
                    ? COLORS.incomeBg
                    : COLORS.expenseBg
                  : "transparent",
              color:
                type === t
                  ? t === "income"
                    ? COLORS.income
                    : COLORS.expense
                  : COLORS.inkSoft,
            }}
          >
            {t === "income" ? "Inntekt" : "Utgift"}
          </button>
        ))}
      </div>

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
        Kategori
      </label>
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: category === c ? COLORS.ink : COLORS.card,
              color: category === c ? COLORS.paper : COLORS.ink,
              border: `1px solid ${category === c ? COLORS.ink : COLORS.line}`,
            }}
          >
            {c}
          </button>
        ))}
        {!addingCat && (
          <button
            onClick={() => setAddingCat(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ color: COLORS.gold, border: `1px dashed ${COLORS.gold}` }}
          >
            <Plus size={12} /> Ny
          </button>
        )}
      </div>
      {addingCat && (
        <div className="flex gap-2 mb-4">
          <input
            autoFocus
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Kategorinavn"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: COLORS.card,
              color: COLORS.ink,
              border: `1px solid ${COLORS.line}`,
            }}
          />
          <button
            onClick={confirmNewCat}
            className="px-3 rounded-lg"
            style={{ background: COLORS.ink }}
          >
            <Check size={16} color={COLORS.paper} />
          </button>
        </div>
      )}

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
        placeholder="F.eks. Solgt på marked"
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
        {isEdit ? "Lagre endringer" : "Lagre transaksjon"}
      </button>
      {isEdit && (
        <button
          onClick={() => {
            onDelete(editingTxn.id);
            onClose();
          }}
          className="w-full text-center text-xs mt-3"
          style={{ color: COLORS.expense }}
        >
          Slett denne transaksjonen
        </button>
      )}
    </Sheet>
  );
}
