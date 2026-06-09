import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../services/api";
import { ROUTE_PATHS } from "../../constants/routes";
import "./AuthPages.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", licensePlate: "", vehicleLabel: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      await apiRequest("/vehicles", {
        method: "POST",
        body: JSON.stringify({
          licensePlate: form.licensePlate.toUpperCase(),
          label: form.vehicleLabel.trim() || form.licensePlate.toUpperCase(),
        }),
      });
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
            onChange={handleChange("name")}
            required
          />
        </label>
        <label className="auth-label">
          Email address
          <input
            type="email"
            className="auth-field"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-field"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
        </label>
        <label className="auth-label">
          License plate
          <input
            className="auth-field"
            value={form.licensePlate}
            onChange={handleChange("licensePlate")}
            placeholder="e.g. B-123-ABC"
            required
          />
        </label>
        <label className="auth-label">
          Vehicle label <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
          <input
            className="auth-field"
            value={form.vehicleLabel}
            onChange={handleChange("vehicleLabel")}
            placeholder="e.g. My Car"
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
