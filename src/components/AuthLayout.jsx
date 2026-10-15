import { Link } from "react-router-dom";

// Shared card shell for the sign in / sign up pages
export default function AuthLayout({ title, subtitle, message, children, footer, buttons = [] }) {
  return (
    <div className="auth-page">
      <main className="auth-card">
        <Link to="/" className="auth-brand">
          <img src="/image/logo.png" alt="" />
          <span>Aura &amp; <span>Clothes</span></span>
        </Link>

        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        <div id="formMessage" role="alert">
          {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
        </div>

        {children}

        <p className="auth-switch">{footer}</p>

        {buttons.length > 0 && (
          <div className="auth-alt">
            {buttons.map((b) => (
              <Link key={b.to} to={b.to} className="auth-alt-btn">{b.label}</Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
