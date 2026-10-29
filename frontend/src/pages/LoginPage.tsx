import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';
import { KindlyRateBrand } from '../components/Logos.js';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal.js';
import { GoogleAuthButton } from '../components/GoogleAuthButton.js';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [initialResetToken, setInitialResetToken] = useState<string | undefined>(undefined);

  // Automatically detect ?resetToken=xxx&email=xxx from direct email links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('resetToken');
      const emailParam = params.get('email');
      if (tokenParam) {
        setInitialResetToken(tokenParam);
        if (emailParam) {
          setEmail(emailParam);
        }
        setShowForgotPassword(true);
      }
    } catch {
      // ignore
    }
  }, []);

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

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setEmail('demo@kindlyrate.com');
      setPassword('DemoRate2026!');
      const res = await api.login({ email: 'demo@kindlyrate.com', password: 'DemoRate2026!' });
      onLoginSuccess(res.user, res.businesses);
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please try again.');
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
          title="Return to KindlyRate Home"
        >
          <KindlyRateBrand iconSize={34} fontSize={22} />
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
          {/* Quick Tab Switcher between Sign In and Sign Up */}
          <div style={{ display: 'flex', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px', marginBottom: '22px' }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13.5px',
                fontWeight: 700,
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                cursor: 'default',
              }}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13.5px',
                fontWeight: 600,
                background: 'transparent',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              🚀 New Here? Sign Up
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 className="serif serif-h1" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.25 }}>
              Sign In to KindlyRate
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
              Access your business analytics, customer reviews, and growth center.
            </p>
          </div>

          {/* 1-Click Instant Demo Login */}
          <div style={{ marginBottom: '18px' }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: '#fef3c7',
                border: '1.5px solid #f59e0b',
                borderRadius: '10px',
                color: '#92400e',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
              }}
            >
              <span>⚡ 1-Click Demo Login (Priya Sharma Demo Store)</span>
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Continue with Google One-Click Authentication */}
          <div style={{ marginBottom: '18px' }}>
            <GoogleAuthButton
              label="Continue with Google"
              flow="login"
              onSuccess={(res) => onLoginSuccess(res.user, res.businesses)}
              onError={(err) => setError(err)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
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
            By signing in, you agree to KindlyRate's{' '}
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

          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Don't have a business account yet?{' '}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRegister();
              }}
              style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline' }}
            >
              Sign Up Free &amp; Create Account →
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

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={email}
        initialToken={initialResetToken}
        onSuccessLogin={(user, businesses) => {
          onLoginSuccess(user, businesses);
        }}
      />
    </div>
  );
};
