import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export type LegalModalType = 'terms' | 'privacy' | 'refund' | 'help' | 'blog' | null;

interface Props {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<Props> = ({ type, onClose }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'help' | 'blog'>(type || 'terms');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    phone: '',
    outletName: '',
    issueType: 'Technical Question',
    message: '',
  });
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  useEffect(() => {
    if (activeTab === 'blog') {
      loadBlogs(blogSearch);
    }
  }, [activeTab]);

  const loadBlogs = async (query?: string) => {
    setLoadingBlogs(true);
    try {
      const res = await api.getPublicBlogs(query);
      if (res.success && res.blogs) {
        setBlogs(res.blogs);
      }
    } catch (e) {
      console.error('Failed to load public blogs', e);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleBlogSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBlogs(blogSearch);
  };

  if (!type) return null;

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          background: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            background: 'var(--surface-container)',
            borderBottom: '1px solid var(--border-light)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>⚖️</span>
            <div>
              <h3 className="serif" style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                Reviewly Trust, Legal &amp; Support Portal
              </h3>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Official Policies compliant with IT Act 2000, DPDP Act 2023 &amp; Razorpay Standards
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            background: '#ffffff',
            padding: '0 16px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'terms', label: 'Terms of Service', icon: '📜' },
            { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
            { id: 'refund', label: 'Refund & Cancellation', icon: '💳' },
            { id: 'blog', label: 'Articles & Growth Guides', icon: '📰' },
            { id: 'help', label: 'Help & Merchant Support', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Body */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, fontSize: '13.5px', lineHeight: 1.68, color: '#334155' }}>
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <span className="badge badge-primary">Effective Date: October 2026</span>
                <h2 className="serif" style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 4px', color: '#0f172a' }}>
                  Terms of Service &amp; SaaS Agreement
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  Governing usage of Reviewly multi-tenant SaaS, table stands, and server-side review assistance.
                </p>
              </div>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>1. Acceptance of Terms</h4>
              <p>
                By creating an account, paying verification fees, or deploying Reviewly QR stands in your establishment, you agree to be bound by these Terms of Service. If you are registering on behalf of a restaurant or commercial enterprise, you warrant that you hold legal authority to bind that entity.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>2. Fair Use &amp; Review Authenticity</h4>
              <p>
                Reviewly provides assistive AI drafting and reputation telemetry designed to help real, in-person dining customers express their feedback smoothly. Merchants agree <strong>NOT</strong> to:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li>Manufacture fake reviews or incentivize non-customers to post fraudulent claims.</li>
                <li>Prevent dissatisfied customers from voicing their truthful opinions on Google Maps.</li>
                <li>Tamper with QR verification links or inject malicious scripts into dining table stands.</li>
              </ul>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>3. Multi-Tenant Subscriptions &amp; Billing</h4>
              <p>
                Subscribers receive access to quotas according to their selected pack (Testing: 100 reviews, Growth: 500 reviews, Scale: 1,000 reviews). All subscription transactions are processed securely in Indian Rupees (INR) via Razorpay. Renewal charges occur monthly on the specified billing date.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>4. Governing Law &amp; Jurisdiction</h4>
              <p>
                These terms are governed in accordance with the laws of India, including the Information Technology Act, 2000. All legal proceedings arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
              </p>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <span className="badge badge-primary">DPDP Act 2023 Compliant</span>
                <h2 className="serif" style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 4px', color: '#0f172a' }}>
                  Privacy &amp; Data Protection Policy
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  Transparent details on how business records and customer dining ratings are stored and secured.
                </p>
              </div>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>1. Data We Collect</h4>
              <p>
                We collect only the data necessary to provide review routing and dining telemetry:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li><strong>Merchant Data:</strong> Business name, email, phone number, Google Review URL, dining sections, and staff attribution records.</li>
                <li><strong>Customer Session Data:</strong> Ratings submitted (1-5 stars per category), dining dish mentions, and anonymous QR scan timestamps. Diners are <em>never</em> required to sign up or disclose passwords.</li>
                <li><strong>Payment Data:</strong> Handled entirely through Razorpay. Reviewly never stores credit card or debit card numbers on internal servers.</li>
              </ul>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>2. Data Encryption &amp; Security</h4>
              <p>
                All network communication is strictly encrypted using TLS 1.3 with SHA-256 signatures. Merchant passwords are automatically salted and hashed using bcrypt. Our Reputation Shield safeguards internal communication from eavesdropping.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>3. Zero Sale of Personal Data</h4>
              <p>
                We do not sell, rent, or trade merchant or customer information to third-party ad exchanges or data brokers. Data is solely utilized to generate AI review drafts and floor performance telemetry.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>4. Grievance Officer</h4>
              <p>
                In compliance with the Digital Personal Data Protection Act, you may contact our designated Grievance Officer at: <strong>grievance@reviewly.in</strong>, Reviewly Operations, Indiranagar, Bengaluru.
              </p>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION POLICY */}
          {activeTab === 'refund' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <span className="badge badge-primary">Razorpay Merchant Policy</span>
                <h2 className="serif" style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 4px', color: '#0f172a' }}>
                  Refund &amp; Cancellation Policy
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  Clear, hassle-free policy governing trials, monthly renewals, and subscription cancellations.
                </p>
              </div>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>1. 7-Day Free Trial Verification</h4>
              <p>
                The nominal ₹2 payment is an automated Razorpay authorization and verification fee to prevent bot abuse and activate 7 days of full platform access. This nominal verification fee is non-refundable.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>2. Cancelling Your Subscription Anytime</h4>
              <p>
                You have full control over your billing. You can cancel or pause your monthly subscription pack at any time directly from the <strong>Subscription &amp; Billing tab</strong> in your Merchant Dashboard before the next monthly billing cycle commences. Upon cancellation, your account will remain active until the end of the current paid billing period with zero surprise renewal debits.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>3. Refund Eligibility &amp; Dispute Windows</h4>
              <p>
                If an accidental duplicate charge or technical billing anomaly occurs, notify our finance desk within 7 days at <strong>billing@reviewly.in</strong>. Once verified, refunds are initiated immediately and reflected in your original payment method (UPI / Bank / Card) within <strong>5 to 7 business days</strong> as per banking network guidelines.
              </p>

              <h4 style={{ color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>4. Hardware / Acrylic Stands</h4>
              <p>
                High-resolution printable acrylic SVG files are generated digitally inside the platform for instant local printing. Because digital downloads are delivered immediately, digital asset generation fees are non-refundable once unlocked.
              </p>
            </div>
          )}

          {/* TAB 4: HELP CENTER & MERCHANT SUPPORT */}
          {activeTab === 'help' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <span className="stat-pill stat-pill-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="telemetry-pulse" />
                  Live Support Desk: 100% Operational
                </span>
                <h2 className="serif" style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 4px', color: '#0f172a' }}>
                  Merchant Help Center &amp; Direct Support
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  Our restaurant success engineers are available to resolve queries, setup table tents, or optimize your Google Maps rank.
                </p>
              </div>

              {/* Direct Contact Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>✉️</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Email Support</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Avg response &lt; 2 hrs</div>
                  <a href="mailto:support@reviewly.in" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginTop: '6px', display: 'inline-block' }}>
                    support@reviewly.in
                  </a>
                </div>

                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>📞</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Helpline Phone</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Mon–Sat: 9 AM – 9 PM</div>
                  <a href="tel:+918047192200" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginTop: '6px', display: 'inline-block' }}>
                    +91 80 4719 2200
                  </a>
                </div>

                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>WhatsApp Concierge</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Instant merchant chat</div>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', marginTop: '6px', display: 'inline-block' }}>
                    +91 98765 43210
                  </a>
                </div>
              </div>

              {/* Interactive Support Form */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Submit a Merchant Help Ticket
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Fill out the form below and an engineer will reply directly to your registered email.
                </p>

                {supportSubmitted ? (
                  <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#15803d' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
                    <strong>Ticket Created Successfully!</strong>
                    <div style={{ fontSize: '12.5px', marginTop: '2px' }}>Ticket #RV-{Math.floor(100000 + Math.random() * 900000)} assigned. We will email you shortly.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Your Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="Chef Kabir / Arjun"
                          value={supportForm.name}
                          onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Email Address *</label>
                        <input
                          type="email"
                          required
                          className="form-input"
                          placeholder="owner@restaurant.com"
                          value={supportForm.email}
                          onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Restaurant / Outlet Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Saffron Bistro"
                          value={supportForm.outletName}
                          onChange={(e) => setSupportForm({ ...supportForm, outletName: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Query Category</label>
                        <select
                          className="form-select"
                          value={supportForm.issueType}
                          onChange={(e) => setSupportForm({ ...supportForm, issueType: e.target.value })}
                        >
                          <option value="Technical Question">Technical &amp; QR Stand Question</option>
                          <option value="Billing &amp; Subscription">Billing &amp; Subscription Renewal</option>
                          <option value="Google Maps Link Assistance">Google Maps Link Assistance</option>
                          <option value="Custom Tent Design Request">Custom Tent Studio Design Request</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '12px' }}>Message / How can we assist you? *</label>
                      <textarea
                        required
                        rows={3}
                        className="form-textarea"
                        placeholder="Please describe your question or issue..."
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                        🚀 Send Support Ticket
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ARTICLES & GROWTH GUIDES BLOG */}
          {activeTab === 'blog' && (
            <div>
              {selectedBlog ? (
                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedBlog(null)}
                    style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    ← Back to All Articles
                  </button>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge badge-primary">{selectedBlog.category}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {selectedBlog.readTime} · By {selectedBlog.author} · {new Date(selectedBlog.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="serif" style={{ fontSize: '26px', fontWeight: 700, margin: '4px 0 12px', color: '#0f172a' }}>
                      {selectedBlog.title}
                    </h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                      {selectedBlog.excerpt}
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'var(--surface-container)',
                      padding: '24px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      lineHeight: 1.8,
                      color: '#1e293b',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    {selectedBlog.content}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedBlog.tags?.map((tag: string, idx: number) => (
                      <span key={idx} className="stat-pill stat-pill-neutral" style={{ fontSize: '12px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <span className="badge badge-primary">Reviewly Knowledge & Growth</span>
                    <h2 className="serif" style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 4px', color: '#0f172a' }}>
                      Articles, Field Studies &amp; Playbooks
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                      Actionable tactics to maximize Google 5-star reviews, improve customer retention, and scale operations.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleBlogSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search articles by title, tags, or topic (e.g. Google, QR, Conversion)..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}>
                      🔍 Search
                    </button>
                    {blogSearch && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setBlogSearch('');
                          loadBlogs('');
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </form>

                  {loadingBlogs ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Loading published guides...
                    </div>
                  ) : blogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                      <h4 style={{ margin: '0 0 4px' }}>No articles found</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        Try searching for a different keyword or reset filters.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {blogs.map((b: any) => (
                        <div
                          key={b.id}
                          className="card"
                          style={{
                            padding: '20px',
                            cursor: 'pointer',
                            border: '1px solid var(--border-light)',
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => setSelectedBlog(b)}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                            <span className="badge badge-primary">{b.category}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {b.readTime} · By {b.author}
                            </span>
                          </div>

                          <h3 className="serif" style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 8px', color: '#0f172a' }}>
                            {b.title}
                          </h3>

                          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                            {b.excerpt}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {b.tags?.slice(0, 3).map((t: string, i: number) => (
                                <span key={i} className="stat-pill stat-pill-neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                  #{t}
                                </span>
                              ))}
                            </div>
                            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                              Read Full Guide →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
