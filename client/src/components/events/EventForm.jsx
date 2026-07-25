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
        <label className="block text-sm font-medium mb-1">Event Poster</label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center shrink-0">
            {posterPreview ? (
              <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400">Preview</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePosterChange} className="text-sm" />
        </div>
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
