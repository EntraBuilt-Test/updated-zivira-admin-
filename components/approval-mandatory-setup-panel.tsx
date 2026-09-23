"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const CONFIG_KIND = "approvalMandatorySetup";

// Matches sanpharma.info's Options >> Approval Mandatory Setup screen
// exactly: a single bordered box listing every transaction type as a
// checkbox (checked = approval mandatory for that transaction) and one
// "Update" button below it — no table, no per-row Add/Edit/Status, no
// separate "Add Approval Mandatory Setup" flow. Persisted as one JSON
// blob via CompanyConfigModel under adminSettings:approvalMandatorySetup
// (getAdminSetting / saveAdminSetting), same pattern as the other
// single-document admin screens in this app.
const TRANSACTION_TYPES = [
  "DCR",
  "TP",
  "Leave",
  "Expense",
  "Listed dr Addition",
  "Listed dr Deactivation",
  "Listed dr Addition against Deactivation",
  "SS Entry",
  "Doctor Service Form"
] as const;

type MandatoryMap = Record<string, boolean>;

function emptyMap(): MandatoryMap {
  const m: MandatoryMap = {};
  for (const t of TRANSACTION_TYPES) m[t] = false;
  return m;
}

function mergeMap(loaded: unknown): MandatoryMap {
  const base = emptyMap();
  if (!loaded || typeof loaded !== "object") return base;
  const l = loaded as MandatoryMap;
  for (const t of TRANSACTION_TYPES) {
    if (typeof l[t] === "boolean") base[t] = l[t];
  }
  return base;
}

export function ApprovalMandatorySetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [checks, setChecks] = useState<MandatoryMap>(emptyMap());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .getAdminSetting(CONFIG_KIND)
      .then((res) => {
        if (!cancelled) setChecks(mergeMap(res.data));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Approval Mandatory Setup");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(t: string) {
    setChecks((prev) => ({ ...prev, [t]: !prev[t] }));
  }

  async function update() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting(CONFIG_KIND, checks);
      setNotice("Approval Mandatory Setup updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update Approval Mandatory Setup");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-4 text-sm">Loading Approval Mandatory Setup...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Approval Mandatory Setup</h2>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      <div className="card p-4" style={{ maxWidth: 420 }}>
        <div className="border rounded p-3 space-y-2">
          {TRANSACTION_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={checks[t]} onChange={() => toggle(t)} />
              {t}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <button className="btn btn-primary" onClick={update} disabled={saving}>
            {saving ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
