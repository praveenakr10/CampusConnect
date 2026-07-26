import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuestionCard from "../components/questions/QuestionCard";
import Loader from "../components/common/Loader";
import { fetchQuestions } from "../api/questions.api";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "most_upvoted", label: "Most upvoted" },
  { value: "unanswered", label: "Unanswered" },
];

export default function HomeFeed() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchQuestions({ sort, search: search || undefined })
      .then((data) => setQuestions(data.questions))
      .finally(() => setLoading(false));
  }, [sort, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Community Questions</h1>
        <Link to="/ask" className="text-sm text-ink-800 hover:underline">
          Have a question? Ask it →
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <div className="flex gap-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`text-xs px-3 py-1.5 rounded-md ${
                sort === s.value ? "bg-gold-600 text-white" : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader label="Loading questions..." />
      ) : questions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
