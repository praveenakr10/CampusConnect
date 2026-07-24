import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-slate-300">404</h1>
      <p className="text-slate-500 mt-2">Page not found.</p>
      <Link to="/" className="text-indigo-600 hover:underline text-sm mt-4 inline-block">
        Back to home
      </Link>
    </div>
  );
}
