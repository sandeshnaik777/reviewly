import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Zap, CheckCircle2, Award, Flame, Gift, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onClaimTrial: () => void;
  onViewAllPlans: () => void;
  offerTimeLeft: { hours: number | string; minutes: number | string; seconds: number | string };
}

export const DiwaliSpinningOffer: React.FC<Props> = ({
  isOpen,
  onClose,
  onClaimTrial,
  onViewAllPlans,
  offerTimeLeft,
}) => {
  const [hasSpun, setHasSpun] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kindlyrate_festive_spun') === 'true';
    }
    return false;
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState<number>(() => (hasSpun ? 1860 : 0));
  const [showPrize, setShowPrize] = useState<boolean>(hasSpun);

  const segments = [
    { label: '₹79 Launch Pass', discount: '84% OFF', bg: '#dc2626', text: '#ffffff' },
    { label: 'Growth Pack', discount: '85% OFF', bg: '#d97706', text: '#ffffff' },
    { label: '2 Mos Free', discount: 'Annual', bg: '#059669', text: '#ffffff' },
    { label: 'VIP Onboarding', discount: 'Free', bg: '#7c3aed', text: '#ffffff' },
    { label: '₹79 Testing Pass', discount: '84% OFF', bg: '#ea580c', text: '#ffffff' },
    { label: 'Scale Pro', discount: '83% OFF', bg: '#2563eb', text: '#ffffff' },
  ];

  const handleSpin = () => {
    if (isSpinning || showPrize) return;
    setIsSpinning(true);

    // Spin 5 full turns (1800 deg) + land on ₹79 segment (60 deg)
    const targetRotation = rotation + 1800 + 60;
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setShowPrize(true);
      setHasSpun(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kindlyrate_festive_spun', 'true');
      }
    }, 3800);
  };

  const handleClaim = () => {
    onClose();
    onClaimTrial();
  };

  const handleViewPlans = () => {
    onClose();
    onViewAllPlans();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(9, 13, 22, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'linear-gradient(150deg, #181d2f 0%, #111827 50%, #1a162b 100%)',
          border: '2px solid rgba(245, 158, 11, 0.55)',
          borderRadius: '24px',
          padding: '28px 24px',
          maxWidth: '520px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(245, 158, 11, 0.22)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSpinning ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Close dialog"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Top Tag & Timer Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span
            style={{
              background: 'linear-gradient(90deg, #ea580c 0%, #dc2626 100%)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
            }}
          >
            <Flame size={13} color="#ffffff" />
            <span>FESTIVE LUCKY WHEEL</span>
          </span>

          <span
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'monospace',
            }}
          >
            <Clock size={12} />
            <span>{offerTimeLeft.hours}h : {offerTimeLeft.minutes}m : {offerTimeLeft.seconds}s</span>
          </span>
        </div>

        <h3
          className="serif"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '4px 0 6px',
            background: 'linear-gradient(135deg, #ffffff 30%, #fef08a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.3px',
          }}
        >
          {showPrize ? 'Congratulations! Offer Unlocked' : 'Spin to Unlock Your Festive Offer'}
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 auto 18px', maxWidth: '420px', lineHeight: 1.5 }}>
          {showPrize
            ? 'Your 84% discount has been unlocked! Claim your ₹79 Launch Pass or apply savings across any plan.'
            : 'Tap the wheel below to spin. Every spin is guaranteed to unlock up to 85% OFF your review automation setup.'}
        </p>

        {/* The Wheel Container */}
        <div style={{ position: 'relative', width: '270px', height: '270px', margin: '0 auto 20px' }}>
          {/* Golden Pointer Indicator (Top Center) */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '24px solid #f59e0b',
              }}
            />
          </div>

          {/* Wheel Frame & Outer Rim */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              padding: '7px',
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #78350f 100%)',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.45), inset 0 0 12px rgba(0,0,0,0.4)',
              position: 'relative',
            }}
          >
            {/* Spinning Disc */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.95, 0.25, 1.0)' : 'none',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
                {segments.map((seg, i) => {
                  const angle = 360 / segments.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const rad1 = (startAngle * Math.PI) / 180;
                  const rad2 = (endAngle * Math.PI) / 180;

                  const x1 = 50 + 50 * Math.sin(rad1);
                  const y1 = 50 - 50 * Math.cos(rad1);
                  const x2 = 50 + 50 * Math.sin(rad2);
                  const y2 = 50 - 50 * Math.cos(rad2);

                  const path = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text position along bisector
                  const midAngle = (startAngle + endAngle) / 2;
                  const textRad = (midAngle * Math.PI) / 180;
                  const tx = 50 + 32 * Math.sin(textRad);
                  const ty = 50 - 32 * Math.cos(textRad);

                  return (
                    <g key={i}>
                      <path d={path} fill={seg.bg} stroke="#fbbf24" strokeWidth="0.8" />
                      <text
                        x={tx}
                        y={ty}
                        fill={seg.text}
                        fontSize="3.6"
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)', letterSpacing: '0.2px' }}
                      >
                        {seg.discount}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spinning Hub Button */}
            <div
              onClick={handleSpin}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #9a3412 100%)',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSpinning || showPrize ? 'default' : 'pointer',
                zIndex: 20,
                userSelect: 'none',
              }}
            >
              <Sparkles size={14} color="#78350f" />
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#78350f', letterSpacing: '0.4px', lineHeight: 1 }}>
                {isSpinning ? '...' : showPrize ? 'WON' : 'SPIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Prize Box or Spin CTA */}
        {showPrize ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '16px',
              padding: '16px 18px',
              marginBottom: '16px',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <Award size={18} color="#fbbf24" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                WINNER · 84% OFF PASS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', margin: '6px 0' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#f97316' }}>₹79</span>
              <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>₹499</span>
              <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                SAVE ₹420 TODAY
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '14px' }}>
              Includes 100 AI Google Reviews, 2 Acrylic Counter QR Stands & 30-Day Reputation Shield.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleClaim}
                style={{
                  background: 'linear-gradient(90deg, #ea580c 0%, #dc2626 100%)',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 800,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Zap size={16} />
                <span>Claim ₹79 Launch Pass Now →</span>
              </button>

              <button
                type="button"
                onClick={handleViewPlans}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e2e8f0',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  padding: '9px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                Or Apply Discount to Growth / Annual Plans (2 Mos Free) →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={isSpinning}
              onClick={handleSpin}
              style={{
                background: 'linear-gradient(90deg, #ea580c 0%, #dc2626 100%)',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                padding: '12px 22px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.75 : 1,
              }}
            >
              <Sparkles size={16} />
              <span>{isSpinning ? 'Spinning Lucky Wheel...' : 'Tap to Spin the Lucky Wheel →'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSpinning}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12.5px',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                padding: '4px',
              }}
            >
              Maybe Later
            </button>
          </div>
        )}

        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>
          Instant UPI / Card activation via Razorpay · Physical QR stands dispatched within 24 hours
        </div>
      </div>
    </div>
  );
};
