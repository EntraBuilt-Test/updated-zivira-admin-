"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "mailFolderCreation";

type FolderRow = { id: string; mailFolderName: string; mailCount: number };

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#0f2f52", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Master >> Mail Folder Creation screen
// (Mail_Folder_Creation.aspx) exactly: a "Transfer Mail" button above a
// bordered table (More / S.No / Mail Folder Name / Mail Count / Delete)
// with an inline "Add Folder" row, and a single Save button. "Transfer
// Mail" switches to the Transfer Mail Folder sub-screen (Mail_Folder_
// Trans.aspx): Change From Folder / Change To Folder dropdowns, a 'Delete'
// After Transfer checkbox, and a Transfer - Mail button that reveals a
// "Transaction Available" preview (No. of moved mails available) with a
// Confirm to Transfer button, which then shows a centered "Transfered
// Successfully" popup -- matching sanpharma's own native alert() there.
export function MailFolderCreationPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [rows, setRows] = useState<FolderRow[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [view, setView] = useState<"list" | "transfer">("list");
  const [fromFolder, setFromFolder] = useState("");
  const [toFolder, setToFolder] = useState("");
  const [deleteAfterTransfer, setDeleteAfterTransfer] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRows(
        res.data.map((r: MasterRecord) => ({
          id: r.id,
          mailFolderName: String(r.mailFolderName ?? ""),
          mailCount: Number(r.mailCount ?? 0)
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Mail Folder Creation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  function editName(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, mailFolderName: value } : r)));
  }

  async function addFolder() {
    if (!newFolderName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.createMasterRecord(MASTER_KEY, { mailFolderName: newFolderName.trim(), mailCount: 0, status: "Active" });
      setNewFolderName("");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add folder");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFolder(id: string) {
    setSaving(true);
    setError(null);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, id);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete folder");
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
        await apiClient.updateMasterRecord(MASTER_KEY, row.id, { mailFolderName: row.mailFolderName, mailCount: row.mailCount });
      }
      setNotice("Mail folders saved successfully.");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save folders");
    } finally {
      setSaving(false);
    }
  }

  const folderOptions = rows.map((r) => r.mailFolderName).filter(Boolean);

  function openTransfer() {
    setFromFolder("");
    setToFolder("");
    setDeleteAfterTransfer(false);
    setPreviewCount(null);
    setView("transfer");
  }

  async function transferMail() {
    if (!fromFolder || !toFolder || fromFolder === toFolder) return;
    setTransferring(true);
    setError(null);
    try {
      const res = await apiClient.mailTransferPreview(fromFolder);
      setPreviewCount(res.data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview transfer");
    } finally {
      setTransferring(false);
    }
  }

  async function confirmTransfer() {
    setTransferring(true);
    setError(null);
    try {
      await apiClient.mailTransfer({ from: fromFolder, to: toFolder, deleteAfterTransfer });
      setSuccessOpen(true);
      setPreviewCount(null);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer mail");
    } finally {
      setTransferring(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Mail Folder Creation...</div>;

  if (view === "transfer") {
    return (
      <div className="space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transfer Mail Folder</h2>
            <button
              onClick={() => setView("list")}
              style={{ border: "1px solid #94a3b8", borderRadius: 6, background: "#fff", padding: "6px 16px", fontWeight: 600 }}
            >
              Back
            </button>
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <div className="mx-auto" style={{ maxWidth: 420 }}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium" style={{ width: 180 }}>
                  Change From Folder
                </label>
                <CustomSelect value={fromFolder || "--Select--"} options={["--Select--", ...folderOptions]} onChange={(v) => setFromFolder(v === "--Select--" ? "" : v)} placeholder="--Select--" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium" style={{ width: 180 }}>
                  Change To Folder
                </label>
                <CustomSelect value={toFolder || "--Select--"} options={["--Select--", ...folderOptions]} onChange={(v) => setToFolder(v === "--Select--" ? "" : v)} placeholder="--Select--" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={deleteAfterTransfer} onChange={(e) => setDeleteAfterTransfer(e.target.checked)} />
                'Delete' After Transfer
              </label>

              <div className="flex justify-center">
                <button
                  onClick={transferMail}
                  disabled={transferring || !fromFolder || !toFolder || fromFolder === toFolder}
                  style={{
                    border: "1px solid #94a3b8",
                    borderRadius: 6,
                    background: "#e0f2fe",
                    padding: "8px 20px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Transfer - Mail
                </button>
              </div>
            </div>

            {previewCount !== null && (
              <div className="mt-6">
                <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
                  <thead>
                    <tr>
                      <th colSpan={2} style={head}>
                        Transaction Available
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={cell}>No. of moved mails available</td>
                      <td style={{ ...cell, textAlign: "center", color: "#dc2626", fontWeight: 700 }}>{previewCount}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={confirmTransfer}
                    disabled={transferring}
                    style={{
                      border: "1px solid #94a3b8",
                      borderRadius: 6,
                      background: "#e0f2fe",
                      padding: "8px 20px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Confirm to Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
              <p className="text-sm mb-4">Transfered Successfully</p>
              <button
                onClick={() => {
                  setSuccessOpen(false);
                  setView("list");
                }}
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

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mail Folder Creation</h2>
          <button
            onClick={openTransfer}
            style={{ border: "1px solid #94a3b8", borderRadius: 6, background: "#e0f2fe", padding: "8px 16px", fontWeight: 600 }}
          >
            Transfer Mail
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 640 }} className="text-sm">
          <thead>
            <tr>
              <th style={head}>More</th>
              <th style={head}>S.No</th>
              <th style={head}>Mail Folder Name</th>
              <th style={head}>Mail Count</th>
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
                    style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: "100%" }}
                    value={row.mailFolderName}
                    onChange={(e) => editName(row.id, e.target.value)}
                  />
                </td>
                <td style={{ ...cell, textAlign: "center" }}>{row.mailCount}</td>
                <td style={{ ...cell, textAlign: "center" }}>
                  <button onClick={() => deleteFolder(row.id)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td style={cell}>
                <button
                  onClick={addFolder}
                  disabled={saving}
                  style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "4px 10px", background: "#e0f2fe", fontSize: 12 }}
                >
                  Add Folder
                </button>
              </td>
              <td style={cell} />
              <td style={cell}>
                <input
                  style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: "100%" }}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                />
              </td>
              <td style={cell} />
              <td style={cell} />
            </tr>
          </tbody>
        </table>

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
      </div>
    </div>
  );
}
