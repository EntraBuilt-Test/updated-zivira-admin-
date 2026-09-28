"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Round 8 items 11-12 — real "Create - Activity" + "Activity - Add
// Parameter" tabs, backed by the new ActivityModel / ActivityParameterModel
// collections and full CRUD routes (masters-actions.routes.ts). Every row
// shown here is a real persisted document; Edit/Preview/Deactivate and the
// Existing/New Order reorder all write back through real endpoints.
const MODE_OPTIONS = ["MR", "MGR", "MR & MGR"];
const FOR_OPTIONS = ["Common Activity", "Doctors", "Chemists", "Stockists", "Unlisted Doctors", "Hospitals", "CIP"];
const ACTIVITY_FOR_OPTIONS = ["---Select---", "DCR", "TP", "TP/DCR"];
// Exact list from sanpharma.info's Activity - Add Parameter screen (Round 9
// item 2 screenshot reference).
const PARAMETER_TYPES = [
  "Label", "Text Box - Characters", "Text box - Numeric", "Text Area", "Date",
  "Date Range", "Time", "Time Range", "Combo Box - Single", "Combo Box - Multiple",
  "Upload", "Currency", "Customized Tables - Single", "Customized Tables - Multiple",
  "Table Type - Row wise", "Date with Time", "Date with Time Range", "Geo Location",
  "Currency Converter"
];

const cell: React.CSSProperties = { border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", fontSize: 12 };
const head: React.CSSProperties = { ...cell, background: "#0e7490", color: "#fff", fontWeight: 600 };

type Activity = {
  id: string; shortName: string; name: string; mode: string; activityFor: string[]; status: string;
};

type ActivityParameter = {
  id: string; activityId: string; activityName: string; caption: string; captionOrder: number;
  mandatory: boolean; parameterType: string; selectMaster: string | null; tableGroup: string | null;
  activityFor: string | null; existingOrder: number; status: string;
};

function CreateActivityTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRow, setPreviewRow] = useState<Activity | null>(null);

  const [shortName, setShortName] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState(MODE_OPTIONS[0]);
  const [selectedFor, setSelectedFor] = useState<string[]>([]);
  const [forOpen, setForOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.activityList();
      setActivities(res.data as unknown as Activity[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Activities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggleFor(opt: string) {
    setSelectedFor((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  }

  function toggleAll() {
    setSelectedFor((prev) => (prev.length === FOR_OPTIONS.length ? [] : [...FOR_OPTIONS]));
  }

  function resetForm() {
    setEditingId(null);
    setShortName("");
    setName("");
    setMode(MODE_OPTIONS[0]);
    setSelectedFor([]);
  }

  async function submit() {
    setError(null);
    if (!shortName.trim() || !name.trim()) {
      setError("Short Name and Name are required.");
      return;
    }
    try {
      if (editingId) {
        await apiClient.updateActivity(editingId, { shortName, name, mode, activityFor: selectedFor });
      } else {
        await apiClient.createActivity({ shortName, name, mode, activityFor: selectedFor });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Activity");
    }
  }

  function startEdit(a: Activity) {
    setEditingId(a.id);
    setShortName(a.shortName);
    setName(a.name);
    setMode(a.mode);
    setSelectedFor(a.activityFor || []);
  }

  async function deactivate(id: string) {
    try {
      await apiClient.deactivateActivity(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate Activity");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-3">
        <h3 className="text-lg font-bold">{editingId ? "Edit Activity" : "Create - Activity"}</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Short Name</span>
            <input className="input" value={shortName} onChange={(e) => setShortName(e.target.value)} />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ minWidth: 180 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Mode</span>
            <CustomSelect value={mode} options={MODE_OPTIONS} onChange={setMode} />
          </div>
          <div style={{ minWidth: 220, position: "relative" }}>
            <span className="block text-xs font-medium text-text-muted mb-1">For</span>
            <button type="button" className="input flex items-center justify-between" onClick={() => setForOpen((o) => !o)}>
              {selectedFor.length ? selectedFor.join(", ") : "Select"}
            </button>
            {forOpen && (
              <div className="bg-surface-card border border-border-subtle rounded-lg shadow-md p-2 flex flex-col gap-1" style={{ position: "absolute", zIndex: 10, minWidth: 220 }}>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={selectedFor.length === FOR_OPTIONS.length} onChange={toggleAll} />
                  [Select all]
                </label>
                {FOR_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedFor.includes(opt)} onChange={() => toggleFor(opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="button" type="button" onClick={submit}>{editingId ? "Submit" : "Create"}</button>
          <button className="button button-secondary" type="button" onClick={resetForm}>Reset</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
        <h3 className="text-lg font-bold mb-3">Activity List</h3>
        <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={head}>S.No</th>
              <th style={head}>Short Name</th>
              <th style={head}>Name</th>
              <th style={head}>Type</th>
              <th style={head}>Edit</th>
              <th style={head}>Preview</th>
              <th style={head}>Deactivate</th>
            </tr>
          </thead>
          <tbody>
            {!loading && activities.length === 0 && <tr><td style={cell} colSpan={7}>No Records Found</td></tr>}
            {activities.map((a, i) => (
              <tr key={a.id}>
                <td style={cell}>{i + 1}</td>
                <td style={cell}>{a.shortName}</td>
                <td style={{ ...cell, fontWeight: 600 }}>{a.name}</td>
                <td style={cell}>{a.mode}</td>
                <td style={cell}><button className="button button-secondary" type="button" onClick={() => startEdit(a)}>Edit</button></td>
                <td style={cell}><button className="button button-secondary" type="button" onClick={() => setPreviewRow(a)}>Preview</button></td>
                <td style={cell}>
                  <button className="button button-secondary" type="button" disabled={a.status === "INACTIVE"} onClick={() => deactivate(a.id)}>
                    {a.status === "INACTIVE" ? "Inactive" : "Deactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewRow && (
        <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Preview - {previewRow.shortName}</h3>
            <button className="button button-secondary" type="button" onClick={() => setPreviewRow(null)}>Close</button>
          </div>
          <p><b>Name:</b> {previewRow.name}</p>
          <p><b>Mode:</b> {previewRow.mode}</p>
          <p><b>For:</b> {previewRow.activityFor?.join(", ") || "-"}</p>
          <p><b>Status:</b> {previewRow.status}</p>
        </div>
      )}
    </div>
  );
}

function AddParameterTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [masters, setMasters] = useState<string[]>([]);
  const [parameters, setParameters] = useState<ActivityParameter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [activityId, setActivityId] = useState("");
  const [caption, setCaption] = useState("");
  const [captionOrder, setCaptionOrder] = useState("1");
  const [mandatory, setMandatory] = useState<"Yes" | "No">("No");
  const [parameterType, setParameterType] = useState(PARAMETER_TYPES[0]);
  const [selectMaster, setSelectMaster] = useState("");
  const [tableGroup, setTableGroup] = useState("");
  const [activityFor, setActivityFor] = useState(ACTIVITY_FOR_OPTIONS[0]);
  const [orderEdits, setOrderEdits] = useState<Record<string, string>>({});

  async function loadAll() {
    try {
      const [actRes, masterRes] = await Promise.all([apiClient.activityList(), apiClient.masterList()]);
      setActivities(actRes.data as unknown as Activity[]);
      setMasters((masterRes.data as unknown as { key: string; title: string }[]).map((m) => m.title));
      if (!activityId && (actRes.data as unknown as Activity[]).length) {
        setActivityId((actRes.data as unknown as Activity[])[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Activities/Masters");
    }
  }

  async function loadParameters(id: string) {
    if (!id) { setParameters([]); return; }
    try {
      const res = await apiClient.activityParameterList(id);
      const rows = res.data as unknown as ActivityParameter[];
      setParameters(rows);
      setOrderEdits(Object.fromEntries(rows.map((r) => [r.id, String(r.existingOrder)])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Parameters");
    }
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (activityId) loadParameters(activityId); }, [activityId]);

  function resetForm() {
    setEditingId(null);
    setCaption("");
    setCaptionOrder("1");
    setMandatory("No");
    setParameterType(PARAMETER_TYPES[0]);
    setSelectMaster("");
    setTableGroup("");
    setActivityFor(ACTIVITY_FOR_OPTIONS[0]);
  }

  async function submit() {
    setError(null);
    if (!activityId || !caption.trim()) {
      setError("Activity Name and Caption Name are required.");
      return;
    }
    const payload = {
      activityId,
      caption,
      captionOrder: Number(captionOrder) || 1,
      mandatory: mandatory === "Yes",
      parameterType,
      selectMaster: parameterType === "Master Lookup" ? (selectMaster || null) : null,
      tableGroup: tableGroup || null,
      activityFor
    };
    try {
      if (editingId) {
        await apiClient.updateActivityParameter(editingId, payload);
      } else {
        await apiClient.createActivityParameter(payload);
      }
      resetForm();
      await loadParameters(activityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Parameter");
    }
  }

  function startEdit(p: ActivityParameter) {
    setEditingId(p.id);
    setCaption(p.caption);
    setCaptionOrder(String(p.captionOrder));
    setMandatory(p.mandatory ? "Yes" : "No");
    setParameterType(p.parameterType);
    setSelectMaster(p.selectMaster || "");
    setTableGroup(p.tableGroup || "");
    setActivityFor(p.activityFor || ACTIVITY_FOR_OPTIONS[0]);
  }

  async function deactivate(id: string) {
    try {
      await apiClient.deactivateActivityParameter(id);
      await loadParameters(activityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate Parameter");
    }
  }

  // "Generate - Sl No" — commits whatever New Order values are typed (or,
  // for any left blank, the row's current position) as the real persisted
  // existingOrder, matching the sanpharma reference's exact button.
  async function generateSlNo() {
    const orders = parameters.map((p, i) => ({
      id: p.id,
      existingOrder: orderEdits[p.id] && orderEdits[p.id].trim() ? Number(orderEdits[p.id]) : i + 1
    })).filter((o) => Number.isFinite(o.existingOrder));
    try {
      await apiClient.reorderActivityParameters(orders);
      await loadParameters(activityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order");
    }
  }

  // "Clear" — discards unsaved New Order edits, reverting the inputs back
  // to each row's real persisted existingOrder (no server write).
  function clearOrderEdits() {
    setOrderEdits(Object.fromEntries(parameters.map((p) => [p.id, String(p.existingOrder)])));
  }

  const activityLabel = (a: Activity) => `${a.shortName} - ${a.name}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-3">
        <h3 className="text-lg font-bold">{editingId ? "Edit Parameter" : "Activity - Add Parameter"}</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div style={{ minWidth: 220 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Activity Name</span>
            <CustomSelect
              value={activities.find((a) => a.id === activityId) ? activityLabel(activities.find((a) => a.id === activityId)!) : ""}
              options={activities.map(activityLabel)}
              onChange={(label) => {
                const found = activities.find((a) => activityLabel(a) === label);
                if (found) setActivityId(found.id);
              }}
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Caption Name</span>
            <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div style={{ minWidth: 90 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Order</span>
            <input className="input" type="number" min={1} value={captionOrder} onChange={(e) => setCaptionOrder(e.target.value)} />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Mandatory</span>
            <div className="flex items-center gap-3 h-9">
              <label className="flex items-center gap-1 text-sm"><input type="radio" checked={mandatory === "Yes"} onChange={() => setMandatory("Yes")} />Yes</label>
              <label className="flex items-center gap-1 text-sm"><input type="radio" checked={mandatory === "No"} onChange={() => setMandatory("No")} />No</label>
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Parameter Type</span>
            <CustomSelect value={parameterType} options={PARAMETER_TYPES} onChange={setParameterType} />
          </div>
          {parameterType === "Master Lookup" && (
            <div style={{ minWidth: 200 }}>
              <span className="block text-xs font-medium text-text-muted mb-1">Select Master</span>
              <CustomSelect value={selectMaster} options={masters} onChange={setSelectMaster} placeholder="Select master" />
            </div>
          )}
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Table Group</span>
            <input className="input" value={tableGroup} onChange={(e) => setTableGroup(e.target.value)} />
          </div>
          <div style={{ minWidth: 180 }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Activity For</span>
            <CustomSelect value={activityFor} options={ACTIVITY_FOR_OPTIONS} onChange={setActivityFor} />
          </div>
          <button className="button" type="button" onClick={submit}>{editingId ? "Submit" : "Submit"}</button>
          <button className="button button-secondary" type="button" onClick={resetForm}>Reset</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 overflow-x-auto">
        <h3 className="text-lg font-bold mb-3">{activities.find((a) => a.id === activityId)?.name || "--Select Activity--"}</h3>
        <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={head}>S.No</th>
              <th style={head}>Caption</th>
              <th style={head}>Activity Name</th>
              <th style={head}>Control</th>
              <th style={head}>Mandatory</th>
              <th style={head}>For</th>
              <th style={head}>Edit</th>
              <th style={head}>Deactivate</th>
              <th style={head}>Existing Order</th>
              <th style={head}>New Order</th>
            </tr>
          </thead>
          <tbody>
            {parameters.length === 0 && <tr><td style={cell} colSpan={10}>No Records Found</td></tr>}
            {parameters.map((p, i) => (
              <tr key={p.id}>
                <td style={cell}>{i + 1}</td>
                <td style={{ ...cell, fontWeight: 600 }}>{p.caption}</td>
                <td style={cell}>{p.activityName}</td>
                <td style={cell}>{p.parameterType}</td>
                <td style={cell}>{p.mandatory ? "Yes" : "No"}</td>
                <td style={cell}>{p.activityFor || "-"}</td>
                <td style={cell}><button className="button button-secondary" type="button" onClick={() => startEdit(p)}>Edit</button></td>
                <td style={cell}>
                  <button className="button button-secondary" type="button" disabled={p.status === "INACTIVE"} onClick={() => deactivate(p.id)}>
                    {p.status === "INACTIVE" ? "Inactive" : "Deactivate"}
                  </button>
                </td>
                <td style={cell}>{p.existingOrder}</td>
                <td style={cell}>
                  <input
                    className="input"
                    style={{ width: 64, textAlign: "center", padding: "2px 4px" }}
                    type="number"
                    value={orderEdits[p.id] ?? ""}
                    onChange={(e) => setOrderEdits((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2 mt-3">
          <button className="button" type="button" onClick={generateSlNo} disabled={!parameters.length}>Generate - Sl No</button>
          <button className="button button-secondary" type="button" onClick={clearOrderEdits} disabled={!parameters.length}>Clear</button>
        </div>
      </div>
    </div>
  );
}

type CustomizedMasterRow = { id?: string; shortName: string; name: string; active: boolean };
type CustomizedMaster = { id: string; name: string; rows: CustomizedMasterRow[] };

function CustomizedMasterTab() {
  const [masters, setMasters] = useState<CustomizedMaster[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [rows, setRows] = useState<CustomizedMasterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(selectAfter?: string) {
    try {
      const res = await apiClient.customizedMasterList();
      const list = res.data as unknown as CustomizedMaster[];
      setMasters(list);
      const target = selectAfter ? list.find((m) => m.id === selectAfter) : list.find((m) => m.id === selectedId);
      if (target) {
        setSelectedId(target.id);
        setRows(target.rows.length ? target.rows : [{ shortName: "", name: "", active: true }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Customized Masters");
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setError(null);
    if (!newName.trim()) return;
    try {
      const res = await apiClient.createCustomizedMaster(newName.trim());
      setNewName("");
      await load((res.data as unknown as CustomizedMaster).id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Customized Master");
    }
  }

  function selectMaster(id: string) {
    const m = masters.find((mm) => mm.id === id);
    setSelectedId(id);
    setRows(m ? (m.rows.length ? m.rows : [{ shortName: "", name: "", active: true }]) : []);
  }

  function updateRow(i: number, field: "shortName" | "name", value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { shortName: "", name: "", active: true }]);
  }

  async function deactivateRow(i: number) {
    const row = rows[i];
    if (row.id) {
      try {
        await apiClient.deactivateCustomizedMasterRow(selectedId, row.id);
        await load(selectedId);
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deactivate row");
        return;
      }
    }
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.saveCustomizedMasterRows(selectedId, rows);
      await load(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    const m = masters.find((mm) => mm.id === selectedId);
    setRows(m ? (m.rows.length ? m.rows : [{ shortName: "", name: "", active: true }]) : []);
  }

  const selected = masters.find((m) => m.id === selectedId);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3">
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Customized Master Name</span>
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <button className="button" type="button" onClick={create}>Create</button>
        <div style={{ minWidth: 220 }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Select Customized Master</span>
          <CustomSelect value={selected?.name || ""} options={masters.map((m) => m.name)} onChange={(name) => {
            const m = masters.find((mm) => mm.name === name);
            if (m) selectMaster(m.id);
          }} placeholder="Select" />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {selected && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 flex flex-col gap-3">
          <h3 className="text-lg font-bold">{selected.name}</h3>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={head}>Sl No</th>
                  <th style={head}>Short Name</th>
                  <th style={head}>Name</th>
                  <th style={head}>Deactivate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || `new-${i}`}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>
                      <input className="input" style={{ minWidth: 140 }} value={r.shortName} onChange={(e) => updateRow(i, "shortName", e.target.value)} disabled={!r.active} />
                    </td>
                    <td style={cell}>
                      <input className="input" style={{ minWidth: 200 }} value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} disabled={!r.active} />
                    </td>
                    <td style={cell}>
                      {r.active ? (
                        <button className="button button-secondary" type="button" onClick={() => deactivateRow(i)}>Deactivate</button>
                      ) : (
                        "Inactive"
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={cell} colSpan={3}>
                    <button className="button button-secondary" type="button" onClick={addRow}>Add New Row</button>
                  </td>
                  <td style={cell} />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button className="button" type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button className="button button-secondary" type="button" onClick={clear}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityMasterPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [tab, setTab] = useState<"create" | "parameter" | "customized">("create");

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Master</p>
        <h2 className="text-2xl font-bold text-text-primary">Activity - Master &amp; Screen Creation</h2>
      </div>

      <div className="flex gap-2 border-b border-border-subtle">
        {[
          { key: "create", label: "Create - Activity" },
          { key: "parameter", label: "Activity - Add Parameter" },
          { key: "customized", label: "Customized Master" }
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

      {tab === "create" && <CreateActivityTab />}
      {tab === "parameter" && <AddParameterTab />}
      {tab === "customized" && <CustomizedMasterTab />}
    </section>
  );
}
