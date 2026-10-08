"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type UploadGenCol, type UploadRefSummary } from "@/lib/api-client";
import { Result, useUploader, download, link, redLink, FONT, PURPLE } from "@/components/legacy-upload-pages";

// Round 61 -- Listed Doctor Upload Tool: ONLY the legacy page content inside the admin tab (no copied "Welcome / company" banner,
// logo, nav bar or dotted wrapper). Native-looking controls (grey bordered buttons, default file input) and the legacy fonts/sizes.
// Every action is real: columns, Generate Excel (server remembers it per admin), upload, deactivate, result + Not Uploaded List.

const TITLE = "Listed Doctor Upload Tool";
const MASTER_PATH = "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/listed-doctor-master";
const ARIAL = "Arial, Helvetica, sans-serif";

// Scoped reset so the app's global orange file button / label styling does not leak into the legacy controls.
const NATIVE_CSS = `
.legacy-native, .legacy-native * { box-sizing: border-box; }
.legacy-native { font-family: ${ARIAL}; color: #000; background: #fff; }
.legacy-native label { font-family: ${ARIAL}; font-size: 16px; font-weight: normal; color: #000; display: flex; align-items: center; gap: 3px; margin: 0; }
.legacy-native input[type="checkbox"] { width: 13px; height: 13px; margin: 3px 3px 3px 4px; accent-color: #1a73e8; }
.legacy-native input[type="file"] { font: 13.3333px Arial; color: #000; padding: 0; }
.legacy-native input[type="file"]::file-selector-button,
.legacy-native input[type="file"]::-webkit-file-upload-button {
  background: #efefef; color: #000; border: 1px solid #767676; border-radius: 3px; padding: 1px 6px; font: 13.3333px Arial;
  box-shadow: none; margin-right: 4px; cursor: pointer; --tw-shadow: 0 0 #0000;
}
.legacy-native input[type="file"]:disabled::file-selector-button,
.legacy-native input[type="file"]:disabled::-webkit-file-upload-button { background: #efefef; color: #9a9a9a; border-color: #c7c7c7; cursor: default; }
.legacy-native button { font-family: ${ARIAL}; }
`;
const nbtn: CSSProperties = { font: "16px Arial, Helvetica, sans-serif", border: "1px solid #767676", background: "#efefef", color: "#000", borderRadius: 3, padding: "1px 6px", cursor: "pointer" };
const nbtnOff: CSSProperties = { ...nbtn, color: "#9a9a9a", borderColor: "#c7c7c7", background: "#efefef", cursor: "default" };
const nlink: CSSProperties = { ...link, font: "16px Arial, Helvetica, sans-serif", color: "#0000ee" };
const nlinkOff: CSSProperties = { font: "16px Arial, Helvetica, sans-serif", color: "#9a9a9a", textDecoration: "none" };

export function ListedDoctorUploadPage() {
  const router = useRouter();
  const toolKey = "listed-doctor";
  const up = useUploader(toolKey);
  const [cols, setCols] = useState<UploadGenCol[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<string[] | null>(null);     // columns of the Excel generated earlier: kept on the server per admin user
  const [deactivate, setDeactivate] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [popup, setPopup] = useState<null | "ref" | "help">(null);
  const [refData, setRefData] = useState<UploadRefSummary | null>(null);
  const [refErr, setRefErr] = useState("");
  const fileName = `${TITLE.replace(/\s+/g, "_")}.xlsx`;

  useEffect(() => {
    apiClient.uploadToolColumns(toolKey).then((c) => {
      setCols(c);
      setPicked(new Set(c.filter((x) => x.mandatory).map((x) => x.label)));
    }).catch((e) => setLoadErr(e instanceof Error ? e.message : "Could not load the column list"));
    apiClient.uploadToolGenerated(toolKey).then((g) => { if (g?.columns?.length) setGenerated(g.columns); }).catch(() => { /* nothing saved */ });
  }, []);

  const openRef = () => {
    setPopup("ref"); setRefData(null); setRefErr("");
    apiClient.uploadToolReference("listed-doctor").then(setRefData).catch((e) => setRefErr(e instanceof Error ? e.message : "Could not load the reference"));
  };
  const generate = async () => {
    setMsg("");
    try {
      const labels = cols.filter((c) => c.mandatory || picked.has(c.label)).map((c) => c.label);
      await apiClient.uploadToolGenerate(toolKey, labels, fileName);       // downloads the xlsx and stores the state server-side
      setGenerated(labels);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Could not generate the Excel file"); }
  };
  const reset = async () => {
    try { await apiClient.uploadToolClearGenerated(toolKey); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not clear the saved Excel"); return; }
    setGenerated(null); setMsg("");
    setPicked(new Set(cols.filter((x) => x.mandatory).map((x) => x.label)));
  };
  const downloadHere = () => { if (generated) download(apiClient.uploadToolGenerate(toolKey, generated, fileName), setMsg); };
  const uploaded = !!up.result && up.result.uploaded && up.result.inserted + up.result.updated > 0;
  const on = !!generated;

  return (
    <div className="legacy-native" style={{ padding: "6px 0 24px", minWidth: 0 }}>
      <style>{NATIVE_CSS}</style>
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: "bold", fontSize: 19, color: PURPLE, textDecoration: "underline", margin: "6px 0 24px", background: "transparent" }}>{TITLE}</div>
      <div style={{ background: "#fff", border: "1px solid #000", maxWidth: 1536, margin: "0 auto", padding: "6px 0 14px" }}>
        <div style={{ textAlign: "center", fontSize: 16, lineHeight: "20px" }}>{TITLE}</div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0 6px", padding: "0 148px", fontSize: 20 }}>
          <button type="button" style={{ ...redLink, font: "20px Arial, Helvetica, sans-serif" }} onClick={openRef}>Speciality / Category</button>
          <button type="button" style={{ ...redLink, font: "20px Arial, Helvetica, sans-serif" }} onClick={() => setPopup("help")}>? Video Help</button>
        </div>
        <div style={{ padding: "0 0 0 157px", fontFamily: ARIAL, fontWeight: "bold", fontSize: 16, color: "#555", margin: "6px 0 8px" }}>Select the Parameter to Upload</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, auto)", justifyContent: "center", gap: "2px 12px", padding: "0 10px" }}>
          {cols.map((c) => (
            <label key={c.label} style={{ color: c.mandatory ? "#e00000" : "#000", fontWeight: c.mandatory ? "bold" : "normal" }}>
              <input type="checkbox" checked={c.mandatory || picked.has(c.label)} disabled={c.mandatory || on}
                onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(c.label); else n.delete(c.label); return n; })} />
              {c.label}
            </label>
          ))}
        </div>
        {loadErr && <div style={{ color: "#e00000", textAlign: "center" }}>{loadErr}</div>}
        <div style={{ textAlign: "center", margin: "30px 0 26px" }}>
          <button type="button" style={on ? nbtnOff : nbtn} disabled={on || !cols.length} onClick={generate}>Generate Excel</button>
          <span style={{ marginLeft: 14 }}>
            {on ? <button type="button" style={nlink} onClick={reset}>Delete and Generate New Excel</button> : <span style={nlinkOff}>Delete and Generate New Excel</span>}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 60, margin: "8px 0" }}>
          <span style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 20 }}>Excel file {up.chooser(!on)}</span>
          <label style={{ color: "#e00000", fontSize: 16, fontFamily: FONT }}>
            <input type="checkbox" checked={deactivate} onChange={(e) => setDeactivate(e.target.checked)} />
            Deactivate Existing Doctor List ( if Yes then Check this Option )
          </label>
        </div>
        <div style={{ textAlign: "center", margin: "18px 0 6px" }}>
          <button type="button" style={on && !up.busy ? nbtn : nbtnOff} disabled={!on || up.busy} onClick={() => up.submit(deactivate ? { deactivate: "true" } : {})}>{up.busy ? "Uploading..." : "Upload"}</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 16 }}>Excel Format File <button type="button" style={on ? nlink : { ...nlinkOff, background: "none", border: 0, padding: 0, cursor: "default" }} disabled={!on} onClick={downloadHere}>Download Here</button></div>
        {msg && <div style={{ textAlign: "center", color: "#e00000", margin: "8px 0", fontSize: 14 }}>{msg}</div>}
        <Result r={up.result} err={up.err} />
        {uploaded && (
          <div style={{ textAlign: "center", margin: "6px 0 2px" }}>
            <button type="button" style={nbtn} onClick={() => router.push(MASTER_PATH)}>Go to Listed Doctor list</button>
          </div>
        )}
      </div>
      {popup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setPopup(null)}>
          <div style={{ background: "#fff", border: "1px solid #888", padding: 16, maxWidth: 760, width: "92%", maxHeight: "80vh", overflow: "auto", fontSize: 14 }} onClick={(e) => e.stopPropagation()}>
            {popup === "ref" ? (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Speciality / Category (from your doctor master)</h3>
                {refErr && <div style={{ color: "#e00000" }}>{refErr}</div>}
                {!refData && !refErr && <div>Loading...</div>}
                {refData && (
                  <>
                    <div style={{ marginBottom: 8 }}>{refData.total} active record(s) in the master.</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[["Speciality", refData.specialities ?? []] as const, ["Category (Nil/Core/...)", refData.categories] as const, ["Class", refData.classes] as const].map(([head, list]) => (
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
                  <li>Under &quot;Select the Parameter to Upload&quot;, tick the columns you want (red ones are mandatory and always included). Available: {cols.map((c) => c.label).join(", ") || "loading..."}.</li>
                  <li>Click &quot;Generate Excel&quot;. An Excel with exactly those columns downloads (mandatory headers in yellow) and the choice is saved for your login; the tick boxes lock.</li>
                  <li>Fill the Excel (use &quot;Speciality / Category&quot; to see the values already in your masters), save it, then pick it with &quot;Choose File&quot;.</li>
                  <li>Tick &quot;Deactivate Existing Doctor List&quot; only if all existing doctors should be deactivated first.</li>
                  <li>Click &quot;Upload&quot;. The result shows inserted, updated and not-uploaded rows; use &quot;Not Uploaded List&quot; to fix and re-upload failed rows. &quot;Go to Listed Doctor list&quot; opens the master.</li>
                  <li>&quot;Download Here&quot; re-downloads the Excel format. &quot;Delete and Generate New Excel&quot; clears the saved choice so you can pick different columns.</li>
                </ol>
              </>
            )}
            <div style={{ textAlign: "right", marginTop: 10 }}><button type="button" style={nbtn} onClick={() => setPopup(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
