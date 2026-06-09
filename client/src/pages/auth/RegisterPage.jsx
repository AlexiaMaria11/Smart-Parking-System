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
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "ADMIN" ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.CLIENT_DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Get Started Now" subtitle="Create an account to access the Smart Parking System.">
      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Name
          <input
            className="auth-field"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>
        <label className="auth-label">
          Email address
          <input
            type="email"
            className="auth-field"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-field"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        <Button className="auth-submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
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
