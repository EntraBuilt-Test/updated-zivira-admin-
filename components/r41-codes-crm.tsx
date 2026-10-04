"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

// Round 41 -- admin editing of the DCR Status legend (Work Type Code master)
// and review (approve / reject) of doctor CRM entries raised from the field app.
const CATEGORIES = ["Field", "Leave", "Holiday", "Office", "Meeting", "Training", "Travel", "Other"];

export function WorkTypeCodesCard() {
  const [rows, setRows] = useState<{ code: string; name: string; category: string }[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { apiClient.workTypeCodes().then((r) => setRows(r.data)).catch(() => setRows([])); }, []);
  useEffect(load, [load]);
  async function add() {
    setMsg("");
    try { await apiClient.saveWorkTypeCode({ code, name, category }); setCode(""); setName(""); load(); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Save failed"); }
  }
  const input = "h-9 px-2 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary text-sm";
  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-base font-semibold">Work Type Codes (DCR Status legend)</h3>
      <p className="text-xs text-text-muted">Names can be edited by saving the same code again. DCRs, leave and attendance carry one of these codes and the DCR Status grid is computed from it.</p>
      <div className="flex flex-wrap gap-2 text-sm">
        {rows.map((r) => <span key={r.code} className="px-2 py-1 rounded bg-surface-subtle border border-border-subtle"><strong>{r.code}</strong> {r.name} <em className="text-text-muted">({r.category})</em></span>)}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input className={input + " w-24"} placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className={input + " w-56"} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <button type="button" className="button" disabled={!code || !name} onClick={() => void add()}>Save code</button>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
    </div>
  );
}

type Crm = { _id?: string; id?: string; employeeName?: string; employeeCode?: string; doctorName?: string; date?: string; type?: string; amountRs?: number; status?: string };

export function CrmReviewCard() {
  const [rows, setRows] = useState<Crm[]>([]);
  const [err, setErr] = useState("");
  const load = useCallback(() => { apiClient.crmEntries({ status: "PENDING" }).then((r) => setRows(r.data as Crm[])).catch((e) => setErr(e instanceof Error ? e.message : "Unable to load")); }, []);
  useEffect(load, [load]);
  async function act(id: string, action: "approve" | "reject") {
    try { await apiClient.crmAction(id, action); load(); } catch (e) { setErr(e instanceof Error ? e.message : "Action failed"); }
  }
  return (
    <div className="card p-4 space-y-2">
      <h3 className="text-base font-semibold">CRM entries awaiting approval</h3>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {rows.length === 0 ? <p className="text-sm text-text-muted">No pending CRM entries.</p> : (
        <table className="w-full text-sm text-left"><thead><tr><th className="py-1">Field Force</th><th>Doctor</th><th>Date</th><th>Type</th><th>Amount (Rs)</th><th /></tr></thead>
          <tbody>{rows.map((r) => { const id = String(r._id || r.id); return (
            <tr key={id} className="border-t border-border-subtle"><td className="py-1">{r.employeeName || r.employeeCode}</td><td>{r.doctorName || "-"}</td><td>{r.date}</td><td>{r.type}</td><td>{r.amountRs}</td>
              <td className="space-x-2"><button type="button" className="button" onClick={() => void act(id, "approve")}>Approve</button><button type="button" className="button" onClick={() => void act(id, "reject")}>Reject</button></td></tr>
          ); })}</tbody></table>
      )}
    </div>
  );
}
