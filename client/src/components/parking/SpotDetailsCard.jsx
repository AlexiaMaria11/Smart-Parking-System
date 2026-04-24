import { Button } from "../common/Button";

export function SpotDetailsCard({ spot, adminMode = false }) {
  if (!spot) {
    return (
      <div className="glass-panel p-6">
        <p className="font-display text-xl font-semibold">Select a parking spot</p>
        <p className="mt-2 text-muted">Choose a spot from the map to inspect live details and actions.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Spot overview</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{spot.id}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-muted">{spot.state}</span>
      </div>
      <div className="mt-6 space-y-3 text-sm text-muted">
        <p><span className="font-semibold text-ink">Price:</span> {spot.price}</p>
        <p><span className="font-semibold text-ink">Availability:</span> {spot.state}</p>
        <p><span className="font-semibold text-ink">Restrictions:</span> {spot.restrictions}</p>
        <p><span className="font-semibold text-ink">User:</span> {spot.user || "No active user"}</p>
        <p><span className="font-semibold text-ink">Remaining time:</span> {spot.remainingTime || "N/A"}</p>
        <p><span className="font-semibold text-ink">License plate:</span> {spot.plate || "N/A"}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {adminMode ? (
          <>
            <Button>Force Release</Button>
            <Button variant="secondary">Mark Defective</Button>
            <Button variant="secondary">Manual Reservation</Button>
          </>
        ) : (
          <>
            <Button>Reserve Spot</Button>
            <Button variant="secondary">Estimated cost: 10 RON</Button>
          </>
        )}
      </div>
    </div>
  );
}
