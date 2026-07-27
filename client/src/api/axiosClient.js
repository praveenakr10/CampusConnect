import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
});

let refreshPromise = null;

function clearAuthStorage() {
  localStorage.removeItem("qna_token");
  localStorage.removeItem("qna_refresh_token");
  localStorage.removeItem("qna_user");
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("qna_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    const url = original?.url || "";

    if (status !== 401 || original?._retry || url.includes("/auth/login") || url.includes("/auth/refresh")) {
      if (status === 401 && !url.includes("/auth/login")) clearAuthStorage();
      return Promise.reject(err);
    }

    const storedRefresh = localStorage.getItem("qna_refresh_token");
    if (!storedRefresh) {
      clearAuthStorage();
      return Promise.reject(err);
    }

    if (!refreshPromise) {
      refreshPromise = axios
        .post("/api/auth/refresh", { refreshToken: storedRefresh })
        .then((res) => {
          const { token, refreshToken } = res.data;
          localStorage.setItem("qna_token", token);
          if (refreshToken) localStorage.setItem("qna_refresh_token", refreshToken);
          return token;
        })
        .catch((refreshErr) => {
          clearAuthStorage();
          throw refreshErr;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const token = await refreshPromise;
      original._retry = true;
      original.headers.Authorization = `Bearer ${token}`;
      return axiosClient(original);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  }
);

export default axiosClient;
