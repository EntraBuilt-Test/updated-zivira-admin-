"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MailRecord, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 2027 - 2016 + 1 }, (_, i) => String(2016 + i));
const SEARCH_BY_TO_FOLDER: Record<string, string> = {
  Inbox: "Inbox",
  Viewed: "Viewed Mails",
  Sent: "Sent Mails"
};

// Matches sanpharma.info's "Update/Delete > Mail Delete" screen: Field
// Force Name / Month / Year / Search By (Inbox / Viewed / Sent) dropdowns
// plus a Subject box and a Search button — no Add button. This is backed
// by the REAL internal-mail system (InternalMailModel via GET/DELETE
// /company/mail — the exact same collection the "Mail Box" screen and
// every MR's own mailbox read from), so a Delete here genuinely removes
// the mail, not a generic-masters mirror row.
export function MailDeletePanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [searchBy, setSearchBy] = useState("Inbox");
  const [subject, setSubject] = useState("");
  const [rows, setRows] = useState<MailRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  async function search() {
    setError(null);
    setSearched(true);
    setLoading(true);
    try {
      const emp = employees.find((e) => String(e.name ?? "") === fieldForceName);
      const res = await apiClient.listMail({
        folder: SEARCH_BY_TO_FOLDER[searchBy] ?? undefined,
        month: month ? String(MONTHS.indexOf(month) + 1) : undefined,
        year: year || undefined,
        search: subject.trim() || undefined,
        toEmployeeCode: emp ? String(emp.employeeCode ?? "") : undefined
      });
      setRows(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search mail");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this mail permanently?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await apiClient.deleteMail(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete mail");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Update/Delete</p>
        <h2 className="text-2xl font-bold text-text-primary">Mail Delete</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3 w-full">
        <div style={{ minWidth: "220px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force Name</span>
          <CustomSelect
            value={fieldForceName}
            options={employeeOptions.map((e) => String(e.name ?? ""))}
            onChange={setFieldForceName}
            placeholder="All"
          />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Month</span>
          <CustomSelect value={month} options={MONTHS} onChange={setMonth} placeholder="All Months" />
        </div>
        <div style={{ minWidth: "120px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Year</span>
          <CustomSelect value={year} options={YEARS} onChange={setYear} placeholder="All Years" />
        </div>
        <div style={{ minWidth: "160px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Search By</span>
          <CustomSelect value={searchBy} options={["Inbox", "Viewed", "Sent"]} onChange={setSearchBy} />
        </div>
        <div style={{ minWidth: "220px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Search subject..."
            style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", background: "var(--panel)", color: "var(--ink)" }}
          />
        </div>
        <button className="button" type="button" onClick={search} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {searched && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">From</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">To</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Folder</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Sent</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">No Records Found</td></tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                    <td className="px-4 py-3 text-sm text-text-primary">{row.fromName ?? row.fromEmployeeCode ?? ""}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.toName ?? row.toEmployeeCode ?? ""}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.subject}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.folder}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{row.sentAt ? new Date(row.sentAt).toLocaleDateString() : ""}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="button-secondary" type="button" disabled={deletingId === row.id} onClick={() => handleDelete(row.id)}>
                        {deletingId === row.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
