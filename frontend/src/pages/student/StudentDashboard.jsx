import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MdDescription, MdPsychology, MdQuiz, MdBusiness, MdCardMembership,
  MdTrendingUp, MdCheckCircle, MdArrowForward, MdSchedule, MdWarning, MdLightbulb
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/mockService';
import StatCard from '../../components/dashboard/StatCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import ProgressRing from '../../components/dashboard/ProgressRing';
import './StudentDashboard.css';

const quickActions = [
  { path: '/resume', icon: MdDescription, label: 'Analyze Resume', color: '#2563EB', bg: '#EFF6FF' },
  { path: '/interview', icon: MdPsychology, label: 'Mock Interview', color: '#10B981', bg: '#ECFDF5' },
  { path: '/aptitude', icon: MdQuiz, label: 'Aptitude Test', color: '#F59E0B', bg: '#FFFBEB' },
  { path: '/companies', icon: MdBusiness, label: 'Company Prep', color: '#7C3AED', bg: '#F5F3FF' },
  { path: '/certificates', icon: MdCardMembership, label: 'Certificates', color: '#EF4444', bg: '#FEF2F2' },
];

const upcomingTasks = [
  { id: 1, title: 'Complete TCS Mock Interview', due: 'Today', priority: 'high' },
  { id: 2, title: 'Quantitative Aptitude – Chapter 5', due: 'Tomorrow', priority: 'medium' },
  { id: 3, title: 'Upload NPTEL Certificate', due: 'This week', priority: 'low' },
  { id: 4, title: 'Update Resume with New Project', due: 'This week', priority: 'medium' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats(user?.id).then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const progress = stats?.placementProgress ?? user?.placementProgress ?? 0;

  return (
    <div className="page-container">
      {/* Welcome Card */}
      <div className="welcome-card animate-slideUp">
        <div className="welcome-content">
          <div>
            <p className="welcome-greeting">{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
            <h2 className="welcome-title">Ready to ace your placements?</h2>
            <p className="welcome-sub">
              {user?.college} · {user?.branch} · {user?.year}
            </p>
            <div className="welcome-actions">
              <Link to="/interview" className="btn btn-primary" id="start-interview-btn">
                <MdPsychology size={18} /> Start Mock Interview
              </Link>
              <Link to="/resume" className="btn btn-secondary" id="analyze-resume-btn">
                <MdDescription size={18} /> Analyze Resume
              </Link>
            </div>
          </div>
          <div className="welcome-progress">
            <ProgressRing value={progress} size={120} label="Placement" sublabel="Readiness" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))
        ) : (
          <>
            <StatCard icon={MdPsychology} label="Interviews Done" value={stats?.totalInterviews ?? 0} color="#2563EB" bg="#EFF6FF" trend="+2 this week" />
            <StatCard icon={MdQuiz} label="Aptitude Tests" value={stats?.aptitudeAttempts ?? 0} color="#10B981" bg="#ECFDF5" trend="+5 this week" />
            <StatCard icon={MdCardMembership} label="Certificates" value={stats?.totalCertificates ?? 0} color="#F59E0B" bg="#FFFBEB" trend="Verified" />
            <StatCard icon={MdTrendingUp} label="Avg Interview Score" value={`${stats?.avgInterviewScore ?? 0}%`} color="#7C3AED" bg="#F5F3FF" trend="Keep practicing!" />
          </>
        )}
      </div>

      {/* Latest Resume Analysis Card */}
      {stats?.latestResume && (
        <div className="card animate-slideUp" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
              <MdDescription /> Latest AI Resume Analysis
            </h3>
            <span className="badge badge-success">Parsed: {new Date(stats.latestResume.analyzedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="resume-dashboard-content" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Candidate Name (from resume)</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{stats.latestResume.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Resume Score</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>{stats.latestResume.score}/100</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-wider">ATS Match Score</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--success)' }}>{stats.latestResume.atsScore}/100</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-wider" style={{ marginBottom: '0.5rem' }}>Extracted Skills</p>
                <div className="skill-tags">
                  {stats.latestResume.foundSkills.slice(0, 10).map(s => (
                    <span key={s} className="skill-tag skill-tag--found" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{s}</span>
                  ))}
                  {stats.latestResume.foundSkills.length > 10 && <span className="text-xs text-muted">+{stats.latestResume.foundSkills.length - 10} more</span>}
                  {stats.latestResume.foundSkills.length === 0 && <span className="text-xs text-muted">None Extracted</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold tracking-wider" style={{ marginBottom: '0.5rem' }}>Missing Skills</p>
                <div className="skill-tags">
                  {stats.latestResume.missingSkills.slice(0, 6).map(s => (
                    <span key={s} className="skill-tag skill-tag--missing" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{s}</span>
                  ))}
                  {stats.latestResume.missingSkills.length === 0 && <span className="text-xs text-muted">None Missing</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#F0FDF4', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid #BBF7D0' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ marginBottom: '0.375rem', color: '#166534' }}>Strengths</p>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {stats.latestResume.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: '#FFF7ED', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid #FFEDD5' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ marginBottom: '0.375rem', color: '#9A3412' }}>Weaknesses</p>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#9A3412', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {stats.latestResume.weaknesses.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>

            {stats.latestResume.recommendations.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <p className="text-xs text-muted uppercase font-bold tracking-wider" style={{ marginBottom: '0.5rem' }}>Personalized Recommendations</p>
                <div className="skill-tags">
                  {stats.latestResume.recommendations.map(r => (
                    <span key={r} className="skill-tag" style={{ background: 'var(--primary-50)', color: 'var(--primary-dark)', borderColor: 'var(--primary-200)', border: '1px solid', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <Link key={action.path} to={action.path} className="quick-action-item" id={`quick-action-${action.label.toLowerCase().replace(/ /g, '-')}`}>
                <div className="quick-action-icon" style={{ background: action.bg, color: action.color }}>
                  <action.icon size={22} />
                </div>
                <span className="quick-action-label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Placement Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Placement Progress</h3>
            <span className="badge badge-primary">{progress}%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Resume Quality', val: stats?.resumeScore ?? user?.resumeScore ?? 0, color: 'primary' },
              { label: 'Technical Skills', val: Math.min(100, (stats?.totalInterviews ?? 0) * 15 + 20), color: '' },
              { label: 'Aptitude Score', val: Math.min(100, (stats?.aptitudeAttempts ?? 0) * 12 + 15), color: 'success' },
              { label: 'Certificates', val: Math.min(100, (stats?.totalCertificates ?? 0) * 20), color: 'warning' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted">{item.val}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${item.color}`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Tasks</h3>
            <MdSchedule size={18} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className={`task-priority priority-${task.priority}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-xs text-muted">{task.due}</p>
                </div>
                <MdCheckCircle size={16} color="var(--border)" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <Link to="/interview" className="text-sm text-primary-color">View All →</Link>
          </div>
          <ActivityFeed activities={stats?.recentActivity ?? []} loading={loading} />
        </div>
      </div>

      {/* Company Shortcuts */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <h3 className="section-title">Prepare for Top Companies</h3>
          <Link to="/companies" className="btn btn-sm btn-outline">
            View All <MdArrowForward size={16} />
          </Link>
        </div>
        <div className="company-shortcuts">
          {[
            { name: 'TCS', color: '#2563EB', bg: '#EFF6FF', package: '3.5 LPA' },
            { name: 'Infosys', color: '#10B981', bg: '#ECFDF5', package: '3.6 LPA' },
            { name: 'Accenture', color: '#7C3AED', bg: '#F5F3FF', package: '4.5 LPA' },
            { name: 'Capgemini', color: '#F59E0B', bg: '#FFFBEB', package: '4.0 LPA' },
          ].map(c => (
            <Link key={c.name} to={`/companies/${c.name.toLowerCase()}`} className="company-shortcut" id={`company-${c.name.toLowerCase()}`}>
              <div className="company-shortcut-avatar" style={{ background: c.bg, color: c.color }}>
                {c.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-muted">{c.package}</p>
              </div>
              <MdArrowForward size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
