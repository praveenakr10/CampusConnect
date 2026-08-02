import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import ErrorBanner from "../common/ErrorBanner";
import CoordinatorFields from "./CoordinatorFields";
import { createEvent } from "../../api/events.api";

export default function EventForm() {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [clubName, setClubName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [coordinators, setCoordinators] = useState([{ name: "", contact: "" }]);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Poster must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Poster must be 5 MB or smaller.");
      return;
    }
    setError("");
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !venue.trim() || !clubName.trim()) {
      setError("Title, date, venue, and club name are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { event } = await createEvent({
        title,
        eventDate,
        venue,
        clubName,
        additionalDetails,
        coordinators,
        posterFile,
      });
      navigate(`/announcements/${event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <ErrorBanner message={error} />

      <div>
        <label className="block text-sm font-medium mb-2">Event Poster <span className="font-normal text-slate-500">(optional)</span></label>
        <label
          htmlFor="event-poster"
          className="group flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-indigo-400 hover:bg-indigo-50/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200"
        >
          <div className="h-24 w-20 overflow-hidden rounded-md bg-white ring-1 ring-slate-200 flex items-center justify-center shrink-0">
            {posterPreview ? (
              <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
            ) : (
              <svg aria-hidden="true" className="h-8 w-8 text-slate-400 group-hover:text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m21 15-4.5-4.5L8 19" />
              </svg>
            )}
          </div>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-700 group-hover:text-indigo-700">
              {posterFile ? "Replace poster" : "Upload a poster"}
            </span>
            <span className="mt-1 block truncate text-sm text-slate-500">
              {posterFile?.name || "PNG, JPG, WEBP, or another image format"}
            </span>
            <span className="mt-1 block text-xs text-slate-400">Maximum file size: 5 MB</span>
          </span>
          <input id="event-poster" type="file" accept="image/*" onChange={handlePosterChange} className="sr-only" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Tech Fest 2026"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Main Auditorium"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Club / Organizer Name</label>
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="e.g. Computer Science Club"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <CoordinatorFields coordinators={coordinators} setCoordinators={setCoordinators} />

      <div>
        <label className="block text-sm font-medium mb-1">Additional Details</label>
        <textarea
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          rows={4}
          placeholder="Registration links, eligibility, prizes, schedule, etc."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post Announcement"}
        </Button>
      </div>
    </form>
  );
}
