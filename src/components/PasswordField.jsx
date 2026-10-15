import { useState } from "react";

// Password input with a Show / Hide toggle (used on both auth pages)
export default function PasswordField({ id, label, hint, error, autoComplete, value, onChange }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          type={shown ? "text" : "password"}
          id={id}
          name={id}
          autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined}
          aria-invalid={error ? "true" : "false"}
          value={value}
          onChange={onChange}
          required
        />
        <button type="button" className="toggle-password" aria-pressed={shown}
          onClick={() => setShown((s) => !s)}>
          {shown ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <div className="hint" id={`${id}-hint`}>{hint}</div>}
      <div className="field-error" id={`${id}-error`} role="alert">{error || ""}</div>
    </div>
  );
}
