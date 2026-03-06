"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await api.login(email, password);
      setUser(u);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: u } = await api.register(name, email, password);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
