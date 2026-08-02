import { useState, useEffect, useMemo } from "react";
import {
  Plus, ArrowLeft, Trash2, X, Settings, TrendingUp, TrendingDown,
  ChevronRight, Check, FolderPlus, AlertTriangle, Pencil, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`;

const COLORS = {
  paper: "#E7E2D0",
  paperDark: "#DBD3B8",
  card: "#F1ECDD",
  ink: "#252B1E",
  inkSoft: "#6B6D5A",
  income: "#3F6B52",
  incomeBg: "#DFE7DC",
  expense: "#A3492F",
  expenseBg: "#F0DED4",
  line: "#C6BC9C",
  gold: "#AD8226",
};

const DEFAULT_CATEGORIES = {
  income: ["Salg", "Oppdrag", "Donasjon", "Refusjon", "Annet"],
  expense: ["Materialer", "Utstyr", "Kurs", "Frakt", "Programvare", "Annet"],
};

const STORAGE_KEY = "hobbyregnskap-data";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatKr = (n) => `${Math.round(n).toLocaleString("nb-NO")} kr`;
const monthLabel = (key) => {
  const d = new Date(key + "-02");
  const s = d.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const monthShort = (key) => {
  const d = new Date(key + "-02");
  const s = d.toLocaleDateString("nb-NO", { month: "short" });
  return s.replace(".", "");
};

const csvField = (val) => {
  const str = String(val ?? "");
  return /[;"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const buildCsv = (txns, projectsById) => {
  const header = ["Prosjekt", "Dato", "Type", "Kategori", "Beløp (kr)", "Kommentar"];
  const rows = [...txns]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => [
      projectsById[t.projectId] || "",
      t.date,
      t.type === "income" ? "Inntekt" : "Utgift",
      t.category,
      String(t.amount).replace(".", ","),
      t.comment || "",
    ]);
  return [header, ...rows].map((r) => r.map(csvField).join(";")).join("\r\n");
};

const downloadCsv = (csvContent, filename) => {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function ReceiptCard({ project, total, count, onClick }) {
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
          <ChevronRight size={18} style={{ color: COLORS.inkSoft, marginTop: 4 }} />
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: COLORS.inkSoft }}>
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

function TxnRow({ txn, onEdit, onDelete }) {
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
              day: "numeric", month: "short", year: "numeric",
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
          {isIncome ? "+" : "−"}{formatKr(txn.amount)}
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

function CategoryBarList({ items, color }) {
  const max = items[0]?.amount || 1;
  return (
    <div>
      {items.map((item) => (
        <div key={item.category} className="mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: COLORS.ink }}>{item.category}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkSoft, fontWeight: 600 }}>
              {formatKr(item.amount)}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: COLORS.paperDark }}>
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

function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(37,43,30,0.45)" }}>
      <div
        className="w-full max-w-[480px] rounded-t-2xl px-5 pt-5 pb-6 max-h-[88vh] overflow-y-auto"
        style={{ background: COLORS.paper }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }}>
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

function AddProjectSheet({ onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <Sheet title="Nytt prosjekt" onClose={onClose}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="F.eks. Strikking, 3D-print, Fotografering"
        className="w-full px-3 py-3 rounded-lg text-sm mb-4 outline-none"
        style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
      />
      <button
        onClick={() => { if (name.trim()) { onSave(name.trim()); onClose(); } }}
        className="w-full py-3 rounded-lg text-sm font-semibold"
        style={{ background: COLORS.ink, color: COLORS.paper }}
      >
        Opprett prosjekt
      </button>
    </Sheet>
  );
}

function AddTransactionSheet({ project, categories, editingTxn, onAddCategory, onSave, onDelete, onClose }) {
  const isEdit = !!editingTxn;
  const [type, setType] = useState(editingTxn ? editingTxn.type : "expense");
  const [amount, setAmount] = useState(editingTxn ? String(editingTxn.amount).replace(".", ",") : "");
  const [category, setCategory] = useState(editingTxn ? editingTxn.category : "");
  const [date, setDate] = useState(editingTxn ? editingTxn.date : todayISO());
  const [comment, setComment] = useState(editingTxn ? editingTxn.comment || "" : "");
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  const cats = categories[type];

  const chooseType = (t) => { setType(t); setCategory(""); setAddingCat(false); };

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
    onSave({ projectId: project.id, type, amount: num, category, date, comment: comment.trim() }, editingTxn ? editingTxn.id : null);
    onClose();
  };

  return (
    <Sheet title={isEdit ? `Rediger transaksjon · ${project.name}` : `Ny transaksjon · ${project.name}`} onClose={onClose}>
      <div className="flex rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${COLORS.line}` }}>
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => chooseType(t)}
            className="flex-1 py-2.5 text-sm font-medium"
            style={{
              background: type === t ? (t === "income" ? COLORS.incomeBg : COLORS.expenseBg) : "transparent",
              color: type === t ? (t === "income" ? COLORS.income : COLORS.expense) : COLORS.inkSoft,
            }}
          >
            {t === "income" ? "Inntekt" : "Utgift"}
          </button>
        ))}
      </div>

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>Beløp</label>
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-3 rounded-lg text-lg mt-1 mb-4 outline-none"
        style={{
          background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}`,
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
        }}
      />

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>Kategori</label>
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
            style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
          />
          <button onClick={confirmNewCat} className="px-3 rounded-lg" style={{ background: COLORS.ink }}>
            <Check size={16} color={COLORS.paper} />
          </button>
        </div>
      )}

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>Dato</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-3 rounded-lg text-sm mt-1 mb-4 outline-none"
        style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
      />

      <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>Kommentar (valgfritt)</label>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="F.eks. Solgt på marked"
        className="w-full px-3 py-3 rounded-lg text-sm mt-1 mb-5 outline-none"
        style={{ background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
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
          onClick={() => { onDelete(editingTxn.id); onClose(); }}
          className="w-full text-center text-xs mt-3"
          style={{ color: COLORS.expense }}
        >
          Slett denne transaksjonen
        </button>
      )}
    </Sheet>
  );
}

export default function HobbyRegnskap() {
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [data, setData] = useState({
    projects: [], transactions: [], customCategories: { income: [], expense: [] },
  });
  const [view, setView] = useState("dashboard");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectTab, setProjectTab] = useState("list");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setData({
            projects: parsed.projects || [],
            transactions: parsed.transactions || [],
            customCategories: parsed.customCategories || { income: [], expense: [] },
          });
        }
      } catch (e) {
        // Ingen lagrede data ennå — start tomt
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next) => {
    setData(next);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(next));
      setSaveError(!res);
    } catch (e) {
      setSaveError(true);
    }
  };

  const allCategories = {
    income: [...DEFAULT_CATEGORIES.income, ...data.customCategories.income],
    expense: [...DEFAULT_CATEGORIES.expense, ...data.customCategories.expense],
  };

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
    setView("dashboard");
    setActiveProjectId(null);
    setConfirmDeleteProject(false);
  };

  const saveTransaction = (txn, editingId) => {
    if (editingId) {
      persist({
        ...data,
        transactions: data.transactions.map((t) => (t.id === editingId ? { ...t, ...txn } : t)),
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
      customCategories: { ...data.customCategories, [type]: [...data.customCategories[type], name] },
    });
  };

  const clearAllData = () => {
    persist({ projects: [], transactions: [], customCategories: { income: [], expense: [] } });
    setView("dashboard");
    setActiveProjectId(null);
    setShowSettings(false);
  };

  const projectsById = useMemo(
    () => Object.fromEntries(data.projects.map((p) => [p.id, p.name])),
    [data.projects]
  );

  const exportAllCsv = () => {
    const csv = buildCsv(data.transactions, projectsById);
    downloadCsv(csv, `hobbyregnskap-alle-prosjekter-${todayISO()}.csv`);
  };

  const exportProjectCsv = (project) => {
    const txns = data.transactions.filter((t) => t.projectId === project.id);
    const csv = buildCsv(txns, projectsById);
    downloadCsv(csv, `hobbyregnskap-${slugify(project.name)}-${todayISO()}.csv`);
  };

  const projectTotal = (projectId) =>
    data.transactions
      .filter((t) => t.projectId === projectId)
      .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

  const projectCount = (projectId) => data.transactions.filter((t) => t.projectId === projectId).length;

  const overallTotal = useMemo(
    () => data.transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0),
    [data.transactions]
  );

  const activeProject = data.projects.find((p) => p.id === activeProjectId);

  const projectTxns = useMemo(() => {
    if (!activeProjectId) return [];
    return data.transactions
      .filter((t) => t.projectId === activeProjectId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data.transactions, activeProjectId]);

  const monthlyData = useMemo(() => {
    const map = {};
    projectTxns.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = { key, income: 0, expense: 0 };
      if (t.type === "income") map[key].income += t.amount; else map[key].expense += t.amount;
    });
    return Object.values(map).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [projectTxns]);

  const categoryBreakdown = useMemo(() => {
    const build = (type) => {
      const map = {};
      projectTxns.filter((t) => t.type === type).forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
      return Object.entries(map)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    };
    return { income: build("income"), expense: build("expense") };
  }, [projectTxns]);

  const yearlyData = useMemo(() => {
    const map = {};
    projectTxns.forEach((t) => {
      const key = t.date.slice(0, 4);
      if (!map[key]) map[key] = { key, income: 0, expense: 0 };
      if (t.type === "income") map[key].income += t.amount; else map[key].expense += t.amount;
    });
    return Object.values(map).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [projectTxns]);

  const chartData = useMemo(
    () =>
      monthlyData
        .slice(0, 12)
        .slice()
        .reverse()
        .map((m) => ({ name: monthShort(m.key), Inntekt: m.income, Utgift: m.expense })),
    [monthlyData]
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif", color: COLORS.inkSoft }}
      >
        Laster inn regnskapet …
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>
      <div className="max-w-[480px] mx-auto min-h-screen relative pb-24" style={{ background: COLORS.paper }}>

        {view === "dashboard" && (
          <>
            <div className="px-5 pt-8 pb-2 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.inkSoft }}>Hobbyregnskap</p>
                <h1 className="text-2xl mt-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}>
                  Prosjektene dine
                </h1>
              </div>
              <button onClick={() => setShowSettings(true)} className="p-2" aria-label="Innstillinger">
                <Settings size={20} style={{ color: COLORS.inkSoft }} />
              </button>
            </div>

            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between py-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                <span className="text-sm" style={{ color: COLORS.inkSoft }}>Samlet netto, alle prosjekter</span>
                <span
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: overallTotal >= 0 ? COLORS.income : COLORS.expense,
                  }}
                >
                  {overallTotal >= 0 ? "+" : ""}{formatKr(overallTotal)}
                </span>
              </div>
            </div>

            <div className="px-5">
              {data.projects.length === 0 && (
                <div
                  className="text-center py-12 rounded-xl mb-4"
                  style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.inkSoft }}
                >
                  <p className="text-sm">Ingen prosjekter ennå.</p>
                  <p className="text-xs mt-1">Trykk under for å opprette det første.</p>
                </div>
              )}
              {data.projects.map((p) => (
                <ReceiptCard
                  key={p.id}
                  project={p}
                  total={projectTotal(p.id)}
                  count={projectCount(p.id)}
                  onClick={() => { setActiveProjectId(p.id); setProjectTab("list"); setView("project"); }}
                />
              ))}
              <button
                onClick={() => setShowAddProject(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium mt-1"
                style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.gold }}
              >
                <FolderPlus size={16} /> Nytt prosjekt
              </button>
            </div>
          </>
        )}

        {view === "project" && activeProject && (
          <>
            <div className="px-5 pt-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { setView("dashboard"); setActiveProjectId(null); }}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: COLORS.inkSoft }}
                >
                  <ArrowLeft size={14} /> Alle prosjekter
                </button>
                <button
                  onClick={() => exportProjectCsv(activeProject)}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: COLORS.inkSoft }}
                  aria-label="Eksporter prosjekt til CSV"
                >
                  <Download size={13} /> CSV
                </button>
              </div>
              <h1 className="text-2xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: COLORS.ink }}>
                {activeProject.name}
              </h1>
              <span
                className="text-2xl block mt-1"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  color: projectTotal(activeProject.id) >= 0 ? COLORS.income : COLORS.expense,
                }}
              >
                {projectTotal(activeProject.id) >= 0 ? "+" : ""}{formatKr(projectTotal(activeProject.id))}
              </span>
            </div>

            <div className="px-5 flex gap-1 mb-4">
              {[["list", "Transaksjoner"], ["overview", "Oversikt"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setProjectTab(key)}
                  className="px-4 py-2 rounded-full text-xs font-medium"
                  style={{
                    background: projectTab === key ? COLORS.ink : "transparent",
                    color: projectTab === key ? COLORS.paper : COLORS.inkSoft,
                    border: `1px solid ${projectTab === key ? COLORS.ink : COLORS.line}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {projectTab === "list" && (
              <div className="px-5">
                {projectTxns.length === 0 ? (
                  <div className="text-center py-12 text-sm" style={{ color: COLORS.inkSoft }}>
                    Ingen transaksjoner ennå.
                  </div>
                ) : (
                  projectTxns.map((t) => (
                    <TxnRow
                      key={t.id}
                      txn={t}
                      onEdit={(txn) => { setEditingTxn(txn); setShowAddTxn(true); }}
                      onDelete={deleteTransaction}
                    />
                  ))
                )}
              </div>
            )}

            {projectTab === "overview" && (
              <div className="px-5">
                {monthlyData.length === 0 ? (
                  <div className="text-center py-12 text-sm" style={{ color: COLORS.inkSoft }}>
                    Ingen data å vise ennå.
                  </div>
                ) : (
                  <>
                    {(categoryBreakdown.expense.length > 0 || categoryBreakdown.income.length > 0) && (
                      <div className="mb-6">
                        {categoryBreakdown.expense.length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: COLORS.inkSoft }}>
                              Utgifter per kategori — hvor du blør mest
                            </p>
                            <CategoryBarList items={categoryBreakdown.expense} color={COLORS.expense} />
                          </div>
                        )}
                        {categoryBreakdown.income.length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: COLORS.inkSoft }}>
                              Inntekter per kategori
                            </p>
                            <CategoryBarList items={categoryBreakdown.income} color={COLORS.income} />
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ width: "100%", height: 180 }} className="mb-6">
                      <ResponsiveContainer>
                        <BarChart data={chartData} barGap={2}>
                          <CartesianGrid vertical={false} stroke={COLORS.line} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={38} />
                          <Tooltip
                            formatter={(v) => formatKr(v)}
                            contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                          />
                          <Bar dataKey="Inntekt" fill={COLORS.income} radius={[3, 3, 0, 0]} />
                          <Bar dataKey="Utgift" fill={COLORS.expense} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {yearlyData.length > 1 && (
                      <div className="mb-5">
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>Per år</p>
                        {yearlyData.map((y) => (
                          <div key={y.key} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                            <span className="text-sm" style={{ color: COLORS.ink }}>{y.key}</span>
                            <span
                              className="text-sm"
                              style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: y.income - y.expense >= 0 ? COLORS.income : COLORS.expense }}
                            >
                              {y.income - y.expense >= 0 ? "+" : ""}{formatKr(y.income - y.expense)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>Per måned</p>
                    {monthlyData.map((m) => (
                      <div key={m.key} className="py-2.5" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: COLORS.ink }}>{monthLabel(m.key)}</span>
                          <span
                            className="text-sm"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: m.income - m.expense >= 0 ? COLORS.income : COLORS.expense }}
                          >
                            {m.income - m.expense >= 0 ? "+" : ""}{formatKr(m.income - m.expense)}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-[11px]" style={{ color: COLORS.income }}>+{formatKr(m.income)}</span>
                          <span className="text-[11px]" style={{ color: COLORS.expense }}>−{formatKr(m.expense)}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="px-5 mt-8">
              {!confirmDeleteProject ? (
                <button
                  onClick={() => setConfirmDeleteProject(true)}
                  className="text-xs"
                  style={{ color: COLORS.inkSoft }}
                >
                  Slett prosjekt
                </button>
              ) : (
                <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: COLORS.expenseBg }}>
                  <AlertTriangle size={16} style={{ color: COLORS.expense, marginTop: 2 }} />
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: COLORS.ink }}>
                      Slette «{activeProject.name}» og alle {projectTxns.length} transaksjoner? Dette kan ikke angres.
                    </p>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => deleteProject(activeProject.id)} className="text-xs font-semibold" style={{ color: COLORS.expense }}>
                        Ja, slett
                      </button>
                      <button onClick={() => setConfirmDeleteProject(false)} className="text-xs" style={{ color: COLORS.inkSoft }}>
                        Avbryt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { setEditingTxn(null); setShowAddTxn(true); }}
              className="fixed bottom-8 flex items-center justify-center rounded-full shadow-lg"
              style={{
                width: 56, height: 56, background: COLORS.ink,
                left: "50%", transform: "translateX(calc(-50% ))",
              }}
              aria-label="Ny transaksjon"
            >
              <Plus size={24} color={COLORS.paper} />
            </button>
          </>
        )}

        {saveError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs" style={{ background: COLORS.expense, color: COLORS.paper }}>
            Kunne ikke lagre – prøv igjen
          </div>
        )}
      </div>

      {showAddProject && <AddProjectSheet onClose={() => setShowAddProject(false)} onSave={addProject} />}
      {showAddTxn && activeProject && (
        <AddTransactionSheet
          project={activeProject}
          categories={allCategories}
          editingTxn={editingTxn}
          onAddCategory={addCustomCategory}
          onSave={saveTransaction}
          onDelete={deleteTransaction}
          onClose={() => { setShowAddTxn(false); setEditingTxn(null); }}
        />
      )}
      {showSettings && (
        <Sheet title="Innstillinger" onClose={() => setShowSettings(false)}>
          <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>
            {data.projects.length} prosjekt(er), {data.transactions.length} transaksjon(er) lagret.
          </p>
          <button
            onClick={exportAllCsv}
            disabled={data.transactions.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold mb-3"
            style={{
              background: COLORS.card, color: COLORS.ink, border: `1px solid ${COLORS.line}`,
              opacity: data.transactions.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={15} /> Eksporter alt til CSV
          </button>
          <button
            onClick={clearAllData}
            className="w-full py-3 rounded-lg text-sm font-semibold"
            style={{ background: COLORS.expenseBg, color: COLORS.expense }}
          >
            Slett alle data
          </button>
        </Sheet>
      )}
    </div>
  );
}
