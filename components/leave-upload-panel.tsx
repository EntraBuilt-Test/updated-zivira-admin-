"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "leaveBulkUploadLog";

function yearOptions(): string[] {
  const y = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => String(y - 2 + i));
}

// Matches sanpharma.info's Options >> Upload >> Leave Upload
// (Leave_BulkUpload_Dynamic.aspx) exactly: Financial Year, Excel file,
// Upload, and the Sheet-name note + template link -- wired to the real
// POST /masters/leaveBulkUploadLog/action/upload endpoint, which creates
// real, already-approved Leave Application rows.
export function LeaveUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const options = yearOptions();
  const [financialYear, setFinancialYear] = useState(String(new Date().getFullYear()));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["Emp Code", "Leave Type", "From Date", "To Date", "Days", "Reason"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave_Upload");
    XLSX.writeFile(wb, "Leave_Upload_Template.xlsx");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="card" style={{ maxWidth: 640, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
        <h2 className="text-lg font-semibold mb-4 text-center">Leave Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Financial Year</label>
            <CustomSelect value={financialYear} options={options} onChange={setFinancialYear} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Excel file</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={doUpload}
            disabled={uploading}
            style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 20px", background: "#e5e7eb", fontWeight: 600 }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <div className="mt-4 text-center" style={{ border: "1px solid #94a3b8", padding: 10 }}>
          <p className="text-sm">
            <span className="font-medium text-red-600">Note:</span> 1) Sheet Name Must be &apos;Leave_Upload&apos;
          </p>
        </div>

        <div className="text-center mt-4">
          <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
            Excel Format File Download Here
          </button>
        </div>
      </div>
    </div>
  );
}
