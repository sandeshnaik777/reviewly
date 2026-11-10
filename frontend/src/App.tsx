import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { CustomerReviewFlow } from './pages/CustomerReviewFlow.js';
import { OnboardingWizard } from './pages/OnboardingWizard.js';
import { BusinessDashboard } from './pages/BusinessDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { BlogPage } from './pages/BlogPage.js';
import { ThankYouPage } from './pages/ThankYouPage.js';
import { CareersPage } from './pages/CareersPage.js';
import { updatePageSeo } from './utils/seo.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard' | 'admin' | 'customer' | 'blog' | 'thank-you' | 'careers'>('landing');
  const [customerSlug, setCustomerSlug] = useState<string>('');
  const [blogSlug, setBlogSlug] = useState<string>('');
  const [initialLandingSection, setInitialLandingSection] = useState<string>('');
  const [initialOnboardingStep, setInitialOnboardingStep] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Sync client-side SEO tags (Title, Canonical, Description)
  useEffect(() => {
    const path = window.location.pathname;
    const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
    if (view === 'landing') {
      if (normalized === '/google-review-stand') {
        updatePageSeo({
          title: 'Smart Google Review Stands (NFC + QR) for Countertops — KindlyRate',
          description: 'Boost 5-star Google Maps reviews with KindlyRate laser-cut acrylic smart QR & NFC counter stands. Tap with phone or scan QR code in 3 seconds. Pre-programmed, zero setup, starts at ₹79.',
          path: '/google-review-stand',
        });
      } else if (normalized === '/google-maps-seo') {
        updatePageSeo({
          title: 'Google Maps Local 3-Pack SEO & Ranking Booster Software — KindlyRate',
          description: 'Dominate Google Maps local search with KindlyRate. Accelerate genuine review velocity, inject high-intent search keywords into customer reviews, and capture Rank #1 on Google Local 3-Pack.',
          path: '/google-maps-seo',
        });
      } else if (normalized === '/negative-review-shield') {
        updatePageSeo({
          title: 'Reputation Shield — Stop Unfair 1-Star Google Reviews Legally | KindlyRate',
          description: 'Protect your Google Maps rating from damaging 1-star reviews. KindlyRate 100% Reputation Shield intercepts dissatisfied customer feedback privately before it hits Google Maps.',
          path: '/negative-review-shield',
        });
      } else if (normalized === '/google-reviews-for-restaurants') {
        updatePageSeo({
          title: 'Google Review Stands for Restaurants & Cafes — KindlyRate',
          description: 'Turn dining customers into verified 5-star Google Maps reviews. Custom acrylic table talkers and bill-folder QR stands for restaurants, cafes, bars, and bakeries.',
          path: '/google-reviews-for-restaurants',
        });
      } else if (normalized === '/google-reviews-for-clinics') {
        updatePageSeo({
          title: 'Google Reviews for Dental Clinics & Healthcare Practices — KindlyRate',
          description: 'Help patients share positive treatment experiences on Google Maps. Smart reception desk review stands for dental clinics, dermatologists, eye care, and doctors.',
          path: '/google-reviews-for-clinics',
        });
      } else if (normalized === '/google-reviews-for-salons') {
        updatePageSeo({
          title: 'Google Review Stands for Salons, Spas & Beauty Parlours — KindlyRate',
          description: 'Boost salon walk-ins and appointment bookings. Smart mirror and reception QR stands for hair salons, unisex beauty parlours, nail bars, and luxury spas.',
          path: '/google-reviews-for-salons',
        });
      } else if (normalized === '/google-reviews-for-retail') {
        updatePageSeo({
          title: 'Google Review Stands for Retail Shops & Showrooms — KindlyRate',
          description: 'Capture customer reviews at the cash register. Smart acrylic counter stands for clothing boutiques, electronics stores, optical shops, jewellery, and supermarkets.',
          path: '/google-reviews-for-retail',
        });
      } else if (initialLandingSection === 'pricing' || normalized === '/pricing') {
        updatePageSeo({
          title: 'Pricing & Transparent Subscription Plans — KindlyRate',
          description: 'Explore affordable KindlyRate pricing: Starter Pack at ₹79, Growth Pack at ₹149/mo, and Scale Pro at ₹249/mo. Smart NFC QR counter stands, AI review assistant, and local SEO booster.',
          path: '/pricing',
        });
      } else if (initialLandingSection === 'features' || normalized === '/features') {
        updatePageSeo({
          title: 'Platform Features & Smart QR Stand Technology — KindlyRate',
          description: 'Discover KindlyRate features: Smart QR & NFC counter stands, dynamic AI review assistant, 100% negative feedback interception shield, and Google Maps Local 3-Pack rank booster.',
          path: '/features',
        });
      } else if (initialLandingSection === 'faq' || normalized === '/faq') {
        updatePageSeo({
          title: 'Frequently Asked Questions — KindlyRate Google Reviews Platform',
          description: 'Frequently asked questions about KindlyRate: How smart QR stands work, pricing, Google Maps compliance, negative review interception, and hardware delivery.',
          path: '/faq',
        });
      } else {
        updatePageSeo({
          title: 'KindlyRate — #1 AI Google Reviews & Local SEO Platform for Every Business',
          description: 'Turn happy customers into verified 5-star Google Maps reviews automatically with KindlyRate. Smart QR counter stands, AI-assisted natural English drafting, target keyword injection, and 100% Reputation Shield.',
          path: '/',
        });
      }
    } else if (view === 'login') {
      updatePageSeo({
        title: 'Merchant Sign In — KindlyRate Business Portal',
        description: 'Log into your KindlyRate merchant portal to monitor real-time QR stand scans, customize AI prompt keywords, view analytics, and manage customer reviews.',
        path: '/login',
      });
    } else if (view === 'onboarding') {
      updatePageSeo({
        title: 'Get Started Free — Create Your KindlyRate Merchant Account',
        description: 'Create your KindlyRate merchant account in 60 seconds. Claim your smart review stand, configure your Google Business Profile, and start capturing 5-star reviews.',
        path: '/signup',
      });
    } else if (view === 'blog' && !blogSlug) {
      updatePageSeo({
        title: 'Local SEO Playbooks & Google Maps Ranking Guides — KindlyRate Blog',
        description: 'Expert actionable playbooks on Google Maps Local 3-Pack optimization, smart QR counter stands, review velocity algorithms, and legal reputation management for brick-and-mortar merchants.',
        path: '/blog',
      });
    } else if (view === 'careers') {
      updatePageSeo({
        title: 'Careers at KindlyRate — Join Our High-Growth Team',
        description: 'Explore exciting career opportunities at KindlyRate. We are hiring across Sales & BD, Full-Stack Engineering, Product Design, Local SEO, and Cloud Operations in Bengaluru and across India.',
        path: '/careers',
      });
    }
  }, [view, initialLandingSection, blogSlug]);

  useEffect(() => {
    const path = window.location.pathname;
    const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path;

    // Check if customer is on post-payment Thank You page (Google Ads conversion target)
    if (normalizedPath === '/thank-you' || normalizedPath === '/success' || normalizedPath === '/order-confirmed') {
      setView('thank-you');
      setLoading(false);
      return;
    }

    // Check if visitor is navigating to /careers
    if (normalizedPath === '/careers' || normalizedPath === '/jobs') {
      setView('careers');
      setLoading(false);
      return;
    }

    // Check if customer is scanning QR code (/r/:slug)
    const match = path.match(/^\/r\/([^/]+)/);
    if (match && match[1]) {
      setCustomerSlug(match[1]);
      setView('customer');
      setLoading(false);
      return;
    }

    // Check if visitor is navigating to /blog or /blog/:slug
    const blogMatch = path.match(/^\/blog(?:\/([^/]+))?/);
    if (blogMatch) {
      setBlogSlug(blogMatch[1] || '');
      setView('blog');
      setLoading(false);
      return;
    }

    // Direct vanity route mapping for smooth ad campaign landers & Google Sitelinks
    if (normalizedPath === '/onboarding' || normalizedPath === '/signup' || normalizedPath === '/register' || normalizedPath === '/start') {
      setView('onboarding');
    } else if (normalizedPath === '/login' || normalizedPath === '/signin') {
      setView('login');
    } else if (normalizedPath === '/pricing') {
      setInitialLandingSection('pricing');
      setView('landing');
    } else if (normalizedPath === '/features') {
      setInitialLandingSection('features');
      setView('landing');
    } else if (normalizedPath === '/faq') {
      setInitialLandingSection('faq');
      setView('landing');
    } else if (
      normalizedPath === '/google-review-stand' ||
      normalizedPath === '/google-maps-seo' ||
      normalizedPath === '/negative-review-shield' ||
      normalizedPath.startsWith('/google-reviews-for-')
    ) {
      setInitialLandingSection('features');
      setView('landing');
    }

    // Handle Google OAuth callback redirect parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const authError = urlParams.get('auth_error');
    const flowFromUrl = urlParams.get('flow');
    const stepParam = urlParams.get('step');

    if (stepParam) {
      const parsedStep = parseInt(stepParam, 10);
      if (!isNaN(parsedStep)) {
        setInitialOnboardingStep(parsedStep);
      }
    }

    if (flowFromUrl === 'onboarding') {
      setView('onboarding');
      if (!stepParam) {
        setInitialOnboardingStep(2);
      }
    }

    if (tokenFromUrl) {
      localStorage.setItem('kindlyrate_token', tokenFromUrl);
      localStorage.setItem('kindlyreview_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (authError) {
      if (authError === 'google_not_configured') {
        alert('Google OAuth Setup Required: Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.');
      } else {
        console.warn('[GoogleAuth] OAuth callback notice:', authError);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check existing authentication session only if a token exists in storage
    const hasToken = typeof localStorage !== 'undefined' && Boolean(
      tokenFromUrl || localStorage.getItem('kindlyrate_token') || localStorage.getItem('kindlyreview_token') || localStorage.getItem('reviewly_token')
    );

    if (!hasToken) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);
          if (res.user.role === 'PLATFORM_ADMIN') {
            setView('admin');
          } else if (res.businesses && res.businesses.length > 0 && flowFromUrl !== 'onboarding') {
            setCurrentBusiness(res.businesses[0]);
            setView('dashboard');
          } else {
            setView('onboarding');
            // Logged-in user setting up a business: skip Step 1 credentials directly to Step 2
            setInitialOnboardingStep((prev) => prev || 2);
          }
        }
      })
      .catch(() => {
        // Not authenticated or token expired
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLoginSuccess = (user: any, businesses: any[]) => {
    setCurrentUser(user);
    if (user.role === 'PLATFORM_ADMIN') {
      setView('admin');
      window.history.pushState({}, '', '/');
    } else if (businesses && businesses.length > 0) {
      setCurrentBusiness(businesses[0]);
      setView('dashboard');
      window.history.pushState({}, '', '/');
    } else {
      setInitialOnboardingStep(2);
      setView('onboarding');
      window.history.pushState({}, '', '/onboarding');
    }
  };

  const handleOnboardingComplete = (business: any) => {
    setCurrentBusiness(business);
    setView('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setCurrentUser(null);
    setCurrentBusiness(null);
    setView('landing');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)' }}></div>
      </div>
    );
  }

  // Customer QR View (Zero account needed)
  if (view === 'customer' && customerSlug) {
    return <CustomerReviewFlow slug={customerSlug} />;
  }

  // Thank You / Order Confirmation View (For Google Ads & Meta Pixel Conversion Tracking)
  if (view === 'thank-you') {
    return (
      <ThankYouPage
        businessName={currentBusiness?.name}
        onNavigateDashboard={() => {
          if (currentBusiness) {
            setView('dashboard');
            window.history.pushState({}, '', '/');
          } else {
            setView('login');
            window.history.pushState({}, '', '/');
          }
        }}
        onNavigateHome={() => {
          setView('landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Platform Admin View
  if (view === 'admin' && currentUser?.role === 'PLATFORM_ADMIN') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Business Owner / Manager Dashboard
  if (view === 'dashboard' && currentBusiness) {
    return (
      <BusinessDashboard
        businessId={currentBusiness.id}
        initialBusiness={currentBusiness}
        onLogout={handleLogout}
        onSwitchBusiness={() => {}}
      />
    );
  }

  // Onboarding Wizard
  if (view === 'onboarding') {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onNavigateLogin={() => setView('login')}
        onNavigateHome={() => setView('landing')}
        currentUser={currentUser}
        initialStep={initialOnboardingStep}
      />
    );
  }

  // Login View
  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setView('onboarding')}
        onNavigateHome={() => setView('landing')}
      />
    );
  }

  // Blog Hub & Dedicated Article Reader
  if (view === 'blog') {
    return (
      <BlogPage
        initialSlug={blogSlug}
        onNavigateHome={() => {
          setView('landing');
          window.history.pushState({}, '', '/');
        }}
        onStartOnboarding={() => setView('onboarding')}
        onNavigateLogin={() => setView('login')}
      />
    );
  }

  // Careers & Job Openings View
  if (view === 'careers') {
    return (
      <CareersPage
        onNavigateHome={() => {
          setView('landing');
          window.history.pushState({}, '', '/');
        }}
        onStartOnboarding={() => setView('onboarding')}
        onNavigateLogin={() => setView('login')}
      />
    );
  }

  // Public Landing Page
  return (
    <LandingPage
      onStartOnboarding={() => setView('onboarding')}
      onNavigateLogin={() => setView('login')}
      initialSection={initialLandingSection}
      onNavigateBlog={(slug?: string) => {
        if (slug) {
          window.history.pushState({}, '', `/blog/${slug}`);
          setBlogSlug(slug);
        } else {
          window.history.pushState({}, '', '/blog');
          setBlogSlug('');
        }
        setView('blog');
      }}
      onNavigateCareers={() => {
        window.history.pushState({}, '', '/careers');
        setView('careers');
      }}
    />
  );
};
