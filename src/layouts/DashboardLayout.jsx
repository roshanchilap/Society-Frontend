import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ClockWidget from "../pages/Dashboard/widgets/ClockWidget";
import DateWidget from "../pages/Dashboard/widgets/DateWidget";

import { useAuthStore } from "../auth/useAuthStore";
import axiosClient from "../api/axiosClient";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔔 notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);

  const dropdownRef = useRef(null);
  const role = useAuthStore((s) => s.role);

  const HIDDEN_KEY = "hidden_notifications";

  const getHiddenIds = () => {
    try {
      return JSON.parse(localStorage.getItem(HIDDEN_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveHiddenIds = (ids) => {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  };

  /* ----------------------------------
     Fetch notifications
  ---------------------------------- */
  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        axiosClient.get("/notifications/my"),
        axiosClient.get("/notifications/my/unread-count"),
      ]);

      const hiddenIds = getHiddenIds();

      const visibleNotifications = (listRes.data.notifications || []).filter(
        (n) => !hiddenIds.includes(n._id),
      );

      setNotifications(visibleNotifications);
      setUnreadCount(countRes.data.count || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const clearReadFrontend = () => {
    const readIds = notifications.filter((n) => n.isRead).map((n) => n._id);
    const existingHidden = getHiddenIds();

    saveHiddenIds([...new Set([...existingHidden, ...readIds])]);

    setNotifications((prev) => prev.filter((n) => !n.isRead));
  };

  /* ----------------------------------
     Close dropdown on outside click
  ---------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ----------------------------------
     Mark notification as read
  ---------------------------------- */
  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  /* ----------------------------------
     Mark all as read
  ---------------------------------- */
  const markAllAsRead = async () => {
    try {
      await axiosClient.put("/notifications/my/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 shadow-xl rounded-r-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header
          className="
    h-16 px-4 md:px-6
    flex items-center justify-between
    bg-white
    border-b border-gray-200
    shadow-sm
  "
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-200 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} className="text-gray-700" />
            </button>

            <span className="text-base md:text-lg font-semibold text-gray-800">
              Sai Pooja
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Date + Time (desktop only) */}
            <div
              className="hidden md:flex items-center gap-2
                    px-3 py-1 text-xs
                    bg-gray-100 border border-gray-200
                    rounded-md font-medium text-gray-700"
            >
              <ClockWidget />
              <DateWidget />
            </div>

            {/* Role badge (desktop only) */}
            <span
              className="hidden md:inline-block
                 px-3 py-1 text-xs
                 bg-blue-100 text-blue-700
                 border border-blue-200
                 rounded-md font-semibold"
            >
              {role?.toUpperCase()}
            </span>

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenNotif((o) => !o)}
                className="relative p-2 rounded-md hover:bg-gray-200 transition"
              >
                <Bell size={20} className="text-gray-700" />

                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1
                       min-w-[16px] h-[16px]
                       px-1 text-[10px]
                       rounded-full
                       bg-red-500 text-white
                       flex items-center justify-center"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {openNotif && (
                <div
                  className="
            absolute right-0 mt-2
            w-[90vw] md:w-96
            bg-white rounded-xl shadow-xl
            border border-gray-200 z-30
          "
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Notifications
                    </h4>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-xs px-2 py-1 rounded-md
                           text-gray-600 hover:bg-gray-100
                           disabled:opacity-40"
                      >
                        Mark all
                      </button>

                      <button
                        onClick={clearReadFrontend}
                        disabled={notifications.length === 0}
                        className="text-xs px-2 py-1 rounded-md
                           text-gray-500 hover:bg-gray-100
                           disabled:opacity-40"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-96 overflow-y-auto px-2 pb-2">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-400">
                        You’re all caught up 🎉
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className="flex gap-3 px-3 py-3 rounded-lg
                             cursor-pointer transition
                             hover:bg-gray-100"
                        >
                          {!n.isRead && (
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                          )}

                          <div className="flex-1">
                            <div className="text-sm text-gray-800">
                              {n.title}
                            </div>
                            {n.message && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {n.message}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
