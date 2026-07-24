import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ErrorBanner from "../common/ErrorBanner";
import { improveQuestion } from "../../api/ai.api";

/**
 * "Improve with AI" — sends the current title/body to the backend,
 * shows a before/after diff, and lets the user accept (which fills the
 * form with the improved text) or reject (keeps their original wording).
 */
export default function AIImproveButton({ title, body, onAccept }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Write a title and description first, then improve it with AI.");
      setOpen(true);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await improveQuestion(title, body);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "AI improver failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    onAccept(result.improved.title, result.improved.body);
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="secondary" onClick={handleClick}>
        ✨ Improve with AI
      </Button>

      {open && (
        <Modal title="AI Question Improver" onClose={() => setOpen(false)} wide>
          <ErrorBanner message={error} />
          {loading && <p className="text-sm text-slate-500">Rewriting your question...</p>}

          {result && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Before</h4>
                <div className="border border-slate-200 rounded-md p-3 text-sm bg-slate-50">
                  <p className="font-medium">{result.original.title}</p>
                  <p className="mt-1 text-slate-600 whitespace-pre-wrap">{result.original.body}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-emerald-500 uppercase mb-1">After (AI improved)</h4>
                <div className="border border-emerald-200 rounded-md p-3 text-sm bg-emerald-50">
                  <p className="font-medium">{result.improved.title}</p>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{result.improved.body}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Keep my original
              </Button>
              <Button onClick={handleAccept}>Use improved version</Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
