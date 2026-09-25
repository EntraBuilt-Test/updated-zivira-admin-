"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type QuoteValue = { quote: string; setAsHomePage: boolean };

// Matches sanpharma.info's Options >> Quote For The Week (Quote.aspx)
// exactly: one Quote textarea, "Set as Home Page" checkbox, Save /
// Delete-Add Quote buttons.
export function QuoteOfTheWeekPanel() {
  const [quote, setQuote] = useState("");
  const [setAsHomePage, setSetAsHomePage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.getAdminSetting<QuoteValue>("quoteOfTheWeek");
      setQuote(res.data?.quote ?? "");
      setSetAsHomePage(!!res.data?.setAsHomePage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Quote for the Week");
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
      await apiClient.saveAdminSetting<QuoteValue>("quoteOfTheWeek", { quote, setAsHomePage });
      setNotice("Quote saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Quote");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAdd() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting<QuoteValue>("quoteOfTheWeek", { quote: "", setAsHomePage: false });
      setQuote("");
      setSetAsHomePage(false);
      setNotice("Quote deleted. You can add a new one.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete Quote");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Quote for the Week...</div>;

  return (
    <div className="flex justify-center">
      <div className="card p-4" style={{ maxWidth: 680, width: "100%" }}>
      <h2 className="text-lg font-semibold mb-4">Quote For The Week</h2>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

      <div className="flex items-start gap-3 mb-3">
        <label className="text-sm font-medium pt-2">Quote</label>
        <textarea
          className="input"
          style={{ width: "100%", maxWidth: 620, minHeight: 110, border: "1px solid #94a3b8", borderRadius: 4, padding: 8 }}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-1 text-sm mb-4">
        <input type="checkbox" checked={setAsHomePage} onChange={(e) => setSetAsHomePage(e.target.checked)} />
        Set as Home Page
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={deleteAdd} disabled={saving} style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}>
          Delete-Add Quote
        </button>
      </div>
      </div>
    </div>
  );
}
