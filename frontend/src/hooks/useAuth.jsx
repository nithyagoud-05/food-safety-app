import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.role || "user",
    status: user.status || "active"
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("annapurna_user");
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });

  async function applySession(action, payload) {
    const result = await action(payload);
    const sessionUser = normalizeUser(result.user);
    localStorage.setItem("annapurna_token", result.token);
    localStorage.setItem("annapurna_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: (payload) => applySession(api.login, payload),
      register: (payload) => applySession(api.register, payload),
      logout: () => {
        localStorage.removeItem("annapurna_token");
        localStorage.removeItem("annapurna_user");
        setUser(null);
      },
      refreshUser: async () => {
        const profile = normalizeUser(await api.profile());
        localStorage.setItem("annapurna_user", JSON.stringify(profile));
        setUser(profile);
        return profile;
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
