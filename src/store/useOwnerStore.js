import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useOwnerStore = create((set) => ({
  maintenance: [],
  notices: [],
  slips: [],
  loading: false,

  // -------------------------
  // LOAD MY MAINTENANCE
  // -------------------------
  loadMyMaintenance: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/maintenance/my");
      set({ maintenance: res.data });
    } catch (err) {
      console.error("OwnerStore loadMyMaintenance:", err);
    }
    set({ loading: false });
  },

  // -------------------------
  // LOAD MY NOTICES
  // -------------------------
  loadMyNotices: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/notices/my");
      set({ notices: res.data });
    } catch (err) {
      console.error("OwnerStore loadMyNotices:", err);
    }
    set({ loading: false });
  },

  // -------------------------
  // DELETE A SINGLE NOTICE
  // -------------------------
  deleteNotice: async (id) => {
    try {
      await axiosClient.delete(`/notices/delete/${id}`);
      await useOwnerStore.getState().loadMyNotices();
    } catch (err) {
      console.error("OwnerStore deleteNotice:", err);
    }
  },

  // -------------------------
  // DELETE ALL NOTICES
  // -------------------------
  deleteAllNotices: async () => {
    try {
      await axiosClient.delete("/notices/delete-all");
      set({ notices: [] });
    } catch (err) {
      console.error("OwnerStore deleteAllNotices:", err);
    }
  },

  // -------------------------
  // LOAD MY SLIPS
  // -------------------------
  loadMySlips: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get("/maintenance/getslipdata");
      set({ slips: res.data.slips || res.data });
    } catch (err) {
      console.error("OwnerStore loadMySlips:", err);
    }
    set({ loading: false });
  },
}));
