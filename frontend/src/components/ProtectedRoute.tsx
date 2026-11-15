import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"FARMER" | "OFFICER" | "ADMIN">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-mrittika-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-700 font-bold font-bangla">তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate portal for the authenticated role
    if (user.role === "ADMIN") return <Navigate to="/admin-portal/overview" replace />;
    if (user.role === "OFFICER") return <Navigate to="/officer/overview" replace />;
    return <Navigate to="/farmer/overview" replace />;
  }

  return <>{children}</>;
};
