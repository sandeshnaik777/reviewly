import React, { Component, ErrorInfo, ReactNode } from 'react';
import { KindlyRateBrand } from './Logos.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KindlyRate ErrorBoundary caught exception]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearAndLogin = () => {
    try {
      localStorage.removeItem('kindlyrate_token');
      localStorage.removeItem('kindlyreview_token');
      localStorage.removeItem('reviewly_token');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#faf8f5',
            padding: '24px 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '18px',
              padding: '36px 32px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <KindlyRateBrand iconSize={40} fontSize={24} />
            </div>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                border: '2px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 16px',
              }}
            >
              ⚡
            </div>

            <h2
              style={{
                fontSize: '21px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 8px 0',
                letterSpacing: '-0.3px',
              }}
            >
              KindlyRate Session Recovered
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: 1.55,
                margin: '0 0 24px 0',
              }}
            >
              Your data and account settings are completely safe. A temporary rendering glitch was prevented from crashing the screen.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(194, 65, 12, 0.3)',
                }}
              >
                ↻ Refresh Dashboard
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '11px 20px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to KindlyRate Home
              </button>

              <button
                type="button"
                onClick={this.handleClearAndLogin}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  padding: '8px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign In with Different Account
              </button>
            </div>

            <div
              style={{
                paddingTop: '18px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '12px',
                color: '#94a3b8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span>Need help? Call +91 81238 24899</span>
              <span>·</span>
              <span>WhatsApp / Email Support</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
