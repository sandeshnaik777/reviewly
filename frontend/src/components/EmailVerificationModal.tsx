import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface EmailVerificationModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDevOtp?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  email,
  isOpen,
  onClose,
  onSuccess,
  initialDevOtp,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(initialDevOtp);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setDigits(['', '', '', '', '', '']);
      if (initialDevOtp) {
        setDevOtp(initialDevOtp);
      }
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen, initialDevOtp]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit entry
    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto advance focus to next input
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    if (index === 5 || newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      if (code.length === 6) {
        submitVerification(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      submitVerification(pasted);
    }
  };

  const submitVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.verifyEmail(code, email);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Incorrect verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setResending(true);
      setError(null);
      const res = await api.sendVerificationOtp(email);
      setCooldown(60);
      if (res?.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  const fillDevOtp = () => {
    if (!devOtp || devOtp.length !== 6) return;
    const split = devOtp.split('');
    setDigits(split);
    submitVerification(devOtp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px 32px',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            fontSize: '22px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px',
            }}
          >
            ✉️
          </div>
          <h2 className="serif" style={{ fontSize: '24px', marginBottom: '8px' }}>
            Verify Your Email
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            We sent a 6-digit confirmation code to:
            <br />
            <strong style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px', fontSize: '13px', padding: '10px 14px' }}>
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '8px',
              padding: '14px',
              color: '#15803d',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            ✓ Email Successfully Verified!
          </div>
        )}

        {/* 6-Digit OTP Boxes */}
        <div
          onPaste={handlePaste}
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading || success}
              style={{
                width: '48px',
                height: '56px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 700,
                borderRadius: '10px',
                border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                background: 'var(--surface-container, #ffffff)',
                color: 'var(--text)',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => {
                if (!digit) e.target.style.borderColor = 'var(--border)';
              }}
            />
          ))}
        </div>

        {/* Development Helper Badge */}
        {devOtp && (
          <div
            onClick={fillDevOtp}
            style={{
              background: '#eff6ff',
              border: '1px dashed #3b82f6',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '12.5px',
              color: '#1d4ed8',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            title="Click to automatically fill code"
          >
            🛠️ <strong>Development Mode:</strong> Your code is{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '2px', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
              {devOtp}
            </span>{' '}
            <span style={{ textDecoration: 'underline', marginLeft: '4px' }}>(Click to auto-fill)</span>
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => submitVerification()}
          disabled={loading || success || digits.some((d) => !d)}
          style={{ padding: '12px', fontSize: '14.5px', marginBottom: '14px' }}
        >
          {loading ? 'Verifying Code...' : success ? '✓ Verified' : 'Verify Email Code →'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || success}
            style={{
              background: 'none',
              border: 'none',
              color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              padding: 0,
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {resending
              ? 'Sending code...'
              : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : '🔄 Resend Verification Code'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
            }}
          >
            Verify Later
          </button>
        </div>
      </div>
    </div>
  );
};
