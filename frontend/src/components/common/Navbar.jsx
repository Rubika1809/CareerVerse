import { useState } from 'react';
import { MdMenu, MdNotifications, MdSearch, MdSettings, MdPerson } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Analyzer',
  '/interview': 'Mock Interview',
  '/aptitude': 'Aptitude Practice',
  '/companies': 'Company Preparation',
  '/certificates': 'Certificate Manager',
  '/admin': 'Admin Dashboard',
  '/admin/students': 'Manage Students',
  '/admin/questions': 'Manage Questions',
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const currentPath = '/' + location.pathname.split('/').slice(1, 3).join('/');
  const title = pageTitles[location.pathname] || pageTitles[currentPath] || 'CareerVerse';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu" id="navbar-menu-btn">
          <MdMenu size={22} />
        </button>
        <div className="navbar-title">
          <h1>{title}</h1>
        </div>
      </div>

      <div className="navbar-center">
        <div className="navbar-search">
          <MdSearch size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Search modules, companies..."
            className="search-input"
            id="navbar-search"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" id="navbar-notifications">
          <MdNotifications size={20} />
          <span className="notif-dot" />
        </button>

        <div className="navbar-profile" onClick={() => setShowProfile(p => !p)}>
          <div className="avatar avatar-sm">
            {user?.avatar || user?.name?.[0] || 'U'}
          </div>
          <div className="navbar-profile-info">
            <span className="profile-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <span className="profile-role">{user?.role || 'Student'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
