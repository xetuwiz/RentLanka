import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch {}
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        const { accessToken, refreshToken, userId, name, email: userEmail, role } = res.data;
        const userData = { id: userId, name, email: userEmail, role };
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return res;
    };

    const register = async (name, email, password, phone, role) => {
        const res = await authApi.register({ name, email, password, phone, role });
        const { accessToken, refreshToken, userId, name: userName, email: userEmail, role: userRole } = res.data;
        const userData = { id: userId, name: userName, email: userEmail, role: userRole };
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return res;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) await authApi.logout({ refreshToken });
        } catch {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    const isAuthenticated = () => !!localStorage.getItem("accessToken");
    const isAdmin = () => user?.role === "ADMIN";
    const isOwner = () => user?.role === "OWNER";

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, logout,
            isAuthenticated, isAdmin, isOwner
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
