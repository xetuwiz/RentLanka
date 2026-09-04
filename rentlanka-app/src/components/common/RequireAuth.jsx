import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const RequireAuth = ({ allowedRoles = null }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};
