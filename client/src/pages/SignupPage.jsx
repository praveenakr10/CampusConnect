import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorBanner from "../components/common/ErrorBanner";
import { signup } from "../api/auth.api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const data = await signup({ name, email, password });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold mb-4 text-center">Create your account</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <ErrorBanner message={error} />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">College Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting || !!message}>
          {submitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account? <Link to="/login" className="text-ink-800 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
