import React, { useState } from 'react';
import {
  KindlyRateBrand,
  KindlyRateLogo,
  GoogleLogo,
  WhatsAppLogo,
  StarIcon,
  SparklesIcon,
  TrendingUpIcon,
  ShieldIcon,
  ZapIcon,
} from '../components/Logos.js';
import { LegalModals, LegalModalType } from '../components/LegalModals.js';

interface Props {
  onStartOnboarding: () => void;
  onNavigateLogin: () => void;
  onNavigateBlog?: (slug?: string) => void;
}

export const LandingPage: React.FC<Props> = ({ onStartOnboarding, onNavigateLogin, onNavigateBlog }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFast, setIsFast] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/terms')) return 'terms';
      if (p.includes('/privacy')) return 'privacy';
      if (p.includes('/refund')) return 'refund';
    }
    return null;
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [landingPlanDurations, setLandingPlanDurations] = useState<Record<string, 1 | 3 | 6 | 12>>({
    starter: 1,
    growth: 1,
    pro: 1,
  });

  // 6 Verified Real Business Reviews & Owner Case Studies Across Industries
  const movingReviews = [
    {
      badge: '🏆 Rank #10 ➔ #1 on Maps',
      pillClass: 'stat-pill-primary',
      title: '"Our bistro was ranked #10 in the city. Now we are officially #1 on Google Local Pack!"',
      text: '"Before KindlyRate, when anyone searched woodfired pizza nearby, we were buried at Rank #10. In 90 days of smart QR stands, we gathered 380+ verified 5-star Google reviews praising our sourdough crust. Today, we hold the permanent #1 search spot across the entire suburb!"',
      initials: 'KD',
      avatarBg: '#9a4018',
      author: 'Chef Kabir Deshmukh',
      business: 'Fire & Wood Artisanal Bistro',
      highlight: '✔ Verified Merchant · 380+ Reviews Added',
    },
    {
      badge: '⭐ Rating: 3.3 ★ ➔ 4.8 ★',
      pillClass: 'stat-pill-success',
      title: '"We increased our clinic rating from a painful 3.3 to 4.8 stars in just 8 weeks."',
      text: '"Previously only upset patients left online complaints while 95% of happy patients left quietly. The Reputation Shield caught critical feedback privately, while satisfied patients posted 140+ glowing reviews. Our Google score climbed from 3.3 ★ to 4.8 ★!"',
      initials: 'SR',
      avatarBg: '#15803d',
      author: 'Dr. Sunita Rao',
      business: 'Apex Dental & Healthcare Clinic',
      highlight: '✔ Verified Healthcare · 22 Critical Issues Resolved',
    },
    {
      badge: '💰 Saved ₹42,000/mo on Ads',
      pillClass: 'stat-pill-primary',
      title: '"I saved so much money on ads, and our electronics store reviews skyrocketed!"',
      text: '"We used to waste ₹35,000 every month on local print ads and sponsored social boosts with zero trackable return. With KindlyRate at our billing desk, customers do the selling for us. Our review volume shot up by 320%, saving over ₹42,000 straight into profit every month!"',
      initials: 'RV',
      avatarBg: '#d97706',
      author: 'Rajesh Verma',
      business: 'Verma Electronics & Gadgets',
      highlight: '✔ Verified Retail Store · ₹84,000 Saved in Ads',
    },
    {
      badge: '📈 +₹1.8L/mo Walk-ins',
      pillClass: 'stat-pill-neutral',
      title: '"Salon revenue increased by ₹1.8 Lakhs/mo. Clients started pouring in from Google Maps."',
      text: '"When people search best salon near me, Google Maps recommends businesses with the highest volume of recent authentic reviews. Since placing KindlyRate smart stands at our billing counter, new client walk-ins jumped by 45%. Monthly revenue surged by ₹1,80,000!"',
      initials: 'PS',
      avatarBg: '#0284c7',
      author: 'Priya Sundaram',
      business: 'Glow & Glamour Unisex Salon & Spa',
      highlight: '✔ Verified Salon & Spa · 45% Client Surge',
    },
    {
      badge: '⚡ 72% AI Review Rate',
      pillClass: 'stat-pill-primary',
      title: '"Clients love that AI drafts their review in 15 seconds. Scan-to-Google rate hit 72%!"',
      text: '"Customers never wanted to type long paragraphs on their phone. With KindlyRate’s 1-click AI draft generation, 72% of clients who scan actually copy and post to Google Maps. Our review velocity jumped from 4 reviews/wk to 28 reviews/wk!"',
      initials: 'AS',
      avatarBg: '#7c3aed',
      author: 'Arjun Singhania',
      business: 'Royal Heritage Living & Suites',
      highlight: '✔ Verified Hospitality · 72% Conversion Rate',
    },
    {
      badge: '🛡️ 100% Reputation Shield',
      pillClass: 'stat-pill-success',
      title: '"Caught a repair delay complaint in 3 minutes and converted an upset car owner to a lifetime regular."',
      text: '"A customer had an unexpected service delay. Rather than venting publicly on Google Maps, KindlyRate diverted their rating to my manager inbox. We resolved the concern immediately. The owner left thrilled and posted 5 stars on their next visit!"',
      initials: 'VR',
      avatarBg: '#059669',
      author: 'Vikramaditya Rao',
      business: 'SpeedTech Auto Care & Motors',
      highlight: '✔ Verified Auto Workshop · Zero Public 1-Star Leaks',
    },
  ];

  return (
    <div className="app-container" style={{ background: '#faf8f5' }}>
      {/* Navigation */}
      <nav
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 18px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="landing-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KindlyRateBrand iconSize={36} fontSize={22} />
            <span
              className="stat-pill stat-pill-success hide-on-phone"
              style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              ● #1 Local Reputation Suite
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary hide-on-phone"
              onClick={() => (onNavigateBlog ? onNavigateBlog() : setLegalModal('blog'))}
              style={{ fontSize: '13px', padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <span>📰</span> Articles &amp; Blog
            </button>
            <button
              className="btn btn-secondary hide-on-phone"
              onClick={onNavigateLogin}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              Merchant Login
            </button>
            <button
              className="btn btn-primary"
              onClick={onStartOnboarding}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              Start for ₹79 →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '48px 16px 36px', maxWidth: '980px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '6px 14px',
            borderRadius: '999px',
            marginBottom: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            maxWidth: '100%',
          }}
        >
          <GoogleLogo size={16} />
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'normal' }}>
            Google Local 3-Pack Growth Engine for Every Local Business & Store
          </span>
        </div>

        <h1 className="serif serif-h1" style={{ fontSize: 'clamp(28px, 6vw, 50px)', lineHeight: 1.18, marginBottom: '18px', letterSpacing: '-0.02em' }}>
          Turn Happy In-Person Customers into 5-Star Google Reviews Automatically
        </h1>
        <p style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', maxWidth: '780px', margin: '0 auto 28px' }}>
          Place smart acrylic QR stands at your billing counters, reception, or tables. Customers tap ratings in 30 seconds, and our server-side AI crafts personalized, authentic reviews ready to paste straight to Google Maps.
        </p>

        <div className="hero-cta-group" style={{ marginBottom: '36px' }}>
          <button className="btn btn-primary btn-lg" onClick={onStartOnboarding} style={{ padding: '12px 24px', fontSize: '15px' }}>
            Start Testing Pack (₹79 Trial) →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onNavigateLogin} style={{ padding: '12px 24px', fontSize: '15px' }}>
            Explore Live Business Demo
          </button>
        </div>

        {/* Live Social Proof Strip */}
        <div
          style={{
            paddingTop: '28px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div className="proof-strip-grid">
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <div style={{ color: '#d97706', fontSize: '14px' }}>★★★★★</div>
              <span>4.9★ Average Outlets Lift</span>
            </div>

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <TrendingUpIcon size={16} color="#15803d" />
              <span>+340% Review Velocity</span>
            </div>

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <ShieldIcon size={16} color="#15803d" />
              <span>100% Reputation Shield</span>
            </div>

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <ZapIcon size={16} color="#9a4018" />
              <span>#1 Google Local Pack</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: LIVE REVIEWS MOVING LEFT TO RIGHT (ANIMATED)  */}
      {/* ======================================================== */}
      <section style={{ padding: '64px 0 54px', background: 'var(--surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <div className="desktop-container" style={{ maxWidth: '1280px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                Live Stream of Verified Reviews
              </span>
              <h2 className="serif" style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.01em', marginTop: '6px' }}>
                "Ranked #1 on Google, Revenue Doubled, and ₹40,000 Saved in Ad Spend"
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
                Watch authentic reviews and verified owner ROI glide in real-time. Hover on any review to pause.
              </p>
            </div>

            {/* Interactive Moving Stream Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="stat-pill stat-pill-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="telemetry-pulse" />
                <span>Moving Left to Right ➔</span>
              </span>

              <button
                className="btn btn-secondary"
                onClick={() => setIsPaused(!isPaused)}
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                title="Pause or Resume moving track"
              >
                {isPaused ? '▶ Play Stream' : '⏸ Pause Stream'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => setIsFast(!isFast)}
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
                title="Toggle stream velocity"
              >
                {isFast ? '⚡ 1x Normal' : '🚀 2x Fast'}
              </button>
            </div>
          </div>
        </div>

        {/* THE LEFT-TO-RIGHT ANIMATED CONTINUOUS MARQUEE TRACK */}
        <div className="reviews-marquee-container">
          <div className={`reviews-marquee-track ${isPaused ? 'paused' : ''} ${isFast ? 'fast' : ''}`}>
            {[...movingReviews, ...movingReviews].map((r, idx) => (
              <div key={idx} className="moving-review-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className={`stat-pill ${r.pillClass}`} style={{ fontSize: '11.5px', fontWeight: 700 }}>
                      {r.badge}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GoogleLogo size={13} />
                      <div style={{ color: 'var(--star-active)', fontSize: '13px' }}>★★★★★</div>
                    </div>
                  </div>

                  <h3 className="serif" style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: '#1e1b19', lineHeight: 1.35 }}>
                    {r.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {r.text}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: r.avatarBg,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', lineHeight: 1.2 }}>{r.author}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.business}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--success)', fontWeight: 600, marginTop: '2px' }}>
                      {r.highlight}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Matrix: BEFORE VS AFTER KINDLYREVIEW */}
        <div className="desktop-container" style={{ maxWidth: '1280px', marginTop: '36px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              color: '#f8fafc',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="stat-pill" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', marginBottom: '8px' }}>
                The Growth Transformation
              </span>
              <h3 className="serif" style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                Your Business Before vs After KindlyRate
              </h3>
            </div>

            <div className="transformation-grid">
              {/* Before Column */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fca5a5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>❌</span> Without KindlyRate (The Old Painful Way)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Stuck at 3.3 ★ - 3.8 ★:</strong> Happy customers leave quietly; only angry customers post rants online.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Ranked #10 to #15 on Maps:</strong> Buried beneath local competitors; invisible to walk-in shoppers.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>₹30,000+ Wasted on Ads:</strong> Paying high ad costs and agency retainers with zero permanent gain.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Lost Margins to Aggregators:</strong> Giving away 25-30% commissions on deliveries and listings.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Unshielded Bad Reviews:</strong> Minor delays turn into permanent 1-star public damage.</div>
                  </div>
                </div>
              </div>

              {/* After Column */}
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#86efac', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✅</span> With KindlyRate Growth Engine
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>✨</span>
                    <div><strong>Surged to 4.8 ★ - 4.9 ★:</strong> AI drafts detailed 5-star reviews highlighting signature products and services.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>🏆</span>
                    <div><strong>#1 Leader on Google Local 3-Pack:</strong> Dominates local Maps searches and captures 45%+ foot traffic.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>💰</span>
                    <div><strong>₹0 Spent on Ads:</strong> Review velocity acts as an organic, permanent customer engine.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>📈</span>
                    <div><strong>+₹1,80,000 Walk-In & Customer Revenue:</strong> Filling stores and businesses with high-margin direct customers.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>🛡️</span>
                    <div><strong>100% Reputation Shield:</strong> 1-star ratings intercepted to manager WhatsApp instantly!</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                className="btn btn-primary"
                onClick={onStartOnboarding}
                style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700 }}
              >
                Take Your Business to #1 Today →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section style={{ background: 'var(--surface-container)', padding: '60px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="desktop-container" style={{ textAlign: 'center', maxWidth: '1280px' }}>
          <h2 className="serif" style={{ fontSize: '32px', marginBottom: '12px' }}>
            Built for Every Business Category
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>
            Dynamic, category-tailored rating criteria that adapt to how your customers experience your business.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Food & Hospitality', desc: 'Fine Dine, Bistros, Cafés, Rooftops, Bakeries, Food Trucks, Pubs', icon: '🍽️' },
              { title: 'Retail & Stores', desc: 'Supermarkets, Boutiques, Electronics, Jewellery', icon: '🛍️' },
              { title: 'Personal Services', desc: 'Salons, Barbers, Spas, Car Washes, Studios', icon: '✂️' },
              { title: 'Health & Wellness', desc: 'Clinics, Dental Centers, Gyms, Yoga, Diagnostic', icon: '🩺' },
              { title: 'Education & Academies', desc: 'Coaching, Music, Dance, Training Institutes', icon: '🎓' },
              { title: 'Entertainment & Venues', desc: 'Cinemas, Gaming Centers, Event Companies', icon: '🎟️' },
              { title: 'Professional Services', desc: 'Lawyers, Accountants, Architects, IT Agencies', icon: '💼' },
              { title: 'Custom Businesses', desc: 'Any specialized or unique local service', icon: '✨' },
            ].map((cat, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'left', padding: '20px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
                <h3 className="serif" style={{ fontSize: '18px', marginBottom: '6px' }}>{cat.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Aligned Grid) */}
      <section style={{ padding: '80px 20px' }}>
        <div className="desktop-container" style={{ textAlign: 'center', maxWidth: '1080px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '13px', padding: '6px 16px' }}>
              ⚡ ₹79 Starter Trial Offer
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: '38px', marginBottom: '12px' }}>Simple, High-ROI Subscription Packs</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>
            Get started with our ₹79 Testing Pack trial offer or choose a high-growth tier. Enjoy exclusive promotional rates across all packs.
          </p>

          <div className="pricing-grid">
            {/* Testing Pack */}
            {(() => {
              const dur = landingPlanDurations.starter || 1;
              const price = dur === 3 ? 229 : dur === 6 ? 449 : dur === 12 ? 790 : 79;
              const reg = dur === 3 ? 447 : dur === 6 ? 894 : dur === 12 ? 1788 : 149;
              const sub = dur === 3 ? 'for 3 mos (₹76/mo)' : dur === 6 ? 'for 6 mos (₹75/mo)' : dur === 12 ? 'for 1 yr (₹66/mo)' : '/month';
              const reviews = dur === 3 ? '300 Total AI reviews (Quarterly)' : dur === 6 ? '600 Total AI reviews (Semi-Annual)' : dur === 12 ? '1,200 Total AI reviews (1-Year Pass)' : '100 AI reviews / month';
              const tag = dur === 12 ? '🎁 2 Months Free Applied!' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹79 First Month Offer (Reg. ₹149)';

              return (
                <div className="card" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Title and Month Duration Selector in Right Upper Container */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '18px' }}>Testing Pack</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {tag}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Select Months
                      </span>
                      <div style={{ display: 'inline-flex', background: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {[
                          { m: 1 as const, lbl: '1M' },
                          { m: 3 as const, lbl: '3M' },
                          { m: 6 as const, lbl: '6M' },
                          { m: 12 as const, lbl: '1Y 🎁' },
                        ].map((tab) => (
                          <button
                            key={tab.m}
                            type="button"
                            onClick={() => setLandingPlanDurations((prev) => ({ ...prev, starter: tab.m }))}
                            style={{
                              background: dur === tab.m ? 'var(--primary)' : 'transparent',
                              color: dur === tab.m ? '#ffffff' : 'var(--text)',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: dur === tab.m ? 700 : 500,
                              padding: '3px 7px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title={tab.m === 12 ? '1 Year Plan: 2 Months Free Discount!' : `${tab.m} Months`}
                          >
                            {tab.lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹{price}</span>
                    <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{reg}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{sub}</span>
                  </div>

                  {dur === 12 && (
                    <div style={{ fontSize: '11.5px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                      🎉 1-Year Pack: 2 Months Free Discount Applied!
                    </div>
                  )}

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Ideal for testing review acceleration in your outlet</p>
                  <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                    <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviews}</li>
                    <li>✓ 2 Smart Table QR Codes</li>
                    <li>✓ Category question customization</li>
                    <li>✓ Scan & copy funnel analytics</li>
                    <li>✓ Standard Reputation Shield</li>
                  </ul>
                  <button className="btn btn-outline btn-block" onClick={onStartOnboarding}>
                    Start ₹79 Trial Pack →
                  </button>
                </div>
              );
            })()}

            {/* Growth Pack */}
            {(() => {
              const dur = landingPlanDurations.growth || 1;
              const price = dur === 3 ? 429 : dur === 6 ? 849 : dur === 12 ? 1490 : 149;
              const reg = dur === 3 ? 747 : dur === 6 ? 1494 : dur === 12 ? 2988 : 249;
              const sub = dur === 3 ? 'for 3 mos (₹143/mo)' : dur === 6 ? 'for 6 mos (₹142/mo)' : dur === 12 ? 'for 1 yr (₹124/mo)' : '/month';
              const reviews = dur === 3 ? '1,500 Total AI reviews (Quarterly)' : dur === 6 ? '3,000 Total AI reviews (Semi-Annual)' : dur === 12 ? '6,000 Total AI reviews (1-Year Pass)' : '500 AI reviews / month';
              const tag = dur === 12 ? '🎁 2 Months Free Applied!' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹149 First Month Offer (Reg. ₹249)';

              return (
                <div className="card" style={{ padding: '32px 24px', textAlign: 'left', border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(154, 64, 24, 0.12)' }}>
                  <div style={{ position: 'absolute', top: '-13px', left: '20px' }}>
                    <span className="badge badge-primary" style={{ padding: '4px 14px', fontSize: '11.5px' }}>Most Popular</span>
                  </div>

                  {/* Header with Title and Month Duration Selector in Right Upper Container */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '18px' }}>Growth Pack</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {tag}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Select Months
                      </span>
                      <div style={{ display: 'inline-flex', background: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {[
                          { m: 1 as const, lbl: '1M' },
                          { m: 3 as const, lbl: '3M' },
                          { m: 6 as const, lbl: '6M' },
                          { m: 12 as const, lbl: '1Y 🎁' },
                        ].map((tab) => (
                          <button
                            key={tab.m}
                            type="button"
                            onClick={() => setLandingPlanDurations((prev) => ({ ...prev, growth: tab.m }))}
                            style={{
                              background: dur === tab.m ? 'var(--primary)' : 'transparent',
                              color: dur === tab.m ? '#ffffff' : 'var(--text)',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: dur === tab.m ? 700 : 500,
                              padding: '3px 7px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title={tab.m === 12 ? '1 Year Plan: 2 Months Free Discount!' : `${tab.m} Months`}
                          >
                            {tab.lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹{price}</span>
                    <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{reg}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{sub}</span>
                  </div>

                  {dur === 12 && (
                    <div style={{ fontSize: '11.5px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                      🎉 1-Year Pack: 2 Months Free Discount Applied!
                    </div>
                  )}

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>For active retail stores, clinics, salons &amp; businesses</p>
                  <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                    <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviews}</li>
                    <li>✓ 5 Smart QR Stands (counters/desks/tables)</li>
                    <li>✓ Full custom question &amp; keyword builder</li>
                    <li>✓ Aura Live Telemetry &amp; Growth Heatmap</li>
                    <li>✓ Service Diagnostics &amp; Staff Leaderboard</li>
                    <li>✓ Maximum Defense Reputation Shield</li>
                  </ul>
                  <button className="btn btn-primary btn-block" onClick={onStartOnboarding}>
                    Get Growth Pack →
                  </button>
                </div>
              );
            })()}

            {/* Scale / Pro Pack */}
            {(() => {
              const dur = landingPlanDurations.pro || 1;
              const price = dur === 3 ? 699 : dur === 6 ? 1399 : dur === 12 ? 2490 : 249;
              const reg = dur === 3 ? 1197 : dur === 6 ? 2394 : dur === 12 ? 4788 : 399;
              const sub = dur === 3 ? 'for 3 mos (₹233/mo)' : dur === 6 ? 'for 6 mos (₹233/mo)' : dur === 12 ? 'for 1 yr (₹208/mo)' : '/month';
              const reviews = dur === 3 ? '3,000 Total AI reviews (Quarterly)' : dur === 6 ? '6,000 Total AI reviews (Semi-Annual)' : dur === 12 ? '12,000 Total AI reviews (1-Year Pass)' : '1,000 AI reviews / month';
              const tag = dur === 12 ? '🎁 2 Months Free Applied!' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹249 First Month Offer (Reg. ₹399)';

              return (
                <div className="card" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Title and Month Duration Selector in Right Upper Container */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '18px' }}>Scale / Pro Pack</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {tag}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Select Months
                      </span>
                      <div style={{ display: 'inline-flex', background: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {[
                          { m: 1 as const, lbl: '1M' },
                          { m: 3 as const, lbl: '3M' },
                          { m: 6 as const, lbl: '6M' },
                          { m: 12 as const, lbl: '1Y 🎁' },
                        ].map((tab) => (
                          <button
                            key={tab.m}
                            type="button"
                            onClick={() => setLandingPlanDurations((prev) => ({ ...prev, pro: tab.m }))}
                            style={{
                              background: dur === tab.m ? 'var(--primary)' : 'transparent',
                              color: dur === tab.m ? '#ffffff' : 'var(--text)',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: dur === tab.m ? 700 : 500,
                              padding: '3px 7px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title={tab.m === 12 ? '1 Year Plan: 2 Months Free Discount!' : `${tab.m} Months`}
                          >
                            {tab.lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹{price}</span>
                    <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{reg}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{sub}</span>
                  </div>

                  {dur === 12 && (
                    <div style={{ fontSize: '11.5px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                      🎉 1-Year Pack: 2 Months Free Discount Applied!
                    </div>
                  )}

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>For high-volume stores, multi-counter spaces &amp; growing branches</p>
                  <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                    <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviews}</li>
                    <li>✓ 15 Smart QR Stands</li>
                    <li>✓ Custom printable acrylic tent studio</li>
                    <li>✓ Multi-staff RBAC &amp; Manager alerts</li>
                    <li>✓ Anti-abuse spam prevention engine</li>
                    <li>✓ Dedicated priority support &amp; SLA</li>
                  </ul>
                  <button className="btn btn-outline btn-block" onClick={onStartOnboarding}>
                    Get Scale / Pro Pack →
                  </button>
                </div>
              );
            })()}

            {/* Custom Enterprise & Bespoke Software Pack */}
            <div className="card" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', border: '1.5px solid #d97706', background: 'linear-gradient(180deg, #ffffff 0%, #fffdfa 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-13px', left: '20px' }}>
                <span className="badge badge-warning" style={{ padding: '4px 14px', fontSize: '11px', background: '#d97706', color: '#ffffff', fontWeight: 700 }}>
                  🏢 Enterprise &amp; Custom
                </span>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>Custom / Bespoke Software</div>
                <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, marginTop: '2px' }}>
                  Multi-Branch &amp; Custom Systems
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#d97706' }}>Custom Quote</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Tailored Project Scope</span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                For multi-branch chains, franchise networks, clinics, and businesses requiring custom POS/ERP integration or delivery fleet software.
              </p>

              <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ Unlimited Smart QR Stands across all locations</li>
                <li>✓ Multi-branch centralized command dashboard</li>
                <li>✓ Bespoke POS &amp; ERP sync (Tally, SAP, Marg, Zoho)</li>
                <li>✓ In-house delivery fleet &amp; real-time dispatch</li>
                <li>✓ Custom laser-engraved NFC &amp; wooden stands</li>
                <li>✓ Dedicated Solutions Engineer &amp; 24/7 SLA</li>
              </ul>

              <button
                className="btn btn-secondary btn-block"
                onClick={() => setLegalModal('enterprise')}
                style={{ background: '#d97706', borderColor: '#d97706', color: '#ffffff', fontWeight: 700 }}
              >
                Contact Sales / Request Custom Quote →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION: FEATURED ARTICLES & GROWTH GUIDES               */}
      {/* ======================================================== */}
      <section style={{ padding: '72px 20px', background: '#faf8f5', borderTop: '1px solid var(--border-light)' }}>
        <div className="desktop-container" style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '12.5px', padding: '5px 14px' }}>
              📰 Knowledge &amp; Field Studies
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '10px' }}>
            Business Growth &amp; Google SEO Guides
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '640px', margin: '0 auto 36px' }}>
            Actionable playbooks to optimize customer reviews, shield your rating, dominate Google Maps, and scale your business.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', textAlign: 'left' }}>
            {[
              {
                slug: 'how-to-dominate-google-maps-local-3-pack-rankings-2026',
                title: 'The Definitive 2026 Guide to Dominating Google Maps Local 3-Pack Rankings',
                category: 'LOCAL SEO MASTERY',
                readTime: '15 min read',
                excerpt: 'How review velocity, keyword density in reviews, recency, and proximity interact to propel retail shops, clinics, and service businesses to Rank #1 on Google Maps.',
                tag: 'Google Maps 3-Pack',
              },
              {
                slug: 'smart-nfc-qr-stands-vs-sms-whatsapp-review-requests',
                title: 'Physical Smart NFC & QR Stands vs. SMS/WhatsApp Blasts: Why Tap-to-Review Converts at 48%',
                category: 'CONVERSION OPTIMIZATION',
                readTime: '13 min read',
                excerpt: 'Analysis across 120,000 customer sessions: why physical on-premise review capture delivers 16x higher conversion than post-visit messages.',
                tag: 'QR Stands & NFC',
              },
              {
                slug: 'shielding-business-from-unfair-1-star-fake-reviews-legally',
                title: 'The Complete Legal & Algorithmic Defense Guide: Protecting Against 1-Star Fake Reviews',
                category: 'REPUTATION DEFENSE',
                readTime: '16 min read',
                excerpt: 'Navigating FTC regulations and Google policies while implementing proactive Reputation Shields that resolve customer complaints privately.',
                tag: 'Negative Review Defense',
              },
              {
                slug: 'keyword-injection-and-semantic-search-in-customer-reviews',
                title: 'Keyword Injection & Semantic Search: How Specific Customer Mentions Drive Foot Traffic',
                category: 'SEARCH ALGORITHMS',
                readTime: '12 min read',
                excerpt: 'How guiding customer reviews to mention high-margin inventory (RAM, SSD, Painless Care) quadruples discovery on Google Maps.',
                tag: 'Keyword SEO',
              },
              {
                slug: 'why-businesses-are-replacing-generic-aggregators-with-bespoke-software',
                title: 'Why Retail Stores, Clinics, Salons & Gyms Are Replacing Generic Aggregators with Bespoke Software',
                category: 'CUSTOM SOFTWARE',
                readTime: '14 min read',
                excerpt: 'The hidden costs of off-the-shelf tools: why growing businesses switch to tailored POS integrations and custom delivery fleet systems.',
                tag: 'Bespoke ERP & POS',
              },
              {
                slug: 'enterprise-multi-location-review-architecture',
                title: 'Enterprise Multi-Location Review Architecture: Scaling Brand Reputation Across 50+ Branches',
                category: 'ENTERPRISE SCALING',
                readTime: '17 min read',
                excerpt: 'Managing multi-tier RBAC, regional manager escalation pipelines, and centralized Google 3-Pack tracking across national chains.',
                tag: 'Enterprise Architecture',
              },
            ].map((article, aIdx) => (
              <div
                key={aIdx}
                className="card"
                onClick={() => (onNavigateBlog ? onNavigateBlog(article.slug) : setLegalModal('blog'))}
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border-light)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{article.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.readTime}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: '18px', fontWeight: 600, margin: '6px 0 10px', color: '#0f172a' }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {article.excerpt}
                  </p>
                </div>
                <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span className="stat-pill stat-pill-neutral" style={{ fontSize: '11px' }}>
                    #{article.tag}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                    Read Guide →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => (onNavigateBlog ? onNavigateBlog() : setLegalModal('blog'))}
              style={{ fontSize: '14px', padding: '10px 22px' }}
            >
              View All Articles &amp; Playbooks →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION   */}
      {/* ======================================================== */}
      <section id="faq" style={{ padding: '72px 20px 80px', background: 'var(--surface-container)', borderTop: '1px solid var(--border-light)' }}>
        <div className="desktop-container" style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '12.5px', padding: '5px 14px' }}>
              💬 Got Questions? We’ve Got Answers
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '10px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '620px', margin: '0 auto 36px' }}>
            Everything you need to know about smart QR counter stands, Google Maps review generation, and our Reputation Shield.
          </p>

          <div className="faq-grid">
            {[
              {
                q: 'How does AI-assisted review drafting work for customers?',
                a: 'When a customer scans the QR stand at your billing counter, desk, or table, they rate their experience across customized criteria in 30 seconds. Our server-side AI immediately synthesizes their genuine ratings into an authentic, personalized draft in natural everyday English. Customers tap "Copy & Post to Google Maps", opening your listing’s native review form with the text pre-copied ready to paste.',
              },
              {
                q: 'Does KindlyRate comply with Google Business Profile & Maps policies?',
                a: 'Yes, 100%. KindlyRate does NOT use bots or proxy IP networks (which get banned by Google algorithms). Real in-person customers scan the stand from their own smartphones and post voluntarily using their personal, verified Google accounts, ensuring high authority and permanent indexation.',
              },
              {
                q: 'What is the Reputation Shield and how does it prevent 1-star reviews?',
                a: 'If a customer experiences an issue and rates their experience 1 to 3 stars, KindlyRate intercepts the feedback privately. Rather than directing them to Google Maps, it routes their complaint directly to your manager WhatsApp and dashboard. This allows your team to resolve the issue privately on the spot before it hurts your public score.',
              },
              {
                q: 'Do customers need to download an app or register an account?',
                a: 'Zero downloads, zero friction! Customers do not need to install any app or register. The review flow launches instantly in their mobile browser (Chrome / Safari) using their standard phone camera.',
              },
              {
                q: 'What is included with the ₹79 Testing Pack Trial?',
                a: 'The ₹79 introductory pack provides 30 full days of access, 100 AI review drafts, and 2 Smart Counter / Table QR Stands. You can switch, upgrade, or cancel packs anytime directly from your Merchant Dashboard with zero lock-in.',
              },
              {
                q: 'Can I print branded acrylic counter stands for my business?',
                a: 'Yes! KindlyRate includes a built-in Printable Acrylic Stand Studio. You can customize location/counter tags, brand accent colors, custom welcome greetings, and print high-resolution 4"×6" counter stand inserts immediately, or order custom laser-engraved stands.',
              },
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                  <div className="faq-header" onClick={() => setExpandedFaq(isOpen ? null : idx)}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: 'var(--primary)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                      ▼
                    </span>
                  </div>
                  {isOpen && <div className="faq-body">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ENTERPRISE 4-COLUMN SAAS FOOTER WITH TRUST BADGES       */}
      {/* ======================================================== */}
      <footer style={{ background: '#18181b', color: '#cbd5e1', borderTop: '1px solid #27272a', padding: '64px 20px 32px' }}>
        <div className="saas-footer-grid">
          {/* Column 1: Brand & Trust Badges */}
          <div>
            <div style={{ marginBottom: '14px' }}>
              <KindlyRateBrand iconSize={42} fontSize={26} darkBg={true} />
            </div>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              The #1 AI-powered Google Local 3-Pack Growth Engine for every local business, retail store, clinic, salon, and service outlet across India.
            </p>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔒</span> <span>256-Bit SSL Bank-Grade Encryption</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💳</span> <span>Razorpay PCI-DSS Level 1 Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> <span>India DPDP Act 2023 &amp; IT Act Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🇮🇳</span> <span>Proudly Engineered &amp; Hosted in India</span>
              </div>
            </div>
          </div>

          {/* Column 2: Product & Solutions */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', padding: 0 }}>
              <li>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Smart Table QR Stands
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Server-Side AI Drafter
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Aura Live Telemetry &amp; Heatmap
                </a>
              </li>
              <li>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Reputation Shield Defense
                </a>
              </li>
              <li>
                <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Subscription Packs &amp; Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Guides */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', padding: 0 }}>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('help')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Help Center &amp; Support Desk
                </button>
              </li>
              <li>
                <a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onNavigateBlog ? onNavigateBlog() : setLegalModal('blog'))}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Articles &amp; Growth Blog
                </button>
              </li>
              <li>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Platform Architecture &amp; Guides
                </a>
              </li>
              <li>
                <span style={{ color: '#4ade80', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                  Systems 100% Operational
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Legal &amp; Trust
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', padding: 0 }}>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Terms of Service &amp; Agreement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Privacy Policy (DPDP 2023)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('refund')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Refund &amp; Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('help')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: '13.5px', textAlign: 'left' }}
                >
                  Grievance Redressal Desk
                </button>
              </li>
            </ul>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
              Support Email: <a href="mailto:support@kindlyrate.com" style={{ color: '#38bdf8' }}>support@kindlyrate.com</a>
              <br />
              Helpline: <a href="tel:+918047192200" style={{ color: '#38bdf8' }}>+91 80 4719 2200</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '40px auto 0',
            paddingTop: '24px',
            borderTop: '1px solid #27272a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
            color: '#64748b',
          }}
        >
          <div>
            © 2026 KindlyRate Technologies Pvt. Ltd. All rights reserved. Registered Office: Indiranagar, Bengaluru, KA 560038.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>INR (₹) Accepted via UPI &amp; Cards</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '12.5px' }}
            >
              Terms
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '12.5px' }}
            >
              Privacy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('refund')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '12.5px' }}
            >
              Refunds
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Trust & Legal Modals */}
      <LegalModals type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
};
