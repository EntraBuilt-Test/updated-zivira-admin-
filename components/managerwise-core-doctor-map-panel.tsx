"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "managerwiseCoreDoctorMap";
const SELECT_CLEAR = "---Select Clear---";
const ADMIN_OPTION = "admin";

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`;
}

type DoctorRow = {
  doctorCode: string;
  doctorName: string;
  speciality: string;
  category: string;
  territory: string;
  isCore: boolean;
  existing?: MasterRecord;
};

// Matches sanpharma.info's Basic Setup >> Managerwise - Core Doctor Map
// screen (Mgrwise_Core_Doc_Map.aspx) exactly: a top bar with Save/Clear on
// the left and a "Core Doctor Map" label, then a "Manager :" dropdown
// (format "NAME - DESIGNATION - LOCATION", plus "admin" and a
// "---Select Clear---" default) and an "MR :" dropdown + Go button on the
// right. Picking a Manager auto-populates the MR dropdown from that
// manager's direct reports (employees.reportingManager). Go loads that
// MR's doctor list (from the Doctor - Mapping master's
// medicalRepresentative field) into a table — S.No / Doctor / Specialty /
// Category / Territory / a dynamic last column named after the selected
// MR — with one core-doctor checkbox per row, sourced from/saved to the
// managerwiseCoreDoctorMap master (keyed by mrName + doctorCode). Save
// shows a centered success confirmation, matching sanpharma's own
// (inherently centered) native alert() behavior.
export function ManagerwiseCoreDoctorMapPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[] | null>(null);
  const [managerName, setManagerName] = useState("");
  const [mrName, setMrName] = useState("");
  const [rows, setRows] = useState<DoctorRow[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Prefetch employees as soon as the panel mounts so the Manager dropdown
  // is already populated the first time it's opened, instead of only
  // fetching (and feeling slow) on the first pick.
  useEffect(() => {
    let cancelled = false;
    setLoadingEmployees(true);
    apiClient
      .masterRecords("employees")
      .then((res) => {
        if (!cancelled) setEmployees(res.data);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingEmployees(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function ensureEmployees(): Promise<MasterRecord[]> {
    if (employees) return employees;
    setLoadingEmployees(true);
    try {
      const res = await apiClient.masterRecords("employees");
      setEmployees(res.data);
      return res.data;
    } finally {
      setLoadingEmployees(false);
    }
  }

  const managerOptions = useMemo(() => {
    const list = employees ?? [];
    const labels = [...list].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel);
    return [SELECT_CLEAR, ADMIN_OPTION, ...labels];
  }, [employees]);

  const managerRecord = useMemo(
    () => (employees ?? []).find((e) => employeeLabel(e) === managerName),
    [employees, managerName]
  );

  const mrOptions = useMemo(() => {
    const list = employees ?? [];
    if (!managerName || managerName === SELECT_CLEAR) return [];
    if (managerName === ADMIN_OPTION) {
      return [...list].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel);
    }
    // employees.reportingManager stores the manager's employeeCode (e.g.
    // "ABM-001"), not their name -- join on employeeCode, not name.
    const managerCode = managerRecord ? String(managerRecord.employeeCode ?? "") : "";
    return list
      .filter((e) => managerCode && String(e.reportingManager ?? "") === managerCode)
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map(employeeLabel);
  }, [employees, managerName, managerRecord]);

  const mrRecord = useMemo(() => (employees ?? []).find((e) => employeeLabel(e) === mrName), [employees, mrName]);

  async function onManagerChange(label: string) {
    await ensureEmployees();
    setManagerName(label === SELECT_CLEAR ? "" : label);
    setMrName("");
    setRows([]);
    setSearched(false);
  }

  async function go() {
    if (!mrRecord) return;
    setError(null);
    setSearched(true);
    setLoadingDoctors(true);
    try {
      const mrNm = String(mrRecord.name ?? "");
      const [mappingRes, doctorRes, classificationRes, coreRes] = await Promise.all([
        apiClient.masterRecords("doctorMapping"),
        apiClient.masterRecords("doctorMaster"),
        apiClient.masterRecords("doctorClassification"),
        apiClient.masterRecords(MASTER_KEY)
      ]);

      const doctorByCode = new Map(doctorRes.data.map((d) => [String(d.doctorCode ?? ""), d]));
      const classificationByCode = new Map(classificationRes.data.map((c) => [String(c.doctorCode ?? ""), c]));
      const coreByCode = new Map(
        coreRes.data
          .filter((r) => String(r.mrName ?? "") === mrNm)
          .map((r) => [String(r.doctorCode ?? ""), r])
      );

      const mine = mappingRes.data.filter((m) => String(m.medicalRepresentative ?? "") === mrNm);

      const nextRows: DoctorRow[] = mine.map((m) => {
        const code = String(m.doctorCode ?? "");
        const doc = doctorByCode.get(code);
        const cls = classificationByCode.get(code);
        const existing = coreByCode.get(code);
        return {
          doctorCode: code,
          doctorName: String(doc?.doctorName ?? ""),
          speciality: String(doc?.specialty ?? ""),
          category: String(cls?.doctorCategory ?? ""),
          territory: String(m.hq ?? ""),
          isCore: existing ? yesNo(existing.isCore) : false,
          existing
        };
      });

      setRows(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load doctors for this MR");
      setRows([]);
    } finally {
      setLoadingDoctors(false);
    }
  }

  function toggleCore(doctorCode: string) {
    setRows((prev) => prev.map((r) => (r.doctorCode === doctorCode ? { ...r, isCore: !r.isCore } : r)));
  }

  async function save() {
    if (!mrRecord) return;
    setSaving(true);
    setError(null);
    try {
      const mrNm = String(mrRecord.name ?? "");
      for (const row of rows) {
        const payload: Record<string, unknown> = {
          mrName: mrNm,
          doctorCode: row.doctorCode,
          territory: row.territory,
          isCore: row.isCore ? "Yes" : "No"
        };
        if (row.existing) {
          await apiClient.updateMasterRecord(MASTER_KEY, row.existing.id, payload);
        } else {
          await apiClient.createMasterRecord(MASTER_KEY, payload);
        }
      }
      setSuccessOpen(true);
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Core Doctor Map");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setManagerName("");
    setMrName("");
    setRows([]);
    setSearched(false);
    setError(null);
  }

  const dynamicColumnLabel = mrRecord ? employeeLabel(mrRecord) : "";

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving || rows.length === 0}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "8px 20px",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={clear}
              disabled={saving}
              style={{
                border: "1px solid #94a3b8",
                borderRadius: 6,
                background: "#fff",
                color: "#111827",
                fontWeight: 600,
                padding: "8px 20px",
                cursor: saving ? "default" : "pointer"
              }}
            >
              Clear
            </button>
          </div>
          <h2 className="text-lg font-semibold">Core Doctor Map</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium mb-1">Manager :</label>
            <CustomSelect
              value={managerName || SELECT_CLEAR}
              options={managerOptions}
              onChange={onManagerChange}
              placeholder={SELECT_CLEAR}
            />
          </div>
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium mb-1">MR :</label>
            <CustomSelect
              value={mrName}
              options={mrOptions}
              onChange={(label) => setMrName(label)}
              placeholder={mrOptions.length ? "Select MR" : "Select a Manager first"}
            />
          </div>
          <button
            onClick={go}
            disabled={!mrRecord || loadingDoctors || loadingEmployees}
            style={{
              border: "1px solid #1d4ed8",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              padding: "8px 20px",
              cursor: !mrRecord || loadingDoctors ? "default" : "pointer",
              opacity: !mrRecord || loadingDoctors ? 0.6 : 1
            }}
          >
            {loadingDoctors ? "Loading..." : "Go"}
          </button>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                {["S.No", "Doctor", "Specialty", "Category", "Territory", dynamicColumnLabel].map((h) => (
                  <th
                    key={h}
                    style={{ border: "1px solid #94a3b8", padding: "4px 6px", background: "#e2e8f0", fontWeight: 600, textAlign: "center" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ border: "1px solid #94a3b8", padding: "10px" }} className="text-center text-gray-500">
                    No doctors mapped to this MR.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.doctorCode}>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px" }}>{row.doctorName}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px" }}>{row.speciality}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px" }}>{row.category}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px" }}>{row.territory}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center" }}>
                      <input type="checkbox" checked={row.isCore} onChange={() => toggleCore(row.doctorCode)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {successOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "24px 28px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              maxWidth: 360,
              textAlign: "center"
            }}
          >
            <p className="text-sm mb-4">Core Doctor(s) have been mapped Successfully</p>
            <button
              onClick={() => setSuccessOpen(false)}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "6px 24px",
                cursor: "pointer"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
