import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, color, bg, trend }) {
  return (
    <div className="stat-card animate-slideUp">
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {trend && <p className="stat-trend">{trend}</p>}
      </div>
    </div>
  );
}
