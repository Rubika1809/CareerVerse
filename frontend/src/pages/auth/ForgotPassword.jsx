import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { toast } from 'react-toastify';
import { authService } from '../../services/mockService';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
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
          {['Secure Account Recovery', 'Email Verification', 'Quick Password Reset', '24/7 Support Available'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          {!sent ? (
            <>
              <div className="auth-card-header">
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
              </div>
              <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">Email Address</label>
                  <div className="input-icon-wrapper">
                    <MdEmail className="input-icon" size={18} />
                    <input
                      id="forgot-email"
                      type="email"
                      className={`form-control input-with-icon ${error ? 'error' : ''}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                    />
                  </div>
                  {error && <span className="form-error">{error}</span>}
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" id="forgot-submit-btn" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth-redirect">
                <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  <MdArrowBack size={16} /> Back to Login
                </Link>
              </p>
            </>
          ) : (
            <div className="empty-state" style={{ paddingTop: '1rem' }}>
              <div style={{ width: 64, height: 64, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <MdCheckCircle size={32} color="var(--success)" />
              </div>
              <h3>Email Sent!</h3>
              <p>We've sent password reset instructions to <strong>{email}</strong>. Check your inbox.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
