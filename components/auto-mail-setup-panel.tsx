"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const REPORT_NAMES = [
  "Coverage Analysis", "Missed Call Report", "Visit - Drs", "Daywise DCR - Dump", "Call wise DCR - Dump",
  "Call Average", "Sample Issued - Fieldforce wise", "Input Issued - Fieldforce wise", "Visit at a glance",
  "Campaign Dr Visit-Dump", "TP Dump", "DCR _ Analysis Dump"
];
const MODES = ["Daily", "Weekly", "Bimonthly", "Monthly"];
const DESIGNATIONS = ["BH", "RBM", "ABM", "ZBM", "BRM", "NBM", "Sr ABM", "BE", "MH", "SM"];
const INDIAN_STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
];

type AdminRow = {
  reportName: string;
  startingDate: string;
  mode: string;
  toMails: string[];
  ccMails: string[];
  status: boolean;
};

type MailRuleDraft = {
  ruleName: string;
  reportName: string;
  subdivisions: string[];
  states: string[];
  designations: string[];
  fieldforces: string[];
  startDate: string;
  repeats: string;
  gracePeriod: string;
  endDate: string;
  emailSubject: string;
  emailBody: string;
};

function emptyAdminRows(): AdminRow[] {
  return REPORT_NAMES.map((reportName) => ({
    reportName, startingDate: "", mode: "", toMails: [], ccMails: [], status: false
  }));
}

function emptyRuleDraft(): MailRuleDraft {
  return {
    ruleName: "", reportName: "", subdivisions: [], states: [], designations: [], fieldforces: [],
    startDate: "", repeats: "", gracePeriod: "", endDate: "", emailSubject: "", emailBody: ""
  };
}

// Matches sanpharma.info's "Update/Delete > Auto Mail Setup" screen
// exactly: an Admin tab (a fixed 12-report grid — Report Name / Starting
// Date / Mode / Mail Ids / Status, no Add button — where each row's "Mail
// Ids" cell opens a To-mails/CC-mails popup, and the whole grid is saved
// in one shot with the same "Select a start date and mode and Sending
// mail id both." validation) and a Fieldforce tab (a real, growable list
// of named rules, created one at a time via "Create Rule").
export function AutoMailSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [tab, setTab] = useState<"admin" | "fieldforce">("admin");

  // ── Admin tab state ──
  const [adminRows, setAdminRows] = useState<AdminRow[]>(emptyAdminRows());
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [mailIdsRowIndex, setMailIdsRowIndex] = useState<number | null>(null);
  const [draftToMails, setDraftToMails] = useState<string[]>([""]);
  const [draftCcMails, setDraftCcMails] = useState<string[]>([""]);

  // ── Fieldforce tab state ──
  const [rules, setRules] = useState<MasterRecord[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [ruleDraft, setRuleDraft] = useState<MailRuleDraft>(emptyRuleDraft());
  const [savingRule, setSavingRule] = useState(false);
  const [ruleFormError, setRuleFormError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
    loadAdmin();
  }, []);

  useEffect(() => {
    if (tab === "fieldforce" && rules.length === 0 && !loadingRules) loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadAdmin() {
    setLoadingAdmin(true);
    setAdminError(null);
    try {
      const saved = await apiClient.getAdminSetting<AdminRow[]>("autoMailSetupAdmin");
      if (saved && Array.isArray(saved) && saved.length) {
        // Merge onto the fixed report list so a reordered/extended
        // REPORT_NAMES const never loses a saved row.
        const byName = new Map(saved.map((r) => [r.reportName, r]));
        setAdminRows(REPORT_NAMES.map((name) => byName.get(name) ?? { reportName: name, startingDate: "", mode: "", toMails: [], ccMails: [], status: false }));
      } else {
        setAdminRows(emptyAdminRows());
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Failed to load Auto Mail Setup");
    } finally {
      setLoadingAdmin(false);
    }
  }

  async function loadRules() {
    setLoadingRules(true);
    setRulesError(null);
    try {
      const res = await apiClient.listMailAutoRules();
      setRules(res.data as unknown as MasterRecord[]);
    } catch (err) {
      setRulesError(err instanceof Error ? err.message : "Failed to load mail rules");
      setRules([]);
    } finally {
      setLoadingRules(false);
    }
  }

  function updateRow(index: number, patch: Partial<AdminRow>) {
    setAdminRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function openMailIds(index: number) {
    const row = adminRows[index];
    setDraftToMails(row.toMails.length ? [...row.toMails] : [""]);
    setDraftCcMails(row.ccMails.length ? [...row.ccMails] : [""]);
    setMailIdsRowIndex(index);
  }

  function closeMailIds() {
    setMailIdsRowIndex(null);
  }

  function saveMailIds() {
    if (mailIdsRowIndex === null) return;
    const row = adminRows[mailIdsRowIndex];
    const toMails = draftToMails.map((m) => m.trim()).filter(Boolean);
    const ccMails = draftCcMails.map((m) => m.trim()).filter(Boolean);
    if (!row.startingDate || !row.mode || toMails.length === 0) {
      window.alert("Select a start date and mode and Sending mail id both.");
      return;
    }
    updateRow(mailIdsRowIndex, { toMails, ccMails });
    closeMailIds();
  }

  async function saveAdmin() {
    // Same validation sanpharma applies at Save: any row that has been
    // partially filled in (date, mode or a mail id set) must have all
    // three before the whole grid can be saved.
    for (const row of adminRows) {
      const touched = row.startingDate || row.mode || row.toMails.length > 0;
      if (touched && (!row.startingDate || !row.mode || row.toMails.length === 0)) {
        window.alert("Select a start date and mode and Sending mail id both.");
        return;
      }
    }
    setSavingAdmin(true);
    setAdminError(null);
    try {
      await apiClient.saveAdminSetting("autoMailSetupAdmin", adminRows);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Failed to save Auto Mail Setup");
    } finally {
      setSavingAdmin(false);
    }
  }

  function openCreateRule() {
    setRuleDraft(emptyRuleDraft());
    setRuleFormError(null);
    setCreating(true);
  }

  function closeCreateRule() {
    setCreating(false);
  }

  function toggleInList(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  const subdivisionOptions = useMemo(
    () => Array.from(new Set(employees.map((e) => String(e.territory ?? "")).filter(Boolean))).sort(),
    [employees]
  );
  const fieldforceOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  async function saveRule() {
    const d = ruleDraft;
    if (!d.ruleName.trim() || !d.reportName || d.subdivisions.length === 0 || d.states.length === 0 ||
        d.designations.length === 0 || d.fieldforces.length === 0 || !d.startDate || !d.repeats || !d.endDate) {
      setRuleFormError("Please fill all the required (*) fields.");
      return;
    }
    setSavingRule(true);
    setRuleFormError(null);
    try {
      await apiClient.createMailAutoRule({
        ruleName: d.ruleName.trim(),
        reportName: d.reportName,
        subdivisions: d.subdivisions,
        states: d.states,
        designations: d.designations,
        fieldforces: d.fieldforces,
        startDate: d.startDate,
        repeats: d.repeats,
        gracePeriod: Number(d.gracePeriod) || 0,
        endDate: d.endDate,
        emailSubject: d.emailSubject,
        emailBody: d.emailBody
      });
      setCreating(false);
      await loadRules();
    } catch (err) {
      setRuleFormError(err instanceof Error ? err.message : "Failed to save the mail rule");
    } finally {
      setSavingRule(false);
    }
  }

  async function deleteRule(id: string) {
    if (!window.confirm("Delete this mail rule?")) return;
    try {
      await apiClient.deleteMailAutoRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete rule");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 8px", borderRadius: "6px",
    border: "1px solid var(--border)", fontSize: "13px", background: "var(--panel)", color: "var(--ink)"
  };

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Master Setup</p>
          <h2 className="text-2xl font-bold text-text-primary">Auto Mail Setup</h2>
        </div>
        <div className="flex gap-2">
          {tab === "admin" ? (
            <button className="button" type="button" onClick={saveAdmin} disabled={savingAdmin || loadingAdmin}>
              {savingAdmin ? "Saving..." : "Save"}
            </button>
          ) : (
            <button className="button" type="button" onClick={openCreateRule}>Create Rule</button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-semibold ${tab === "admin" ? "text-brand-primary border-b-2 border-brand-primary" : "text-text-muted"}`}
          onClick={() => setTab("admin")}
        >
          Admin
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-semibold ${tab === "fieldforce" ? "text-brand-primary border-b-2 border-brand-primary" : "text-text-muted"}`}
          onClick={() => setTab("fieldforce")}
        >
          Fieldforce
        </button>
      </div>

      {tab === "admin" && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          {adminError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 m-4">{adminError}</div>}
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "560px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Sl No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Report Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Starting Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Mode</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Mail Ids</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                </tr>
              </thead>
              <tbody>
                {adminRows.map((row, i) => (
                  <tr key={row.reportName} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.reportName}</td>
                    <td className="px-4 py-3">
                      <input type="date" value={row.startingDate} onChange={(e) => updateRow(i, { startingDate: e.target.value })} style={inputStyle} />
                    </td>
                    <td className="px-4 py-3" style={{ minWidth: "140px" }}>
                      <CustomSelect value={row.mode} options={MODES} onChange={(v) => updateRow(i, { mode: v })} placeholder="--Select--" />
                    </td>
                    <td className="px-4 py-3">
                      <button className="button-secondary" type="button" onClick={() => openMailIds(i)}>
                        {row.toMails.length ? `${row.toMails.length} Mail Id${row.toMails.length > 1 ? "s" : ""}` : "- To Mail ids -"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={row.status} onChange={(e) => updateRow(i, { status: e.target.checked })} className="sr-only peer" />
                        <span className="w-9 h-5 bg-surface-subtle border border-border-subtle rounded-full peer-checked:bg-brand-primary relative transition-colors">
                          <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "fieldforce" && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          {rulesError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 m-4">{rulesError}</div>}
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Rule No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Rule Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Report Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Recurrence</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Start Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">End Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Actions</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                </tr>
              </thead>
              <tbody>
                {!loadingRules && rules.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rules.map((r, i) => (
                  <tr key={r.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.ruleName ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.reportName ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.repeats ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.startDate ?? "")}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.endDate ?? "")}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="button-secondary" type="button" onClick={() => deleteRule(r.id)}>Delete</button>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{String(r.status ?? "Active")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mailIdsRowIndex !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "20px" }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", width: "420px", maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0, marginBottom: "16px", fontSize: "1.05rem" }}>Mail Ids</h3>

            <p style={{ fontWeight: 600, marginBottom: "8px" }}>To mails</p>
            {draftToMails.map((mail, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input type="text" value={mail} placeholder="Mail ID" style={inputStyle}
                  onChange={(e) => setDraftToMails((prev) => prev.map((m, i2) => (i2 === idx ? e.target.value : m)))} />
                <button className="button-secondary" type="button" onClick={() => setDraftToMails((prev) => prev.filter((_, i2) => i2 !== idx))}>Delete</button>
              </div>
            ))}
            <button className="button-secondary" type="button" onClick={() => setDraftToMails((prev) => [...prev, ""])} style={{ marginBottom: "16px" }}>Add Row</button>

            <p style={{ fontWeight: 600, marginBottom: "8px" }}>CC mails</p>
            {draftCcMails.map((mail, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input type="text" value={mail} placeholder="Mail ID" style={inputStyle}
                  onChange={(e) => setDraftCcMails((prev) => prev.map((m, i2) => (i2 === idx ? e.target.value : m)))} />
                <button className="button-secondary" type="button" onClick={() => setDraftCcMails((prev) => prev.filter((_, i2) => i2 !== idx))}>Delete</button>
              </div>
            ))}
            <button className="button-secondary" type="button" onClick={() => setDraftCcMails((prev) => [...prev, ""])} style={{ marginBottom: "20px" }}>Add Row</button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="button" type="button" onClick={saveMailIds}>Save</button>
              <button className="button-secondary" type="button" onClick={closeMailIds}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "20px" }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", width: "560px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>New Mail Rule</h2>
              <button onClick={closeCreateRule} type="button" aria-label="Close">✕</button>
            </div>

            {ruleFormError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" style={{ marginBottom: "12px" }}>{ruleFormError}</div>}

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Rule Name *</span>
              <input type="text" value={ruleDraft.ruleName} onChange={(e) => setRuleDraft({ ...ruleDraft, ruleName: e.target.value })} style={inputStyle} />
            </label>

            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Report Name *</span>
              <CustomSelect value={ruleDraft.reportName} options={REPORT_NAMES} onChange={(v) => setRuleDraft({ ...ruleDraft, reportName: v })} placeholder="--- Select Report Name---" />
            </label>

            <p style={{ fontWeight: 600, marginTop: "16px", marginBottom: "8px" }}>Mail To</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Subdivision *</span>
                <div style={{ ...inputStyle, height: "90px", overflowY: "auto" }}>
                  {subdivisionOptions.map((s) => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "2px 0" }}>
                      <input type="checkbox" checked={ruleDraft.subdivisions.includes(s)} onChange={() => setRuleDraft({ ...ruleDraft, subdivisions: toggleInList(ruleDraft.subdivisions, s) })} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>State *</span>
                <div style={{ ...inputStyle, height: "90px", overflowY: "auto" }}>
                  {INDIAN_STATES.map((s) => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "2px 0" }}>
                      <input type="checkbox" checked={ruleDraft.states.includes(s)} onChange={() => setRuleDraft({ ...ruleDraft, states: toggleInList(ruleDraft.states, s) })} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Designation *</span>
                <div style={{ ...inputStyle, height: "90px", overflowY: "auto" }}>
                  {DESIGNATIONS.map((d) => (
                    <label key={d} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "2px 0" }}>
                      <input type="checkbox" checked={ruleDraft.designations.includes(d)} onChange={() => setRuleDraft({ ...ruleDraft, designations: toggleInList(ruleDraft.designations, d) })} />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Fieldforce *</span>
                <div style={{ ...inputStyle, height: "90px", overflowY: "auto" }}>
                  {fieldforceOptions.map((e) => {
                    const name = String(e.name ?? "");
                    return (
                      <label key={e.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "2px 0" }}>
                        <input type="checkbox" checked={ruleDraft.fieldforces.includes(name)} onChange={() => setRuleDraft({ ...ruleDraft, fieldforces: toggleInList(ruleDraft.fieldforces, name) })} />
                        {name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <p style={{ fontWeight: 600, marginTop: "16px", marginBottom: "8px" }}>Set Recurrence</p>
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Start Date *</span>
              <input type="date" value={ruleDraft.startDate} onChange={(e) => setRuleDraft({ ...ruleDraft, startDate: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Repeats *</span>
              <CustomSelect value={ruleDraft.repeats} options={MODES} onChange={(v) => setRuleDraft({ ...ruleDraft, repeats: v })} placeholder="--Select--" />
            </label>
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Grace Period *</span>
              <input type="number" min={0} value={ruleDraft.gracePeriod} onChange={(e) => setRuleDraft({ ...ruleDraft, gracePeriod: e.target.value })} style={inputStyle} placeholder="Date" />
            </label>
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>End Date *</span>
              <input type="date" value={ruleDraft.endDate} onChange={(e) => setRuleDraft({ ...ruleDraft, endDate: e.target.value })} style={inputStyle} />
            </label>

            <p style={{ fontWeight: 600, marginTop: "16px", marginBottom: "8px" }}>Email Information</p>
            <label style={{ display: "block", marginBottom: "12px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Email Subject</span>
              <input type="text" value={ruleDraft.emailSubject} onChange={(e) => setRuleDraft({ ...ruleDraft, emailSubject: e.target.value })} style={inputStyle} placeholder="Subject..." />
            </label>
            <label style={{ display: "block", marginBottom: "20px" }}>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 500 }}>Email Body</span>
              <textarea value={ruleDraft.emailBody} onChange={(e) => setRuleDraft({ ...ruleDraft, emailBody: e.target.value })} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Body..." />
            </label>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="button" type="button" onClick={saveRule} disabled={savingRule}>{savingRule ? "Saving..." : "Save"}</button>
              <button className="button-secondary" type="button" onClick={closeCreateRule} disabled={savingRule}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
