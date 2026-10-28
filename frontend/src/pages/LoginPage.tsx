import React, { useState } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';
import { KindlyReviewBrand } from '../components/Logos.js';

interface Props {
  onLoginSuccess: (user: any, businesses: any[]) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onNavigateRegister, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.login({ email, password });
      onLoginSuccess(res.user, res.businesses);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf8f5' }}>
      {/* Top Header with Back to Home Navigation */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          onClick={onNavigateHome}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          title="Return to KindlyReview Home"
        >
          <KindlyReviewBrand iconSize={34} fontSize={22} />
        </div>

        <button
          onClick={onNavigateHome}
          className="btn btn-secondary"
          style={{ fontSize: '12.5px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Home
        </button>
      </header>

      {/* Main Login Card Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 14px' }}>
        <div className="wizard-card" style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '11px', padding: '4px 12px' }}>
              ● Merchant Command Portal
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1 className="serif serif-h1" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.25 }}>
              Sign in to KindlyReview
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
              Access your restaurant analytics and reputation command center.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="owner@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Sign In →'}
            </button>
          </form>

          {/* Terms & Privacy Policy Legal Agreement Notice */}
          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            By signing in, you agree to KindlyReview's{' '}
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11.5px',
                fontWeight: 500,
              }}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11.5px',
                fontWeight: 500,
              }}
            >
              Privacy Policy
            </button>.
          </div>

          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have a business account yet?{' '}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRegister();
              }}
              style={{ fontWeight: 600 }}
            >
              Start Testing Pack (₹79 Trial)
            </a>
          </div>

          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Return to Public Homepage
            </button>
          </div>
        </div>
      </div>

      {legalModal && (
        <LegalModals type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  );
};
