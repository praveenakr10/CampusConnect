import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import ErrorBanner from "../common/ErrorBanner";
import AIImproveButton from "./AIImproveButton";
import { createQuestion } from "../../api/questions.api";

export default function QuestionForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [improved, setImproved] = useState(null); // { title, body } if AI version accepted
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAcceptAI = (aiTitle, aiBody) => {
    setImproved({ title: aiTitle, body: aiBody });
    setTitle(aiTitle);
    setBody(aiBody);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both title and description.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { question } = await createQuestion({
        title,
        body,
        tags: tagList,
        improvedTitle: improved?.title,
        improvedBody: improved?.body,
      });
      navigate(`/questions/${question.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post question.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <ErrorBanner message={error} />

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Why does my React state update twice?"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Explain your problem in detail, include any error messages or code..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="react, javascript, css"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <AIImproveButton title={title} body={body} onAccept={handleAcceptAI} />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post Question"}
        </Button>
      </div>
    </form>
  );
}
