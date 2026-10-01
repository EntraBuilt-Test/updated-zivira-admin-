"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";
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

// Matches sanpharma.info's Options >> MR >> Target Upload
// (Target_Upload.aspx) exactly: a single centered, bordered box holding
// Year (financial-year) dropdown, Excel file, Upload -- no results table,
// wired to the real POST /masters/targetUploadLog/action/upload endpoint,
// which creates real Target Master rows.
export function TargetUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const options = financialYearOptions();
  const [financialYear, setFinancialYear] = useState(options[2]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Round F item 2 -- this template used to generate "HQ Code"/"Sale ERP
  // Code"/"Target Qty"/"Target Rate" while the backend importer required
  // "Field Force Name"/"Product" columns that were never in the sheet at
  // all -- every row failed to import. Headers below now match exactly
  // what src/routes/uploads.routes.ts's importTargets() actually reads.
  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["Field Force Name", "Division", "HQ", "Product", "Month", "Year", "Target Qty", "Target Rate"]]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="card" style={{ maxWidth: 640, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
        <h2 className="text-lg font-semibold mb-4 text-center">Target Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="flex flex-col items-center gap-4 mb-4">
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

        <div className="flex justify-center">
          <button
            onClick={doUpload}
            disabled={uploading}
            style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px" }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
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
