"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "orderBookingSetup";
const COMMON_KEY = "orderBookingCommon";
const SELECT_CLEAR = "---Select---";

const MODE_OPTIONS = ["Order Booking", "Order Type Needed", "Min Order Value", "Common"] as const;
type Mode = (typeof MODE_OPTIONS)[number];

const ORDER_TYPE_COLUMNS = ["No Need", "Primary", "Secondary", "Both"] as const;
type OrderTypeColumn = (typeof ORDER_TYPE_COLUMNS)[number];

const PRICE_OPTIONS = ["Distributor Price", "Retailer Price", "NSR Price"] as const;

function employeeLabel(e: MasterRecord): string {
  return `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`;
}

type NeededRow = { name: string; empCode: string; needed: "Needed" | "Not Needed"; existing?: MasterRecord };
type TypeRow = { name: string; empCode: string; orderType: OrderTypeColumn; existing?: MasterRecord };
type MinValueRow = { name: string; empCode: string; minPri: string; minSec: string; foc: "Yes" | "No"; existing?: MasterRecord };

type CommonState = {
  primaryRateBasedOn: string;
  secondaryRateBasedOn: string;
  approvalSystemNeeded: "Needed" | "Not Needed";
  approvalSystemBasedOn: string;
  attachmentNeeded: "Needed" | "Not Needed";
  discountNeeded: "Needed" | "Not Needed";
};

function emptyCommon(): CommonState {
  return {
    primaryRateBasedOn: "Distributor Price",
    secondaryRateBasedOn: "Retailer Price",
    approvalSystemNeeded: "Not Needed",
    approvalSystemBasedOn: "Auto Approval",
    attachmentNeeded: "Not Needed",
    discountNeeded: "Not Needed"
  };
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px" };
const head: React.CSSProperties = { ...cell, background: "#0f2f52", color: "#fff", fontWeight: 600, textAlign: "center" };

// Matches sanpharma.info's Options >> Order Booking Setup screen
// (Order_booking_setuppage.aspx) exactly: a Mode dropdown (Order Booking /
// Order Type Needed / Min Order Value / Common) that switches the whole
// screen. The first three modes share a FieldForce search box + Go button
// and a bordered results table with a header-row "for all" control that
// bulk-sets every row's value; Common has no FieldForce picker and instead
// shows the tenant-wide Rate Based / Approval System / Attachment Need /
// Discount Need config, persisted as a single CompanyConfig blob.
export function OrderBookingSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [mode, setMode] = useState<Mode | "">("");
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [fieldForce, setFieldForce] = useState("");
  const [searched, setSearched] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [neededRows, setNeededRows] = useState<NeededRow[]>([]);
  const [typeRows, setTypeRows] = useState<TypeRow[]>([]);
  const [minRows, setMinRows] = useState<MinValueRow[]>([]);
  const [common, setCommon] = useState<CommonState>(emptyCommon());

  useEffect(() => {
    let cancelled = false;
    apiClient
      .masterRecords("employees")
      .then((res) => {
        if (!cancelled) setEmployees(res.data);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fieldForceOptions = useMemo(
    () => [SELECT_CLEAR, ...[...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))).map(employeeLabel)],
    [employees]
  );

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))), [employees]);

  async function go() {
    if (!mode) return;
    setError(null);
    setNotice(null);
    setSearched(true);

    if (mode === "Common") {
      setLoadingRows(true);
      try {
        const res = await apiClient.getAdminSetting<CommonState>(COMMON_KEY);
        setCommon({ ...emptyCommon(), ...(res.data ?? {}) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Order Booking Common settings");
      } finally {
        setLoadingRows(false);
      }
      return;
    }

    setLoadingRows(true);
    try {
      const recordsRes = await apiClient.masterRecords(MASTER_KEY);
      const modeRecords = recordsRes.data.filter((r) => String(r.mode ?? "") === mode);

      if (mode === "Order Booking") {
        setNeededRows(
          sortedEmployees.map((e) => {
            const name = String(e.name ?? "");
            const existing = modeRecords.find((r) => String(r.fieldForceName ?? "") === name);
            return { name, empCode: String(e.employeeCode ?? ""), needed: existing ? (String(existing.needed ?? "Needed") as "Needed" | "Not Needed") : "Needed", existing };
          })
        );
      } else if (mode === "Order Type Needed") {
        setTypeRows(
          sortedEmployees.map((e) => {
            const name = String(e.name ?? "");
            const existing = modeRecords.find((r) => String(r.fieldForceName ?? "") === name);
            return {
              name,
              empCode: String(e.employeeCode ?? ""),
              orderType: existing ? (String(existing.orderType ?? "No Need") as OrderTypeColumn) : "No Need",
              existing
            };
          })
        );
      } else if (mode === "Min Order Value") {
        setMinRows(
          sortedEmployees.map((e) => {
            const name = String(e.name ?? "");
            const existing = modeRecords.find((r) => String(r.fieldForceName ?? "") === name);
            return {
              name,
              empCode: String(e.employeeCode ?? ""),
              minPri: existing ? String(existing.minPriOrderValue ?? "") : "",
              minSec: existing ? String(existing.minSecOrderValue ?? "") : "",
              foc: existing ? (String(existing.foc ?? "No") as "Yes" | "No") : "No",
              existing
            };
          })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Order Booking Setup");
    } finally {
      setLoadingRows(false);
    }
  }

  function setAllNeeded(value: "Needed" | "Not Needed") {
    setNeededRows((prev) => prev.map((r) => ({ ...r, needed: value })));
  }
  function setAllType(value: OrderTypeColumn) {
    setTypeRows((prev) => prev.map((r) => ({ ...r, orderType: value })));
  }
  function setAllFoc(value: "Yes" | "No") {
    setMinRows((prev) => prev.map((r) => ({ ...r, foc: value })));
  }

  async function saveNeeded() {
    setSaving(true);
    setError(null);
    try {
      for (const row of neededRows) {
        const payload = { mode: "Order Booking", fieldForceName: row.name, needed: row.needed };
        if (row.existing) await apiClient.updateMasterRecord(MASTER_KEY, row.existing.id, payload);
        else await apiClient.createMasterRecord(MASTER_KEY, payload);
      }
      setNotice("Order Booking Setup saved successfully.");
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveType() {
    setSaving(true);
    setError(null);
    try {
      for (const row of typeRows) {
        const payload = { mode: "Order Type Needed", fieldForceName: row.name, orderType: row.orderType };
        if (row.existing) await apiClient.updateMasterRecord(MASTER_KEY, row.existing.id, payload);
        else await apiClient.createMasterRecord(MASTER_KEY, payload);
      }
      setNotice("Order Type Needed saved successfully.");
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveMin() {
    setSaving(true);
    setError(null);
    try {
      for (const row of minRows) {
        const payload = {
          mode: "Min Order Value",
          fieldForceName: row.name,
          minPriOrderValue: Number(row.minPri) || 0,
          minSecOrderValue: Number(row.minSec) || 0,
          foc: row.foc
        };
        if (row.existing) await apiClient.updateMasterRecord(MASTER_KEY, row.existing.id, payload);
        else await apiClient.createMasterRecord(MASTER_KEY, payload);
      }
      setNotice("Min Order Value saved successfully.");
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveCommon() {
    setSaving(true);
    setError(null);
    try {
      await apiClient.saveAdminSetting(COMMON_KEY, common);
      setNotice("Order Booking Common settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 text-center">
        <h2 className="text-lg font-semibold mb-4">Order Booking Setup</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Mode</label>
            <CustomSelect
              value={mode || SELECT_CLEAR}
              options={[SELECT_CLEAR, ...MODE_OPTIONS]}
              onChange={(v) => {
                setMode(v === SELECT_CLEAR ? "" : (v as Mode));
                setSearched(false);
              }}
              placeholder={SELECT_CLEAR}
            />
          </div>
          {mode && mode !== "Common" && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">FieldForce</label>
              <CustomSelect
                value={fieldForce || SELECT_CLEAR}
                options={fieldForceOptions}
                onChange={(v) => setFieldForce(v === SELECT_CLEAR ? "" : v)}
                placeholder={SELECT_CLEAR}
              />
            </div>
          )}
          {mode && (
            <button
              onClick={go}
              disabled={loadingRows}
              style={{
                border: "1px solid #1d4ed8",
                borderRadius: 6,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                padding: "8px 24px",
                cursor: loadingRows ? "default" : "pointer",
                opacity: loadingRows ? 0.7 : 1
              }}
            >
              {loadingRows ? "Loading..." : "Go"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {searched && mode === "Order Booking" && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>Field Force Name</th>
                <th style={head}>Needed</th>
                <th style={head}>Not Needed</th>
              </tr>
              <tr>
                <td style={{ ...cell, textAlign: "center" }}>
                  <label className="flex items-center justify-center gap-1 text-xs text-red-600 font-semibold">
                    <input type="radio" name="neededAll" onChange={() => setAllNeeded("Needed")} /> Needed for all
                  </label>
                </td>
                <td style={{ ...cell, textAlign: "center" }}>
                  <label className="flex items-center justify-center gap-1 text-xs text-red-600 font-semibold">
                    <input type="radio" name="neededAll" onChange={() => setAllNeeded("Not Needed")} /> Not Needed for all
                  </label>
                </td>
              </tr>
            </thead>
            <tbody>
              {neededRows.map((row, i) => (
                <tr key={row.name}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{row.name} - {row.empCode}</td>
                  <td style={{ ...cell, textAlign: "center" }}>
                    <input type="radio" name={`needed-${row.name}`} checked={row.needed === "Needed"} onChange={() => setNeededRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, needed: "Needed" } : r)))} />
                  </td>
                  <td style={{ ...cell, textAlign: "center" }}>
                    <input type="radio" name={`needed-${row.name}`} checked={row.needed === "Not Needed"} onChange={() => setNeededRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, needed: "Not Needed" } : r)))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-5">
            <button onClick={saveNeeded} disabled={saving} style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {searched && mode === "Order Type Needed" && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>Field Force Name</th>
                {ORDER_TYPE_COLUMNS.map((c) => (
                  <th key={c} style={head}>{c}</th>
                ))}
              </tr>
              <tr>
                {ORDER_TYPE_COLUMNS.map((c) => (
                  <td key={c} style={{ ...cell, textAlign: "center" }}>
                    <label className="flex items-center justify-center gap-1 text-xs text-red-600 font-semibold">
                      <input type="checkbox" onChange={() => setAllType(c)} /> {c} for all
                    </label>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {typeRows.map((row, i) => (
                <tr key={row.name}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{row.name} - {row.empCode}</td>
                  {ORDER_TYPE_COLUMNS.map((c) => (
                    <td key={c} style={{ ...cell, textAlign: "center" }}>
                      <input
                        type="radio"
                        name={`type-${row.name}`}
                        checked={row.orderType === c}
                        onChange={() => setTypeRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, orderType: c } : r)))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-5">
            <button onClick={saveType} disabled={saving} style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {searched && mode === "Min Order Value" && (
        <div className="card p-4 overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%" }} className="text-sm">
            <thead>
              <tr>
                <th style={head} rowSpan={2}>S.No</th>
                <th style={head} rowSpan={2}>Field Force Name</th>
                <th style={head}>Min Pri-Order Value</th>
                <th style={head}>Min Sec-Order Value</th>
                <th style={head}>FOC</th>
              </tr>
              <tr>
                <td style={cell} />
                <td style={cell} />
                <td style={{ ...cell, textAlign: "center" }}>
                  <div className="flex justify-center gap-3 text-xs">
                    <label className="flex items-center gap-1"><input type="checkbox" onChange={() => setAllFoc("Yes")} /> Yes</label>
                    <label className="flex items-center gap-1"><input type="checkbox" onChange={() => setAllFoc("No")} /> No</label>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              {minRows.map((row, i) => (
                <tr key={row.name}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{row.name} - {row.empCode}</td>
                  <td style={cell}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: 100 }}
                      value={row.minPri}
                      onChange={(e) => setMinRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, minPri: e.target.value } : r)))}
                    />
                  </td>
                  <td style={cell}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "3px 6px", width: 100 }}
                      value={row.minSec}
                      onChange={(e) => setMinRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, minSec: e.target.value } : r)))}
                    />
                  </td>
                  <td style={{ ...cell, textAlign: "center" }}>
                    <div className="flex justify-center gap-3">
                      <label className="flex items-center gap-1 text-xs">
                        <input type="radio" name={`foc-${row.name}`} checked={row.foc === "Yes"} onChange={() => setMinRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, foc: "Yes" } : r)))} /> Yes
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input type="radio" name={`foc-${row.name}`} checked={row.foc === "No"} onChange={() => setMinRows((prev) => prev.map((r) => (r.name === row.name ? { ...r, foc: "No" } : r)))} /> No
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-5">
            <button onClick={saveMin} disabled={saving} style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {searched && mode === "Common" && (
        <div className="card p-4 mx-auto" style={{ maxWidth: 640, border: "1px solid #94a3b8" }}>
          <h3 className="text-center font-semibold mb-2">Rate Based</h3>
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Primary Rate Based On</p>
            <div className="flex gap-4">
              {PRICE_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-1 text-sm text-red-600 font-semibold">
                  <input type="radio" checked={common.primaryRateBasedOn === opt} onChange={() => setCommon({ ...common, primaryRateBasedOn: opt })} /> {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Secondry Rate Based On</p>
            <div className="flex gap-4">
              {PRICE_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-1 text-sm text-red-600 font-semibold">
                  <input type="radio" checked={common.secondaryRateBasedOn === opt} onChange={() => setCommon({ ...common, secondaryRateBasedOn: opt })} /> {opt}
                </label>
              ))}
            </div>
          </div>

          <h3 className="text-center font-semibold mb-2">Approval System</h3>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm font-medium">Approval System Based On</p>
              <label className="flex items-center gap-1 text-sm text-red-600 font-semibold">
                <input type="radio" checked={common.approvalSystemBasedOn === "Auto Approval"} onChange={() => setCommon({ ...common, approvalSystemBasedOn: "Auto Approval" })} /> Auto Approval
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.approvalSystemNeeded === "Needed"} onChange={() => setCommon({ ...common, approvalSystemNeeded: "Needed" })} /> Needed
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.approvalSystemNeeded === "Not Needed"} onChange={() => setCommon({ ...common, approvalSystemNeeded: "Not Needed" })} /> Not Needed
              </label>
            </div>
          </div>

          <h3 className="text-center font-semibold mt-4 mb-1">Attachment Need</h3>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">Attachment before Submit</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.attachmentNeeded === "Needed"} onChange={() => setCommon({ ...common, attachmentNeeded: "Needed" })} /> Needed
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.attachmentNeeded === "Not Needed"} onChange={() => setCommon({ ...common, attachmentNeeded: "Not Needed" })} /> Not Needed
              </label>
            </div>
          </div>

          <h3 className="text-center font-semibold mt-4 mb-1">Discount Need</h3>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium">Discount For Order (Percentage)</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.discountNeeded === "Needed"} onChange={() => setCommon({ ...common, discountNeeded: "Needed" })} /> Needed
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" checked={common.discountNeeded === "Not Needed"} onChange={() => setCommon({ ...common, discountNeeded: "Not Needed" })} /> Not Needed
              </label>
            </div>
          </div>

          <p className="text-center text-sm text-red-600 mb-3">If you want to Enable Order Booking Setup Kindly Save before leaving the Page...</p>
          <div className="flex justify-center">
            <button onClick={saveCommon} disabled={saving} style={{ border: "1px solid #1d4ed8", borderRadius: 6, background: "#2563eb", color: "#fff", fontWeight: 600, padding: "8px 24px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
