import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string;
  preferred_language?: string;
  theme_preference?: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  function setSession(newUser: User, newAccessToken: string) {
    user.value = newUser;
    token.value = newAccessToken;
    localStorage.setItem("accessToken", newAccessToken);
  }

  function clearSession() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("accessToken");
  }

  async function login(credentials: { email: string; password: string }) {
    loading.value = true;
    try {
      const response = await api.post("/auth/login", credentials);
      const { user: u, accessToken } = response.data.data;
      setSession(u, accessToken);
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: { email: string; password: string; full_name: string }) {
    loading.value = true;
    try {
      const response = await api.post("/auth/register", data);
      const { user: u, accessToken } = response.data.data;
      setSession(u, accessToken);
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request error:", e);
    } finally {
      clearSession();
    }
  }

  async function fetchMe() {
    if (!localStorage.getItem("accessToken")) return;
    try {
      const response = await api.get("/auth/me");
      user.value = response.data.data;
    } catch (e) {
      clearSession();
    }
  }

  async function checkAuth() {
    // Try to refresh token if access token is missing but refresh cookie is present
    if (!localStorage.getItem("accessToken")) {
      try {
        const response = await api.post("/auth/refresh");
        const { user: u, accessToken } = response.data.data;
        setSession(u, accessToken);
      } catch (e) {
        clearSession();
      }
    } else {
      await fetchMe();
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchMe,
    checkAuth,
    clearSession
  };
});
