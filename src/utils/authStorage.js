/* Aura & Clothes - accounts are stored in MongoDB through the Express server.
   Passwords are hashed on the server (bcrypt). The browser only keeps the
   signed-in user and a login token. Customers and the admin use separate sessions. */

import { api } from "./api.js";

/* ---------- Customer ---------- */

export async function registerUser({ name, email, password }) {
  const { token, user } = await api("/auth/signup", {
    method: "POST",
    body: { name, email, password }
  });
  return { ...user, token };
}

export async function loginUser({ email, password }) {
  const { token, user } = await api("/auth/login", {
    method: "POST",
    body: { email, password }
  });
  return { ...user, token };
}

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem("aat_session") || sessionStorage.getItem("aat_session"));
  } catch {
    return null;
  }
}

export function writeSession(user, remember) {
  eraseSession();
  (remember ? localStorage : sessionStorage).setItem("aat_session", JSON.stringify(user));
}

export function eraseSession() {
  localStorage.removeItem("aat_session");
  sessionStorage.removeItem("aat_session");
}

/* ---------- Admin (kept in sessionStorage, so it ends when the tab is closed) ---------- */

export async function adminLogin({ email, password }) {
  const { token, user } = await api("/auth/admin-login", {
    method: "POST",
    body: { email, password }
  });
  return { ...user, token };
}

export function readAdminSession() {
  try {
    return JSON.parse(sessionStorage.getItem("aat_admin"));
  } catch {
    return null;
  }
}

export function writeAdminSession(admin) {
  sessionStorage.setItem("aat_admin", JSON.stringify(admin));
}

export function eraseAdminSession() {
  sessionStorage.removeItem("aat_admin");
}
