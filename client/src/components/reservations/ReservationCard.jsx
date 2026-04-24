import { Button } from "../common/Button";

export function ReservationCard({ reservation }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{reservation.status}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{reservation.spot}</h3>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>Date: {reservation.date}</p>
            <p>Time: {reservation.interval}</p>
            <p>Vehicle: {reservation.vehicle}</p>
            <p>Cost: {reservation.cost}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">View Details</Button>
          <Button variant="secondary">Extend</Button>
          <Button variant="secondary">Rebook</Button>
          <Button>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
