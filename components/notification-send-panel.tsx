"use client";

import { useEffect, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { CustomDatePicker } from "@/components/custom-date-picker";

const FILTER_BY_OPTIONS = ["FieldForce Base wise", "HQ wise", "Zone wise", "State wise", "Designation wise"];

/**
 * Real "Notification Message" screen. Compose + Send calls POST
 * /company/masters/notificationMessage/action/send, which resolves
 * filterBy/filterValue against the real EmployeeModel and actually
 * broadcasts via notifyFieldRep/notifyManager (both write a real Notice
 * document the Field/Manager portals already poll for their notification
 * bell), then flips the row's status to "Sent".
 */
export function NotificationSendPanel({ masterKey }: { masterKey: string }) {
  const [rows, setRows] = useState<MasterRecord[]>([]);
  const [filterBy, setFilterBy] = useState("FieldForce Base wise");
  const [filterValue, setFilterValue] = useState("");
  const [message, setMessage] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    const res = await apiClient.masterRecords(masterKey);
    setRows(res.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!message.trim()) { setError("Enter a message"); return; }
    if (!effectiveFrom) { setError("Select Effective From date"); return; }

    setSaving(true);
    try {
      const res = await apiClient.sendNotificationMessage({
        filterBy,
        filterValue,
        message,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined
      });
      setSuccess(`Sent to ${res.data.notified} of ${res.data.matched} matched employee${res.data.matched === 1 ? "" : "s"} — they'll see it in their portal's notification bell.`);
      setFilterValue("");
      setMessage("");
      setEffectiveFrom("");
      setEffectiveTo("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Notification Message</h2>
        <p className="text-sm text-text-muted mt-1">Broadcasts a real in-app notification to the matching field force / managers.</p>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "560px" }}>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</div>}

        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Filter By</span>
          <CustomSelect value={filterBy} options={FILTER_BY_OPTIONS} onChange={setFilterBy} placeholder="Select filter" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Filter Value {filterBy === "FieldForce Base wise" ? "(leave blank for All)" : ""}</span>
          <input className="input" style={{ width: "100%" }} value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="e.g. Mumbai, RBM, All" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Message</span>
          <textarea className="input" style={{ width: "100%", minHeight: "90px" }} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <div style={{ flex: 1 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Effective From</span>
            <CustomDatePicker value={effectiveFrom} onChange={setEffectiveFrom} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Effective To</span>
            <CustomDatePicker value={effectiveTo} onChange={setEffectiveTo} />
          </div>
        </div>
        <button className="button" type="button" disabled={saving} onClick={submit}>
          {saving ? "Sending..." : "Send Notification"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "360px" }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-subtle sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Filter By</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Filter Value</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Message</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-text-muted text-sm">No notifications sent yet.</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-subtle/60">
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.filterBy ?? "")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.filterValue ?? "")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary max-w-xs truncate">{String(row.message ?? "")}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{String(row.status ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
