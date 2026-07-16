import './ActivityFeed.css';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

export default function ActivityFeed({ activities, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: 11, width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '1.5rem' }}>
        <div className="empty-state-icon">📋</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No activity yet. Start practicing!</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map(item => (
        <div key={item.id} className="activity-item">
          <div className="activity-icon-wrap">{item.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
          <span className="text-xs text-muted" style={{ flexShrink: 0 }}>{timeAgo(item.time)}</span>
        </div>
      ))}
    </div>
  );
}
