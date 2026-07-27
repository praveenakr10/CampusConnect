import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorBanner from "../components/common/ErrorBanner";
import { resetPassword } from "../api/auth.api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const data = await resetPassword({ token, password });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold mb-4 text-center">Reset password</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <ErrorBanner message={error} />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting || !token}>
          {submitting ? "Updating..." : "Update password"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        <Link to="/login" className="text-ink-800 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
