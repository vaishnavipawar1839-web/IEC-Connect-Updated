import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, authenticated, unauthenticated

  const initAuth = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      clearStoredAuth();
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      // Set user from storage immediately before refreshing to avoid flickers
      setUser(JSON.parse(storedUser));
      setStatus("authenticated");

      // Verify and refresh token
      const res = await api.post("/users/refresh-token");
      const { accessToken, user: refreshedUser } = res.data;
      
      localStorage.setItem("token", accessToken);
      
      // Update user if returned, otherwise keep the stored one
      if (refreshedUser) {
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        localStorage.setItem("userRole", refreshedUser.role);
        setUser(refreshedUser);
      } else {
        // Fallback: Use the stored user we already parsed
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      clearStoredAuth();
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (payload) => {
    const res = await api.post("/users/login", payload);
    const { accessToken, user: userData } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);

    setUser(userData);
    setStatus("authenticated");
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearStoredAuth();
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  const value = {
    user,
    userRole: user?.role,
    userName: user?.name,
    isAuthenticated: status === "authenticated",
    status,
    login,
    logout,
    refreshAuth: initAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};