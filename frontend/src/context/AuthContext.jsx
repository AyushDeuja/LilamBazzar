import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

/** Decodes the JWT payload (base64url) without verifying — display only. */
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? decodeToken(token) : null;
  });
  // true until the stored token has been validated against the API
  const [booting, setBooting] = useState(Boolean(getToken()));

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get('/auth/profile');
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    refreshProfile()
      .catch(() => {
        // stored token is expired/invalid
        clearToken();
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, [refreshProfile]);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    setToken(data.token);
    const decoded = decodeToken(data.token);
    setUser(decoded);
    return decoded;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setToken(data.token);
    const decoded = decodeToken(data.token);
    setUser(decoded);
    return decoded;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, login, register, logout, refreshProfile }),
    [user, booting, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
