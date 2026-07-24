import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PollDetail from "../components/polls/PollDetail";
import Loader from "../components/common/Loader";
import { fetchPoll } from "../api/polls.api";

export default function PollPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoll(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading poll..." />;
  if (!data?.poll) return <p className="text-center text-slate-400 py-12">Poll not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <PollDetail poll={data.poll} myVote={data.myVote} />
    </div>
  );
}
