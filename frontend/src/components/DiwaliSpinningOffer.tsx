import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Zap, CheckCircle2, Award, Flame, Gift } from 'lucide-react';

interface Props {
  onClaimTrial: () => void;
  onViewAllPlans: () => void;
  offerTimeLeft: { hours: number; minutes: number; seconds: number };
}

export const DiwaliSpinningOffer: React.FC<Props> = ({
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
    { label: '₹79 Trial Pass', discount: '84% OFF', color: '#ea580c' },
    { label: 'Growth Pack', discount: '85% OFF', color: '#b45309' },
    { label: '2 Months Free', discount: 'Annual', color: '#047857' },
    { label: 'VIP Support', discount: 'Free', color: '#6d28d9' },
    { label: '₹79 Launch Pass', discount: '84% OFF', color: '#c2410c' },
    { label: 'Scale Pro', discount: '83% OFF', color: '#b91c1c' },
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
    }, 3600);
  };

  return (
    <div
      className="card dashboard-card-responsive"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fff7ed 100%)',
        border: '2px solid #f59e0b',
        padding: '24px 26px',
        marginBottom: '24px',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.16)',
      }}
    >
      {/* Top Banner Tag & Countdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.4px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            }}
          >
            <Flame size={13} color="#ffffff" />
            <span>FESTIVE FLASH SALE</span>
          </span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#78350f',
              color: '#fef3c7',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'monospace',
            }}
          >
            <Clock size={13} color="#fde047" />
            <span>ENDS IN:</span>
            <span style={{ color: '#fef08a', background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: '4px' }}>
              {offerTimeLeft.hours}h : {offerTimeLeft.minutes}m : {offerTimeLeft.seconds}s
            </span>
          </div>
        </div>

        <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} color="#ea580c" />
          <span>Interactive Lucky Wheel</span>
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        {/* Left Side: Offer Information / Prize Announcement */}
        <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
          {!showPrize ? (
            <div>
              <h3 className="serif" style={{ fontSize: '24px', fontWeight: 800, color: '#78350f', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                Spin the Festive Gear to Unlock Your Secret Discount
              </h3>
              <p style={{ fontSize: '13.5px', color: '#92400e', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                Every merchant is guaranteed a special festive deal up to 85% off. Tap the gear below to reveal your voucher!
              </p>
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
                  padding: '11px 22px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isSpinning ? 'wait' : 'pointer',
                }}
              >
                <Sparkles size={16} color="#ffffff" />
                <span>{isSpinning ? 'Spinning Gear...' : 'Spin & Reveal Discount →'}</span>
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', border: '1px solid #86efac', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                <CheckCircle2 size={13} color="#16a34a" />
                <span>OFFER UNLOCKED: 84% OFF APPLIED</span>
              </div>
              <h3 className="serif" style={{ fontSize: '24px', fontWeight: 800, color: '#78350f', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                Testing Pass Activated for Just <span style={{ textDecoration: 'line-through', color: '#b91c1c', fontSize: '18px' }}>₹499</span>{' '}
                <span style={{ color: '#ea580c', fontSize: '28px' }}>₹79</span>
              </h3>
              <p style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Complete 30-day access, smart acrylic counter stand shipped to your address, and 100 verified Google review generations.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={onClaimTrial}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
                    padding: '11px 20px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Zap size={15} color="#ffffff" />
                  <span>Claim ₹79 Deal Now →</span>
                </button>

                <button
                  type="button"
                  onClick={onViewAllPlans}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #d97706',
                    color: '#92400e',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All Plans (2 Mos Free) →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: The Spinning Gear Wheel */}
        <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Wheel Pointer */}
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              zIndex: 10,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '16px solid #b91c1c',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />

          {/* Rotating Gear / Wheel */}
          <div
            onClick={!showPrize ? handleSpin : undefined}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              cursor: !showPrize && !isSpinning ? 'pointer' : 'default',
              boxShadow: '0 6px 20px rgba(120, 53, 15, 0.25), inset 0 0 0 4px #fef08a, inset 0 0 0 7px #78350f',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              background: 'conic-gradient(#ea580c 0deg 60deg, #d97706 60deg 120deg, #059669 120deg 180deg, #7c3aed 180deg 240deg, #c2410c 240deg 300deg, #dc2626 300deg 360deg)',
            }}
          >
            {/* Gear Teeth Visual Outline */}
            <div
              style={{
                position: 'absolute',
                inset: '0',
                border: '6px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
              }}
            />

            {/* Segment Labels */}
            {segments.map((seg, idx) => {
              const angle = idx * 60 + 30;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0% 0%',
                    transform: `rotate(${angle}deg) translate(28px, -50%)`,
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {seg.label}
                </div>
              );
            })}

            {/* Center Gear Hub */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#78350f',
                border: '3px solid #fef08a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                zIndex: 5,
              }}
            >
              <Award size={20} color="#fde047" />
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, marginTop: '10px' }}>
            {!showPrize ? 'Click Gear to Spin' : 'Voucher DIWALI84 Active'}
          </div>
        </div>
      </div>
    </div>
  );
};
