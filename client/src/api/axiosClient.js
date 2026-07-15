import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("qna_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("qna_token");
      localStorage.removeItem("qna_user");
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
