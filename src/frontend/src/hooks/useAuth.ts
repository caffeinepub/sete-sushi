import { createContext, useCallback, useContext, useState } from "react";
import type { backendInterface } from "../apiClient";

const TOKEN_KEY = "sete_admin_token";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (actor: backendInterface, password: string) => Promise<boolean>;
  logout: (actor: backendInterface | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  isLoggingIn: false,
  loginError: null,
  login: async () => false,
  logout: async () => {},
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export function useAuthState(): AuthContextType {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  const login = useCallback(
    async (actor: backendInterface, password: string): Promise<boolean> => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const res = await actor.adminLogin(password);
        if (res.ok && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
          setToken(res.token);
          return true;
        }
        setLoginError(res.error ?? "Nepareiza parole");
        return false;
      } catch {
        setLoginError("Savienojuma kļūda");
        return false;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [],
  );

  const logout = useCallback(
    async (actor: backendInterface | null) => {
      if (token && actor) {
        try {
          await actor.adminLogout(token);
        } catch {
          // ignore
        }
      }
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    },
    [token],
  );

  return { token, isAuthenticated, isLoggingIn, loginError, login, logout };
}

export { AuthContext };
export type { AuthContextType };
