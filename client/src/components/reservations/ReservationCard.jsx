import { useState } from "react";
import { Button } from "../common/Button";
import { apiRequest } from "../../services/api";
import "../cards/Cards.css";

export function ReservationCard({ reservation, showStatus = true, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extendMsg, setExtendMsg] = useState(null);

  const canCancel = ["active", "upcoming"].includes(reservation.section);
  const canExtend = ["active", "upcoming"].includes(reservation.section);

  async function handleCancel() {
    if (!window.confirm(`Cancel reservation for spot ${reservation.spot}?`)) return;
    setLoading(true);
    setError(null);
    setExtendMsg(null);
    try {
      await apiRequest(`/reservations/${reservation.id}/cancel`, { method: "PATCH" });
      onUpdated?.();
    } catch (err) {
      setError(err.message || "Failed to cancel reservation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExtend() {
    setLoading(true);
    setError(null);
    setExtendMsg(null);
    try {
      const res = await apiRequest(`/reservations/${reservation.id}/extend`, {
        method: "PATCH",
        body: JSON.stringify({ extraHours: 1 }),
      });
      const newCost = res.data?.totalCost ? Number(res.data.totalCost).toFixed(2) : null;
      setExtendMsg(newCost ? `Extended by 1h. New total: ${newCost} RON` : "Extended by 1h.");
      onUpdated?.();
    } catch (err) {
      setError(err.message || "Failed to extend reservation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="entity-card">
      <div className="entity-card-content-wide">
        <div>
          {showStatus && <p className="entity-card-eyebrow">{reservation.status}</p>}
          <h3 className="entity-card-title">{reservation.spot}</h3>
          <div className="entity-card-details">
            <p>Date: {reservation.date}</p>
            <p>Interval: {reservation.interval}</p>
            <p>Vehicle: {reservation.vehicle}</p>
            <p>Cost: {reservation.cost}</p>
          </div>
          {error && <p className="entity-card-error">{error}</p>}
          {extendMsg && <p className="profile-msg-success">{extendMsg}</p>}
        </div>
        <div className="entity-card-actions">
          {canExtend && (
            <Button variant="secondary" onClick={handleExtend} disabled={loading}>
              {loading ? "..." : "Extend +1h"}
            </Button>
          )}
          {canCancel && (
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
