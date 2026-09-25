"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "productRateUploadLog";
const INDIAN_STATES = [
  "AndhraPradesh", "Assam", "Bihar", "Chattisgarh", "Delhi", "Gujarat", "Haryana", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Mumbai", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const STATE_OPTIONS = ["ALL", ...INDIAN_STATES];

// Matches sanpharma.info's Options >> Upload >> Product Rate
// (Product_Rate_Upload.aspx) exactly: State Name dropdown (defaulting to
// ALL), a Download Link for the current rates, Excel file, Upload -- no
// results table.
export function ProductRateUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [stateName, setStateName] = useState("ALL");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadCurrentRates() {
    const ws = XLSX.utils.aoa_to_sheet([["Product Name", "State", "Rate"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Rate");
    XLSX.writeFile(wb, `Product_Rate_${stateName}.xlsx`);
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
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, { stateName });
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
      <div className="card" style={{ maxWidth: 560, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
        <h2 className="text-lg font-semibold mb-4 text-center">Product Rate</h2>

        {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
        {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

        <div className="flex items-center justify-center gap-2 mb-4">
          <label className="text-sm font-medium">
            State Name<span className="text-red-600">*</span>
          </label>
          <CustomSelect value={stateName} options={STATE_OPTIONS} onChange={setStateName} />
        </div>

        <div className="text-center mb-4">
          <button onClick={downloadCurrentRates} className="text-sm text-blue-700 underline">
            Download Link
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
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
      </div>
    </div>
  );
}
