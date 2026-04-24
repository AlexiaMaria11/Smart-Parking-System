import { createContext, useEffect, useMemo, useState } from "react";
import { ROLES } from "../constants/roles";

export const AuthContext = createContext(null);

const STORAGE_KEY = "smart-parking-user";

const defaultUsers = {
  "admin@parking.com": { role: ROLES.ADMIN, name: "Admin User", password: "admin123" },
  "client@parking.com": { role: ROLES.CLIENT, name: "Client User", password: "client123" }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = ({ email, password }) => {
    const match = defaultUsers[email];
    if (!match || match.password !== password) {
      throw new Error("Invalid credentials");
    }

    const nextUser = { email, role: match.role, name: match.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const register = ({ name, email, role }) => {
    const nextUser = { name, email, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
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
