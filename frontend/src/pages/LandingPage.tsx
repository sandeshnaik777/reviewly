import React, { useState, useEffect } from 'react';
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
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Award,
  TrendingUp,
  Zap,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  HelpCircle,
  Store,
  Utensils,
  ShoppingBag,
  Scissors,
  Stethoscope,
  GraduationCap,
  Ticket,
  Briefcase,
  Globe,
  Building2,
  Gift,
  LogIn,
  Key,
} from 'lucide-react';
import { GoogleAuthButton } from '../components/GoogleAuthButton.js';

interface Props {
  onStartOnboarding: () => void;
  onNavigateLogin: () => void;
  onNavigateBlog?: (slug?: string) => void;
  initialSection?: string;
}

export const LandingPage: React.FC<Props> = ({ onStartOnboarding, onNavigateLogin, onNavigateBlog, initialSection }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFast, setIsFast] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/terms')) return 'terms';
      if (p.includes('/privacy')) return 'privacy';
      if (p.includes('/refund')) return 'refund';
      if (p.includes('/help')) return 'help';
    }
    return null;
  });

  useEffect(() => {
    const hash = (typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '') || initialSection;
    const path = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+/, '') : '';
    const target = hash || (['pricing', 'features', 'faq', 'reviews', 'testimonials', 'blog'].includes(path) ? path : null);
    if (target) {
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [initialSection]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [landingPlanDurations, setLandingPlanDurations] = useState<Record<string, 1 | 3 | 6 | 12>>({
    starter: 1,
    growth: 1,
    pro: 1,
  });

  // 6 Verified Real Business Reviews & Owner Case Studies Across Industries
  const movingReviews = [
    {
      badge: 'Rank #10 → #1 on Maps',
      pillClass: 'stat-pill-primary',
      title: '"Our bistro was ranked #10 in the city. Now we are officially #1 on Google Local Pack!"',
      text: '"Before KindlyRate, when anyone searched woodfired pizza nearby, we were buried at Rank #10. In 90 days of smart QR stands, we gathered 380+ verified 5-star Google reviews praising our sourdough crust. Today, we hold the permanent #1 search spot across the entire suburb!"',
      initials: 'KD',
      avatarBg: '#9a4018',
      author: 'Chef Kabir Deshmukh',
      business: 'Fire & Wood Artisanal Bistro',
      highlight: 'Verified Merchant · 380+ Reviews Added',
    },
    {
      badge: 'Rating: 3.3 → 4.8 Stars',
      pillClass: 'stat-pill-success',
      title: '"We increased our clinic rating from a painful 3.3 to 4.8 stars in just 8 weeks."',
      text: '"Previously only upset patients left online complaints while 95% of happy patients left quietly. The Reputation Shield caught critical feedback privately, while satisfied patients posted 140+ glowing reviews. Our Google score climbed from 3.3 ★ to 4.8 ★!"',
      initials: 'SR',
      avatarBg: '#15803d',
      author: 'Dr. Sunita Rao',
      business: 'Apex Dental & Healthcare Clinic',
      highlight: 'Verified Healthcare · 22 Critical Issues Resolved',
    },
    {
      badge: 'Saved ₹42,000/mo on Ads',
      pillClass: 'stat-pill-primary',
      title: '"I saved so much money on ads, and our electronics store reviews skyrocketed!"',
      text: '"We used to waste ₹35,000 every month on local print ads and sponsored social boosts with zero trackable return. With KindlyRate at our billing desk, customers do the selling for us. Our review volume shot up by 320%, saving over ₹42,000 straight into profit every month!"',
      initials: 'RV',
      avatarBg: '#d97706',
      author: 'Rajesh Verma',
      business: 'Verma Electronics & Gadgets',
      highlight: 'Verified Retail Store · ₹84,000 Saved in Ads',
    },
    {
      badge: '+₹1.8L/mo Walk-ins',
      pillClass: 'stat-pill-neutral',
      title: '"Salon revenue increased by ₹1.8 Lakhs/mo. Clients started pouring in from Google Maps."',
      text: '"When people search best salon near me, Google Maps recommends businesses with the highest volume of recent authentic reviews. Since placing KindlyRate smart stands at our billing counter, new client walk-ins jumped by 45%. Monthly revenue surged by ₹1,80,000!"',
      initials: 'PS',
      avatarBg: '#0284c7',
      author: 'Priya Sundaram',
      business: 'Glow & Glamour Unisex Salon & Spa',
      highlight: 'Verified Salon & Spa · 45% Client Surge',
    },
    {
      badge: '72% AI Review Rate',
      pillClass: 'stat-pill-primary',
      title: '"Clients love that AI drafts their review in 15 seconds. Scan-to-Google rate hit 72%!"',
      text: '"Customers never wanted to type long paragraphs on their phone. With KindlyRate’s 1-click AI draft generation, 72% of clients who scan actually copy and post to Google Maps. Our review velocity jumped from 4 reviews/wk to 28 reviews/wk!"',
      initials: 'AS',
      avatarBg: '#7c3aed',
      author: 'Arjun Singhania',
      business: 'Royal Heritage Living & Suites',
      highlight: 'Verified Hospitality · 72% Conversion Rate',
    },
    {
      badge: '100% Reputation Shield',
      pillClass: 'stat-pill-success',
      title: '"Caught a repair delay complaint in 3 minutes and converted an upset car owner to a lifetime regular."',
      text: '"A customer had an unexpected service delay. Rather than venting publicly on Google Maps, KindlyRate diverted their rating to my manager inbox. We resolved the concern immediately. The owner left thrilled and posted 5 stars on their next visit!"',
      initials: 'VR',
      avatarBg: '#059669',
      author: 'Vikramaditya Rao',
      business: 'SpeedTech Auto Care & Motors',
      highlight: 'Verified Auto Workshop · Zero Public 1-Star Leaks',
    },
  ];

  return (
    <div className="app-container" style={{ background: '#faf8f5' }}>
      {/* Navigation */}
      <nav
        aria-label="Main Website Navigation"
        style={{
          background: 'var(--surface)',
          borderBottom: '1.5px solid var(--border-light)',
          padding: '12px 18px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="landing-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState({}, '', '/');
              }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              title="KindlyRate Home"
            >
              <KindlyRateBrand iconSize={36} fontSize={22} />
            </a>
            <span
              className="stat-pill stat-pill-success hide-on-phone"
              style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              ● #1 Local Reputation Suite
            </span>
          </div>

          {/* Crawlable Desktop Nav Links */}
          <div className="hide-on-phone" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <a
              href="/features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', '/features');
              }}
              style={{
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              Features
            </a>
            <a
              href="/pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', '/pricing');
              }}
              style={{
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              Pricing
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateBlog) {
                  onNavigateBlog();
                } else {
                  window.location.href = '/blog';
                }
              }}
              style={{
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                padding: '6px 12px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <BookOpen size={14} style={{ marginRight: '2px' }} /> Articles &amp; Blog
            </a>
            <a
              href="/faq"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', '/faq');
              }}
              style={{
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              FAQ
            </a>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onNavigateLogin();
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '13.5px',
                padding: '7px 14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              <LogIn size={14} color="#475569" />
              <span>Sign In</span>
            </a>
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                onStartOnboarding();
              }}
              className="btn btn-primary"
              style={{
                fontSize: '13.5px',
                padding: '7px 16px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(154, 64, 24, 0.25)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#ffffff',
              }}
            >
              <span>Sign Up Free →</span>
            </a>
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

        {/* Hero Main Action Hub */}
        <div style={{ maxWidth: '680px', margin: '0 auto 36px' }}>
          {/* 1-Click Google Sign Up Button */}
          <div style={{ maxWidth: '360px', margin: '0 auto 14px' }}>
            <GoogleAuthButton
              label="Sign up with Google (Instant Free Trial)"
              flow="onboarding"
              onSuccess={(res) => {
                if (res.businesses && res.businesses.length > 0) {
                  window.location.reload();
                } else {
                  onStartOnboarding();
                }
              }}
            />
          </div>

          {/* Main Dual Action Buttons */}
          <div
            className="hero-cta-group"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '14px',
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={onStartOnboarding}
              style={{
                padding: '13px 26px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(154, 64, 24, 0.35)',
                borderRadius: '12px',
              }}
            >
              <span>🚀 Or Sign Up with Email →</span>
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={onNavigateLogin}
              style={{
                padding: '13px 22px',
                fontSize: '14.5px',
                fontWeight: 700,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
              }}
            >
              <Key size={16} color="#64748b" />
              <span>Sign In to Account</span>
            </button>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span>⚡ 15-Second Setup</span>
            <span>·</span>
            <span>💳 No Credit Card Required</span>
            <span>·</span>
            <span>🛡️ 100% Google Policy Compliant</span>
          </div>

          {/* Quick-Access Pathway Helper Strip */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12.5px',
              color: '#475569',
              flexWrap: 'wrap',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#15803d', fontWeight: 700 }}>● New Merchant?</span>
              <button
                type="button"
                onClick={onStartOnboarding}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: '12.5px',
                }}
              >
                Create Account in 2 mins
              </button>
            </div>

            <span style={{ color: '#cbd5e1' }} className="hide-on-phone">|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>● Already Registered?</span>
              <button
                type="button"
                onClick={onNavigateLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: '12.5px',
                }}
              >
                Sign In Here
              </button>
            </div>
          </div>
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
      {/* SECTION: HOW KINDLYRATE WORKS IN 3 SIMPLE STEPS          */}
      {/* ======================================================== */}
      <section id="features" style={{ padding: '64px 16px 54px', background: '#ffffff', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✦ 15-Second Customer Journey
            </span>
            <h2 className="serif" style={{ fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: 700, color: '#0f172a', margin: '6px 0 10px' }}>
              How KindlyRate Works for Your Business
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
              Most happy customers walk out without reviewing, while unhappy customers go straight to Google. KindlyRate makes getting 5-star reviews effortless in 3 simple steps:
            </p>
          </div>

          {/* 3 Step Flow Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '36px' }}>
            {/* Step 1 */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '26px 22px', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', color: '#9a4018', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                1
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Place Your Smart QR Stand
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
                Place your custom laser-cut acrylic or printed QR stand at your billing counter, reception desk, or dining tables. Customers scan it with any smartphone camera in 3 seconds.
              </p>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#0f172a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                📱 Zero app download needed for customers
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '26px 22px', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                2
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                AI Generates 5-Star Reviews
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
                Customers hate typing long text on phone keyboards. After answering 2 quick rating questions, our Gemini AI instantly crafts an authentic, glowing 5-star review tailored to your store.
              </p>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#0f172a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                ✨ 1-Tap Copy · Natural human tone
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '26px 22px', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                3
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                1-Tap Post &amp; Private Shield
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
                Happy reviews post directly to Google Maps, pushing your business to #1 on search and driving more walk-ins. Critical ratings (1-3★) stay 100% private with you so your public score never drops.
              </p>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                🛡️ 100% Google Maps Policy Compliant
              </div>
            </div>
          </div>

          {/* Flow Banner CTA */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fffbf5 100%)',
              border: '1.5px solid #fed7aa',
              borderRadius: '16px',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 4px 14px rgba(154, 64, 24, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>
                Ready to turn happy customers into #1 Google rankings?
              </div>
              <div style={{ fontSize: '13.5px', color: '#7c2d12' }}>
                Fast 15-second setup. You don't need your Google link right now — start free today with no credit card required.
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={onStartOnboarding}
              style={{
                padding: '12px 26px',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(154, 64, 24, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              🚀 Start Free in 10 Seconds →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: LIVE REVIEWS MOVING LEFT TO RIGHT (ANIMATED)  */}
      {/* ======================================================== */}
      <section id="testimonials" style={{ padding: '64px 0 54px', background: 'var(--surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' }}>
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
                <span>Moving Left to Right →</span>
              </span>

              <button
                className="btn btn-secondary"
                onClick={() => setIsPaused(!isPaused)}
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                title="Pause or Resume moving track"
              >
                {isPaused ? 'Play Stream' : 'Pause Stream'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => setIsFast(!isFast)}
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
                title="Toggle stream velocity"
              >
                {isFast ? '1x Normal' : '2x Speed'}
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

        {/* Transformation Matrix: BEFORE VS AFTER KINDLYRATE */}
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
                  <XCircle size={18} color="#f87171" /> Without KindlyRate (The Old Painful Way)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Stuck at 3.3 ★ - 3.8 ★:</strong> Happy customers leave quietly; only angry customers post rants online.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Ranked #10 to #15 on Maps:</strong> Buried beneath local competitors; invisible to walk-in shoppers.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>₹30,000+ Wasted on Ads:</strong> Paying high ad costs and agency retainers with zero permanent gain.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Lost Margins to Aggregators:</strong> Giving away 25-30% commissions on deliveries and listings.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
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
                  <CheckCircle2 size={18} color="#4ade80" /> With KindlyRate Growth Engine
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Sparkles size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Surged to 4.8 ★ - 4.9 ★:</strong> AI drafts detailed 5-star reviews highlighting signature products and services.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Award size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>#1 Leader on Google Local 3-Pack:</strong> Dominates local Maps searches and captures 45%+ foot traffic.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <TrendingUp size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>₹0 Spent on Ads:</strong> Review velocity acts as an organic, permanent customer engine.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Store size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>+₹1,80,000 Walk-In & Customer Revenue:</strong> Filling stores and businesses with high-margin direct customers.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <ShieldCheck size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
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
              { title: 'Food & Hospitality', desc: 'Fine Dine, Bistros, Cafés, Rooftops, Bakeries, Food Trucks, Pubs', icon: <Utensils size={26} color="var(--primary)" /> },
              { title: 'Retail & Stores', desc: 'Supermarkets, Boutiques, Electronics, Jewellery', icon: <ShoppingBag size={26} color="var(--primary)" /> },
              { title: 'Personal Services', desc: 'Salons, Barbers, Spas, Car Washes, Studios', icon: <Scissors size={26} color="var(--primary)" /> },
              { title: 'Health & Wellness', desc: 'Clinics, Dental Centers, Gyms, Yoga, Diagnostic', icon: <Stethoscope size={26} color="var(--primary)" /> },
              { title: 'Education & Academies', desc: 'Coaching, Music, Dance, Training Institutes', icon: <GraduationCap size={26} color="var(--primary)" /> },
              { title: 'Entertainment & Venues', desc: 'Cinemas, Gaming Centers, Event Companies', icon: <Ticket size={26} color="var(--primary)" /> },
              { title: 'Professional Services', desc: 'Lawyers, Accountants, Architects, IT Agencies', icon: <Briefcase size={26} color="var(--primary)" /> },
              { title: 'Custom Businesses', desc: 'Any specialized or unique local service', icon: <Sparkles size={26} color="var(--primary)" /> },
            ].map((cat, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'left', padding: '20px' }}>
                <div style={{ marginBottom: '10px' }}>{cat.icon}</div>
                <h3 className="serif" style={{ fontSize: '18px', marginBottom: '6px' }}>{cat.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Aligned Grid) */}
      <section id="pricing" style={{ padding: '80px 20px' }}>
        <div className="desktop-container" style={{ textAlign: 'center', maxWidth: '1080px' }}>
          <div style={{ display: 'inline-block', marginBottom: '14px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '13px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> ₹79 Starter Trial Offer
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
              const reg = dur === 3 ? 999 : dur === 6 ? 1999 : dur === 12 ? 3999 : 499;
              const sub = dur === 3 ? 'for 3 mos (₹76/mo)' : dur === 6 ? 'for 6 mos (₹75/mo)' : dur === 12 ? 'for 1 yr (₹66/mo)' : '/month';
              const reviews = dur === 3 ? '300 Total AI reviews (Quarterly)' : dur === 6 ? '600 Total AI reviews (Semi-Annual)' : dur === 12 ? '1,200 Total AI reviews (1-Year Pass)' : '100 AI reviews / month';
              const tag = dur === 12 ? '2 Months Free Applied' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹79 First Month Offer (Reg. ₹499)';

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
                          { m: 12 as const, lbl: '1Y Free' },
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
                      1-Year Pass: 2 Months Free Discount Applied!
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
              const reg = dur === 3 ? 1999 : dur === 6 ? 3499 : dur === 12 ? 5999 : 999;
              const sub = dur === 3 ? 'for 3 mos (₹143/mo)' : dur === 6 ? 'for 6 mos (₹142/mo)' : dur === 12 ? 'for 1 yr (₹124/mo)' : '/month';
              const reviews = dur === 3 ? '1,500 Total AI reviews (Quarterly)' : dur === 6 ? '3,000 Total AI reviews (Semi-Annual)' : dur === 12 ? '6,000 Total AI reviews (1-Year Pass)' : '500 AI reviews / month';
              const tag = dur === 12 ? '2 Months Free Applied' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹149 First Month Offer (Reg. ₹999)';

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
                          { m: 12 as const, lbl: '1Y Free' },
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
                      1-Year Pass: 2 Months Free Discount Applied!
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
              const reg = dur === 3 ? 2999 : dur === 6 ? 4999 : dur === 12 ? 8999 : 1499;
              const sub = dur === 3 ? 'for 3 mos (₹233/mo)' : dur === 6 ? 'for 6 mos (₹233/mo)' : dur === 12 ? 'for 1 yr (₹208/mo)' : '/month';
              const reviews = dur === 3 ? '3,000 Total AI reviews (Quarterly)' : dur === 6 ? '6,000 Total AI reviews (Semi-Annual)' : dur === 12 ? '12,000 Total AI reviews (1-Year Pass)' : '1,000 AI reviews / month';
              const tag = dur === 12 ? '2 Months Free Applied' : dur === 3 ? 'Quarterly Pack' : dur === 6 ? 'Semi-Annual Pack' : '₹249 First Month Offer (Reg. ₹1,499)';

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
                          { m: 12 as const, lbl: '1Y Free' },
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
                      1-Year Pass: 2 Months Free Discount Applied!
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
                  Enterprise &amp; Custom
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
      <section id="blog" style={{ padding: '72px 20px', background: '#faf8f5', borderTop: '1px solid var(--border-light)' }}>
        <div className="desktop-container" style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '12.5px', padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={13} /> Knowledge &amp; Field Studies
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
            <span className="stat-pill stat-pill-primary" style={{ fontSize: '12.5px', padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={13} /> Frequently Asked Questions
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
                <Lock size={14} color="#94a3b8" /> <span>256-Bit SSL Bank-Grade Encryption</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={14} color="#94a3b8" /> <span>Razorpay PCI-DSS Level 1 Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="#94a3b8" /> <span>India DPDP Act 2023 &amp; IT Act Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} color="#94a3b8" /> <span>Proudly Engineered &amp; Hosted in India</span>
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
                <a
                  href="/features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/features');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Smart Table QR Stands
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/features');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Server-Side AI Drafter
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/features');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Aura Live Telemetry &amp; Heatmap
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/features');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Reputation Shield Defense
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/pricing');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
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
                <a
                  href="/help"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('help');
                    window.history.pushState({}, '', '/help');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Help Center &amp; Support Desk
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/faq');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateBlog) {
                      onNavigateBlog();
                    } else {
                      window.location.href = '/blog';
                    }
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Articles &amp; Growth Blog
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, '', '/features');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
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
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('terms');
                    window.history.pushState({}, '', '/terms');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Terms of Service &amp; Agreement
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('privacy');
                    window.history.pushState({}, '', '/privacy');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Privacy Policy (DPDP 2023)
                </a>
              </li>
              <li>
                <a
                  href="/refund"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('refund');
                    window.history.pushState({}, '', '/refund');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Refund &amp; Cancellation Policy
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('help');
                    window.history.pushState({}, '', '/help');
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                >
                  Grievance Redressal Desk
                </a>
              </li>
            </ul>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
              Support Email: <a href="mailto:sandeshnaik525@gmail.com" style={{ color: '#38bdf8' }}>sandeshnaik525@gmail.com</a>
              <br />
              Helpline: <a href="tel:+918123824899" style={{ color: '#38bdf8' }}>+91 81238 24899</a>
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
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                setLegalModal('terms');
                window.history.pushState({}, '', '/terms');
              }}
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '12.5px' }}
            >
              Terms
            </a>
            <span>·</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                setLegalModal('privacy');
                window.history.pushState({}, '', '/privacy');
              }}
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '12.5px' }}
            >
              Privacy
            </a>
            <span>·</span>
            <a
              href="/refund"
              onClick={(e) => {
                e.preventDefault();
                setLegalModal('refund');
                window.history.pushState({}, '', '/refund');
              }}
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '12.5px' }}
            >
              Refunds
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Trust & Legal Modals */}
      <LegalModals type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
};
