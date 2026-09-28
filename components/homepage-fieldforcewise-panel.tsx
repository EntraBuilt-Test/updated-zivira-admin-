"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/Options/HomePage_FieldForcewise.aspx
// ("Home Page - FieldForcewise") exactly: a "Filter By Manager" dropdown +
// Go — the field force table for that manager only appears once a manager
// is picked and Go is clicked (per the user's instruction: "if i click the
// dropdown names then the table must be come"). Each row's own file upload
// is wired to the real, shared upload endpoint (which now stores the file
// itself), and Remove Image performs a real, persisted hard delete of that
// row via the same masters DELETE route the other hard-deletable screens use.
const MASTER_KEY = "homepageImageFieldForcewise";
const MANAGER_ROLES = new Set(["NBH", "BH", "RBM", "ZBM", "ABM"]);

export function HomepageFieldForcewisePanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managerName, setManagerName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [goBusy, setGoBusy] = useState(false);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  const managers = employees.filter((e: any) => MANAGER_ROLES.has(e.role));
  const managerLabel = (e: any) => `${e.name} - ${e.role} - ${e.territory || ""}`;
  const selectedManager = managers.find((m: any) => managerLabel(m) === managerName);
  const team = selectedManager
    ? employees.filter((e: any) => e.reportingManager === (selectedManager as any).employeeCode || e.reportingManager === selectedManager.name)
    : [];

  async function refreshUploads() {
    const res = await apiClient.masterRecords(MASTER_KEY);
    setRows(res.data);
  }

  // The Go button previously had no error handling at all: if
  // apiClient.masterRecords() ever rejected (a network hiccup, an expired
  // session, …) the whole handler threw, setShowTable(true) never ran, and
  // clicking Go looked like it silently did nothing. It now always ends in
  // a visible outcome — the table, or a real error message — and shows a
  // busy state while the request is in flight so a slow response doesn't
  // look like a dead button either.
  async function go() {
    if (!managerName || goBusy) return;
    setGoBusy(true);
    setErr(null);
    try {
      await refreshUploads();
      setShowTable(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load field force uploads");
      setShowTable(false);
    } finally {
      setGoBusy(false);
    }
  }

  function fileFor(name: string) {
    return rows.filter((r: any) => r.fieldForceName === name).slice(-1)[0];
  }

  async function upload(emp: any) {
    const file = pendingFiles[emp.id];
    if (!file) return;
    setBusyId(emp.id);
    setErr(null);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, { fieldForceName: emp.name });
      setPendingFiles((prev) => ({ ...prev, [emp.id]: null }));
      await refreshUploads();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(recordId: string) {
    setBusyId(recordId);
    setErr(null);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, recordId);
      await refreshUploads();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options &gt; Image Upload</p>
          <h2>Home Page - FieldForcewise</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        <div className="field" style={{ minWidth: 260 }}>
          <label>Filter By Manager</label>
          <CustomSelect
            value={managerName}
            options={["---Select---", ...managers.map(managerLabel)]}
            onChange={(v) => { setManagerName(v === "---Select---" ? "" : v); setShowTable(false); }}
          />
        </div>
        <button className="button" type="button" onClick={go} disabled={!managerName || goBusy}>{goBusy ? "..." : "Go"}</button>
      </div>

      {err && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>{err}</div>}

      {showTable && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">FieldForce Name</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">HQ</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">FilePath</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Uploaded File</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">FileName</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {team.map((emp: any, idx) => {
                const existing = fileFor(emp.name);
                return (
                  <tr key={emp.id}>
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{emp.name}</td>
                    <td className="px-4 py-2 text-sm">{emp.territory || "-"}</td>
                    <td className="px-4 py-2 text-sm">
                      <input type="file" accept="image/*" onChange={(e) => setPendingFiles((prev) => ({ ...prev, [emp.id]: e.target.files?.[0] ?? null }))} />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <button className="button button-secondary" type="button" disabled={busyId === emp.id || !pendingFiles[emp.id]} onClick={() => upload(emp)}>
                        {busyId === emp.id ? "..." : "Upload"}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-sm">{existing?.fileName || "-"}</td>
                    <td className="px-4 py-2 text-sm">
                      {existing ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); remove(existing.id); }} style={{ color: "#ef4444", textDecoration: "underline", cursor: "pointer" }}>
                          Remove Image
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                );
              })}
              {team.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>No field force found under this manager</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
