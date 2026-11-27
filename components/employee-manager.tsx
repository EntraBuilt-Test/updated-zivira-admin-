"use client";

import type { Employee } from "@zivira/types";
import { RefreshCw, X, AlertTriangle } from "lucide-react";
import { ColumnFilterDropdown } from "@/components/column-filter-dropdown";
import { CustomSelect } from "@/components/custom-select";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/format-date";

// The backend's employees.role is a fixed enum (NBH/BH/RBM/ZBM/ABM/SR_MR/MR/
// OTHER) and is required, but the Add Employee form only surfaces
// Designation — so every designation option needs a role it maps to.
const DESIGNATION_TO_ROLE: Record<string, string> = {
  "Medical Representative": "MR",
  "Area Sales Manager": "ABM",
  "Regional Sales Manager": "RBM",
  "Zonal Sales Manager": "ZBM",
  "Product Manager": "OTHER",
  "Finance Executive": "OTHER",
  "HR Executive": "OTHER"
};

// Sample initial data with all SFA master columns
const initialFieldForce: any[] = [];

const MANAGER_ROLES = new Set(["ABM", "RBM", "ZBM", "NBH", "BH"]);
const BASE_REGIONS = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Gujarat", "Delhi"];
const DEFAULT_DIVISIONS = ["Astra", "Aura", "Zivira"];
const DEPARTMENTS = ["Sales", "Marketing", "Medical Affairs", "Production", "Quality Assurance (QA)", "Quality Control (QC)", "Research & Development (R&D)"];
const DESIGNATIONS: { value: string; label: string }[] = [
  { value: "Medical Representative", label: "Medical Representative (MR)" },
  { value: "Area Sales Manager", label: "Area Sales Manager (ASM)" },
  { value: "Regional Sales Manager", label: "Regional Sales Manager (RSM)" },
  { value: "Zonal Sales Manager", label: "Zonal Sales Manager (ZSM)" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Finance Executive", label: "Finance Executive" },
  { value: "HR Executive", label: "HR Executive" }
];
// Probation / Trainee / Confirmed. Stored as employmentStatus -- separate
// from Active/Inactive, which still controls the employee's login.
const EMPLOYMENT_STATUS: { value: string; label: string }[] = [
  { value: "PROBATION", label: "Probation" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "CONFIRMED", label: "Confirmed" }
];
const labelOf = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;
const valueOf = (list: { value: string; label: string }[], l: string) => list.find((o) => o.label === l)?.value ?? l;

// Next employee code = the most common code pattern + (highest number + 1),
// keeping the zero padding. e.g. E118, E119, E120 -> E121; EMP0099 -> EMP0100.
function nextEmployeeCode(list: any[]): string {
  const groups = new Map<string, { count: number; max: number; width: number }>();
  const taken = new Set<string>();
  for (const e of list) {
    const code = String(e?.employeeCode || "").trim().toUpperCase();
    if (!code) continue;
    taken.add(code);
    if (e?.codePending || code.startsWith("MGR-PENDING")) continue;
    const m = /^(.*?)(\d+)$/.exec(code);
    if (!m) continue;
    const g = groups.get(m[1]) ?? { count: 0, max: 0, width: 0 };
    g.count += 1;
    g.max = Math.max(g.max, Number(m[2]));
    g.width = Math.max(g.width, m[2].length);
    groups.set(m[1], g);
  }
  let prefix = "E";
  let best = { count: 0, max: 0, width: 3 };
  for (const [p, g] of groups) if (g.count > best.count) { prefix = p; best = g; }
  let n = best.max + 1;
  let code = prefix + String(n).padStart(best.width, "0");
  while (taken.has(code)) { n += 1; code = prefix + String(n).padStart(best.width, "0"); }
  return code;
}

const BLANK_FORM = {
  employeeCode: "",
  name: "",
  gender: "Male",
  dob: "",
  joinDate: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  department: "Sales",
  designation: "Medical Representative",
  division: "Zivira",
  reportingManager: "",
  region: "Tamil Nadu",
  hq: "",
  drivingLicense: "",
  employmentStatus: "PROBATION"
};

export function EmployeeManager() {
  const [employees, setEmployees] = useState<any[]>(initialFieldForce);
  const [showForm, setShowForm] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      for (const [key, val] of Object.entries(columnFilters)) {
        if (val !== "All" && String(emp[key] || "").toUpperCase() !== val.toUpperCase()) return false;
      }
      return true;
    });
  }, [employees, columnFilters]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [hqMaster, setHqMaster] = useState<any[]>([]);
  const [divisionNames, setDivisionNames] = useState<string[]>(DEFAULT_DIVISIONS);
  const [saving, setSaving] = useState(false);
  // Round 60 -- "Code pending" managers (auto-created by the Salesforce upload): Complete details sets the real employee code and re-links the team.
  const [completeFor, setCompleteFor] = useState<any | null>(null);
  const [cf, setCf] = useState({ employeeCode: "", name: "", designation: "", territory: "", phone: "", email: "" });
  const [completing, setCompleting] = useState(false);
  const [notice, setNotice] = useState("");
  function openComplete(e: any) { setCompleteFor(e); setCf({ employeeCode: "", name: e.name || "", designation: e.designation || "", territory: e.territory === "Pending" ? "" : e.territory || "", phone: e.phone && e.phone !== "9876543210" ? e.phone : "", email: e.email && !String(e.email).endsWith("@example.com") ? e.email : "" }); setError(""); }
  async function confirmComplete() {
    if (!completeFor) return;
    const code = cf.employeeCode.trim();
    if (!code) { setError("Enter the real Employee Code."); return; }
    setCompleting(true); setError("");
    try {
      const body: Record<string, unknown> = { employeeCode: code, name: cf.name.trim() || completeFor.name };
      if (cf.designation.trim()) body.designation = cf.designation.trim();
      if (cf.territory.trim()) body.territory = cf.territory.trim();
      if (cf.phone.trim()) body.phone = cf.phone.trim();
      if (cf.email.trim()) body.email = cf.email.trim();
      const res: any = await apiClient.completeEmployee(completeFor.employeeCode, body);
      setNotice(`${completeFor.name} is now ${code}; ${res?.relinked ?? 0} report(s) re-linked to the new code.`);
      setCompleteFor(null); await loadEmployees();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to complete the details"); }
    finally { setCompleting(false); }
  }
  // Round 46 -- "Mark Resigned": records the left date and deactivates the ID.
  const [resignFor, setResignFor] = useState<any | null>(null);
  const [resignDate, setResignDate] = useState("");
  const [resigning, setResigning] = useState(false);
  async function confirmResign() {
    if (!resignFor || !/^\d{4}-\d{2}-\d{2}$/.test(resignDate)) { setError("Enter the left date."); return; }
    setResigning(true); setError("");
    try { await apiClient.resignEmployee(resignFor.employeeCode, resignDate); setResignFor(null); setResignDate(""); await loadEmployees(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to mark resigned"); }
    finally { setResigning(false); }
  }

  async function loadEmployees() {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.employees();
      const mapped = response.data.map((emp, i) => ({
        ...emp,
        employeeCode: emp.employeeCode || `EMP-MR-${String(i + 1).padStart(4, "0")}`,
        gender: (emp as any).gender || "",
        department: (emp as any).department || "",
        region: (emp as any).region || (emp as any).state || "",
        hq: (emp as any).hq || emp.territory || ""
      }));
      // Merge with initial data to ensure complete entries
      setEmployees([...initialFieldForce, ...mapped.filter(m => !initialFieldForce.some(f => f.id === m.id))]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load employees");
    } finally {
      setLoading(false);
    }
  }

  // HQ + Division masters feed the HQ and Division dropdowns.
  async function loadMasters() {
    try {
      const res: any = await apiClient.masterRecords("territoryHqMaster");
      setHqMaster((res?.data ?? []).filter((r: any) => String(r.status || "ACTIVE").toUpperCase() !== "INACTIVE"));
    } catch { setHqMaster([]); }
    try {
      const res: any = await apiClient.masterRecords("divisionMaster");
      const names = Array.from(new Set<string>((res?.data ?? [])
        .filter((r: any) => String(r.status || "ACTIVE").toUpperCase() !== "INACTIVE")
        .map((r: any) => String(r.divisionName || "").trim()).filter(Boolean)));
      if (names.length) setDivisionNames(names);
    } catch { /* keep defaults */ }
  }

  function openAddForm() {
    setForm({ ...BLANK_FORM, division: divisionNames.includes("Zivira") ? "Zivira" : divisionNames[0] ?? "Zivira", employeeCode: nextEmployeeCode(employees) });
    setShowForm(true);
  }

  const lc = (v: unknown) => String(v ?? "").trim().toLowerCase();
  // HQ name -> state, from the Territory / Headquarters master.
  const hqState = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of hqMaster) if (r.headquartersName && r.state) m.set(lc(r.headquartersName), String(r.state));
    return m;
  }, [hqMaster]);
  const regionOptions = useMemo(() => {
    const extra = [...hqMaster.map((r) => String(r.state || "")), ...employees.map((e) => String(e.state || ""))]
      .map((v) => v.trim()).filter((v) => v && !BASE_REGIONS.some((b) => lc(b) === lc(v)));
    return [...BASE_REGIONS, ...Array.from(new Set(extra)).sort()];
  }, [hqMaster, employees]);
  // Managers whose region (their own state, or their HQ's state) is the selected region.
  const allManagers = useMemo(
    () => employees.filter((e) => MANAGER_ROLES.has(String(e.role || "").toUpperCase()) && e.status !== "INACTIVE" && !e.codePending),
    [employees]
  );
  const regionManagers = useMemo(
    () => allManagers.filter((e) => lc(e.state || hqState.get(lc(e.territory)) || "") === lc(form.region)),
    [allManagers, hqState, form.region]
  );
  const managerList = regionManagers.length ? regionManagers : allManagers;
  const managerLabel = (e: any) => `${e.name} (${e.employeeCode})`;
  const hqOptions = useMemo(() => {
    const inRegion = hqMaster.filter((r) => lc(r.state) === lc(form.region));
    const inDivision = inRegion.filter((r) => !r.division || lc(r.division) === lc(form.division));
    const pick = inDivision.length ? inDivision : inRegion.length ? inRegion : hqMaster;
    let names = pick.map((r) => String(r.headquartersName || "").trim()).filter(Boolean);
    if (!names.length) names = employees.map((e) => String(e.territory || "").trim()).filter((v) => v && v !== "Pending");
    return Array.from(new Set(names)).sort();
  }, [hqMaster, employees, form.region, form.division]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.employeeCode.trim()) return;
    if (!form.hq.trim()) { setError("Please select the HQ."); return; }

    setSaving(true);
    setError("");
    try {
      // role comes from Designation, territory from HQ, state from Region.
      await apiClient.createEmployee({
        name: form.name.trim(),
        employeeCode: form.employeeCode.trim(),
        gender: form.gender,
        dob: form.dob || undefined,
        joinDate: form.joinDate || undefined,
        phone: form.phone.trim() || undefined,
        secondaryPhone: form.secondaryPhone.trim() || undefined,
        email: form.email.trim() || undefined,
        designation: form.designation,
        division: form.division,
        state: form.region,
        reportingManager: form.reportingManager || undefined,
        territory: form.hq,
        department: form.department,
        role: (DESIGNATION_TO_ROLE[form.designation] ?? "OTHER") as any,
        drivingLicense: form.drivingLicense.trim() || undefined,
        employmentStatus: form.employmentStatus,
        status: "ACTIVE"
      } as any);
      setShowForm(false);
      setForm({ ...BLANK_FORM });
      setNotice(`${form.name.trim()} added with Employee Code ${form.employeeCode.trim().toUpperCase()}.`);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
    void loadMasters();
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button className="button button-secondary" onClick={loadEmployees} type="button">
          <RefreshCw size={17} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>
      <div style={{ margin: "0 0 12px", padding: "10px 14px", borderRadius: 8, background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412", fontSize: 13 }}>
        <strong>View only.</strong> Adding, editing, resigning and resetting logins for employees is now done by HR in the HR portal (menu: Field Force Employees).
      </div>
      {notice && (
        <div style={{ margin: "8px 0", padding: "8px 12px", borderRadius: 8, background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{notice}</span><button type="button" onClick={() => setNotice("")} style={{ textDecoration: "underline" }}>Dismiss</button>
        </div>
      )}
      {error && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
          }}
        >
          <div style={{ background: "var(--panel)", borderRadius: "10px", padding: "24px", minWidth: "320px", maxWidth: "440px" }}>
            <div>
              <div>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#ef4444" }}>Something went wrong</h3>
              </div>
              <button className="subdivision-icon-button" onClick={() => setError("")} type="button" title="Close" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--ink)" }}>{error}</p>
            <button className="button button-secondary" style={{ marginTop: "16px", width: "100%" }} onClick={() => setError("")} type="button">
              Close
            </button>
          </div>
        </div>
      )}

      {showForm ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "var(--panel)", borderRadius: "10px", width: "100%", maxWidth: "800px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div className="subdivision-head" style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", marginBottom: 0 }}>
              <div>
                <h2>Add Employee</h2>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleSave} style={{ padding: "24px", overflowY: "auto" }}>
          <div className="field">
            <label>Employee Code</label>
            <input required readOnly value={form.employeeCode} style={{ background: "var(--surface-subtle, #f3f4f6)", fontWeight: 600 }} title="Generated automatically" />
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>Generated automatically (next number)</span>
          </div>
          <div className="field">
            <label>Employee Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" />
          </div>
          <div className="field">
            <label>Gender</label>
            <CustomSelect value={form.gender} options={["Male", "Female", "Other"]} onChange={(v) => setForm({ ...form, gender: v })} />
          </div>
          <div className="field">
            <label>Date of Birth</label>
            <input type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div className="field">
            <label>Date of Joining (DOJ)</label>
            <input type="date" required value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Mobile Number</label>
            <input required inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="10 digit mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder="9876543210" />
          </div>
          <div className="field">
            <label>Secondary Mobile Number</label>
            <input inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="10 digit mobile number" value={form.secondaryPhone} onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value.replace(/\D/g, "") })} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Email ID</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" />
          </div>
          <div className="field">
            <label>Designation</label>
            <CustomSelect value={labelOf(DESIGNATIONS, form.designation)} options={DESIGNATIONS.map((d) => d.label)} onChange={(v) => setForm({ ...form, designation: valueOf(DESIGNATIONS, v) })} />
          </div>
          <div className="field">
            <label>Division</label>
            <CustomSelect value={form.division} options={divisionNames} onChange={(v) => setForm({ ...form, division: v, hq: "" })} />
          </div>
          <div className="field">
            <label>Region</label>
            <CustomSelect value={form.region} options={regionOptions} onChange={(v) => setForm({ ...form, region: v, reportingManager: "", hq: "" })} />
          </div>
          <div className="field">
            <label>Reporting Manager</label>
            <CustomSelect
              value={(() => { const m = managerList.find((e) => e.employeeCode === form.reportingManager); return m ? managerLabel(m) : ""; })()}
              options={["No reporting manager", ...managerList.map(managerLabel)]}
              placeholder={managerList.length ? "Select manager" : "No managers found"}
              onChange={(v) => setForm({ ...form, reportingManager: managerList.find((e) => managerLabel(e) === v)?.employeeCode ?? "" })}
            />
            {!regionManagers.length && allManagers.length ? (
              <span style={{ fontSize: 11, color: "#b45309", fontWeight: 400 }}>No manager found in {form.region} - showing all managers</span>
            ) : null}
          </div>
          <div className="field">
            <label>HQ</label>
            <CustomSelect value={form.hq} options={hqOptions} placeholder={hqOptions.length ? "Select HQ" : "No HQ in Territory / HQ Master"} onChange={(v) => setForm({ ...form, hq: v })} />
          </div>
          <div className="field">
            <label>Department</label>
            <CustomSelect value={form.department} options={DEPARTMENTS} onChange={(v) => setForm({ ...form, department: v })} />
          </div>
          <div className="field">
            <label>Driving License</label>
            <input value={form.drivingLicense} onChange={(e) => setForm({ ...form, drivingLicense: e.target.value })} placeholder="e.g. DL-MH-20-1234567" />
          </div>
          <div className="field">
            <label>Employee Status</label>
            <CustomSelect value={labelOf(EMPLOYMENT_STATUS, form.employmentStatus)} options={EMPLOYMENT_STATUS.map((o) => o.label)} onChange={(v) => setForm({ ...form, employmentStatus: valueOf(EMPLOYMENT_STATUS, v) })} />
          </div>
          <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : "Add Employee"}</button>
            </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee Code</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee Name</th>
              {[
                { key: "gender", label: "Gender" },
                { key: "dob", label: "DOB" },
                { key: "joinDate", label: "DOJ" },
                { key: "phone", label: "Mobile" },
                { key: "secondaryPhone", label: "Secondary Mobile" },
                { key: "email", label: "Email" },
                { key: "designation", label: "Designation" },
                { key: "division", label: "Division" },
                { key: "reportingManager", label: "Reporting Manager" },
                { key: "region", label: "Region" },
                { key: "hq", label: "HQ" },
                { key: "department", label: "Department" },
                { key: "drivingLicense", label: "Driving License" }
              ].map(f => {
                const isFiltered = ["Gender", "Department", "Designation", "Division", "Region", "HQ"].includes(f.label);
                let options: {label: string, value: string}[] = [];
                if (isFiltered) {
                  const uniqueValues = Array.from(new Set(employees.map(r => String((r as any)[f.key] || "")))).filter(Boolean).sort();
                  options = uniqueValues.map(v => ({ label: v, value: v }));
                }
                
                return (
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle" key={f.key}>
                    {isFiltered ? (
                      <div style={{ minWidth: "140px" }}>
                        <ColumnFilterDropdown 
                          title={f.label} 
                          value={columnFilters[f.key] || "All"} 
                          options={options} 
                          onChange={(val) => setColumnFilters(prev => ({ ...prev, [f.key]: val }))} 
                        />
                      </div>
                    ) : (
                      f.label
                    )}
                  </th>
                );
              })}
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Login</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Left Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredEmployees.map((employee, i) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={employee.id || i}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{employee.employeeCode}{employee.codePending && <span title="Auto-created from a manager name in the Salesforce upload; the real code is not known yet" style={{ marginLeft: 8, padding: "1px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>Code pending</span>}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong>{employee.name}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.gender || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.dob ? formatDate(employee.dob) : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.joinDate ? formatDate(employee.joinDate) : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.secondaryPhone || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.email || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.designation}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.division}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{(() => { const m = employees.find((x) => x.employeeCode === employee.reportingManager); return m ? `${m.name} (${m.employeeCode})` : employee.reportingManager || "—"; })()}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.region || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.hq || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.department || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{(employee as any).drivingLicense || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.employmentStatus ? labelOf(EMPLOYMENT_STATUS, employee.employmentStatus) : "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "999px", 
                    fontSize: "11px", 
                    fontWeight: 600, 
                    background: employee.status === "ACTIVE" ? "#10b98115" : "#ef444415", 
                    color: employee.status === "ACTIVE" ? "#10b981" : "#ef4444",
                    border: employee.status === "ACTIVE" ? "1px solid #10b98125" : "1px solid #ef444425"
                  }}>
                    {employee.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.leftDate ? formatDate(employee.leftDate) : "—"}</td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={19} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                  No field force found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {completeFor ? (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-xl shadow-2xl border border-border-subtle w-full max-w-md p-5 space-y-3">
            <h3 className="font-bold text-text-primary">Complete details - {completeFor.name}</h3>
            <p className="text-sm text-text-secondary">This manager was auto-created from a name in the Salesforce upload (placeholder code {completeFor.employeeCode}). Enter the real Employee Code: the team that reports to this manager is re-linked automatically.</p>
            {([["employeeCode", "Real Employee Code *"], ["name", "Name"], ["designation", "Designation"], ["territory", "HQ"], ["phone", "Mobile"], ["email", "Email"]] as const).map(([k, label]) => (
              <label key={k} className="block text-sm">{label}
                <input className="input mt-1 w-full" value={cf[k]} onChange={(e) => setCf({ ...cf, [k]: e.target.value })} />
              </label>
            ))}
            {error ? <div style={{ color: "#c00000", fontSize: 13 }}>{error}</div> : null}
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1.5 rounded border border-border-subtle text-sm" onClick={() => setCompleteFor(null)}>Cancel</button>
              <button type="button" className="px-3 py-1.5 rounded bg-primary text-on-primary text-sm font-semibold disabled:opacity-50" disabled={completing} onClick={() => void confirmComplete()}>{completing ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      ) : null}
      {resignFor ? (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-xl shadow-2xl border border-border-subtle w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-text-primary">Mark Resigned</h3>
            <p className="text-sm text-text-secondary">{resignFor.name} ({resignFor.employeeCode}) will be deactivated and the left date recorded.</p>
            <label className="block text-sm">Left Date
              <input type="date" className="input mt-1 w-full" value={resignDate} onChange={(e) => setResignDate(e.target.value)} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1.5 rounded border border-border-subtle text-sm" onClick={() => setResignFor(null)}>Cancel</button>
              <button type="button" className="px-3 py-1.5 rounded bg-primary text-on-primary text-sm font-semibold disabled:opacity-50" disabled={resigning} onClick={() => void confirmResign()}>{resigning ? "Saving..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
