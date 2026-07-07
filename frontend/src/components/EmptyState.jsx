export default function EmptyState({ icon = '📦', title, children }) {
  return (
    <div className="empty-state">
      <div className="icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
