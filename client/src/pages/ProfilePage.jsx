import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import ReputationBadge from "../components/common/ReputationBadge";
import Loader from "../components/common/Loader";
import { fetchUserProfile } from "../api/users.api";
import { timeAgo } from "../utils/format";

const ROLE_LABELS = {
  STUDENT: "Student",
  STUDENT_ADMIN: "Student Admin",
  SUPER_ADMIN: "Super Admin",
};

export default function ProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchUserProfile(id)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading profile..." />;
  if (notFound || !data) return <p className="text-center text-slate-400 py-12">Profile not found.</p>;

  const { user, recentQuestions, recentAnswers } = data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4">
        <Avatar name={user.name} sizePx={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-ink-900">{user.name}</h1>
            <ReputationBadge reputation={user.reputation} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {ROLE_LABELS[user.role]} · joined {timeAgo(user.createdAt)}
            {user.isBanned && <span className="text-red-500"> · suspended</span>}
          </p>
        </div>
        <div className="flex gap-6 text-center shrink-0">
          <div>
            <div className="font-semibold text-ink-900">{user.reputation}</div>
            <div className="text-xs text-slate-400">reputation</div>
          </div>
          <div>
            <div className="font-semibold text-ink-900">{user._count.questions}</div>
            <div className="text-xs text-slate-400">questions</div>
          </div>
          <div>
            <div className="font-semibold text-ink-900">{user._count.answers}</div>
            <div className="text-xs text-slate-400">answers</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-ink-900">Recent Questions</h2>
        {recentQuestions.length === 0 ? (
          <p className="text-sm text-slate-400">No questions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentQuestions.map((q) => (
              <Link
                key={q.id}
                to={`/questions/${q.id}`}
                className="block bg-white border border-slate-200 rounded-lg p-3 hover:border-gold-300 transition text-sm"
              >
                <span className="font-medium text-ink-900">{q.title}</span>
                <span className="text-xs text-slate-400 ml-2">
                  {q._count.answers} answers · {timeAgo(q.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-ink-900">Recent Answers</h2>
        {recentAnswers.length === 0 ? (
          <p className="text-sm text-slate-400">No answers yet.</p>
        ) : (
          <div className="space-y-2">
            {recentAnswers.map((a) => (
              <Link
                key={a.id}
                to={`/questions/${a.question.id}`}
                className="block bg-white border border-slate-200 rounded-lg p-3 hover:border-gold-300 transition text-sm"
              >
                <p className="text-slate-600 line-clamp-1">{a.body}</p>
                <span className="text-xs text-slate-400">on "{a.question.title}" · {timeAgo(a.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
