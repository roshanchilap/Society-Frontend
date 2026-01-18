import { create } from "zustand";
import axiosClient from "../api/axiosClient";
import { setRestoring } from "../api/axiosClient";

// 🔹 helper
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = create((set) => ({
  user: null, // {_id, name, flatId}
  role: null, // admin / owner / tenant
  token: null,
  loading: true,

  /* ---------------- LOGIN ---------------- */
  login: async (societyCode, email, password) => {
    set({ loading: true });

    try {
      const res = await axiosClient.post("/auth/login", {
        societyCode,
        email,
        password,
      });

      if (res.data?.token && res.data?.user) {
        // ✅ STORE CORRECT DATA
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("societyId", res.data.societyId);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", res.data.user.role);

        set({
          token: res.data.token,
          user: res.data.user,
          role: res.data.user.role,
          loading: false,
        });
      }
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  /* ---------------- LOGOUT ---------------- */
  logout: () => {
    localStorage.clear();

    set({
      user: null,
      role: null,
      token: null,
      loading: false,
    });

    window.location.href = "/login";
  },

  /* ---------------- RESTORE SESSION ---------------- */
  restore: async () => {
    setRestoring(true);
    set({ loading: true });

    const token = localStorage.getItem("token");
    const societyId = localStorage.getItem("societyId");
    const userStr = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    // ❌ no session
    if (!token || !societyId || !userStr || !role) {
      set({ loading: false });
      setRestoring(false);
      return;
    }

    // 🔥 expired token
    if (isTokenExpired(token)) {
      localStorage.clear();
      set({
        token: null,
        user: null,
        role: null,
        loading: false,
      });
      setRestoring(false);
      return;
    }

    try {
      // optional validation
      await axiosClient.get("/auth/me");

      set({
        token,
        user: JSON.parse(userStr),
        role,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }

    setRestoring(false);
  },
}));
