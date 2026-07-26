import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import ErrorBanner from "../common/ErrorBanner";
import { createPoll } from "../../api/polls.api";

export default function PollForm() {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateOption = (i, value) => {
    const next = [...options];
    next[i] = value;
    setOptions(next);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionText.trim() || cleanOptions.length < 2) {
      setError("Add a question and at least 2 options.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { poll } = await createPoll({
        questionText,
        options: cleanOptions,
        isAnonymous,
        expiresAt: expiresAt || undefined,
      });
      navigate(`/polls/${poll.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create poll.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <ErrorBanner message={error} />

      <div>
        <label className="block text-sm font-medium mb-1">Poll question</label>
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="e.g. Which elective should we petition for next semester?"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Options</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-600 px-2">
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="text-ink-800 text-xs mt-2 hover:underline">
          + Add option
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Anonymous poll
        </label>
        <label className="flex items-center gap-2">
          Expires:
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border border-slate-300 rounded-md px-2 py-1"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Poll"}
        </Button>
      </div>
    </form>
  );
}
