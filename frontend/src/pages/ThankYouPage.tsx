import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, QrCode, Phone, Sparkles } from 'lucide-react';
import { KindlyRateLogo, KindlyRateIcon } from '../components/Logos.js';

interface ThankYouPageProps {
  businessName?: string;
  onNavigateDashboard?: () => void;
  onNavigateHome?: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  businessName,
  onNavigateDashboard,
  onNavigateHome,
}) => {
  useEffect(() => {
    document.title = 'Order Confirmed — Thank You for Your Purchase | KindlyRate';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface-container)',
          padding: '16px 24px',
        }}
      >
        <div
          className="desktop-container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1080px',
            margin: '0 auto',
          }}
        >
          <div
            onClick={onNavigateHome}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <KindlyRateIcon size={28} />
            <span className="serif" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
              KindlyRate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href="tel:+918123824899"
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <Phone size={14} color="var(--primary)" />
              Helpline: +91 81238 24899
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '640px',
            width: '100%',
            textAlign: 'center',
            padding: '48px 32px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
            borderRadius: '18px',
            border: '2px solid rgba(22, 163, 74, 0.25)',
          }}
        >
          {/* Animated Success Badge */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '3px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.2)',
            }}
          >
            <CheckCircle2 size={44} color="#16a34a" />
          </div>

          <span
            className="stat-pill stat-pill-success"
            style={{
              fontSize: '12px',
              padding: '6px 16px',
              marginBottom: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={13} /> Payment Confirmed &amp; Subscription Active
          </span>

          <h1 className="serif" style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 12px', color: 'var(--text)' }}>
            Thank You for Your Order!
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 28px' }}>
            {businessName ? (
              <>
                Your business <strong>{businessName}</strong> is fully set up. Your smart review generation engine and reputation shield are activated.
              </>
            ) : (
              <>
                Your transaction and subscription have been verified successfully. Your smart review generation engine and reputation defense shield are now fully active.
              </>
            )}
          </p>

          {/* Value Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '32px',
              textAlign: 'left',
            }}
          >
            <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <QrCode size={20} color="var(--primary)" style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Smart QR Stand</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Generated &amp; ready to print/deploy</div>
            </div>

            <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <ShieldCheck size={20} color="#16a34a" style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Reputation Shield</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>100% active to filter 1–3★ ratings</div>
            </div>

            <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Sparkles size={20} color="#eab308" style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '13.5px' }}>AI Review Engine</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Keyword injection ready</div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={onNavigateDashboard}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(154, 64, 24, 0.25)',
              }}
            >
              Open Merchant Dashboard <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onNavigateHome}
              style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}
            >
              Return to KindlyRate Homepage
            </button>
          </div>

          <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Need assistance setting up your physical stands? Contact our concierge at{' '}
            <a href="mailto:sandeshnaik525@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              sandeshnaik525@gmail.com
            </a>{' '}
            or WhatsApp{' '}
            <a href="https://wa.me/918123824899" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 600 }}>
              +91 81238 24899
            </a>.
          </div>
        </div>
      </main>
    </div>
  );
};
