"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Check } from "lucide-react";
import { apiClient, getApiBaseUrl, getToken } from "@/lib/api-client";
import { downloadCsv } from "@/lib/download-csv";

// ─── Types ────────────────────────────────────────────────────────────────────
type FieldForceRow = {
  employeeCode: string;
  name: string;
  territory: string;
  role: string;
  dcrStatus: string;
  attendanceStatus: string;
  callsToday: number;
  lastSeenAt: string | null;
};
type Notice = {
  id: string;
  title: string;
  message: string;
  audience: "ALL" | "MR" | "MANAGER" | "ADMIN";
  priority: "NORMAL" | "URGENT";
  createdAt: string;
};
type ActivityItem = {
  tone: "success" | "info" | "primary" | "warning";
  icon: string;
  title: string;
  time: string;
  desc: string;
  name: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2016 + 1 }, (_, i) => String(currentYear - i));
type SelectOption = { label: string; value: string };

// ─── Small helpers ────────────────────────────────────────────────────────────
function valueFromCode(code: string, offset: number, min: number, max: number) {
  const total = [...code].reduce((sum, char) => sum + char.charCodeAt(0), offset);
  return min + (total % (max - min + 1));
}
function formatTime(isoString: string | null): string {
  if (!isoString) return "--";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function todayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function relativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────
function WeeklyTrend({ rows, month, year }: { rows: Array<{ label: string; value: number }>; month: string; year: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const min = Math.min(...rows.map((r) => r.value), 0);
  const W = 460; const H = 160;
  const pad = { t: 28, r: 40, b: 20, l: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const range = max - min || 1;
  const pts = rows.map((row, i) => ({
    x: pad.l + (i / (rows.length - 1)) * innerW,
    y: pad.t + (1 - (row.value - min) / range) * innerH,
    label: row.label, value: row.value
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1]!.x},${H - pad.b} L ${pts[0]!.x},${H - pad.b} Z`;
  const yTicks = [min, Math.round((min + max) / 2), max];
  
  return (
    <div className="relative w-full pt-4 pb-1">
      <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25"></stop>
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0"></stop>
          </linearGradient>
        </defs>
        {yTicks.map((tick, i) => {
          const y = pad.t + (1 - (tick - min) / range) * innerH;
          return (
            <g key={tick}>
              <line stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1" x1="20" x2={W - 20} y1={y} y2={y}></line>
              <text fill="#94A3B8" fontFamily="Inter" fontSize="9" textAnchor="end" x="35" y={y + 4}>{tick}%</text>
            </g>
          );
        })}
        <line stroke="#E2E8F0" strokeWidth="1" x1="20" x2={W - 20} y1={H - pad.b} y2={H - pad.b}></line>
        <path d={areaPath} fill="url(#areaGradient)"></path>
        <path d={linePath} fill="none" stroke="#059669" strokeLinecap="round" strokeWidth="2.5"></path>
        {pts.map((p, i) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} fill={i === pts.length - 1 ? "#059669" : "#FFFFFF"} r={i === pts.length - 1 ? "5" : "4"} stroke={i === pts.length - 1 ? "#FFFFFF" : "#059669"} strokeWidth={i === pts.length - 1 ? "2" : "2.5"}></circle>
            <text fill={i === pts.length - 1 ? "#059669" : "#0F172A"} fontFamily="Inter" fontSize={i === pts.length - 1 ? "11" : "10"} fontWeight={i === pts.length - 1 ? "700" : "600"} textAnchor="middle" x={p.x} y={p.y - 10}>{p.value}%</text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between px-6 pt-1 text-text-muted font-label-md text-label-md">
        {rows.map((r, i) => (
          <span key={r.label} className={i === rows.length - 1 ? "text-primary font-semibold" : ""}>{r.label.replace('W', 'Week ')}</span>
        ))}
      </div>
    </div>
  );
}

function AttendanceSplit({ value }: { value: number }) {
  const leave = 100 - value;
  // Circumference of r=38 is 238.76
  const c = 238.76;
  const leaveArc = (leave / 100) * c;
  const presentArc = (value / 100) * c;
  
  return (
    <>
      <div className="relative flex items-center justify-center py-4">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="transparent" r="38" stroke="#F1F5F9" strokeWidth="10"></circle>
          <circle cx="50" cy="50" fill="transparent" r="38" stroke="#D97706" strokeDasharray={c} strokeDashoffset="0" strokeLinecap="round" strokeWidth="10"></circle>
          <circle cx="50" cy="50" fill="transparent" r="38" stroke="#059669" strokeDasharray={c} strokeDashoffset={leaveArc} strokeLinecap="round" strokeWidth="10"></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-metric-value text-metric-value text-text-primary leading-none">{value}%</span>
          <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mt-1">Present</span>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-canvas">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-success"></span>
            <span className="font-body-sm text-body-sm text-text-secondary">Present (Active)</span>
          </div>
          <span className="font-label-md text-label-md text-text-primary font-semibold">{Math.round((value / 100) * 194)} Reps</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-canvas">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-warning"></span>
            <span className="font-body-sm text-body-sm text-text-secondary">On Leave / Rest</span>
          </div>
          <span className="font-label-md text-label-md text-text-primary font-semibold">{Math.round((leave / 100) * 194)} Reps</span>
        </div>
      </div>
    </>
  );
}

// ─── Post-Notice modal ────────────────────────────────────────────────────────
function PostNoticeModal({ onClose, onPosted }: { onClose: () => void; onPosted: (notice: Notice) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"ALL" | "MR" | "MANAGER" | "ADMIN">("ALL");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  async function handlePost() {
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/company/notices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken() ?? ""}`
          },
          body: JSON.stringify({ title, message, audience, priority })
        }
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(payload?.error?.message ?? "Failed to post notice");
      }
      const payload = await res.json() as { data: Notice };
      onPosted(payload.data);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post notice");
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-card w-full max-w-lg rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h4 className="font-headline-sm text-headline-sm text-text-primary">Post Notice</h4>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4 font-body-sm text-body-sm">
          {error && <p className="text-status-danger bg-status-danger-bg p-2 rounded-md">{error}</p>}
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-text-secondary">Title *</label>
            <input 
              className="w-full h-10 px-3 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              value={title} onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Q2 Review — Mandatory attendance" 
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-text-secondary">Message *</label>
            <textarea 
              className="w-full p-3 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
              rows={4} value={message} onChange={e => setMessage(e.target.value)} 
              placeholder="Full notice content..." 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-text-secondary">Audience</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border-subtle outline-none" 
                value={audience} onChange={e => setAudience(e.target.value as any)}
              >
                <option value="ALL">All</option>
                <option value="MR">Field Force (MR)</option>
                <option value="MANAGER">Managers</option>
                <option value="ADMIN">Admin only</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-text-secondary">Priority</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border-subtle outline-none" 
                value={priority} onChange={e => setPriority(e.target.value as any)}
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border-subtle flex justify-end gap-3 bg-surface-canvas">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-label-md text-label-md text-text-secondary hover:bg-border-subtle transition-colors">
            Cancel
          </button>
          <button 
            disabled={saving} 
            onClick={() => void handlePost()} 
            className="px-4 py-2 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Posting…" : "Post Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminHomeDashboard() {
  const router = useRouter();
  
  // Filters
  const [employeeCode, setEmployeeCode] = useState("admin");
  const [month, setMonth] = useState(months[new Date().getMonth()] ?? "Apr");
  const [year, setYear] = useState(String(currentYear));
  
  // Live data
  const [fieldForceRows, setFieldForceRows] = useState<FieldForceRow[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  
  // UI state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const loadData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    setError("");
    try {
      // 1. Field force status
      const ffRes = await fetch(`${getApiBaseUrl()}/company/field-force-status`, { headers: { Authorization: `Bearer ${getToken() ?? ""}` } });
      if (ffRes.ok) {
        const ffPayload = await ffRes.json() as { data: FieldForceRow[] };
        setFieldForceRows(ffPayload.data);
      }
      
      // 2. Notices
      const noticeRes = await fetch(`${getApiBaseUrl()}/company/notices`, { headers: { Authorization: `Bearer ${getToken() ?? ""}` } });
      if (noticeRes.ok) {
        const noticePayload = await noticeRes.json() as { data: Notice[] };
        setNotices(noticePayload.data.slice(0, 5));
      }
      
      // 3. Activity feed
      const dcrData = await apiClient.dcrs();
      const recent = dcrData.data.slice(0, 4);
      const tones: ActivityItem["tone"][] = ["success", "info", "primary", "warning"];
      const icons = ["assignment_turned_in", "location_on", "inventory", "schedule"];
      
      setActivity(
        recent.map((dcr, i) => ({
          tone: tones[i % tones.length]!,
          icon: icons[i % icons.length]!,
          name: `MR ${dcr.employeeCode}`,
          title: `DCR ${dcr.status.replace("_", " ")}`,
          desc: `Updated status to ${dcr.status}`,
          time: relativeTime(dcr.updatedAt ?? dcr.createdAt)
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 800);
    }
  }, []);
  
  useEffect(() => {
    void loadData();
  }, [loadData]);
  
  // Chart seed
  const chartSeed = employeeCode === "admin" ? "admin" : employeeCode;
  const dcrTrend = useMemo(() => [
    { label: "W1", value: 72 }, { label: "W2", value: 78 }, { label: "W3", value: 85 },
    { label: "W4", value: 81 }, { label: "W5", value: 88 }, { label: "W6", value: 91 }
  ], []);
  
  const fieldWorkDays = useMemo(() => [
    { label: "ABM", value: valueFromCode(chartSeed, 1, 18, 25) },
    { label: "BE",  value: valueFromCode(chartSeed, 2, 19, 26) }
  ], [chartSeed]);
  const callAverage = useMemo(() => [
    { label: "ABM", value: valueFromCode(chartSeed, 7, 5, 10) }
  ], [chartSeed]);
  const callAdherence = useMemo(() => [
    { label: "CORE",   value: valueFromCode(chartSeed, 12, 48, 82) }
  ], [chartSeed]);
  const productDetailed = useMemo(() => ["BEP","BRI","DEN"].map((label, i) => ({ label, value: valueFromCode(chartSeed, i + 20, 500, 3200) })), [chartSeed]);
  const visitCalls = useMemo(() => [
    { label: "1 Visit",  value: valueFromCode(chartSeed, 30, 18, 42) }
  ], [chartSeed]);
  
  const fieldWorkTotal   = fieldWorkDays[0]?.value ?? 0;
  const callAverageValue = (callAverage.reduce((s, r) => s + r.value, 0) / Math.max(callAverage.length, 1)).toFixed(1);
  const adherenceValue   = callAdherence[0]?.value ?? 0;
  const detailedDoctors  = productDetailed.reduce((s, r) => s + r.value, 0);
  const totalVisits      = visitCalls.reduce((s, r) => s + r.value, 0) * 24;
  
  // Delayed DCRs
  const delayedRows = fieldForceRows.filter((r) => r.dcrStatus === "NOT_SUBMITTED");
  
  // Filtered table rows
  const displayRows = fieldForceRows.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.territory.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  function viewEmployee(code: string) {
    router.push(`/admin/fieldforce/${code}?month=${month}&year=${year}`);
  }
  
  function handleExport() {
    const rows = fieldForceRows.map((r) => ({
      "Employee Code": r.employeeCode,
      Name: r.name,
      Territory: r.territory,
      Role: r.role,
      "DCR Status": r.dcrStatus,
      "Attendance Status": r.attendanceStatus,
      "Calls Today": r.callsToday,
      "Last Seen": formatTime(r.lastSeenAt)
    }));
    downloadCsv(`field-force-status-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {showNoticeModal && (
        <PostNoticeModal
          onClose={() => setShowNoticeModal(false)}
          onPosted={(notice) => setNotices((prev) => [notice, ...prev].slice(0, 5))}
        />
      )}
      
      {/* ── TOP COMMAND BAR & FILTERS ── */}
      <section className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">Command Center</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Command Center</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2">
            <span>Welcome, Corporate HQ - Zivira Labs Pvt Ltd</span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">Last sync {loading ? "…" : "just now"}</span>
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative min-w-[170px]">
            <select 
              className="w-full h-[38px] pl-3 pr-8 rounded-lg bg-surface-canvas text-text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-card shadow-sm cursor-pointer border border-transparent focus:border-border-strong"
              value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)}
            >
              <option value="admin">All Field Force</option>
              {fieldForceRows.map(r => (
                <option key={r.employeeCode} value={r.employeeCode}>{r.employeeCode} | {r.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative min-w-[120px]">
            <select 
              className="w-full h-[38px] pl-3 pr-8 rounded-lg bg-surface-canvas text-text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-card shadow-sm cursor-pointer border border-transparent focus:border-border-strong"
              value={month} onChange={(e) => setMonth(e.target.value)}
            >
              {months.map(m => <option key={m} value={m}>{m} {year}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[18px]">calendar_month</span>
          </div>
          <button 
            onClick={() => employeeCode !== "admin" && viewEmployee(employeeCode)}
            className="w-[38px] h-[38px] rounded-lg bg-surface-subtle hover:bg-border-subtle text-text-primary flex items-center justify-center transition-colors shadow-sm"
            title="View Selected Employee"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button 
            onClick={() => void loadData()}
            className="h-[38px] px-3 rounded-lg bg-surface-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className={`material-symbols-outlined text-[18px] text-text-secondary ${refreshing ? 'animate-spin' : ''}`}>sync</span>
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => router.push("/admin/fieldforce/new")}
            className="h-[38px] px-4 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Field Force</span>
          </button>
        </div>
      </section>
      
      {error && <p className="text-status-danger bg-status-danger-bg p-3 rounded-lg text-body-md">{error}</p>}
      
      {/* ── 5-COLUMN METRIC ROW (KPIs) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-grid-gutter">
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Field Work Days</span>
              <span className="font-metric-value text-metric-value text-text-primary mt-1">{fieldWorkTotal}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: "82%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm text-text-muted">
              <span>From field force data</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">82% Month</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Call Average</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">{callAverageValue}</span>
                <span className="font-label-sm text-label-sm text-status-warning bg-status-warning-bg px-1.5 py-0.5 rounded font-semibold">-2.0 delta</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-warning h-1.5 rounded-full transition-all duration-700" style={{ width: "77%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">Target: 9.0 calls/day</span>
              <span className="font-label-sm text-label-sm text-status-warning font-medium">77% reached</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Call Adherence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">{adherenceValue}%</span>
                <span className="font-label-sm text-label-sm text-status-danger bg-status-danger-bg px-1.5 py-0.5 rounded font-semibold">Low</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">target</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-danger h-1.5 rounded-full transition-all duration-700" style={{ width: `${adherenceValue}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">Below 80% benchmark</span>
              <span className="font-label-sm text-label-sm text-status-danger font-medium">-24% deficit</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Drs Detailed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">{detailedDoctors.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-status-info h-1.5 rounded-full transition-all duration-700" style={{ width: "92%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">Detailed this month</span>
              <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>12.4%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card rounded-xl p-card-padding-standard shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Visit Calls (Team)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-metric-value text-metric-value text-text-primary">{totalVisits.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full transition-all duration-700" style={{ width: "73%" }}></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-body-sm text-body-sm">
              <span className="text-text-muted">Total joint field visits</span>
              <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>8.2% MoM
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── MID SECTION: ANALYTICS SPLIT ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
        <div className="lg:col-span-5 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary">DCR Submission Trend</h3>
              <p className="font-body-sm text-body-sm text-text-muted">Weekly submission rate • {month} {year}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success font-label-sm text-label-sm font-semibold">
              91% Peak
            </span>
          </div>
          <WeeklyTrend rows={dcrTrend} month={month} year={year} />
          <div className="pt-3 flex items-center justify-between font-body-sm text-body-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success"></span>
              Weekly Target: 80%
            </span>
            <span className="text-text-muted">4-week average: 85.5%</span>
          </div>
        </div>
        
        <div className="lg:col-span-3 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary">Attendance Split</h3>
              <p className="font-body-sm text-body-sm text-text-muted">{month} {year} • Field Force</p>
            </div>
            <span className="font-label-sm text-label-sm text-text-muted uppercase">194 Total</span>
          </div>
          <AttendanceSplit value={76} />
        </div>
        
        <div className="lg:col-span-4 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm text-text-primary">Live Activity</h3>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Real-Time Field Feed</span>
          </div>
          <div className="space-y-3.5 my-2 max-h-72 overflow-y-auto pr-1">
            {activity.length > 0 ? activity.map((item, index) => (
              <div key={item.name + item.time + index} className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-canvas hover:bg-surface-subtle transition-colors">
                <div className={`w-8 h-8 rounded-full bg-status-${item.tone}-bg text-status-${item.tone} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-text-primary truncate">{item.name}</span>
                    <span className="font-label-sm text-label-sm text-text-muted flex-shrink-0">{item.time}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-text-secondary truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            )) : (
              <p className="text-text-muted text-body-sm py-4">No recent activity</p>
            )}
          </div>
          <a className="inline-flex items-center justify-center gap-1 w-full pt-2 font-label-md text-label-md text-primary hover:text-brand-primary-hover font-semibold transition-colors" href="#">
            <span>Open Operational Event Stream</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </section>
      
      {/* ── FIELD FORCE STATUS TABLE ── */}
      <section className="bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary">Field Force Status — Today ({todayLabel()})</h2>
            <p className="font-body-sm text-body-sm text-text-muted">Real-time daily reporting telemetry across active medical representatives</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[220px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">search</span>
              <input 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] pl-8 pr-3 rounded-lg bg-surface-canvas border border-border-subtle text-text-primary font-body-sm text-body-sm focus:outline-none focus:border-border-strong shadow-sm" 
                placeholder="Filter representative or territory..." 
              />
            </div>
            <div className="flex items-center bg-surface-canvas rounded-lg p-0.5 text-text-secondary font-label-sm text-label-sm border border-border-subtle">
              <button className="px-3 py-1.5 rounded-md bg-surface-card text-text-primary font-bold shadow-sm">All ({fieldForceRows.length})</button>
              <button className="px-2.5 py-1.5 rounded-md hover:text-text-primary transition-colors">On Duty</button>
              <button className="px-2.5 py-1.5 rounded-md hover:text-text-primary transition-colors text-status-danger">Delayed ({delayedRows.length})</button>
            </div>
            <button onClick={handleExport} className="h-[36px] px-3 rounded-lg bg-surface-subtle border border-border-subtle hover:bg-border-subtle text-text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-table-header-height bg-surface-canvas text-text-muted font-label-sm text-label-sm uppercase tracking-wider border-b border-border-subtle">
                <th className="px-4 py-2">Representative</th>
                <th className="px-4 py-2">HQ & Territory</th>
                <th className="px-4 py-2">DCR Status</th>
                <th className="px-4 py-2">Attendance</th>
                <th className="px-4 py-2 text-center">Calls (Actual/Target)</th>
                <th className="px-4 py-2">Last Activity</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm text-body-sm text-text-primary bg-surface-card">
              {loading && displayRows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading field force data...</td></tr>
              )}
              {!loading && displayRows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No representatives found matching "{searchQuery}"</td></tr>
              )}
              {displayRows.map(row => {
                const isSubmitted = row.dcrStatus === "SUBMITTED" || row.dcrStatus === "APPROVED" || row.dcrStatus === "MANAGER_APPROVED";
                const isDelayed = row.dcrStatus === "NOT_SUBMITTED";
                const isPresent = row.attendanceStatus === "PRESENT";
                const initials = row.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                  <tr key={row.employeeCode} className={`h-table-row-height hover:bg-surface-canvas/60 transition-colors ${isDelayed ? 'bg-status-danger-bg/20' : ''}`}>
                    <td className="px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full font-label-md text-label-md font-bold flex items-center justify-center ${
                          isSubmitted ? 'bg-brand-primary-subtle text-primary' : 
                          isDelayed ? 'bg-status-danger-bg text-status-danger' : 
                          'bg-status-info-bg text-status-info'
                        }`}>
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">{row.name}</span>
                          <span className="font-label-sm text-label-sm text-text-muted">{row.employeeCode} • {row.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <span className="text-text-primary font-medium">{row.territory}</span>
                      <span className="block font-label-sm text-label-sm text-text-muted">Zone West</span>
                    </td>
                    <td className="px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                        isSubmitted ? 'bg-status-success-bg text-status-success' :
                        isDelayed ? 'bg-status-danger-bg text-status-danger' :
                        'bg-status-info-bg text-status-info'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">{
                          isSubmitted ? 'check_circle' : isDelayed ? 'warning' : 'pending'
                        }</span>
                        {row.dcrStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4">
                      <span className={`inline-flex items-center gap-1.5 font-label-md text-label-md ${
                        isPresent ? 'text-text-primary' : 'text-status-warning'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-status-success' : 'bg-status-warning'}`}></span>
                        {isPresent ? 'Present (Field)' : row.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-4 text-center">
                      <span className={`font-label-md text-label-md font-bold ${
                        isDelayed ? 'text-status-danger' : isSubmitted ? 'text-status-success' : 'text-text-primary'
                      }`}>{row.callsToday}</span>
                      <span className="text-text-muted"> / 10</span>
                    </td>
                    <td className={`px-4 font-body-sm text-body-sm ${isDelayed ? 'text-status-danger font-medium' : 'text-text-muted'}`}>
                      {formatTime(row.lastSeenAt)}
                    </td>
                    <td className="px-4 text-right">
                      {isDelayed ? (
                        <button className="px-2.5 py-1 rounded bg-status-danger text-on-primary font-label-sm text-label-sm hover:bg-error transition-colors shadow-sm">
                          Ping MR
                        </button>
                      ) : (
                        <button 
                          onClick={() => viewEmployee(row.employeeCode)}
                          className="px-2.5 py-1 rounded bg-surface-subtle hover:bg-brand-primary-subtle hover:text-primary text-text-secondary font-label-sm text-label-sm transition-colors border border-border-subtle hover:border-brand-primary-subtle"
                        >
                          View DCR
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 font-body-sm text-body-sm text-text-secondary">
          <div>Showing <strong className="text-text-primary">{displayRows.length}</strong> of <strong className="text-text-primary">{fieldForceRows.length}</strong> Medical Representatives</div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-muted font-label-md text-label-md disabled:opacity-40" disabled>Prev</button>
            <button className="w-7 h-7 rounded border border-primary bg-primary text-on-primary font-label-md text-label-md font-semibold">1</button>
            <button className="w-7 h-7 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md">2</button>
            <button className="px-2.5 py-1 rounded border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md">Next</button>
          </div>
        </div>
      </section>
      
      {/* ── BOTTOM OPERATIONAL WIDGETS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
        <div className="lg:col-span-7 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary-subtle text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">campaign</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">Corporate Notice Board</h3>
                <p className="font-body-sm text-body-sm text-text-muted">HQ bulletins dispatched to mobile MR application</p>
              </div>
            </div>
            <button onClick={() => setShowNoticeModal(true)} className="h-[34px] px-3.5 rounded-lg bg-primary hover:bg-brand-primary-hover text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm transition-all">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Post Notice</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
            {notices.slice(0, 2).map((notice, i) => (
              <div key={notice.id} className="p-3.5 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col justify-between space-y-2 hover:bg-surface-subtle transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                    notice.priority === 'URGENT' ? 'bg-status-warning-bg text-status-warning' : 'bg-status-info-bg text-status-info'
                  }`}>
                    {notice.priority === 'URGENT' ? 'Urgent Notice' : 'Notice'}
                  </span>
                  <span className="font-label-sm text-label-sm text-text-muted">{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-text-primary line-clamp-1">{notice.title}</h4>
                <p className="font-body-sm text-body-sm text-text-secondary line-clamp-2">{notice.message}</p>
                <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-text-muted">
                  <span>Audience: {notice.audience}</span>
                  <span className="text-primary font-semibold cursor-pointer hover:underline">Read Full Notice &rarr;</span>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="col-span-full py-8 text-center text-text-muted border border-dashed border-border-strong rounded-xl bg-surface-canvas">
                No notices posted yet.
              </div>
            )}
          </div>
          <div className="pt-2 flex items-center justify-between font-body-sm text-body-sm text-text-muted">
            <span>Displaying {Math.min(2, notices.length)} active broadcast notices</span>
            <a href="#" className="text-primary hover:underline font-label-md text-label-md font-semibold">View Notice Archive</a>
          </div>
        </div>
        
        <div className="lg:col-span-5 bg-surface-card rounded-xl p-card-padding-spacious shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">alarm_off</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">Delayed DCR Summary</h3>
                <p className="font-body-sm text-body-sm text-text-muted">Pending submissions past 20:00 cutoff</p>
              </div>
            </div>
            <Link href="/admin/dcr?status=NOT_SUBMITTED" className="font-label-md text-label-md text-primary font-semibold hover:underline">View All ({delayedRows.length})</Link>
          </div>
          <div className="space-y-2.5 my-2">
            {delayedRows.length > 0 ? delayedRows.slice(0, 3).map(row => (
              <div key={row.employeeCode} className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-canvas hover:bg-surface-subtle transition-colors">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate font-semibold">{row.name}</span>
                  <span className="font-label-sm text-label-sm text-text-muted truncate">{row.territory} • {row.callsToday} calls logged</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-status-danger-bg text-status-danger font-label-sm text-label-sm font-bold">Delayed</span>
                  <button className="w-7 h-7 rounded border border-border-subtle bg-surface-card hover:bg-brand-primary-subtle hover:text-primary flex items-center justify-center text-text-muted shadow-sm transition-colors" title="Send WhatsApp/SMS Reminder">
                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-text-muted border border-dashed border-border-strong rounded-xl bg-surface-canvas">
                All DCRs submitted today 🎉
              </div>
            )}
          </div>
          <div className="pt-2 flex items-center justify-between font-body-sm text-body-sm">
            <span className="text-status-success flex items-center gap-1 font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {fieldForceRows.length ? Math.round(((fieldForceRows.length - delayedRows.length) / fieldForceRows.length) * 100 * 10) / 10 : 100}% Compliance Today
            </span>
            <button className="text-primary hover:text-brand-primary-hover font-label-md text-label-md font-semibold transition-colors">
              Broadcast Batch Reminder
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
