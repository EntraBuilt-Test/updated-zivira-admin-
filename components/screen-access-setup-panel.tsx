"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "screenAccessSetup";
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

// Matches sanpharma.info's Basic Setup >> Setup For Screen Access screen:
// a single "Field Force Name" dropdown (format "NAME - DESIGNATION - HQ")
// + Go button, no Add button. Selecting a name and clicking Go loads that
// employee's Designation/HQ plus a permissions grid — one row per entity
// type (Listed Doctor / UnListed Doctor / Chemist / Territory / Hospital),
// each with Add / Edit / Deact. / View / React. checkboxes, and a
// Name Change column that only appears on the Listed Doctor row. Save
// upserts one screenAccessSetup record per (fieldForceName, entityType).
export function ScreenAccessSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForceName, setFieldForceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [existingRecords, setExistingRecords] = useState<MasterRecord[]>([]);
  const [grid, setGrid] = useState<Grid>(emptyGrid());

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const employeeOptions = useMemo(
    () =>
      [...employees]
        .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
        .map((e) => ({
          name: String(e.name ?? ""),
          label: `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`
        })),
    [employees]
  );

  const selectedEmployee = useMemo(
    () => employees.find((e) => String(e.name ?? "") === fieldForceName),
    [employees, fieldForceName]
  );

  async function go() {
    if (!fieldForceName) return;
    setError(null);
    setNotice(null);
    setSearched(true);
    setLoading(true);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      const rowsForName = res.data.filter((r) => String(r.fieldForceName ?? "") === fieldForceName);
      setExistingRecords(rowsForName);
      const next = emptyGrid();
      for (const r of rowsForName) {
        const et = String(r.entityType ?? "") as EntityType;
        if (!ENTITY_TYPES.includes(et)) continue;
        for (const pk of PERMISSION_KEYS) {
          next[et][pk] = yesNo(r[PERMISSION_FIELD[pk]]);
        }
        if (et === "Listed Doctor") next[et].nameChg = yesNo(r.nameChg);
      }
      setGrid(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      setExistingRecords([]);
      setGrid(emptyGrid());
    } finally {
      setLoading(false);
    }
  }

  function toggle(et: EntityType, pk: PermissionKey) {
    setGrid((prev) => ({ ...prev, [et]: { ...prev[et], [pk]: !prev[et][pk] } }));
  }

  function toggleNameChg() {
    setGrid((prev) => ({
      ...prev,
      "Listed Doctor": { ...prev["Listed Doctor"], nameChg: !prev["Listed Doctor"].nameChg }
    }));
  }

  async function save() {
    if (!fieldForceName) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      for (const et of ENTITY_TYPES) {
        const existing = existingRecords.find((r) => String(r.entityType ?? "") === et);
        const payload: Record<string, unknown> = {
          fieldForceName,
          entityType: et,
          add: grid[et].add ? "Yes" : "No",
          edit: grid[et].edit ? "Yes" : "No",
          delete: grid[et].deactivate ? "Yes" : "No",
          view: grid[et].view ? "Yes" : "No",
          reactivate: grid[et].reactivate ? "Yes" : "No"
        };
        if (et === "Listed Doctor") payload.nameChg = grid[et].nameChg ? "Yes" : "No";

        if (existing) {
          await apiClient.updateMasterRecord(MASTER_KEY, existing.id, payload);
        } else {
          await apiClient.createMasterRecord(MASTER_KEY, payload);
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
    setGrid(emptyGrid());
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Setup For Screen Access</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium mb-1">Field Force Name</label>
            <CustomSelect
              value={
                fieldForceName
                  ? employeeOptions.find((o) => o.name === fieldForceName)?.label ?? fieldForceName
                  : ""
              }
              options={employeeOptions.map((o) => o.label)}
              onChange={(label) => {
                const match = employeeOptions.find((o) => o.label === label);
                setFieldForceName(match ? match.name : "");
              }}
              placeholder="Select Field Force Name"
            />
          </div>
          <button className="btn btn-primary" onClick={go} disabled={!fieldForceName || loading}>
            {loading ? "Loading..." : "Go"}
          </button>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {searched && (
        <div className="card p-4 overflow-x-auto">
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium">Field Force Name: </span>
              {fieldForceName || "-"}
            </div>
            <div>
              <span className="font-medium">Designation: </span>
              {String(selectedEmployee?.designation ?? "-")}
            </div>
            <div>
              <span className="font-medium">HQ: </span>
              {String(selectedEmployee?.territory ?? "-")}
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Entity Type</th>
                {PERMISSION_KEYS.map((pk) => (
                  <th key={pk} className="text-center p-2">
                    {PERMISSION_LABEL[pk]}
                  </th>
                ))}
                <th className="text-center p-2">NameChg.</th>
              </tr>
            </thead>
            <tbody>
              {ENTITY_TYPES.map((et) => (
                <tr key={et} className="border-b">
                  <td className="p-2">{et}</td>
                  {PERMISSION_KEYS.map((pk) => (
                    <td key={pk} className="text-center p-2">
                      <input type="checkbox" checked={grid[et][pk]} onChange={() => toggle(et, pk)} />
                    </td>
                  ))}
                  <td className="text-center p-2">
                    {et === "Listed Doctor" ? (
                      <input type="checkbox" checked={!!grid[et].nameChg} onChange={toggleNameChg} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-secondary" onClick={clear} disabled={saving}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
