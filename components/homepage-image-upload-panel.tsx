"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

// Matches sanpharma.info's MasterFiles/Options/Homepage_ImgUpload.aspx
// ("Home Page Image Upload") exactly: just the upload form — Login Page
// Image file picker + Subject text field + Upload button, no results
// table underneath. Wired to the real, shared upload endpoint
// (POST /masters/homepageImageUpload/action/upload), which now keeps the
// actual uploaded file.
const MASTER_KEY = "homepageImageUpload";

export function HomepageImageUploadPanel() {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function doUpload() {
    if (!file) { setErr("Please choose a Login Page Image"); return; }
    if (!subject.trim()) { setErr("Please enter a Subject"); return; }
    setBusy(true); setErr(null); setMsg(null);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, { subject: subject.trim() });
      setMsg("Home page image uploaded successfully.");
      setFile(null);
      setSubject("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Options &gt; Image Upload</p>
          <h2>Home Page Image Upload</h2>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, maxWidth: 560 }}>
        {err && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{err}</div>}
        {msg && <div style={{ color: "#10b981", fontSize: 13, marginBottom: 12 }}>{msg}</div>}
        <div className="form-grid">
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label>Login Page Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label>Subject</label>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <button className="button" type="button" onClick={doUpload} disabled={busy}>{busy ? "Uploading..." : "Upload"}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
