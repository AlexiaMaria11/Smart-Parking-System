import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE_PATHS } from "../../constants/routes";

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium">
          Email address
          <input
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium">
          Role
          <select
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <Button className="w-full">Sign Up</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link to={ROUTE_PATHS.LOGIN} className="font-semibold text-primary">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
