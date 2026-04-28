import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import "./AuthPages.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "client@parking.com",
    password: "client123"
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const user = login(form);
      navigate(user.role === ROLES.ADMIN ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.CLIENT_DASHBOARD);
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <AuthShell title="Welcome back!" subtitle="Enter your credentials to access your account. Demo accounts: admin@parking.com / client@parking.com">
      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Email address
          <input
            className="auth-field"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-field"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        <Button className="auth-submit">Login</Button>
      </form>
      <p className="auth-switch">
        Don&apos;t have an account?{" "}
        <Link to={ROUTE_PATHS.REGISTER} className="auth-link">
          Sign Up
        </Link>
      </p>
    </AuthShell>
  );
}
