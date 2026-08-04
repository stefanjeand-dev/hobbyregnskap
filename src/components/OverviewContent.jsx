import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { COLORS } from "../constants";
import { formatKr, monthLabel } from "../lib/format";
import CategoryBarList from "./CategoryBarList";

// Delt oversiktsvisning: kategori-breakdown øverst («hvor du blør mest»),
// deretter måned/år-graf og lister. Brukes både per prosjekt og samlet.
// Grafen er høyere på desktop. Dataene kommer fra buildOverview(txns).
export default function OverviewContent({
  monthlyData,
  yearlyData,
  categoryBreakdown,
  chartData,
}) {
  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-12 text-sm" style={{ color: COLORS.inkSoft }}>
        Ingen data å vise ennå.
      </div>
    );
  }

  return (
    <>
      {(categoryBreakdown.expense.length > 0 || categoryBreakdown.income.length > 0) && (
        <div className="mb-6">
          {categoryBreakdown.expense.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: COLORS.inkSoft }}
              >
                Utgifter per kategori — hvor du blør mest
              </p>
              <CategoryBarList items={categoryBreakdown.expense} color={COLORS.expense} />
            </div>
          )}
          {categoryBreakdown.income.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: COLORS.inkSoft }}
              >
                Inntekter per kategori
              </p>
              <CategoryBarList items={categoryBreakdown.income} color={COLORS.income} />
            </div>
          )}
        </div>
      )}

      <div className="w-full h-[180px] lg:h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid vertical={false} stroke={COLORS.line} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: COLORS.inkSoft }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: COLORS.inkSoft }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              formatter={(v) => formatKr(v)}
              contentStyle={{
                background: COLORS.card,
                border: `1px solid ${COLORS.line}`,
                fontSize: 12,
              }}
            />
            <Bar dataKey="Inntekt" fill={COLORS.income} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Utgift" fill={COLORS.expense} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {yearlyData.length > 1 && (
        <div className="mb-5">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>
            Per år
          </p>
          {yearlyData.map((y) => (
            <div
              key={y.key}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: `1px solid ${COLORS.line}` }}
            >
              <span className="text-sm" style={{ color: COLORS.ink }}>
                {y.key}
              </span>
              <span
                className="text-sm"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  color: y.income - y.expense >= 0 ? COLORS.income : COLORS.expense,
                }}
              >
                {y.income - y.expense >= 0 ? "+" : ""}
                {formatKr(y.income - y.expense)}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>
        Per måned
      </p>
      {monthlyData.map((m) => (
        <div
          key={m.key}
          className="py-2.5"
          style={{ borderBottom: `1px solid ${COLORS.line}` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: COLORS.ink }}>
              {monthLabel(m.key)}
            </span>
            <span
              className="text-sm"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: m.income - m.expense >= 0 ? COLORS.income : COLORS.expense,
              }}
            >
              {m.income - m.expense >= 0 ? "+" : ""}
              {formatKr(m.income - m.expense)}
            </span>
          </div>
          <div className="flex gap-3 mt-0.5">
            <span className="text-[11px]" style={{ color: COLORS.income }}>
              +{formatKr(m.income)}
            </span>
            <span className="text-[11px]" style={{ color: COLORS.expense }}>
              −{formatKr(m.expense)}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
