"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";

const SETUP_KEY = "leaveTypeSetup";
const CATALOG_KEY = "leaveTypeCatalog";

const EMPLOYMENT_TYPES = ["Trainee", "Probation", "Confirmed"] as const;
const LEAVE_COLUMNS = ["cl", "pl", "sl", "lop"] as const;
type LeaveColumn = (typeof LEAVE_COLUMNS)[number];
const COLUMN_LABEL: Record<LeaveColumn, string> = { cl: "CL", pl: "PL", sl: "SL", lop: "LOP" };

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

type SetupRow = { employmentType: string; values: Record<LeaveColumn, boolean>; existing?: MasterRecord };
type TypeRow = { id?: string; shortName: string; name: string; status: string; existing?: MasterRecord };

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px" };
const head: React.CSSProperties = { ...cell, background: "#0f2f52", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> Leave Setup screen (Leave_Setup.aspx)
// exactly: a left "SetUp" box with the Trainee/Probation/Confirmed x
// CL/PL/SL/LOP requirement matrix plus a Default checkbox and its own
// Save button, and a right "Type" box listing the leave types themselves
// (Short Name / Name / Deactivate-Reactivate) with an Add row and its own
// Save button.
export function LeaveSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [setupRows, setSetupRows] = useState<SetupRow[]>([]);
  const [typeRows, setTypeRows] = useState<TypeRow[]>([]);
  const [newShortName, setNewShortName] = useState("");
  const [newName, setNewName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSetup, setSavingSetup] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [setupRes, catalogRes] = await Promise.all([
        apiClient.masterRecords(SETUP_KEY),
        apiClient.masterRecords(CATALOG_KEY)
      ]);

      setSetupRows(
        EMPLOYMENT_TYPES.map((et) => {
          const existing = setupRes.data.find((r) => String(r.employmentType ?? "") === et);
          const values = {} as Record<LeaveColumn, boolean>;
          for (const col of LEAVE_COLUMNS) values[col] = existing ? yesNo(existing[col]) : true;
          if (existing && yesNo(existing.isDefault)) setIsDefault(true);
          return { employmentType: et, values, existing };
        })
      );

      setTypeRows(
        catalogRes.data.map((r) => ({
          id: r.id,
          shortName: String(r.shortName ?? ""),
          name: String(r.name ?? ""),
          status: String(r.status ?? "Active"),
          existing: r
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Leave Setup");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSetup(employmentType: string, col: LeaveColumn) {
    setSetupRows((prev) =>
      prev.map((r) => (r.employmentType === employmentType ? { ...r, values: { ...r.values, [col]: !r.values[col] } } : r))
    );
  }

  async function saveSetup() {
    setSavingSetup(true);
    setError(null);
    setNotice(null);
    try {
      for (const row of setupRows) {
        const payload: Record<string, unknown> = {
          employmentType: row.employmentType,
          cl: row.values.cl ? "Yes" : "No",
          pl: row.values.pl ? "Yes" : "No",
          sl: row.values.sl ? "Yes" : "No",
          lop: row.values.lop ? "Yes" : "No",
          isDefault: isDefault ? "Yes" : "No"
        };
        if (row.existing) {
          await apiClient.updateMasterRecord(SETUP_KEY, row.existing.id, payload);
        } else {
          await apiClient.createMasterRecord(SETUP_KEY, payload);
        }
      }
      setNotice("Leave Setup saved successfully.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Leave Setup");
    } finally {
      setSavingSetup(false);
    }
  }

  async function addType() {
    if (!newShortName.trim() || !newName.trim()) return;
    setSavingType(true);
    setError(null);
    try {
      await apiClient.createMasterRecord(CATALOG_KEY, {
        shortName: newShortName.trim(),
        name: newName.trim(),
        status: "Active"
      });
      setNewShortName("");
      setNewName("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add leave type");
    } finally {
      setSavingType(false);
    }
  }

  async function toggleTypeStatus(row: TypeRow) {
    if (!row.existing) return;
    setSavingType(true);
    setError(null);
    try {
      const nextStatus = row.status === "Active" ? "Inactive" : "Active";
      await apiClient.updateMasterRecord(CATALOG_KEY, row.existing.id, { shortName: row.shortName, name: row.name, status: nextStatus });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update leave type");
    } finally {
      setSavingType(false);
    }
  }

  async function saveTypes() {
    setSavingType(true);
    setError(null);
    setNotice(null);
    try {
      for (const row of typeRows) {
        if (!row.existing) continue;
        await apiClient.updateMasterRecord(CATALOG_KEY, row.existing.id, {
          shortName: row.shortName,
          name: row.name,
          status: row.status
        });
      }
      setNotice("Leave Types saved successfully.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save leave types");
    } finally {
      setSavingType(false);
    }
  }

  function editTypeField(id: string | undefined, field: "shortName" | "name", value: string) {
    setTypeRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  if (loading) return <div className="card p-4 text-sm">Loading Leave Setup...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Leave Setup</h2>
      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card p-4">
          <h3 className="text-center font-semibold mb-3">SetUp</h3>
          <p className="text-center text-sm font-medium mb-3">Leave Type Requirement:-</p>
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Type</th>
                {LEAVE_COLUMNS.map((col) => (
                  <th key={col} style={head}>
                    {COLUMN_LABEL[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {setupRows.map((row, i) => (
                <tr key={row.employmentType}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{row.employmentType}</td>
                  {LEAVE_COLUMNS.map((col) => (
                    <td key={col} style={{ ...cell, textAlign: "center" }}>
                      <input type="checkbox" checked={row.values[col]} onChange={() => toggleSetup(row.employmentType, col)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-center gap-2 mt-3">
            <label className="text-sm">Default</label>
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={saveSetup}
              disabled={savingSetup}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "8px 24px",
                cursor: savingSetup ? "default" : "pointer",
                opacity: savingSetup ? 0.7 : 1
              }}
            >
              {savingSetup ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-center font-semibold mb-3">Type</h3>
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Short Name</th>
                <th style={head}>Name</th>
                <th style={head}>More</th>
                <th style={head}>Deactivate/Reactivate</th>
              </tr>
            </thead>
            <tbody>
              {typeRows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: "100%" }}
                      value={row.shortName}
                      onChange={(e) => editTypeField(row.id, "shortName", e.target.value)}
                    />
                  </td>
                  <td style={cell}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: "100%" }}
                      value={row.name}
                      onChange={(e) => editTypeField(row.id, "name", e.target.value)}
                    />
                  </td>
                  <td style={cell} />
                  <td style={{ ...cell, textAlign: "center" }}>
                    <button onClick={() => toggleTypeStatus(row)} style={{ color: "#1d4ed8", textDecoration: "underline", fontSize: 12 }}>
                      {row.status === "Active" ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td style={cell} />
                <td style={cell}>
                  <input
                    style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: "100%" }}
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    placeholder="Short Name"
                  />
                </td>
                <td style={cell}>
                  <input
                    style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: "100%" }}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                  />
                </td>
                <td style={{ ...cell, textAlign: "center" }}>
                  <button
                    onClick={addType}
                    disabled={savingType}
                    style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "4px 10px", background: "#e0f2fe", fontSize: 12 }}
                  >
                    Add
                  </button>
                </td>
                <td style={cell} />
              </tr>
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <button
              onClick={saveTypes}
              disabled={savingType}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "8px 24px",
                cursor: savingType ? "default" : "pointer",
                opacity: savingType ? 0.7 : 1
              }}
            >
              {savingType ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
