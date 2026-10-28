import React, { useRef, useState, useEffect } from 'react';
import { GiftIcon, TicketIcon, SparklesIcon, CheckCircleIcon } from './Logos.js';

export interface ScratchCardProps {
  cardType?: 'golden_ticket' | 'neon_glow' | 'festive_confetti' | 'minimal_classic';
  rewardTitle?: string;
  rewardDescription?: string;
  couponCode?: string;
  customLogoUrl?: string;
  businessName?: string;
  winProbability?: number; // 0 - 100
  loseMessage?: string;
  onRevealed?: (won: boolean) => void;
  previewMode?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  cardType = 'golden_ticket',
  rewardTitle = '10% Off Your Next Visit',
  rewardDescription = 'Show this coupon code at checkout or on your next visit!',
  couponCode = 'REVIEW10',
  customLogoUrl,
  businessName = 'Our Business',
  winProbability = 100,
  loseMessage = 'Thank you for your valuable feedback! Better luck next time!',
  onRevealed,
  previewMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Determine if this play is a winner based on probability
  const [isWinner] = useState(() => {
    if (previewMode) return true;
    const roll = Math.random() * 100;
    return roll <= (winProbability ?? 100);
  });

  // Themes Styling Dictionary
  const themeStyles = {
    golden_ticket: {
      cardBg: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
      cardBorder: '2px solid #f59e0b',
      accentColor: '#f59e0b',
      textColor: '#fef3c7',
      subTextColor: '#d6d3d1',
      coverColor: '#d97706',
      coverPattern: '#b45309',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeBorder: '#f59e0b',
      scratchText: 'SCRATCH TO REVEAL GOLDEN TICKET',
    },
    neon_glow: {
      cardBg: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
      cardBorder: '2px solid #8b5cf6',
      accentColor: '#a855f7',
      textColor: '#faf5ff',
      subTextColor: '#a1a1aa',
      coverColor: '#7c3aed',
      coverPattern: '#6d28d9',
      badgeBg: 'rgba(139, 92, 246, 0.25)',
      badgeBorder: '#a855f7',
      scratchText: 'SCRATCH TO REVEAL NEON REWARD',
    },
    festive_confetti: {
      cardBg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      cardBorder: '2px solid #10b981',
      accentColor: '#34d399',
      textColor: '#ecfdf5',
      subTextColor: '#a7f3d0',
      coverColor: '#059669',
      coverPattern: '#047857',
      badgeBg: 'rgba(52, 211, 153, 0.25)',
      badgeBorder: '#34d399',
      scratchText: 'SCRATCH TO REVEAL CELEBRATION PRIZE',
    },
    minimal_classic: {
      cardBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      cardBorder: '2px solid #94a3b8',
      accentColor: '#cbd5e1',
      textColor: '#f8fafc',
      subTextColor: '#94a3b8',
      coverColor: '#334155',
      coverPattern: '#1e293b',
      badgeBg: 'rgba(148, 163, 184, 0.2)',
      badgeBorder: '#94a3b8',
      scratchText: 'SCRATCH TO REVEAL VOUCHER',
    },
  }[cardType] || {
    cardBg: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    cardBorder: '2px solid #f59e0b',
    accentColor: '#f59e0b',
    textColor: '#fef3c7',
    subTextColor: '#d6d3d1',
    coverColor: '#d97706',
    coverPattern: '#b45309',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeBorder: '#f59e0b',
    scratchText: 'SCRATCH TO REVEAL REWARD',
  };

  // Initialize Canvas Foil Layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill background foil
    ctx.fillStyle = themeStyles.coverColor;
    ctx.fillRect(0, 0, width, height);

    // Decorative foil hatched pattern
    ctx.strokeStyle = themeStyles.coverPattern;
    ctx.lineWidth = 3;
    for (let x = -height; x < width + height; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Outer border outline
    ctx.strokeStyle = themeStyles.cardBorder.split(' ')[2] || '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Centered label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(themeStyles.scratchText, width / 2, height / 2 - 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Swipe or click and drag with finger', width / 2, height / 2 + 12);
  }, [cardType, themeStyles]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2, false);
    ctx.fill();

    // Sample pixels periodically to check completion
    checkScratchCompletion();
  };

  const checkScratchCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;

      // Sample every 16th pixel for high performance
      for (let i = 3; i < data.length; i += 64) {
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = Math.round((transparentPixels / (totalPixels / 16)) * 100);
      setScratchPercent(percent);

      if (percent >= 38) {
        revealCard();
      }
    } catch {
      // Fallback
    }
  };

  const revealCard = () => {
    setIsRevealed(true);
    if (onRevealed) {
      onRevealed(isWinner);
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsScratching(false);

  // Touch Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => setIsScratching(false);

  const handleCopyCode = async () => {
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      setCopiedCode(true);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        borderRadius: '16px',
        border: themeStyles.cardBorder,
        background: themeStyles.cardBg,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Top Banner Ribbon */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt={businessName}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: themeStyles.badgeBg,
                border: `1px solid ${themeStyles.badgeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GiftIcon size={16} color={themeStyles.accentColor} />
            </div>
          )}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {businessName}
          </span>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '12px',
            background: themeStyles.badgeBg,
            color: themeStyles.accentColor,
            border: `1px solid ${themeStyles.badgeBorder}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <SparklesIcon size={12} color={themeStyles.accentColor} />
          <span>VIP Reward</span>
        </span>
      </div>

      {/* Card Content & Foil Layer Container */}
      <div
        style={{
          position: 'relative',
          minHeight: '190px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* UNDERNEATH PRIZE (Visible once scratched) */}
        <div
          style={{
            textAlign: 'center',
            width: '100%',
          }}
        >
          {isWinner ? (
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid #22c55e',
                  color: '#4ade80',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                <span>REWARD UNLOCKED</span>
              </div>

              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: themeStyles.textColor,
                  margin: '0 0 6px',
                }}
              >
                {rewardTitle}
              </h3>

              <p
                style={{
                  fontSize: '12.5px',
                  color: themeStyles.subTextColor,
                  margin: '0 0 14px',
                  lineHeight: 1.4,
                }}
              >
                {rewardDescription}
              </p>

              {couponCode && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1.5px dashed ' + themeStyles.accentColor,
                    padding: '8px 14px',
                    borderRadius: '8px',
                  }}
                >
                  <TicketIcon size={18} color={themeStyles.accentColor} />
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#ffffff',
                    }}
                  >
                    {couponCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    style={{
                      background: themeStyles.accentColor,
                      color: '#000000',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedCode ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid #94a3b8',
                  color: '#cbd5e1',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                Feedback Appreciated
              </div>
              <p style={{ color: themeStyles.textColor, fontSize: '13.5px', lineHeight: 1.5 }}>
                {loseMessage}
              </p>
            </div>
          )}
        </div>

        {/* TOP FOIL CANVAS (Scratched away by user) */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            width={340}
            height={190}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
              borderRadius: '0 0 16px 16px',
              touchAction: 'none',
            }}
          />
        )}
      </div>

      {/* Footer Quick Action */}
      {!isRevealed && (
        <div
          style={{
            padding: '8px 16px 12px',
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={revealCard}
            style={{
              background: 'none',
              border: 'none',
              color: themeStyles.subTextColor,
              fontSize: '11.5px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Quick Reveal Prize →
          </button>
        </div>
      )}
    </div>
  );
};
