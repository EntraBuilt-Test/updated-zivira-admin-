"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";

const MASTER_KEY = "callRemarksTemplates";

type Row = { id: string; remarksText: string };

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> Call Remarks Templates screen
// (App_CallRemarks.aspx) exactly: before any remarks exist, just an
// "Add Remarks" button next to a text box; typing a value and clicking
// Add Remarks saves it and flips the page into a bordered
// More/S.No/Name/Delete table with a fresh inline Add row underneath, and
// a single Save button that persists any edits made to existing rows.
export function CallRemarksTemplatesPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRows(res.data.map((r: MasterRecord) => ({ id: r.id, remarksText: String(r.remarksText ?? "") })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Call Remarks Templates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  function editText(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, remarksText: value } : r)));
  }

  async function addRemarks() {
    if (!newText.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.createMasterRecord(MASTER_KEY, { remarksText: newText.trim(), status: "Active" });
      setNewText("");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add remarks");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: string) {
    setSaving(true);
    setError(null);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, id);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete remarks");
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      for (const row of rows) {
        await apiClient.updateMasterRecord(MASTER_KEY, row.id, { remarksText: row.remarksText });
      }
      setNotice("Call Remarks saved successfully.");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save remarks");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Call Remarks Templates...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4 text-center">
        <h2 className="text-lg font-semibold mb-4">Call Remarks Templates</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

        {rows.length === 0 ? (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={addRemarks}
              disabled={saving}
              style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 14px", background: "#e0f2fe", fontWeight: 600 }}
            >
              Add Remarks
            </button>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "5px 8px", width: 260 }}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <table style={{ borderCollapse: "collapse" }} className="text-sm">
              <thead>
                <tr>
                  <th style={head}>More</th>
                  <th style={head}>S.No</th>
                  <th style={head}>Name</th>
                  <th style={head}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td style={cell} />
                    <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                    <td style={cell}>
                      <input
                        style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: 220 }}
                        value={row.remarksText}
                        onChange={(e) => editText(row.id, e.target.value)}
                      />
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <button onClick={() => deleteRow(row.id)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={cell}>
                    <button
                      onClick={addRemarks}
                      disabled={saving}
                      style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "4px 10px", background: "#e0f2fe", fontSize: 12 }}
                    >
                      Add Remarks
                    </button>
                  </td>
                  <td style={cell} />
                  <td style={cell}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: 220 }}
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                    />
                  </td>
                  <td style={cell} />
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex justify-center mt-5">
            <button
              onClick={saveAll}
              disabled={saving}
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
        )}
      </div>
    </div>
  );
}
