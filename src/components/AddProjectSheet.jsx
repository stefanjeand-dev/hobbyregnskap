import { useState } from "react";
import { COLORS } from "../constants";
import Sheet from "./Sheet";

export default function AddProjectSheet({ onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <Sheet title="Nytt prosjekt" onClose={onClose}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="F.eks. Strikking, 3D-print, Fotografering"
        className="w-full px-3 py-3 rounded-lg text-sm mb-4 outline-none"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
        }}
      />
      <button
        onClick={() => {
          if (name.trim()) {
            onSave(name.trim());
            onClose();
          }
        }}
        className="w-full py-3 rounded-lg text-sm font-semibold"
        style={{ background: COLORS.ink, color: COLORS.paper }}
      >
        Opprett prosjekt
      </button>
    </Sheet>
  );
}
