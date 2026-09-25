"use client";

import { Fragment, useEffect, useMemo, useState, type CSSProperties } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "screenAccessSetup";
const SELECT_CLEAR = "---Select Clear---";
const ADMIN_OPTION = "admin";

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`;
}
const ENTITY_TYPES = ["Listed Doctor", "UnListed Doctor", "Chemist", "Territory", "Hospital"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];
const PERMISSION_KEYS = ["add", "edit", "deactivate", "view", "reactivate"] as const;
type PermissionKey = (typeof PERMISSION_KEYS)[number];

// sanpharma.info's registry uses "delete" as the deactivate-permission
// field key (mirrors every other master's deactivate flag), so map the
// UI's "Deact." column to the stored "delete" field.
const PERMISSION_FIELD: Record<PermissionKey, string> = {
  add: "add",
  edit: "edit",
  deactivate: "delete",
  view: "view",
  reactivate: "reactivate"
};

const PERMISSION_LABEL: Record<PermissionKey, string> = {
  add: "Add",
  edit: "Edit",
  deactivate: "Deact.",
  view: "View",
  reactivate: "React."
};

type Grid = Record<EntityType, Record<PermissionKey, boolean> & { nameChg?: boolean }>;

function emptyGrid(): Grid {
  const g = {} as Grid;
  for (const et of ENTITY_TYPES) {
    g[et] = { add: false, edit: false, deactivate: false, view: false, reactivate: false, nameChg: false };
  }
  return g;
}

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

type Row = {
  name: string;
  designation: string;
  hq: string;
  grid: Grid;
  existing: MasterRecord[];
};

const cellBorder: CSSProperties = { border: "1px solid #94a3b8", padding: "4px 6px" };
const headBorder: CSSProperties = { ...cellBorder, background: "#e2e8f0", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Basic Setup >> Setup For Screen Access screen
// (SetupScreen.aspx) exactly: a "FieldForce Name" text filter + Go button
// (no separate Add flow), and — unlike a single-employee summary — ONE
// bordered table listing every matching field force member as its own row:
// Field Force Name / Designation / HQ as the first three columns, followed
// by five grouped column-header spans (Listed Doctor / UnListed Doctor /
// Chemist / Territory / Hospital), each containing its own Add / Edit /
// Deact. / View / React. sub-columns. "NameChg." appears exactly once, as
// a sixth sub-column under the Listed Doctor group only. Save upserts one
// screenAccessSetup record per (fieldForceName, entityType) for every row
// on screen at once.
export function ScreenAccessSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [filterName, setFilterName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    apiClient
      .masterRecords("employees")
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () => [SELECT_CLEAR, ADMIN_OPTION, ...[...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel)],
    [employees]
  );

  async function go() {
    setError(null);
    setNotice(null);
    setSearched(true);
    setLoading(true);
    try {
      const [employeesRes, recordsRes] = await Promise.all([
        apiClient.masterRecords("employees"),
        apiClient.masterRecords(MASTER_KEY)
      ]);

      const selectedName =
        filterName && filterName !== SELECT_CLEAR && filterName !== ADMIN_OPTION
          ? employeesRes.data.find((e) => employeeLabel(e) === filterName)?.name
          : undefined;
      const matching = employeesRes.data
        .filter((e) => !selectedName || String(e.name ?? "") === selectedName)
        .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

      const nextRows: Row[] = matching.map((e) => {
        const name = String(e.name ?? "");
        const existing = recordsRes.data.filter((r) => String(r.fieldForceName ?? "") === name);
        const grid = emptyGrid();
        for (const r of existing) {
          const et = String(r.entityType ?? "") as EntityType;
          if (!ENTITY_TYPES.includes(et)) continue;
          for (const pk of PERMISSION_KEYS) grid[et][pk] = yesNo(r[PERMISSION_FIELD[pk]]);
          if (et === "Listed Doctor") grid[et].nameChg = yesNo(r.nameChg);
        }
        return {
          name,
          designation: String(e.designation ?? ""),
          hq: String(e.territory ?? ""),
          grid,
          existing
        };
      });

      setRows(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function toggle(rowName: string, et: EntityType, pk: PermissionKey) {
    setRows((prev) =>
      prev.map((r) =>
        r.name === rowName ? { ...r, grid: { ...r.grid, [et]: { ...r.grid[et], [pk]: !r.grid[et][pk] } } } : r
      )
    );
  }

  function toggleNameChg(rowName: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.name === rowName
          ? { ...r, grid: { ...r.grid, "Listed Doctor": { ...r.grid["Listed Doctor"], nameChg: !r.grid["Listed Doctor"].nameChg } } }
          : r
      )
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      for (const row of rows) {
        for (const et of ENTITY_TYPES) {
          const existing = row.existing.find((r) => String(r.entityType ?? "") === et);
          const payload: Record<string, unknown> = {
            fieldForceName: row.name,
            entityType: et,
            add: row.grid[et].add ? "Yes" : "No",
            edit: row.grid[et].edit ? "Yes" : "No",
            delete: row.grid[et].deactivate ? "Yes" : "No",
            view: row.grid[et].view ? "Yes" : "No",
            reactivate: row.grid[et].reactivate ? "Yes" : "No"
          };
          if (et === "Listed Doctor") payload.nameChg = row.grid[et].nameChg ? "Yes" : "No";

          if (existing) {
            await apiClient.updateMasterRecord(MASTER_KEY, existing.id, payload);
          } else {
            await apiClient.createMasterRecord(MASTER_KEY, payload);
          }
        }
      }
      setNotice("Screen access permissions saved successfully.");
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setRows((prev) => prev.map((r) => ({ ...r, grid: emptyGrid() })));
  }

  const colCount = useMemo(() => 3 + ENTITY_TYPES.length * (PERMISSION_KEYS.length + 1) - 4, []);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Setup For Screen Access</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium mb-1">FieldForce Name</label>
            <CustomSelect
              value={filterName || SELECT_CLEAR}
              options={employeeOptions}
              onChange={(label) => setFilterName(label === SELECT_CLEAR ? "" : label)}
              placeholder={SELECT_CLEAR}
            />
          </div>
          <button
            onClick={go}
            disabled={loading}
            style={{
              border: "1px solid #1d4ed8",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              padding: "8px 20px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Loading..." : "Go"}
          </button>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={headBorder} rowSpan={2}>Field Force Name</th>
                <th style={headBorder} rowSpan={2}>Designation</th>
                <th style={headBorder} rowSpan={2}>HQ</th>
                {ENTITY_TYPES.map((et) => (
                  <th key={et} style={headBorder} colSpan={et === "Listed Doctor" ? PERMISSION_KEYS.length + 1 : PERMISSION_KEYS.length}>
                    {et}
                  </th>
                ))}
              </tr>
              <tr>
                {ENTITY_TYPES.map((et) => (
                  <Fragment key={et}>
                    {PERMISSION_KEYS.map((pk) => (
                      <th key={`${et}-${pk}`} style={headBorder}>{PERMISSION_LABEL[pk]}</th>
                    ))}
                    {et === "Listed Doctor" && <th style={headBorder}>NameChg.</th>}
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td style={cellBorder} colSpan={colCount + 4} className="text-center text-gray-500 py-4">
                    No field force members found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.name}>
                    <td style={cellBorder}>{row.name}</td>
                    <td style={cellBorder}>{row.designation}</td>
                    <td style={cellBorder}>{row.hq}</td>
                    {ENTITY_TYPES.map((et) => (
                      <Fragment key={`${row.name}-${et}`}>
                        {PERMISSION_KEYS.map((pk) => (
                          <td key={`${row.name}-${et}-${pk}`} style={{ ...cellBorder, textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={row.grid[et][pk]}
                              onChange={() => toggle(row.name, et, pk)}
                            />
                          </td>
                        ))}
                        {et === "Listed Doctor" && (
                          <td style={{ ...cellBorder, textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={!!row.grid[et].nameChg}
                              onChange={() => toggleNameChg(row.name)}
                            />
                          </td>
                        )}
                      </Fragment>
                    ))}
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
                padding: "8px 20px",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={clear}
              disabled={saving || rows.length === 0}
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
        </div>
      )}
    </div>
  );
}
