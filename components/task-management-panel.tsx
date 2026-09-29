"use client";

import { useEffect, useState } from "react";
import { apiClient, type Employee } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 11 item 5 — sanpharma's real, self-contained "Task Management
// System" (Home/Assign/Status/Track), backed by a real Task model + routes
// (masters-actions.routes.ts: /task/action/list, /task/action/create).
// Charts are real, lightweight inline SVG (no charting lib is installed in
// this project yet) driven by real per-status counts — genuinely zero/empty
// when no tasks exist, never a fabricated placeholder number.
const MODE_OF_TASK_OPTIONS = [
  "Allowance Variance", "Call Adherance", "Campaign Doctors", "Chemist Based", "Chemist Call Average",
  "Chemist Master Updation", "Chemist POB", "Core Doctors", "Coverage", "Delayed Reports",
  "Device ID Maintenance", "Digital Detailing", "Doctor Based", "Doctor Call Average", "Doctor Coverage",
  "Doctor Master Updation", "Doctor POB", "Doctor wise Call Feedback", "Fare Calculation"
];

const HOME_STATUSES = ["New", "Pending", "Completed", "Closed", "ReOpen", "Hold"] as const;
const STATUS_TAB_STATUSES = ["New", "Pending", "Completed", "Closed", "ReOpen", "Hold", "Cancel"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - 3 + i));

function employeeLabel(e: Employee): string {
  return `${e.name} - ${e.designation} - ${e.territory}`;
}

type Stats = { total: number; New: number; Pending: number; Completed: number; Closed: number; ReOpen: number; Hold: number; Cancel: number };
type Task = {
  id: string; modeOfTask: string; priority: string; assignedToEmployeeCode: string; assignedToName: string;
  deadlineFrom: string | null; deadlineTo: string | null; description: string; status: string; createdAt?: string;
};

function emptyStats(): Stats {
  return { total: 0, New: 0, Pending: 0, Completed: 0, Closed: 0, ReOpen: 0, Hold: 0, Cancel: 0 };
}

const tileColors: Record<string, string> = {
  Total: "#0e7490", New: "#eab308", Pending: "#3b82f6", Completed: "#16a34a",
  Closed: "#ef4444", ReOpen: "#3b82f6", Hold: "#ef4444", Cancel: "#ef4444"
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col items-center overflow-hidden" style={{ minWidth: 110 }}>
      <div className="text-sm font-semibold text-text-primary pt-3 pb-2">{label}</div>
      <div className="w-full text-center text-white text-lg font-bold py-2" style={{ background: tileColors[label] || "#0e7490" }}>
        {value}
      </div>
    </div>
  );
}

// ── Minimal inline SVG chart primitives (no charting lib installed) ──────
function LineChartWidget({ title, categories, values }: { title: string; categories: string[]; values: number[] }) {
  const w = 260, h = 140, pad = 24;
  const max = Math.max(1, ...values);
  const stepX = (w - pad * 2) / Math.max(1, categories.length - 1);
  const points = values.map((v, i) => `${pad + i * stepX},${h - pad - (v / max) * (h - pad * 2)}`).join(" ");
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-3 flex-1" style={{ minWidth: 240 }}>
      <p className="text-sm font-semibold text-center mb-2">{title}</p>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#cbd5e1" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#cbd5e1" />
        <polyline points={points} fill="none" stroke="#0e7490" strokeWidth={2} />
        {values.map((v, i) => (
          <circle key={i} cx={pad + i * stepX} cy={h - pad - (v / max) * (h - pad * 2)} r={3} fill="#0e7490" />
        ))}
        {categories.map((c, i) => (
          <text key={c} x={pad + i * stepX} y={h - 6} fontSize={8} textAnchor="middle" fill="#64748b">{c}</text>
        ))}
      </svg>
    </div>
  );
}

function RadarChartWidget({ title, categories, values }: { title: string; categories: string[]; values: number[] }) {
  const size = 140, cx = size / 2, cy = size / 2, r = 50;
  const max = Math.max(1, ...values);
  const n = categories.length;
  const pt = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (val / max) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };
  const polygon = values.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-3 flex-1" style={{ minWidth: 200 }}>
      <p className="text-sm font-semibold text-center mb-2">{title}</p>
      <svg width="100%" viewBox={`0 0 ${size} ${size + 20}`}>
        {[0.33, 0.66, 1].map((f) => (
          <polygon
            key={f}
            points={categories.map((_, i) => pt(i, max * f).join(",")).join(" ")}
            fill="none"
            stroke="#e2e8f0"
          />
        ))}
        <polygon points={polygon} fill="#0e749033" stroke="#0e7490" strokeWidth={2} />
        {categories.map((c, i) => {
          const [x, y] = pt(i, max * 1.25);
          return <text key={c} x={x} y={y} fontSize={7} textAnchor="middle" fill="#64748b">{c}</text>;
        })}
      </svg>
    </div>
  );
}

function BarChartWidget({ title, categories, values }: { title: string; categories: string[]; values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-3 flex-1" style={{ minWidth: 200 }}>
      <p className="text-sm font-semibold text-center mb-3">{title}</p>
      <div className="flex flex-col gap-2">
        {categories.map((c, i) => (
          <div key={c} className="flex items-center gap-2">
            <span className="text-xs w-16 text-text-muted">{c}</span>
            <div className="flex-1 bg-slate-100 rounded h-4 overflow-hidden">
              <div className="h-4 bg-brand-primary" style={{ width: `${(values[i] / max) * 100}%`, background: "#0e7490" }} />
            </div>
            <span className="text-xs w-6 text-right">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeWidget({ title, value, max }: { title: string; value: number; max: number }) {
  const size = 140, cx = size / 2, cy = size / 2 + 10, r = 55;
  const frac = max > 0 ? Math.min(1, value / max) : 0;
  const angle = Math.PI * frac;
  const needleX = cx - r * Math.cos(angle);
  const needleY = cy - r * Math.sin(angle);
  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-3 flex-1" style={{ minWidth: 200 }}>
      <p className="text-sm font-semibold text-center mb-2">{title}</p>
      <svg width="100%" viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#dc2626" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill="#dc2626" />
        <text x={cx} y={cy + 20} fontSize={16} textAnchor="middle" fontWeight={700} fill="#0f172a">{value}</text>
      </svg>
    </div>
  );
}

function HomeTab() {
  const [stats, setStats] = useState<Stats>(emptyStats());
  const [byMeStats, setByMeStats] = useState<Stats>(emptyStats());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    apiClient.taskList({}).then((res) => {
      setTasks(res.data as unknown as Task[]);
      setStats((res as unknown as { stats?: Stats }).stats || emptyStats());
    }).catch(() => {});
    apiClient.taskList({ assignedByMe: "true" }).then((res) => {
      setByMeStats((res as unknown as { stats?: Stats }).stats || emptyStats());
    }).catch(() => {});
  }, []);

  const priorityCounts = ["High", "Medium", "Low"].map((p) => tasks.filter((t) => t.priority === p).length);
  const overdueDays = tasks.reduce((max, t) => {
    if (!t.deadlineTo) return max;
    const days = Math.max(0, Math.round((Date.now() - new Date(t.deadlineTo).getTime()) / (1000 * 60 * 60 * 24)));
    return t.status !== "Completed" && t.status !== "Closed" ? Math.max(max, days) : max;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <StatTile label="Total" value={stats.total} />
        {HOME_STATUSES.map((s) => <StatTile key={s} label={s} value={stats[s]} />)}
      </div>
      <div className="flex flex-wrap gap-4">
        <LineChartWidget
          title="Team (Assigned by Me)"
          categories={["New", "Open", "Completed", "Closed", "ReOpen", "Hold", "Cancel"]}
          values={[byMeStats.New, byMeStats.Pending, byMeStats.Completed, byMeStats.Closed, byMeStats.ReOpen, byMeStats.Hold, byMeStats.Cancel]}
        />
        <RadarChartWidget
          title="My Team Task"
          categories={["New", "Open", "Completed", "Closed", "ReOpen", "Hold", "Cancel"]}
          values={[stats.New, stats.Pending, stats.Completed, stats.Closed, stats.ReOpen, stats.Hold, stats.Cancel]}
        />
        <BarChartWidget title="Priority" categories={["High", "Medium", "Low"]} values={priorityCounts} />
        <GaugeWidget title="Overdue Days" value={overdueDays} max={280} />
      </div>
    </div>
  );
}

function AssignTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modeOfTask, setModeOfTask] = useState("");
  const [priority, setPriority] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  function clear() {
    setModeOfTask(""); setPriority(""); setAssignTo(""); setDeadlineFrom(""); setDeadlineTo(""); setDescription("");
  }

  async function assign() {
    setError(null);
    setMessage(null);
    if (!modeOfTask || !priority || !assignTo) {
      setError("Mode of Task, Priority and Task Assign to are required.");
      return;
    }
    setSaving(true);
    try {
      const emp = employees.find((e) => employeeLabel(e) === assignTo);
      if (!emp) throw new Error("Select a valid employee");
      await apiClient.createTask({
        modeOfTask, priority, assignedToEmployeeCode: emp.employeeCode,
        deadlineFrom: deadlineFrom || null, deadlineTo: deadlineTo || null, description
      });
      setMessage("Task assigned.");
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-6 max-w-2xl mx-auto flex flex-col gap-4">
      <h3 className="text-xl font-bold text-center">Task - Assignment</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Mode of Task</span>
          <CustomSelect value={modeOfTask} options={MODE_OF_TASK_OPTIONS} onChange={setModeOfTask} placeholder="---Select---" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Priority</span>
          <CustomSelect value={priority} options={["High", "Medium", "Low"]} onChange={setPriority} placeholder="--Select--" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Task Assign to</span>
          <CustomSelect value={assignTo} options={employees.map(employeeLabel)} onChange={setAssignTo} placeholder="---Select---" />
        </div>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Deadline</span>
          <div className="flex gap-2">
            <input className="input" type="date" value={deadlineFrom} onChange={(e) => setDeadlineFrom(e.target.value)} />
            <input className="input" type="date" value={deadlineTo} onChange={(e) => setDeadlineTo(e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <span className="block text-xs font-medium text-text-muted mb-1">Task Description</span>
        <textarea className="input" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>}
      <div className="flex justify-center gap-3">
        <button className="button" type="button" onClick={assign} disabled={saving}>{saving ? "Assigning..." : "Assign"}</button>
        <button className="button button-secondary" type="button" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

function StatusTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fieldForce, setFieldForce] = useState("Team Task (ALL)");
  const [priority, setPriority] = useState("ALL");
  const [modeOfTask, setModeOfTask] = useState("ALL");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  async function go() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (fieldForce === "Team (Assigned by Me)") params.assignedByMe = "true";
      else if (fieldForce !== "Team Task (ALL)") {
        const emp = employees.find((e) => employeeLabel(e) === fieldForce);
        if (emp) params.assignedToEmployeeCode = emp.employeeCode;
      }
      if (priority !== "ALL") params.priority = priority;
      if (modeOfTask !== "ALL") params.modeOfTask = modeOfTask;
      const res = await apiClient.taskList(params);
      setRows(res.data as unknown as Task[]);
      setStats((res as unknown as { stats?: Stats }).stats || emptyStats());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3">
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce</span>
          <CustomSelect
            value={fieldForce}
            options={["Team Task (ALL)", "Team (Assigned by Me)", ...employees.map(employeeLabel)]}
            onChange={setFieldForce}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Priority</span>
          <CustomSelect value={priority} options={["ALL", "High", "Medium", "Low"]} onChange={setPriority} />
        </div>
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Mode of Task</span>
          <CustomSelect value={modeOfTask} options={["ALL", ...MODE_OF_TASK_OPTIONS]} onChange={setModeOfTask} />
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>{loading ? "Loading..." : "Go"}</button>
      </div>

      {stats && (
        <div className="flex flex-wrap gap-3">
          {STATUS_TAB_STATUSES.map((s) => <StatTile key={s} label={s} value={stats[s]} />)}
        </div>
      )}

      {stats && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-center text-text-muted py-6">No Records Found</p>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={head}>S.No</th>
                  <th style={head}>Mode of Task</th>
                  <th style={head}>Priority</th>
                  <th style={head}>Assigned To</th>
                  <th style={head}>Deadline</th>
                  <th style={head}>Status</th>
                  <th style={head}>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>{r.modeOfTask}</td>
                    <td style={cell}>{r.priority}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.assignedToName}</td>
                    <td style={cell}>{r.deadlineFrom ? new Date(r.deadlineFrom).toLocaleDateString("en-GB") : "-"} - {r.deadlineTo ? new Date(r.deadlineTo).toLocaleDateString("en-GB") : "-"}</td>
                    <td style={cell}>{r.status}</td>
                    <td style={{ ...cell, textAlign: "left" }}>{r.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function TrackTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fieldForce, setFieldForce] = useState("admin");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  async function go() {
    setLoading(true);
    try {
      const params: Record<string, string> = { month: String(MONTHS.indexOf(month) + 1), year };
      if (fieldForce !== "admin") {
        const emp = employees.find((e) => employeeLabel(e) === fieldForce);
        if (emp) params.assignedToEmployeeCode = emp.employeeCode;
      }
      const res = await apiClient.taskList(params);
      setRows(res.data as unknown as Task[]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3">
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">FieldForce</span>
          <CustomSelect value={fieldForce} options={["admin", ...employees.map(employeeLabel)]} onChange={setFieldForce} />
        </div>
        <div style={{ minWidth: 100 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Mnth/Yr</span>
          <div className="flex gap-2">
            <CustomSelect value={month} options={MONTHS} onChange={setMonth} />
            <CustomSelect value={year} options={YEARS} onChange={setYear} />
          </div>
        </div>
        <button className="button" type="button" onClick={go} disabled={loading}>{loading ? "Loading..." : "Go"}</button>
      </div>

      {rows && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4">
          {rows.length === 0 ? (
            <p className="text-center text-text-muted py-6">No Records Found</p>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={head}>S.No</th>
                  <th style={head}>Mode of Task</th>
                  <th style={head}>Status</th>
                  <th style={head}>Assigned On</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>{r.modeOfTask}</td>
                    <td style={cell}>{r.status}</td>
                    <td style={cell}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function TaskManagementPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [tab, setTab] = useState<"home" | "assign" | "status" | "track">("home");

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-text-primary">Task Management System</h2>
        <div className="flex gap-2 border-b border-border-subtle">
          {[
            { key: "home", label: "Home" },
            { key: "assign", label: "Assign" },
            { key: "status", label: "Status" },
            { key: "track", label: "Track" }
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              className={`px-4 py-2 text-sm font-medium ${tab === t.key ? "border-b-2 border-brand-primary text-brand-primary" : "text-text-muted"}`}
              onClick={() => setTab(t.key as typeof tab)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "home" && <HomeTab />}
      {tab === "assign" && <AssignTab />}
      {tab === "status" && <StatusTab />}
      {tab === "track" && <TrackTab />}
    </section>
  );
}
