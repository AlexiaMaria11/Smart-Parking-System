import "./Dashboard.css";

export function NotificationPanel({ notifications }) {
  return (
    <div className="notification-panel">
      <p className="panel-eyebrow">Important notifications</p>
      <div className="notification-list">
        {notifications.map((item) => (
          <div key={item.title} className="notification-item">
            <h4 className="notification-title">{item.title}</h4>
            <p className="notification-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
