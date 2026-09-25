"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type FlashNewsValue = { content: string; setAsHomePage: boolean };

// Matches sanpharma.info's Options >> Flash News - Creation Page
// (FlashNews.aspx) exactly: one content textarea, a "Set as Home Page"
// checkbox, and Submit / Delete-Add Flash News / Clear buttons. Backed by
// the real single-document-per-tenant admin-settings store (kind
// "flashNews"), same mechanism as Base Level Setup etc.
export function FlashNewsPanel() {
  const [content, setContent] = useState("");
  const [setAsHomePage, setSetAsHomePage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.getAdminSetting<FlashNewsValue>("flashNews");
      setContent(res.data?.content ?? "");
      setSetAsHomePage(!!res.data?.setAsHomePage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Flash News");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting<FlashNewsValue>("flashNews", { content, setAsHomePage });
      setNotice("Flash News saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Flash News");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAdd() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting<FlashNewsValue>("flashNews", { content: "", setAsHomePage: false });
      setContent("");
      setSetAsHomePage(false);
      setNotice("Flash News deleted. You can add a new one.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete Flash News");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setContent("");
    setSetAsHomePage(false);
  }

  if (loading) return <div className="card p-4 text-sm">Loading Flash News...</div>;

  return (
    <div className="flex justify-center">
      <div className="card p-4" style={{ maxWidth: 640, width: "100%" }}>
      <h2 className="text-lg font-semibold mb-4">Flash News - Creation Page</h2>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

      <div className="flex items-start gap-3 mb-3">
        <label className="text-sm font-medium pt-2">Flash News Content</label>
        <textarea
          className="input"
          style={{ width: "100%", maxWidth: 560, minHeight: 110, border: "1px solid #94a3b8", borderRadius: 4, padding: 8 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-1 text-sm mb-4">
        <input type="checkbox" checked={setAsHomePage} onChange={(e) => setSetAsHomePage(e.target.checked)} />
        Set as Home Page
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={saving}
          style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}
        >
          {saving ? "Saving..." : "Submit"}
        </button>
        <button onClick={deleteAdd} disabled={saving} style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}>
          Delete-Add Flash News
        </button>
        <button onClick={clear} style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}>
          Clear
        </button>
      </div>
      </div>
    </div>
  );
}
