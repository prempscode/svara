import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

 
  async function refreshProfile() {
    try {
      const response = await api.get("/auth/profile");

      setUser(response.data.user);

      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      if (error.response?.status !== 401) {
        // console.error(error);
      }

      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }
  // login
  async function login(formData) {
    const response = await api.post("/auth/login", formData);

    setUser(response.data.user);

    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  }

  // logout
  async function logout() {
    await api.post("/auth/logout");

    setUser(null);

    localStorage.removeItem("user");
  }

  useEffect(() => {
    async function initializeAuth() {
      await refreshProfile();
    }

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
