import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const STORAGE_KEY = "smart-parking-user";
const TOKEN_KEY = "smart-parking-token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Invalid credentials");
    }

    const { data } = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = ({ name, email, role }) => {
    const nextUser = { name, email, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
