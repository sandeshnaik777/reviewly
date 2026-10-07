import React, { useState } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';

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

  const fillDemoMerchant = () => {
    setEmail('saffron.bistro@test.com');
    setPassword('SecurePassword123!');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@reviewplatform.local');
    setPassword('AdminSecurePassword123!');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf8f5' }}>
      {/* Top Header with Back to Home Navigation */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          onClick={onNavigateHome}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          title="Return to Reviewly Home"
        >
          <span style={{ fontSize: '22px' }}>⭐</span>
          <span className="serif" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Reviewly
          </span>
        </div>

        <button
          onClick={onNavigateHome}
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Home
        </button>
      </header>

      {/* Main Login Card Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              ← Back to Home
            </button>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '11px' }}>
              Merchant Portal
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 className="serif" style={{ fontSize: '28px', fontWeight: 700 }}>
              Sign in to Reviewly
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
              Access your restaurant analytics and reputation command center.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Quick Demo Credentials Autofill Helper */}
          <div
            style={{
              background: 'var(--surface-container)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              ⚡ 1-Click Demo Logins:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={fillDemoMerchant}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                🍴 Saffron Bistro Owner
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                🛡️ Super Admin
              </button>
            </div>
          </div>

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
            By signing in, you agree to Reviewly's{' '}
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
              Start 7-Day Free Trial
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
