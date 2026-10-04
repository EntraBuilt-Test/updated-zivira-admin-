"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { FieldForceSelect } from "@/components/field-force-select";
import {
  apiClient,
  type SurveyQuestion,
  type SurveyQuestionControlType,
  type Survey,
  type SurveyDetail,
  type SurveyQuestionRef,
  type Employee,
  type SurveyViewResult
} from "@/lib/api-client";

// Coordinator round -- Activity Reports > Survey, built to match the real
// legacy sanpharma.info Survey module exactly (Survey_Ques_Creation.aspx /
// Survey_Creation.aspx / Survey_Ques_Process.aspx). The legacy app shows 4
// cross-nav buttons (Create - Question, Create - Survey, Update - Survey,
// View) on every Survey screen so an admin can jump between them freely.
// Our tile-grid only exposes 3 entry tiles (Question Creation, Updation,
// View) per the original spec, so this single client component implements
// all 4 real screens as internal "screens" and renders the same legacy
// cross-nav bar on every one of them -- the 3 tile routes each just mount
// this component with a different `initialScreen`, and "Create - Survey"
// (reachable only via the cross-nav bar, matching the coordinator's
// "fine to keep 3 tile entry points" allowance) lives here too.

type ScreenKey = "question-creation" | "create-survey" | "update-survey" | "view";

const CONTROL_TYPES: SurveyQuestionControlType[] = [
  "Enterable - Text",
  "Enterable - Numeric",
  "Selectable - Single",
  "Selectable- Multiple"
];
const ENTERABLE_TYPES = new Set<SurveyQuestionControlType>(["Enterable - Text", "Enterable - Numeric"]);
const SELECTABLE_TYPES = new Set<SurveyQuestionControlType>(["Selectable - Single", "Selectable- Multiple"]);

function CrossNav({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) {
  const items: { key: ScreenKey; label: string }[] = [
    { key: "create-survey", label: "Create - Survey" },
    { key: "update-survey", label: "Update - Survey" },
    { key: "view", label: "View" }
  ];
  // Legacy shows "Create - Question" as a cross-nav button on every OTHER
  // screen but not on itself (it's the page you're already on); mirrored
  // the same way here -- the current screen's own button is simply not in
  // the bar, instead of being shown disabled.
  const allItems: { key: ScreenKey; label: string }[] = active === "question-creation"
    ? items
    : [{ key: "question-creation", label: "Create - Question" }, ...items.filter((i) => i.key !== active)];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {allItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.key)}
          className="px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm shadow-sm hover:bg-brand-primary-hover transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-status-success text-on-primary px-4 py-2.5 rounded-lg shadow-lg font-label-md text-label-md">
      {message}
    </div>
  );
}

function QuestionCreationScreen({ onToast }: { onToast: (msg: string) => void }) {
  const [controlType, setControlType] = useState<SurveyQuestionControlType | "">("");
  const [questionText, setQuestionText] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [noOfOptions, setNoOfOptions] = useState("");
  const [optionLabels, setOptionLabels] = useState<string[]>([]);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    apiClient.surveyQuestions().then((r) => setQuestions(r.data)).catch(() => setQuestions([])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function handleNoOfOptionsChange(value: string) {
    setNoOfOptions(value);
    const n = Math.max(0, Math.min(50, parseInt(value, 10) || 0));
    setOptionLabels((prev) => {
      const next = [...prev];
      next.length = n;
      return next.fill("", prev.length, n).map((v, i) => (i < prev.length ? prev[i] : v));
    });
  }

  function resetForm() {
    setControlType("");
    setQuestionText("");
    setMaxLength("");
    setNoOfOptions("");
    setOptionLabels([]);
  }

  async function handleAddQuestion() {
    setError("");
    if (!controlType || !questionText.trim()) {
      setError("Question Type and Question Text are required.");
      return;
    }
    const body: { questionText: string; controlType: SurveyQuestionControlType; maxLength?: number | null; options?: string[] } = {
      questionText: questionText.trim(),
      controlType
    };
    if (ENTERABLE_TYPES.has(controlType)) {
      body.maxLength = maxLength ? Number(maxLength) : null;
    }
    if (SELECTABLE_TYPES.has(controlType)) {
      body.options = optionLabels.map((o) => o.trim()).filter(Boolean);
      if (body.options.length === 0) {
        setError("Add at least one option.");
        return;
      }
    }
    setSaving(true);
    try {
      await apiClient.createSurveyQuestion(body);
      resetForm();
      load();
      onToast("Question added successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add question.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    await apiClient.deactivateSurveyQuestion(id).catch(() => {});
    load();
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-xl">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Question Creation</h2>
        <div className="space-y-1.5">
          <label className="font-label-sm text-label-sm text-text-muted">Question Type</label>
          <select
            className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
            value={controlType}
            onChange={(e) => {
              const v = e.target.value as SurveyQuestionControlType | "";
              setControlType(v);
              setMaxLength("");
              setNoOfOptions("");
              setOptionLabels([]);
            }}
          >
            <option value="">-- Select Question Type--</option>
            {CONTROL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-label-sm text-label-sm text-text-muted">Question Text</label>
          <textarea
            className="w-full min-h-[100px] px-2.5 py-2 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>
        {controlType && ENTERABLE_TYPES.has(controlType) && (
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-text-muted">Max Length</label>
            <input
              type="number"
              min={1}
              className="w-40 h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
            />
          </div>
        )}
        {controlType && SELECTABLE_TYPES.has(controlType) && (
          <div className="space-y-2">
            <label className="font-label-sm text-label-sm text-text-muted">No Of Option</label>
            <input
              type="number"
              min={1}
              max={50}
              className="w-40 h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm block"
              value={noOfOptions}
              onChange={(e) => handleNoOfOptionsChange(e.target.value)}
            />
            {optionLabels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-body-sm text-body-sm text-text-muted w-5">{idx + 1}</span>
                <input
                  type="text"
                  className="flex-1 h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
                  value={label}
                  onChange={(e) => setOptionLabels((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                />
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-status-danger text-sm">{error}</p>}
        <button
          type="button"
          onClick={handleAddQuestion}
          disabled={saving}
          className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Question"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
            <thead className="bg-brand-primary-subtle">
              <tr>
                <th className="px-3 py-2 w-14">S.No</th>
                <th className="px-3 py-2">Question Name</th>
                <th className="px-3 py-2">Control Type</th>
                <th className="px-3 py-2">Creation Date</th>
                <th className="px-3 py-2">Deactivate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && <tr><td colSpan={5} className="px-3 py-4 text-center text-text-muted text-sm">Loading...</td></tr>}
              {!loading && questions.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-text-muted text-sm">No questions created yet.</td></tr>
              )}
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td className="px-3 py-1.5">{idx + 1}</td>
                  <td className="px-3 py-1.5">{q.questionText}</td>
                  <td className="px-3 py-1.5">{q.controlType}</td>
                  <td className="px-3 py-1.5">{new Date(q.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-1.5">
                    <button type="button" onClick={() => handleDeactivate(q.id)} className="text-primary underline text-sm">
                      {q.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateSurveyScreen({ editingSurveyId, onDone, onToast }: { editingSurveyId: string | null; onDone: () => void; onToast: (msg: string) => void }) {
  const [title, setTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [allQuestions, setAllQuestions] = useState<SurveyQuestion[]>([]);
  const [draft, setDraft] = useState<SurveyQuestionRef[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.surveyQuestions().then((r) => setAllQuestions(r.data.filter((q) => q.status === "ACTIVE"))).catch(() => setAllQuestions([]));
  }, []);

  useEffect(() => {
    if (!editingSurveyId) return;
    apiClient.survey(editingSurveyId).then((r) => {
      setTitle(r.data.title);
      setFromDate(r.data.processFromDate);
      setToDate(r.data.processToDate);
      setDraft(r.data.questions.map((q) => ({ questionId: q.questionId, drs: q.drs, chm: q.chm, hos: q.hos, stk: q.stk, prd: q.prd })));
    }).catch(() => {});
  }, [editingSurveyId]);

  const questionById = useMemo(() => new Map(allQuestions.map((q) => [q.id, q])), [allQuestions]);
  const draftedIds = useMemo(() => new Set(draft.map((d) => d.questionId)), [draft]);
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allQuestions.filter((item) => !draftedIds.has(item.id) && item.questionText.toLowerCase().includes(q)).slice(0, 8);
  }, [search, allQuestions, draftedIds]);

  function addQuestion(id: string) {
    setDraft((prev) => [...prev, { questionId: id, drs: false, chm: false, hos: false, stk: false, prd: false }]);
    setSearch("");
  }
  function removeQuestion(id: string) {
    setDraft((prev) => prev.filter((d) => d.questionId !== id));
  }
  function toggleFlag(id: string, flag: keyof Omit<SurveyQuestionRef, "questionId">) {
    setDraft((prev) => prev.map((d) => (d.questionId === id ? { ...d, [flag]: !d[flag] } : d)));
  }

  async function handleCreateSurvey() {
    setError("");
    if (!title.trim() || !fromDate || !toDate) {
      setError("Title of Survey, Process From Date and Process To Date are required.");
      return;
    }
    if (draft.length === 0) {
      setError("Add at least one question to the survey.");
      return;
    }
    setSaving(true);
    try {
      if (editingSurveyId) {
        await apiClient.updateSurvey(editingSurveyId, { title: title.trim(), processFromDate: fromDate, processToDate: toDate, questions: draft });
        onToast("Survey updated successfully.");
      } else {
        await apiClient.createSurvey({ title: title.trim(), processFromDate: fromDate, processToDate: toDate, questions: draft });
        onToast("Survey created successfully.");
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save survey.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-2xl">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Question Selection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-label-sm text-label-sm text-text-muted">Title of Survey</label>
            <input type="text" className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-text-muted">Process From Date</label>
            <input type="date" className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-text-muted">Process To Date</label>
            <input type="date" className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5 relative">
          <label className="font-label-sm text-label-sm text-text-muted">Question Search</label>
          <input
            type="text"
            placeholder="Type to search real questions by name..."
            className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((q) => (
                <button key={q.id} type="button" onClick={() => addQuestion(q.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-subtle transition-colors flex items-center justify-between">
                  <span>{q.questionText}</span>
                  <span className="text-text-muted text-xs">{q.controlType}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-status-danger text-sm">{error}</p>}

      <div className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
            <thead className="bg-brand-primary-subtle">
              <tr>
                <th className="px-3 py-2 w-14">S.No</th>
                <th className="px-3 py-2">Question Name</th>
                <th className="px-3 py-2">Control Type</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Process Type</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {draft.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-center text-text-muted text-sm">Search above to add questions to this survey.</td></tr>
              )}
              {draft.map((d, idx) => {
                const q = questionById.get(d.questionId);
                return (
                  <tr key={d.questionId}>
                    <td className="px-3 py-1.5">{idx + 1}</td>
                    <td className="px-3 py-1.5">{q?.questionText ?? "(question removed)"}</td>
                    <td className="px-3 py-1.5">{q?.controlType ?? "—"}</td>
                    <td className="px-3 py-1.5">{q ? new Date(q.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-3 text-sm">
                        {(["drs", "chm", "hos", "stk", "prd"] as const).map((flag) => (
                          <label key={flag} className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" checked={d[flag]} onChange={() => toggleFlag(d.questionId, flag)} />
                            <span className="capitalize">{flag === "drs" ? "Drs." : flag === "chm" ? "Chm." : flag === "hos" ? "Hos." : flag === "stk" ? "Stk." : "Prd."}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <button type="button" onClick={() => removeQuestion(d.questionId)} className="px-2.5 py-1 rounded-md bg-status-danger-bg text-status-danger text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleCreateSurvey}
          disabled={saving}
          className="h-10 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : editingSurveyId ? "Update Survey" : "Create Survey"}
        </button>
      </div>
    </div>
  );
}

function PreviewPanel({ surveyId, onClose }: { surveyId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  useEffect(() => { apiClient.survey(surveyId).then((r) => setDetail(r.data)).catch(() => setDetail(null)); }, [surveyId]);
  return (
    <div className="bg-surface-subtle rounded-lg p-4 mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-label-md text-label-md text-text-primary font-semibold">Preview Q/A — {detail?.title ?? "..."}</h4>
        <button type="button" onClick={onClose} className="text-text-muted text-sm underline">Close</button>
      </div>
      {!detail && <p className="text-sm text-text-muted">Loading...</p>}
      {detail && detail.questions.length === 0 && <p className="text-sm text-text-muted">No questions in this survey.</p>}
      {detail && detail.questions.map((q, idx) => (
        <div key={q.questionId} className="text-sm border-b border-border-subtle pb-1.5">
          <span className="font-semibold">{idx + 1}. {q.question?.questionText ?? "(removed question)"}</span>
          <span className="text-text-muted"> — {q.question?.controlType ?? "—"}</span>
          {q.question?.options && q.question.options.length > 0 && (
            <div className="text-text-muted pl-4">Options: {q.question.options.join(", ")}</div>
          )}
          <div className="text-text-muted pl-4">
            Applies to: {[q.drs && "Doctors", q.chm && "Chemists", q.hos && "Hospitals", q.stk && "Stockists", q.prd && "Products"].filter(Boolean).join(", ") || "none selected"}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpdateSurveyScreen({ readOnly, onEdit, onToast }: { readOnly: boolean; onEdit: (id: string) => void; onToast: (msg: string) => void }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiClient.surveys().then((r) => setSurveys(r.data)).catch(() => setSurveys([])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleProcess(id: string) {
    await apiClient.processSurvey(id).catch(() => {});
    onToast("Survey marked as processed.");
    load();
  }
  async function handleDeactivate(id: string) {
    await apiClient.deactivateSurvey(id).catch(() => {});
    load();
  }
  async function handleClose(id: string) {
    await apiClient.closeSurvey(id).catch(() => {});
    onToast("Survey closed.");
    load();
  }

  return (
    <div className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
          <thead className="bg-brand-primary-subtle">
            <tr>
              <th className="px-3 py-2">Survey Title</th>
              <th className="px-3 py-2">Created On</th>
              <th className="px-3 py-2">Process From Date</th>
              <th className="px-3 py-2">Process To Date</th>
              <th className="px-3 py-2">No Of Questions</th>
              {!readOnly && <th className="px-3 py-2">Create Q/A / Edit</th>}
              <th className="px-3 py-2">Preview Q/A</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Processed</th>
              {!readOnly && <th className="px-3 py-2">Deactivate</th>}
              {!readOnly && <th className="px-3 py-2">Close</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading && <tr><td colSpan={10} className="px-3 py-4 text-center text-text-muted text-sm">Loading...</td></tr>}
            {!loading && surveys.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-4 text-center text-text-muted text-sm">No surveys created yet.</td></tr>
            )}
            {surveys.map((s) => (
              <Fragment key={s.id}>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">{s.title}</td>
                  <td className="px-3 py-1.5">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-1.5">{s.processFromDate}</td>
                  <td className="px-3 py-1.5">{s.processToDate}</td>
                  <td className="px-3 py-1.5">{s.questionCount}</td>
                  {!readOnly && (
                    <td className="px-3 py-1.5"><button type="button" onClick={() => onEdit(s.id)} className="text-primary underline text-sm">Create Q/A / Edit</button></td>
                  )}
                  <td className="px-3 py-1.5"><button type="button" onClick={() => setPreviewId(previewId === s.id ? null : s.id)} className="text-primary underline text-sm">Preview</button></td>
                  <td className="px-3 py-1.5">
                    {readOnly ? (
                      <span>{s.processed ? "Processed" : "Pending"}</span>
                    ) : s.processed ? (
                      <span className="text-status-success font-semibold text-sm">Processed</span>
                    ) : (
                      <button type="button" onClick={() => handleProcess(s.id)} className="text-primary underline text-sm">Process</button>
                    )}
                  </td>
                  <td className="px-3 py-1.5">{s.processedAt ? new Date(s.processedAt).toLocaleDateString() : "—"}</td>
                  {!readOnly && (
                    <td className="px-3 py-1.5">
                      <button type="button" onClick={() => handleDeactivate(s.id)} className="text-primary underline text-sm">
                        {s.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  )}
                  {!readOnly && (
                    <td className="px-3 py-1.5">
                      {s.closed ? <span className="text-text-muted text-sm">Closed</span> : (
                        <button type="button" onClick={() => handleClose(s.id)} className="text-primary underline text-sm">Close</button>
                      )}
                    </td>
                  )}
                </tr>
                {previewId === s.id && (
                  <tr>
                    <td colSpan={10} className="px-3 pb-3">
                      <PreviewPanel surveyId={s.id} onClose={() => setPreviewId(null)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PROCESS_TYPE_COLUMNS: { key: "drs" | "chm" | "stk" | "hos" | "prd"; label: string }[] = [
  { key: "drs", label: "Drs" },
  { key: "chm", label: "Chm" },
  { key: "stk", label: "Stk" },
  { key: "hos", label: "Hos" },
  { key: "prd", label: "Prd" }
];

function SurveyViewScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeCode, setEmployeeCode] = useState("");
  const [mode, setMode] = useState<"Question Wise" | "Answer Wise">("Question Wise");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyId, setSurveyId] = useState("");
  const [result, setResult] = useState<SurveyViewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    apiClient.employees().then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
    apiClient.surveys().then((r) => {
      setSurveys(r.data);
      if (r.data.length > 0) setSurveyId(r.data[0].id);
    }).catch(() => setSurveys([]));
  }, []);

  const selectedEmployee = employees.find((e) => e.employeeCode === employeeCode);

  async function handleView() {
    if (!employeeCode || !surveyId) {
      setError("Select a Field Force and a Survey first.");
      return;
    }
    setError("");
    setLoading(true);
    setViewed(true);
    try {
      const r = await apiClient.surveyView(surveyId, employeeCode, mode);
      setResult(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Survey View");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function exportExcel() {
    if (!result) return;
    const header = ["S.No", "FieldForce Name", "Designation Name", "HQ", "DOJ", "Emp.Code", ...PROCESS_TYPE_COLUMNS.map((c) => c.label)];
    const lines = [header.join(",")];
    result.rows.forEach((r, idx) => {
      lines.push([idx + 1, `"${r.name}"`, r.designation, r.hq, r.doj ?? "-", r.employeeCode, ...PROCESS_TYPE_COLUMNS.map(() => "-")].join(","));
    });
    lines.push(["", "", "", "", "", "Grand Total", ...PROCESS_TYPE_COLUMNS.map(() => "-")].join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "survey-view.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-4 max-w-xl">
        <FieldForceSelect value={employeeCode} onChange={(code) => { setEmployeeCode(code); setViewed(false); }} employees={employees} label="Filed Force Name" minWidth={0} />
        <div className="space-y-1.5">
          <label className="font-label-sm text-label-sm text-text-muted">Mode</label>
          <select
            className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
            value={mode}
            onChange={(e) => {
              const next = e.target.value as "Question Wise" | "Answer Wise";
              setMode(next);
              if (viewed && employeeCode && surveyId) {
                setLoading(true);
                apiClient.surveyView(surveyId, employeeCode, next)
                  .then((r) => setResult(r.data))
                  .catch((err) => setError(err instanceof Error ? err.message : "Unable to load Survey View"))
                  .finally(() => setLoading(false));
              }
            }}
          >
            <option value="Question Wise">Question Wise</option>
            <option value="Answer Wise">Answer Wise</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-label-sm text-label-sm text-text-muted">Survey Name</label>
          <select
            className="w-full h-9 px-2.5 rounded-lg border border-border-subtle bg-surface-canvas text-text-primary font-body-sm text-body-sm"
            value={surveyId}
            onChange={(e) => { setSurveyId(e.target.value); setViewed(false); }}
          >
            {surveys.length === 0 && <option value="">No surveys created yet</option>}
            {surveys.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        {error && <p className="text-status-danger text-sm">{error}</p>}
        <button
          type="button"
          onClick={handleView}
          disabled={!employeeCode || !surveyId || loading}
          className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "View"}
        </button>
      </div>

      {viewed && result && (
        <div className="bg-surface-card rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-text-primary underline">Survey - View</h2>
              <p className="font-body-sm text-body-sm text-text-secondary">Field Force Name: {selectedEmployee?.name} - {selectedEmployee?.designation} - {selectedEmployee?.territory}</p>
              <p className="font-body-sm text-body-sm text-text-muted italic mt-1">
                {mode === "Question Wise"
                  ? "Round 36: Question Wise shows how many of this survey's real questions apply to each category (Drs/Chm/Stk/Hos/Prd) -- the same count for every row, since it reflects the survey's own composition, not this rep's activity."
                  : "Round 36: Answer Wise now reads real submitted answers (field reps can answer surveys from the field app's new Surveys screen) -- each cell is how many of that category's questions this specific rep has actually answered so far."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={exportExcel} className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-sm text-label-sm transition-colors">Excel</button>
              <button type="button" onClick={() => setViewed(false)} className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-label-sm text-label-sm transition-colors">Close</button>
            </div>
          </div>
          {result.rows.length === 0 ? (
            <p className="text-text-muted text-sm">No field reps found for this selection.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left font-table-cell text-table-cell text-text-primary">
                <thead>
                  <tr className="bg-brand-primary-subtle">
                    <th className="px-3 py-2 w-14" rowSpan={2}>S.No</th>
                    <th className="px-3 py-2" rowSpan={2}>FieldForce Name</th>
                    <th className="px-3 py-2" rowSpan={2}>Designation Name</th>
                    <th className="px-3 py-2" rowSpan={2}>HQ</th>
                    <th className="px-3 py-2" rowSpan={2}>DOJ</th>
                    <th className="px-3 py-2" rowSpan={2}>Emp.Code</th>
                    <th className="px-3 py-2 text-center" colSpan={PROCESS_TYPE_COLUMNS.length}>{result.surveyTitle}</th>
                  </tr>
                  <tr className="bg-brand-primary-subtle">
                    {PROCESS_TYPE_COLUMNS.map((c) => (
                      <th key={c.key} className="px-3 py-1 text-center border-t border-border-subtle">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {result.rows.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="px-3 py-1.5">{idx + 1}</td>
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.designation}</td>
                      <td className="px-3 py-1.5">{r.hq}</td>
                      <td className="px-3 py-1.5">{r.doj ? new Date(r.doj).toLocaleDateString() : "-"}</td>
                      <td className="px-3 py-1.5">{r.employeeCode}</td>
                      {PROCESS_TYPE_COLUMNS.map((col) => (
                        <td key={col.key} className="px-3 py-1.5 text-center">{r.counts ? r.counts[col.key] : "-"}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-bold text-status-danger">
                    <td className="px-3 py-1.5" colSpan={6}>Grand Total</td>
                    {PROCESS_TYPE_COLUMNS.map((col) => (
                      <td key={col.key} className="px-3 py-1.5 text-center">
                        {result.rows.reduce((sum, r) => sum + (r.counts ? r.counts[col.key] : 0), 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SurveyWorkspace({ initialScreen }: { initialScreen: ScreenKey }) {
  const [screen, setScreen] = useState<ScreenKey>(initialScreen);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function navigate(next: ScreenKey) {
    if (next !== "create-survey") setEditingSurveyId(null);
    setScreen(next);
  }

  function handleEdit(id: string) {
    setEditingSurveyId(id);
    setScreen("create-survey");
  }

  const titles: Record<ScreenKey, string> = {
    "question-creation": "Create - Question",
    "create-survey": "Create - Survey",
    "update-survey": "Update - Survey",
    view: "View"
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display-md text-display-md text-text-primary tracking-tight">{titles[screen]}</h1>
        <CrossNav active={screen} onNavigate={navigate} />
      </div>

      {screen === "question-creation" && <QuestionCreationScreen onToast={showToast} />}
      {screen === "create-survey" && (
        <CreateSurveyScreen
          editingSurveyId={editingSurveyId}
          onDone={() => { setEditingSurveyId(null); setScreen("update-survey"); }}
          onToast={showToast}
        />
      )}
      {screen === "update-survey" && <UpdateSurveyScreen readOnly={false} onEdit={handleEdit} onToast={showToast} />}
      {screen === "view" && <SurveyViewScreen />}

      {toast && <Toast message={toast} />}
    </div>
  );
}
