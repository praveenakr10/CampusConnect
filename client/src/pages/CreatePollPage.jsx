import PollForm from "../components/polls/PollForm";

export default function CreatePollPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Create a Poll</h1>
      <PollForm />
    </div>
  );
}
