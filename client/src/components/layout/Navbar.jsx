import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-indigo-600 text-lg">
          CampusQ&A
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-indigo-600">
            Questions
          </Link>
          <Link to="/polls" className="text-slate-600 hover:text-indigo-600">
            Polls
          </Link>

          {user ? (
            <>
              <Link to="/ask" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                Ask
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-slate-600 hover:text-indigo-600">
                  Admin
                </Link>
              )}
              <span className="text-slate-500 hidden sm:inline">
                {user.name} · {user.reputation} rep
              </span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-indigo-600">
                Log in
              </Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
