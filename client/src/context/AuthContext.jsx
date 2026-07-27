import { createContext, useEffect, useState } from "react";
import { fetchMe } from "../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("qna_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("qna_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("qna_user", JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem("qna_token");
        localStorage.removeItem("qna_refresh_token");
        localStorage.removeItem("qna_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (user, token, refreshToken) => {
    localStorage.setItem("qna_token", token);
    localStorage.setItem("qna_refresh_token", refreshToken);
    localStorage.setItem("qna_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("qna_token");
    localStorage.removeItem("qna_refresh_token");
    localStorage.removeItem("qna_user");
    setUser(null);
  };

  const isAdmin = user && (user.role === "STUDENT_ADMIN" || user.role === "SUPER_ADMIN");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
