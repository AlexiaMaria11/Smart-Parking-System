import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { apiRequest } from "../../services/api";
import { DateTimePicker } from "./DateTimePicker";
import "./Parking.css";

const SPOT_TYPE_LABELS = {
  RESERVATION: "Reservation",
  WALK_IN: "Walk-in",
  CONFLICT: "Conflict",
};

const ENTRY_TYPE_LABELS = {
  RESERVATION: "With reservation",
  WALK_IN: "Walk-in",
  CONFLICT: "Conflict",
};

const DURATION_OPTIONS = [1, 2, 3, 4];

function formatRemainingTime(endTime) {
  if (!endTime) return null;
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return "Expired";
  const totalMinutes = Math.floor(diff / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function getDefaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function SpotDetailsCard({ spot, adminMode = false, onClose, onActionDone, vehicles = [] }) {
  const [reserving, setReserving] = useState(false);
  const [startDate, setStartDate] = useState(getDefaultStart);
  const [duration, setDuration] = useState(1);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveMsg, setReserveMsg] = useState(null);

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState(null);

  if (!spot) {
    return (
      <div className="spot-details">
        <p className="spot-details-empty-title">Select a parking spot</p>
        <p className="spot-details-empty-copy">
          Choose a spot from the map to inspect live details and actions.
        </p>
      </div>
    );
  }

  const defaultVehicle = vehicles.find((v) => v.isDefault) ?? vehicles[0] ?? null;
  const canReserve = spot.state === "available" && spot.spotType === "RESERVATION";
  const remainingTime = formatRemainingTime(spot.endTime);

  const endDate = new Date((startDate ?? new Date()).getTime() + duration * 3600000);
  const estimatedCost = spot.pricePerHour ? (spot.pricePerHour * duration).toFixed(2) : "—";

  async function handleReserve() {
    if (!defaultVehicle) {
      setReserveMsg({ type: "error", text: "No vehicle saved. Add a vehicle first in My Vehicles." });
      return;
    }
    setReserveLoading(true);
    setReserveMsg(null);
    try {
      const res = await apiRequest("/reservations", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: defaultVehicle.id,
          parkingSpotId: spot.id,
          startTime: (startDate ?? new Date()).toISOString(),
          endTime: endDate.toISOString(),
        }),
      });

      const confirmedSpot = res.data?.parkingSpot?.code ?? spot.code;
      const wasRedirected = !!res.data?.redirectedFrom;

      setReserveMsg({
        type: wasRedirected ? "redirect" : "success",
        text: wasRedirected
          ? `⚠️ Spot ${spot.code} was already booked in that interval. You were automatically redirected to spot ${confirmedSpot}.`
          : `Reservation confirmed on spot ${confirmedSpot}!`,
      });
      setReserving(false);
      onActionDone?.();
    } catch (err) {
      setReserveMsg({ type: "error", text: err.message || "Failed to create reservation." });
    } finally {
      setReserveLoading(false);
    }
  }

  async function handleForceRelease() {
    if (!window.confirm(`Force-release spot ${spot.code}?`)) return;
    setAdminLoading(true);
    setAdminMsg(null);
    try {
      await apiRequest(`/parking-spots/${spot.id}/release`, { method: "PATCH" });
      setAdminMsg({ type: "success", text: `Spot ${spot.code} released.` });
      onActionDone?.();
    } catch {
      setAdminMsg({ type: "error", text: "Failed to release spot." });
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleMarkDefective() {
    if (!window.confirm(`Mark spot ${spot.code} as defective / unavailable?`)) return;
    setAdminLoading(true);
    setAdminMsg(null);
    try {
      await apiRequest(`/parking-spots/${spot.id}/defective`, { method: "PATCH" });
      setAdminMsg({ type: "success", text: `Spot ${spot.code} marked as unavailable.` });
      onActionDone?.();
    } catch {
      setAdminMsg({ type: "error", text: "Failed to mark spot." });
    } finally {
      setAdminLoading(false);
    }
  }

  return (
    <div className="spot-details">
      <div className="spot-details-header">
        <div>
          <p className="spot-details-eyebrow">Spot overview</p>
          <h3 className="spot-details-title">{spot.code || spot.id}</h3>
        </div>
        <div className="spot-details-header-actions">
          <span className="spot-details-status">{spot.state}</span>
          {spot.spotType && (
            <span className="spot-type-badge">
              {SPOT_TYPE_LABELS[spot.spotType] ?? spot.spotType}
            </span>
          )}
          {onClose ? (
            <button type="button" className="spot-details-close" onClick={onClose} aria-label="Close spot overview">
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="spot-details-list">
        <p><span className="spot-details-label">Price:</span> {spot.price}</p>
        <p><span className="spot-details-label">Status:</span> {spot.state === "available" ? "Free" : "Occupied"}</p>
        <p><span className="spot-details-label">Spot type:</span> {SPOT_TYPE_LABELS[spot.spotType] ?? "—"}</p>
        <p><span className="spot-details-label">Licence plate:</span> {spot.plate ?? "—"}</p>
        <p><span className="spot-details-label">User:</span> {spot.user ?? "—"}</p>
        <p><span className="spot-details-label">Entry type:</span> {ENTRY_TYPE_LABELS[spot.entryType] ?? "—"}</p>
        <p><span className="spot-details-label">Time remaining:</span> {remainingTime ?? "—"}</p>
      </div>

      {/* Admin actions */}
      {adminMode && (
        <div className="spot-details-actions">
          <Button
            onClick={handleForceRelease}
            disabled={adminLoading || spot.state === "available"}
          >
            Force Release
          </Button>
          <Button
            variant="secondary"
            onClick={handleMarkDefective}
            disabled={adminLoading || spot.state !== "available"}
          >
            Mark Defective
          </Button>
          {adminMsg && (
            <p className={adminMsg.type === "success" ? "profile-msg-success" : "entity-card-error"}>
              {adminMsg.text}
            </p>
          )}
        </div>
      )}

      {/* Client actions */}
      {!adminMode && (
        <div className="spot-details-actions">
          {canReserve && !reserving && (
            <Button onClick={() => { setReserving(true); setReserveMsg(null); }}>
              Reserve Spot
            </Button>
          )}

          {canReserve && reserving && (
            <div className="spot-reserve-form">
              <p className="spot-reserve-label">
                Default vehicle: <strong>{defaultVehicle?.licensePlate ?? "No vehicle"}</strong>
              </p>

              <div className="spot-reserve-field">
                <label className="spot-reserve-label">Start date &amp; time:</label>
                <DateTimePicker
                  value={startDate}
                  onChange={setStartDate}
                  minDate={new Date()}
                />
              </div>

              <div className="spot-reserve-field">
                <label className="spot-reserve-label">Duration:</label>
                <div className="spot-reserve-durations">
                  {DURATION_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`spot-reserve-duration-btn${duration === h ? " spot-reserve-duration-active" : ""}`}
                      onClick={() => setDuration(h)}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              <p className="spot-reserve-cost">
                End: {endDate.toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}{" "}
                · Estimated cost: <strong>{estimatedCost} RON</strong>
              </p>

              <div className="spot-reserve-actions">
                <Button onClick={handleReserve} disabled={reserveLoading || !defaultVehicle}>
                  {reserveLoading ? "Reserving..." : "Confirm reservation"}
                </Button>
                <Button variant="secondary" onClick={() => { setReserving(false); setReserveMsg(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!canReserve && spot.spotType === "WALK_IN" && spot.state === "available" && (
            <p className="spot-details-info">Walk-in spot — enter directly without a reservation.</p>
          )}

          {!canReserve && spot.spotType === "CONFLICT" && (
            <p className="spot-details-info">Conflict buffer spot.</p>
          )}

          {reserveMsg && (
            <p className={
              reserveMsg.type === "success"
                ? "profile-msg-success"
                : reserveMsg.type === "redirect"
                ? "spot-reserve-redirect-msg"
                : "entity-card-error"
            }>
              {reserveMsg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
