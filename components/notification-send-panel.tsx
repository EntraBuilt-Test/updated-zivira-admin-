"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { CustomDatePicker } from "@/components/custom-date-picker";

const SELECT_CLEAR = "--Select--";
const SELECT_CLEAR_TEAM = "---Select Clear---";
const FILTER_BY_OPTIONS = ["Designtion Wise", "State", "Sub DivisionWise", "FieldForce (Team Wise)"] as const;
type FilterBy = (typeof FILTER_BY_OPTIONS)[number];

type EmpRow = { name: string; designation: string; hq: string; state: string; division: string };

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#7a7aa8", color: "#fff", fontWeight: 600 };

/**
 * Real "Notification Message" screen, rebuilt to match sanpharma.info's
 * Notfication_Msg.aspx exactly: Filter By dropdown (Designtion Wise /
 * State / Sub DivisionWise / FieldForce (Team Wise)) + a second dropdown
 * whose options depend on the filter type, a GO button, Preview/Delete
 * links, a checkbox-selectable results table (FieldForce Name /
 * Designation / HQ / State / Sub Div), the message textarea, Effective
 * From/To dates and Submit -- which calls the real
 * POST /company/masters/notificationMessage/action/send, resolving
 * against EmployeeModel and writing a real Notice document via
 * notifyFieldRep/notifyManager.
 */
export function NotificationSendPanel({ masterKey }: { masterKey: string }) {
  const [sentRows, setSentRows] = useState<MasterRecord[]>([]);
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [filterBy, setFilterBy] = useState<FilterBy>("FieldForce (Team Wise)");
  const [filterValue, setFilterValue] = useState("");
  const [results, setResults] = useState<EmpRow[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(today());
  const [effectiveTo, setEffectiveTo] = useState(today());
  const [saving, setSaving] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    const [notifRes, empRes] = await Promise.all([apiClient.masterRecords(masterKey), apiClient.masterRecords("employees")]);
    setSentRows(notifRes.data);
    setEmployees(empRes.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  const valueOptions = useMemo(() => {
    if (filterBy === "Designtion Wise") {
      return [...new Set(employees.map((e) => String(e.designation ?? "")).filter(Boolean))].sort();
    }
    if (filterBy === "State") {
      return [...new Set(employees.map((e) => String(e.state ?? "")).filter(Boolean))].sort();
    }
    if (filterBy === "Sub DivisionWise") {
      return [...new Set(employees.map((e) => String(e.division ?? "")).filter(Boolean))].sort();
    }
    return [...employees]
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map((e) => `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`);
  }, [employees, filterBy]);

  function go() {
    setError(null);
    setSuccess(null);
    setSearched(true);

    let matching = employees;
    if (filterBy === "Designtion Wise" && filterValue) matching = matching.filter((e) => String(e.designation ?? "") === filterValue);
    else if (filterBy === "State" && filterValue) matching = matching.filter((e) => String(e.state ?? "") === filterValue);
    else if (filterBy === "Sub DivisionWise" && filterValue) matching = matching.filter((e) => String(e.division ?? "") === filterValue);
    // "FieldForce (Team Wise)" shows every employee (matching sanpharma's
    // own behavior) and pre-checks whichever one was picked in the dropdown.

    const sorted = [...matching].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
    const rows: EmpRow[] = sorted.map((e) => ({
      name: String(e.name ?? ""),
      designation: String(e.designation ?? ""),
      hq: String(e.territory ?? ""),
      state: String(e.state ?? ""),
      division: String(e.division ?? "")
    }));
    setResults(rows);
    const nextChecked: Record<string, boolean> = {};
    if (filterBy === "FieldForce (Team Wise)" && filterValue) {
      const name = filterValue.split(" - ")[0];
      for (const r of rows) nextChecked[r.name] = r.name === name;
    } else {
      for (const r of rows) nextChecked[r.name] = false;
    }
    setChecked(nextChecked);
  }

  function toggleAll(value: boolean) {
    const next: Record<string, boolean> = {};
    for (const r of results) next[r.name] = value;
    setChecked(next);
  }

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!message.trim()) {
      setError("Enter a Notification Message");
      return;
    }
    setSaving(true);
    try {
      const selectedNames = results.filter((r) => checked[r.name]).map((r) => r.name);
      const res = await apiClient.sendNotificationMessage({
        filterBy,
        filterValue,
        filterValues: selectedNames.length > 0 ? selectedNames : undefined,
        message,
        effectiveFrom,
        effectiveTo
      });
      setSuccess(`Sent to ${res.data.notified} of ${res.data.matched} matched employee${res.data.matched === 1 ? "" : "s"}.`);
      setMessage("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLastSent() {
    if (sentRows.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const last = sentRows[sentRows.length - 1];
      await apiClient.deleteMasterRecord(masterKey, last.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 text-center">
        <h2 className="text-lg font-semibold mb-4">Notification Message</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {success && <div className="text-sm text-green-700 mb-3">{success}</div>}

        <div className="flex items-center justify-center flex-wrap gap-3">
          <label className="text-sm font-medium">Filter By</label>
          <CustomSelect
            value={filterBy}
            options={[...FILTER_BY_OPTIONS]}
            onChange={(v) => {
              setFilterBy(v as FilterBy);
              setFilterValue("");
              setSearched(false);
            }}
          />
          <CustomSelect
            value={filterValue || SELECT_CLEAR_TEAM}
            options={[SELECT_CLEAR_TEAM, ...valueOptions]}
            onChange={(v) => setFilterValue(v === SELECT_CLEAR_TEAM ? "" : v)}
          />
          <button
            onClick={go}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "6px 18px" }}
          >
            GO
          </button>
          <button onClick={() => setSuccess("Preview: " + (message || "(no message yet)"))} style={{ color: "#15803d", fontWeight: 600 }}>
            Preview
          </button>
          <button onClick={deleteLastSent} style={{ color: "#dc2626", fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </div>

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>
                  <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} />
                </th>
                <th style={head}>FieldForce Name</th>
                <th style={head}>Designation</th>
                <th style={head}>HQ</th>
                <th style={head}>State</th>
                <th style={head}>Sub Div</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...cell, textAlign: "center" }} className="text-gray-500 py-4">
                    No field force members found.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.name}>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={!!checked[row.name]} onChange={(e) => setChecked((prev) => ({ ...prev, [row.name]: e.target.checked }))} />
                    </td>
                    <td style={cell}>{row.name}</td>
                    <td style={cell}>{row.designation}</td>
                    <td style={cell}>{row.hq}</td>
                    <td style={cell}>{row.state}</td>
                    <td style={cell}>{row.division}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-5 mx-auto" style={{ maxWidth: 640 }}>
            <p className="text-left text-sm font-medium mb-1">Notification Message :</p>
            <textarea
              className="input"
              style={{ width: "100%", minHeight: 110, border: "1px solid #94a3b8", borderRadius: 4, padding: 8 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2">
                <label className="text-sm">Effective From</label>
                <CustomDatePicker value={effectiveFrom} onChange={setEffectiveFrom} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Effective To</label>
                <CustomDatePicker value={effectiveTo} onChange={setEffectiveTo} />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={submit}
                disabled={saving}
                style={{
                  border: "1px solid #1d4ed8",
                  borderRadius: 6,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "8px 24px",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
