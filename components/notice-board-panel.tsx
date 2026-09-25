"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomDatePicker } from "@/components/custom-date-picker";

type NoticeBoardValue = {
  content1: string;
  content2: string;
  content3: string;
  startDate: string;
  endDate: string;
  setAsHomePage: boolean;
};

const EMPTY: NoticeBoardValue = { content1: "", content2: "", content3: "", startDate: "", endDate: "", setAsHomePage: false };

// Matches sanpharma.info's Options >> Notice Board (NoticeBoard.aspx)
// exactly: three content textareas, Start Date/End Date, "Set as Home
// Page" checkbox, and Save/Clear (with the "Edit" link simply meaning the
// saved values are already editable in place).
export function NoticeBoardPanel() {
  const [value, setValue] = useState<NoticeBoardValue>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.getAdminSetting<NoticeBoardValue>("noticeBoard");
      setValue({ ...EMPTY, ...(res.data ?? {}) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Notice Board");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function set<K extends keyof NoticeBoardValue>(key: K, v: NoticeBoardValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting<NoticeBoardValue>("noticeBoard", value);
      setNotice("Notice Board saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Notice Board");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setValue(EMPTY);
  }

  if (loading) return <div className="card p-4 text-sm">Loading Notice Board...</div>;

  return (
    <div className="flex justify-center">
      <div className="card p-4" style={{ maxWidth: 680, width: "100%" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notice Board</h2>
        <button onClick={load} className="text-sm text-blue-700 underline">
          Edit
        </button>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {notice && <div className="text-sm text-green-700 mb-3">{notice}</div>}

      {(["content1", "content2", "content3"] as const).map((key, i) => (
        <div key={key} className="flex items-start gap-3 mb-3">
          <label className="text-sm font-medium pt-2" style={{ width: 90 }}>
            Content{i + 1}
          </label>
          <textarea
            className="input"
            style={{ width: "100%", maxWidth: 560, minHeight: 90, border: "1px solid #94a3b8", borderRadius: 4, padding: 8 }}
            value={value[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        </div>
      ))}

      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium" style={{ width: 90 }}>
          Start Date
        </label>
        <CustomDatePicker value={value.startDate} onChange={(v) => set("startDate", v)} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium" style={{ width: 90 }}>
          End Date
        </label>
        <CustomDatePicker value={value.endDate} onChange={(v) => set("endDate", v)} />
      </div>

      <label className="flex items-center gap-1 text-sm mb-4">
        <input type="checkbox" checked={value.setAsHomePage} onChange={(e) => set("setAsHomePage", e.target.checked)} />
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
        <button onClick={clear} style={{ border: "1px solid #94a3b8", borderRadius: 4, padding: "6px 16px", background: "#e5e7eb", fontWeight: 600 }}>
          Clear
        </button>
      </div>
      </div>
    </div>
  );
}
