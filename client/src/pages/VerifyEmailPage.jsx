import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import ErrorBanner from "../components/common/ErrorBanner";
import { verifyEmail } from "../api/auth.api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed.");
      });
  }, [token]);

  if (status === "loading") return <Loader label="Verifying your email..." />;

  return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <h1 className="text-xl font-bold mb-4">Email Verification</h1>
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        {status === "error" && <ErrorBanner message={message} />}
        {status === "success" && <p className="text-sm text-slate-600">{message}</p>}
        <Link to="/login" className="inline-block mt-4 text-sm text-ink-800 hover:underline">
          Go to login
        </Link>
      </div>
    </div>
  );
}
