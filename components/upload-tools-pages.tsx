"use client";

import { useEffect, useState } from "react";
import { apiClient, type ProductReference } from "@/lib/api-client";
import { useUploader, download } from "@/components/legacy-upload-pages";
import { UploadFrame, StatusLine, UploadHistory, Instructions, NoteBox, smallNote, bOrange, bOrangeOff, bPrimary, bLink, bRedLink, req, RED } from "@/components/upload-kit";

// Round 62 -- the legacy upload pages (Sample / Input Despatch, Target, Salesforce, Stockist, Product, Product Rate, Holiday, Leave) on the shared kit:
// page content only (no copied legacy banner / logo / nav), blue / orange buttons, one status line + the persisted Upload History.
// Wording and field order are the legacy ones; every button calls the real backend.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const nowYear = () => new Date().getFullYear();
const curFy = () => { const n = new Date(); return n.getMonth() >= 3 ? n.getFullYear() : n.getFullYear() - 1; };   // financial year April - March

function UploadButton({ up, label = "Upload", onClick }: { up: ReturnType<typeof useUploader>; label?: string; onClick: () => void }) {
  return <button type="button" style={up.busy ? bOrangeOff : bOrange} disabled={up.busy} onClick={onClick}>{up.busy ? "Uploading..." : label}</button>;
}
function DownloadHere({ label = "Excel Format File", onClick }: { label?: string; onClick: () => void }) {
  return <div style={{ textAlign: "center", marginTop: 16 }}>{label} <button type="button" style={bLink} onClick={onClick}>Download Here</button></div>;
}
const Err = ({ msg }: { msg: string }) => (msg ? <div style={{ textAlign: "center", color: RED, margin: "8px 0", fontSize: 14 }}>{msg}</div> : null);

// ---------------------------------------------------------------- Sample / Input Despatch
export function DespatchUploadPage({ toolKey }: { toolKey: "sample" | "input" }) {
  const isSample = toolKey === "sample";
  const up = useUploader(toolKey);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [mode, setMode] = useState<"insert" | "overwrite">("insert");
  const [msg, setMsg] = useState("");
  const years = [nowYear() - 2, nowYear() - 1, nowYear(), nowYear() + 1];
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
    <UploadFrame title={isSample ? "Sample Despatch Upload" : "Input Despatch Upload"}>
      <div className="ut-box">
        <div className="ut-row"><span className="ut-lbl">{req}Month</span><select value={month} onChange={(e) => setMonth(Number(e.target.value))}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></div>
        <div className="ut-row"><span className="ut-lbl">{req}Year</span><select value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
        <div className="ut-row"><span className="ut-lbl">{req}Excel file</span><span style={{ minWidth: 190 }}>{up.chooser()}</span></div>
        <div className="ut-row">
          <label className="ut-opt"><input type="radio" name={`mode-${toolKey}`} checked={mode === "overwrite"} onChange={() => setMode("overwrite")} />OverWite with Existing Records</label>
          <label className="ut-opt"><input type="radio" name={`mode-${toolKey}`} checked={mode === "insert"} onChange={() => setMode("insert")} />Only Insert</label>
        </div>
        <div className="ut-row"><UploadButton up={up} onClick={() => up.submit({ month: String(month), year: String(year), mode })} /></div>
        {isSample && <div style={{ textAlign: "left", maxWidth: 640, margin: "6px auto 0" }}><span style={{ color: RED }}>Note: </span>&nbsp;1) Sheet Name Must be &apos;Upl_Despatch_Master&apos;</div>}
        <DownloadHere onClick={() => download(apiClient.uploadToolTemplate(toolKey, { month: String(month), year: String(year) }, "Upl_Despatch_Master.xlsx"), setMsg)} />
        <Err msg={msg} />
      </div>
      <StatusLine r={up.result} err={up.err} extra={up.result && up.result.skipped > 0 ? <div style={smallNote}>{up.result.skipped} existing line(s) were left untouched (Only Insert).</div> : null} />
      <UploadHistory toolKey={toolKey} refresh={up.result ?? up.err} />
      <Instructions heading={`${label} Upload Instruction`} items={items} />
    </UploadFrame>
  );
}

// ---------------------------------------------------------------- Target
export function TargetUploadPage() {
  const up = useUploader("target");
  const [fy, setFy] = useState(curFy());
  const [msg, setMsg] = useState("");
  const fys = [curFy() - 2, curFy() - 1, curFy(), curFy() + 1];
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
    <UploadFrame title="Target Upload">
      <div className="ut-box">
        <div className="ut-row"><span className="ut-lbl">{req}Year</span><select value={fy} onChange={(e) => setFy(Number(e.target.value))}>{fys.map((y) => <option key={y} value={y}>{`${y} - ${y + 1}`}</option>)}</select></div>
        <div className="ut-row"><span className="ut-lbl">{req}Excel file</span><span style={{ minWidth: 190 }}>{up.chooser()}</span></div>
        <div className="ut-row" style={{ marginTop: 18 }}><UploadButton up={up} onClick={() => up.submit({ fy: String(fy) })} /></div>
        <DownloadHere onClick={() => download(apiClient.uploadToolTemplate("target", { fy: String(fy) }, "Upl_Target_Master.xlsx"), setMsg)} />
        <Err msg={msg} />
      </div>
      <StatusLine r={up.result} err={up.err} />
      <UploadHistory toolKey="target" refresh={up.result ?? up.err} />
      <Instructions heading="Target Upload Instruction" items={items} nums={["1", "2", "2", "3", "4", "7", "6"]} />
    </UploadFrame>
  );
}

// ---------------------------------------------------------------- Salesforce / Stockist / Product / Leave
type SimpleCfg = { title: string; deactivate?: string; notes: string[]; back?: boolean; leave?: boolean; product?: boolean; sheet: string };
const SIMPLE: Record<string, SimpleCfg> = {
  "field-force": { title: "Salesforce Upload", sheet: "UPL_SalesForce", deactivate: "Deactivate Existing Field Force List ( if Yes then Check this Option )", notes: ["Sheet Name Must be 'UPL_SalesForce'"] },
  stockist: { title: "Stockist Upload", sheet: "UPL_Stockist_Master", notes: ["Sheet Name Must be 'UPL_Stockist_Master'"] },
  product: { title: "Product Upload", sheet: "UPL_Product_Master", deactivate: "Deactivate Existing Product List ( if Yes then Check this Option )", notes: ["Sheet Name Must be 'UPL_Product_Master'", "Group, Category, Brand Name Must be Match Our Website", "Don't Do Any Special Formats in the Excel File"], product: true },
  "leave-bulk-upload": { title: "Leave Upload", sheet: "Leave_Upload", notes: ["Sheet Name Must be 'Leave_Upload'"], back: true, leave: true }
};

export function SimpleUploadPage({ toolKey }: { toolKey: "field-force" | "stockist" | "product" | "leave-bulk-upload" }) {
  const cfg = SIMPLE[toolKey];
  const up = useUploader(toolKey);
  const [deactivate, setDeactivate] = useState(false);
  const [msg, setMsg] = useState("");
  const [fy, setFy] = useState(curFy());
  const [ref, setRef] = useState<ProductReference | null>(null);
  useEffect(() => { if (cfg.product) apiClient.productUploadReference().then(setRef).catch((e) => setMsg(e instanceof Error ? e.message : "Could not load the reference lists")); }, [cfg.product]);
  const fields = (): Record<string, string> => ({ ...(deactivate ? { deactivate: "true" } : {}), ...(cfg.leave ? { fy: String(fy) } : {}) });
  const years = [nowYear() - 2, nowYear() - 1, nowYear(), nowYear() + 1];
  const r = up.result;
  const made = r?.autoCreatedManagers ?? [], merged = r?.mergedManagers ?? [];
  const form = (
    <div className="ut-box" style={{ flex: cfg.product ? "1 1 520px" : undefined, maxWidth: cfg.product ? 640 : 760, margin: cfg.product ? 0 : "0 auto" }}>
      {cfg.leave && <div className="ut-row"><span className="ut-lbl">Financial Year</span><select value={fy} onChange={(e) => setFy(Number(e.target.value))}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>}
      <div className="ut-row"><span className="ut-lbl" style={{ minWidth: 70 }}>Excel file</span><span style={{ minWidth: 190 }}>{up.chooser()}</span></div>
      {cfg.deactivate && (
        <div className="ut-row"><label className="ut-opt" style={{ color: RED }}><input type="checkbox" checked={deactivate} onChange={(e) => setDeactivate(e.target.checked)} />{cfg.deactivate}</label></div>
      )}
      <div className="ut-row"><UploadButton up={up} onClick={() => up.submit(fields())} /></div>
      <NoteBox lines={cfg.notes} />
      <DownloadHere onClick={() => download(apiClient.uploadToolTemplate(toolKey, {}, `${cfg.sheet}.xlsx`), setMsg)} />
      <Err msg={msg} />
    </div>
  );
  const extra = (made.length > 0 || merged.length > 0) ? (
    <div style={smallNote}>
      {made.length > 0 && <div>{made.length} manager(s) auto-created, code pending ({made.map((m) => `${m.code} ${m.name}`).join("; ")}). Complete their real codes in the Field Force master.</div>}
      {merged.length > 0 && <div>{merged.length} pending manager(s) completed by this file ({merged.map((m) => `${m.name} -> ${m.code}`).join("; ")}).</div>}
    </div>
  ) : null;
  return (
    <UploadFrame title={cfg.title} back={cfg.back}>
      {cfg.product ? (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", maxWidth: 1100, margin: "0 auto" }}>
          {form}
          <div style={{ flex: "1 1 420px" }}>
            <div className="ut-ref">
              <RefTable head="Category" rows={ref?.categories ?? []} /><RefTable head="Group" rows={ref?.groups ?? []} /><RefTable head="Brand" rows={ref?.brands ?? []} />
            </div>
            {ref?.sources && Object.values(ref.sources).some((x) => x !== "product-master") && (
              <div style={{ ...smallNote, textAlign: "center" }}>{`Lists taken from the legacy defaults because your product master has no values for: ${(["categories", "groups", "brands"] as const).filter((k) => ref.sources![k] !== "product-master").join(", ")}.`}</div>
            )}
          </div>
        </div>
      ) : form}
      <StatusLine r={r} err={up.err} extra={extra} />
      <UploadHistory toolKey={toolKey} refresh={up.result ?? up.err} />
    </UploadFrame>
  );
}

function RefTable({ head, rows }: { head: string; rows: string[] }) {
  return (
    <table>
      <thead><tr><th>{head}</th></tr></thead>
      <tbody>{rows.length === 0 ? <tr><td style={{ color: "#6b7280" }}>None</td></tr> : rows.map((x) => <tr key={x}><td>{x}</td></tr>)}</tbody>
    </table>
  );
}

// ---------------------------------------------------------------- Product Rate
export function ProductRateUploadPage() {
  const up = useUploader("product-rate");
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { apiClient.productRateStates().then((s) => { setStates(s.states); setState(s.default || "ALL"); }).catch((e) => setMsg(e instanceof Error ? e.message : "Could not load the states")); }, []);
  const need = () => { if (!state) { setMsg("Select the State Name first"); return false; } setMsg(""); return true; };
  return (
    <UploadFrame title="Product Rate">
      <div className="ut-box" style={{ maxWidth: 760 }}>
        <div className="ut-row"><span className="ut-lbl">{req}State Name</span>
          <select value={state} onChange={(e) => setState(e.target.value)}><option value="ALL">ALL</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="ut-row"><button type="button" style={{ ...bRedLink, fontSize: 17 }} onClick={() => need() && download(apiClient.uploadToolTemplate("product-rate", { state }, `Product_Rate_${state.replace(/\W+/g, "_")}.xlsx`), setMsg)}>Download Link</button></div>
        <div className="ut-row"><span style={{ minWidth: 190 }}>{up.chooser()}</span></div>
        <div className="ut-row"><UploadButton up={up} onClick={() => need() && up.submit({ state })} /></div>
        <Err msg={msg} />
      </div>
      <StatusLine r={up.result} err={up.err} />
      <UploadHistory toolKey="product-rate" refresh={up.result ?? up.err} />
    </UploadFrame>
  );
}

// ---------------------------------------------------------------- Holiday Fixation Bulk Upload
export function HolidayUploadPage() {
  const up = useUploader("holiday-fixation");
  const [msg, setMsg] = useState("");
  return (
    <UploadFrame title="Holiday Fixation Bulk Upload">
      <div className="ut-box" style={{ maxWidth: 900 }}>
        <div style={{ lineHeight: "25px", maxWidth: 560, margin: "0 auto" }}>
          <div>Note:</div>
          <div>1) Sheet Name Must be &apos;UPL_Holiday_Fixation&apos;</div>
          <div>2) Date Format Must be in &apos;YYYY-MM-DD&apos; Format</div>
          <div>3) Don&apos;t Do Any Special Formats in the Excel File</div>
          <div style={{ marginTop: 6 }}>Excel Format File <button type="button" style={bLink} onClick={() => download(apiClient.uploadToolTemplate("holiday-fixation", {}, "UPL_Holiday_Fixation.xlsx"), setMsg)}>Download Here</button></div>
        </div>
        <div className="ut-row" style={{ gap: 60, marginTop: 24 }}>
          <span style={{ minWidth: 190 }}>{up.chooser()}</span>
          <button type="button" style={up.busy ? { ...bPrimary, opacity: 0.55, cursor: "not-allowed" } : bPrimary} disabled={up.busy} onClick={() => up.submit()}>{up.busy ? "Processing..." : "Process"}</button>
        </div>
        <Err msg={msg} />
      </div>
      <StatusLine r={up.result} err={up.err} />
      <UploadHistory toolKey="holiday-fixation" refresh={up.result ?? up.err} />
    </UploadFrame>
  );
}
