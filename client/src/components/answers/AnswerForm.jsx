import { useState } from "react";
import Button from "../common/Button";
import ErrorBanner from "../common/ErrorBanner";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createAnswer } from "../../api/answers.api";

export default function AnswerForm({ questionId, onPosted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!body.trim()) return setError("Answer can't be empty.");

    setSubmitting(true);
    setError("");
    try {
      const { answer } = await createAnswer(questionId, body);
      setBody("");
      onPosted(answer);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post answer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4">
      <ErrorBanner message={error} />
      <label className="block text-sm font-medium mb-1">Your Answer</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Share your solution..."
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post Answer"}
        </Button>
      </div>
    </form>
  );
}
