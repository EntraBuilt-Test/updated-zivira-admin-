"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const ALLOCATION_KEY = "gpsGeoFenceAllocation";
const SELECT_CLEAR = "--- Select the Field force ---";
const ENTITY_TYPES = ["Doctor", "Chemist", "Stockist"] as const;

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")}-${String(e.territory ?? "")}-${String(e.designation ?? "")}`;
}

type AllocRow = {
  name: string;
  hq: string;
  designation: string;
  gps: boolean;
  geoDoctor: boolean;
  geoChemist: boolean;
  geoStock: boolean;
  existing?: MasterRecord;
};

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "5px 8px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> Gps/GeoFence And Geo Tagg Deletion
// screen (GPS_GEOFence.aspx) exactly: one radio switch at the top between
// "Gps/Geo Fence User Allocation" (a FieldForce picker + Go, then a
// bordered results table with GPS/Geo Fencing Doctor/Chemist/Stock
// checkboxes and a Save Setting/Cancel pair) and "Geo Tagg Deletion" (a
// Doctor/Chemist/Stockist radio + FieldForce picker + Go, then a
// "No Records Found" panel with its own Delete button since there is
// never any real geo-tag data to remove here).
export function GpsGeoFencePanel({ initialMode = "allocation" as "allocation" | "geoTag" }: { initialMode?: "allocation" | "geoTag" }) {
  const [mode, setMode] = useState<"allocation" | "geoTag">(initialMode);
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForce, setFieldForce] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [allocRows, setAllocRows] = useState<AllocRow[]>([]);
  const [allocSearched, setAllocSearched] = useState(false);

  const [entityType, setEntityType] = useState<(typeof ENTITY_TYPES)[number]>("Doctor");
  const [geoTagSearched, setGeoTagSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .masterRecords("employees")
      .then((res) => {
        if (!cancelled) setEmployees(res.data);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fieldForceOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel),
    [employees]
  );

  async function goAllocation() {
    setError(null);
    setNotice(null);
    setAllocSearched(true);
    try {
      const recordsRes = await apiClient.masterRecords(ALLOCATION_KEY);
      const sorted = [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      setAllocRows(
        sorted.map((e) => {
          const name = String(e.name ?? "");
          const existing = recordsRes.data.find((r) => String(r.fieldForceName ?? "") === name);
          return {
            name,
            hq: String(e.territory ?? ""),
            designation: String(e.designation ?? ""),
            gps: existing ? yesNo(existing.gps) : false,
            geoDoctor: existing ? yesNo(existing.geoFencingDoctor) : false,
            geoChemist: existing ? yesNo(existing.geoFencingChemist) : false,
            geoStock: existing ? yesNo(existing.geoFencingStockist) : false,
            existing
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    }
  }

  function toggle(name: string, key: "gps" | "geoDoctor" | "geoChemist" | "geoStock") {
    setAllocRows((prev) => prev.map((r) => (r.name === name ? { ...r, [key]: !r[key] } : r)));
  }

  async function saveAllocation() {
    setSaving(true);
    setError(null);
    try {
      for (const row of allocRows) {
        const payload = {
          fieldForceName: row.name,
          gps: row.gps ? "Yes" : "No",
          geoFencingDoctor: row.geoDoctor ? "Yes" : "No",
          geoFencingChemist: row.geoChemist ? "Yes" : "No",
          geoFencingStockist: row.geoStock ? "Yes" : "No"
        };
        if (row.existing) await apiClient.updateMasterRecord(ALLOCATION_KEY, row.existing.id, payload);
        else await apiClient.createMasterRecord(ALLOCATION_KEY, payload);
      }
      setNotice("Gps/Geo Fence allocation saved successfully.");
      await goAllocation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 text-center">
        <h2 className="text-lg font-semibold mb-4">Gps/GeoFence And Geo Tagg Deletion</h2>
        <div className="flex justify-center">
          <div style={{ border: "1px solid #94a3b8", display: "inline-flex" }}>
            <label
              className="flex items-center gap-1 text-sm px-3 py-1"
              style={{ background: mode === "allocation" ? "#1e3a8a" : "transparent", color: mode === "allocation" ? "#fff" : "#111827" }}
            >
              <input type="radio" checked={mode === "allocation"} onChange={() => setMode("allocation")} /> Gps/Geo Fence User Allocation
            </label>
            <label
              className="flex items-center gap-1 text-sm px-3 py-1"
              style={{ background: mode === "geoTag" ? "#1e3a8a" : "transparent", color: mode === "geoTag" ? "#fff" : "#111827" }}
            >
              <input type="radio" checked={mode === "geoTag"} onChange={() => setMode("geoTag")} /> Geo Tagg Deletion
            </label>
          </div>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {mode === "allocation" && (
        <div className="card p-4">
          <h3 className="text-center font-semibold text-purple-800 mb-4">Gps/Geo Fence User Allocation</h3>
          <div className="flex items-center justify-center gap-3 mb-4">
            <label className="text-sm font-medium">Filed Force Name</label>
            <CustomSelect
              value={fieldForce || SELECT_CLEAR}
              options={[SELECT_CLEAR, ...fieldForceOptions]}
              onChange={(v) => setFieldForce(v === SELECT_CLEAR ? "" : v)}
            />
            <button
              onClick={goAllocation}
              style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "6px 18px" }}
            >
              Go
            </button>
          </div>

          {allocSearched && (
            <div className="overflow-x-auto">
              <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
                <thead>
                  <tr>
                    <th style={head}>S.No</th>
                    <th style={head}>FieldForce Name</th>
                    <th style={head}>HQ</th>
                    <th style={head}>Designation</th>
                    <th style={head}>GPS</th>
                    <th style={head}>GEO Fencing Doctor</th>
                    <th style={head}>GEO Fencing Chemist</th>
                    <th style={head}>GEO Fencing Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {allocRows.map((row, i) => (
                    <tr key={row.name}>
                      <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                      <td style={cell}>{row.name}-{row.hq}-{row.designation}</td>
                      <td style={cell}>{row.hq}</td>
                      <td style={cell}>{row.designation}</td>
                      <td style={{ ...cell, textAlign: "center" }}>
                        <input type="checkbox" checked={row.gps} onChange={() => toggle(row.name, "gps")} />
                      </td>
                      <td style={{ ...cell, textAlign: "center" }}>
                        <input type="checkbox" checked={row.geoDoctor} onChange={() => toggle(row.name, "geoDoctor")} />
                      </td>
                      <td style={{ ...cell, textAlign: "center" }}>
                        <input type="checkbox" checked={row.geoChemist} onChange={() => toggle(row.name, "geoChemist")} />
                      </td>
                      <td style={{ ...cell, textAlign: "center" }}>
                        <input type="checkbox" checked={row.geoStock} onChange={() => toggle(row.name, "geoStock")} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center gap-3 mt-5">
                <button
                  onClick={saveAllocation}
                  disabled={saving}
                  style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
                >
                  {saving ? "Saving..." : "Save Setting"}
                </button>
                <button
                  onClick={() => setAllocSearched(false)}
                  style={{ border: "1px solid #94a3b8", borderRadius: 6, background: "#fff", fontWeight: 600, padding: "8px 24px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "geoTag" && (
        <div className="card p-4">
          <h3 className="text-center font-semibold text-purple-800 mb-4">Geo Tagg Drs Deletion</h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            {ENTITY_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-1 text-sm">
                <input type="radio" checked={entityType === t} onChange={() => { setEntityType(t); setGeoTagSearched(false); }} /> {t}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <label className="text-sm font-medium">FieldForce Name</label>
            <CustomSelect
              value={fieldForce || SELECT_CLEAR}
              options={[SELECT_CLEAR, ...fieldForceOptions]}
              onChange={(v) => setFieldForce(v === SELECT_CLEAR ? "" : v)}
            />
            <button
              onClick={() => setGeoTagSearched(true)}
              style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "6px 18px" }}
            >
              Go
            </button>
          </div>

          {geoTagSearched && (
            <div className="mx-auto" style={{ maxWidth: 640 }}>
              <div style={{ border: "1px solid #94a3b8", padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#1e3a8a" }}>
                No Records Found
              </div>
              <div className="flex justify-center mt-4">
                <button
                  style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
                  disabled
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
