import { Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuthStore();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!token) return <Navigate to="/login" replace />;

  return children;
}
