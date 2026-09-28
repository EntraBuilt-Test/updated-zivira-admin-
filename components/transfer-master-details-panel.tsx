"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/Options/MR_MR_Transfer.aspx
// ("Transfer Master Details") exactly: Listed Doctor / Chemist radio,
// Transfer From/To field force + territory pickers, a left table of the
// source field force's real records in that territory (with checkboxes)
// and a right table of what the destination already has. "Transfer" is a
// REAL, persisted mutation — it updates the underlying DoctorModel/
// DealerModel documents via POST /masters/transferMasterDetails/action/
// transfer, so a checked-and-transferred row moves for good, survives a
// refresh, and both tables update live with no full page reload.
type EntityType = "Listed Doctor" | "Chemist";

function empLabel(e: any) {
  return `${e.name} - ${e.role} - ${e.territory || ""}`;
}

export function TransferMasterDetailsPanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entityType, setEntityType] = useState<EntityType>("Listed Doctor");

  const [fromEmp, setFromEmp] = useState("");
  const [fromTerritory, setFromTerritory] = useState("");
  const [fromTerritories, setFromTerritories] = useState<string[]>([]);
  const [fromRows, setFromRows] = useState<any[]>([]);

  const [toEmp, setToEmp] = useState("");
  const [toTerritory, setToTerritory] = useState("");
  const [toTerritories, setToTerritories] = useState<string[]>([]);
  const [toRows, setToRows] = useState<any[]>([]);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  function findEmp(label: string) {
    return employees.find((e: any) => empLabel(e) === label) as any;
  }

  useEffect(() => {
    setFromTerritory("");
    setFromRows([]);
    const emp = findEmp(fromEmp);
    if (!emp) { setFromTerritories([]); return; }
    apiClient.transferTerritories(entityType, emp.employeeCode).then((r) => setFromTerritories(r.data)).catch(() => setFromTerritories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromEmp, entityType]);

  useEffect(() => {
    setToTerritory("");
    setToRows([]);
    const emp = findEmp(toEmp);
    if (!emp) { setToTerritories([]); return; }
    apiClient.transferTerritories(entityType, emp.employeeCode).then((r) => setToTerritories(r.data)).catch(() => setToTerritories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toEmp, entityType]);

  async function loadFrom() {
    const emp = findEmp(fromEmp);
    if (!emp || !fromTerritory) { setFromRows([]); return; }
    const res = await apiClient.transferCandidates(entityType, emp.employeeCode, fromTerritory);
    setFromRows(res.data);
    setChecked({});
  }

  async function loadTo() {
    const emp = findEmp(toEmp);
    if (!emp || !toTerritory) { setToRows([]); return; }
    const res = await apiClient.transferCandidates(entityType, emp.employeeCode, toTerritory);
    setToRows(res.data);
  }

  useEffect(() => { loadFrom(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [fromTerritory]);
  useEffect(() => { loadTo(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [toTerritory]);

  const readyToTransfer = fromEmp && fromTerritory && toEmp && toTerritory;
  const checkedIds = Object.keys(checked).filter((id) => checked[id]);

  async function doTransfer() {
    const fromE = findEmp(fromEmp);
    const toE = findEmp(toEmp);
    if (!fromE || !toE || checkedIds.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiClient.transferMasterRecords({
        entityType,
        ids: checkedIds,
        fromEmployeeName: fromE.name,
        fromTerritory,
        toEmployeeCode: toE.employeeCode,
        toEmployeeName: toE.name,
        toTerritory
      });
      setNotice(`${checkedIds.length} record(s) transferred.`);
      await loadFrom();
      await loadTo();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setFromEmp(""); setFromTerritory(""); setFromRows([]);
    setToEmp(""); setToTerritory(""); setToRows([]);
    setChecked({}); setNotice(null);
  }

  return (
    <section className="subdivision-console" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 980 }}>
        <div className="subdivision-head" style={{ textAlign: "center", justifyContent: "center" }}>
          <div>
            <p className="subdivision-eyebrow">Options</p>
            <h2>Transfer Master Details</h2>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24 }}>
            {(["Listed Doctor", "Chemist"] as EntityType[]).map((t) => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="radio" name="entityType" checked={entityType === t} onChange={() => { setEntityType(t); clearAll(); }} />
                {t}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" type="button" disabled={checkedIds.length === 0 || busy} onClick={doTransfer}>
              {busy ? "Transferring..." : "Transfer"}
            </button>
            <button className="button button-secondary" type="button" onClick={clearAll}>Clear All</button>
          </div>
        </div>

        {notice && <div style={{ marginBottom: 12, fontSize: 13, textAlign: "center", color: notice.includes("failed") || notice.includes("Failed") ? "#ef4444" : "#10b981" }}>{notice}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          <div>
            <div className="field"><label>Transfer From</label>
              <CustomSelect value={fromEmp} options={["---Select---", ...employees.map(empLabel)]} onChange={(v) => setFromEmp(v === "---Select---" ? "" : v)} />
            </div>
            <div className="field" style={{ marginTop: 8 }}><label>Transfer From Territory</label>
              <CustomSelect value={fromTerritory} options={["---Select---", ...fromTerritories]} onChange={(v) => setFromTerritory(v === "---Select---" ? "" : v)} />
            </div>
          </div>
          <div>
            <div className="field"><label>Transfer To</label>
              <CustomSelect value={toEmp} options={["---Select---", ...employees.map(empLabel)]} onChange={(v) => setToEmp(v === "---Select---" ? "" : v)} />
            </div>
            <div className="field" style={{ marginTop: 8 }}><label>Transfer To Territory</label>
              <CustomSelect value={toTerritory} options={["---Select---", ...toTerritories]} onChange={(v) => setToTerritory(v === "---Select---" ? "" : v)} />
            </div>
          </div>
        </div>

        {!readyToTransfer && (
          <p style={{ color: "#ef4444", marginTop: 24, fontWeight: 500, textAlign: "center" }}>
            {!fromEmp ? "Please Select the Transfer From" : !fromTerritory ? "Please Select the Transfer From Territory" : !toEmp ? "Please Select the Transfer To" : "Please Select the Transfer To Territory"}
          </p>
        )}

        {readyToTransfer && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase">S.No</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase">{entityType === "Chemist" ? "Chemists Name" : "Listed Doctor Name"}</th>
                    {entityType === "Chemist" ? (
                      <th className="px-3 py-2 text-xs font-semibold uppercase">Contact Person</th>
                    ) : (
                      <>
                        <th className="px-3 py-2 text-xs font-semibold uppercase">Category</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase">Speciality</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-xs font-semibold uppercase">Territory</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase">Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {fromRows.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 text-sm">{idx + 1}</td>
                      <td className="px-3 py-2 text-sm">{r.name}</td>
                      {entityType === "Chemist" ? (
                        <td className="px-3 py-2 text-sm">{r.contactPerson || "-"}</td>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-sm">{r.category}</td>
                          <td className="px-3 py-2 text-sm">{r.speciality}</td>
                        </>
                      )}
                      <td className="px-3 py-2 text-sm">{r.territory}</td>
                      <td className="px-3 py-2 text-sm">
                        <input type="checkbox" checked={!!checked[r.id]} onChange={(e) => setChecked((prev) => ({ ...prev, [r.id]: e.target.checked }))} />
                      </td>
                    </tr>
                  ))}
                  {fromRows.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-sm" style={{ color: "var(--muted)" }}>No records</td></tr>}
                </tbody>
              </table>
            </div>

            <div>
              {entityType === "Listed Doctor" && <p style={{ fontWeight: 600, marginBottom: 8 }}>Total Listed Doctor Count: {toRows.length}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-subtle">
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold uppercase">S.No</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase">{entityType === "Chemist" ? "Chemists Name" : "Listed Doctor Name"}</th>
                      {entityType === "Chemist" ? (
                        <th className="px-3 py-2 text-xs font-semibold uppercase">Contact Person</th>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-xs font-semibold uppercase">Category</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase">Speciality</th>
                        </>
                      )}
                      <th className="px-3 py-2 text-xs font-semibold uppercase">Territory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {toRows.map((r, idx) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2 text-sm">{idx + 1}</td>
                        <td className="px-3 py-2 text-sm">{r.name}</td>
                        {entityType === "Chemist" ? (
                          <td className="px-3 py-2 text-sm">{r.contactPerson || "-"}</td>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-sm">{r.category}</td>
                            <td className="px-3 py-2 text-sm">{r.speciality}</td>
                          </>
                        )}
                        <td className="px-3 py-2 text-sm">{r.territory}</td>
                      </tr>
                    ))}
                    {toRows.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-sm" style={{ color: "var(--muted)" }}>No records</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
