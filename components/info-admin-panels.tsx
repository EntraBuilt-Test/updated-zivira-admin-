"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { FlashTicker, NoticePopup, QuotePopup, type InfoItem } from "@/components/info-popups";

// Round 48 Part D -- admin Information Upload: Flash News / Notice Board / Quote for the Week item managers
// (real CRUD on /company/info/items) and the Talk to Us inbox (tickets + replies).
type Kind = "FLASH" | "NOTICE" | "QUOTE";
type AdminItem = InfoItem & { designations: string[]; divisions: string[]; hqs: string[]; active: boolean };
type Audience = { designations: string[]; divisions: string[]; hqs: string[] };
const LABEL: Record<Kind, string> = { FLASH: "Flash News", NOTICE: "Notice Board", QUOTE: "Quote for the Week" };
const card: React.CSSProperties = { border: "1px solid rgba(128,128,128,.35)", borderRadius: 12, padding: 14 };
const inp: React.CSSProperties = { width: "100%", borderRadius: 8, border: "1px solid rgba(128,128,128,.5)", padding: "7px 10px", font: "inherit", background: "transparent", color: "inherit" };
const btn = (c = "#2563eb"): React.CSSProperties => ({ borderRadius: 8, border: "none", padding: "7px 14px", background: c, color: "#fff", font: "inherit", cursor: "pointer" });
const blank = { title: "", body: "", author: "", priority: "NORMAL", pinned: false, active: true, startDate: "", endDate: "", designations: [] as string[], divisions: [] as string[], hqs: [] as string[], attachmentUrl: "", attachmentName: "" };

function MultiPick({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset style={{ border: "1px solid rgba(128,128,128,.35)", borderRadius: 8, padding: 8, margin: 0 }}>
      <legend style={{ fontSize: 12, padding: "0 4px" }}>{label} <span style={{ opacity: 0.6 }}>({value.length ? `${value.length} selected` : "everyone"})</span></legend>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 96, overflow: "auto" }}>
        {options.map((o) => (
          <label key={o} style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}>
            <input type="checkbox" checked={value.includes(o)} onChange={(e) => onChange(e.target.checked ? [...value, o] : value.filter((x) => x !== o))} />{o}
          </label>
        ))}
        {options.length === 0 && <span style={{ fontSize: 12, opacity: 0.6 }}>No values found in employee master.</span>}
      </div>
    </fieldset>
  );
}

// Same clean-up the server does (so an older backend cannot bring duplicates back): trim, drop "test"/"testing", de-duplicate case-insensitively keeping the properly cased spelling.
const tidy = (xs: string[] = []) => {
  const best = new Map<string, string>();
  for (const raw of xs) {
    const v = String(raw ?? "").trim().replace(/\s+/g, " ");
    if (!v || /^(test|testing)$/i.test(v)) continue;
    const k = v.toLowerCase(), cur = best.get(k);
    if (!cur || (cur === cur.toLowerCase() && v !== v.toLowerCase())) best.set(k, v);
  }
  return [...best.values()].sort((a, b) => a.localeCompare(b));
};

export function InfoItemsPanel({ kind }: { kind: Kind }) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [aud, setAud] = useState<Audience>({ designations: [], divisions: [], hqs: [] });
  const [form, setForm] = useState<typeof blank>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminItem | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setItems((await apiClient.infoItems(kind)).data as unknown as AdminItem[]); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Could not load"); }
  }, [kind]);
  useEffect(() => { void load(); apiClient.infoAudienceOptions().then((r) => setAud({ designations: tidy(r.data.designations), divisions: tidy(r.data.divisions), hqs: tidy(r.data.hqs) })).catch(() => undefined); }, [load]);

  const edit = (i: AdminItem) => { setEditing(i.id); setOpen(true); setForm({ title: i.title, body: i.body, author: i.author, priority: i.priority, pinned: i.pinned, active: i.active, startDate: i.startDate ?? "", endDate: i.endDate ?? "", designations: i.designations, divisions: i.divisions, hqs: i.hqs, attachmentUrl: i.attachmentUrl, attachmentName: i.attachmentName }); };
  const reset = () => { setEditing(null); setForm(blank); setOpen(false); };
  async function save() {
    setBusy(true); setError("");
    try {
      const payload = { ...form, kind, startDate: form.startDate || null, endDate: form.endDate || null };
      if (editing) await apiClient.updateInfoItem(editing, payload); else await apiClient.createInfoItem(payload);
      reset(); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); } finally { setBusy(false); }
  }
  async function remove(i: AdminItem) {
    if (!window.confirm("Delete this item?")) return;
    try { await apiClient.deleteInfoItem(i.id); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }
  const set = <K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const showPreview = (i: AdminItem | InfoItem) => setPreview(i as AdminItem);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{LABEL[kind]}</h2>
        <button type="button" style={btn()} onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}>+ New {LABEL[kind]}</button>
      </div>
      {kind === "FLASH" && items.some((i) => i.active) && <FlashTicker items={items.filter((i) => i.active)} />}
      {error && <p style={{ color: "#b91c1c", margin: 0, fontSize: 13 }}>{error}</p>}
      {items.length === 0 && <p style={{ opacity: 0.7, fontSize: 14 }}>No {LABEL[kind].toLowerCase()} items yet.</p>}
      {items.map((i) => (
        <div key={i.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <b>{i.title || i.body.slice(0, 60)}</b>
            <span style={{ fontSize: 12, opacity: 0.75 }}>{i.active ? "Active" : "Inactive"} | {i.priority}{i.pinned ? " | Pinned" : ""} | v{i.version}</span>
          </div>
          <p style={{ margin: "6px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{i.body}</p>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Window: {i.startDate ?? "any"} to {i.endDate ?? "open"} | Audience: {[i.designations.join(", ") || "all designations", i.divisions.join(", ") || "all divisions", i.hqs.join(", ") || "all HQs"].join(" / ")}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" style={btn("#7c3aed")} onClick={() => showPreview(i)}>Preview popup</button>
            <button type="button" style={btn("#475569")} onClick={() => edit(i)}>Edit</button>
            <button type="button" style={btn("#b91c1c")} onClick={() => void remove(i)}>Delete</button>
          </div>
        </div>
      ))}

      {open && (
        <div className="zvi-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) reset(); }}>
          <style>{`.zvi-overlay{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55)}`}</style>
          <div className="zvi-modal" role="dialog" aria-modal="true" aria-label={`${editing ? "Edit" : "New"} ${LABEL[kind]}`} style={{ ...card, background: "var(--background, #fff)", color: "inherit", width: "min(640px,100%)", maxHeight: "90vh", overflow: "auto", display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>{editing ? "Edit" : "New"} {LABEL[kind]}</h3>
            {kind !== "QUOTE" && <input style={inp} placeholder="Title (optional)" value={form.title} onChange={(e) => set("title", e.target.value)} />}
            <textarea style={{ ...inp, minHeight: 90 }} placeholder={kind === "QUOTE" ? "Quote" : "Content"} value={form.body} onChange={(e) => set("body", e.target.value)} />
            {kind === "QUOTE" && <input style={inp} placeholder="Author" value={form.author} onChange={(e) => set("author", e.target.value)} />}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <label style={{ fontSize: 12 }}>Priority<select style={inp} value={form.priority} onChange={(e) => set("priority", e.target.value)}><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></label>
              <label style={{ fontSize: 12 }}>Start date<input type="date" style={inp} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></label>
              <label style={{ fontSize: 12 }}>End date<input type="date" style={inp} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></label>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
              <label><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Active</label>
              <label><input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} /> Pinned (shown first)</label>
            </div>
            {kind !== "QUOTE" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input style={inp} placeholder="Attachment URL (optional)" value={form.attachmentUrl} onChange={(e) => set("attachmentUrl", e.target.value)} />
                <input style={inp} placeholder="Attachment name" value={form.attachmentName} onChange={(e) => set("attachmentName", e.target.value)} />
              </div>
            )}
            <MultiPick label="Designations" options={aud.designations} value={form.designations} onChange={(v) => set("designations", v)} />
            <MultiPick label="Divisions" options={aud.divisions} value={form.divisions} onChange={(v) => set("divisions", v)} />
            <MultiPick label="HQs" options={aud.hqs} value={form.hqs} onChange={(v) => set("hqs", v)} />
            {error && <p style={{ color: "#b91c1c", margin: 0, fontSize: 13 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" style={btn("#475569")} onClick={reset}>Cancel</button>
              <button type="button" style={{ ...btn(), opacity: busy || !form.body.trim() ? 0.5 : 1 }} disabled={busy || !form.body.trim()} onClick={() => void save()}>{busy ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
      {preview && (kind === "QUOTE" ? <QuotePopup item={preview} onClose={() => setPreview(null)} /> : <NoticePopup item={preview} onClose={() => setPreview(null)} />)}
    </div>
  );
}

type Ticket = { id: string; employeeCode: string; employeeName?: string; subject: string; status: "OPEN" | "ANSWERED" | "CLOSED"; updatedAt: string; replies: { by: "EMPLOYEE" | "ADMIN"; name: string; message: string; at: string }[] };
export function TalkInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { setTickets((await apiClient.infoTickets(filter || undefined)).data as unknown as Ticket[]); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Could not load"); } }, [filter]);
  useEffect(() => { void load(); }, [load]);
  const cur = tickets.find((t) => t.id === sel) ?? null;
  async function send() { if (!cur || !text.trim()) return; try { await apiClient.replyTicket(cur.id, text); setText(""); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Reply failed"); } }
  async function status(s: string) { if (!cur) return; try { await apiClient.setTicketStatus(cur.id, s); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); } }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Talk to Us - Inbox</h2>
        <select style={{ ...inp, width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All</option><option value="OPEN">Open</option><option value="ANSWERED">Answered</option><option value="CLOSED">Closed</option></select>
      </div>
      {error && <p style={{ color: "#b91c1c", margin: 0, fontSize: 13 }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,320px) 1fr", gap: 14 }}>
        <div style={{ display: "grid", gap: 6, alignContent: "start" }}>
          {tickets.length === 0 && <p style={{ opacity: 0.7, fontSize: 14 }}>No requests.</p>}
          {tickets.map((t) => (
            <button key={t.id} type="button" onClick={() => setSel(t.id)} style={{ ...card, textAlign: "left", cursor: "pointer", background: sel === t.id ? "rgba(37,99,235,.14)" : "transparent", color: "inherit", font: "inherit" }}>
              <b style={{ fontSize: 14 }}>{t.subject}</b>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{t.employeeName || t.employeeCode} | {t.status}</div>
            </button>
          ))}
        </div>
        <div style={card}>
          {!cur ? <p style={{ opacity: 0.7, fontSize: 14, margin: 0 }}>Select a request to read and reply.</p> : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><b>{cur.subject}</b><span style={{ fontSize: 12 }}>{cur.employeeName || ""} ({cur.employeeCode}) | {cur.status}</span></div>
              {cur.replies.map((r, i) => (
                <div key={i} style={{ justifySelf: r.by === "ADMIN" ? "end" : "start", maxWidth: "85%", background: r.by === "ADMIN" ? "rgba(37,99,235,.14)" : "rgba(128,128,128,.18)", borderRadius: 12, padding: "6px 12px", fontSize: 14 }}>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>{r.by === "ADMIN" ? r.name || "Admin" : cur.employeeName || cur.employeeCode} - {new Date(r.at).toLocaleString()}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{r.message}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} placeholder="Write a reply..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void send(); }} />
                <button type="button" style={btn()} onClick={() => void send()}>Reply</button>
                {cur.status !== "CLOSED" ? <button type="button" style={btn("#475569")} onClick={() => void status("CLOSED")}>Close</button> : <button type="button" style={btn("#475569")} onClick={() => void status("OPEN")}>Reopen</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
