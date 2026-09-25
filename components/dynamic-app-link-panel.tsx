"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "appSetupDynamicAppLink";
const MENU_TYPE_OPTIONS = ["Report", "Menu"] as const;
const PATH_OPTIONS = ["Precall Analysis", "Order Booking"] as const;
const SELECT_CLEAR = "--Select--";

type Row = { id: string; menuType: string; menuName: string; path: string; logoFileName: string; status: string };

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Master >> Menu Creation screen (Menu_Creation.aspx)
// exactly: the Menu Type / Menu Name / Path / Logo form with Save/Clear is
// ALWAYS visible at the top (no "Add" button gate), and once at least one
// link has been saved a bordered S.No/Menu Type/Menu Name/Edit/Deactivate
// table appears underneath it.
export function DynamicAppLinkPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuType, setMenuType] = useState("");
  const [menuName, setMenuName] = useState("");
  const [path, setPath] = useState("");
  const [logoFileName, setLogoFileName] = useState("");

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRows(
        res.data.map((r: MasterRecord) => ({
          id: r.id,
          menuType: String(r.menuType ?? ""),
          menuName: String(r.menuName ?? ""),
          path: String(r.path ?? ""),
          logoFileName: String(r.logoFileName ?? ""),
          status: String(r.status ?? "Active")
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Dynamic App Link");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  function resetForm() {
    setEditingId(null);
    setMenuType("");
    setMenuName("");
    setPath("");
    setLogoFileName("");
  }

  function openEdit(row: Row) {
    setEditingId(row.id);
    setMenuType(row.menuType);
    setMenuName(row.menuName);
    setPath(row.path);
    setLogoFileName(row.logoFileName);
  }

  async function save() {
    if (!menuType || !menuName.trim() || !path) {
      setError("Menu Type, Menu Name and Path are required");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = { menuType, menuName: menuName.trim(), path, logoFileName, status: "Active" };
      if (editingId) await apiClient.updateMasterRecord(MASTER_KEY, editingId, payload);
      else await apiClient.createMasterRecord(MASTER_KEY, payload);
      setNotice("Dynamic App Link saved successfully.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Dynamic App Link");
    } finally {
      setSaving(false);
    }
  }

  async function toggleDeactivate(row: Row) {
    setSaving(true);
    setError(null);
    try {
      const nextStatus = row.status === "Active" ? "Inactive" : "Active";
      await apiClient.updateMasterRecord(MASTER_KEY, row.id, { status: nextStatus });
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Dynamic App Link...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Dynamic App Link</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {notice && <div className="text-sm text-green-700 mb-3 text-center">{notice}</div>}

        <div className="flex flex-wrap items-end justify-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Menu Type <span className="text-red-600">*</span>
            </label>
            <CustomSelect value={menuType || SELECT_CLEAR} options={[SELECT_CLEAR, ...MENU_TYPE_OPTIONS]} onChange={(v) => setMenuType(v === SELECT_CLEAR ? "" : v)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Menu Name <span className="text-red-600">*</span>
            </label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "5px 8px", width: 180 }}
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Path <span className="text-red-600">*</span>
            </label>
            <CustomSelect value={path || SELECT_CLEAR} options={[SELECT_CLEAR, ...PATH_OPTIONS]} onChange={(v) => setPath(v === SELECT_CLEAR ? "" : v)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Logo <span className="text-red-600">*</span>
            </label>
            <input type="file" onChange={(e) => setLogoFileName(e.target.files?.[0]?.name ?? "")} style={{ fontSize: 12 }} />
            {logoFileName && <div className="text-xs text-gray-500 mt-1">{logoFileName}</div>}
          </div>
          <button
            onClick={save}
            disabled={saving}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 20px" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={resetForm}
            style={{ border: "1px solid #94a3b8", borderRadius: 6, background: "#fff", fontWeight: 600, padding: "8px 20px" }}
          >
            Clear
          </button>
        </div>

        {rows.length > 0 && (
          <div className="flex justify-center">
            <table style={{ borderCollapse: "collapse" }} className="text-sm">
              <thead>
                <tr>
                  <th style={head}>S.No</th>
                  <th style={head}>Menu Type</th>
                  <th style={head}>Menu Name</th>
                  <th style={head}>Edit</th>
                  <th style={head}>Deactivate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                    <td style={cell}>{row.menuType}</td>
                    <td style={cell}>{row.menuName}</td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <button onClick={() => openEdit(row)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>
                        Edit
                      </button>
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <button onClick={() => toggleDeactivate(row)} style={{ color: "#dc2626", textDecoration: "underline" }}>
                        {row.status === "Active" ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
