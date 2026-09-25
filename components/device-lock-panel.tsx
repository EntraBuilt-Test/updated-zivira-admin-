"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "deviceLock";
const SELECT_CLEAR = "---Select Clear---";
const TEAM_OPTIONS = ["Team"] as const;

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`;
}

type Row = {
  name: string;
  hq: string;
  designation: string;
  empCode: string;
  stateName: string;
  androidApp: boolean;
  iosApp: boolean;
  androidDetailing: boolean;
  iosDetailing: boolean;
  existing?: MasterRecord;
};

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "4px 6px" };
const head: React.CSSProperties = { ...cell, background: "#0f2f52", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> Device Lock screen (Device_Lock.aspx)
// exactly: a fixed "Team" selector plus a FieldForce member dropdown (NAME
// - DESIGNATION - HQ) and a Go button, then a bordered results table with
// S.No / FieldForce Name / HQ / Designation / Emp Code / State Name /
// Android App / IOS App / Android Detailing / IOS Detailing (checkboxes),
// and a single Save button. Saving shows a centered confirmation popup.
export function DeviceLockPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [team, setTeam] = useState("Team");
  const [member, setMember] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

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

  const memberOptions = useMemo(() => {
    return [
      SELECT_CLEAR,
      ...[...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel)
    ];
  }, [employees]);

  async function go() {
    setError(null);
    setSearched(true);
    setLoadingRows(true);
    try {
      const recordsRes = await apiClient.masterRecords(MASTER_KEY);

      let matching: MasterRecord[] = employees;
      if (member && member !== SELECT_CLEAR) {
        matching = matching.filter((e) => employeeLabel(e) === member);
      }
      matching = [...matching].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

      const nextRows: Row[] = matching.map((e) => {
        const name = String(e.name ?? "");
        const existing = recordsRes.data.find((r) => String(r.fieldForceName ?? "") === name);
        return {
          name,
          hq: String(e.territory ?? ""),
          designation: String(e.designation ?? ""),
          empCode: String(e.employeeCode ?? ""),
          stateName: String(e.state ?? ""),
          androidApp: existing ? yesNo(existing.androidApp) : false,
          iosApp: existing ? yesNo(existing.iosApp) : false,
          androidDetailing: existing ? yesNo(existing.androidDetailing) : false,
          iosDetailing: existing ? yesNo(existing.iosDetailing) : false,
          existing
        };
      });

      setRows(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load field force members");
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }

  function toggle(name: string, key: "androidApp" | "iosApp" | "androidDetailing" | "iosDetailing") {
    setRows((prev) => prev.map((r) => (r.name === name ? { ...r, [key]: !r[key] } : r)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      for (const row of rows) {
        const payload: Record<string, unknown> = {
          fieldForceName: row.name,
          androidApp: row.androidApp ? "Yes" : "No",
          iosApp: row.iosApp ? "Yes" : "No",
          androidDetailing: row.androidDetailing ? "Yes" : "No",
          iosDetailing: row.iosDetailing ? "Yes" : "No"
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
      setError(err instanceof Error ? err.message : "Failed to save Device Lock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Device Lock</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium mb-1">FieldForce Name</label>
            <CustomSelect value={team} options={[...TEAM_OPTIONS]} onChange={setTeam} placeholder="Team" />
          </div>
          <div className="min-w-[280px]">
            <CustomSelect
              value={member || SELECT_CLEAR}
              options={memberOptions}
              onChange={(v) => setMember(v === SELECT_CLEAR ? "" : v)}
              placeholder={loadingEmployees ? "Loading..." : SELECT_CLEAR}
            />
          </div>
          <button
            onClick={go}
            disabled={loadingRows || loadingEmployees}
            style={{
              border: "1px solid #1d4ed8",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              padding: "8px 20px",
              cursor: loadingRows ? "default" : "pointer",
              opacity: loadingRows ? 0.7 : 1
            }}
          >
            {loadingRows ? "Loading..." : "Go"}
          </button>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                {["S.No", "FieldForce Name", "HQ", "Designation", "Emp Code", "State Name", "Andorid App", "IOS App", "Andorid Detailing", "IOS Detailing"].map(
                  (h) => (
                    <th key={h} style={head}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ ...cell, textAlign: "center" }} className="text-gray-500 py-4">
                    No field force members found.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.name}>
                    <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                    <td style={cell}>{row.name}</td>
                    <td style={cell}>{row.hq}</td>
                    <td style={cell}>{row.designation}</td>
                    <td style={cell}>{row.empCode}</td>
                    <td style={cell}>{row.stateName}</td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.androidApp} onChange={() => toggle(row.name, "androidApp")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.iosApp} onChange={() => toggle(row.name, "iosApp")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.androidDetailing} onChange={() => toggle(row.name, "androidDetailing")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.iosDetailing} onChange={() => toggle(row.name, "iosDetailing")} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex gap-3 mt-4">
            <button
              onClick={save}
              disabled={saving || rows.length === 0}
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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
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
            <p className="text-sm mb-4">Device Lock settings saved successfully</p>
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
