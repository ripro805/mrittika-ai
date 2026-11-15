import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setAccessToken } from "../services/api";

export interface User {
  id: number;
  phone: string;
  name: string;
  district: string;
  upazila: string;
  role: "FARMER" | "OFFICER" | "ADMIN";
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  role: "GUEST" | "FARMER" | "OFFICER" | "ADMIN";
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      // First attempt token refresh via cookie
      const ref = await apiClient.post("/auth/refresh");
      if (ref.data?.access) {
        setAccessToken(ref.data.access);
        const me = await apiClient.get("/me");
        setUser(me.data);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (phone: string, password: string): Promise<User> => {
    setAccessToken(null);
    const res = await apiClient.post("/auth/login", { phone, password });
    if (res.data?.access) {
      setAccessToken(res.data.access);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error("Login failed");
  };

  const register = async (data: any): Promise<User> => {
    setAccessToken(null);
    const res = await apiClient.post("/auth/register", data);
    if (res.data?.access) {
      setAccessToken(res.data.access);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error("Registration failed");
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const me = await apiClient.get("/me");
      setUser(me.data);
    }
  };

  const role = user ? user.role : "GUEST";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
