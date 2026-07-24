import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import { votePoll } from "../../api/polls.api";

export default function PollDetail({ poll: initialPoll, myVote: initialMyVote }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(initialPoll);
  const [myVote, setMyVote] = useState(initialMyVote);
  const [error, setError] = useState("");

  const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
  const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  const handleVote = async (optionId) => {
    if (!user) return navigate("/login");
    if (myVote || expired) return;
    setError("");
    try {
      const { poll: updated } = await votePoll(poll.id, optionId);
      setPoll(updated);
      setMyVote({ optionId });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to vote.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-1">{poll.questionText}</h2>
      <p className="text-xs text-slate-400 mb-4">
        {totalVotes} total votes {poll.isAnonymous && "· anonymous poll"} {expired && "· closed"}
      </p>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = totalVotes ? Math.round((option.voteCount / totalVotes) * 100) : 0;
          const isMine = myVote?.optionId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!myVote || expired}
              className={`w-full text-left border rounded-md p-3 relative overflow-hidden ${
                isMine ? "border-indigo-400" : "border-slate-200"
              } ${!myVote && !expired ? "hover:border-indigo-300 cursor-pointer" : "cursor-default"}`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-indigo-50"
                style={{ width: `${pct}%`, zIndex: 0 }}
              />
              <div className="relative z-10 flex items-center justify-between text-sm">
                <span>{option.optionText} {isMine && "✓"}</span>
                <span className="text-slate-500">{pct}% ({option.voteCount})</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
