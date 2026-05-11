import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-orange-500 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
          </svg>
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user)
    return <Navigate to="/signin" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/" replace />;
  return children;
}
