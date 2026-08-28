// lib/auth.js — global auth/session store via React context.
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Bootstrap: load token, then fetch /me if present.
  useEffect(() => {
    (async () => {
      try {
        const tok = await api.loadToken();
        if (tok) {
          const r = await api.me();
          setUser(r?.user || null);
        }
      } catch {
        // token invalid/expired — clear it silently
        await api.setToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const r = await api.me();
      setUser(r?.user || null);
      return r?.user || null;
    } catch {
      return null;
    }
  }, []);

  const doLogin = useCallback(async (email, password) => {
    const r = await api.login({ email, password });
    setUser(r?.user || null);
    return r;
  }, []);

  const doRegister = useCallback(async (payload) => {
    const r = await api.register(payload);
    setUser(r?.user || null);
    return r;
  }, []);

  const doLogout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    ready,
    isLoggedIn: !!user,
    setUser,
    refresh,
    login: doLogin,
    register: doRegister,
    logout: doLogout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
