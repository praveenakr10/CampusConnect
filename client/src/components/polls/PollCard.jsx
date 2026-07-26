import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/format";

export default function PollCard({ poll }) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
  const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <Link
      to={`/polls/${poll.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-gold-300 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800">{poll.questionText}</h3>
        {expired && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Closed</span>}
      </div>
      <p className="text-xs text-slate-400">
        {totalVotes} votes · by {poll.isAnonymous ? "Anonymous" : poll.user?.name} · {timeAgo(poll.createdAt)}
      </p>
    </Link>
  );
}
