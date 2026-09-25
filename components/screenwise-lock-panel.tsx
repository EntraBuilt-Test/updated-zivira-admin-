"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "screenwiseLock";
const SELECT_CLEAR = "---Select Clear---";
const ADMIN_OPTION = "admin";

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`;
}

type Row = {
  name: string;
  designation: string;
  hq: string;
  dcrLock: boolean;
  tpLock: boolean;
  sdpLock: boolean;
  campaignLock: boolean;
  doctorMapLock: boolean;
  unlstCnt: string;
  existing?: MasterRecord;
};

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "4px 6px" };
const head: React.CSSProperties = { ...cell, background: "#e2e8f0", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Basic Setup >> Screenwise Lock screen
// (Screwise_Lock.aspx) exactly: a "FieldForce Name" label with a "Team"
// dropdown (grouped by HQ/territory) and a second dropdown for the
// specific field force member within that team, plus a "Go" button — no
// "Add" flow. Go loads a bordered table of every field force member in the
// selected team (or just the one picked in the second dropdown) with
// columns S.No / FieldForce / Designation / HQ / DCR Lock / TP Lock / SDP
// Lock / Campaign Lock / Doctor Map Lock (checkboxes) / Unlst Cnt (a
// numeric text field) — no Log Lock or IUP Lock columns. A single bottom
// "Save" button upserts one screenwiseLock record per row.
export function ScreenwiseLockPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [team, setTeam] = useState("");
  const [member, setMember] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

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

  const teamOptions = useMemo(() => {
    const hqs = Array.from(new Set(employees.map((e) => String(e.territory ?? "")).filter(Boolean))).sort();
    return [SELECT_CLEAR, ADMIN_OPTION, ...hqs];
  }, [employees]);

  const memberOptions = useMemo(() => {
    if (!team || team === SELECT_CLEAR) return [];
    const list =
      team === ADMIN_OPTION
        ? employees
        : employees.filter((e) => String(e.territory ?? "") === team);
    return [SELECT_CLEAR, ...list.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel)];
  }, [employees, team]);

  function onTeamChange(v: string) {
    setTeam(v === SELECT_CLEAR ? "" : v);
    setMember("");
    setRows([]);
    setSearched(false);
  }

  async function go() {
    setError(null);
    setNotice(null);
    setSearched(true);
    setLoadingRows(true);
    try {
      const recordsRes = await apiClient.masterRecords(MASTER_KEY);

      let matching: MasterRecord[];
      if (!team || team === ADMIN_OPTION) {
        matching = employees;
      } else {
        matching = employees.filter((e) => String(e.territory ?? "") === team);
      }
      if (member && member !== SELECT_CLEAR) {
        matching = matching.filter((e) => employeeLabel(e) === member);
      }
      matching = [...matching].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

      const nextRows: Row[] = matching.map((e) => {
        const name = String(e.name ?? "");
        const existing = recordsRes.data.find((r) => String(r.fieldForceName ?? "") === name);
        return {
          name,
          designation: String(e.designation ?? ""),
          hq: String(e.territory ?? ""),
          dcrLock: existing ? yesNo(existing.dcrLock) : false,
          tpLock: existing ? yesNo(existing.tpLock) : false,
          sdpLock: existing ? yesNo(existing.sdpLock) : false,
          campaignLock: existing ? yesNo(existing.campaignLock) : false,
          doctorMapLock: existing ? yesNo(existing.doctorMapLock) : false,
          unlstCnt: existing ? String(existing.unlstCnt ?? "") : "",
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

  function toggle(name: string, key: "dcrLock" | "tpLock" | "sdpLock" | "campaignLock" | "doctorMapLock") {
    setRows((prev) => prev.map((r) => (r.name === name ? { ...r, [key]: !r[key] } : r)));
  }

  function setUnlstCnt(name: string, value: string) {
    setRows((prev) => prev.map((r) => (r.name === name ? { ...r, unlstCnt: value } : r)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      for (const row of rows) {
        const payload: Record<string, unknown> = {
          fieldForceName: row.name,
          dcrLock: row.dcrLock ? "Yes" : "No",
          tpLock: row.tpLock ? "Yes" : "No",
          sdpLock: row.sdpLock ? "Yes" : "No",
          campaignLock: row.campaignLock ? "Yes" : "No",
          doctorMapLock: row.doctorMapLock ? "Yes" : "No",
          unlstCnt: row.unlstCnt
        };
        if (row.existing) {
          await apiClient.updateMasterRecord(MASTER_KEY, row.existing.id, payload);
        } else {
          await apiClient.createMasterRecord(MASTER_KEY, payload);
        }
      }
      setNotice("Screenwise Lock settings saved successfully.");
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Screenwise Lock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Screenwise Lock</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px]">
            <label className="block text-sm font-medium mb-1">FieldForce Name</label>
            <CustomSelect
              value={team || SELECT_CLEAR}
              options={teamOptions}
              onChange={onTeamChange}
              placeholder={loadingEmployees ? "Loading..." : SELECT_CLEAR}
            />
          </div>
          <div className="min-w-[280px]">
            <CustomSelect
              value={member || SELECT_CLEAR}
              options={memberOptions}
              onChange={(v) => setMember(v === SELECT_CLEAR ? "" : v)}
              placeholder={memberOptions.length ? SELECT_CLEAR : "Select a Team first"}
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
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                {["S.No", "FieldForce", "Designation", "HQ", "DCR Lock", "TP Lock", "SDP Lock", "Campaign Lock", "Doctor Map Lock", "Unlst Cnt"].map((h) => (
                  <th key={h} style={head}>
                    {h}
                  </th>
                ))}
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
                    <td style={cell}>{row.designation}</td>
                    <td style={cell}>{row.hq}</td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.dcrLock} onChange={() => toggle(row.name, "dcrLock")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.tpLock} onChange={() => toggle(row.name, "tpLock")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.sdpLock} onChange={() => toggle(row.name, "sdpLock")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.campaignLock} onChange={() => toggle(row.name, "campaignLock")} />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.doctorMapLock} onChange={() => toggle(row.name, "doctorMapLock")} />
                    </td>
                    <td style={cell}>
                      <input
                        style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: 70 }}
                        value={row.unlstCnt}
                        onChange={(e) => setUnlstCnt(row.name, e.target.value)}
                      />
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
    </div>
  );
}
