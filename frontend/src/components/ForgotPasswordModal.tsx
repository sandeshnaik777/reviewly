import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Terminal,
  X,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialToken?: string;
  onSuccessLogin?: (user: any, businesses: any[]) => void;
}

export const ForgotPasswordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialEmail = '',
  initialToken = '',
  onSuccessLogin,
}) => {
  const [step, setStep] = useState<'EMAIL' | 'RESET' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [cooldown, setCooldown] = useState(0);

  // Sync props when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialEmail) setEmail(initialEmail);
      if (initialToken) {
        setToken(initialToken);
        setStep('RESET');
      } else {
        setStep('EMAIL');
      }
    }
  }, [isOpen, initialEmail, initialToken]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  // Step 1: Request 6-digit OTP code & link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.forgotPassword(email);
      if (res?.devOtp) setDevOtp(res.devOtp);
      if (res?.devToken) setToken(res.devToken);
      setCooldown(60);
      setStep('RESET');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.forgotPassword(email);
      if (res?.devOtp) setDevOtp(res.devOtp);
      if (res?.devToken) setToken(res.devToken);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP and Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token && (!otp || otp.trim().length !== 6)) {
      setError('Please enter the 6-digit reset code sent to your email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type your new password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.resetPassword({
        email,
        otp: otp ? otp.trim() : undefined,
        token: token || undefined,
        newPassword,
      });

      setStep('SUCCESS');

      // If parent provided auto-login callback and response includes user & businesses
      if (onSuccessLogin && res?.user) {
        setTimeout(() => {
          onSuccessLogin(res.user, res.businesses || []);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px 24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* STEP 1: Enter Email */}
        {step === 'EMAIL' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--surface-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <Key size={26} color="var(--primary)" />
              </div>
              <h2 className="serif" style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                Forgot Your Password?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Enter the email address registered with your KindlyRate account. We will send you a 6-digit recovery code.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '12.5px', padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRequestReset}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '12.5px' }}>Registered Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="owner@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px', fontSize: '14px' }}
                    autoFocus
                  />
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  'Send Reset Code →'
                )}
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Enter OTP & Set New Password */}
        {step === 'RESET' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Lock size={24} color="#d97706" />
              </div>
              <h2 className="serif" style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                Create New Password
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                We sent a 6-digit recovery code to:
                <br />
                <strong style={{ color: 'var(--text)' }}>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '12.5px', padding: '10px 14px' }}>
                {error}
              </div>
            )}

            {/* Dev Mode OTP Auto-Fill Badge */}
            {devOtp && (
              <div
                onClick={() => setOtp(devOtp)}
                style={{
                  background: '#eff6ff',
                  border: '1px dashed #3b82f6',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                title="Click to automatically fill code"
              >
                <Terminal size={13} />
                <span>Dev Code: <strong style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>{devOtp}</strong> (Click to fill)</span>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              {/* 6-Digit Code Input */}
              {!token && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>6-Digit Recovery Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    className="form-input"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 700,
                      letterSpacing: '8px',
                      padding: '8px 14px',
                    }}
                    autoFocus
                  />
                </div>
              )}

              {/* New Password */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>New Password (8+ characters)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ padding: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Reset Password & Sign In →'
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RefreshCw size={12} />
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Change Email
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h2 className="serif" style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#166534' }}>
              Password Reset Successfully!
            </h2>
            <p style={{ fontSize: '13.5px', color: '#15803d', margin: '0 0 24px', lineHeight: 1.5 }}>
              Your account password has been updated. You can now use your new password to sign in to KindlyRate anytime.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={onClose}
              style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}
            >
              Back to Sign In →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
