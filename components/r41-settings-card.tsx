"use client";

import { useEffect, useState } from "react";
import { apiClient, type R41Settings } from "@/lib/api-client";

// Round 41 -- configurable DCR lock window (Gap A) and the per-category visit
// norms (Nil / CORE / N CORE / S CORE) used by Missed Call, Review Report and
// Assessment. Saved company-wide; defaults are 3 days and 2/2/2/1.
const TIERS = ["NIL", "CORE", "N CORE", "S CORE"] as const;

export function R41SettingsCard() {
  const [s, setS] = useState<R41Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    apiClient.r41Settings().then((r) => setS(r.data)).catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Unable to load settings" }));
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true); setMsg(null);
    try {
      const r = await apiClient.saveR41Settings(s);
      setS(r.data);
      setMsg({ ok: true, text: "Saved." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
    } finally { setSaving(false); }
  }

  if (!s) return msg ? <div className="card p-3 text-sm text-red-600">{msg.text}</div> : null;
  const input = "h-9 w-20 px-2 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary text-sm";
  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-base font-semibold">DCR Lock and Category Norms</h3>
      <div className="flex flex-wrap items-end gap-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">DCR lock after (days)</span>
          <input type="number" min={0} max={60} className={input} value={s.dcrDelayDays} onChange={(e) => setS({ ...s, dcrDelayDays: Number(e.target.value) })} />
          <span className="text-xs text-text-muted">A DCR date with no submission locks once today is more than this many days after it. Release it from Options &gt; Delayed Release.</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Company timezone</span>
          <input className={input + " w-44"} value={s.companyTimezone} onChange={(e) => setS({ ...s, companyTimezone: e.target.value })} />
        </label>
      </div>
      <div>
        <p className="text-sm font-semibold mb-1">Visit norms per month (calls per doctor)</p>
        <div className="flex flex-wrap gap-4">
          {TIERS.map((t) => (
            <label key={t} className="flex flex-col gap-1 text-sm">
              <span>{t === "NIL" ? "Nil" : t}</span>
              <input type="number" min={0} max={31} className={input} value={s.categoryNorms[t]} onChange={(e) => setS({ ...s, categoryNorms: { ...s.categoryNorms, [t]: Number(e.target.value) } })} />
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save"}</button>
        {msg && <span className={"text-sm " + (msg.ok ? "text-green-700" : "text-red-600")}>{msg.text}</span>}
      </div>
    </div>
  );
}
