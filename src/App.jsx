import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./auth/useAuthStore";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FlatList from "./pages/Flat/FlatList";
import MaintenanceList from "./pages/Maintenance/MaintenanceList";
import AnnouncementList from "./pages/Announcement/AnnouncementList";
import UserList from "./pages/Users/UserList";
import { useSocietyStore } from "./store/useAdminStore";
import { Toaster } from "react-hot-toast";
import ComplaintList from "./pages/Complaints/ComplaintList";

export default function App() {
  const restore = useAuthStore((s) => s.restore);
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  const fetchAll = useSocietyStore((s) => s.fetchAll);

  useEffect(() => {
    restore();
  }, []);

  useEffect(() => {
    if (role === "admin") {
      fetchAll(); // only admin loads everything
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All Auth Users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="complaints"
            element={
              <ProtectedRoute>
                <ComplaintList />
              </ProtectedRoute>
            }
          />
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* All Users Can See Announcements */}
          <Route path="announcements" element={<AnnouncementList />} />

          <Route
            path="my-maintenance"
            element={
              <ProtectedRoute role="member">
                <MaintenanceList />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ONLY ROUTES */}
          <Route
            path="flats"
            element={
              <ProtectedRoute role="admin">
                <FlatList />
              </ProtectedRoute>
            }
          />

          <Route
            path="maintenance"
            element={
              <ProtectedRoute role="admin">
                <MaintenanceList />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute role="admin">
                <UserList />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
