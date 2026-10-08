"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type LegacyUploadResult, type UploadGenCol, type ProductReference } from "@/lib/api-client";

// Round 58 -- exact legacy (sanpharma.info) upload pages: light-blue dotted background, purple Verdana header lines,
// purple bold underlined title, white bordered box. Wording is the legacy wording; every action calls the real backend.

const PURPLE = "#8a2be2";
const FONT = "Verdana, Arial, sans-serif";
const COMPANY = "Zivira Labs Pvt Ltd";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pageBg: CSSProperties = {
  backgroundColor: "#e8f3fb",
  backgroundImage: "radial-gradient(#c5dcee 1px, transparent 1px)",
  backgroundSize: "4px 4px",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 14,
  color: "#000",
  minHeight: "70vh",
  padding: "6px 10px 40px"
};
const btn: CSSProperties = { border: "1px solid #767676", background: "#efefef", borderRadius: 3, padding: "1px 7px", fontSize: 14, color: "#000", cursor: "pointer" };
const btnOff: CSSProperties = { ...btn, color: "#9a9a9a", borderColor: "#c7c7c7", background: "#f3f3f3", cursor: "default" };
const tanBtn: CSSProperties = { border: "2px outset #deb887", background: "#deb887", padding: "1px 10px", fontSize: 18, color: "#000", cursor: "pointer" };
const link: CSSProperties = { color: "#0000ee", textDecoration: "underline", cursor: "pointer", background: "none", border: 0, padding: 0, font: "inherit" };
const redLink: CSSProperties = { ...link, color: "#e00000" };
const box: CSSProperties = { background: "#fff", border: "1px solid #000", margin: "0 auto" };
const noteBox: CSSProperties = { border: "1px solid #000", margin: "0 6px", padding: "4px 0 4px 100px", fontSize: 13 };

function Shell({ title, back, backgroundWhite, children }: { title: string; back?: "teal"; backgroundWhite?: boolean; children: ReactNode }) {
  const router = useRouter();
  return (
    <div style={pageBg}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: "bold", fontSize: 16, color: PURPLE, padding: "4px 0 10px" }}>
        <span>Welcome Corporate HQ</span>
        <span style={{ flex: 1, textAlign: "center" }}>{COMPANY}</span>
      </div>
      {back && (
        <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 30 }}>
          <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/admin/home"))} style={{ background: "#9dd6dc", border: "2px outset #8ccad1", padding: "2px 14px", fontSize: 14, cursor: "pointer" }}>Back</button>
        </div>
      )}
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: "bold", fontSize: 18, color: PURPLE, textDecoration: "underline", margin: "8px 0 28px" }}>{title}</div>
      <div style={backgroundWhite ? { background: "#fff", padding: "6px 0 24px" } : undefined}>{children}</div>
    </div>
  );
}

function b64Download(base64: string, fileName: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function Result({ r, err }: { r: LegacyUploadResult | null; err: string }) {
  if (err) return <div style={{ color: "#e00000", textAlign: "center", margin: "10px 0", fontWeight: "bold" }}>{err}</div>;
  if (!r) return null;
  const good = r.uploaded && r.failed === 0;
  const counts = [
    r.inserted ? `${r.inserted} inserted` : "", r.updated ? `${r.updated} updated` : "", r.skipped ? `${r.skipped} already existed (skipped)` : "",
    r.deactivated ? `${r.deactivated} deactivated` : "", r.failed ? `${r.failed} not uploaded` : ""
  ].filter(Boolean).join(", ");
  return (
    <div style={{ textAlign: "center", margin: "12px 12px 4px", fontSize: 13 }}>
      <div style={{ fontWeight: "bold", color: good ? "#067a06" : "#e00000", fontSize: 15 }}>{r.outcome}</div>
      {r.fileErrors.length > 0 && r.fileErrors.slice(1).map((m, i) => <div key={i} style={{ color: "#e00000" }}>{m}</div>)}
      {counts && !r.fileErrors.length && <div>{`${r.fileName}: ${r.total} row(s) read - ${counts}`}</div>}
      {r.errors.length > 0 && (
        <div style={{ color: "#e00000", marginTop: 4 }}>
          {r.errors.slice(0, 8).map((e, i) => <div key={i}>{`Row ${e.row}${e.field ? ` - ${e.field}` : ""}: ${e.reason}`}</div>)}
          {r.errors.length > 8 && <div>{`... and ${r.errors.length - 8} more (see the Not Uploaded List)`}</div>}
        </div>
      )}
      {r.warnings.length > 0 && (
        <div style={{ color: "#8a5a00", marginTop: 4 }}>
          {r.warnings.slice(0, 5).map((w, i) => <div key={i}>{`Row ${w.row}: ${w.reason}`}</div>)}
          {r.warnings.length > 5 && <div>{`... and ${r.warnings.length - 5} more warnings`}</div>}
        </div>
      )}
      {r.notUploaded && <div style={{ marginTop: 6 }}><button type="button" style={link} onClick={() => b64Download(r.notUploaded!.base64, r.notUploaded!.fileName)}>Not Uploaded List</button></div>}
    </div>
  );
}

function useUploader(toolKey: string) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LegacyUploadResult | null>(null);
  const [err, setErr] = useState("");
  const submit = useCallback(async (fields: Record<string, string> = {}) => {
    if (!file) { setErr("Choose the Excel file first"); return; }
    setBusy(true); setErr(""); setResult(null);
    try {
      const r = await apiClient.legacyUploadImport(toolKey, file, fields);
      setResult(r);
      if (r.uploaded) { setFile(null); setFileKey((k) => k + 1); }
    } catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  }, [file, toolKey]);
  const chooser = (disabled = false) => (
    <input key={fileKey} type="file" accept=".xlsx,.xls" disabled={disabled} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setErr(""); }} />
  );
  return { file, busy, result, err, submit, chooser };
}

function download(promise: Promise<unknown>, setErr: (m: string) => void) {
  promise.catch((e) => setErr(e instanceof Error ? e.message : "Download failed"));
}

const sheetOf = (key: string) => ({ "field-force": "UPL_SalesForce", stockist: "UPL_Stockist_Master", product: "UPL_Product_Master", "holiday-fixation": "UPL_Holiday_Fixation", "leave-bulk-upload": "Leave_Upload", sample: "Upl_Despatch_Master", input: "Upl_Despatch_Master", target: "Upl_Target_Master", "product-rate": "UPL_Product_Rate" } as Record<string, string>)[key] ?? key;

// ---------------------------------------------------------------- Listed Doctor / Chemists (checkbox grid + Generate Excel)
const GEN_META: Record<string, { title: string; ref: string; deactivate: string; storeKey: string; back?: boolean; redMandatory: boolean; wide: boolean }> = {
  "listed-doctor": { title: "Listed Doctor Upload Tool", ref: "Speciality / Category", deactivate: "Deactivate Existing Doctor List ( if Yes then Check this Option )", storeKey: "r58.gen.listed-doctor", redMandatory: true, wide: true },
  chemist: { title: "Chemists Upload Tool", ref: "Category / Class", deactivate: "Deactivate Existing Chemist List ( if Yes then Check this Option )", storeKey: "r58.gen.chemist", back: true, redMandatory: false, wide: false }
};

function GeneratePage({ toolKey }: { toolKey: "listed-doctor" | "chemist" }) {
  const meta = GEN_META[toolKey];
  const up = useUploader(toolKey);
  const [cols, setCols] = useState<UploadGenCol[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<string[] | null>(null);   // the columns of the Excel generated earlier (kept in this browser only)
  const [deactivate, setDeactivate] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    apiClient.uploadToolColumns(toolKey).then((c) => {
      setCols(c);
      setPicked(new Set(c.filter((x) => x.mandatory).map((x) => x.label)));
    }).catch((e) => setLoadErr(e instanceof Error ? e.message : "Could not load the column list"));
    try { const s = window.localStorage.getItem(meta.storeKey); if (s) setGenerated(JSON.parse(s) as string[]); } catch { /* storage unavailable */ }
  }, [toolKey, meta.storeKey]);

  const fileName = `${meta.title.replace(/\s+/g, "_")}.xlsx`;
  const generate = async () => {
    setMsg("");
    try {
      const labels = cols.filter((c) => c.mandatory || picked.has(c.label)).map((c) => c.label);
      await apiClient.uploadToolGenerate(toolKey, labels, fileName);
      setGenerated(labels);
      try { window.localStorage.setItem(meta.storeKey, JSON.stringify(labels)); } catch { /* ignore */ }
    } catch (e) { setMsg(e instanceof Error ? e.message : "Could not generate the Excel file"); }
  };
  const reset = () => {
    setGenerated(null);
    try { window.localStorage.removeItem(meta.storeKey); } catch { /* ignore */ }
    setPicked(new Set(cols.filter((x) => x.mandatory).map((x) => x.label)));
  };
  const downloadHere = () => {
    if (generated) download(apiClient.uploadToolGenerate(toolKey, generated, fileName), setMsg);
    else download(apiClient.uploadToolTemplate(toolKey, {}, fileName), setMsg);
  };
  const perRow = meta.wide ? 6 : 6;

  return (
    <Shell title={meta.title} back={meta.back ? "teal" : undefined} backgroundWhite={!meta.wide}>
      <div style={meta.wide ? { ...box, maxWidth: 1536, width: "calc(100% - 20px)", padding: "6px 0 8px" } : { padding: "0 0 4px" }}>
        <div style={{ textAlign: "center", fontSize: 15 }}>{meta.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0 6px", padding: "0 150px", fontSize: 18 }}>
          <button type="button" style={{ ...redLink, fontSize: 18 }} onClick={() => setMsg(`${meta.ref}: the allowed values are taken from your Speciality / Category (and Class) masters.`)}>{meta.ref}</button>
          <button type="button" style={{ ...redLink, fontSize: 18 }} onClick={() => setMsg("Video help is not available in this installation.")}>? Video Help</button>
        </div>
        <div style={{ padding: "0 0 0 156px", fontFamily: FONT, fontWeight: "bold", fontSize: 14, color: "#555", margin: "10px 0 8px" }}>Select the Parameter to Upload</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${perRow}, auto)`, justifyContent: "center", gap: "5px 8px", padding: "0 10px", fontSize: 15 }}>
          {cols.map((c) => (
            <label key={c.label} style={{ display: "flex", alignItems: "center", gap: 4, color: c.mandatory && meta.redMandatory ? "#e00000" : "#000", fontWeight: c.mandatory && meta.redMandatory ? "bold" : "normal" }}>
              <input type="checkbox" checked={c.mandatory || picked.has(c.label)} disabled={c.mandatory || !!generated}
                onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(c.label); else n.delete(c.label); return n; })} />
              {c.label}
            </label>
          ))}
        </div>
        {loadErr && <div style={{ color: "#e00000", textAlign: "center" }}>{loadErr}</div>}
        <div style={{ textAlign: "center", margin: "24px 0 16px" }}>
          <button type="button" style={generated ? btnOff : { ...btn, fontSize: 16, padding: "3px 16px" }} disabled={!!generated || !cols.length} onClick={generate}>Generate Excel</button>
          <span style={{ marginLeft: 14, fontSize: 15 }}>
            {generated ? <button type="button" style={link} onClick={reset}>Delete and Generate New Excel</button> : <span style={{ color: "#8a8a8a" }}>Delete and Generate New Excel</span>}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, margin: "8px 0" }}>
          <span>Excel file&nbsp;&nbsp; {up.chooser(!generated)}</span>
          <label style={{ color: "#e00000", fontFamily: FONT, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={deactivate} onChange={(e) => setDeactivate(e.target.checked)} />
            {meta.deactivate}
          </label>
        </div>
        <div style={{ textAlign: "center", margin: "16px 0 6px" }}>
          <button type="button" style={generated && up.file && !up.busy ? { ...btn, fontSize: 16, padding: "2px 8px" } : { ...btnOff, fontSize: 16, padding: "2px 8px" }} disabled={!generated || !up.file || up.busy} onClick={() => up.submit(deactivate ? { deactivate: "true" } : {})}>{up.busy ? "Uploading..." : "Upload"}</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 15 }}>Excel Format File <button type="button" style={generated ? link : { ...link, color: "#8a8a8a", textDecoration: "none", cursor: "default" }} disabled={!generated} onClick={downloadHere}>Download Here</button></div>
        {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
        <Result r={up.result} err={up.err} />
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- Sample / Input Despatch
function DespatchPage({ toolKey }: { toolKey: "sample" | "input" }) {
  const isSample = toolKey === "sample";
  const up = useUploader(toolKey);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [mode, setMode] = useState<"insert" | "overwrite">("insert");
  const [msg, setMsg] = useState("");
  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const label = isSample ? "Sample" : "Input";
  const items = [
    `Click the "Download Here" link in the Screen and Download the Excel file for "${label} - Upload".`,
    'After Downloading the Excel, the Mandatory Field is marked as "Yellow" Color in the Relevant Column.',
    isSample ? "The User has to Fill the Employee ID, Sample ERP Code and Despatch Qty (Qty. will be Numeric)." : "The User has to Fill the Employee ID, Input Code and Input Qty (Qty. will be Numeric).",
    isSample ? 'Employee Code is Available in the "Field Force Master" and Sample ERP Code is Available in the "Product Master".' : 'Employee Code is Available in the "Field Force Master" and Input Code is Available in the "Input Master".',
    isSample ? "The User should Upload the samples on Monthwise. For Single Month Multiple times also can Upload." : 'The User should Upload the "Inputs / Gifts / Product Reminders" on Monthwise. For Single Month Multiple times also can Upload.',
    'For the Particular Month, if User want to Upload again for overwriting the Existing Records, kindly select the Mode as "Overwrite with Existing Records".',
    'For the Particular Month, if User want to Update Extra Records without disturbing the Previous Records, Kindly Select the Mode as "Only Insert".'
  ];
  return (
    <Shell title={isSample ? "Sample Despatch Upload" : "Input Despatch Upload"}>
      <div style={{ ...box, width: 1026, maxWidth: "100%", height: 436, position: "relative" }}>
        <table style={{ position: "absolute", left: 262, top: 58, fontSize: 13, borderSpacing: 0 }}>
          <tbody>
            <tr><td style={{ paddingRight: 8 }}><span style={{ color: "#e00000" }}>*</span>Month</td><td>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 125, height: 28, fontSize: 12 }}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></td></tr>
            <tr><td><span style={{ color: "#e00000" }}>*</span> Year</td><td>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 125, fontSize: 15 }}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></td></tr>
            <tr><td><span style={{ color: "#e00000" }}>*</span>Excel file</td><td style={{ fontSize: 15 }}>{up.chooser()}</td></tr>
            <tr><td /><td style={{ fontSize: 15, paddingTop: 6 }}>
              <label><input type="radio" name={`mode-${toolKey}`} checked={mode === "overwrite"} onChange={() => setMode("overwrite")} /> OverWite with Existing Records</label>{" "}
              <label><input type="radio" name={`mode-${toolKey}`} checked={mode === "insert"} onChange={() => setMode("insert")} /> Only Insert</label></td></tr>
          </tbody>
        </table>
        <div style={{ position: "absolute", left: 0, right: 0, top: isSample ? 284 : 322, textAlign: "center" }}>
          <button type="button" style={{ ...btn, fontSize: 16, padding: "3px 8px" }} disabled={up.busy} onClick={() => up.submit({ month: String(month), year: String(year), mode })}>{up.busy ? "Uploading..." : "Upload"}</button>
        </div>
        {isSample && <div style={{ position: "absolute", left: 6, top: 340, fontSize: 15 }}><span style={{ color: "#e00000" }}>Note: </span>&nbsp;1) Sheet Name Must be 'Upl_Despatch_Master'</div>}
        <div style={{ position: "absolute", left: 32, top: isSample ? 388 : 380, fontSize: 15 }}>Excel Format File <button type="button" style={link} onClick={() => download(apiClient.uploadToolTemplate(toolKey, { month: String(month), year: String(year) }, "Upl_Despatch_Master.xlsx"), setMsg)}>Download Here</button></div>
      </div>
      {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
      <Result r={up.result} err={up.err} />
      <Instructions heading={`${label} Upload Instruction`} items={items} />
    </Shell>
  );
}

function Instructions({ heading, items, nums }: { heading: string; items: string[]; nums?: string[] }) {
  return (
    <div style={{ margin: "56px 0 0 18px", fontSize: 15, lineHeight: "27px" }}>
      <div><span style={link}>{heading}</span></div>
      {items.map((t, i) => <div key={i} style={{ display: "flex" }}><span style={{ width: 28, flexShrink: 0, paddingLeft: 10 }}>{(nums ? nums[i] : String(i + 1)) + "."}</span><span>{t}</span></div>)}
    </div>
  );
}

// ---------------------------------------------------------------- Target Upload
function TargetPage() {
  const up = useUploader("target");
  const now = new Date();
  const curFy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;   // financial year April - March
  const [fy, setFy] = useState(curFy);
  const [msg, setMsg] = useState("");
  const fys = [curFy - 2, curFy - 1, curFy, curFy + 1];
  const items = [
    'Click the "Download Here" link in the Screen and Download the Excel file for "Target - Upload".',
    'After Downloading the Excel, the Mandatory Field is marked as "Yellow" Color in the Relevant Column.',
    "The User has to Fill the HQ Code, Sale ERP Code, Month,Target Qty,Target Rate and Target Value (Qty/Rate/Value will be Numeric).",
    'HQ Code is Available in the "Field Force Master" and Sale ERP Code is Available in the "Product Master".',
    "The User should Upload the Targets on Financial Year wise.If user wants to upload in betweeen for a single month then he has to upload all records for the particular Financial Year once again.",
    'Wrong Uploaded Records are downloaded with the link of "Not Uploaded List" in the Bottom of the Screen.',
    'If all the Filled Records are Perfect in the Excel File, then only Upload will happen on a "Successful" basis.'
  ];
  return (
    <Shell title="Target Upload">
      <div style={{ ...box, width: 1026, maxWidth: "100%", height: 436, position: "relative" }}>
        <table style={{ position: "absolute", left: 262, top: 90, fontSize: 13, borderSpacing: 0 }}>
          <tbody>
            <tr><td style={{ paddingRight: 52 }}><span style={{ color: "#e00000" }}>*</span>Year</td><td>
              <select value={fy} onChange={(e) => setFy(Number(e.target.value))} style={{ fontSize: 15 }}>{fys.map((y) => <option key={y} value={y}>{`${y} - ${y + 1}`}</option>)}</select></td></tr>
            <tr><td><span style={{ color: "#e00000" }}>*</span>Excel file</td><td style={{ fontSize: 15 }}>{up.chooser()}</td></tr>
          </tbody>
        </table>
        <div style={{ position: "absolute", left: 0, right: 0, top: 274, textAlign: "center" }}>
          <button type="button" style={{ ...btn, fontSize: 16, padding: "3px 8px" }} disabled={up.busy} onClick={() => up.submit({ fy: String(fy) })}>{up.busy ? "Uploading..." : "Upload"}</button>
        </div>
        <div style={{ position: "absolute", left: 32, top: 360, fontSize: 15 }}>Excel Format File <button type="button" style={link} onClick={() => download(apiClient.uploadToolTemplate("target", { fy: String(fy) }, "Upl_Target_Master.xlsx"), setMsg)}>Download Here</button></div>
      </div>
      {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
      <Result r={up.result} err={up.err} />
      <Instructions heading="Target Upload Instruction" items={items} nums={["1", "2", "2", "3", "4", "7", "6"]} />
    </Shell>
  );
}

// ---------------------------------------------------------------- Salesforce / Stockist / Product / Leave (file + tan Upload + boxed Note)
type SimpleCfg = { title: string; width: number; deactivate?: string; notes: string[]; back?: boolean; leave?: boolean; product?: boolean };
const SIMPLE: Record<string, SimpleCfg> = {
  "field-force": { title: "Salesforce Upload", width: 654, deactivate: "Deactivate Existing Field Force List ( if Yes then Check this Option )", notes: ["Sheet Name Must be 'UPL_SalesForce'"] },
  stockist: { title: "Stockist Upload", width: 528, notes: ["Sheet Name Must be 'UPL_Stockist_Master'"] },
  product: { title: "Product Upload", width: 1040, deactivate: "Deactivate Existing Product List ( if Yes then Check this Option )", notes: ["Sheet Name Must be 'UPL_Product_Master'", "Group, Category, Brand Name Must be Match Our Website", "Don't Do Any Special Formats in the Excel File"], product: true },
  "leave-bulk-upload": { title: "Leave Upload", width: 1036, notes: ["Sheet Name Must be 'Leave_Upload'"], back: true, leave: true }
};

function SimplePage({ toolKey }: { toolKey: string }) {
  const cfg = SIMPLE[toolKey];
  const up = useUploader(toolKey);
  const now = new Date();
  const [deactivate, setDeactivate] = useState(false);
  const [msg, setMsg] = useState("");
  const [fy, setFy] = useState(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1);
  const [ref, setRef] = useState<ProductReference | null>(null);
  useEffect(() => { if (cfg.product) apiClient.productUploadReference().then(setRef).catch((e) => setMsg(e instanceof Error ? e.message : "Could not load the reference lists")); }, [cfg.product]);
  const fields = (): Record<string, string> => ({ ...(deactivate ? { deactivate: "true" } : {}), ...(cfg.leave ? { fy: String(fy) } : {}) });
  const uploadBtn = <button type="button" style={tanBtn} disabled={up.busy} onClick={() => up.submit(fields())}>{up.busy ? "Uploading..." : "Upload"}</button>;
  const dl = <span style={{ fontSize: 15 }}>Excel Format File <button type="button" style={{ ...link, fontSize: 14 }} onClick={() => download(apiClient.uploadToolTemplate(toolKey, {}, `${sheetOf(toolKey)}.xlsx`), setMsg)}>Download Here</button></span>;
  const note = (
    <div style={{ ...noteBox, paddingLeft: cfg.product ? 100 : 100 }}>
      <div style={{ color: "#e00000", fontSize: 15 }}>Note:</div>
      {cfg.notes.map((n, i) => <div key={i} style={{ lineHeight: "25px" }}>{`${i + 1}) ${n}`}</div>)}
    </div>
  );
  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const form = (
    <div style={{ ...box, width: cfg.width, maxWidth: "100%", padding: "0 0 12px", margin: cfg.product ? "0 0 0 160px" : "0 auto" }}>
      {cfg.leave && (
        <div style={{ fontSize: 13, textAlign: "center", padding: "48px 0 0 0" }}>
          Financial Year&nbsp;&nbsp;
          <select value={fy} onChange={(e) => setFy(Number(e.target.value))} style={{ width: 187, height: 30, fontSize: 12 }}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      )}
      <div style={{ fontSize: 13, textAlign: cfg.product ? "left" : "center", padding: cfg.product ? "4px 0 0 100px" : cfg.leave ? "4px 0 0" : "2px 0 0" }}>
        Excel file&nbsp; <span style={{ fontSize: 15 }}>{up.chooser()}</span>
      </div>
      {cfg.deactivate && (
        <div style={{ color: "#e00000", fontFamily: FONT, fontSize: 14, padding: cfg.product ? "4px 0 0 100px" : "4px 0 0 110px" }}>
          <label><input type="checkbox" checked={deactivate} onChange={(e) => setDeactivate(e.target.checked)} />{cfg.deactivate}</label>
        </div>
      )}
      <div style={{ textAlign: "center", margin: "6px 0 28px" }}>{uploadBtn}</div>
      {note}
      <div style={{ textAlign: "center", margin: "34px 0 0" }}>{dl}</div>
      {cfg.leave && <div style={{ height: 120 }} />}
    </div>
  );
  return (
    <Shell title={cfg.title} back={cfg.back ? "teal" : undefined}>
      {cfg.product ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          {form}
          <div style={{ display: "flex", gap: 6, marginRight: 100 }}>
            <RefTable head="Category" rows={ref?.categories ?? []} />
            <RefTable head="Group" rows={ref?.groups ?? []} />
            <RefTable head="Brand" rows={ref?.brands ?? []} />
          </div>
        </div>
      ) : form}
      {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
      <Result r={up.result} err={up.err} />
    </Shell>
  );
}

function RefTable({ head, rows }: { head: string; rows: string[] }) {
  const cell: CSSProperties = { border: "1px solid #000", background: "#fff", padding: "4px 3px", fontSize: 14, textTransform: "uppercase" };
  return (
    <table style={{ borderCollapse: "collapse", alignSelf: "flex-start", minWidth: 150 }}>
      <thead><tr><th style={{ ...cell, textAlign: "left", fontSize: 18, textTransform: "none" }}>{head}</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r}><td style={{ ...cell, textTransform: "none" }}>{r}</td></tr>)}</tbody>
    </table>
  );
}

// ---------------------------------------------------------------- Product Rate
function ProductRatePage() {
  const up = useUploader("product-rate");
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    apiClient.productRateStates().then((s) => { setStates(s.states); setState(s.default); }).catch((e) => setMsg(e instanceof Error ? e.message : "Could not load the states"));
  }, []);
  return (
    <div style={pageBg}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: "bold", fontSize: 16, color: PURPLE, padding: "4px 0 10px" }}>
        <span>Welcome Corporate HQ</span><span style={{ flex: 1, textAlign: "center" }}>{COMPANY}</span>
      </div>
      <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
        <span style={{ fontFamily: FONT, fontWeight: "bold", fontSize: 18, color: "#fff", background: "#316ac5", textDecoration: "underline", padding: "0 1px" }}>Product Rate</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 13 }}>
        <span style={{ color: "#e00000" }}>*</span>State Name&nbsp;&nbsp;&nbsp;&nbsp;
        <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: 150, height: 30, fontSize: 12 }}>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <div style={{ textAlign: "center", margin: "22px 0 18px", fontSize: 17 }}>
        <button type="button" style={{ ...redLink, fontSize: 17 }} onClick={() => state ? download(apiClient.uploadToolTemplate("product-rate", { state }, `Product_Rate_${state.replace(/\W+/g, "_")}.xlsx`), setMsg) : setMsg("Select the State Name first")}>Download Link</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 15 }}>{up.chooser()}</div>
      <div style={{ textAlign: "center", margin: "18px 0" }}>
        <button type="button" style={{ border: "2px outset #9fc5d0", background: "#a6cfda", padding: "1px 10px", fontSize: 18, cursor: "pointer" }} disabled={up.busy} onClick={() => state ? up.submit({ state }) : setMsg("Select the State Name first")}>{up.busy ? "Uploading..." : "Upload"}</button>
      </div>
      {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
      <Result r={up.result} err={up.err} />
    </div>
  );
}

// ---------------------------------------------------------------- Holiday Fixation Bulk Upload
function HolidayPage() {
  const up = useUploader("holiday-fixation");
  const [msg, setMsg] = useState("");
  return (
    <Shell title="Holiday Fixation Bulk Upload">
      <div style={{ background: "#fff", margin: "0 auto", maxWidth: 1424, padding: "6px 18px 20px", fontSize: 15, lineHeight: "25px" }}>
        <div>Note:</div>
        <div>1) Sheet Name Must be 'UPL_Holiday_Fixation'</div>
        <div>2) Date Format Must be in 'YYYY-MM-DD' Format</div>
        <div>3) Don't Do Any Special Formats in the Excel File</div>
        <div>Excel Format File <button type="button" style={{ ...link, fontSize: 14 }} onClick={() => download(apiClient.uploadToolTemplate("holiday-fixation", {}, "UPL_Holiday_Fixation.xlsx"), setMsg)}>Download Here</button></div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 100, marginTop: 24 }}>
          <span>{up.chooser()}</span>
          <button type="button" style={{ background: "#007bff", color: "#fff", border: "1px solid #007bff", borderRadius: 4, padding: "6px 12px", fontSize: 16, cursor: "pointer" }} disabled={up.busy} onClick={() => up.submit()}>{up.busy ? "Processing..." : "Process"}</button>
        </div>
      </div>
      {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0" }}>{msg}</div>}
      <Result r={up.result} err={up.err} />
    </Shell>
  );
}

export function LegacyUploadPage({ toolKey }: { toolKey: string }) {
  switch (toolKey) {
    case "listed-doctor": case "chemist": return <GeneratePage toolKey={toolKey} />;
    case "sample": case "input": return <DespatchPage toolKey={toolKey} />;
    case "target": return <TargetPage />;
    case "product-rate": return <ProductRatePage />;
    case "holiday-fixation": return <HolidayPage />;
    default: return <SimplePage toolKey={toolKey} />;
  }
}
