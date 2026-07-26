import { Link } from "react-router-dom";

function formatEventDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventCard({ event }) {
  const isPast = new Date(event.eventDate) < new Date();

  return (
    <Link
      to={`/announcements/${event.id}`}
      className="block bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-gold-300 transition"
    >
      <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center overflow-hidden">
        {event.posterUrl ? (
          <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-300 text-sm">No poster</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 line-clamp-1">{event.title}</h3>
          {isPast && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">Past</span>}
        </div>
        <p className="text-xs text-ink-800 font-medium">{event.clubName}</p>
        <p className="text-xs text-slate-500 mt-1">
          {formatEventDate(event.eventDate)} · {event.venue}
        </p>
      </div>
    </Link>
  );
}
