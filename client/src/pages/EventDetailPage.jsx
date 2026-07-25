import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EventDetail from "../components/events/EventDetail";
import Loader from "../components/common/Loader";
import { fetchEvent } from "../api/events.api";

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent(id).then((data) => setEvent(data.event)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading event..." />;
  if (!event) return <p className="text-center text-slate-400 py-12">Event not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <EventDetail event={event} />
    </div>
  );
}
