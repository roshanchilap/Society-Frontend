import { create } from "zustand";
import axiosClient from "../api/axiosClient";
import { useAuthStore } from "../auth/useAuthStore";

export const useSocietyStore = create((set) => ({
  flats: [],
  users: [],
  maintenance: [],
  notices: [],
  slips: [],
  complaints: [],
  complaintsLoading: false,
  loading: false,

  // ----------------------------------
  // Load EVERYTHING for dashboard
  // ----------------------------------
  fetchAll: async () => {
    set({ loading: true });

    try {
      const role = useAuthStore.getState().role;

      const noticesEndpoint =
        role === "admin" ? "/notices/admin/registry" : "/notices/my";

      const requests = [
        axiosClient.get("/flats"),
        axiosClient.get("/maintenance"),
        axiosClient.get(noticesEndpoint),
        axiosClient.get("/maintenance/getslipdata"),
        axiosClient.get("/complaints"),
      ];

      // admin-only users
      if (role === "admin") {
        requests.splice(1, 0, axiosClient.get("/users"));
      }

      const responses = await Promise.all(requests);

      let index = 0;

      const flats = responses[index++];
      const users = role === "admin" ? responses[index++] : null;
      const maintenance = responses[index++];
      const notices = responses[index++];
      const slips = responses[index++];
      const complaints = responses[index++];

      set({
        flats: flats.data || [],
        users: users ? users.data.users || [] : [],
        maintenance: maintenance.data || [],
        notices: notices.data || [],
        slips: slips.data?.slips || slips.data || [],
        complaints: complaints.data?.complaints || [],
      });
    } catch (err) {
      console.error("SocietyStore fetchAll error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load complaints only
  // ----------------------------------
  getComplaints: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/complaints");
      set({ complaints: res.data.complaints || [] });
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load notices only
  // ----------------------------------
  getNotices: async () => {
    set({ loading: true });
    try {
      const role = useAuthStore.getState().role;
      const endpoint =
        role === "admin" ? "/notices/admin/registry" : "/notices/my";

      const res = await axiosClient.get(endpoint);
      set({ notices: res.data || [] });
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load flats only
  // ----------------------------------
  getFlats: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/flats");
      set({ flats: res.data || [] });
    } catch (err) {
      console.error("Error fetching flats:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load users only (admin)
  // ----------------------------------
  getUsers: async () => {
    set({ loading: true });
    try {
      const role = useAuthStore.getState().role;
      if (role !== "admin") return set({ loading: false });

      const res = await axiosClient.get("/users");
      set({ users: res.data.users || [] });
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load maintenance only
  // ----------------------------------
  getMaintenance: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/maintenance");
      set({ maintenance: res.data || [] });
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ----------------------------------
  // Load slips only
  // ----------------------------------
  getSlips: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/maintenance/getslipdata");
      set({ slips: res.data.slips || res.data || [] });
    } catch (err) {
      console.error("Error fetching slips:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchComplaints: async () => {
    set({ complaintsLoading: true });
    try {
      const res = await axiosClient.get("/complaints");

      set({
        complaints: Array.isArray(res.data)
          ? res.data
          : res.data.complaints || [],
        complaintsLoading: false,
      });
    } catch (err) {
      set({ complaints: [], complaintsLoading: false });
    }
  },
}));
