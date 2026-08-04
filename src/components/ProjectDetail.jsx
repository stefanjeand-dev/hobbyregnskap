import { useMemo, useState } from "react";
import { ArrowLeft, Download, Plus, AlertTriangle } from "lucide-react";
import { COLORS } from "../constants";
import { formatKr } from "../lib/format";
import { buildOverview } from "../lib/overview";
import { exportProjectCsv } from "../lib/csv";
import TxnRow from "./TxnRow";
import OverviewContent from "./OverviewContent";

// Detaljvisning for ett prosjekt. Full mobilskjerm, eller høyre kolonne på desktop.
// Oversikts-avledningene beregnes via den delte buildOverview(txns).
export default function ProjectDetail({
  project,
  transactions,
  projectsById,
  isDesktop = false,
  onBack,
  onAddTxn,
  onEditTxn,
  onDeleteTxn,
  onDeleteProject,
}) {
  const [tab, setTab] = useState("list");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const projectTxns = useMemo(
    () =>
      transactions
        .filter((t) => t.projectId === project.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [transactions, project.id]
  );

  const total = useMemo(
    () =>
      projectTxns.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0),
    [projectTxns]
  );

  // Delt logikk med den samlede oversikten – ingen duplisering.
  const { monthlyData, yearlyData, categoryBreakdown, chartData } = useMemo(
    () => buildOverview(projectTxns),
    [projectTxns]
  );

  const pad = isDesktop ? "" : "px-5";

  return (
    <div className={isDesktop ? "" : "pt-8 pb-4"}>
      {/* Header */}
      <div className={pad}>
        <div className="flex items-center justify-between mb-4">
          {!isDesktop ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs"
              style={{ color: COLORS.inkSoft }}
            >
              <ArrowLeft size={14} /> Alle prosjekter
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            <button
              onClick={() => exportProjectCsv(project, transactions, projectsById)}
              className="flex items-center gap-1 text-xs"
              style={{ color: COLORS.inkSoft }}
              aria-label="Eksporter prosjekt til CSV"
            >
              <Download size={13} /> CSV
            </button>
            {isDesktop && (
              <button
                onClick={onAddTxn}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: COLORS.ink, color: COLORS.paper }}
              >
                <Plus size={14} /> Ny transaksjon
              </button>
            )}
          </div>
        </div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}
        >
          {project.name}
        </h1>
        <span
          className="text-2xl block mt-1"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: total >= 0 ? COLORS.income : COLORS.expense,
          }}
        >
          {total >= 0 ? "+" : ""}
          {formatKr(total)}
        </span>
      </div>

      {/* Faner */}
      <div className={`${pad} flex gap-1 mb-4 mt-4`}>
        {[
          ["list", "Transaksjoner"],
          ["overview", "Oversikt"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{
              background: tab === key ? COLORS.ink : "transparent",
              color: tab === key ? COLORS.paper : COLORS.inkSoft,
              border: `1px solid ${tab === key ? COLORS.ink : COLORS.line}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Innhold */}
      <div className={pad}>
        {tab === "list" &&
          (projectTxns.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: COLORS.inkSoft }}>
              Ingen transaksjoner ennå.
            </div>
          ) : (
            projectTxns.map((t) => (
              <TxnRow key={t.id} txn={t} onEdit={onEditTxn} onDelete={onDeleteTxn} />
            ))
          ))}
        {tab === "overview" && (
          <OverviewContent
            monthlyData={monthlyData}
            yearlyData={yearlyData}
            categoryBreakdown={categoryBreakdown}
            chartData={chartData}
          />
        )}
      </div>

      {/* Slett prosjekt */}
      <div className={`${pad} mt-8`}>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs"
            style={{ color: COLORS.inkSoft }}
          >
            Slett prosjekt
          </button>
        ) : (
          <div
            className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: COLORS.expenseBg }}
          >
            <AlertTriangle size={16} style={{ color: COLORS.expense, marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-xs" style={{ color: COLORS.ink }}>
                Slette «{project.name}» og alle {projectTxns.length} transaksjoner? Dette kan
                ikke angres.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="text-xs font-semibold"
                  style={{ color: COLORS.expense }}
                >
                  Ja, slett
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs"
                  style={{ color: COLORS.inkSoft }}
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flytende «+»-knapp (kun mobil) */}
      {!isDesktop && (
        <button
          onClick={onAddTxn}
          className="fixed left-1/2 -translate-x-1/2 fab-offset flex items-center justify-center rounded-full shadow-lg z-40"
          style={{ width: 56, height: 56, background: COLORS.ink }}
          aria-label="Ny transaksjon"
        >
          <Plus size={24} color={COLORS.paper} />
        </button>
      )}
    </div>
  );
}
