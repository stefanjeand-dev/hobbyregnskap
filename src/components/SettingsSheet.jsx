import { useRef, useState } from "react";
import { Download, Upload, Share2, AlertTriangle } from "lucide-react";
import { COLORS } from "../constants";
import { exportAllCsv } from "../lib/csv";
import { shareOrDownloadJson, parseBackup } from "../lib/backup";
import Sheet from "./Sheet";

export default function SettingsSheet({
  data,
  projectsById,
  onImportData,
  onClearData,
  onClose,
}) {
  const fileRef = useRef(null);
  const [importError, setImportError] = useState("");
  const [pendingImport, setPendingImport] = useState(null); // { data, projects, transactions }
  const [confirmClear, setConfirmClear] = useState(false);

  const hasData = data.transactions.length > 0 || data.projects.length > 0;

  const handleExportJson = () => {
    // Native del på mobil, nedlasting som fallback på desktop.
    shareOrDownloadJson(data);
  };

  const handlePickFile = () => {
    setImportError("");
    fileRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // nullstill så samme fil kan velges igjen
    if (!file) return;
    setImportError("");
    try {
      const text = await file.text();
      const parsed = parseBackup(text);
      setPendingImport({
        data: parsed,
        projects: parsed.projects.length,
        transactions: parsed.transactions.length,
      });
    } catch (err) {
      setPendingImport(null);
      setImportError(err?.message || "Kunne ikke lese filen.");
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    onImportData(pendingImport.data);
    setPendingImport(null);
    onClose();
  };

  return (
    <Sheet title="Innstillinger" onClose={onClose}>
      <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>
        {data.projects.length} prosjekt(er), {data.transactions.length} transaksjon(er)
        lagret. Alt ligger kun på denne enheten.
      </p>

      {/* CSV – for regnskap/Excel */}
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>
        Regnskap
      </p>
      <button
        onClick={() => exportAllCsv(data.transactions, projectsById)}
        disabled={data.transactions.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold mb-5"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
          opacity: data.transactions.length === 0 ? 0.5 : 1,
        }}
      >
        <Download size={15} /> Eksporter alt til CSV
      </button>

      {/* JSON – full sikkerhetskopi / flytt mellom egne enheter */}
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.inkSoft }}>
        Sikkerhetskopi & overføring
      </p>
      <button
        onClick={handleExportJson}
        disabled={!hasData}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold mb-3"
        style={{
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
          opacity: hasData ? 1 : 0.5,
        }}
      >
        <Share2 size={15} /> Del / eksporter data (JSON)
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        className="hidden"
      />

      {!pendingImport ? (
        <button
          onClick={handlePickFile}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold"
          style={{
            background: COLORS.card,
            color: COLORS.ink,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <Upload size={15} /> Importer data (JSON)
        </button>
      ) : (
        <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: COLORS.expenseBg }}>
          <AlertTriangle size={16} style={{ color: COLORS.expense, marginTop: 2 }} />
          <div className="flex-1">
            <p className="text-xs" style={{ color: COLORS.ink }}>
              Importen <strong>overskriver alle data</strong> på denne enheten (
              {data.projects.length} prosjekter, {data.transactions.length} transaksjoner)
              med innholdet i fila ({pendingImport.projects} prosjekter,{" "}
              {pendingImport.transactions} transaksjoner). Dette kan ikke angres.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={confirmImport}
                className="text-xs font-semibold"
                style={{ color: COLORS.expense }}
              >
                Ja, overskriv
              </button>
              <button
                onClick={() => setPendingImport(null)}
                className="text-xs"
                style={{ color: COLORS.inkSoft }}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <p className="text-xs mt-2" style={{ color: COLORS.expense }}>
          {importError}
        </p>
      )}

      {/* Faresone */}
      <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${COLORS.line}` }}>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={!hasData}
            className="w-full py-3 rounded-lg text-sm font-semibold"
            style={{
              background: COLORS.expenseBg,
              color: COLORS.expense,
              opacity: hasData ? 1 : 0.5,
            }}
          >
            Slett alle data
          </button>
        ) : (
          <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: COLORS.expenseBg }}>
            <AlertTriangle size={16} style={{ color: COLORS.expense, marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-xs" style={{ color: COLORS.ink }}>
                Slette <strong>alle</strong> prosjekter og transaksjoner på denne enheten?
                Dette kan ikke angres. Vurder å eksportere en JSON-kopi først.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    onClearData();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="text-xs font-semibold"
                  style={{ color: COLORS.expense }}
                >
                  Ja, slett alt
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
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
    </Sheet>
  );
}
