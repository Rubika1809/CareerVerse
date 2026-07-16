import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdDescription, MdWork, MdPsychology,
  MdBusiness, MdCardMembership, MdPeople, MdQuiz,
  MdLogout, MdClose, MdAdminPanelSettings
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Sidebar.css';

const studentNav = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { path: '/resume', icon: MdDescription, label: 'Resume Analyzer' },
  { path: '/interview', icon: MdPsychology, label: 'Mock Interview' },
  { path: '/aptitude', icon: MdQuiz, label: 'Aptitude Practice' },
  { path: '/companies', icon: MdBusiness, label: 'Company Prep' },
  { path: '/certificates', icon: MdCardMembership, label: 'Certificates' },
];

const adminNav = [
  { path: '/admin', icon: MdAdminPanelSettings, label: 'Admin Dashboard', end: true },
  { path: '/admin/students', icon: MdPeople, label: 'Manage Students' },
  { path: '/admin/questions', icon: MdQuiz, label: 'Manage Questions' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">CV</div>
        <span className="logo-text">CareerVerse</span>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <MdClose size={18} />
        </button>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="avatar avatar-md" style={{ background: 'var(--primary-100)', color: 'var(--primary)' }}>
          {user?.avatar || user?.name?.[0] || 'U'}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name || 'User'}</p>
          <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-primary'}`}>
            {isAdmin ? 'Admin' : 'Student'}
          </span>
        </div>
      </div>

      <div className="divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">{isAdmin ? 'Administration' : 'Menu'}</p>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Pro Tip</p>
          <p className="text-xs text-secondary" style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
            Practice daily to maximize your placement score!
          </p>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <MdLogout size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
