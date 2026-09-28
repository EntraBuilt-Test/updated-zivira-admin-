"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";

// Matches sanpharma.info's MasterFiles/Options/Homepage_ImgUpload.aspx
// ("Home Page Image Upload") exactly: Login Page Image file picker +
// Subject text field + Upload button, everything centered, followed by a
// results table (S.No / Subject / FileName / FilePath (Download) / Upload
// Date and Time / Delete) of the real, persisted uploads. Wired to the
// real, shared upload endpoint (POST /masters/homepageImageUpload/action/
// upload), which keeps the actual uploaded file as a raw attachment (the
// backend no longer tries to parse it as a spreadsheet).
const MASTER_KEY = "homepageImageUpload";

export function HomepageImageUploadPanel() {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRows(res.data);
    } catch {
      // leave the previous rows in place on a transient failure
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function doUpload() {
    if (!file) { setErr("Please choose a Login Page Image"); return; }
    if (!subject.trim()) { setErr("Please enter a Subject"); return; }
    setBusy(true); setErr(null); setMsg(null);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, { subject: subject.trim() });
      setMsg("Home page image uploaded successfully.");
      setFile(null);
      setSubject("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete(id: string) {
    setBusyId(id);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="subdivision-console" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        <div className="subdivision-head" style={{ textAlign: "center", justifyContent: "center" }}>
          <div>
            <p className="subdivision-eyebrow">Options &gt; Image Upload</p>
            <h2>Home Page Image Upload</h2>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 480 }}>
            {err && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</div>}
            {msg && <div style={{ color: "#10b981", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{msg}</div>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", justifyContent: "center" }}>
                <span style={{ width: 140, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Login Page Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="input"
                  style={{ width: 260 }}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", justifyContent: "center" }}>
                <span style={{ width: 140, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Subject</span>
                <input
                  className="input"
                  style={{ width: 260 }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <button className="button" type="button" onClick={doUpload} disabled={busy}>
                {busy ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase">S.No</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Subject</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">FileName</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">FilePath</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Upload Date and Time</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">{String(r.subject ?? "-")}</td>
                  <td className="px-4 py-2 text-sm">{String(r.fileName ?? "-")}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      type="button"
                      className="text-sm text-blue-700 underline"
                      onClick={() => apiClient.downloadMasterFile(MASTER_KEY, r.id, String(r.fileName ?? "download"))}
                    >
                      Download
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {r.uploadedOn ? new Date(String(r.uploadedOn)).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      type="button"
                      className="text-sm text-red-600 underline"
                      disabled={busyId === r.id}
                      onClick={() => doDelete(r.id)}
                    >
                      {busyId === r.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                    No images uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
