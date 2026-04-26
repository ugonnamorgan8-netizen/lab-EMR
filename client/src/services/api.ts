import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshResponse = await axios.post(
        `${apiBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      useAuthStore.getState().setSession({
        accessToken: refreshResponse.data.accessToken,
        user: refreshResponse.data.user,
      });

      original.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);

export { api };
