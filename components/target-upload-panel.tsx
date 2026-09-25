"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "targetUploadLog";

function financialYearOptions(): string[] {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // Apr-Mar FY, sanpharma convention
  const out: string[] = [];
  for (let i = -2; i <= 2; i++) {
    const y = startYear + i;
    out.push(`${y} - ${y + 1}`);
  }
  return out;
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> MR >> Target Upload
// (Target_Upload.aspx) exactly: Year (financial-year) dropdown, Excel
// file, Upload -- wired to the real POST
// /masters/targetUploadLog/action/upload endpoint, which creates real
// Target Master rows.
export function TargetUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const options = financialYearOptions();
  const [financialYear, setFinancialYear] = useState(options[2]);
  const [file, setFile] = useState<File | null>(null);
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

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["HQ Code", "Sale ERP Code", "Month", "Target Qty", "Target Rate", "Target Value"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Target Upload");
    XLSX.writeFile(wb, "Target_Upload_Template.xlsx");
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
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, { financialYear });
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
        <h2 className="text-lg font-semibold mb-4">Target Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3">{result}</div>}

        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Year<span className="text-red-600">*</span>
            </label>
            <CustomSelect value={financialYear} options={options} onChange={setFinancialYear} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Excel file<span className="text-red-600">*</span>
            </label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          </div>
        </div>

        <button
          onClick={doUpload}
          disabled={uploading}
          style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        <div className="mt-4">
          <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
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
                <th style={head}>Financial Year</th>
                <th style={head}>File Name</th>
                <th style={head}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{String(row.financialYear ?? "")}</td>
                  <td style={cell}>{String(row.fileName ?? "")}</td>
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
