import axiosClient from "./axiosClient";

export const signup = (data) => axiosClient.post("/auth/signup", data).then((r) => r.data);
export const login = (data) => axiosClient.post("/auth/login", data).then((r) => r.data);
export const refreshSession = (refreshToken) =>
  axiosClient.post("/auth/refresh", { refreshToken }).then((r) => r.data);
export const fetchMe = () => axiosClient.get("/auth/me").then((r) => r.data);
export const verifyEmail = (token) =>
  axiosClient.get("/auth/verify-email", { params: { token } }).then((r) => r.data);
export const resendVerification = (email) =>
  axiosClient.post("/auth/resend-verification", { email }).then((r) => r.data);
export const forgotPassword = (email) =>
  axiosClient.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (data) =>
  axiosClient.post("/auth/reset-password", data).then((r) => r.data);
