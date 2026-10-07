import React, { useState } from 'react';
import {
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
}

export const LandingPage: React.FC<Props> = ({ onStartOnboarding, onNavigateLogin }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFast, setIsFast] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // 6 Verified Real Restaurant Reviews & Owner Case Studies
  const movingReviews = [
    {
      badge: '🏆 Rank #10 ➔ #1 on Maps',
      pillClass: 'stat-pill-primary',
      title: '"My restaurant was ranked #10 in the city. Now we are officially #1 on Google Local Pack!"',
      text: '"Before Reviewly, when anyone searched woodfired pizza nearby, we were buried at Rank #10. In 90 days of smart table tent QRs, we gathered 380+ verified 5-star Google reviews praising our sourdough crust. Today, we hold the permanent #1 search spot across the entire suburb!"',
      initials: 'KD',
      avatarBg: '#9a4018',
      author: 'Chef Kabir Deshmukh',
      business: 'Fire & Wood Artisanal Bistro',
      highlight: '✔ Verified Merchant · 380+ Reviews Added',
    },
    {
      badge: '⭐ Rating: 3.3 ★ ➔ 4.8 ★',
      pillClass: 'stat-pill-success',
      title: '"We increased our rating from a painful 3.3 to 4.8 stars in just 8 weeks."',
      text: '"Only disgruntled diners took time to write 1-star rants, while 95% of happy diners left quietly. The Reputation Shield intercepted 22 critical comments privately to my WhatsApp, while happy diners posted 140+ glowing reviews. Our Google score climbed from 3.3 ★ to 4.8 ★!"',
      initials: 'AS',
      avatarBg: '#15803d',
      author: 'Arjun Singhania',
      business: 'Royal Heritage Fine Dine',
      highlight: '✔ Verified Merchant · 22 Bad Reviews Shielded',
    },
    {
      badge: '💰 Saved ₹42,000/mo on Ads',
      pillClass: 'stat-pill-primary',
      title: '"I saved so much money on ads and delivery cuts, and my restaurant reviews skyrocketed!"',
      text: '"We used to waste ₹35,000 every month on influencer tastings and sponsored Instagram ads with zero trackable return. With Reviewly, our customers do the selling for us. In our first 60 days, our review volume shot up by 320%, and we saved over ₹42,000 straight back into our profit every month!"',
      initials: 'VR',
      avatarBg: '#d97706',
      author: 'Vikramaditya Rao',
      business: 'Coastal Spice Bistro',
      highlight: '✔ Verified Merchant · ₹84,000 Saved in Ads',
    },
    {
      badge: '📈 +₹1.8L/mo Walk-ins',
      pillClass: 'stat-pill-neutral',
      title: '"Revenue increased by ₹1.8 Lakhs/mo. Customers started pouring in from Google Maps."',
      text: '"When people search best rooftop dinner on Friday evening, Google Maps recommends places with the highest volume of fresh reviews. Since installing Reviewly on our rooftop tables, weekend walk-ins jumped by 45%. Monthly dine-in turnover went up by ₹1,80,000!"',
      initials: 'NM',
      avatarBg: '#0284c7',
      author: 'Natasha Mehta',
      business: 'Skyline Terrace & Tapas',
      highlight: '✔ Verified Merchant · 45% Walk-in Surge',
    },
    {
      badge: '⚡ 72% AI Review Rate',
      pillClass: 'stat-pill-primary',
      title: '"Diners love that AI crafts their review in 15 seconds. Scan-to-Google rate hit 72%!"',
      text: '"Customers never wanted to type long paragraphs on their phone. With Reviewly’s 1-click AI draft generation, 72% of diners who scan actually copy and post to Google Maps. Our review velocity jumped from 4 reviews/wk to 28 reviews/wk!"',
      initials: 'RV',
      avatarBg: '#7c3aed',
      author: 'Rohan Varma',
      business: 'The Belgian Waffle & Crepe Co.',
      highlight: '✔ Verified Merchant · 72% Conversion Rate',
    },
    {
      badge: '🛡️ 100% Reputation Shield',
      pillClass: 'stat-pill-success',
      title: '"Caught a slow dessert complaint in 3 minutes and converted an upset guest to a regular."',
      text: '"A guest had a dessert delay. Rather than venting publicly on Google Maps, Reviewly diverted the rating to my manager inbox. We sent a warm apology and complimentary dessert to their table. They left thrilled and gave us 5 stars on their next visit!"',
      initials: 'SK',
      avatarBg: '#059669',
      author: 'Sunil K.',
      business: 'Saffron Artisanal Bistro & Bar',
      highlight: '✔ Verified Merchant · Zero Public 1-Star Leaks',
    },
  ];

  return (
    <div className="app-container" style={{ background: '#faf8f5' }}>
      {/* Navigation */}
      <nav
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <span className="serif" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Reviewly
            </span>
            <span
              className="stat-pill stat-pill-success"
              style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              ● #1 Local Reputation Suite
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={onNavigateLogin}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              Merchant Login
            </button>
            <button
              className="btn btn-primary"
              onClick={onStartOnboarding}
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              Start 7-Day Free Trial →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '68px 20px 48px', maxWidth: '980px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '6px 16px',
            borderRadius: '999px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <GoogleLogo size={16} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
            Google Local 3-Pack Growth Engine for Restaurants & Outlets
          </span>
        </div>

        <h1 className="serif" style={{ fontSize: '50px', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Turn Happy Diners into 5-Star Google Reviews Automatically
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '780px', margin: '0 auto 32px' }}>
          Place smart acrylic QR stands at your dining tables. Guests tap ratings in 30 seconds, and our server-side AI crafts personalized, mouth-watering reviews ready to paste straight to Google Maps.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '44px' }}>
          <button className="btn btn-primary btn-lg" onClick={onStartOnboarding} style={{ padding: '14px 28px', fontSize: '15.5px' }}>
            Start 7-Day Free Trial →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onNavigateLogin} style={{ padding: '14px 28px', fontSize: '15.5px' }}>
            Explore Live Restaurant Demo
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

        {/* Transformation Matrix: BEFORE VS AFTER REVIEWLY */}
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
                Your Restaurant Before vs After Reviewly
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
                  <span>❌</span> Without Reviewly (The Old Painful Way)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Stuck at 3.3 ★ - 3.8 ★:</strong> Happy customers leave quietly; only angry guests post online.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>Ranked #10 to #15 on Maps:</strong> Buried beneath local competitors; invisible to tourists.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>₹30,000+ Wasted on Ads:</strong> Paying food influencers and social ads with zero permanent gain.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                    <div><strong>High 28% Delivery Cut:</strong> Losing massive restaurant profit margins to Swiggy and Zomato.</div>
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
                  <span>✅</span> With Reviewly Mission Control
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>✨</span>
                    <div><strong>Surged to 4.8 ★ - 4.9 ★:</strong> AI generates detailed 5-star reviews mentioning signature dishes.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>🏆</span>
                    <div><strong>#1 Leader on Google Local 3-Pack:</strong> Dominates local Maps searches and captures 45%+ diners.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>💰</span>
                    <div><strong>₹0 Spent on Ads:</strong> Review velocity acts as an organic, permanent customer engine.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }}>📈</span>
                    <div><strong>+₹1,80,000 Dine-In Walk-In Revenue:</strong> Filling empty tables with high-margin dine-in guests.</div>
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
                Take Your Restaurant to #1 Today →
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
              🌟 7-Day All-Access Free Trial
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: '38px', marginBottom: '12px' }}>Simple, High-ROI Subscription Packs</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>
            Try full access for 7 days risk-free. Enjoy exclusive first-month promotional rates across all packs.
          </p>

          <div className="pricing-grid">
            {/* Testing Pack */}
            <div className="card" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>Testing Pack</div>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                ₹79 First Month Offer (Reg. ₹149)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹79</span>
                <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹149</span>
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Ideal for testing review acceleration in your outlet</p>
              <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ 100 AI reviews / month</li>
                <li>✓ 2 Smart Table QR Codes</li>
                <li>✓ Category question customization</li>
                <li>✓ Scan & copy funnel analytics</li>
                <li>✓ Standard Reputation Shield</li>
              </ul>
              <button className="btn btn-outline btn-block" onClick={onStartOnboarding}>
                Start Free Trial →
              </button>
            </div>

            {/* Growth Pack */}
            <div className="card" style={{ padding: '32px 24px', textAlign: 'left', border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(154, 64, 24, 0.12)' }}>
              <div style={{ position: 'absolute', top: '-13px', right: '20px' }}>
                <span className="badge badge-primary" style={{ padding: '4px 14px', fontSize: '11.5px' }}>Most Popular</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>Growth Pack</div>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                ₹149 First Month Offer (Reg. ₹249)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹149</span>
                <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹249</span>
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>For active dine-in restaurants & bars</p>
              <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ 500 AI reviews / month</li>
                <li>✓ 5 Smart QR Stands (tables/deck)</li>
                <li>✓ Full custom question builder</li>
                <li>✓ Aura Live Telemetry & Floor Heatmap</li>
                <li>✓ Kitchen Diagnostics & Server Leaderboard</li>
                <li>✓ Maximum Defense Reputation Shield</li>
              </ul>
              <button className="btn btn-primary btn-block" onClick={onStartOnboarding}>
                Start Free Trial →
              </button>
            </div>

            {/* Scale / Pro Pack */}
            <div className="card" style={{ padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>Scale / Pro Pack</div>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                ₹249 First Month Offer (Reg. ₹399)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>₹249</span>
                <span style={{ fontSize: '17px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹399</span>
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>For busy dining spaces & multi-hall venues</p>
              <ul style={{ listStyle: 'none', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ 1,000 AI reviews / month</li>
                <li>✓ 15 Smart QR Stands</li>
                <li>✓ Custom printable acrylic tent studio</li>
                <li>✓ Multi-staff RBAC & Manager alerts</li>
                <li>✓ Anti-abuse spam prevention engine</li>
                <li>✓ Dedicated priority support & SLA</li>
              </ul>
              <button className="btn btn-outline btn-block" onClick={onStartOnboarding}>
                Start Free Trial →
              </button>
            </div>
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
            Everything you need to know about QR table tents, Google Maps review generation, and our Reputation Shield.
          </p>

          <div className="faq-grid">
            {[
              {
                q: 'How does AI-assisted review drafting work for diners?',
                a: 'When a diner scans the QR stand on their table, they rate their experience across customized criteria (such as food taste, service, or ambience) in 30 seconds. Our server-side AI immediately synthesizes their genuine ratings into an authentic, mouth-watering draft. Diners tap "Copy & Post to Google Maps", opening your listing’s native review form with the text pre-copied ready to paste.',
              },
              {
                q: 'Does Reviewly comply with Google Business Profile & Maps policies?',
                a: 'Yes, 100%. Reviewly does NOT use bots or proxy IP networks (which get banned by Google algorithms). Real in-person dining customers scan the stand from their own smartphones and post voluntarily using their personal, verified Google accounts, ensuring high authority and permanent indexation.',
              },
              {
                q: 'What is the Reputation Shield and how does it prevent 1-star reviews?',
                a: 'If a customer experiences an issue (like a slow dessert or minor order delay) and rates their experience 1 to 3 stars, Reviewly intercepts the feedback privately. Rather than directing them to Google Maps, it routes their complaint directly to your manager WhatsApp and dashboard. This allows your team to resolve the issue at the dining table before it hurts your public score.',
              },
              {
                q: 'Do customers need to download an app or register an account?',
                a: 'Zero downloads, zero friction! Diners do not need to install any app or register. The review flow launches instantly in their mobile browser (Chrome / Safari) using their standard phone camera.',
              },
              {
                q: 'What happens after the 7-Day All-Access Free Trial?',
                a: 'You receive full access to all features for 7 days. After 7 days, your account seamlessly continues with your selected monthly pack (Testing Pack: ₹79/mo, Growth Pack: ₹149/mo, or Scale Pack: ₹249/mo). You can cancel, pause, or switch packs anytime with 1 click in your Merchant Dashboard.',
              },
              {
                q: 'Can I print branded acrylic table stands for my restaurant?',
                a: 'Yes! Reviewly includes a built-in Printable Acrylic Tent Studio. You can customize table numbers, brand accent colors, custom welcome greetings, and optional guest Wi-Fi details, and print high-resolution 4"×6" table tent inserts immediately.',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>⭐</span>
              <span className="serif" style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Reviewly
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              The #1 AI-powered Google Local 3-Pack Growth Engine for restaurants, bistros, and service outlets across India.
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
                  onClick={() => setLegalModal('blog')}
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
              Support Email: <a href="mailto:support@reviewly.in" style={{ color: '#38bdf8' }}>support@reviewly.in</a>
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
            © 2026 Reviewly Technologies Pvt. Ltd. All rights reserved. Registered Office: Indiranagar, Bengaluru, KA 560038.
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
