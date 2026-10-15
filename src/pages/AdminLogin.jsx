import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin() {
  const { admin, signInAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [busy, setBusy] = useState(false);

  // Already signed in as admin? Go straight to the dashboard
  if (admin && !busy) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ text: "", type: "error" });

    const email = form.email.trim().toLowerCase();
    const found = {};
    if (!EMAIL_PATTERN.test(email)) found.email = "Enter a valid email address.";
    if (!form.password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await signInAdmin({ email, password: form.password });
      navigate("/admin", { replace: true });
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Admin login"
      subtitle="Sign in to manage customer orders."
      message={message}
      buttons={[{ to: "/signin", label: "Customer sign in" }, { to: "/", label: "Back to store" }]}
      footer={<>Not an admin? <Link to="/">Back to the store</Link></>}
    >
      <form id="adminLoginForm" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Admin email</label>
          <input type="email" id="email" name="email" autoComplete="username" required
            aria-invalid={errors.email ? "true" : "false"}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="field-error" id="email-error" role="alert">{errors.email || ""}</div>
        </div>

        <PasswordField id="password" label="Password" autoComplete="current-password"
          error={errors.password} value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button type="submit" className="submit-btn" disabled={busy}>
          {busy ? "Please wait..." : "Sign in as admin"}
        </button>
      </form>
    </AuthLayout>
  );
}
