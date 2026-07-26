import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CrestLogo from "../common/CrestLogo";
import Avatar from "../common/Avatar";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-ink-900 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-white text-lg">
          <CrestLogo size={20} />
          CampusQ&A
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-ink-200 hover:text-gold-300 px-1">
            Questions
          </Link>
          <Link to="/polls" className="text-ink-200 hover:text-gold-300 px-1">
            Polls
          </Link>
          <Link to="/announcements" className="text-ink-200 hover:text-gold-300 px-1">
            Announcements
          </Link>

          {user ? (
            <>
              <Link to="/ask" className="bg-gold-500 text-ink-900 font-medium px-3 py-1.5 rounded-md hover:bg-gold-400">
                Ask
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-ink-200 hover:text-gold-300 px-1">
                  Admin
                </Link>
              )}
              <Link to={`/profile/${user.id}`} className="hidden sm:flex items-center gap-2 text-ink-200 hover:text-gold-300">
                <Avatar name={user.name} sizePx={26} />
                <span>
                  {user.name} · {user.reputation} rep
                </span>
              </Link>
              <button onClick={handleLogout} className="text-ink-300 hover:text-red-300">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink-200 hover:text-gold-300 px-1">
                Log in
              </Link>
              <Link to="/signup" className="bg-gold-500 text-ink-900 font-medium px-3 py-1.5 rounded-md hover:bg-gold-400">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
