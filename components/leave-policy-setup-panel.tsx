"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

const MASTER_KEY = "leavePolicySetup";
const LEAVE_TYPES = ["Common", "CL", "PL", "SL", "LOP"] as const;
const OTHER_TYPES = ["CL", "PL", "SL", "LOP"] as const;

function yesNo(v: unknown): boolean {
  return String(v ?? "").toLowerCase() === "yes";
}

type CommonState = {
  calendarYearMode: string;
  sequentialDeductionAutomatic: boolean;
  newSNoCL: string;
  newSNoPL: string;
  newSNoSL: string;
  newSNoLOP: string;
};

type TypeState = {
  maxContinuousDays: string;
  maxDaysPerMonth: string;
  minDays: string;
  holidaySundayCountsAsLeave: boolean;
  nationalHolidaysCountsAsLeave: boolean;
  leaveStartsWithHoliday: boolean;
  leaveEndsWithHoliday: boolean;
  leaveStartsWithSunday: boolean;
  leaveEndsWithSunday: boolean;
  combinationRestriction: string[];
  inbetweenHolidayWeekoffContinuity: boolean;
  leaveTakenBeforeDays: string;
  maxContinuousDaysForAttachment: string;
};

function emptyCommon(): CommonState {
  return { calendarYearMode: "Full Year", sequentialDeductionAutomatic: false, newSNoCL: "", newSNoPL: "", newSNoSL: "", newSNoLOP: "" };
}

function emptyType(): TypeState {
  return {
    maxContinuousDays: "20",
    maxDaysPerMonth: "20",
    minDays: "10",
    holidaySundayCountsAsLeave: true,
    nationalHolidaysCountsAsLeave: true,
    leaveStartsWithHoliday: true,
    leaveEndsWithHoliday: true,
    leaveStartsWithSunday: true,
    leaveEndsWithSunday: true,
    combinationRestriction: [],
    inbetweenHolidayWeekoffContinuity: true,
    leaveTakenBeforeDays: "0",
    maxContinuousDaysForAttachment: "0"
  };
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-1 text-sm">
        <input type="radio" checked={value} onChange={() => onChange(true)} />
        Yes
      </label>
      <label className="flex items-center gap-1 text-sm">
        <input type="radio" checked={!value} onChange={() => onChange(false)} />
        No
      </label>
    </div>
  );
}

const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "6px 0" };
const label: React.CSSProperties = { flex: "0 0 340px" };

// Matches sanpharma.info's Options >> Leave Policy Setup screen
// (LeavePolicy_Setup.aspx) exactly: a "Leave Type" dropdown (Common / CL /
// PL / SL / LOP) plus Go button, then a bordered box whose content depends
// on the selected type — Common shows Calendar Year + Leave Balance
// Sequencial deduction + a New S.No table for CL/PL/SL/LOP; each of
// CL/PL/SL/LOP shows the full continuous-days/holiday/combination
// restriction policy for that leave type. One record per leaveType is
// persisted in the leavePolicySetup master.
export function LeavePolicySetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [leaveType, setLeaveType] = useState("Common");
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [common, setCommon] = useState<CommonState>(emptyCommon());
  const [typeState, setTypeState] = useState<TypeState>(emptyType());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadedType, setLoadedType] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRecords(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Leave Policy Setup");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function applyRecord(type: string) {
    const rec = records.find((r) => String(r.leaveType ?? "") === type);
    if (type === "Common") {
      if (!rec) {
        setCommon(emptyCommon());
        return;
      }
      setCommon({
        calendarYearMode: String(rec.calendarYearMode ?? "Full Year"),
        sequentialDeductionAutomatic: yesNo(rec.sequentialDeductionAutomatic),
        newSNoCL: String(rec.newSNoCL ?? ""),
        newSNoPL: String(rec.newSNoPL ?? ""),
        newSNoSL: String(rec.newSNoSL ?? ""),
        newSNoLOP: String(rec.newSNoLOP ?? "")
      });
      return;
    }
    if (!rec) {
      setTypeState(emptyType());
      return;
    }
    setTypeState({
      maxContinuousDays: String(rec.maxContinuousDays ?? ""),
      maxDaysPerMonth: String(rec.maxDaysPerMonth ?? ""),
      minDays: String(rec.minDays ?? ""),
      holidaySundayCountsAsLeave: yesNo(rec.holidaySundayCountsAsLeave),
      nationalHolidaysCountsAsLeave: yesNo(rec.nationalHolidaysCountsAsLeave),
      leaveStartsWithHoliday: yesNo(rec.leaveStartsWithHoliday),
      leaveEndsWithHoliday: yesNo(rec.leaveEndsWithHoliday),
      leaveStartsWithSunday: yesNo(rec.leaveStartsWithSunday),
      leaveEndsWithSunday: yesNo(rec.leaveEndsWithSunday),
      combinationRestriction: String(rec.combinationRestriction ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      inbetweenHolidayWeekoffContinuity: yesNo(rec.inbetweenHolidayWeekoffContinuity),
      leaveTakenBeforeDays: String(rec.leaveTakenBeforeDays ?? ""),
      maxContinuousDaysForAttachment: String(rec.maxContinuousDaysForAttachment ?? "")
    });
  }

  function go() {
    applyRecord(leaveType);
    setLoadedType(leaveType);
    setNotice(null);
  }

  const existingRecord = useMemo(() => records.find((r) => String(r.leaveType ?? "") === loadedType), [records, loadedType]);

  async function save() {
    if (!loadedType) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: Record<string, unknown> =
        loadedType === "Common"
          ? {
              leaveType: "Common",
              calendarYearMode: common.calendarYearMode,
              sequentialDeductionAutomatic: common.sequentialDeductionAutomatic ? "Yes" : "No",
              newSNoCL: common.newSNoCL,
              newSNoPL: common.newSNoPL,
              newSNoSL: common.newSNoSL,
              newSNoLOP: common.newSNoLOP
            }
          : {
              leaveType: loadedType,
              maxContinuousDays: typeState.maxContinuousDays,
              maxDaysPerMonth: typeState.maxDaysPerMonth,
              minDays: typeState.minDays,
              holidaySundayCountsAsLeave: typeState.holidaySundayCountsAsLeave ? "Yes" : "No",
              nationalHolidaysCountsAsLeave: typeState.nationalHolidaysCountsAsLeave ? "Yes" : "No",
              leaveStartsWithHoliday: typeState.leaveStartsWithHoliday ? "Yes" : "No",
              leaveEndsWithHoliday: typeState.leaveEndsWithHoliday ? "Yes" : "No",
              leaveStartsWithSunday: typeState.leaveStartsWithSunday ? "Yes" : "No",
              leaveEndsWithSunday: typeState.leaveEndsWithSunday ? "Yes" : "No",
              combinationRestriction: typeState.combinationRestriction.join(","),
              inbetweenHolidayWeekoffContinuity: typeState.inbetweenHolidayWeekoffContinuity ? "Yes" : "No",
              leaveTakenBeforeDays: typeState.leaveTakenBeforeDays,
              maxContinuousDaysForAttachment: typeState.maxContinuousDaysForAttachment
            };

      if (existingRecord) {
        await apiClient.updateMasterRecord(MASTER_KEY, existingRecord.id, payload);
      } else {
        await apiClient.createMasterRecord(MASTER_KEY, payload);
      }
      setNotice("Leave Policy Setup saved successfully.");
      const res = await apiClient.masterRecords(MASTER_KEY);
      setRecords(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Leave Policy Setup");
    } finally {
      setSaving(false);
    }
  }

  function toggleCombination(type: string) {
    setTypeState((prev) => ({
      ...prev,
      combinationRestriction: prev.combinationRestriction.includes(type)
        ? prev.combinationRestriction.filter((t) => t !== type)
        : [...prev.combinationRestriction, type]
    }));
  }

  if (loading) return <div className="card p-4 text-sm">Loading Leave Policy Setup...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Leave Policy Setup</h2>
        <div className="flex items-end gap-3">
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <CustomSelect value={leaveType} options={[...LEAVE_TYPES]} onChange={setLeaveType} placeholder="Common" />
          </div>
          <button
            onClick={go}
            style={{
              border: "1px solid #1d4ed8",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              padding: "8px 20px",
              cursor: "pointer"
            }}
          >
            Go
          </button>
        </div>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      {loadedType === "Common" && (
        <div className="card p-4" style={{ maxWidth: 720 }}>
          <div style={row}>
            <label style={label}>Calender Year</label>
            <div className="flex gap-4">
              {["Full Year", "Half Year"].map((opt) => (
                <label key={opt} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    checked={common.calendarYearMode === opt}
                    onChange={() => setCommon({ ...common, calendarYearMode: opt })}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div style={row}>
            <label style={label}>Leave Balance Sequencial deduction Method Automatic</label>
            <YesNo
              value={common.sequentialDeductionAutomatic}
              onChange={(v) => setCommon({ ...common, sequentialDeductionAutomatic: v })}
            />
          </div>

          <table style={{ borderCollapse: "collapse", marginTop: 16 }} className="text-sm">
            <thead>
              <tr>
                <th style={{ border: "1px solid #94a3b8", padding: "6px 10px", background: "#e2e8f0" }}>S.No</th>
                <th style={{ border: "1px solid #94a3b8", padding: "6px 10px", background: "#e2e8f0" }}>Leave Name</th>
                <th style={{ border: "1px solid #94a3b8", padding: "6px 10px", background: "#e2e8f0" }}>New S.No</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["1", "CL", "newSNoCL"],
                  ["2", "PL", "newSNoPL"],
                  ["3", "SL", "newSNoSL"],
                  ["4", "LOP", "newSNoLOP"]
                ] as const
              ).map(([n, name, field]) => (
                <tr key={field}>
                  <td style={{ border: "1px solid #94a3b8", padding: "6px 10px" }}>{n}</td>
                  <td style={{ border: "1px solid #94a3b8", padding: "6px 10px" }}>{name}</td>
                  <td style={{ border: "1px solid #94a3b8", padding: "6px 10px" }}>
                    <input
                      style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "2px 6px", width: 80 }}
                      value={common[field]}
                      onChange={(e) => setCommon({ ...common, [field]: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-5">
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
        </div>
      )}

      {loadedType && loadedType !== "Common" && (
        <div className="card p-4" style={{ maxWidth: 780 }}>
          <div style={row}>
            <label style={label}>Maximum Continuous days</label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "4px 8px", width: 100 }}
              value={typeState.maxContinuousDays}
              onChange={(e) => setTypeState({ ...typeState, maxContinuousDays: e.target.value })}
            />
          </div>
          <div style={row}>
            <label style={label}>Maximum days per Month</label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "4px 8px", width: 100 }}
              value={typeState.maxDaysPerMonth}
              onChange={(e) => setTypeState({ ...typeState, maxDaysPerMonth: e.target.value })}
            />
          </div>
          <div style={row}>
            <label style={label}>No of Minimum days</label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "4px 8px", width: 100 }}
              value={typeState.minDays}
              onChange={(e) => setTypeState({ ...typeState, minDays: e.target.value })}
            />
          </div>
          <div style={row}>
            <label style={label}>Inbetween Holidays/Sunday will be considered as Leave</label>
            <YesNo value={typeState.holidaySundayCountsAsLeave} onChange={(v) => setTypeState({ ...typeState, holidaySundayCountsAsLeave: v })} />
          </div>
          <div style={row}>
            <label style={label}>Inbetween National Holidays will be considered as Leave</label>
            <YesNo
              value={typeState.nationalHolidaysCountsAsLeave}
              onChange={(v) => setTypeState({ ...typeState, nationalHolidaysCountsAsLeave: v })}
            />
          </div>
          <div style={row}>
            <label style={label}>Leave Starts with Holiday to be allowed</label>
            <YesNo value={typeState.leaveStartsWithHoliday} onChange={(v) => setTypeState({ ...typeState, leaveStartsWithHoliday: v })} />
          </div>
          <div style={row}>
            <label style={label}>Leave Ends with Holiday to be allowed</label>
            <YesNo value={typeState.leaveEndsWithHoliday} onChange={(v) => setTypeState({ ...typeState, leaveEndsWithHoliday: v })} />
          </div>
          <div style={row}>
            <label style={label}>Leave Starts with Sunday to be allowed</label>
            <YesNo value={typeState.leaveStartsWithSunday} onChange={(v) => setTypeState({ ...typeState, leaveStartsWithSunday: v })} />
          </div>
          <div style={row}>
            <label style={label}>Leave Ends with Sunday to be allowed</label>
            <YesNo value={typeState.leaveEndsWithSunday} onChange={(v) => setTypeState({ ...typeState, leaveEndsWithSunday: v })} />
          </div>
          <div style={row}>
            <label style={label}>{loadedType} combination should not allowed</label>
            <div className="flex gap-4">
              {OTHER_TYPES.filter((t) => t !== loadedType).map((t) => (
                <label key={t} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={typeState.combinationRestriction.includes(t)} onChange={() => toggleCombination(t)} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div style={row}>
            <label style={label}>(Inbetween Holiday/Weekoff Consider Continuity)</label>
            <YesNo
              value={typeState.inbetweenHolidayWeekoffContinuity}
              onChange={(v) => setTypeState({ ...typeState, inbetweenHolidayWeekoffContinuity: v })}
            />
          </div>
          <div style={row}>
            <label style={label}>Leave Taken Before days</label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "4px 8px", width: 100 }}
              value={typeState.leaveTakenBeforeDays}
              onChange={(e) => setTypeState({ ...typeState, leaveTakenBeforeDays: e.target.value })}
            />
          </div>
          <div style={row}>
            <label style={label}>Maximum Continuous days for Attachment</label>
            <input
              style={{ border: "1px solid #94a3b8", borderRadius: 3, padding: "4px 8px", width: 100 }}
              value={typeState.maxContinuousDaysForAttachment}
              onChange={(e) => setTypeState({ ...typeState, maxContinuousDaysForAttachment: e.target.value })}
            />
          </div>

          <div className="flex justify-center mt-5">
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
        </div>
      )}
    </div>
  );
}
