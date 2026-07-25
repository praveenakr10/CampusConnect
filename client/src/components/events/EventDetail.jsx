import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { deleteEvent } from "../../api/events.api";

function formatEventDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetail({ event }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(event.id);
    navigate("/announcements");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {event.posterUrl && (
        <div className="bg-slate-100">
          <img src={event.posterUrl} alt={event.title} className="w-full max-h-96 object-contain mx-auto" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{event.title}</h1>
            <p className="text-sm text-indigo-600 font-medium mt-1">{event.clubName}</p>
          </div>
          {isAdmin && (
            <button onClick={handleDelete} className="text-xs text-red-500 hover:underline shrink-0">
              Delete
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Date & Time</p>
            <p className="text-slate-700">{formatEventDate(event.eventDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Venue</p>
            <p className="text-slate-700">{event.venue}</p>
          </div>
        </div>

        {event.coordinators?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Coordinators</p>
            <ul className="text-sm text-slate-700 space-y-1">
              {event.coordinators.map((c) => (
                <li key={c.id}>
                  {c.name}
                  {c.contact && <span className="text-slate-400"> · {c.contact}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.additionalDetails && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Additional Details</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.additionalDetails}</p>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-6">Posted by {event.postedBy?.name}</p>
      </div>
    </div>
  );
}
