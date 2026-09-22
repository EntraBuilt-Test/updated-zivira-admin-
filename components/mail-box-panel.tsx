"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MailRecord, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const SYSTEM_FOLDERS = ["Inbox", "Sent Mails", "Viewed Mails"];

/**
 * Real "Mail Box" screen. Backed entirely by the internal-mail system —
 * GET/POST /company/mail and its :id/read, :id/move, :id/delete actions
 * (see mail.routes.ts) — not the generic masters CRUD console. Folders are
 * the fixed system folders (Inbox / Sent Mails / Viewed Mails) plus any
 * active custom folder defined under the "Mail Folder Creation" master.
 */
export function MailBoxPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("Inbox");
  const [mail, setMail] = useState<MailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MailRecord | null>(null);

  const [composing, setComposing] = useState(false);
  const [toEmployeeCode, setToEmployeeCode] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [moveTarget, setMoveTarget] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  const folders = useMemo(() => [...SYSTEM_FOLDERS, ...customFolders], [customFolders]);

  async function loadFolders() {
    try {
      const res = await apiClient.masterRecords("mailFolderCreation");
      const active = res.data
        .filter((r) => String(r.status ?? "Active") !== "Inactive")
        .map((r) => String(r.mailFolderName ?? ""))
        .filter(Boolean);
      setCustomFolders(active);
    } catch {
      setCustomFolders([]);
    }
  }

  async function loadMail(folder: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listMail({ folder });
      setMail(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mail");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFolders();
    apiClient
      .masterRecords("employees")
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelected(null);
    loadMail(selectedFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  const employeeOptions = Array.from(
    new Set(employees.map((e) => String(e.employeeCode ?? "")).filter(Boolean))
  ).sort();
  const employeeName = (code: string) =>
    employees.find((e) => String(e.employeeCode ?? "") === code)?.name;

  async function openMessage(m: MailRecord) {
    setSelected(m);
    setMoveTarget("");
    if (!m.readAt) {
      try {
        const res = await apiClient.markMailRead(m.id);
        setSelected(res.data);
        await loadMail(selectedFolder);
      } catch {
        // Non-fatal — the message still opens even if the read-marking call failed.
      }
    }
  }

  async function submitCompose() {
    setComposeError(null);
    if (!toEmployeeCode) { setComposeError("Select a recipient"); return; }
    if (!subject.trim()) { setComposeError("Enter a subject"); return; }

    setSending(true);
    try {
      await apiClient.sendMail({ toEmployeeCode, subject, body, folder: "Inbox" });
      setComposing(false);
      setToEmployeeCode("");
      setSubject("");
      setBody("");
      if (selectedFolder === "Sent Mails" || selectedFolder === "Inbox") await loadMail(selectedFolder);
      await loadFolders();
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Failed to send mail");
    } finally {
      setSending(false);
    }
  }

  async function moveSelected() {
    if (!selected || !moveTarget) return;
    setBusyAction(true);
    try {
      await apiClient.moveMail(selected.id, moveTarget);
      setSelected(null);
      await loadMail(selectedFolder);
      await loadFolders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move mail");
    } finally {
      setBusyAction(false);
    }
  }

  async function deleteSelected() {
    if (!selected) return;
    setBusyAction(true);
    try {
      await apiClient.deleteMail(selected.id);
      setSelected(null);
      await loadMail(selectedFolder);
      await loadFolders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete mail");
    } finally {
      setBusyAction(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">Mail Box</h2>
          <p className="text-sm text-text-muted mt-1">Real internal mail — send, read, move and delete messages.</p>
        </div>
        <button
          className="button"
          type="button"
          onClick={() => {
            setComposing((v) => !v);
            setComposeError(null);
          }}
        >
          {composing ? "Cancel" : "Compose"}
        </button>
      </div>

      {composing && (
        <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "560px" }}>
          {composeError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{composeError}</div>}
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">To (Employee Code)</span>
            <CustomSelect value={toEmployeeCode} options={employeeOptions} onChange={setToEmployeeCode} placeholder="Select employee code" />
            {toEmployeeCode && employeeName(toEmployeeCode) && (
              <span className="block text-xs text-text-muted mt-1">{employeeName(toEmployeeCode)}</span>
            )}
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Subject</span>
            <input className="input" style={{ width: "100%" }} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Message</span>
            <textarea className="input" style={{ width: "100%", minHeight: "120px" }} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <button className="button" type="button" disabled={sending} onClick={submitCompose}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start flex-wrap lg:flex-nowrap">
        {/* Folder sidebar */}
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col shrink-0" style={{ width: "220px" }}>
          <div className="px-4 py-3 border-b border-border-subtle">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Folders</span>
          </div>
          <div className="flex flex-col py-2">
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`text-left px-4 py-2 text-sm transition-colors ${
                  selectedFolder === folder
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-text-primary hover:bg-surface-subtle"
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Message list */}
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col flex-1 min-w-0">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{selectedFolder}</span>
            {loading && <span className="text-xs text-text-muted">Loading...</span>}
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border-b border-red-200 px-4 py-2">{error}</div>}
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "480px" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">From</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">To</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Sent On</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && mail.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-text-muted text-sm">No messages in this folder.</td></tr>
                )}
                {mail.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => openMessage(m)}
                    className={`border-b border-border-subtle hover:bg-surface-subtle/60 cursor-pointer ${
                      selected?.id === m.id ? "bg-surface-subtle" : ""
                    }`}
                  >
                    <td className={`px-4 py-3 text-sm text-text-primary ${!m.readAt ? "font-semibold" : ""}`}>{m.subject}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{m.fromName || m.fromEmployeeCode || ""}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{m.toName || m.toEmployeeCode || ""}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.readAt ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {m.readAt ? "Read" : "Unread"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message detail */}
        {selected && (
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col shrink-0" style={{ width: "360px" }}>
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Message</span>
              <button className="text-xs text-text-muted hover:text-text-primary" type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <span className="block text-xs font-medium text-text-muted">Subject</span>
                <span className="block text-sm font-semibold text-text-primary">{selected.subject}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted">From</span>
                <span className="block text-sm text-text-primary">{selected.fromName || selected.fromEmployeeCode}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted">To</span>
                <span className="block text-sm text-text-primary">{selected.toName || selected.toEmployeeCode}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted">Sent On</span>
                <span className="block text-sm text-text-primary">{selected.sentAt ? new Date(selected.sentAt).toLocaleString() : ""}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Body</span>
                <div className="text-sm text-text-primary bg-surface-subtle rounded-lg p-3 whitespace-pre-wrap" style={{ minHeight: "80px" }}>
                  {selected.body || <span className="text-text-muted">(no content)</span>}
                </div>
              </div>

              <div className="border-t border-border-subtle pt-3 flex flex-col gap-2">
                <span className="block text-xs font-medium text-text-muted mb-1">Move To</span>
                <CustomSelect value={moveTarget} options={folders.filter((f) => f !== selected.folder)} onChange={setMoveTarget} placeholder="Select folder" />
                <div className="flex gap-2 mt-1">
                  <button className="button" type="button" disabled={!moveTarget || busyAction} onClick={moveSelected}>
                    Move
                  </button>
                  <button
                    className="button"
                    type="button"
                    style={{ backgroundColor: "#dc2626" }}
                    disabled={busyAction}
                    onClick={deleteSelected}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
