import axiosClient from "./axiosClient";

export const signup = (data) => axiosClient.post("/auth/signup", data).then((r) => r.data);
export const login = (data) => axiosClient.post("/auth/login", data).then((r) => r.data);
export const fetchMe = () => axiosClient.get("/auth/me").then((r) => r.data);
