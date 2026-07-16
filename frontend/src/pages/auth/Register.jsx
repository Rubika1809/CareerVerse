import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdSchool, MdPhone, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/mockService';
import './Auth.css';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('STUDENT');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', year: '', phone: '', cgpa: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.college.trim()) e.college = role === 'ADMIN' ? 'Institution name is required' : 'College name is required';
    if (!form.branch.trim()) e.branch = role === 'ADMIN' ? 'Department is required' : 'Branch is required';
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { user, token } = await authService.register({ ...form, role });
      login(user, token);
      toast.success('Account created successfully! Welcome to CareerVerse 🚀');
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">CV</div>
          <h1>Join CareerVerse</h1>
          <p>Start your placement preparation today</p>
        </div>
        <div className="auth-features">
          {['Smart Resume Analyzer', 'AI Mock Interviews', 'Real Company Preparation', 'Certificate Portfolio'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="auth-stats">
          <div className="auth-stat"><span className="stat-num">Free</span><span className="stat-label">Forever</span></div>
          <div className="auth-stat"><span className="stat-num">10K+</span><span className="stat-label">Questions</span></div>
          <div className="auth-stat"><span className="stat-num">4.8★</span><span className="stat-label">Rating</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Step {step} of 2 – {step === 1 ? 'Basic Information' : (role === 'ADMIN' ? 'Organisation Details' : 'Academic Details')}</p>
          </div>

          {/* Progress */}
          <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
            <div className="progress-fill" style={{ width: step === 1 ? '50%' : '100%', transition: 'width 0.4s ease' }} />
          </div>

          {step === 1 && (
            <>
              {/* Role Selection */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">I am a</label>
                <div className="role-selector">
                  {[
                    { val: 'STUDENT', icon: '🎓', title: 'Student', desc: 'Prepare for placements' },
                    { val: 'ADMIN', icon: '🛡️', title: 'Admin', desc: 'Manage platform' },
                  ].map(r => (
                    <div
                      key={r.val}
                      className={`role-option ${role === r.val ? 'selected' : ''}`}
                      onClick={() => setRole(r.val)}
                      id={`role-${r.val.toLowerCase()}`}
                    >
                      <span className="role-icon">{r.icon}</span>
                      <span className="role-title">{r.title}</span>
                      <span className="role-desc">{r.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <div className="input-icon-wrapper">
                    <MdPerson className="input-icon" size={18} />
                    <input id="reg-name" type="text" className={`form-control input-with-icon ${errors.name ? 'error' : ''}`}
                      placeholder="Arjun Sharma" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email Address</label>
                  <div className="input-icon-wrapper">
                    <MdEmail className="input-icon" size={18} />
                    <input id="reg-email" type="email" className={`form-control input-with-icon ${errors.email ? 'error' : ''}`}
                      placeholder="you@rathinam.edu" value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-pw">Password</label>
                  <div className="input-icon-wrapper">
                    <MdLock className="input-icon" size={18} />
                    <input id="reg-pw" type={showPw ? 'text' : 'password'} className={`form-control input-with-icon input-with-icon-right ${errors.password ? 'error' : ''}`}
                      placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                    <button type="button" className="input-icon-right" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                      {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-cpw">Confirm Password</label>
                  <div className="input-icon-wrapper">
                    <MdLock className="input-icon" size={18} />
                    <input id="reg-cpw" type="password" className={`form-control input-with-icon ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                  </div>
                  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>

                <button type="button" className="btn btn-primary w-full btn-lg" id="reg-next-btn" onClick={handleNext}>Continue →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* ── ADMIN: minimal org fields only ── */}
              {role === 'ADMIN' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-college">Institution / Organisation</label>
                    <div className="input-icon-wrapper">
                      <MdSchool className="input-icon" size={18} />
                      <input id="reg-college" type="text" className={`form-control input-with-icon ${errors.college ? 'error' : ''}`}
                        placeholder="e.g., Rathinam Global University" value={form.college} onChange={e => update('college', e.target.value)} />
                    </div>
                    {errors.college && <span className="form-error">{errors.college}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-branch">Department / Role</label>
                    <select id="reg-branch" className={`form-control ${errors.branch ? 'error' : ''}`}
                      value={form.branch} onChange={e => update('branch', e.target.value)}>
                      <option value="">Select Department</option>
                      {['Training & Placement Cell', 'Computer Science Dept.', 'Information Technology Dept.', 'Electronics Dept.', 'Administration', 'Academic Affairs', 'Other'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.branch && <span className="form-error">{errors.branch}</span>}
                  </div>
                </>
              )}

              {/* ── STUDENT: full academic profile ── */}
              {role === 'STUDENT' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-college">College / University</label>
                    <div className="input-icon-wrapper">
                      <MdSchool className="input-icon" size={18} />
                      <input id="reg-college" type="text" className={`form-control input-with-icon ${errors.college ? 'error' : ''}`}
                        placeholder="e.g., Rathinam Global University" value={form.college} onChange={e => update('college', e.target.value)} />
                    </div>
                    {errors.college && <span className="form-error">{errors.college}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-branch">Branch / Department</label>
                    <select id="reg-branch" className={`form-control ${errors.branch ? 'error' : ''}`}
                      value={form.branch} onChange={e => update('branch', e.target.value)}>
                      <option value="">Select Branch</option>
                      {['Computer Engineering', 'Information Technology', 'Electronics & Telecommunication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Data Science', 'AI & ML', 'Other'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {errors.branch && <span className="form-error">{errors.branch}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-year">Current Year</label>
                      <select id="reg-year" className="form-control" value={form.year} onChange={e => update('year', e.target.value)}>
                        <option value="">Select Year</option>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-cgpa">CGPA</label>
                      <input id="reg-cgpa" type="number" step="0.01" min="0" max="10" className="form-control"
                        placeholder="e.g., 8.5" value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-phone">Phone Number (Optional)</label>
                    <div className="input-icon-wrapper">
                      <MdPhone className="input-icon" size={18} />
                      <input id="reg-phone" type="tel" className="form-control input-with-icon"
                        placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: '0 0 auto' }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary w-full btn-lg" id="reg-submit-btn" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</> : 'Create Account 🚀'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-redirect">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
