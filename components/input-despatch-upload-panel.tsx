"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "inputDespatchUploadLog";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currentMonthYear() {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 10px" };
const head: React.CSSProperties = { ...cell, background: "#5b5b8f", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> MR >> Input Despatch Upload
// (Input_Despatch_Upload_Acknowledge.aspx) exactly: Month/Year, Excel
// file, an OverWrite-with-Existing-Records / Only-Insert radio, Upload,
// and the Sheet-name note + template link.
export function InputDespatchUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const initial = currentMonthYear();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [file, setFile] = useState<File | null>(null);
  const [overwriteMode, setOverwriteMode] = useState<"OverWrite with Existing Records" | "Only Insert">("Only Insert");
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

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
    const ws = XLSX.utils.aoa_to_sheet([["Employee ID", "Input Code", "Despatch Qty"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Upl_Despatch_Master");
    XLSX.writeFile(wb, "Input_Despatch_Upload_Template.xlsx");
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
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, { month, year, overwriteMode });
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
        <h2 className="text-lg font-semibold mb-4">Input Despatch Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3">{result}</div>}

        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Month<span className="text-red-600">*</span>
            </label>
            <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Year<span className="text-red-600">*</span>
            </label>
            <CustomSelect value={year} options={yearOptions} onChange={setYear} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Excel file<span className="text-red-600">*</span>
            </label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" checked={overwriteMode === "OverWrite with Existing Records"} onChange={() => setOverwriteMode("OverWrite with Existing Records")} />
            OverWite with Existing Records
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" checked={overwriteMode === "Only Insert"} onChange={() => setOverwriteMode("Only Insert")} />
            Only Insert
          </label>
        </div>

        <button
          onClick={doUpload}
          disabled={uploading}
          style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        <p className="text-sm text-red-600 mt-4">Note: 1) Sheet Name Must be &apos;Upl_Despatch_Master&apos;</p>
        <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
          Excel Format File Download Here
        </button>
      </div>

      {rows.length > 0 && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>S.No</th>
                <th style={head}>Month</th>
                <th style={head}>Year</th>
                <th style={head}>File Name</th>
                <th style={head}>Overwrite Mode</th>
                <th style={head}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{String(row.month ?? "")}</td>
                  <td style={cell}>{String(row.year ?? "")}</td>
                  <td style={cell}>{String(row.fileName ?? "")}</td>
                  <td style={cell}>{String(row.overwriteMode ?? "")}</td>
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
