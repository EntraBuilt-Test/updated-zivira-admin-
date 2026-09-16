"use client";
import { Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, type DcrRecord } from "@/lib/api-client";
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  SUBMITTED:        { bg:"#fef9c3", color:"#a16207" },
  MANAGER_APPROVED: { bg:"#dbeafe", color:"#1d4ed8" },
  APPROVED:         { bg:"#dcfce7", color:"#15803d" },
  REJECTED:         { bg:"#fee2e2", color:"#b91c1c" },
  DRAFT:            { bg:"#f3f4f6", color:"#6b7280" }
};
export function AdminDcrView() {
  const [dcrs, setDcrs]       = useState<DcrRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  async function load() {
    setLoading(true); setError("");
    try { setDcrs((await apiClient.dcrs()).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Load failed"); }
    finally { setLoading(false); }
  }
  async function approve(id: string) {
    try { await apiClient.approveDcr(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Approval failed"); }
  }
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { void load(); }, 600000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="subdivision-console">
      <div className="subdivision-head">
        <div>
          <p className="subdivision-eyebrow">Admin Review</p>
          <h2>DCR Reports</h2>
          <p style={{ display:"flex", alignItems:"center", gap:6 }}><Clock size={13} /> Live DCR records from Field Force and Manager review. Auto-refreshes every 10 minutes for MIS demo flow.</p>
        </div>
        <button className="button button-secondary" onClick={load} type="button"><RefreshCw size={15} />{loading ? "Loading" : "Refresh"}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">S.No</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Employee</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Visit Date</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Session</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Time</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Products</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Samples</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Inputs</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Joint Work</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Manager Approved By</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Status</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {dcrs.map((dcr, i) => {
              const sc = STATUS_COLORS[dcr.status] ?? STATUS_COLORS["DRAFT"];
              return (
                <tr className="hover:bg-surface-subtle/50 transition-colors group" key={dcr.id}>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ color:"var(--muted)" }}>{i+1}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><strong style={{ color:"var(--ink)" }}>{dcr.employeeCode}</strong></td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12, color:"var(--muted)" }}>{new Date(dcr.visitDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:11, fontWeight:600, color:"var(--muted)" }}>{dcr.callSession ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12, color:"var(--muted)" }}>{dcr.callTime ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12, color:"var(--muted)", maxWidth:130 }}>{dcr.productsDetailed?.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12 }}>{dcr.samplesGiven?.length ? dcr.samplesGiven.map(s => `${s.productName}×${s.qty}`).join(", ") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12 }}>{dcr.inputsGiven?.length ? dcr.inputsGiven.map(s => `${s.inputName}×${s.qty}`).join(", ") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12 }}>{dcr.jointWork?.accompanyingManager ? `${dcr.jointWork.accompanyingManager} · ${dcr.jointWork.jointWorkType?.replace(/_/g," ")}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" style={{ fontSize:12, color:"var(--muted)" }}>{dcr.managerApprovedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><span style={{ ...sc, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{dcr.status.replace(/_/g," ")}</span></td>
                  <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    {dcr.status === "MANAGER_APPROVED" ? (
                      <button onClick={() => approve(dcr.id)} type="button" className="button" style={{ padding:"5px 12px", fontSize:12 }}>Approve</button>
                    ) : <span style={{ color:"var(--muted)", fontSize:12 }}>—</span>}
                  </td>
                </tr>
              );
            })}
            {!loading && dcrs.length === 0 && (
              <tr className="hover:bg-surface-subtle/50 transition-colors group"><td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap" colSpan={12} style={{ textAlign:"center", color:"var(--muted)", padding:40 }}>
                <Clock size={28} style={{ margin:"0 auto 8px", display:"block", opacity:0.3 }} />
                No DCRs visible yet — entries appear after 24 hours from submission.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
