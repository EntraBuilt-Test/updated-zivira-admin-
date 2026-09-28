"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/MGR/Convert_Unlistto_Listeddr.aspx
// ("Unlisted Drs Convert To Listed Drs") exactly: a Field Force Name
// dropdown + Go reveals the table (per the user's instruction: "if i choose
// the names in the dropdown ... the table must appear"); checking rows (or
// Select All) and clicking "Convert to Listed Doctor" performs a REAL,
// persisted conversion — each checked UnlistedDoctor becomes a real
// DoctorModel document (see POST /masters/unlistedToListedDrConversion/
// action/convert), and drops off this list for good.
export function UnlistedToListedConversionPanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [goBusy, setGoBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  // Previously had no error handling: a failed request just threw, never
  // reached setShowTable(true), and clicking Go looked completely dead.
  async function go() {
    if (!fieldForceName || goBusy) return;
    setGoBusy(true);
    setNotice(null);
    try {
      const res = await apiClient.unlistedConversionCandidates(fieldForceName);
      setRows(res.data);
      setChecked({});
      setShowTable(true);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not load unlisted doctors for this field force");
      setShowTable(false);
    } finally {
      setGoBusy(false);
    }
  }

  const allChecked = rows.length > 0 && rows.every((r) => checked[r.id]);
  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    rows.forEach((r) => { next[r.id] = v; });
    setChecked(next);
  }

  async function convert() {
    const ids = Object.keys(checked).filter((id) => checked[id]);
    if (ids.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiClient.convertUnlistedDoctors(ids);
      setNotice(`${res.data.converted} doctor(s) converted to Listed Doctor.`);
      await go();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options &gt; Transfers</p>
          <h2>Unlisted Drs Convert To Listed Drs</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
        <div className="field" style={{ minWidth: 260 }}>
          <label>Field Force Name</label>
          <CustomSelect
            value={fieldForceName}
            options={["---Select---", ...employees.map((e: any) => e.name)]}
            onChange={(v) => { setFieldForceName(v === "---Select---" ? "" : v); setShowTable(false); }}
          />
        </div>
        <button className="button" type="button" onClick={go} disabled={!fieldForceName || goBusy}>{goBusy ? "..." : "Go"}</button>
      </div>

      {notice && <div style={{ marginTop: 12, fontSize: 13, color: notice.includes("failed") || notice.includes("Failed") ? "#ef4444" : "#10b981" }}>{notice}</div>}

      {showTable && (
        <>
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">
                    <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                  </th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">UnListed Doctor Name</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Qualification</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Speciality</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Category</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Class</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase">Territory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-sm"><input type="checkbox" checked={!!checked[r.id]} onChange={(e) => setChecked((prev) => ({ ...prev, [r.id]: e.target.checked }))} /></td>
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{r.name}</td>
                    <td className="px-4 py-2 text-sm">{r.qualification}</td>
                    <td className="px-4 py-2 text-sm">{r.speciality}</td>
                    <td className="px-4 py-2 text-sm">{r.category}</td>
                    <td className="px-4 py-2 text-sm">{r.classField}</td>
                    <td className="px-4 py-2 text-sm">{r.territory}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>No pending unlisted doctors for this field force</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button className="button" type="button" disabled={busy || Object.values(checked).every((v) => !v)} onClick={convert}>
                {busy ? "Converting..." : "Convert to Listed Doctor"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
