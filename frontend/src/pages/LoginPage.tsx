import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';
import { KindlyRateBrand } from '../components/Logos.js';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal.js';
import { GoogleAuthButton } from '../components/GoogleAuthButton.js';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-canvas)',
        color: 'var(--text)',
        position: 'relative',
      }}
    >
      {/* Top Header with Back to Home Navigation */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          onClick={onNavigateHome}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          title="Return to KindlyRate Home"
        >
          <KindlyRateBrand iconSize={32} fontSize={20} />
        </div>

        <button
          onClick={onNavigateHome}
          className="btn btn-secondary"
          style={{
            fontSize: '13px',
            padding: '7px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Login Card Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 16px',
          position: 'relative',
        }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '430px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Executive Segmented Tab Switcher */}
          <div
            style={{
              display: 'flex',
              borderRadius: '10px',
              background: 'var(--surface-container)',
              border: '1px solid var(--border)',
              padding: '3px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Lock size={13} style={{ color: 'var(--primary)' }} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 500,
                background: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'color 0.15s ease',
              }}
            >
              <UserCheck size={13} />
              <span>Sign Up</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                color: 'var(--text)',
                margin: '0 0 6px',
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
              Sign in to manage your Google Reviews, QR stands, and store analytics.
            </p>
          </div>

          {error && (
            <div
              className="alert alert-error"
              style={{
                marginBottom: '18px',
                fontSize: '13px',
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              {error}
            </div>
          )}

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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label
                className="form-label"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  minHeight: '44px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-container)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  className="form-label"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: 0,
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12.5px',
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
                style={{
                  minHeight: '44px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-container)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{
                minHeight: '46px',
                fontSize: '14.5px',
                fontWeight: 700,
                borderRadius: '9px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(154, 64, 24, 0.25)',
              }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Terms & Privacy Policy Legal Agreement Notice */}
          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
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
                fontSize: '12px',
                fontWeight: 600,
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
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Privacy Policy
            </button>
            .
          </div>

          <div
            style={{
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '13.5px',
              color: 'var(--text-muted)',
            }}
          >
            Don't have a business account yet?{' '}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRegister();
              }}
              style={{
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Trust & Security Micro-Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--text-subtle)',
              marginTop: '18px',
            }}
          >
            <ShieldCheck size={13} style={{ color: 'var(--success)' }} />
            <span>256-bit SSL encrypted · Official Google Partner Flow</span>
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
