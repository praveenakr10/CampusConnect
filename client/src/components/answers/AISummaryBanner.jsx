import { useEffect, useState } from "react";
import { fetchAnswerSummary } from "../../api/ai.api";

/**
 * Auto-fetches (and lazily triggers generation of) a TL;DR summary once
 * a question has 10+ answers. Stays invisible below that threshold.
 */
export default function AISummaryBanner({ questionId, answerCount }) {
  const [summary, setSummary] = useState(null);
  const [eligible, setEligible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (answerCount < 10) {
      setEligible(false);
      return;
    }
    setLoading(true);
    fetchAnswerSummary(questionId)
      .then((data) => {
        if (cancelled) return;
        setEligible(data.eligible);
        setSummary(data.summary);
      })
      .catch(() => {
        if (!cancelled) setEligible(false);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [questionId, answerCount]);

  if (eligible === false) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
        <span>✨</span> AI Summary of {answerCount} answers
      </div>
      {loading ? (
        <p className="text-sm text-amber-700/70">Summarizing answers...</p>
      ) : (
        <p className="text-sm text-amber-900 whitespace-pre-wrap">{summary}</p>
      )}
    </div>
  );
}
