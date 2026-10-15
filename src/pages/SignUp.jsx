import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Already signed in? Skip the auth page (but not while the success message is showing)
  if (user && !busy) return <Navigate to="/" replace />;

  const update = (field) => (event) =>
    setForm({ ...form, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value });

  const validate = () => {
    const found = {};
    const { name, email, password, confirm, terms } = form;
    if (name.trim().length < 2) found.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) found.email = "Enter a valid email address.";
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      found.password = "Use at least 8 characters, including a letter and a number.";
    }
    if (confirm !== password) found.confirm = "Passwords do not match.";
    if (!terms) found.terms = "Please accept the terms to continue.";
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ text: "", type: "error" });
    if (!validate()) return;

    setBusy(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      setMessage({ text: "Account created. Redirecting...", type: "success" });
      timer.current = setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to save your details and check out faster."
      message={message}
      buttons={[{ to: "/admin/login", label: "Admin login" }]}
      footer={<>Already have an account? <Link to="/signin">Sign in</Link></>}
    >
      <form id="signupForm" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input type="text" id="name" name="name" autoComplete="name" required
            aria-invalid={errors.name ? "true" : "false"} value={form.name} onChange={update("name")} />
          <div className="field-error" id="name-error" role="alert">{errors.name || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" autoComplete="email" required
            aria-invalid={errors.email ? "true" : "false"} value={form.email} onChange={update("email")} />
          <div className="field-error" id="email-error" role="alert">{errors.email || ""}</div>
        </div>

        <PasswordField id="password" label="Password" autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password} value={form.password} onChange={update("password")} />

        <PasswordField id="confirm" label="Confirm password" autoComplete="new-password"
          error={errors.confirm} value={form.confirm} onChange={update("confirm")} />

        <div className="field">
          <div className="checkbox">
            <input type="checkbox" id="terms" name="terms" checked={form.terms} onChange={update("terms")}
              aria-invalid={errors.terms ? "true" : "false"} />
            <label htmlFor="terms">I agree to the <a href="#">Terms of use</a> and{" "}
              <a href="#">Privacy policy</a></label>
          </div>
          <div className="field-error" id="terms-error" role="alert">{errors.terms || ""}</div>
        </div>

        <button type="submit" className="submit-btn" disabled={busy}>
          {busy ? "Please wait..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
