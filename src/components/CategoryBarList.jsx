import { COLORS } from "../constants";
import { formatKr } from "../lib/format";

// Sortert liste med søylebar per kategori – kjernen i «hvor du blør mest».
export default function CategoryBarList({ items, color }) {
  const max = items[0]?.amount || 1;
  return (
    <div>
      {items.map((item) => (
        <div key={item.category} className="mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: COLORS.ink }}>{item.category}</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: COLORS.inkSoft,
                fontWeight: 600,
              }}
            >
              {formatKr(item.amount)}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: COLORS.paperDark }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.amount / max) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
