"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type TalkToUsValue = { content: string };

// Matches sanpharma.info's Options >> Talk To Us (TalktoUs.aspx) exactly:
// one textarea and a single Save button.
export function TalkToUsPanel() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.getAdminSetting<TalkToUsValue>("talkToUs");
      setContent(res.data?.content ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Talk to Us");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting<TalkToUsValue>("talkToUs", { content });
      setNotice("Talk to Us saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Talk to Us");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Talk to Us...</div>;

  return (
    <div className="flex justify-center">
      <div className="card p-4" style={{ maxWidth: 680, width: "100%" }}>
      <h2 className="text-lg font-semibold mb-4">Talk To Us</h2>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

      <div className="flex items-start gap-3 mb-4">
        <label className="text-sm font-medium pt-2">Talk to Us</label>
        <textarea
          className="input"
          style={{ width: "100%", maxWidth: 620, minHeight: 110, border: "1px solid #94a3b8", borderRadius: 4, padding: 8 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}
      >
        {saving ? "Saving..." : "Save"}
      </button>
      </div>
    </div>
  );
}
