import "./Common.css";

export function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value">{value}</p>
          <p className="stat-card-trend">{trend}</p>
        </div>
        {Icon ? (
          <div className="stat-card-icon">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
