import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/events/EventCard";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { fetchEvents } from "../api/events.api";

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchEvents(showPast ? {} : { upcoming: "true" })
      .then((data) => setEvents(data.events))
      .finally(() => setLoading(false));
  }, [showPast]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Announcements</h1>
        {isAdmin && (
          <Link to="/announcements/new" className="text-sm text-indigo-600 hover:underline">
            + Post an event
          </Link>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setShowPast(false)}
          className={`text-xs px-3 py-1.5 rounded-md ${!showPast ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setShowPast(true)}
          className={`text-xs px-3 py-1.5 rounded-md ${showPast ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
        >
          All events
        </button>
      </div>

      {loading ? (
        <Loader label="Loading announcements..." />
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">
          No {showPast ? "" : "upcoming "}events yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
