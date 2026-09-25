"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const CONFIG_KIND = "homepageDashboardDisplay";

type Settings = {
  dobDowListedDoctor: boolean;
};

function emptySettings(): Settings {
  return { dobDowListedDoctor: true };
}

function mergeSettings(loaded: unknown): Settings {
  const base = emptySettings();
  if (!loaded || typeof loaded !== "object") return base;
  return { ...base, ...(loaded as Partial<Settings>) };
}

// Matches sanpharma.info's Options >> Homepage Dashboard Display screen
// (Homepage_Dashboard_Display.aspx) exactly: one bordered box with a
// single "DOB / DOW (Listed Doctor)" checkbox and a Save button below it.
// Saving shows a centered confirmation popup, matching sanpharma's own
// native alert() (which is inherently centered).
export function HomepageDashboardDisplayPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [settings, setSettings] = useState<Settings>(emptySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .getAdminSetting(CONFIG_KIND)
      .then((res) => {
        if (!cancelled) setSettings(mergeSettings(res.data));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Homepage Dashboard Display");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiClient.saveAdminSetting(CONFIG_KIND, settings);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Homepage Dashboard Display");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Homepage Dashboard Display...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Homepage Dashboard Display</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <div
          style={{
            border: "1px solid #94a3b8",
            borderRadius: 4,
            padding: "10px 14px",
            maxWidth: 420,
            marginBottom: 20
          }}
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.dobDowListedDoctor}
              onChange={(e) => setSettings({ dobDowListedDoctor: e.target.checked })}
            />
            DOB / DOW (Listed Doctor)
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving}
          style={{
            border: "1px solid #1d4ed8",
            borderRadius: 6,
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            padding: "8px 24px",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {successOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "24px 28px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              maxWidth: 360,
              textAlign: "center"
            }}
          >
            <p className="text-sm mb-4">Saved Successfully</p>
            <button
              onClick={() => setSuccessOpen(false)}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "6px 24px",
                cursor: "pointer"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
