"use client";

import type { Employee } from "@zivira/types";
import { RefreshCw, X, AlertTriangle } from "lucide-react";
import { ColumnFilterDropdown } from "@/components/column-filter-dropdown";
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
  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    gender: "Male",
    dob: "",
    joinDate: "",
    phone: "",
    email: "",
    department: "Sales",
    designation: "Medical Representative",
    division: "Zivira",
    reportingManager: "",
    region: "Tamil Nadu",
    hq: "",
    patch: "",
    drivingLicense: "",
    sfCode: "",
    status: "ACTIVE"
  });
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
        gender: (emp as any).gender || (i % 2 === 0 ? "Male" : "Female"),
        dob: emp.dob || "1990-01-01",
        joinDate: emp.joinDate || "2022-01-01",
        phone: emp.phone || "9876543210",
        email: emp.email || `${emp.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        department: (emp as any).department || "Sales",
        region: (emp as any).region || "Tamil Nadu",
        hq: (emp as any).hq || emp.territory || "Chennai Central HQ",
        patch: (emp as any).patch || "T. Nagar"
      }));
      // Merge with initial data to ensure complete entries
      setEmployees([...initialFieldForce, ...mapped.filter(m => !initialFieldForce.some(f => f.id === m.id))]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load employees");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.employeeCode.trim() || !form.hq.trim()) return;

    setSaving(true);
    setError("");
    try {
      // The backend's Employee model requires "role" (a fixed enum) and
      // "territory" — neither is a field this form shows directly, so they
      // have to be derived from Designation and HQ respectively. Previously
      // this form never called the API at all (it only updated local
      // state), which is why nothing ever actually persisted.
      await apiClient.createEmployee({
        name: form.name,
        employeeCode: form.employeeCode,
        designation: form.designation,
        division: form.division,
        reportingManager: form.reportingManager || undefined,
        territory: form.hq,
        role: (DESIGNATION_TO_ROLE[form.designation] ?? "OTHER") as any,
        drivingLicense: form.drivingLicense || undefined,
        sfCode: form.sfCode || undefined,
        status: form.status as "ACTIVE" | "INACTIVE"
      } as any);
      setShowForm(false);
      setForm({
        employeeCode: "",
        name: "",
        gender: "Male",
        dob: "",
        joinDate: "",
        phone: "",
        email: "",
        department: "Sales",
        designation: "Medical Representative",
        division: "Zivira",
        reportingManager: "",
        region: "Tamil Nadu",
        hq: "",
        patch: "",
        drivingLicense: "",
        sfCode: "",
        status: "ACTIVE"
      });
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button className="button" onClick={() => setShowForm((value) => !value)} type="button">
          Add Employee
        </button>
        <button className="button button-secondary" onClick={loadEmployees} type="button">
          <RefreshCw size={17} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
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
            <input required value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} placeholder="e.g. EMP-MR-0001" />
          </div>
          <div className="field">
            <label>Employee Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" />
          </div>
          <div className="field">
            <label>Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
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
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
          </div>
          <div className="field">
            <label>Email ID</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" />
          </div>
          <div className="field">
            <label>Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Medical Affairs">Medical Affairs</option>
              <option value="Production">Production</option>
              <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
              <option value="Quality Control (QC)">Quality Control (QC)</option>
              <option value="Research & Development (R&D)">Research & Development (R&D)</option>
            </select>
          </div>
          <div className="field">
            <label>Designation</label>
            <select className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
              <option value="Medical Representative">Medical Representative (MR)</option>
              <option value="Area Sales Manager">Area Sales Manager (ASM)</option>
              <option value="Regional Sales Manager">Regional Sales Manager (RSM)</option>
              <option value="Zonal Sales Manager">Zonal Sales Manager (ZSM)</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Finance Executive">Finance Executive</option>
              <option value="HR Executive">HR Executive</option>
            </select>
          </div>
          <div className="field">
            <label>Division</label>
            <select className="input" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}>
              <option value="Astra">Astra</option>
              <option value="Aura">Aura</option>
              <option value="Zivira">Zivira</option>
            </select>
          </div>
          <div className="field">
            <label>Reporting Manager</label>
            <input value={form.reportingManager} onChange={(e) => setForm({ ...form, reportingManager: e.target.value })} placeholder="Manager Name" />
          </div>
          <div className="field">
            <label>Region</label>
            <select className="input" required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
          <div className="field">
            <label>HQ</label>
            <input required value={form.hq} onChange={(e) => setForm({ ...form, hq: e.target.value })} placeholder="e.g. Chennai Central HQ" />
          </div>
          <div className="field">
            <label>Patch</label>
            <input required value={form.patch} onChange={(e) => setForm({ ...form, patch: e.target.value })} placeholder="e.g. T. Nagar" />
          </div>
          <div className="field">
            <label>Driving License</label>
            <input value={form.drivingLicense} onChange={(e) => setForm({ ...form, drivingLicense: e.target.value })} placeholder="e.g. DL-MH-20-1234567" />
          </div>
          <div className="field">
            <label>Saneforce Code</label>
            <input value={form.sfCode} onChange={(e) => setForm({ ...form, sfCode: e.target.value })} placeholder="e.g. 1886532" />
          </div>
          <div className="field">
            <label>Employee Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
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
                { key: "email", label: "Email" },
                { key: "department", label: "Department" },
                { key: "designation", label: "Designation" },
                { key: "division", label: "Division" },
                { key: "reportingManager", label: "Reporting Manager" },
                { key: "region", label: "Region" },
                { key: "hq", label: "HQ" },
                { key: "patch", label: "Patch" },
                { key: "drivingLicense", label: "Driving License" }
              ].map(f => {
                const isFiltered = ["Gender", "Department", "Designation", "Division", "Region", "HQ", "Patch"].includes(f.label);
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
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Left Date</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredEmployees.map((employee, i) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={employee.id || i}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontWeight: 600 }}>{employee.employeeCode}{employee.codePending && <span title="Auto-created from a manager name in the Salesforce upload; the real code is not known yet" style={{ marginLeft: 8, padding: "1px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>Code pending</span>}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong>{employee.name}</strong></td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.gender}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(employee.dob)}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(employee.joinDate)}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.email || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.department}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.designation}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.division}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.reportingManager || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.region}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.hq || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{employee.patch || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{(employee as any).drivingLicense || "—"}</td>
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
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                  {employee.codePending ? (
                    <button type="button" className="px-3 py-1 rounded bg-primary text-on-primary text-xs font-semibold" onClick={() => openComplete(employee)}>Complete details</button>
                  ) : employee.status === "ACTIVE" ? (
                    <button type="button" className="px-3 py-1 rounded border border-border-subtle text-xs font-semibold hover:bg-surface-subtle" onClick={() => { setResignFor(employee); setResignDate(""); setError(""); }}>Mark Resigned</button>
                  ) : "—"}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group">
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={18} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
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
