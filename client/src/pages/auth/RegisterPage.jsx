import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../constants/routes";
import "./AuthPages.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "CLIENT"
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const user = register(form);
    navigate(user.role === "ADMIN" ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.CLIENT_DASHBOARD);
  };

  return (
    <AuthShell title="Get Started Now" subtitle="Create an account and choose the role flow you want to preview in this starter project.">
      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Name
          <input
            className="auth-field"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="auth-label">
          Email address
          <input
            className="auth-field"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="auth-label">
          Role
          <select
            className="auth-field"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <Button className="auth-submit">Sign Up</Button>
      </form>
      <p className="auth-switch">
        Already have an account?{" "}
        <Link to={ROUTE_PATHS.LOGIN} className="auth-link">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
