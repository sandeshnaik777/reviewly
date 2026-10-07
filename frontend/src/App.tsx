import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { CustomerReviewFlow } from './pages/CustomerReviewFlow.js';
import { OnboardingWizard } from './pages/OnboardingWizard.js';
import { BusinessDashboard } from './pages/BusinessDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { LandingPage } from './pages/LandingPage.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard' | 'admin' | 'customer'>('landing');
  const [customerSlug, setCustomerSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer is scanning QR code (/r/:slug)
    const path = window.location.pathname;
    const match = path.match(/^\/r\/([^/]+)/);

    if (match && match[1]) {
      setCustomerSlug(match[1]);
      setView('customer');
      setLoading(false);
      return;
    }

    // Check existing authentication session
    api
      .getMe()
      .then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);
          if (res.user.role === 'PLATFORM_ADMIN') {
            setView('admin');
          } else if (res.businesses && res.businesses.length > 0) {
            setCurrentBusiness(res.businesses[0]);
            setView('dashboard');
          }
        }
      })
      .catch(() => {
        // Not authenticated
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

  // Public Landing Page
  return (
    <LandingPage
      onStartOnboarding={() => setView('onboarding')}
      onNavigateLogin={() => setView('login')}
    />
  );
};
