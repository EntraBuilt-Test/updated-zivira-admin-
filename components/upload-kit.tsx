"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type LegacyUploadResult, type UploadLogRow } from "@/lib/api-client";
import { download, FONT, PURPLE } from "@/components/legacy-upload-pages";

// Round 62 -- shared pieces of the upload tool pages: page frame (title, optional Back, scoped CSS), blue/orange buttons with tinted
// disabled states, the one-line status, and the server-persisted Upload History with the calm "All N rows were rejected" line.

export const BLUE = "#2563eb", BLUE_FADED = "#a9c1f5", ORANGE = "#ea580c", ORANGE_FADED = "#f7bfa3";
const ARIAL = "Arial, Helvetica, sans-serif";

export const KIT_CSS = `
.ut-page, .ut-page * { box-sizing: border-box; }
.ut-page { font-family: ${ARIAL}; color: #000; font-size: 15px; }
.ut-box { background: #fff; border: 1px solid #000; max-width: 1100px; margin: 0 auto; padding: 18px 20px 22px; }
.ut-row { display: flex; justify-content: center; align-items: center; gap: 14px; margin: 10px 0; flex-wrap: wrap; }
.ut-lbl { min-width: 96px; text-align: right; }
.ut-form { display: grid; grid-template-columns: 130px auto; column-gap: 14px; row-gap: 10px; justify-content: center; align-items: center; margin: 4px auto 6px; font-size: 15px; }
.ut-form .ut-lbl { min-width: 0; text-align: right; }
.ut-form .ut-ctl { justify-self: start; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; min-width: 0; }
.ut-form select { display: inline-block !important; width: 130px !important; min-width: 0 !important; max-width: 130px !important; flex: none; height: 30px; font-size: 15px; }
.ut-form select.ut-fy { width: 160px !important; max-width: 160px !important; }
.ut-form input[type="file"] { max-width: 300px; }
@media (max-width: 520px) { .ut-form { grid-template-columns: auto; } .ut-form .ut-lbl { text-align: left; } }
.ut-page select { font: 15px ${ARIAL}; min-width: 190px; height: 32px; border: 1px solid #94a3b8; border-radius: 4px; padding: 0 8px; background: #fff; }
.ut-page input[type="file"] { font: 14px ${ARIAL}; color: #222; max-width: 320px; }
.ut-page input[type="file"]::file-selector-button,
.ut-page input[type="file"]::-webkit-file-upload-button { background: #fff7ed; color: #c2410c; border: 1.5px solid ${ORANGE}; border-radius: 6px; padding: 5px 14px; font: 600 14px ${ARIAL}; margin-right: 10px; cursor: pointer; }
.ut-page input[type="file"]:disabled::file-selector-button { color: ${ORANGE_FADED}; border-color: ${ORANGE_FADED}; cursor: not-allowed; }
.ut-page input[type="checkbox"], .ut-page input[type="radio"] { width: 15px; height: 15px; margin: 0 6px 0 0; accent-color: ${BLUE}; cursor: pointer; vertical-align: middle; }
.ut-page label.ut-opt { display: inline-flex; align-items: center; font-size: 15px; cursor: pointer; margin: 0; }
.ut-note { border: 1px solid #000; max-width: 640px; margin: 14px auto 0; padding: 8px 18px; font-size: 14px; line-height: 24px; }
.ut-ref { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; align-items: flex-start; }
.ut-ref table { border-collapse: collapse; min-width: 150px; }
.ut-ref th, .ut-ref td { border: 1px solid #000; padding: 3px 8px; font-size: 14px; text-align: left; background: #fff; }
.ut-ref th { font-size: 16px; background: #f1f5f9; }
.ut-tbl { border-collapse: collapse; font-size: 13px; width: 100%; }
.ut-tbl th, .ut-tbl td { border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left; }
.ut-tbl th { background: #f1f5f9; position: sticky; top: 0; z-index: 1; white-space: nowrap; }
.ut-page button { font-family: ${ARIAL}; }
`;
const bBase: CSSProperties = { font: "600 15px Arial, Helvetica, sans-serif", borderRadius: 6, padding: "7px 22px", cursor: "pointer", border: "1.5px solid transparent" };
export const bPrimary: CSSProperties = { ...bBase, background: BLUE, color: "#fff", borderColor: BLUE };
export const bPrimaryOff: CSSProperties = { ...bBase, background: BLUE_FADED, color: "#fff", borderColor: BLUE_FADED, cursor: "not-allowed" };
export const bOrange: CSSProperties = { ...bBase, background: ORANGE, color: "#fff", borderColor: ORANGE };
export const bOrangeOff: CSSProperties = { ...bBase, background: ORANGE_FADED, color: "#fff", borderColor: ORANGE_FADED, cursor: "not-allowed" };
export const bLink: CSSProperties = { font: "15px Arial, Helvetica, sans-serif", color: BLUE, textDecoration: "underline", background: "none", border: 0, padding: 0, cursor: "pointer" };
export const bRedLink: CSSProperties = { ...bLink, color: "#e00000" };
export const RED = "#e00000";

export const req = <span style={{ color: RED }}>*</span>;
const pad2 = (n: number) => String(n).padStart(2, "0");
export const fmtTime = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

/** Page frame: only the page content (purple underlined title, optional blue Back), no legacy banner / logo / nav / dotted wrapper. */
export function UploadFrame({ title, back, children }: { title: string; back?: boolean; children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="ut-page" style={{ padding: "6px 0 32px", minWidth: 0 }}>
      <style>{KIT_CSS}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "flex-end", minHeight: back ? 34 : 0 }}>
        {back && <button type="button" style={bPrimary} onClick={() => router.back()}>Back</button>}
      </div>
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: "bold", fontSize: 19, color: PURPLE, textDecoration: "underline", margin: "4px 0 18px" }}>{title}</div>
      {children}
    </div>
  );
}

/** One status line after an upload: the legacy outcome text ("Successful" / "N record(s) not uploaded ...") or a failure line. Row errors never appear here. */
export function StatusLine({ r, err, extra }: { r: LegacyUploadResult | null; err: string; extra?: ReactNode }) {
  if (!err && !r) return null;
  const good = !err && !!r && r.uploaded && r.failed === 0 && !r.fileErrors.length;
  const text = err ? err : r!.fileErrors.length ? `Upload failed - ${r!.fileErrors[0]}` : r!.outcome;
  return (
    <div style={{ textAlign: "center", margin: "14px 12px 4px" }}>
      <div style={{ fontWeight: "bold", fontSize: 16, color: good ? "#067a06" : RED }}>{text}</div>
      {extra}
    </div>
  );
}
export const smallNote: CSSProperties = { color: "#6b7280", fontSize: 12, marginTop: 4 };

/** Upload History of one tool: newest first, latest 50, from the server; Not Uploaded List link only when rejected > 0. */
export function UploadHistory({ toolKey, refresh }: { toolKey: string; refresh: unknown }) {
  const [rows, setRows] = useState<UploadLogRow[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { apiClient.uploadLog(toolKey).then((h) => { setRows(h); setErr(""); }).catch((e) => setErr(e instanceof Error ? e.message : "Could not load the upload history")); }, [toolKey, refresh]);
  const latest = rows?.[0];
  return (
    <div style={{ maxWidth: 1000, margin: "18px auto 0" }}>
      <div style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", textAlign: "center" }}>Upload History</div>
      {err && <div style={{ color: RED, textAlign: "center", fontSize: 13 }}>{err}</div>}
      <div style={{ overflow: "auto", maxHeight: 460, border: "1px solid #cbd5e1", background: "#fff" }}>
        <table className="ut-tbl">
          <thead><tr><th>S.No</th><th>Uploaded Time</th><th>File Name</th><th>Records</th><th>Reason</th><th>Uploaded by</th><th>Not Uploaded List</th></tr></thead>
          <tbody>
            {rows && rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#6b7280" }}>No uploads yet</td></tr>}
            {(rows ?? []).map((h, i) => (
              <tr key={h.id}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: "nowrap" }}>{fmtTime(h.uploadedAt)}</td>
                <td style={{ wordBreak: "break-word" }}>{h.fileName}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-block", padding: "1px 9px", borderRadius: 10, fontWeight: 600, fontSize: 13, background: "#dcfce7", color: "#166534" }}>Success: {h.success}</span>{" "}
                  <span style={{ display: "inline-block", padding: "1px 9px", borderRadius: 10, fontWeight: 600, fontSize: 13, background: "#fee2e2", color: "#991b1b" }}>Rejected: {h.rejected}</span>
                </td>
                <td style={{ fontSize: 13, color: h.topReason ? "#991b1b" : undefined }}>{h.topReason || "-"}</td>
                <td>{h.uploadedBy}</td>
                <td>{h.rejected > 0 ? <button type="button" style={bLink} onClick={() => download(apiClient.uploadLogNotUploaded(toolKey, h.id, h.fileName), setErr)}>Not Uploaded List</button> : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {latest && latest.read > 0 && latest.rejected === latest.read && latest.topReasonRows === latest.read && latest.topReason && (
        <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, margin: "6px 0 0" }}>
          All {latest.read} rows were rejected: {latest.topReason}{/Field Force/.test(latest.topReason) ? " (check the Field Force master has these employees)" : ""}
        </div>
      )}
    </div>
  );
}

/** Underlined legacy heading + numbered list (numbers may be overridden, as in the legacy Target page). */
export function Instructions({ heading, items, nums }: { heading: string; items: string[]; nums?: string[] }) {
  return (
    <div style={{ maxWidth: 1100, margin: "30px auto 0", fontSize: 15, lineHeight: "27px" }}>
      <div><span style={{ textDecoration: "underline", color: BLUE }}>{heading}</span></div>
      {items.map((t, i) => <div key={i} style={{ display: "flex" }}><span style={{ width: 30, flexShrink: 0, paddingLeft: 8 }}>{(nums ? nums[i] : String(i + 1)) + "."}</span><span>{t}</span></div>)}
    </div>
  );
}

/** Boxed legacy "Note:" block. */
export function NoteBox({ lines }: { lines: string[] }) {
  return (
    <div className="ut-note">
      <div style={{ color: RED }}>Note:</div>
      {lines.map((n, i) => <div key={i}>{`${i + 1}) ${n}`}</div>)}
    </div>
  );
}
