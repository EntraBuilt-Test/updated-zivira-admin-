"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type MasterRecord } from "@/lib/api-client";

const MASTER_KEY = "chemistUploadLog";

// Matches sanpharma.info's Options >> Chemists Upload Tool
// (Chemist_BulkUpload_Dynamic_BK.aspx) layout exactly.
const PARAMS: { key: string; label: string; defaultOn?: boolean }[] = [
  { key: "siNo", label: "SI No", defaultOn: true },
  { key: "userName", label: "User Name", defaultOn: true },
  { key: "chemistName", label: "Chemist Name", defaultOn: true },
  { key: "territory", label: "Territory", defaultOn: true },
  { key: "category", label: "Category" },
  { key: "class", label: "Class" },
  { key: "address", label: "Address" },
  { key: "address2", label: "Address 2" },
  { key: "cityName", label: "City Name" },
  { key: "pinCode", label: "Pin Code" },
  { key: "contactPerson", label: "Contact person" },
  { key: "contactPersonDesignation", label: "Contact Person Designation" },
  { key: "mobileNo", label: "Mobile No" },
  { key: "shopLandlineNo", label: "Shop landline No" },
  { key: "email", label: "EMail ID" },
  { key: "website", label: "Website" },
  { key: "stockistErpCode", label: "Stockist ERP Code" },
  { key: "chemistErpCode", label: "Chemist ERP Code" },
  { key: "state", label: "State" },
  { key: "others1", label: "Others 1" },
  { key: "others2", label: "Others 2" },
  { key: "others3", label: "Others 3" },
  { key: "others4", label: "Others 4" },
  { key: "others5", label: "Others 5" }
];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

export function ChemistUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of PARAMS) init[p.key] = !!p.defaultOn;
    return init;
  });
  const [file, setFile] = useState<File | null>(null);
  const [deactivateExisting, setDeactivateExisting] = useState(false);
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function generateExcel() {
    const headers = PARAMS.filter((p) => checked[p.key]).map((p) => p.label);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chemist Upload");
    XLSX.writeFile(wb, "Chemist_Upload_Template.xlsx");
  }

  async function doUpload() {
    if (!file) {
      setError("Choose an Excel file first");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, {
        deactivateExisting: deactivateExisting ? "true" : "false"
      });
      setResult(`Processed ${res.data.recordsProcessed} record(s), ${res.data.recordsFailed} failed.`);
      setFile(null);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Chemists Upload Tool</h2>
          <span className="text-sm text-blue-700 underline">Category / Class</span>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3">{result}</div>}

        <p className="text-sm font-medium mb-2">Select the Parameter to Upload</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-1 mb-4">
          {PARAMS.map((p) => (
            <label key={p.key} className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={!!checked[p.key]} onChange={() => toggle(p.key)} />
              {p.label}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={generateExcel} style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 14px", background: "#e5e7eb", fontWeight: 600 }}>
            Generate Excel
          </button>
          <button onClick={generateExcel} className="text-sm text-gray-400">
            Delete and Generate New Excel
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium">Excel file</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          <label className="flex items-center gap-1 text-sm text-red-600">
            <input type="checkbox" checked={deactivateExisting} onChange={(e) => setDeactivateExisting(e.target.checked)} />
            Deactivate Existing Chemist List ( if Yes then Check this Option )
          </label>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={doUpload}
            disabled={uploading}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={generateExcel} className="text-sm text-blue-700 underline">
            Excel Format File Download Here
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>File Name</th>
                <th style={head}>Uploaded On</th>
                <th style={head}>Records Processed</th>
                <th style={head}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{String(row.fileName ?? "")}</td>
                  <td style={cell}>{row.uploadedOn ? new Date(String(row.uploadedOn)).toLocaleString() : ""}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{String(row.recordsProcessed ?? 0)}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{String(row.status ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
