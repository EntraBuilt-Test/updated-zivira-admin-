"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient, type MasterField, type MasterRecord, type MasterSchema } from "@/lib/api-client";

/**
 * ONE generic file-upload screen reused by every "Upload Tool" Options
 * master (Listed Doctor, Chemist, Salesforce, Stockist, Product, Target,
 * Holiday Fixation, Leave, Sample/Input Despatch, Product Rate, Slide
 * E-Detailing, Home Page Images, File Upload Designation-wise, User
 * Manual, Transaction). Renders that master's own non-file fields as plain
 * inputs (month/year/division/overwriteMode/etc.) alongside a file picker,
 * then calls the shared POST /company/masters/:key/action/upload endpoint.
 * For masters with a real target collection (see uploads.routes.ts's
 * REAL_TARGETS), the response's `logOnly: false` means the rows were
 * actually upserted into a real collection, not just logged.
 */
export function UploadPanel({ masterKey }: { masterKey: string }) {
  const [schema, setSchema] = useState<MasterSchema | null>(null);
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recordsProcessed: number; recordsFailed: number; errors: string[]; logOnly: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    const [schemaRes, rowsRes] = await Promise.all([
      apiClient.masterSchema(masterKey),
      apiClient.masterRecords(masterKey)
    ]);
    setSchema(schemaRes.data);
    setRows(rowsRes.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  const EXTRA_FIELD_KEYS = new Set(["fileName", "uploadedOn", "status", "recordsProcessed"]);
  const extraFields: MasterField[] = schema?.fields.filter((f) => !EXTRA_FIELD_KEYS.has(f.key)) ?? [];

  async function submit() {
    setError(null);
    setResult(null);
    if (!file) { setError("Choose a file to upload"); return; }

    setUploading(true);
    try {
      const res = await apiClient.uploadMasterFile(masterKey, file, fieldValues);
      setResult(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!schema) return null;

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">{schema.title}</h2>
        <p className="text-sm text-text-muted mt-1">Upload a .xlsx or .csv file — parsed and processed on the server, real results below.</p>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "560px" }}>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {result && (
          <div className={`text-sm rounded-lg px-3 py-2 border ${result.recordsFailed > 0 && result.recordsProcessed === 0 ? "text-red-700 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"}`}>
            {result.logOnly
              ? `File received and logged (${result.recordsProcessed} row${result.recordsProcessed === 1 ? "" : "s"} in the sheet). This upload type has no matching real data collection, so no records were changed — see the report for why.`
              : `Processed ${result.recordsProcessed} record${result.recordsProcessed === 1 ? "" : "s"}${result.recordsFailed ? `, ${result.recordsFailed} failed` : ""}.`}
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs">
                {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        {extraFields.map((f) => (
          <div key={f.key}>
            <span className="block text-xs font-medium text-text-muted mb-1">{f.label}</span>
            {f.options ? (
              <select className="input" style={{ width: "100%" }} value={fieldValues[f.key] ?? ""} onChange={(e) => setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                <option value="">Select...</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input className="input" style={{ width: "100%" }} value={fieldValues[f.key] ?? ""} onChange={(e) => setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))} />
            )}
          </div>
        ))}

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">File</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button className="button" type="button" disabled={uploading} onClick={submit}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "360px" }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10">
              <tr>
                {schema.fields.map((f) => (
                  <th key={f.key} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={schema.fields.length} className="px-4 py-10 text-center text-text-muted text-sm">No uploads yet.</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                  {schema.fields.map((f) => (
                    <td key={f.key} className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {f.type === "date" && row[f.key] ? new Date(String(row[f.key])).toLocaleDateString() : String(row[f.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
