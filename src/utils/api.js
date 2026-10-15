// Small helper for talking to the Express + MongoDB server.
// While developing, Vite forwards /api/... to http://localhost:5000 (see vite.config.js).
// After deploying, set VITE_API_URL (for example https://aura-server.onrender.com/api).
const BASE = import.meta.env.VITE_API_URL || "/api";

// Customers and the admin keep separate sessions, so both can be signed in
// in the same browser without logging each other out.
function readToken(auth) {
  try {
    if (auth === "admin") {
      return JSON.parse(sessionStorage.getItem("aat_admin"))?.token || null;
    }
    const session = JSON.parse(
      localStorage.getItem("aat_session") || sessionStorage.getItem("aat_session")
    );
    return session?.token || null;
  } catch {
    return null;
  }
}

export async function api(path, { method = "GET", body, auth = "customer" } = {}) {
  const token = readToken(auth);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    const error = new Error("Cannot reach the server. Make sure aura-server is running.");
    error.status = 0;
    throw error;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.");
    error.status = res.status;
    throw error;
  }
  return data;
}
