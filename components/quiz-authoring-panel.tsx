"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, X, BarChart3 } from "lucide-react";
import { apiClient, type QuizAttemptRecord, type QuizQuestion, type QuizRecord } from "@/lib/api-client";

// Real "Quiz List" screen. Backed entirely by the real quiz-authoring +
// scoring system — POST/GET/PUT/DELETE /company/quiz and its :id/attempts
// sub-resource (see quiz.routes.ts) — not the generic masters CRUD console
// this screen used to be (a headers-only log with quizTitle/date/
// noOfQuestions rows and no actual question content).
//
// An admin authors a quiz here as a real ordered list of multiple-choice
// questions, each with its own options, a marked correct option and a point
// value. Deleting a quiz also deletes its attempts server-side. The
// "Results" view lists every submitted QuizAttempt for a quiz with its
// server-computed score — nothing here ever accepts a client-supplied
// score.
//
// There is intentionally no "take the quiz" UI in this admin app — that
// belongs to the field-force portal, which is a separate repo and out of
// scope for this pass (see the session report). This panel only authors
// quizzes and reviews attempts already submitted through
// apiClient.submitQuizAttempt, which nothing yet calls from a rep-facing
// screen.

type EditableQuestion = QuizQuestion;

function blankQuestion(): EditableQuestion {
  return { questionText: "", options: ["", ""], correctOptionIndex: 0, points: 1 };
}

function emptyDraft(): { title: string; description: string; isActive: boolean; questions: EditableQuestion[] } {
  return { title: "", description: "", isActive: true, questions: [blankQuestion()] };
}

export function QuizAuthoringPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [resultsFor, setResultsFor] = useState<QuizRecord | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

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
  }, []);

  function startCreate() {
    setEditingId(null);
    setDraft(emptyDraft());
    setSaveError(null);
    setMode("edit");
  }

  function startEdit(quiz: QuizRecord) {
    setEditingId(quiz.id);
    setDraft({
      title: quiz.title,
      description: quiz.description ?? "",
      isActive: quiz.isActive,
      questions: quiz.questions.length > 0 ? quiz.questions.map((q) => ({ ...q, options: [...q.options] })) : [blankQuestion()]
    });
    setSaveError(null);
    setMode("edit");
  }

  function cancelEdit() {
    setMode("list");
    setEditingId(null);
    setSaveError(null);
  }

  function updateQuestion(index: number, patch: Partial<EditableQuestion>) {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === index ? { ...q, ...patch } : q))
    }));
  }

  function addQuestion() {
    setDraft((d) => ({ ...d, questions: [...d.questions, blankQuestion()] }));
  }

  function removeQuestion(index: number) {
    setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== index) }));
  }

  function addOption(qIndex: number) {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q))
    }));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    }));
  }

  function removeOption(qIndex: number, oIndex: number) {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.filter((_, j) => j !== oIndex);
        const correctOptionIndex =
          q.correctOptionIndex === oIndex ? 0 : q.correctOptionIndex > oIndex ? q.correctOptionIndex - 1 : q.correctOptionIndex;
        return { ...q, options, correctOptionIndex };
      })
    }));
  }

  const draftValid = useMemo(() => {
    if (!draft.title.trim()) return false;
    if (draft.questions.length === 0) return false;
    for (const q of draft.questions) {
      if (!q.questionText.trim()) return false;
      const filled = q.options.filter((o) => o.trim().length > 0);
      if (filled.length < 2) return false;
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) return false;
      if (!q.options[q.correctOptionIndex]?.trim()) return false;
    }
    return true;
  }, [draft]);

  async function saveDraft() {
    setSaveError(null);
    if (!draftValid) {
      setSaveError("Enter a title, and for every question at least 2 filled options with a correct answer marked.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        isActive: draft.isActive,
        questions: draft.questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim()),
          correctOptionIndex: q.correctOptionIndex,
          points: q.points
        }))
      };
      if (editingId) {
        await apiClient.updateQuiz(editingId, payload);
      } else {
        await apiClient.createQuiz(payload);
      }
      setMode("list");
      setEditingId(null);
      await loadQuizzes();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuiz(quiz: QuizRecord) {
    if (!window.confirm(`Delete quiz "${quiz.title}"? This also deletes its submitted attempts.`)) return;
    try {
      await apiClient.deleteQuiz(quiz.id);
      await loadQuizzes();
      if (resultsFor?.id === quiz.id) setResultsFor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quiz");
    }
  }

  async function openResults(quiz: QuizRecord) {
    setResultsFor(quiz);
    setAttemptsLoading(true);
    setAttemptsError(null);
    try {
      const res = await apiClient.listQuizAttempts(quiz.id);
      setAttempts(res.data);
    } catch (err) {
      setAttemptsError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setAttemptsLoading(false);
    }
  }

  if (mode === "edit") {
    return (
      <section className="flex flex-col gap-6 w-full">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">{editingId ? "Edit Quiz" : "New Quiz"}</h2>
          <p className="text-sm text-text-muted mt-1">Author real questions, options and the correct answer — scored automatically on submission.</p>
        </div>

        {saveError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</div>}

        <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4" style={{ maxWidth: "720px" }}>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Quiz Title</span>
            <input
              className="input"
              style={{ width: "100%" }}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-text-muted mb-1">Description</span>
            <textarea
              className="input"
              style={{ width: "100%", minHeight: "70px" }}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="flex flex-col gap-4">
          {draft.questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-3" style={{ maxWidth: "720px" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Question {qIndex + 1}</span>
                {draft.questions.length > 1 && (
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
          <button className="button" type="button" disabled={saving} onClick={saveDraft}>
            {saving ? "Saving..." : "Save Quiz"}
          </button>
          <button
            className="button"
            type="button"
            style={{ backgroundColor: "var(--surface-subtle, #e5e7eb)", color: "var(--text-primary, #111827)" }}
            disabled={saving}
            onClick={cancelEdit}
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
          <h2 className="text-2xl font-bold text-text-primary">Quiz List</h2>
          <p className="text-sm text-text-muted mt-1">Author quizzes with real questions and options, and review submitted attempts and their scores.</p>
        </div>
        <button className="button flex items-center gap-1" type="button" onClick={startCreate}>
          <Plus size={14} /> New Quiz
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Questions</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Updated</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && quizzes.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-text-muted text-sm">No quizzes yet — click "New Quiz" to author one.</td></tr>
            )}
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="border-b border-border-subtle">
                <td className="px-4 py-3 text-sm text-text-primary font-medium">{quiz.title}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{quiz.questions.length}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      quiz.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {quiz.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">{quiz.updatedAt ? new Date(quiz.updatedAt).toLocaleString() : ""}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-text-muted hover:text-brand-primary" title="Edit" onClick={() => startEdit(quiz)}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="text-text-muted hover:text-brand-primary" title="Results" onClick={() => openResults(quiz)}>
                      <BarChart3 size={16} />
                    </button>
                    <button type="button" className="text-text-muted hover:text-red-600" title="Delete" onClick={() => deleteQuiz(quiz)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resultsFor && (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm flex flex-col" style={{ maxWidth: "720px" }}>
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Results — {resultsFor.title}</span>
            <button className="text-xs text-text-muted hover:text-text-primary" type="button" onClick={() => setResultsFor(null)}>
              Close
            </button>
          </div>
          {attemptsError && <div className="text-sm text-red-600 bg-red-50 border-b border-red-200 px-4 py-2">{attemptsError}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Employee Code</th>
                  <th className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Score</th>
                  <th className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {!attemptsLoading && attempts.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-text-muted text-sm">No attempts submitted yet.</td></tr>
                )}
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-border-subtle">
                    <td className="px-4 py-2 text-sm text-text-primary">{a.employeeCode}</td>
                    <td className="px-4 py-2 text-sm text-text-primary">{a.score} / {a.totalPossible}</td>
                    <td className="px-4 py-2 text-sm text-text-primary">{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
