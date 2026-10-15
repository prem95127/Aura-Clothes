import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  registerUser, loginUser, readSession, writeSession, eraseSession,
  adminLogin, readAdminSession, writeAdminSession, eraseAdminSession
} from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [admin, setAdmin] = useState(() => readAdminSession());

  /* customer */
  const signUp = useCallback(async ({ name, email, password }) => {
    const created = await registerUser({ name, email, password });
    writeSession(created, true);
    setUser(created);
  }, []);

  const signIn = useCallback(async ({ email, password, remember }) => {
    const found = await loginUser({ email, password });
    writeSession(found, remember);
    setUser(found);
  }, []);

  const signOut = useCallback(() => {
    eraseSession();
    setUser(null);
  }, []);

  /* admin */
  const signInAdmin = useCallback(async ({ email, password }) => {
    const found = await adminLogin({ email, password });
    writeAdminSession(found);
    setAdmin(found);
  }, []);

  const signOutAdmin = useCallback(() => {
    eraseAdminSession();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ user, signUp, signIn, signOut, admin, signInAdmin, signOutAdmin }),
    [user, signUp, signIn, signOut, admin, signInAdmin, signOutAdmin]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
