import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import "./ClientPages.css";

export function ClientProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Personal data, password controls and account settings live here in a simple profile workspace."
      />
      <div className="client-profile-grid">
        <div className="client-profile-card">
          <p className="client-panel-eyebrow">Personal data</p>
          <div className="client-profile-details">
            <p><span className="client-profile-label">Name:</span> {user?.name || "Client User"}</p>
            <p><span className="client-profile-label">Email:</span> {user?.email || "client@parking.com"}</p>
            <p><span className="client-profile-label">Phone:</span> +40 712 345 678</p>
            <p><span className="client-profile-label">Default vehicle:</span> B-92-UNI</p>
          </div>
          <div className="client-profile-actions">
            <Button>Change Password</Button>
            <Button variant="secondary">Update Settings</Button>
          </div>
        </div>
        <div className="client-profile-card client-profile-card-settings">
          <p className="client-panel-eyebrow">Account settings</p>
          <p className="client-profile-copy">
            This area is prepared for delete account, notification preferences and logout handling.
          </p>
          <div className="client-profile-actions">
            <Button variant="secondary">Delete Account</Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
