import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export function ClientProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Personal data, password controls and account settings live here in a simple profile workspace."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Personal data</p>
          <div className="mt-5 space-y-4 text-sm text-muted">
            <p><span className="font-semibold text-ink">Name:</span> {user?.name || "Client User"}</p>
            <p><span className="font-semibold text-ink">Email:</span> {user?.email || "client@parking.com"}</p>
            <p><span className="font-semibold text-ink">Phone:</span> +40 712 345 678</p>
            <p><span className="font-semibold text-ink">Default vehicle:</span> B-92-UNI</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Change Password</Button>
            <Button variant="secondary">Update Settings</Button>
          </div>
        </div>
        <div className="glass-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Account settings</p>
          <p className="mt-4 text-sm leading-7 text-muted">
            This area is prepared for delete account, notification preferences and logout handling.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary">Delete Account</Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
