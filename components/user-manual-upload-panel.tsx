"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";

const MASTER_KEY = "userManualUpload";

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> User Manual Upload
// (Usermanual_Upload.aspx) exactly: File Upload / Subject / Upload, and a
// table of previously uploaded manuals with S.No/Subject/File
// Name/Download/Upload Date/Delete -- wired to the real
// POST /masters/userManualUpload/action/upload endpoint plus real
// hard-delete and download.
export function UserManualUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadRows() {
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRows(res.data);
    } catch {
      setRows([]);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function doUpload() {
    if (!file) {
      setError("Choose a file first");
      return;
    }
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, { subject });
      setNotice("File uploaded successfully.");
      setFile(null);
      setSubject("");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function download(row: MasterRecord) {
    try {
      await apiClient.downloadMasterFile(MASTER_KEY, row.id, String(row.fileName ?? "download"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  }

  async function deleteRow(id: string) {
    setError(null);
    try {
      await apiClient.deleteMasterRecord(MASTER_KEY, id);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">User Manual Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

        <div className="flex flex-wrap items-center gap-4 mb-3">
          <label className="text-sm font-medium">File Upload:</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium">Subject:</label>
          <input
            style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "5px 8px", width: 260 }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <button
          onClick={doUpload}
          disabled={uploading}
          style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 20px", background: "#e5e7eb", fontWeight: 600 }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {rows.length > 0 && (
        <div className="card p-0 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Subject</th>
                <th style={head}>File Name</th>
                <th style={head}>Download</th>
                <th style={head}>Upload Date</th>
                <th style={head}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{String(row.subject ?? "")}</td>
                  <td style={cell}>{String(row.fileName ?? "")}</td>
                  <td style={{ ...cell, textAlign: "center" }}>
                    <button onClick={() => download(row)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>
                      Download
                    </button>
                  </td>
                  <td style={cell}>{row.uploadedOn ? new Date(String(row.uploadedOn)).toLocaleString() : String(row.createdAt ?? "")}</td>
                  <td style={{ ...cell, textAlign: "center" }}>
                    <button onClick={() => deleteRow(row.id)} style={{ color: "#dc2626", textDecoration: "underline" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
