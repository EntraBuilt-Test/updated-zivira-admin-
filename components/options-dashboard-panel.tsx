"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Download, Plus, Search, Settings2, SlidersHorizontal, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  apiClient,
  type DashboardChartType,
  type DashboardModule,
  type DashboardRecord,
  type DashboardWidget,
  type DashboardWidgetData,
  type DashboardWidgetTreeNode,
  type Employee
} from "@/lib/api-client";

/**
 * Real dashboard-builder screen, replacing the old generic-table
 * "Options - Dashboard" (Name/Value/Description/Status rows with no real
 * behavior). Mirrors sanpharma.info's MasterFiles/DynamicDashboard/
 * Dashboard.aspx flow: Module tabs -> named dashboards -> up to 6 widgets,
 * each widget a real aggregation chart fetched from
 * /company/dashboards/widget-data (see dashboard.routes.ts on the backend).
 *
 * Everything here is backed by real endpoints — no fake/hardcoded chart
 * data. Where the underlying master schema has no field that matches a
 * sanpharma.info label exactly (e.g. "Campaign" on doctors), the backend
 * substitutes the closest real field and reports that in the widget's
 * `note`, which this panel surfaces as a small inline caption on the tile.
 */

const MODULES: DashboardModule[] = ["Master KPI", "Marketing KPI", "Sales KPI"];
const MAX_WIDGETS = 6;

const CHART_TYPES: { type: DashboardChartType; label: string }[] = [
  { type: "pie", label: "Pie" },
  { type: "donut", label: "Donut" },
  { type: "bar", label: "Bar" },
  { type: "line", label: "Line" },
  { type: "area", label: "Area" },
  { type: "funnel", label: "Funnel" },
  { type: "table", label: "Table" }
];

// Brand-neutral categorical palette, cycled per slice/bar/point.
const PALETTE = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6"];

function colorFor(i: number) {
  return PALETTE[i % PALETTE.length];
}

// Some dimensions in the widget tree already read like "State wise" (a
// leaf label, not a bare noun like "Speciality"), so naively appending
// " wise " to build the widget name doubles up into "State wise wise X".
// Build names dimension-first so a dimension that already contains the
// word "wise" isn't given a second one, and normalize any name (freshly
// built, hand-edited, or already stored from before this fix) the same
// way so old dashboards render correctly without a data migration.
function buildWidgetName(dimension: string, category: string) {
  const alreadyWise = /\bwise\b/i.test(dimension);
  return alreadyWise ? `${dimension} ${category}` : `${dimension} wise ${category}`;
}

function displayWidgetName(name: string) {
  return name.replace(/\bwise\s+wise\b/gi, "wise");
}

// ── Minimal inline-SVG chart primitives (no chart library in this repo's
// package.json — see report for why hand-rolled SVG was chosen over adding
// a dependency). Every chart takes the same {labels, values} shape returned
// by GET /company/dashboards/widget-data. ──────────────────────────────────

function useTooltip() {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  return { tip, setTip };
}

function PieChart({ data, donut }: { data: DashboardWidgetData; donut?: boolean }) {
  const { tip, setTip } = useTooltip();
  const total = data.total || data.values.reduce((a, b) => a + b, 0) || 1;
  const size = 220;
  const r = 90;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -90;
  const slices = data.values.map((v, i) => {
    const frac = v / total;
    const start = angle;
    const sweep = frac * 360;
    angle += sweep;
    const end = angle;
    const large = sweep > 180 ? 1 : 0;
    const toXY = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [x1, y1] = toXY(start);
    const [x2, y2] = toXY(end);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const midDeg = (start + end) / 2;
    const [lx, ly] = toXY((midDeg * 1));
    const labelX = cx + (r * 0.65) * Math.cos((midDeg * Math.PI) / 180);
    const labelY = cy + (r * 0.65) * Math.sin((midDeg * Math.PI) / 180);
    return { path, pct: frac * 100, color: colorFor(i), labelX, labelY, label: data.labels[i], value: v };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="var(--panel, #fff)"
            strokeWidth={1}
            onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, text: `${s.label}: ${s.value}` })}
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, text: `${s.label}: ${s.value}` })}
            onMouseLeave={() => setTip(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
        {donut && <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--panel, #fff)" />}
        {slices.map((s, i) =>
          s.pct >= 4 ? (
            <text key={i} x={s.labelX} y={s.labelY} fontSize={11} fill="#fff" textAnchor="middle" fontWeight={700} pointerEvents="none">
              {s.pct.toFixed(1)}%
            </text>
          ) : null
        )}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", fontSize: 12 }}>
        {slices.map((s, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>
      {tip && (
        <div style={{ position: "fixed", left: tip.x + 12, top: tip.y + 12, background: "#111", color: "#fff", fontSize: 11, padding: "3px 7px", borderRadius: 4, pointerEvents: "none", zIndex: 200 }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}

function BarChart({ data }: { data: DashboardWidgetData }) {
  const w = 320;
  const h = 220;
  const pad = 28;
  const max = Math.max(1, ...data.values);
  const bw = data.values.length ? (w - pad * 2) / data.values.length : 0;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.values.map((v, i) => {
        const barH = ((h - pad * 2) * v) / max;
        const x = pad + i * bw + bw * 0.15;
        const y = h - pad - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw * 0.7} height={barH} fill={colorFor(i)} rx={3} />
            <text x={x + bw * 0.35} y={h - pad + 12} fontSize={9} textAnchor="middle" fill="var(--ink, #333)">
              {String(data.labels[i]).slice(0, 8)}
            </text>
            <text x={x + bw * 0.35} y={y - 4} fontSize={10} textAnchor="middle" fill="var(--ink, #333)">
              {v}
            </text>
          </g>
        );
      })}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border, #ccc)" />
    </svg>
  );
}

function LineOrAreaChart({ data, area }: { data: DashboardWidgetData; area?: boolean }) {
  const w = 320;
  const h = 220;
  const pad = 28;
  const max = Math.max(1, ...data.values);
  const n = data.values.length;
  const step = n > 1 ? (w - pad * 2) / (n - 1) : 0;
  const pts = data.values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((h - pad * 2) * v) / max;
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1]?.[0] ?? pad} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {area && <path d={areaPath} fill={colorFor(0)} opacity={0.25} />}
      <path d={linePath} fill="none" stroke={colorFor(0)} strokeWidth={2} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={3} fill={colorFor(0)} />
          <text x={x} y={h - pad + 12} fontSize={9} textAnchor="middle" fill="var(--ink, #333)">
            {String(data.labels[i]).slice(0, 8)}
          </text>
        </g>
      ))}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border, #ccc)" />
    </svg>
  );
}

function FunnelChart({ data }: { data: DashboardWidgetData }) {
  const w = 260;
  const rowH = 30;
  const max = Math.max(1, ...data.values);
  return (
    <svg width={w} height={rowH * data.values.length + 10} viewBox={`0 0 ${w} ${rowH * data.values.length + 10}`}>
      {data.values.map((v, i) => {
        const frac = v / max;
        const bw = frac * (w - 20);
        const x = (w - bw) / 2;
        const y = i * rowH + 4;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={rowH - 8} fill={colorFor(i)} rx={4} />
            <text x={w / 2} y={y + (rowH - 8) / 2 + 4} fontSize={10} fill="#fff" textAnchor="middle" fontWeight={600}>
              {data.labels[i]}: {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TableChart({ data }: { data: DashboardWidgetData }) {
  return (
    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border, #ddd)" }}>Label</th>
          <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid var(--border, #ddd)" }}>Count</th>
        </tr>
      </thead>
      <tbody>
        {data.labels.map((l, i) => (
          <tr key={i}>
            <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border, #eee)" }}>{l}</td>
            <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border, #eee)", textAlign: "right" }}>{data.values[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ChartRenderer({ chartType, data }: { chartType: DashboardChartType; data: DashboardWidgetData | null }) {
  if (!data || data.labels.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--muted, #888)", fontSize: 13 }}>No data for this selection yet.</div>;
  }
  switch (chartType) {
    case "pie":
      return <PieChart data={data} />;
    case "donut":
      return <PieChart data={data} donut />;
    case "bar":
      return <BarChart data={data} />;
    case "line":
      return <LineOrAreaChart data={data} />;
    case "area":
      return <LineOrAreaChart data={data} area />;
    case "funnel":
      return <FunnelChart data={data} />;
    case "table":
      return <TableChart data={data} />;
    default:
      return <PieChart data={data} />;
  }
}

// ── Searchable Field Force dropdown, "NAME - DESIGNATION - TERRITORY" ──────
function FieldForceDropdown({
  employees,
  value,
  onChange
}: {
  employees: Employee[];
  value: string;
  onChange: (employeeCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = employees.find((e) => e.employeeCode === value);
  const label = selected ? `${selected.name} - ${selected.designation} - ${selected.territory}` : "admin - Admin -";

  const filtered = employees.filter((e) => `${e.name} ${e.designation} ${e.territory}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 240 }}>
      <button
        type="button"
        className="input flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
            background: "var(--panel, #fff)", border: "1px solid var(--border, #ddd)", borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 320, overflowY: "auto"
          }}
        >
          <div style={{ padding: 8, borderBottom: "1px solid var(--border, #eee)", display: "flex", alignItems: "center", gap: 6 }}>
            <Search size={14} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search field force..."
              style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent", color: "inherit" }}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
            style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: value === "" ? 700 : 400, background: value === "" ? "var(--brand-soft, #eef4ff)" : "transparent" }}
          >
            admin - Admin -
          </div>
          {filtered.map((e) => (
            <div
              key={e.employeeCode}
              role="button"
              tabIndex={0}
              onClick={() => { onChange(e.employeeCode); setOpen(false); setQuery(""); }}
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: e.employeeCode === value ? 700 : 400, background: e.employeeCode === value ? "var(--brand-soft, #eef4ff)" : "transparent" }}
            >
              {e.name} - {e.designation} - {e.territory}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "var(--muted, #888)" }}>No matches</div>}
        </div>
      )}
    </div>
  );
}

// ── New Dashboard modal (screenshots 4-5) ──────────────────────────────────
function NewDashboardModal({
  defaultModule,
  onCancel,
  onCreate
}: {
  defaultModule: DashboardModule;
  onCancel: () => void;
  onCreate: (name: string, module: DashboardModule) => void;
}) {
  const [name, setName] = useState("");
  const [module, setModule] = useState<DashboardModule>(defaultModule);
  const [moduleOpen, setModuleOpen] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: 20 }}>
      <div style={{ background: "var(--panel, #fff)", borderRadius: 10, padding: 24, width: 420, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>New Dashboard</h2>
          <button type="button" aria-label="Close" onClick={onCancel}><X size={20} /></button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Name</label>
        <input className="input" style={{ width: "100%", marginBottom: 16 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zivira Update" />

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Module</label>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <button type="button" className="input flex items-center justify-between" style={{ width: "100%", display: "flex", justifyContent: "space-between" }} onClick={() => setModuleOpen((o) => !o)}>
            {module} <ChevronDown size={16} />
          </button>
          {moduleOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--panel, #fff)", border: "1px solid var(--border, #ddd)", borderRadius: 8, zIndex: 90 }}>
              {MODULES.map((m) => (
                <div
                  key={m}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setModule(m); setModuleOpen(false); }}
                  style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, background: m === module ? "var(--brand-soft, #eef4ff)" : "transparent" }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="button" type="button" disabled={!name.trim()} onClick={() => onCreate(name.trim(), module)}>Create</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Widget modal (screenshots 7-9) ─────────────────────────────────────
function AddWidgetModal({
  tree,
  onCancel,
  onAdd
}: {
  tree: DashboardWidgetTreeNode[];
  onCancel: () => void;
  onAdd: (widget: DashboardWidget) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string>(tree[0]?.category ?? "");
  const [category, setCategory] = useState<string>(tree[0]?.category ?? "");
  const [dimension, setDimension] = useState<string>(tree[0]?.dimensions[0] ?? "");
  const [widgetName, setWidgetName] = useState(buildWidgetName(tree[0]?.dimensions[0] ?? "", tree[0]?.category ?? ""));
  const [splitBy, setSplitBy] = useState("None");
  const [chartType, setChartType] = useState<DashboardChartType>("pie");
  const [preview, setPreview] = useState<DashboardWidgetData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitByOptions = useMemo(() => {
    const dims = tree.find((t) => t.category === category)?.dimensions ?? [];
    return ["None", ...dims.filter((d) => d !== dimension)];
  }, [tree, category, dimension]);

  async function loadPreview(cat: string, dim: string) {
    setLoadingPreview(true);
    setError(null);
    try {
      const res = await apiClient.dashboardWidgetData({ category: cat, dimension: dim });
      setPreview(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preview");
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  useEffect(() => {
    if (category && dimension) void loadPreview(category, dimension);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectLeaf(cat: string, dim: string) {
    setCategory(cat);
    setDimension(dim);
    setSplitBy("None");
    setWidgetName(buildWidgetName(dim, cat));
    void loadPreview(cat, dim);
  }

  async function handleAdd() {
    setSaving(true);
    setError(null);
    try {
      await onAdd({ widgetName, category, dimension, splitBy, chartType });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add widget");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: 20 }}>
      <div style={{ background: "var(--panel, #fff)", borderRadius: 10, width: 920, maxWidth: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--border, #eee)" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Add Widget</h2>
          <button type="button" aria-label="Close" onClick={onCancel}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Left: category tree */}
          <div style={{ width: 260, borderRight: "1px solid var(--border, #eee)", overflowY: "auto", padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: "uppercase", color: "var(--muted, #888)" }}>Select Parameters</div>
            {tree.map((node) => (
              <div key={node.category} style={{ marginBottom: 6 }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpanded(expanded === node.category ? "" : node.category)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 6px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}
                >
                  {node.category}
                  {expanded === node.category ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {expanded === node.category && (
                  <div style={{ paddingLeft: 10 }}>
                    {node.dimensions.map((dim) => {
                      const active = category === node.category && dimension === dim;
                      return (
                        <div
                          key={dim}
                          role="button"
                          tabIndex={0}
                          onClick={() => selectLeaf(node.category, dim)}
                          style={{
                            padding: "7px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, marginBottom: 2,
                            background: active ? "#2563eb" : "transparent", color: active ? "#fff" : "inherit"
                          }}
                        >
                          {dim}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: widget config + preview */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Widget name</label>
            <input className="input" style={{ width: "100%", marginBottom: 16 }} value={widgetName} onChange={(e) => setWidgetName(e.target.value)} />

            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Split By</label>
            <select className="input" style={{ width: "100%", marginBottom: 20 }} value={splitBy} onChange={(e) => setSplitBy(e.target.value)}>
              {splitByOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Choose Chart Type</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {CHART_TYPES.map((c) => (
                <button
                  key={c.type}
                  type="button"
                  title={c.label}
                  onClick={() => setChartType(c.type)}
                  style={{
                    width: 40, height: 36, borderRadius: 6, border: "1px solid var(--border, #ddd)",
                    background: chartType === c.type ? "#111" : "var(--panel, #fff)",
                    color: chartType === c.type ? "#fff" : "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer"
                  }}
                >
                  {c.label.slice(0, 4)}
                </button>
              ))}
            </div>

            <div style={{ border: "1px solid var(--border, #eee)", borderRadius: 8, padding: 16, minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {loadingPreview ? <span style={{ fontSize: 13, color: "var(--muted, #888)" }}>Loading preview…</span> : <ChartRenderer chartType={chartType} data={preview} />}
            </div>
            {preview?.note && (
              <p style={{ fontSize: 11.5, color: "var(--muted, #888)", marginTop: 8 }}>Note: {preview.note}</p>
            )}
            {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{error}</p>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border, #eee)" }}>
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="button" type="button" disabled={saving || !widgetName.trim()} onClick={handleAdd}>{saving ? "Adding…" : "Add"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard detail view (screenshot 6, 9) ────────────────────────────────
function DashboardDetail({
  dashboard,
  tree,
  employees,
  onBack,
  onChanged
}: {
  dashboard: DashboardRecord;
  tree: DashboardWidgetTreeNode[];
  employees: Employee[];
  onBack: () => void;
  onChanged: (d: DashboardRecord) => void;
}) {
  const [selectedFieldForce, setSelectedFieldForce] = useState("");
  const [appliedFieldForce, setAppliedFieldForce] = useState("");
  const [widgetData, setWidgetData] = useState<Record<number, DashboardWidgetData | null>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [editingWidget, setEditingWidget] = useState<number | null>(null);
  const [editChartType, setEditChartType] = useState<DashboardChartType>("pie");
  const [savingWidget, setSavingWidget] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function loadAllWidgetData(fieldForce: string) {
    const entries = await Promise.all(
      dashboard.widgets.map(async (w, i) => {
        try {
          const res = await apiClient.dashboardWidgetData({ category: w.category, dimension: w.dimension, fieldForce: fieldForce || undefined });
          return [i, res.data] as const;
        } catch {
          return [i, null] as const;
        }
      })
    );
    setWidgetData(Object.fromEntries(entries));
  }

  useEffect(() => {
    void loadAllWidgetData(appliedFieldForce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard.widgets.length]);

  async function handleApply() {
    setAppliedFieldForce(selectedFieldForce);
    setIsApplying(true);
    try {
      await loadAllWidgetData(selectedFieldForce);
    } finally {
      setIsApplying(false);
    }
  }

  async function handleClear() {
    setSelectedFieldForce("");
    setAppliedFieldForce("");
    setIsApplying(true);
    try {
      await loadAllWidgetData("");
    } finally {
      setIsApplying(false);
    }
  }

  function openWidgetSettings(index: number) {
    setEditingWidget(index === editingWidget ? null : index);
    setEditChartType(dashboard.widgets[index].chartType);
  }

  async function handleSaveWidgetSettings(index: number) {
    setSavingWidget(true);
    setError(null);
    try {
      const res = await apiClient.updateDashboardWidget(dashboard.id, index, { chartType: editChartType });
      onChanged(res.data);
      setEditingWidget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update widget");
    } finally {
      setSavingWidget(false);
    }
  }

  async function handleAddWidget(widget: DashboardWidget) {
    const res = await apiClient.addDashboardWidget(dashboard.id, widget);
    onChanged(res.data);
    setShowAddModal(false);
    void loadAllWidgetData(appliedFieldForce);
  }

  async function handleRemoveWidget(index: number) {
    try {
      const res = await apiClient.removeDashboardWidget(dashboard.id, index);
      onChanged(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove widget");
    }
  }

  // Real PDF export (previously a client-side JSON dump). Renders one
  // section per widget — title, the field-force scope it was fetched under,
  // and a label/value table with a total row. A rasterized chart snapshot
  // per widget would be nicer, but turning the hand-rolled inline-SVG
  // charts above into canvas images reliably (across pie/bar/line/funnel/
  // table) is fragile in this environment, so the tabular form is used
  // instead — it carries the same real numbers the tiles show on screen.
  function handleDownload() {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: "pt" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.text(dashboard.name, 40, 40);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `${dashboard.module}${appliedFieldForce ? ` — filtered by Field Force: ${appliedFieldForce}` : ""} — generated ${new Date().toLocaleString()}`,
        40,
        58
      );
      doc.setTextColor(0);

      let cursorY = 80;

      dashboard.widgets.forEach((w, i) => {
        const data = widgetData[i] ?? { labels: [], values: [], total: 0 };
        if (cursorY > doc.internal.pageSize.getHeight() - 120) {
          doc.addPage();
          cursorY = 40;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(displayWidgetName(w.widgetName), 40, cursorY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        const scopeLine = data.fieldForceSupported === false && appliedFieldForce
          ? `${w.category} / ${w.dimension} — chart: ${w.chartType} — not filterable by field force`
          : `${w.category} / ${w.dimension} — chart: ${w.chartType}`;
        doc.text(scopeLine, 40, cursorY + 13);
        doc.setTextColor(0);

        const rows = data.labels.map((label, idx) => [label, String(data.values[idx] ?? 0)]);
        rows.push(["Total", String(data.total ?? 0)]);

        autoTable(doc, {
          startY: cursorY + 20,
          head: [["Label", "Count"]],
          body: rows.length ? rows : [["No data", "0"]],
          margin: { left: 40, right: 40 },
          styles: { fontSize: 9 },
          headStyles: { fillColor: [37, 99, 235] },
          didParseCell: (data2) => {
            if (data2.row.index === rows.length - 1 && data2.section === "body") {
              data2.cell.styles.fontStyle = "bold";
            }
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cursorY = (doc as any).lastAutoTable.finalY + 30;
      });

      void pageWidth;
      doc.save(`${dashboard.name.replace(/\s+/g, "_")}-dashboard.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--muted, #888)", marginBottom: 16 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer" }}>Home</button>
        {" / "}
        <span>{dashboard.module}</span>
        {" / "}
        <strong style={{ color: "inherit" }}>{dashboard.name}</strong>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="button" type="button" onClick={handleDownload} disabled={downloading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={16} /> {downloading ? "Preparing…" : "Download"}
          </button>
          <button
            className="button"
            type="button"
            disabled={dashboard.widgets.length >= MAX_WIDGETS}
            onClick={() => setShowAddModal(true)}
            title={dashboard.widgets.length >= MAX_WIDGETS ? "Maximum of 6 widgets reached" : undefined}
          >
            Add Widgets ({dashboard.widgets.length}/{MAX_WIDGETS})
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Field Force</span>
          <FieldForceDropdown employees={employees} value={selectedFieldForce} onChange={setSelectedFieldForce} />
          <button className="button" type="button" onClick={() => void handleApply()} disabled={isApplying}>{isApplying ? "Applying…" : "Apply"}</button>
          <button className="button button-secondary" type="button" onClick={() => void handleClear()} disabled={isApplying}>Clear</button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--muted, #888)", marginBottom: 12 }}>
        {appliedFieldForce
          ? `Showing data scoped to the selected Field Force. Widgets whose data has no per-rep association are marked "Not filterable by field force" below.`
          : `Select a Field Force and click Apply to scope every widget's data to that rep, where the underlying data supports it.`}
      </p>

      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {dashboard.widgets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted, #888)" }}>
          <SlidersHorizontal size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>You must add widgets to be shown</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {dashboard.widgets.map((w, i) => {
            const data = widgetData[i] ?? null;
            const notFilterable = Boolean(appliedFieldForce) && data?.fieldForceSupported === false;
            return (
              <div key={i} style={{ background: "var(--panel, #fff)", border: "1px solid var(--border, #eee)", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>{displayWidgetName(w.widgetName)}</strong>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => openWidgetSettings(i)}
                      title="Chart settings"
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", opacity: 0.7, display: "flex" }}
                    >
                      <Settings2 size={15} />
                    </button>
                    <button type="button" onClick={() => void handleRemoveWidget(i)} title="Remove widget" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#dc2626", display: "flex" }}>
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {editingWidget === i && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10, padding: 8, background: "var(--brand-soft, #f5f7fb)", borderRadius: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Chart type</span>
                    <select
                      className="input"
                      style={{ fontSize: 12, padding: "4px 6px" }}
                      value={editChartType}
                      onChange={(e) => setEditChartType(e.target.value as DashboardChartType)}
                    >
                      {CHART_TYPES.map((c) => (
                        <option key={c.type} value={c.type}>{c.label}</option>
                      ))}
                    </select>
                    <button className="button" type="button" disabled={savingWidget} onClick={() => void handleSaveWidgetSettings(i)} style={{ fontSize: 12, padding: "4px 10px" }}>
                      {savingWidget ? "Saving…" : "Save"}
                    </button>
                    <button className="button button-secondary" type="button" onClick={() => setEditingWidget(null)} style={{ fontSize: 12, padding: "4px 10px" }}>
                      Cancel
                    </button>
                  </div>
                )}

                <ChartRenderer chartType={w.chartType} data={data} />
                {data?.note && <p style={{ fontSize: 11, color: "var(--muted, #888)", marginTop: 8 }}>Note: {data.note}</p>}
                {notFilterable && !data?.note && (
                  <p style={{ fontSize: 11, color: "var(--muted, #888)", marginTop: 8 }}>Not filterable by field force</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && <AddWidgetModal tree={tree} onCancel={() => setShowAddModal(false)} onAdd={handleAddWidget} />}
    </div>
  );
}

// ── Landing / list view (screenshot 3) ─────────────────────────────────────
export function OptionsDashboardPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const router = useRouter();
  const [module, setModule] = useState<DashboardModule>("Master KPI");
  const [dashboards, setDashboards] = useState<DashboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState<DashboardRecord | null>(null);
  const [tree, setTree] = useState<DashboardWidgetTreeNode[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  async function loadDashboards(m: DashboardModule) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listDashboards(m);
      setDashboards(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboards");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboards(module);
    setActiveDashboard(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  useEffect(() => {
    void apiClient.dashboardWidgetTree().then((res) => setTree(res.data)).catch(() => setTree([]));
    void apiClient.employees().then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  async function handleCreate(name: string, mod: DashboardModule) {
    try {
      const res = await apiClient.createDashboard({ name, module: mod });
      setShowNewModal(false);
      setModule(mod);
      setDashboards((prev) => [res.data, ...prev]);
      setActiveDashboard(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create dashboard");
    }
  }

  if (activeDashboard) {
    return (
      <DashboardDetail
        dashboard={activeDashboard}
        tree={tree}
        employees={employees}
        onBack={() => setActiveDashboard(null)}
        onChanged={setActiveDashboard}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {MODULES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModule(m)}
              className={m === module ? "button" : "button button-secondary"}
              style={{ fontSize: 13 }}
            >
              {m}
            </button>
          ))}
        </div>
        <button className="button" type="button" onClick={() => setShowNewModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> New Dashboard
        </button>
      </div>

      <div style={{ fontSize: 13, color: "var(--muted, #888)", marginBottom: 20 }}>
        Home / Zivira Labs Pvt Ltd
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--muted, #888)" }}>Loading…</p>
      ) : dashboards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No Dashboards Available</h3>
          <p style={{ fontSize: 14, color: "var(--muted, #888)", marginBottom: 24 }}>
            You currently don&apos;t have any dashboards created. Create your first dashboard by clicking the button below.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="button button-secondary" type="button" onClick={() => router.push("/admin/home")}>Home</button>
            <button className="button" type="button" onClick={() => setShowNewModal(true)}>+ Create New Dashboard</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {dashboards.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDashboard(d)}
              className="button button-secondary"
              style={{ textAlign: "left", padding: 16, display: "flex", flexDirection: "column", gap: 6, height: "auto" }}
            >
              <strong>{d.name}</strong>
              <span style={{ fontSize: 12, color: "var(--muted, #888)" }}>{d.widgets.length}/{MAX_WIDGETS} widgets</span>
            </button>
          ))}
        </div>
      )}

      {showNewModal && <NewDashboardModal defaultModule={module} onCancel={() => setShowNewModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
