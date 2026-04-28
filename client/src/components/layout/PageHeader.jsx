import "./Layout.css";

export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-description">{description}</p>
      </div>
      {action}
    </div>
  );
}
