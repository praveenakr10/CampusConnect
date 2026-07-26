import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import { RequireAuth, RequireAdmin } from "./components/common/ProtectedRoute";

import HomeFeed from "./pages/HomeFeed";
import QuestionPage from "./pages/QuestionPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import PollsPage from "./pages/PollsPage";
import PollPage from "./pages/PollPage";
import CreatePollPage from "./pages/CreatePollPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/questions/:id" element={<QuestionPage />} />
          <Route
            path="/ask"
            element={
              <RequireAuth>
                <AskQuestionPage />
              </RequireAuth>
            }
          />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/polls/:id" element={<PollPage />} />
          <Route
            path="/polls/new"
            element={
              <RequireAuth>
                <CreatePollPage />
              </RequireAuth>
            }
          />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/announcements/:id" element={<EventDetailPage />} />
          <Route
            path="/announcements/new"
            element={
              <RequireAdmin>
                <CreateEventPage />
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
