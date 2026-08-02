import { useMemo, useState } from "react";
import { COLORS, DEFAULT_CATEGORIES } from "./constants";
import { loadData, saveData, emptyData } from "./lib/storage";
import { uid, todayISO } from "./lib/format";
import { useMediaQuery } from "./hooks/useMediaQuery";
import Dashboard from "./components/Dashboard";
import ProjectDetail from "./components/ProjectDetail";
import EmptyDetail from "./components/EmptyDetail";
import AddProjectSheet from "./components/AddProjectSheet";
import AddTransactionSheet from "./components/AddTransactionSheet";
import SettingsSheet from "./components/SettingsSheet";

export default function App() {
  // Ett brytepunkt: ≥1024px = desktop (to kolonner), ellers mobil (helskjerm).
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // localStorage leses synkront som lazy initializer → ingen «laster»-skjerm.
  const [data, setData] = useState(loadData);
  const [saveError, setSaveError] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const persist = (next) => {
    setData(next);
    setSaveError(!saveData(next));
  };

  const allCategories = {
    income: [...DEFAULT_CATEGORIES.income, ...data.customCategories.income],
    expense: [...DEFAULT_CATEGORIES.expense, ...data.customCategories.expense],
  };

  // ---- Mutasjoner (videreført fra artefaktet) ----
  const addProject = (name) => {
    const p = { id: uid(), name, createdAt: todayISO() };
    persist({ ...data, projects: [...data.projects, p] });
  };

  const deleteProject = (id) => {
    persist({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
      transactions: data.transactions.filter((t) => t.projectId !== id),
    });
    setActiveProjectId(null);
  };

  const saveTransaction = (txn, editingId) => {
    if (editingId) {
      persist({
        ...data,
        transactions: data.transactions.map((t) =>
          t.id === editingId ? { ...t, ...txn } : t
        ),
      });
    } else {
      persist({ ...data, transactions: [...data.transactions, { id: uid(), ...txn }] });
    }
  };

  const deleteTransaction = (id) => {
    persist({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
  };

  const addCustomCategory = (type, name) => {
    const existing = allCategories[type];
    if (existing.some((c) => c.toLowerCase() === name.toLowerCase())) return;
    persist({
      ...data,
      customCategories: {
        ...data.customCategories,
        [type]: [...data.customCategories[type], name],
      },
    });
  };

  const clearAllData = () => {
    persist(emptyData());
    setActiveProjectId(null);
  };

  // JSON-import: full overskriving (v1, ingen sammenslåing).
  const importData = (imported) => {
    persist(imported);
    setActiveProjectId(null);
  };

  // ---- Avledninger ----
  const projectsById = useMemo(
    () => Object.fromEntries(data.projects.map((p) => [p.id, p.name])),
    [data.projects]
  );

  const totalsByProject = useMemo(() => {
    const map = {};
    for (const t of data.transactions) {
      if (!map[t.projectId]) map[t.projectId] = { total: 0, count: 0 };
      map[t.projectId].total += t.type === "income" ? t.amount : -t.amount;
      map[t.projectId].count += 1;
    }
    return map;
  }, [data.transactions]);

  const projectTotal = (id) => totalsByProject[id]?.total || 0;
  const projectCount = (id) => totalsByProject[id]?.count || 0;

  const overallTotal = useMemo(
    () =>
      data.transactions.reduce(
        (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
        0
      ),
    [data.transactions]
  );

  const activeProject = data.projects.find((p) => p.id === activeProjectId) || null;

  const openAddTxn = () => {
    setEditingTxn(null);
    setShowAddTxn(true);
  };
  const openEditTxn = (txn) => {
    setEditingTxn(txn);
    setShowAddTxn(true);
  };

  const dashboard = (
    <Dashboard
      projects={data.projects}
      projectTotal={projectTotal}
      projectCount={projectCount}
      overallTotal={overallTotal}
      activeProjectId={activeProjectId}
      onSelect={(id) => setActiveProjectId(id)}
      onAddProject={() => setShowAddProject(true)}
      onOpenSettings={() => setShowSettings(true)}
      isDesktop={isDesktop}
    />
  );

  const detail = activeProject ? (
    <ProjectDetail
      key={activeProject.id}
      project={activeProject}
      transactions={data.transactions}
      projectsById={projectsById}
      isDesktop={isDesktop}
      onBack={() => setActiveProjectId(null)}
      onAddTxn={openAddTxn}
      onEditTxn={openEditTxn}
      onDeleteTxn={deleteTransaction}
      onDeleteProject={deleteProject}
    />
  ) : null;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}
    >
      {isDesktop ? (
        // Desktop: to-kolonne master/detalj – ingen helskjerm-bytte.
        <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-[360px_1fr] gap-8 items-start">
          <div>{dashboard}</div>
          <div>
            {detail || (
              <EmptyDetail
                hasProjects={data.projects.length > 0}
                onAddProject={() => setShowAddProject(true)}
              />
            )}
          </div>
        </div>
      ) : (
        // Mobil: én kolonne, helskjerm-bytte mellom liste og detalj.
        <div
          className="max-w-[480px] mx-auto min-h-screen relative pb-28"
          style={{ background: COLORS.paper }}
        >
          {activeProject ? detail : dashboard}
        </div>
      )}

      {/* Skjemaer – Sheet gir bunn-ark på mobil, modal på desktop */}
      {showAddProject && (
        <AddProjectSheet onClose={() => setShowAddProject(false)} onSave={addProject} />
      )}
      {showAddTxn && activeProject && (
        <AddTransactionSheet
          project={activeProject}
          categories={allCategories}
          editingTxn={editingTxn}
          onAddCategory={addCustomCategory}
          onSave={saveTransaction}
          onDelete={deleteTransaction}
          onClose={() => {
            setShowAddTxn(false);
            setEditingTxn(null);
          }}
        />
      )}
      {showSettings && (
        <SettingsSheet
          data={data}
          projectsById={projectsById}
          onImportData={importData}
          onClearData={clearAllData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {saveError && (
        <div
          className="fixed left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs z-50"
          style={{ bottom: "1rem", background: COLORS.expense, color: COLORS.paper }}
        >
          Kunne ikke lagre – prøv igjen
        </div>
      )}
    </div>
  );
}
