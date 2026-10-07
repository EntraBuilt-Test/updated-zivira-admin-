"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type UploadToolMeta, type UploadValidation, type UploadImportResult, type UploadHistoryRow } from "@/lib/api-client";

// Round 48 Part B -- ONE real upload screen for the 12 Options > Customer Upload / Upload tools.
// Flow: Download Sample -> pick .xlsx/.csv (parsed here for an instant header check, and again on the
// server, which is authoritative) -> validation with row/field/reason errors + preview -> Import
// (valid rows only, idempotent upsert) -> summary, error report (.xlsx) and upload history.

const CARD = "bg-surface-card rounded-xl border border-border-subtle shadow-sm p-5 space-y-4";
const BTN = "h-9 px-4 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary text-sm hover:bg-surface-subtle disabled:opacity-50";
const PRIMARY = "h-9 px-6 rounded-lg bg-primary text-on-primary text-sm font-semibold shadow-sm disabled:opacity-50";
const norm = (h: unknown) => String(h ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

function errorReport(rows: { row: number; field: string; reason: string }[], name: string) {
  const ws = XLSX.utils.aoa_to_sheet([["Row", "Field", "Reason"], ...rows.map((e) => [e.row, e.field, e.reason])]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Errors");
  XLSX.writeFile(wb, `${name.replace(/\.[^.]+$/, "")}_errors.xlsx`);
}

export function UploadToolPanel({ toolKey }: { toolKey: string }) {
  const [tool, setTool] = useState<UploadToolMeta | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [clientInfo, setClientInfo] = useState<{ rows: number; missing: string[] } | null>(null);
  const [val, setVal] = useState<UploadValidation | null>(null);
  const [result, setResult] = useState<UploadImportResult | null>(null);
  const [history, setHistory] = useState<UploadHistoryRow[]>([]);
  const [busy, setBusy] = useState<"" | "validate" | "import" | "sample" | "slides">("");
  const [error, setError] = useState("");
  const [slideMsg, setSlideMsg] = useState("");
  const input = useRef<HTMLInputElement | null>(null);

  const loadHistory = () => apiClient.uploadToolHistory(toolKey).then((r) => setHistory(r.data)).catch(() => setHistory([]));
  useEffect(() => {
    setTool(null); setFile(null); setVal(null); setResult(null); setClientInfo(null); setError("");
    apiClient.uploadTools().then((r) => setTool(r.data.find((t) => t.key === toolKey) ?? null)).catch((e) => setError(e instanceof Error ? e.message : "Could not load the tool"));
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolKey]);

  async function pick(f: File | null) {
    setFile(f); setVal(null); setResult(null); setError(""); setClientInfo(null);
    if (!f || !tool) return;
    try {
      // client-side parse: instant header check + row count
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "", blankrows: false });
      const headers = new Set((aoa[0] ?? []).map(norm));
      setClientInfo({ rows: Math.max(0, aoa.length - 1), missing: tool.required.filter((h) => !headers.has(norm(h))) });
    } catch (e) { setError(`Could not read the file: ${e instanceof Error ? e.message : String(e)}`); return; }
    setBusy("validate");
    try { setVal((await apiClient.uploadToolValidate(toolKey, f)).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Validation failed"); }
    finally { setBusy(""); }
  }

  async function doImport() {
    if (!file) return;
    setBusy("import"); setError("");
    try { setResult((await apiClient.uploadToolImport(toolKey, file)).data); setVal(null); await loadHistory(); }
    catch (e) { setError(e instanceof Error ? e.message : "Import failed"); }
    finally { setBusy(""); }
  }

  async function sample() {
    setBusy("sample"); setError("");
    try { await apiClient.downloadMisFile(`/company/upload-tools/${toolKey}/sample`, {}, `${tool?.title.replace(/[^A-Za-z0-9]+/g, "_") ?? toolKey}_Sample.xlsx`); }
    catch (e) { setError(e instanceof Error ? e.message : "Download failed"); }
    finally { setBusy(""); }
  }

  async function attachSlides(files: FileList | null) {
    if (!files?.length) return;
    setBusy("slides"); setSlideMsg("");
    try {
      const r = (await apiClient.uploadSlideFiles(Array.from(files))).data;
      setSlideMsg(`Attached ${r.matched.length} file(s).${r.unmatched.length ? ` No slide row with this File Name: ${r.unmatched.join(", ")}.` : ""}`);
    } catch (e) { setSlideMsg(e instanceof Error ? e.message : "Attach failed"); }
    finally { setBusy(""); }
  }

  const errorsByRow = useMemo(() => val?.errors.slice(0, 200) ?? [], [val]);
  if (!tool) return error ? <p className="text-sm text-status-danger">{error}</p> : <p className="text-sm text-text-muted">Loading...</p>;
  const canImport = !!val && val.fileErrors.length === 0 && val.valid > 0 && busy === "";

  return (
    <section className="space-y-5 w-full">
      <div>
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Options / {tool.group}</p>
        <h2 className="text-2xl font-bold text-text-primary">{tool.title}</h2>
        <p className="text-xs text-text-muted mt-1 max-w-4xl">{tool.note}</p>
      </div>

      <div className={CARD}>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={BTN} disabled={busy !== ""} onClick={() => void sample()}>{busy === "sample" ? "Preparing..." : "Download Sample"}</button>
          <input ref={input} type="file" accept=".xlsx,.csv" onChange={(e) => void pick(e.target.files?.[0] ?? null)} />
          <button type="button" className={PRIMARY} disabled={!canImport} onClick={() => void doImport()}>{busy === "import" ? "Importing..." : "Import"}</button>
        </div>
        <p className="text-xs text-text-muted">Required columns: {tool.required.join(", ")}. Dates: dd/mm/yyyy. Only valid rows are imported; re-uploading the same file updates, never duplicates.</p>
        {error && <p className="text-sm text-status-danger">{error}</p>}
        {busy === "validate" && <p className="text-sm text-text-muted">Validating on the server...</p>}
        {clientInfo && clientInfo.missing.length > 0 && <p className="text-sm text-status-danger">Missing required column(s): {clientInfo.missing.join(", ")}</p>}
      </div>

      {val && (
        <div className={CARD}>
          <div className="flex flex-wrap gap-6 text-sm">
            <span><b>{val.total}</b> rows</span>
            <span className="text-green-700"><b>{val.valid}</b> valid</span>
            <span className={val.invalid ? "text-status-danger" : ""}><b>{val.invalid}</b> invalid</span>
            {val.warnings.length > 0 && <span className="text-amber-700"><b>{val.warnings.length}</b> warning(s)</span>}
          </div>
          {val.fileErrors.map((m) => <p key={m} className="text-sm text-status-danger">{m}</p>)}
          {val.errors.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-bold">Row errors{val.errorsTotal > errorsByRow.length ? ` (first ${errorsByRow.length} of ${val.errorsTotal})` : ""}</h3>
                <button type="button" className={BTN} onClick={() => errorReport(val.errors, file?.name ?? "upload")}>Download error report</button>
              </div>
              <div className="overflow-auto max-h-64 border border-border-subtle rounded-lg">
                <table className="w-full text-xs"><thead className="bg-surface-subtle sticky top-0"><tr><th className="px-2 py-1 text-left">Row</th><th className="px-2 py-1 text-left">Field</th><th className="px-2 py-1 text-left">Reason</th></tr></thead>
                  <tbody>{errorsByRow.map((e, i) => <tr key={i} className="border-t border-border-subtle"><td className="px-2 py-1">{e.row}</td><td className="px-2 py-1">{e.field}</td><td className="px-2 py-1 text-status-danger">{e.reason}</td></tr>)}</tbody></table>
              </div>
            </div>
          )}
          {val.warnings.length > 0 && <ul className="text-xs text-amber-700 list-disc list-inside">{val.warnings.slice(0, 10).map((w, i) => <li key={i}>Row {w.row}: {w.reason}</li>)}</ul>}
          {val.preview.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-1">Preview (first {val.preview.length} rows)</h3>
              <div className="overflow-auto max-h-80 border border-border-subtle rounded-lg">
                <table className="text-xs whitespace-nowrap">
                  <thead className="bg-surface-subtle sticky top-0"><tr><th className="px-2 py-1">Row</th>{tool.headers.map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}<th className="px-2 py-1">Status</th></tr></thead>
                  <tbody>
                    {val.preview.map((r) => (
                      <tr key={r.row} className="border-t border-border-subtle" style={r.errors.length ? { background: "rgba(220,38,38,0.08)" } : undefined}>
                        <td className="px-2 py-1">{r.row}</td>{r.cells.map((c, i) => <td key={i} className="px-2 py-1">{c}</td>)}
                        <td className="px-2 py-1" title={r.errors.join("\n")}>{r.errors.length ? "Invalid" : "OK"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className={CARD}>
          <h3 className="text-sm font-bold">Import result - {result.fileName}</h3>
          {result.fileErrors.map((m) => <p key={m} className="text-sm text-status-danger">{m}</p>)}
          <p className="text-sm"><b className="text-green-700">{result.ok}</b> row(s) imported ({result.inserted} new, {result.updated} updated), <b className={result.failed ? "text-status-danger" : ""}>{result.failed}</b> failed, of {result.total}.</p>
          {result.errors.length > 0 && <button type="button" className={BTN} onClick={() => errorReport(result.errors, result.fileName)}>Download error report</button>}
        </div>
      )}

      {toolKey === "slides-upload" && (
        <div className={CARD}>
          <h3 className="text-sm font-bold">Attach slide files</h3>
          <p className="text-xs text-text-muted">After importing the metadata, select the slide files (PDF/PPT/images). Each is matched to its row by File Name.</p>
          <input type="file" multiple disabled={busy === "slides"} onChange={(e) => void attachSlides(e.target.files)} />
          {slideMsg && <p className="text-sm">{slideMsg}</p>}
        </div>
      )}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm">
        <h3 className="text-sm font-bold px-4 py-3 border-b border-border-subtle">Upload history</h3>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle"><tr>{["When", "Who", "File", "Rows", "OK", "Failed", "New", "Updated", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-text-muted">No uploads yet.</td></tr>}
              {history.map((h) => (
                <tr key={h.id} className="border-t border-border-subtle">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(h.uploadedAt).toLocaleString()}</td><td className="px-3 py-2">{h.uploadedBy}</td><td className="px-3 py-2">{h.fileName}</td>
                  <td className="px-3 py-2">{h.totalRows}</td><td className="px-3 py-2">{h.okRows}</td><td className="px-3 py-2">{h.failedRows}</td><td className="px-3 py-2">{h.inserted}</td><td className="px-3 py-2">{h.updated}</td>
                  <td className="px-3 py-2">{h.errors.length > 0 && <button type="button" className="underline text-primary" onClick={() => errorReport(h.errors, h.fileName)}>Error report</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
