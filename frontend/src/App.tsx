import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { CustomerReviewFlow } from './pages/CustomerReviewFlow.js';
import { OnboardingWizard } from './pages/OnboardingWizard.js';
import { BusinessDashboard } from './pages/BusinessDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { BlogPage } from './pages/BlogPage.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard' | 'admin' | 'customer' | 'blog'>('landing');
  const [customerSlug, setCustomerSlug] = useState<string>('');
  const [blogSlug, setBlogSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;

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

    // Handle Google OAuth callback redirect parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const authError = urlParams.get('auth_error');
    const flowFromUrl = urlParams.get('flow');

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
    } else if (businesses && businesses.length > 0) {
      setCurrentBusiness(businesses[0]);
      setView('dashboard');
    } else {
      setView('onboarding');
    }
  };

  const handleOnboardingComplete = (business: any) => {
    setCurrentBusiness(business);
    setView('dashboard');
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

  // Platform Admin View
  if (view === 'admin' && currentUser?.role === 'PLATFORM_ADMIN') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Business Owner / Manager Dashboard
  if (view === 'dashboard' && currentBusiness) {
    return (
      <BusinessDashboard
        businessId={currentBusiness.id}
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

  // Public Landing Page
  return (
    <LandingPage
      onStartOnboarding={() => setView('onboarding')}
      onNavigateLogin={() => setView('login')}
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
    />
  );
};
