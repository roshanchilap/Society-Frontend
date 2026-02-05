// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-white border-solid mb-6"></div>

          {/* Branding text */}
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Society Portal
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Authenticating your session...
          </p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return children;
}