import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Tag from "../components/common/Tag";
import Loader from "../components/common/Loader";
import Avatar from "../components/common/Avatar";
import UpvoteButton from "../components/common/UpvoteButton";
import Button from "../components/common/Button";
import AnswerCard from "../components/answers/AnswerCard";
import AnswerForm from "../components/answers/AnswerForm";
import AISummaryBanner from "../components/answers/AISummaryBanner";
import { fetchQuestion, deleteQuestion } from "../api/questions.api";
import { fetchAnswers } from "../api/answers.api";
import { useAuth } from "../hooks/useAuth";
import { timeAgo } from "../utils/format";

export default function QuestionPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ question }, { answers }] = await Promise.all([fetchQuestion(id), fetchAnswers(id)]);
    setQuestion(question);
    setAnswers(answers);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader label="Loading question..." />;
  if (!question) return <p className="text-center text-slate-400 py-12">Question not found.</p>;

  const canDelete = user && (user.id === question.userId || isAdmin);

  const handleDeleteQuestion = async () => {
    if (!confirm("Delete this question?")) return;
    await deleteQuestion(question.id);
    navigate("/");
  };

  const handleAnswerPosted = (answer) => setAnswers([...answers, { ...answer, upvotes: 0, comments: [] }]);
  const handleAnswerDeleted = (answerId) => setAnswers(answers.filter((a) => a.id !== answerId));

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex gap-4 mb-6">
        <UpvoteButton targetType="QUESTION" targetId={question.id} initialUpvotes={question.upvotes} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-lg font-bold text-slate-800">{question.title}</h1>
            {canDelete && (
              <button onClick={handleDeleteQuestion} className="text-xs text-red-500 hover:underline shrink-0">
                Delete
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{question.body}</p>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              {question.tags?.map(({ tag }) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            </div>
            <div className="text-xs text-slate-400 inline-flex items-center gap-1 flex-wrap">
              asked by{" "}
              {question.user && (
                <Link to={`/profile/${question.user.id}`} className="inline-flex items-center gap-1.5 hover:text-ink-800">
                  <Avatar name={question.user.name} sizePx={18} />
                  {question.user.name}
                </Link>
              )}{" "}
              · {timeAgo(question.createdAt)} · {question.viewCount} views
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3">{answers.length} Answers</h2>

      <AISummaryBanner questionId={question.id} answerCount={answers.length} />

      <div className="space-y-3 mb-6">
        {answers.map((a) => (
          <AnswerCard key={a.id} answer={a} onDeleted={handleAnswerDeleted} onCommentAdded={load} />
        ))}
      </div>

      <AnswerForm questionId={question.id} onPosted={handleAnswerPosted} />
    </div>
  );
}
