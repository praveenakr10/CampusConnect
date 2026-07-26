import { Link } from "react-router-dom";
import Tag from "../common/Tag";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/format";

export default function QuestionCard({ question }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4 hover:border-gold-300 transition">
      <div className="flex flex-col items-center text-slate-500 text-sm w-14 shrink-0">
        <div className="font-semibold text-ink-800 text-lg">{question.upvotes}</div>
        <div>upvotes</div>
        <div className="mt-2 font-semibold">{question._count?.answers ?? 0}</div>
        <div>answers</div>
      </div>

      <div className="flex-1 min-w-0">
        <Link to={`/questions/${question.id}`} className="font-semibold text-slate-800 hover:text-ink-800">
          {question.title}
        </Link>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{question.body}</p>
        <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
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
            · {timeAgo(question.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
