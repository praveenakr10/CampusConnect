import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toggleVote } from "../../api/votes.api";

export default function UpvoteButton({ targetType, targetId, initialUpvotes }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [upvoted, setUpvoted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!user) return navigate("/login");
    if (busy) return;
    setBusy(true);
    try {
      const data = await toggleVote(targetType, targetId);
      setUpvoted(data.upvoted);
      setUpvotes(data.upvotes);
    } catch {
      // silently ignore; UI stays consistent with last known state
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex flex-col items-center px-3 py-2 rounded-md border text-sm transition ${
        upvoted ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"
      }`}
    >
      <span className="text-lg leading-none">▲</span>
      <span className="font-semibold">{upvotes}</span>
    </button>
  );
}
