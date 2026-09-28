"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { apiClient, type QuizQuestion, type QuizRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

// Matches sanpharma.info's MasterFiles/Options/Quiz_List.aspx exactly: a
// table with sanpharma's own columns (Quiz Title/Created On/Process From-To
// Date/No Of Questions/Uploaded File/Create Questions/Upload Questions/
// Preview Q/A/Status/Processed/Edit/Deactivate) and a "Quiz Title Creation"
// button that opens sanpharma's own "Online Quiz - Title Creation" form
// (Quiz Title/Quiz Category/Effective Date/Month/Year/Choose File/Save).
//
// Backed entirely by the real Quiz model (POST/GET/PUT/DELETE
// /company/quiz + its question-upload/download sub-resources — see
// quiz.routes.ts) rather than a fake headers-only log: "Create Questions"
// opens the real MCQ author/editor (still here, unchanged), "Upload
// Questions" parses a real .xlsx/.csv into real, scoreable questions,
// "Process"/"Deactivate" are real persisted flags, and Quiz Category comes
// from the real Quiz Category master (quizCategoryList).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const now = new Date();
const YEARS = Array.from({ length: 6 }, (_, i) => String(now.getFullYear() - 2 + i));

type EditableQuestion = QuizQuestion;
type Mode = "list" | "titleForm" | "questions" | "preview";

function blankQuestion(): EditableQuestion {
  return { questionText: "", options: ["", ""], correctOptionIndex: 0, points: 1 };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyTitleDraft() {
  return { title: "", category: "", effectiveDate: todayIso(), month: MONTHS[now.getMonth()], year: String(now.getFullYear()) };
}

export function QuizAuthoringPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // "Quiz Title Creation" / "Edit" form state
  const [titleDraft, setTitleDraft] = useState(emptyTitleDraft());
  const [titleFile, setTitleFile] = useState<File | null>(null);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // "Create Questions" (real MCQ editor) state
  const [questionsDraft, setQuestionsDraft] = useState<EditableQuestion[]>([blankQuestion()]);
  const [questionsSaving, setQuestionsSaving] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [previewQuiz, setPreviewQuiz] = useState<QuizRecord | null>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetId = useRef<string | null>(null);

  async function loadQuizzes() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listQuizzes();
      setQuizzes(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuizzes();
    apiClient
      .masterRecords("quizCategoryList")
      .then((r) => setCategories(r.data.map((c) => String(c.categoryName ?? "")).filter(Boolean)))
      .catch(() => {});
  }, []);

  // ── Quiz Title Creation / Edit ───────────────────────────────────────
  function startCreateTitle() {
    setEditingId(null);
    setTitleDraft(emptyTitleDraft());
    setTitleFile(null);
    setTitleError(null);
    setMode("titleForm");
  }

  function startEditTitle(quiz: QuizRecord) {
    setEditingId(quiz.id);
    setTitleDraft({
      title: quiz.title,
      category: quiz.category ?? "",
      effectiveDate: quiz.effectiveDate ? quiz.effectiveDate.slice(0, 10) : todayIso(),
      month: quiz.month ?? MONTHS[now.getMonth()],
      year: quiz.year ?? String(now.getFullYear())
    });
    setTitleFile(null);
    setTitleError(null);
    setMode("titleForm");
  }

  async function saveTitleDraft() {
    if (!titleDraft.title.trim()) {
      setTitleError("Enter a Quiz Title");
      return;
    }
    setTitleSaving(true);
    setTitleError(null);
    try {
      if (editingId) {
        await apiClient.updateQuiz(editingId, {
          title: titleDraft.title.trim(),
          category: titleDraft.category || null,
          effectiveDate: titleDraft.effectiveDate || null,
          month: titleDraft.month || null,
          year: titleDraft.year || null
        });
      } else {
        await apiClient.createQuizTitle(
          {
            title: titleDraft.title.trim(),
            category: titleDraft.category || undefined,
            effectiveDate: titleDraft.effectiveDate || undefined,
            month: titleDraft.month || undefined,
            year: titleDraft.year || undefined
          },
          titleFile
        );
      }
      setMode("list");
      setEditingId(null);
      await loadQuizzes();
    } catch (err) {
      setTitleError(err instanceof Error ? err.message : "Failed to save the quiz");
    } finally {
      setTitleSaving(false);
    }
  }

  // ── Create Questions (real MCQ editor) ───────────────────────────────
  function startQuestions(quiz: QuizRecord) {
    setEditingId(quiz.id);
    setQuestionsDraft(quiz.questions.length > 0 ? quiz.questions.map((q) => ({ ...q, options: [...q.options] })) : [blankQuestion()]);
    setQuestionsError(null);
    setMode("questions");
  }

  function updateQuestion(index: number, patch: Partial<EditableQuestion>) {
    setQuestionsDraft((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }
  function addQuestion() {
    setQuestionsDraft((qs) => [...qs, blankQuestion()]);
  }
  function removeQuestion(index: number) {
    setQuestionsDraft((qs) => qs.filter((_, i) => i !== index));
  }
  function addOption(qIndex: number) {
    setQuestionsDraft((qs) => qs.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q)));
  }
  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestionsDraft((qs) => qs.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q)));
  }
  function removeOption(qIndex: number, oIndex: number) {
    setQuestionsDraft((qs) =>
      qs.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.filter((_, j) => j !== oIndex);
        const correctOptionIndex = q.correctOptionIndex === oIndex ? 0 : q.correctOptionIndex > oIndex ? q.correctOptionIndex - 1 : q.correctOptionIndex;
        return { ...q, options, correctOptionIndex };
      })
    );
  }

  const questionsValid = useMemo(() => {
    if (questionsDraft.length === 0) return false;
    for (const q of questionsDraft) {
      if (!q.questionText.trim()) return false;
      const filled = q.options.filter((o) => o.trim().length > 0);
      if (filled.length < 2) return false;
      if (!q.options[q.correctOptionIndex]?.trim()) return false;
    }
    return true;
  }, [questionsDraft]);

  async function saveQuestions() {
    if (!editingId) return;
    if (!questionsValid) {
      setQuestionsError("Every question needs text, at least 2 filled options, and a correct answer marked.");
      return;
    }
    setQuestionsSaving(true);
    setQuestionsError(null);
    try {
      await apiClient.updateQuiz(editingId, {
        questions: questionsDraft.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim()),
          correctOptionIndex: q.correctOptionIndex,
          points: q.points
        }))
      });
      setMode("list");
      setEditingId(null);
      await loadQuizzes();
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : "Failed to save questions");
    } finally {
      setQuestionsSaving(false);
    }
  }

  // ── Row actions ───────────────────────────────────────────────────────
  function triggerUploadQuestions(quiz: QuizRecord) {
    uploadTargetId.current = quiz.id;
    uploadInputRef.current?.click();
  }

  async function handleUploadFileChosen(file: File | null) {
    const id = uploadTargetId.current;
    if (!file || !id) return;
    setRowBusyId(id);
    setError(null);
    try {
      await apiClient.uploadQuizQuestions(id, file);
      await loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload questions");
    } finally {
      setRowBusyId(null);
      uploadTargetId.current = null;
    }
  }

  async function toggleProcessed(quiz: QuizRecord) {
    setRowBusyId(quiz.id);
    try {
      await apiClient.updateQuiz(quiz.id, { processed: !quiz.processed });
      await loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update Processed status");
    } finally {
      setRowBusyId(null);
    }
  }

  async function toggleActive(quiz: QuizRecord) {
    setRowBusyId(quiz.id);
    try {
      await apiClient.updateQuiz(quiz.id, { isActive: !quiz.isActive });
      await loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update quiz status");
    } finally {
      setRowBusyId(null);
    }
  }

  const linkStyle: React.CSSProperties = { color: "#1d4ed8", textDecoration: "underline", cursor: "pointer", fontSize: 13, background: "none", border: "none", padding: 0 };

  // ── Quiz Title Creation / Edit page ─────────────────────────────────
  if (mode === "titleForm") {
    return (
      <section className="flex flex-col gap-6 w-full" style={{ alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">{editingId ? "Edit Quiz" : "Online Quiz - Title Creation"}</h2>
        </div>

        {titleError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{titleError}</div>}

        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Quiz Title</span>
            <input className="input" style={{ flex: 1 }} value={titleDraft.title} onChange={(e) => setTitleDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Quiz Category</span>
            <CustomSelect
              value={titleDraft.category}
              options={categories}
              onChange={(v) => setTitleDraft((d) => ({ ...d, category: v }))}
              placeholder="-- Select Category --"
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Effective Date</span>
            <input
              type="date"
              className="input"
              style={{ flex: 1 }}
              value={titleDraft.effectiveDate}
              onChange={(e) => setTitleDraft((d) => ({ ...d, effectiveDate: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Month</span>
            <CustomSelect value={titleDraft.month} options={MONTHS} onChange={(v) => setTitleDraft((d) => ({ ...d, month: v }))} style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Year</span>
            <CustomSelect value={titleDraft.year} options={YEARS} onChange={(v) => setTitleDraft((d) => ({ ...d, year: v }))} style={{ flex: 1 }} />
          </div>
          {!editingId && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>Choose File</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ flex: 1, fontSize: 13 }}
                onChange={(e) => setTitleFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
            <button className="button" type="button" disabled={titleSaving} onClick={saveTitleDraft}>
              {titleSaving ? "Saving..." : "Save"}
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={titleSaving}
              onClick={() => {
                setMode("list");
                setEditingId(null);
              }}
            >
              Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Create Questions (real MCQ editor) page ─────────────────────────
  if (mode === "questions") {
    const quiz = quizzes.find((q) => q.id === editingId);
    return (
      <section className="flex flex-col gap-6 w-full">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">Create Questions{quiz ? ` — ${quiz.title}` : ""}</h2>
          <p className="text-sm text-text-muted mt-1">Author real questions, options and the correct answer — scored automatically on submission.</p>
        </div>

        {questionsError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{questionsError}</div>}

        <div className="flex flex-col gap-4">
          {questionsDraft.map((q, qIndex) => (
            <div key={qIndex} className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-3" style={{ maxWidth: "720px" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Question {qIndex + 1}</span>
                {questionsDraft.length > 1 && (
                  <button type="button" className="text-text-muted hover:text-red-600" onClick={() => removeQuestion(qIndex)} title="Remove question">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <input
                className="input"
                style={{ width: "100%" }}
                placeholder="Question text"
                value={q.questionText}
                onChange={(e) => updateQuestion(qIndex, { questionText: e.target.value })}
              />

              <div className="flex flex-col gap-2">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctOptionIndex === oIndex}
                      onChange={() => updateQuestion(qIndex, { correctOptionIndex: oIndex })}
                      title="Mark as correct answer"
                    />
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                    {q.options.length > 2 && (
                      <button type="button" className="text-text-muted hover:text-red-600" onClick={() => removeOption(qIndex, oIndex)} title="Remove option">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="text-xs text-brand-primary font-medium self-start flex items-center gap-1" onClick={() => addOption(qIndex)}>
                  <Plus size={12} /> Add option
                </button>
              </div>

              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Points</span>
                <input
                  type="number"
                  min={0}
                  className="input"
                  style={{ width: "100px" }}
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}

          <button type="button" className="button self-start flex items-center gap-1" onClick={addQuestion}>
            <Plus size={14} /> Add Question
          </button>
        </div>

        <div className="flex gap-2">
          <button className="button" type="button" disabled={questionsSaving} onClick={saveQuestions}>
            {questionsSaving ? "Saving..." : "Save Questions"}
          </button>
          <button
            className="button button-secondary"
            type="button"
            disabled={questionsSaving}
            onClick={() => {
              setMode("list");
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  // ── Quiz List ─────────────────────────────────────────────────────────
  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">Quiz List</h2>
        </div>
        <button className="button flex items-center gap-1" type="button" onClick={startCreateTitle}>
          Quiz Title Creation
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <input
        ref={uploadInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          handleUploadFileChosen(file);
          e.target.value = "";
        }}
      />

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle">
            <tr>
              {["Quiz Title", "Created On", "Process From Date", "Process To Date", "No Of Questions", "Uploaded File", "Create Questions", "Upload Questions", "Preview Q/A", "Status", "Processed", "Edit", "Deactivate"].map((h) => (
                <th key={h} className="px-3 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && quizzes.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-text-muted text-sm">
                  No quizzes yet — click &quot;Quiz Title Creation&quot; to author one.
                </td>
              </tr>
            )}
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="border-b border-border-subtle">
                <td className="px-3 py-3 text-sm text-text-primary font-medium whitespace-nowrap">{quiz.title}</td>
                <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">{quiz.createdAt ? new Date(quiz.createdAt).toLocaleString() : "-"}</td>
                <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">{quiz.processFromDate ? new Date(quiz.processFromDate).toLocaleDateString() : "-"}</td>
                <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">{quiz.processToDate ? new Date(quiz.processToDate).toLocaleDateString() : "-"}</td>
                <td className="px-3 py-3 text-sm text-text-primary text-center">{quiz.questions.length}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">
                  {quiz.uploadedFileName ? (
                    <button type="button" style={linkStyle} onClick={() => apiClient.downloadQuizFile(quiz.id, quiz.uploadedFileName!)}>
                      {quiz.uploadedFileName}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-3 text-sm">
                  <button type="button" style={linkStyle} onClick={() => startQuestions(quiz)}>
                    Create Q/A
                  </button>
                </td>
                <td className="px-3 py-3 text-sm">
                  <button type="button" style={linkStyle} disabled={rowBusyId === quiz.id} onClick={() => triggerUploadQuestions(quiz)}>
                    {rowBusyId === quiz.id ? "..." : "Upload Q/A"}
                  </button>
                </td>
                <td className="px-3 py-3 text-sm">
                  <button type="button" style={linkStyle} onClick={() => setPreviewQuiz(quiz)}>
                    Preview
                  </button>
                </td>
                <td className="px-3 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      quiz.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {quiz.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm">
                  {quiz.processed ? (
                    <span style={{ color: "#059669", fontWeight: 700, fontSize: 13 }}>Processed</span>
                  ) : (
                    <button type="button" style={linkStyle} disabled={rowBusyId === quiz.id} onClick={() => toggleProcessed(quiz)}>
                      {rowBusyId === quiz.id ? "..." : "Process"}
                    </button>
                  )}
                </td>
                <td className="px-3 py-3 text-sm">
                  <button type="button" style={linkStyle} onClick={() => startEditTitle(quiz)}>
                    Edit
                  </button>
                </td>
                <td className="px-3 py-3 text-sm">
                  <button type="button" style={{ ...linkStyle, color: quiz.isActive ? "#dc2626" : "#059669" }} disabled={rowBusyId === quiz.id} onClick={() => toggleActive(quiz)}>
                    {rowBusyId === quiz.id ? "..." : quiz.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewQuiz && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="card" style={{ maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: 12 }}>Preview Q/A — {previewQuiz.title}</h3>
            {previewQuiz.questions.length === 0 && <p style={{ color: "var(--muted)" }}>No questions added yet.</p>}
            <ol style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 18 }}>
              {previewQuiz.questions.map((q, i) => (
                <li key={i}>
                  <div style={{ fontWeight: 600 }}>{q.questionText}</div>
                  <ul style={{ marginTop: 4 }}>
                    {q.options.map((opt, oi) => (
                      <li key={oi} style={{ color: oi === q.correctOptionIndex ? "#059669" : "inherit", fontWeight: oi === q.correctOptionIndex ? 600 : 400 }}>
                        {opt} {oi === q.correctOptionIndex ? "(correct)" : ""}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button className="button button-secondary" type="button" onClick={() => setPreviewQuiz(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
