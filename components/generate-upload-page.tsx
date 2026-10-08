"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type UploadGenCol, type UploadRefSummary, type UploadLogRow } from "@/lib/api-client";
import { useUploader, download, link, redLink, FONT, PURPLE } from "@/components/legacy-upload-pages";

// Round 61/62 -- shared "Generate Excel" upload page (Listed Doctor, Chemists, ...): ONLY the legacy page content inside the admin tab
// (no copied "Welcome / company" banner, logo, nav bar or dotted wrapper). Blue (primary) / orange (upload) buttons, centred 1180px box,
// equal-width checkbox grid, server-remembered generated state, one status line + a server-persisted Upload History. Everything is real.

export type GenerateUploadConfig = {
  toolKey: string; title: string; masterPath: string; masterLabel: string; lastUploadKey: string;
  refLink: string; refHeading: string; refTables: (d: UploadRefSummary) => (readonly [string, { value: string; count: number }[]])[];
  noun: string; deactivateLabel: string; noteLine: string; back?: boolean;
};
const ARIAL = "Arial, Helvetica, sans-serif";

// Scoped reset so the app's global orange file button / label styling does not leak into the legacy controls.
const BLUE = "#2563eb", BLUE_FADED = "#a9c1f5", ORANGE = "#ea580c", ORANGE_FADED = "#f7bfa3";
const NATIVE_CSS = `
.ld-page, .ld-page * { box-sizing: border-box; }
.ld-page { font-family: ${ARIAL}; color: #000; font-size: 15px; }
.ld-box { background: #fff; border: 1px solid #000; max-width: 1180px; margin: 0 auto; padding: 14px 16px 18px; }
.ld-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px 12px; margin: 0 auto; max-width: 1148px; }
@media (max-width: 1250px) { .ld-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
@media (max-width: 1000px) { .ld-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.ld-page label.ld-cb { font-family: ${ARIAL}; font-size: 14.5px; font-weight: normal; color: #000; display: flex; align-items: center; gap: 6px; margin: 0; min-height: 22px; cursor: pointer; }
.ld-page label.ld-cb span.t { display: inline-block; line-height: 1.2; }
.ld-page label.ld-cb span.t > span { white-space: nowrap; }
.ld-page input[type="checkbox"] { width: 15px; height: 15px; margin: 0; flex: none; accent-color: ${BLUE}; cursor: pointer; }
.ld-page input[type="file"] { font: 14px ${ARIAL}; color: #222; padding: 0; max-width: 300px; }
.ld-page input[type="file"]::file-selector-button,
.ld-page input[type="file"]::-webkit-file-upload-button {
  background: #fff7ed; color: #c2410c; border: 1.5px solid ${ORANGE}; border-radius: 6px; padding: 5px 14px; font: 600 14px ${ARIAL};
  box-shadow: none; margin-right: 10px; cursor: pointer;
}
.ld-page input[type="file"]:disabled::file-selector-button,
.ld-page input[type="file"]:disabled::-webkit-file-upload-button { background: #fff7ed; color: ${ORANGE_FADED}; border-color: ${ORANGE_FADED}; cursor: not-allowed; }
.ld-page button { font-family: ${ARIAL}; }
.ld-tbl { border-collapse: collapse; font-size: 13px; width: max-content; min-width: 100%; }
.ld-tbl th, .ld-tbl td { border: 1px solid #cbd5e1; padding: 4px 8px; white-space: nowrap; text-align: left; }
.ld-tbl th { background: #f1f5f9; position: sticky; top: 0; z-index: 1; }
`;
const bBase: CSSProperties = { font: "600 15px Arial, Helvetica, sans-serif", borderRadius: 6, padding: "7px 20px", cursor: "pointer", border: "1.5px solid transparent" };
const primary: CSSProperties = { ...bBase, background: BLUE, color: "#fff", borderColor: BLUE };
const primaryOff: CSSProperties = { ...bBase, background: BLUE_FADED, color: "#fff", borderColor: BLUE_FADED, cursor: "not-allowed" };
const orange: CSSProperties = { ...bBase, background: ORANGE, color: "#fff", borderColor: ORANGE };
const orangeOff: CSSProperties = { ...bBase, background: ORANGE_FADED, color: "#fff", borderColor: ORANGE_FADED, cursor: "not-allowed" };
const outlineBlue: CSSProperties = { ...bBase, background: "#fff", color: BLUE, borderColor: BLUE };
const outlineBlueOff: CSSProperties = { ...bBase, background: "#fff", color: BLUE_FADED, borderColor: BLUE_FADED, cursor: "not-allowed" };
const blueLink: CSSProperties = { ...link, font: "15px Arial, Helvetica, sans-serif", color: BLUE };
const blueLinkOff: CSSProperties = { font: "15px Arial, Helvetica, sans-serif", color: BLUE_FADED, textDecoration: "underline", background: "none", border: 0, padding: 0, cursor: "not-allowed" };
const CHIP: CSSProperties = { display: "inline-block", padding: "1px 9px", borderRadius: 10, fontWeight: 600, fontSize: 13 };
const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtTime = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
/** "Territory/Cluster(For DCR)" -> two nowrap pieces so a long label breaks cleanly before "(" and never mid-phrase. */
const pieces = (label: string) => label.split(/(?=\()/);

export function GenerateUploadPage({ cfg }: { cfg: GenerateUploadConfig }) {
  const router = useRouter();
  const { toolKey, title: TITLE, masterPath: MASTER_PATH, lastUploadKey: LAST_UPLOAD_KEY } = cfg;
  const up = useUploader(toolKey);
  const [cols, setCols] = useState<UploadGenCol[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());            // only what the user ticks; always empty at first
  const [generated, setGenerated] = useState<string[] | null>(null);       // the columns of the Excel generated earlier: kept on the server per admin user
  const [deactivate, setDeactivate] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [popup, setPopup] = useState<null | "ref" | "help">(null);
  const [refData, setRefData] = useState<UploadRefSummary | null>(null);
  const [refErr, setRefErr] = useState("");
  const fileName = `${TITLE.replace(/\s+/g, "_")}.xlsx`;
  const always = useMemo(() => cols.filter((c) => c.mandatory).map((c) => c.label), [cols]);

  useEffect(() => {
    apiClient.uploadToolColumns(toolKey).then((c) => {
      setCols(c);
      // restore what was ticked for the Excel generated earlier (state is on the server)
      apiClient.uploadToolGenerated(toolKey).then((g) => {
        if (g?.columns?.length) { setGenerated(g.columns); setPicked(new Set(g.columns.filter((l) => !c.some((x) => x.label === l && x.mandatory)))); }
      }).catch(() => { /* nothing saved */ });
    }).catch((e) => setLoadErr(e instanceof Error ? e.message : "Could not load the column list"));
  }, []);

  const r = up.result;
  const [history, setHistory] = useState<UploadLogRow[] | null>(null);
  const [histErr, setHistErr] = useState("");
  const loadHistory = () => apiClient.uploadLog(toolKey).then((h) => { setHistory(h); setHistErr(""); }).catch((e) => setHistErr(e instanceof Error ? e.message : "Could not load the upload history"));
  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { if (r || up.err) loadHistory(); }, [r, up.err]);
  const uploaded = !!r && r.uploaded && r.inserted + r.updated > 0;
  useEffect(() => {
    if (uploaded && r) {
      try { window.sessionStorage.setItem(LAST_UPLOAD_KEY, JSON.stringify({ at: r.startedAt || new Date().toISOString(), fileName: r.fileName, inserted: r.inserted, updated: r.updated })); } catch { /* storage unavailable */ }
    }
  }, [uploaded, r]);

  const openRef = () => {
    setPopup("ref"); setRefData(null); setRefErr("");
    apiClient.uploadToolReference(toolKey).then(setRefData).catch((e) => setRefErr(e instanceof Error ? e.message : "Could not load the reference"));
  };
  const generate = async () => {
    setMsg("");
    try {
      const labels = cols.filter((c) => picked.has(c.label)).map((c) => c.label);     // the always-included columns are added by the server
      await apiClient.uploadToolGenerate(toolKey, labels, fileName);                  // downloads the xlsx and stores the state server-side
      setGenerated([...new Set([...always, ...labels])]);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Could not generate the Excel file"); }
  };
  const reset = async () => {
    try { await apiClient.uploadToolClearGenerated(toolKey); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not clear the saved Excel"); return; }
    setGenerated(null); setMsg(""); setPicked(new Set());
  };
  const downloadHere = () => { if (generated) download(apiClient.uploadToolGenerate(toolKey, generated, fileName), setMsg); };
  const on = !!generated;

  return (
    <div className="ld-page" style={{ padding: "6px 0 28px", minWidth: 0 }}>
      <style>{NATIVE_CSS}</style>
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: "bold", fontSize: 19, color: PURPLE, textDecoration: "underline", margin: "6px 0 18px" }}>{TITLE}</div>
      <div className="ld-box">
        {cfg.back && <div style={{ textAlign: "right", maxWidth: 1148, margin: "0 auto 4px" }}><button type="button" style={primary} onClick={() => router.back()}>Back</button></div>}
        <div style={{ textAlign: "center", fontSize: 15, marginBottom: 10 }}>{TITLE}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1148, margin: "0 auto 12px" }}>
          <button type="button" style={{ ...redLink, font: "16px Arial, Helvetica, sans-serif" }} onClick={openRef}>{cfg.refLink}</button>
          <button type="button" style={{ ...redLink, font: "16px Arial, Helvetica, sans-serif" }} onClick={() => setPopup("help")}>? Video Help</button>
        </div>
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 15, color: "#555", margin: "0 0 10px" }}>Select the Parameter to Upload</div>
        <div className="ld-grid">
          {cols.map((c) => (
            <label key={c.label} className="ld-cb" title={c.label}>
              <input type="checkbox" checked={picked.has(c.label)}
                onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(c.label); else n.delete(c.label); return n; })} />
              <span className="t">{pieces(c.label).map((t, i) => <span key={i}>{t}</span>)}</span>
            </label>
          ))}
        </div>
        {loadErr && <div style={{ color: "#e00000", textAlign: "center", marginTop: 8 }}>{loadErr}</div>}
        {always.length > 0 && (
          <div style={{ textAlign: "center", fontSize: 13, color: "#475569", margin: "12px auto 0", maxWidth: 1000, lineHeight: "18px" }}>
            {always.join(", ")} are always included (highlighted yellow in the Excel).
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, margin: "22px 0 20px", flexWrap: "wrap" }}>
          <button type="button" style={on ? primaryOff : primary} disabled={on || !cols.length} onClick={generate}>Generate Excel</button>
          <button type="button" style={on ? outlineBlue : outlineBlueOff} disabled={!on} onClick={reset}>Delete and Generate New Excel</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 36, margin: "8px 0 16px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>Excel file {up.chooser(!on)}</span>
          <label className="ld-cb" style={{ color: "#c00000" }}>
            <input type="checkbox" checked={deactivate} onChange={(e) => setDeactivate(e.target.checked)} />
            {cfg.deactivateLabel}
          </label>
        </div>
        <div style={{ textAlign: "center", margin: "0 0 10px" }}>
          <button type="button" style={on && !up.busy ? orange : orangeOff} disabled={!on || up.busy} onClick={() => up.submit(deactivate ? { deactivate: "true" } : {})}>{up.busy ? "Uploading..." : "Upload"}</button>
        </div>
        <div style={{ textAlign: "center" }}>Excel Format File <button type="button" style={on ? blueLink : blueLinkOff} disabled={!on} onClick={downloadHere}>Download Here</button></div>
        {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "10px 0", fontSize: 14 }}>{msg}</div>}
        <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, margin: "8px auto 0", maxWidth: 900 }}>{cfg.noteLine}</div>
        {(up.err || r) && (
          <div style={{ textAlign: "center", margin: "14px 0 4px", fontWeight: "bold", fontSize: 16, color: up.err || !r || r.failed > 0 || !r.uploaded ? "#c00000" : "#067a06" }}>
            {up.err ? up.err : r && r.fileErrors.length ? `Upload failed - ${r.fileErrors[0]}` : r && r.uploaded && r.failed === 0 ? "Upload completed" : "Upload completed with rejected records"}
          </div>
        )}
        <div style={{ textAlign: "center", margin: "8px 0 14px" }}>
          <button type="button" style={primary} onClick={() => router.push(MASTER_PATH)}>Go to {cfg.masterLabel}</button>
        </div>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <div style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", textAlign: "center" }}>Upload History</div>
          {histErr && <div style={{ color: "#c00000", textAlign: "center", fontSize: 13 }}>{histErr}</div>}
          <div style={{ overflow: "auto", maxHeight: 460, border: "1px solid #cbd5e1" }}>
            <table className="ld-tbl" style={{ width: "100%" }}>
              <thead><tr><th>S.No</th><th>Uploaded Time</th><th>File Name</th><th>Records</th><th>Reason</th><th>Uploaded by</th><th>Not Uploaded List</th></tr></thead>
              <tbody>
                {history && history.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#6b7280" }}>No uploads yet</td></tr>}
                {(history ?? []).map((h, i) => (
                  <tr key={h.id}>
                    <td>{i + 1}</td>
                    <td>{fmtTime(h.uploadedAt)}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{h.fileName}</td>
                    <td>
                      <span style={{ ...CHIP, background: "#dcfce7", color: "#166534" }}>Success: {h.success}</span>{" "}
                      <span style={{ ...CHIP, background: "#fee2e2", color: "#991b1b" }}>Rejected: {h.rejected}</span>
                    </td>
                    <td style={{ whiteSpace: "normal", fontSize: 13, color: h.topReason ? "#991b1b" : undefined }}>{h.topReason || "-"}</td>
                    <td>{h.uploadedBy}</td>
                    <td>{h.rejected > 0 ? <button type="button" style={blueLink} onClick={() => download(apiClient.uploadLogNotUploaded(toolKey, h.id, h.fileName), setMsg)}>Not Uploaded List</button> : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history && history[0] && history[0].read > 0 && history[0].rejected === history[0].read && history[0].topReasonRows === history[0].read && history[0].topReason && (
            <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, margin: "6px 0 0" }}>
              All {history[0].read} rows were rejected: {history[0].topReason}{/Field Force/.test(history[0].topReason) ? " (check the Field Force master has these employees)" : ""}
            </div>
          )}
        </div>
      </div>
      {popup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setPopup(null)}>
          <div style={{ background: "#fff", border: "1px solid #888", padding: 16, maxWidth: 760, width: "92%", maxHeight: "80vh", overflow: "auto", fontSize: 14 }} onClick={(e) => e.stopPropagation()}>
            {popup === "ref" ? (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{cfg.refHeading}</h3>
                {refErr && <div style={{ color: "#e00000" }}>{refErr}</div>}
                {!refData && !refErr && <div>Loading...</div>}
                {refData && (
                  <>
                    <div style={{ marginBottom: 8 }}>{refData.total} active record(s) in the master.</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {cfg.refTables(refData).map(([head, list]) => (
                        <table key={head} style={{ borderCollapse: "collapse", minWidth: 180, alignSelf: "flex-start" }}>
                          <thead><tr><th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "left" }}>{head}</th><th style={{ border: "1px solid #000", padding: "3px 6px" }}>Count</th></tr></thead>
                          <tbody>
                            {list.length === 0 && <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px", color: "#777" }}>None in the master</td></tr>}
                            {list.map((t) => <tr key={t.value}><td style={{ border: "1px solid #000", padding: "3px 6px" }}>{t.value}</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{t.count}</td></tr>)}
                          </tbody>
                        </table>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{TITLE} - how to use (in-app help, not a video)</h3>
                <ol style={{ paddingLeft: 20, lineHeight: "24px" }}>
                  <li>Under &quot;Select the Parameter to Upload&quot;, tick the optional columns you want (the always-included ones are added for you). Available: {cols.map((c) => c.label).join(", ") || "loading..."}.</li>
                  <li>Click &quot;Generate Excel&quot;. An Excel with exactly those columns downloads (mandatory headers in yellow) and the choice is saved for your login; the tick boxes lock.</li>
                  <li>Fill the Excel (use &quot;{cfg.refLink}&quot; to see the values already in your masters), save it, then pick it with &quot;Choose File&quot;.</li>
                  <li>Tick &quot;Deactivate Existing {cfg.noun} List&quot; only if all existing {cfg.noun}s should be deactivated first.</li>
                  <li>Click &quot;Upload&quot;. A one-line result is shown and the upload is added to the Upload History; open &quot;Not Uploaded List&quot; against an upload to see which rows were rejected and why, then fix and re-upload failed rows. &quot;Go to {cfg.masterLabel}&quot; opens the master.</li>
                  <li>&quot;Download Here&quot; re-downloads the Excel format. &quot;Delete and Generate New Excel&quot; clears the saved choice so you can pick different columns.</li>
                </ol>
              </>
            )}
            <div style={{ textAlign: "right", marginTop: 10 }}><button type="button" style={primary} onClick={() => setPopup(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
