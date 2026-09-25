"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { apiClient, type Product } from "@/lib/api-client";

const MASTER_KEY = "productUploadLog";

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "4px 8px" };
const head: React.CSSProperties = { ...cell, fontWeight: 700 };

// Matches sanpharma.info's Options >> Upload >> Product Upload
// (Product_Upload.aspx) exactly: Excel file, a "Deactivate Existing
// Product List" checkbox, Upload, the 3-line note + template link, and a
// read-only Category/Group/Brand reference panel on the right -- pulled
// live from the real Product Master so it always matches what's actually
// on this tenant, never a hardcoded demo list.
export function ProductUploadPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [deactivateExisting, setDeactivateExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiClient
      .products()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => String((p as Record<string, unknown>).category ?? "")).filter(Boolean))].sort(), [products]);
  const groups = useMemo(() => [...new Set(products.map((p) => String((p as Record<string, unknown>).group ?? "")).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map((p) => String((p as Record<string, unknown>).brandName ?? "")).filter(Boolean))].sort(), [products]);
  const maxRows = Math.max(categories.length, groups.length, brands.length, 1);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([["Product Name", "Category", "Group", "Brand Name", "Division", "Sub Division", "Sale Unit", "Description"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UPL_Product_Master");
    XLSX.writeFile(wb, "Product_Upload_Template.xlsx");
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
      const res = await apiClient.uploadMasterFile(MASTER_KEY, file, { deactivateExisting: deactivateExisting ? "true" : "false" });
      setResult(`Processed ${res.data.recordsProcessed} record(s), ${res.data.recordsFailed} failed.`);
      setFile(null);
      const refreshed = await apiClient.products();
      setProducts(refreshed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap items-start gap-6" style={{ maxWidth: 960 }}>
        <div className="card" style={{ maxWidth: 560, width: "100%", border: "1px solid #94a3b8", padding: 24 }}>
          <h2 className="text-lg font-semibold mb-4 text-center">Product Upload</h2>

          {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}
          {result && <div className="text-sm text-green-700 mb-3 text-center">{result}</div>}

          <div className="flex items-center justify-center gap-2 mb-3">
            <label className="text-sm font-medium">Excel file</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 12 }} />
          </div>

          <div className="flex justify-center mb-4">
            <label className="flex items-center gap-1 text-sm text-red-600">
              <input type="checkbox" checked={deactivateExisting} onChange={(e) => setDeactivateExisting(e.target.checked)} />
              Deactivate Existing Product List ( if Yes then Check this Option )
            </label>
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

          <div className="mt-4" style={{ border: "1px solid #94a3b8", padding: 10 }}>
            <p className="text-sm text-red-600 font-medium">Note:</p>
            <p className="text-sm">1) Sheet Name Must be &apos;UPL_Product_Master&apos;</p>
            <p className="text-sm">2) Group, Category, Brand Name Must be Match Our Website</p>
            <p className="text-sm">3) Don&apos;t Do Any Special Formats in the Excel File</p>
          </div>

          <div className="text-center mt-4">
            <button onClick={downloadTemplate} className="text-sm text-blue-700 underline">
              Excel Format File Download Here
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <table style={{ borderCollapse: "collapse" }} className="text-sm">
            <thead>
              <tr>
                <th style={head}>Category</th>
                <th style={head}>Group</th>
                <th style={head}>Brand</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_, i) => (
                <tr key={i}>
                  <td style={cell}>{categories[i] ?? ""}</td>
                  <td style={cell}>{groups[i] ?? ""}</td>
                  <td style={cell}>{brands[i] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
