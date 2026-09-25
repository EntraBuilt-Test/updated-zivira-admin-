"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";

const MASTER_KEY = "stockistUploadLog";

// Matches sanpharma.info's Options >> Upload >> Stockist Upload
// (Stockiest_Upload.aspx) exactly: a single centered, bordered box with
// Excel file, Upload, and the Sheet-name note + template link -- wired to
// the real POST /masters/stockistUploadLog/action/upload endpoint, which
// upserts into the real Stockist Master.
export function StockistUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["ERP Code", "Name", "State", "HQ Name", "Address", "Phone", "Field Force Name"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UPL_Stockist_Master");
    XLSX.writeFile(wb, "Stockist_Upload_Template.xlsx");
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
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file);
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
        <h2 className="text-lg font-semibold mb-4 text-center">Stockist Upload</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="flex items-center justify-center gap-2 mb-4">
          <label className="text-sm font-medium">Excel file</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
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
            <span className="font-medium">Note:</span> 1) Sheet Name Must be &apos;UPL_Stockist_Master&apos;
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
