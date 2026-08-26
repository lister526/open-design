// Auth context — loads token, fetches /me, exposes login/register/logout.
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from './lib/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [booting, setBooting] = useState(true);

  const refresh = useCallback(async () => {
    try { const r = await api.me(); setUser(r.user); } catch { setUser(null); await api.setToken(null); }
  }, []);

  useEffect(() => {
    (async () => {
      try { setConfig(await api.getConfig()); } catch { setConfig({ brand: 'Wanka' }); }
      const tok = await api.loadToken();
      if (tok) await refresh();
      setBooting(false);
    })();
  }, [refresh]);

  const doAuth = async (mode, body) => {
    const r = await api[mode](body);          // api.login / api.register
    await api.setToken(r.token);
    setUser(r.user);
    return r;
  };
  const logout = async () => { await api.setToken(null); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, setUser, config, booting, login: (b) => doAuth('login', b), register: (b) => doAuth('register', b), logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}
