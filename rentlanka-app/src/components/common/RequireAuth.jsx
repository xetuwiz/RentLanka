import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const RequireAuth = ({ children, roles = null }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    
    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};
