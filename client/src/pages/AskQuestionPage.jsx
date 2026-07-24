import QuestionForm from "../components/questions/QuestionForm";

export default function AskQuestionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ask a Question</h1>
      <QuestionForm />
    </div>
  );
}
