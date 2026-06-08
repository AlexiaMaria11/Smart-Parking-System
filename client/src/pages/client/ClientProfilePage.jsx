import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../services/api";
import "./ClientPages.css";

export function ClientProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null);

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  async function handleUpdateSettings() {
    setSettingsLoading(true);
    setSettingsMsg(null);
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: settingsForm.name, phone: settingsForm.phone }),
      });
      setSettingsMsg({ type: "success", text: "Profile updated successfully." });
    } catch {
      setSettingsMsg({ type: "error", text: "Failed to update profile." });
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleChangePassword() {
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await apiRequest("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      setPwMsg({ type: "success", text: "Password changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setPwMsg({ type: "error", text: err.message || "Current password is incorrect." });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
    if (!window.confirm("Confirm permanent account deletion?")) return;
    try {
      await apiRequest("/users/me", { method: "DELETE" });
      logout();
      navigate("/");
    } catch {
      alert("Failed to delete account.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Personal details, password change and account settings."
      />
      <div className="client-profile-grid">
        <div className="client-profile-card">
          <p className="client-panel-eyebrow">Personal details</p>
          <div className="client-profile-details">
            <div className="client-profile-field">
              <label className="client-profile-label">Name</label>
              <input
                className="entity-card-input"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="client-profile-field">
              <label className="client-profile-label">Email</label>
              <p className="client-profile-value">{user?.email}</p>
            </div>
            <div className="client-profile-field">
              <label className="client-profile-label">Phone</label>
              <input
                className="entity-card-input"
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+40700000000"
              />
            </div>
          </div>
          {settingsMsg && (
            <p className={settingsMsg.type === "success" ? "profile-msg-success" : "entity-card-error"}>
              {settingsMsg.text}
            </p>
          )}
          <div className="client-profile-actions">
            <Button onClick={handleUpdateSettings} disabled={settingsLoading}>
              {settingsLoading ? "Saving..." : "Update Settings"}
            </Button>
            <Button variant="secondary" onClick={() => setShowPasswordForm((v) => !v)}>
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <div className="client-password-form">
              <input
                className="entity-card-input"
                type="password"
                placeholder="Current password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              />
              <input
                className="entity-card-input"
                type="password"
                placeholder="New password (min. 6 characters)"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
              <input
                className="entity-card-input"
                type="password"
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              />
              {pwMsg && (
                <p className={pwMsg.type === "success" ? "profile-msg-success" : "entity-card-error"}>
                  {pwMsg.text}
                </p>
              )}
              <div className="client-profile-actions">
                <Button onClick={handleChangePassword} disabled={pwLoading}>
                  {pwLoading ? "Updating..." : "Confirm password"}
                </Button>
                <Button variant="secondary" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="client-profile-card client-profile-card-settings">
          <p className="client-panel-eyebrow">Account settings</p>
          <p className="client-profile-copy">
            Manage your account and permanently delete it if you no longer need it.
          </p>
          <div className="client-profile-actions">
            <Button variant="secondary" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
