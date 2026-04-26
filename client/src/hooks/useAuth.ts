import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const login = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await api.post("/auth/login", payload);
      return response.data;
    },
    onSuccess: (session) => {
      setSession(session);
      navigate("/");
    },
  });

  const logout = async () => {
    await api.post("/auth/logout");
    clearSession();
    navigate("/login");
  };

  return { login, logout };
}
