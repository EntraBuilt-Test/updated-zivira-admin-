"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/Options/Delayed_Release.aspx
// ("Delayed Release"): Year/Month + FieldForce Name filter, a results table
// (Release All + per-row checkbox, S.No, FieldForce Name, HQ, Designation,
// State, Delayed/Missing Dates) and a Release button. Round 41: backed by
// real DcrLock records (a date locks once it passes the company delay window
// set in Other Setup). Release stamps releasedAt / releasedBy on each lock.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const now = new Date();
const YEARS = Array.from({ length: 6 }, (_, i) => String(now.getFullYear() - 4 + i));

export function DelayedReleasePanel() {
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => {});
  }, []);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const monthKey = `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, "0")}`;

  async function view() {
    const res = await apiClient.delayedReleaseList({ month: monthKey, fieldForceName });
    setRows(res.data);
    setChecked({});
    setSearched(true);
    setNotice(null);
  }

  const releasable = rows.filter((r) => !r.released);
  const allChecked = releasable.length > 0 && releasable.every((r) => checked[r.employeeCode]);
  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    releasable.forEach((r) => { next[r.employeeCode] = v; });
    setChecked(next);
  }

  async function release() {
    const codes = Object.keys(checked).filter((c) => checked[c]);
    if (codes.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiClient.releaseDelayed({ employeeCodes: codes, month: monthKey });
      setNotice(`${codes.length} field force record(s) released.`);
      await view();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Release failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options</p>
          <h2>Delayed Release</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        <div className="field"><label>Year</label><CustomSelect value={year} options={YEARS} onChange={setYear} /></div>
        <div className="field"><label>Month</label><CustomSelect value={month} options={MONTHS} onChange={setMonth} /></div>
        <div className="field" style={{ minWidth: 220 }}>
          <label>FieldForce Name</label>
          <CustomSelect
            value={fieldForceName}
            options={["-- All --", ...employees.map((e: any) => e.name)]}
            onChange={(v) => setFieldForceName(v === "-- All --" ? "" : v)}
            placeholder="-- All --"
          />
        </div>
        <button className="button" type="button" onClick={view}>Go</button>
      </div>

      {notice && <div style={{ marginTop: 12, fontSize: 13, color: notice.includes("failed") || notice.includes("Failed") ? "#ef4444" : "#10b981" }}>{notice}</div>}

      {searched && (
        <>
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>Release All</span>
                      <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                    </div>
                  </th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">FieldForce Name</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">HQ</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Designation</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">State</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Delayed/Missing Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((r, idx) => (
                  <tr key={r.employeeCode}>
                    <td className="px-4 py-2 text-sm">
                      {r.released ? (
                        <span style={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Released</span>
                      ) : (
                        <input type="checkbox" checked={!!checked[r.employeeCode]} onChange={(e) => setChecked((prev) => ({ ...prev, [r.employeeCode]: e.target.checked }))} />
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{r.fieldForceName}</td>
                    <td className="px-4 py-2 text-sm">{r.hq}</td>
                    <td className="px-4 py-2 text-sm">{r.designation}</td>
                    <td className="px-4 py-2 text-sm">{r.state}</td>
                    <td className="px-4 py-2 text-sm">{r.delayedMissingDates}{r.releaseRequested ? <span style={{ marginLeft: 8, color: "#d97706", fontSize: 11, fontWeight: 600 }}>Release requested</span> : null}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>No locked DCR dates for this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {releasable.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button className="button" type="button" disabled={busy || Object.values(checked).every((v) => !v)} onClick={release}>
                {busy ? "Releasing..." : "Release"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
