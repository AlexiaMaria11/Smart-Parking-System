import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../constants/routes";
import { ROLES } from "../../constants/roles";

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">
          Email address
          <input
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>
        {error ? <p className="text-sm font-semibold text-primary">{error}</p> : null}
        <Button className="w-full">Login</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link to={ROUTE_PATHS.REGISTER} className="font-semibold text-primary">
          Sign Up
        </Link>
      </p>
    </AuthShell>
  );
}
