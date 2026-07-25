import EventForm from "../components/events/EventForm";

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Post an Announcement</h1>
      <EventForm />
    </div>
  );
}
