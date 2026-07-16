import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdRocketLaunch } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/mockService';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { user, token } = await authService.login(form.email, form.password);
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@careerverse.com', password: 'admin123' });
    else setForm({ email: 'student@careerverse.com', password: 'student123' });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">CV</div>
          <h1>CareerVerse</h1>
          <p>AI Placement Preparation Platform</p>
        </div>
        <div className="auth-features">
          {['AI Resume Analysis', 'Mock Interview Practice', 'Aptitude Test Prep', 'Company Roadmaps'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="auth-stats">
          <div className="auth-stat"><span className="stat-num">50K+</span><span className="stat-label">Students</span></div>
          <div className="auth-stat"><span className="stat-num">95%</span><span className="stat-label">Success Rate</span></div>
          <div className="auth-stat"><span className="stat-num">200+</span><span className="stat-label">Companies</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <MdRocketLaunch size={28} color="var(--primary)" />
            <h2>Welcome Back</h2>
            <p>Sign in to continue your placement journey</p>
          </div>

          {/* Demo credentials */}
          <div className="demo-creds">
            <p className="text-xs text-muted font-medium" style={{ marginBottom: '0.5rem' }}>Quick Demo Login:</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => fillDemo('student')} id="demo-student-btn">Student Demo</button>
              <button className="btn btn-sm btn-outline" onClick={() => fillDemo('admin')} id="demo-admin-btn">Admin Demo</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="login-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <MdEmail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className={`form-control input-with-icon ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <MdLock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-control input-with-icon input-with-icon-right ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                  {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" className="auth-link text-sm">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" id="login-submit-btn" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-redirect">
            Don't have an account? <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
