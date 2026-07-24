import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import UpvoteButton from "../common/UpvoteButton";
import Button from "../common/Button";
import { deleteAnswer, addComment } from "../../api/answers.api";
import { timeAgo } from "../../utils/format";

export default function AnswerCard({ answer, onDeleted, onCommentAdded }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState(answer.comments || []);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const canDelete = user && (user.id === answer.userId || isAdmin);

  const handleDelete = async () => {
    if (!confirm("Delete this answer?")) return;
    await deleteAnswer(answer.id);
    onDeleted(answer.id);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { comment } = await addComment(answer.id, commentText);
    setComments([...comments, comment]);
    setCommentText("");
    onCommentAdded?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4">
      <UpvoteButton targetType="ANSWER" targetId={answer.id} initialUpvotes={answer.upvotes} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer.body}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>
            {answer.user?.name} · {timeAgo(answer.createdAt)}
          </span>
          <div className="flex gap-3">
            <button onClick={() => setShowCommentBox((s) => !s)} className="hover:text-indigo-600">
              Comment
            </button>
            {canDelete && (
              <button onClick={handleDelete} className="hover:text-red-600">
                Delete
              </button>
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
            {comments.map((c) => (
              <div key={c.id} className="text-xs text-slate-600">
                <span className="font-medium text-slate-700">{c.user.name}:</span> {c.body}
              </div>
            ))}
          </div>
        )}

        {showCommentBox && (
          <form onSubmit={handleAddComment} className="mt-2 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs"
            />
            <Button type="submit" className="text-xs px-2 py-1">
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
