import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorBanner from "../components/common/ErrorBanner";
import { login as loginApi, resendVerification } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");
    setNeedsVerification(false);
    try {
      const { user, token, refreshToken } = await loginApi({ email, password });
      login(user, token, refreshToken);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed.";
      setError(msg);
      if (err.response?.status === 403 && msg.toLowerCase().includes("verify")) {
        setNeedsVerification(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setInfo("");
    try {
      const data = await resendVerification(email);
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold mb-4 text-center">Log in to CampusConnect</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <ErrorBanner message={error} />
        {info && <p className="text-sm text-slate-600">{info}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-xs text-ink-800 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
        {needsVerification && (
          <Button type="button" variant="secondary" className="w-full" disabled={resending} onClick={handleResend}>
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
        )}
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        No account? <Link to="/signup" className="text-ink-800 hover:underline">Sign up</Link>
      </p>
      <p className="text-center text-xs text-slate-400 mt-2">
        Demo login: student@college.edu / password123
      </p>
    </div>
  );
}
