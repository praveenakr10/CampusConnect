import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PollCard from "../components/polls/PollCard";
import Loader from "../components/common/Loader";
import { fetchPolls } from "../api/polls.api";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls().then((data) => setPolls(data.polls)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Community Polls</h1>
        <Link to="/polls/new" className="text-sm text-ink-800 hover:underline">
          Create a poll →
        </Link>
      </div>

      {loading ? (
        <Loader label="Loading polls..." />
      ) : polls.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">No polls yet. Start one!</p>
      ) : (
        <div className="space-y-3">
          {polls.map((p) => (
            <PollCard key={p.id} poll={p} />
          ))}
        </div>
      )}
    </div>
  );
}
