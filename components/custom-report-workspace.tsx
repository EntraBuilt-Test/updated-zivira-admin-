"use client";

import { useEffect, useState } from "react";
import { Trash2, Eye } from "lucide-react";
import {
  apiClient,
  type CustomReportSummary,
  type CustomReportMetadata,
  type CustomReportOutput,
  type Employee
} from "@/lib/api-client";

// Round 35 Item 7 -- standalone Customized Report builder module (not
// nested under Activity Reports; legacy shows its own top nav). Two real
// screens: Name Creation (this file's CustomReportNameCreation, Screen A)
// and Generation (CustomReportGeneration, Screen B), plus a minimal real
// "Reports" viewer for a previously-saved report. Real persistence via
// /company/custom-reports*; the Parameter count shown in Screen A is
// literally `metrics.length` from the backend, never a separate counter.

const LOCKED_PARAMS = [
  { key: "sno", label: "SNo" },
  { key: "fieldForceName", label: "Field Force Name" },
  { key: "hq", label: "HQ" },
  { key: "designation", label: "Designation" },
  { key: "employeeCode", label: "Employee Code" }
];
const OPTIONAL_PARAMS = [
  { key: "doj", label: "DOJ" },
  { key: "reportingManagerI", label: "Reporting Manager I" },
  { key: "reportingHqI", label: "Reporting HQ I" },
  { key: "reportingManagerII", label: "Reporting Manager II" },
  { key: "reportingHqII", label: "Reporting HQ II" },
  { key: "state", label: "State" },
  { key: "subdivision", label: "Subdivision" }
];

type Screen = "list" | "generation" | "output";

export function CustomReportWorkspace() {
  const [screen, setScreen] = useState<Screen>("list");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [activeReportName, setActiveReportName] = useState<string>("");

  function openGeneration(id: string, name: string) {
    setActiveReportId(id);
    setActiveReportName(name);
    setScreen("generation");
  }
  function openOutput(id: string, name: string) {
    setActiveReportId(id);
    setActiveReportName(name);
    setScreen("output");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button type="button" onClick={() => setScreen("list")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${screen === "list" ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-secondary"}`}>Name Creation</button>
        {screen !== "list" && (
          <button type="button" onClick={() => setScreen(screen)} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-on-primary">
            {screen === "generation" ? "Generation" : "Report Output"} - {activeReportName}
          </button>
        )}
      </div>

      {screen === "list" && <CustomReportNameCreation onAddParameter={openGeneration} onViewReport={openOutput} />}
      {screen === "generation" && activeReportId && <CustomReportGeneration reportId={activeReportId} reportName={activeReportName} onSaved={() => setScreen("list")} />}
      {screen === "output" && activeReportId && <CustomReportOutputView reportId={activeReportId} reportName={activeReportName} />}
    </div>
  );
}

// ── Screen A -- Name Creation ────────────────────────────────────────────
function CustomReportNameCreation({
  onAddParameter, onViewReport
}: { onAddParameter: (id: string, name: string) => void; onViewReport: (id: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [optionalSelected, setOptionalSelected] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<CustomReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setReports((await apiClient.customReports()).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load reports"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function toggleOptional(key: string) {
    setOptionalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true); setError("");
    try {
      await apiClient.createCustomReport({ name: name.trim(), defaultParams: Array.from(optionalSelected) });
      setName(""); setOptionalSelected(new Set());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save report");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await apiClient.deleteCustomReport(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to delete report"); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Customized Report - Name Creation</h2>
        <div className="flex flex-col gap-1 max-w-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Name of the Report</span>
          <input className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly Field Activity Summary" />
        </div>
        <div className="space-y-2">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Default Parameter</span>
          <div className="flex flex-wrap gap-4">
            {LOCKED_PARAMS.map((p) => (
              <label key={p.key} className="flex items-center gap-1.5 text-sm text-text-muted line-through">
                <input type="checkbox" checked disabled /> {p.label}
              </label>
            ))}
            {OPTIONAL_PARAMS.map((p) => (
              <label key={p.key} className="flex items-center gap-1.5 text-sm text-text-primary">
                <input type="checkbox" checked={optionalSelected.has(p.key)} onChange={() => toggleOptional(p.key)} /> {p.label}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
        <button type="button" onClick={handleSave} disabled={!name.trim() || saving} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm p-5">
        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
              <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">S.No</th><th className="px-3 py-2">Report Name</th><th className="px-3 py-2">Parameter</th><th className="px-3 py-2">Click Here</th><th className="px-3 py-2">Click Here to Delete</th></tr></thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 border-t border-border-subtle">{i + 1}</td>
                    <td className="px-3 py-2 border-t border-border-subtle">
                      <button type="button" onClick={() => onViewReport(r.id, r.name)} className="text-primary underline">{r.name}</button>
                    </td>
                    <td className="px-3 py-2 border-t border-border-subtle">{r.parameterCount > 0 ? r.parameterCount : ""}</td>
                    <td className="px-3 py-2 border-t border-border-subtle">
                      <button type="button" onClick={() => onAddParameter(r.id, r.name)} className="text-primary underline">Click Here to Add Parameter</button>
                    </td>
                    <td className="px-3 py-2 border-t border-border-subtle">
                      <button type="button" onClick={() => handleDelete(r.id)} className="text-status-danger"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-text-muted">No custom reports saved yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen B -- Generation ────────────────────────────────────────────────
function CustomReportGeneration({
  reportId, reportName, onSaved
}: { reportId: string; reportName: string; onSaved: () => void }) {
  const [metadata, setMetadata] = useState<CustomReportMetadata | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [specialitySelected, setSpecialitySelected] = useState<string[]>([]);
  const [campaignSelected, setCampaignSelected] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([apiClient.customReportMetadata(), apiClient.customReport(reportId)])
      .then(([meta, detail]) => {
        setMetadata(meta.data);
        setSelected(new Set(detail.data.metrics));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [reportId]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      await apiClient.saveCustomReportMetrics(reportId, Array.from(selected));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="bg-surface-card rounded-xl shadow-sm p-5"><p className="text-text-muted text-sm">Loading...</p></div>;

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-1">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Customized Report - {reportName}</h2>
        <p className="text-xs text-text-muted">{selected.size} metric(s) currently selected. Only a real-data-backed subset of these produce computed values today -- see the report output screen for which ones.</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {metadata?.categories.map((cat) => (
          <div key={cat.category} className="bg-surface-card rounded-xl shadow-sm p-4 space-y-2">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold border-b border-border-subtle pb-1">{cat.category}</h3>
            <div className="flex flex-col gap-1.5">
              {cat.metrics.map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={selected.has(m.key)} onChange={() => toggle(m.key)} />
                  {m.label}
                  <Eye size={12} className="text-text-muted" />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-2">
          <h3 className="font-label-md text-label-md text-text-primary font-semibold border-b border-border-subtle pb-1">Speciality Analysis</h3>
          <select multiple className="w-full h-24 rounded-lg border border-border-subtle bg-surface-canvas text-sm p-1" value={specialitySelected} onChange={(e) => setSpecialitySelected(Array.from(e.target.selectedOptions, (o) => o.value))}>
            {(metadata?.specialties || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {specialitySelected.length === 0 && <p className="text-xs text-text-muted">None selected</p>}
        </div>

        <div className="bg-surface-card rounded-xl shadow-sm p-4 space-y-2">
          <h3 className="font-label-md text-label-md text-text-primary font-semibold border-b border-border-subtle pb-1">Campaign Info</h3>
          {metadata?.campaignsUnsupported && <p className="text-xs text-status-warning">No real campaign records exist yet in this tenant -- dropdown is real but empty.</p>}
          <select multiple className="w-full h-24 rounded-lg border border-border-subtle bg-surface-canvas text-sm p-1" value={campaignSelected} onChange={(e) => setCampaignSelected(Array.from(e.target.selectedOptions, (o) => o.value))}>
            {(metadata?.campaigns || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {campaignSelected.length === 0 && <p className="text-xs text-text-muted">None selected</p>}
        </div>
      </div>

      {error && <p className="text-status-danger text-sm">{error}</p>}
      <button type="button" onClick={handleSave} disabled={saving} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
    </div>
  );
}

// ── "REPORTS" nav -- view a previously-saved report's real (partial) output ──
function CustomReportOutputView({ reportId, reportName }: { reportId: string; reportName: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeCode, setEmployeeCode] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState<CustomReportOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([])); }, []);

  async function handleView() {
    if (!employeeCode) return;
    setLoading(true);
    try { setResult((await apiClient.customReportOutput(reportId, { employeeCode, month })).data); }
    catch { setResult(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">FieldForce Name</span>
          <select className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm min-w-[220px]" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)}>
            <option value="">Select...</option>
            {employees.map((e) => <option key={e.employeeCode} value={e.employeeCode}>{e.name} - {e.designation} - {e.territory}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Month</span>
          <input type="month" className="h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <button type="button" onClick={handleView} disabled={!employeeCode || loading} className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50">{loading ? "Loading..." : "View"}</button>
      </div>

      {result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">{reportName} -- Output</h2>
          {result.metrics.length === 0 ? (
            <p className="text-text-muted text-sm">No metrics have been selected for this report yet -- add some via &quot;Click Here to Add Parameter&quot;.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead className="bg-brand-primary-subtle"><tr><th className="px-3 py-2">Metric</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Status</th></tr></thead>
                <tbody>
                  {result.metrics.map((m) => (
                    <tr key={m.key}>
                      <td className="px-3 py-2 border-t border-border-subtle">{m.label}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">{m.computed ? m.value : "-"}</td>
                      <td className="px-3 py-2 border-t border-border-subtle">
                        {m.computed
                          ? <span className="text-status-success text-xs font-medium">Real, computed</span>
                          : <span className="text-status-warning text-xs font-medium">Selected, not yet computed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
