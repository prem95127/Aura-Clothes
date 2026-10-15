import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Already signed in? Skip the auth page (but not while the success message is showing)
  if (user && !busy) return <Navigate to="/" replace />;

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
      await signIn({ email, password: form.password, remember: form.remember });
      setMessage({ text: "Signed in. Redirecting...", type: "success" });
      timer.current = setTimeout(() => navigate("/", { replace: true }), 600);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to keep shopping."
      message={message}
      buttons={[{ to: "/admin/login", label: "Admin login" }]}
      footer={<>New here? <Link to="/signup">Create an account</Link></>}
    >
      <form id="signinForm" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" autoComplete="email" required
            aria-invalid={errors.email ? "true" : "false"}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="field-error" id="email-error" role="alert">{errors.email || ""}</div>
        </div>

        <PasswordField id="password" label="Password" autoComplete="current-password"
          error={errors.password} value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <div className="field checkbox">
          <input type="checkbox" id="remember" name="remember" checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
          <label htmlFor="remember">Keep me signed in on this device</label>
        </div>

        <button type="submit" className="submit-btn" disabled={busy}>
          {busy ? "Please wait..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
