import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'plans' | 'blogs' | 'notifications' | 'inquiries' | 'logs'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Blog Management State
  const [blogSearch, setBlogSearch] = useState('');
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Google Maps SEO',
    excerpt: '',
    content: '',
    author: 'Reviewly Editorial Team',
    readTime: '4 min read',
    tags: 'google-reviews, local-seo',
    isPublished: true,
  });

  // Modal States
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'PROMO',
    targetBusinessId: '',
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const [selectedContactBusiness, setSelectedContactBusiness] = useState<any | null>(null);
  const [contactNote, setContactNote] = useState('');
  const [limitEditBusiness, setLimitEditBusiness] = useState<any | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<number>(1000);

  // Search & Filter states for Customer / Tenant Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'usage' | 'qrs'>('newest');

  // Manual Creation Form
  const [newBizForm, setNewBizForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    mainCategory: 'FOOD & HOSPITALITY',
    subcategory: 'Restaurant',
    city: 'Bengaluru',
    planSlug: 'starter',
    customReviewLimit: 100,
    paymentStatus: 'ACTIVE',
    googleReviewUrl: '',
  });

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, bRes, pRes, lRes, nRes, iRes, blRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminBusinesses(),
        api.getAdminPlans(),
        api.getAuditLogs(),
        api.getAdminNotifications().catch(() => []),
        api.getAdminInquiries().catch(() => []),
        api.getAdminBlogs().catch(() => ({ success: true, blogs: [] })),
      ]);
      setStats(sRes);
      setBusinesses(bRes);
      setPlans(pRes);
      setLogs(lRes);
      setNotifications(nRes || []);
      setInquiries(iRes || []);
      setBlogs(blRes?.blogs || []);
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async (query?: string) => {
    setLoadingBlogs(true);
    try {
      const res = await api.getAdminBlogs(query);
      if (res.success && res.blogs) {
        setBlogs(res.blogs);
      }
    } catch (err: any) {
      showNotification(`Failed to search blogs: ${err.message}`);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const openNewBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      category: 'Google Maps SEO',
      excerpt: '',
      content: '',
      author: 'Reviewly Editorial Team',
      readTime: '4 min read',
      tags: 'google-reviews, local-seo',
      isPublished: true,
    });
    setShowBlogModal(true);
  };

  const openEditBlog = (b: any) => {
    setEditingBlog(b);
    setBlogForm({
      title: b.title,
      category: b.category,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      readTime: b.readTime,
      tags: b.tags?.join(', ') || '',
      isPublished: b.isPublished,
    });
    setShowBlogModal(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArr = blogForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        ...blogForm,
        tags: tagsArr,
      };
      if (editingBlog) {
        await api.updateAdminBlog(editingBlog.id, payload);
        showNotification('Article updated successfully!');
      } else {
        await api.createAdminBlog(payload);
        showNotification('New article published successfully!');
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      loadBlogs(blogSearch);
    } catch (err: any) {
      showNotification(`Failed to save article: ${err.message}`);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.deleteAdminBlog(id);
      showNotification('Article deleted.');
      loadBlogs(blogSearch);
    } catch (err: any) {
      showNotification(`Failed to delete: ${err.message}`);
    }
  };

  const handleTogglePublish = async (b: any) => {
    try {
      await api.updateAdminBlog(b.id, { isPublished: !b.isPublished });
      showNotification(b.isPublished ? 'Article unpublished (Draft mode).' : 'Article published live!');
      loadBlogs(blogSearch);
    } catch (err: any) {
      showNotification(`Failed to toggle status: ${err.message}`);
    }
  };

  // Broadcast Notification
  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingBroadcast(true);
      await api.createAdminNotification({
        title: broadcastForm.title,
        message: broadcastForm.message,
        type: broadcastForm.type,
        targetBusinessId: broadcastForm.targetBusinessId || undefined,
      });
      showNotification('📢 System Announcement successfully broadcasted to merchants!');
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', type: 'INFO', targetBusinessId: '' });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast notification.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Delete Broadcast Notification
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to retract/delete this announcement?')) return;
    try {
      await api.deleteAdminNotification(id);
      showNotification('Announcement retracted.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notification.');
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateInquiryStatus(id, newStatus);
      showNotification(`Inquiry status updated to ${newStatus}`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry status.');
    }
  };

  // Toggle Suspend / Reactivate
  const handleToggleBusinessStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleBusinessStatus(id, !currentStatus);
      showNotification(`Business ${!currentStatus ? 'Reactivated' : 'Suspended'} successfully`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update business status.');
    }
  };

  // Update Quota Limit
  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitEditBusiness) return;
    try {
      await api.updateBusinessLimit(limitEditBusiness.id, Number(newLimitValue));
      showNotification(`Monthly review generation limit updated to ${newLimitValue}!`);
      setLimitEditBusiness(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update quota limit.');
    }
  };

  // Update Payment Status
  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      await api.updatePaymentStatus(id, status);
      showNotification(`Payment status updated to ${status}`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status.');
    }
  };

  // Save Contact Note
  const handleSaveContactLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactBusiness || !contactNote.trim()) return;
    try {
      await api.addContactLog(selectedContactBusiness.id, contactNote.trim());
      showNotification('Call / Contact note recorded in audit trail!');
      setContactNote('');
      setSelectedContactBusiness(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save contact log.');
    }
  };

  // Manual Business Submit
  const handleManualCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBusinessManual(newBizForm);
      showNotification(`Business "${newBizForm.businessName}" created successfully!`);
      setShowAddBusinessModal(false);
      setNewBizForm({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        mainCategory: 'FOOD & HOSPITALITY',
        subcategory: 'Restaurant',
        city: 'Bengaluru',
        planSlug: 'starter',
        customReviewLimit: 100,
        paymentStatus: 'ACTIVE',
        googleReviewUrl: '',
      });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create business.');
    }
  };

  // Filtered & Sorted Customer / Tenant Businesses
  const filteredBusinesses = businesses
    .filter((b) => {
      // 1. Text Search across name, owner name, email, phone, city, subcategory, slug
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesOwner = b.owner?.name?.toLowerCase().includes(q);
        const matchesEmail = b.owner?.email?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q);
        const matchesPhone = b.owner?.phone?.includes(q) || b.phone?.includes(q);
        const matchesCity = b.city?.toLowerCase().includes(q);
        const matchesSubcategory = b.subcategory?.toLowerCase().includes(q);
        const matchesMainCategory = b.mainCategory?.toLowerCase().includes(q);
        const matchesSlug = b.slug?.toLowerCase().includes(q);

        if (!matchesName && !matchesOwner && !matchesEmail && !matchesPhone && !matchesCity && !matchesSubcategory && !matchesMainCategory && !matchesSlug) {
          return false;
        }
      }

      // 2. Plan filter
      if (filterPlan !== 'ALL') {
        const pName = (b.subscription?.planName || '').toLowerCase();
        if (filterPlan === 'trial' && !pName.includes('trial')) return false;
        if (filterPlan === 'starter' && !(pName.includes('starter') || pName.includes('testing'))) return false;
        if (filterPlan === 'growth' && !pName.includes('growth')) return false;
        if (filterPlan === 'pro' && !(pName.includes('pro') || pName.includes('scale'))) return false;
      }

      // 3. Payment status filter
      if (filterPayment !== 'ALL') {
        if (b.subscription?.status !== filterPayment) return false;
      }

      // 4. Account status filter
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'ACTIVE' && !b.isActive) return false;
        if (filterStatus === 'SUSPENDED' && b.isActive) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'usage') {
        return (b.subscription?.percentUsed || 0) - (a.subscription?.percentUsed || 0);
      }
      if (sortBy === 'qrs') {
        return (b.qrCount || 0) - (a.qrCount || 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--text)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 className="serif" style={{ fontSize: '26px' }}>Platform Super-Admin Portal</h2>
          <span className="badge badge-primary">Operations & Finance</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowBroadcastModal(true)}
            style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff', fontWeight: 600, fontSize: '13.5px' }}
          >
            📢 Broadcast Announcement
          </button>
          <button className="btn btn-secondary" onClick={loadAdminData}>
            🔄 Refresh Metrics
          </button>
          <button className="btn btn-outline" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="desktop-container" style={{ padding: '24px 20px' }}>
        <div className="segmented-nav">
          <button
            className={`segmented-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Financial & API Observability
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'businesses' ? 'active' : ''}`}
            onClick={() => setActiveTab('businesses')}
          >
            Tenant Businesses ({businesses.length})
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Subscription Plans & Pricing
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Broadcast Notifications ({notifications.length})
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            Custom Software Leads ({inquiries.length})
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            Articles &amp; Blogs ({blogs.length})
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Audit &amp; Rate-Limit Logs
          </button>
        </div>

        {/* TAB 1: Financial & API Observability */}
        {activeTab === 'overview' && (
          <div>
            {/* Row 1: Revenue & Growth Cards */}
            <div style={{ marginBottom: '28px' }}>
              <h3 className="serif" style={{ fontSize: '22px', marginBottom: '14px' }}>
                Revenue Growth & Subscription Health
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monthly Recurring Revenue (MRR)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                    ₹{(stats?.mrrInr || 0).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                    ▲ +{stats?.revenueGrowthRatePct || 24.8}% MoM Growth
                  </div>
                </div>

                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Captured Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>
                    ₹{(stats?.totalRevenueInr || 0).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    ARR Run-Rate: ₹{(stats?.arrInr || 0).toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Paid Subscriptions</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
                    {stats?.activeSubscriptions || 0}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Trials: {stats?.trialSubscriptions || 0} active
                  </div>
                </div>

                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overdue / Unpaid Subscriptions</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: (stats?.overdueSubscriptions || 0) > 0 ? 'var(--error)' : 'var(--text)' }}>
                    {stats?.overdueSubscriptions || 0}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Requires owner follow-up
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: API & System Observability (Rate limits, retries, latency) */}
            <div style={{ marginBottom: '28px' }}>
              <h3 className="serif" style={{ fontSize: '22px', marginBottom: '14px' }}>
                API Traffic, Rate-Limits & AI Health
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total API Request Volume</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
                    {(stats?.apiObservability?.totalApiRequests || 1482).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>Across all customer QR scans & APIs</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rate Limit Hits (429 Throttled)</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--warning)' }}>
                    {stats?.apiObservability?.rateLimitHits || 14}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>Protected against automated abuse</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Client Retry Attempts</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--text)' }}>
                    {stats?.apiObservability?.retryAttempts || 23}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>Tracked retry attempts</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gemini AI Success Rate</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
                    {stats?.apiObservability?.aiSuccessRatePct || 99.4}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>Avg Latency: {stats?.apiObservability?.avgLatencyMs || 135}ms</div>
                </div>
              </div>
            </div>

            {/* Row 3: Revenue Distribution by Plan */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 className="serif" style={{ fontSize: '20px', marginBottom: '16px' }}>Revenue Distribution by Subscription Plan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {(stats?.revenueByPlan || []).map((p: any, idx: number) => (
                  <div key={idx} style={{ padding: '16px', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{p.planName}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>
                      ₹{p.priceInr} <span style={{ fontSize: '12px', fontWeight: 400 }}>/month</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <strong>{p.subscribers}</strong> Active Businesses
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Monthly Contribution: <strong>₹{(p.monthlyRevenueInr || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Tenant Businesses Directory & Management */}
        {activeTab === 'businesses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '24px' }}>Tenant Businesses & Customer Directory</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                  Real-time customer search, quota management, account status, and merchant communication.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddBusinessModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>➕</span> Add Business Manually
              </button>
            </div>

            {/* SEARCH & FILTER TOOLBAR */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: '20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Input Box */}
                <div style={{ flex: '1 1 280px', position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      fontSize: '15px',
                    }}
                  >
                    🔍
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      paddingLeft: '36px',
                      paddingRight: searchQuery ? '36px' : '12px',
                      fontSize: '13.5px',
                      height: '42px',
                      background: 'var(--surface-container)',
                    }}
                    placeholder="Search by restaurant name, owner, email, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px',
                      }}
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Plan Filter */}
                <div style={{ minWidth: '150px' }}>
                  <select
                    className="form-select"
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    style={{ height: '42px', fontSize: '13px', background: 'var(--surface-container)' }}
                  >
                    <option value="ALL">All Plans</option>
                    <option value="trial">7-Day Free Trial (₹2)</option>
                    <option value="starter">Testing Pack (₹79)</option>
                    <option value="growth">Growth Pack (₹149)</option>
                    <option value="pro">Scale Pack (₹249)</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div style={{ minWidth: '150px' }}>
                  <select
                    className="form-select"
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    style={{ height: '42px', fontSize: '13px', background: 'var(--surface-container)' }}
                  >
                    <option value="ALL">All Payments</option>
                    <option value="ACTIVE">✓ Active / Paid</option>
                    <option value="PAST_DUE">⚠️ Overdue / Unpaid</option>
                    <option value="TRIAL">⏳ In Trial</option>
                  </select>
                </div>

                {/* Account Status Filter */}
                <div style={{ minWidth: '130px' }}>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ height: '42px', fontSize: '13px', background: 'var(--surface-container)' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="SUSPENDED">Suspended Only</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div style={{ minWidth: '150px' }}>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ height: '42px', fontSize: '13px', background: 'var(--surface-container)' }}
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="name">Sort: Name (A to Z)</option>
                    <option value="usage">Sort: Quota Usage %</option>
                    <option value="qrs">Sort: Most QR Stands</option>
                  </select>
                </div>
              </div>

              {/* Counter Strip & Active Filters */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  Showing <strong>{filteredBusinesses.length}</strong> of <strong>{businesses.length}</strong> tenant businesses
                  {searchQuery && (
                    <span> matching "<strong>{searchQuery}</strong>"</span>
                  )}
                </div>

                {(searchQuery || filterPlan !== 'ALL' || filterPayment !== 'ALL' || filterStatus !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterPlan('ALL');
                      setFilterPayment('ALL');
                      setFilterStatus('ALL');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ✕ Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Businesses Table or Empty Search State */}
            <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
              {filteredBusinesses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '38px', marginBottom: '12px' }}>🔍</div>
                  <h4 className="serif" style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '6px' }}>
                    No businesses matching your search
                  </h4>
                  <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto 16px' }}>
                    {searchQuery ? `We couldn't find any business matching "${searchQuery}".` : 'No businesses match the selected filters.'} Try adjusting your keywords, checking for typos, or clearing the filter options.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterPlan('ALL');
                      setFilterPayment('ALL');
                      setFilterStatus('ALL');
                    }}
                  >
                    Clear Filters & Show All Businesses
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 8px' }}>Business</th>
                      <th style={{ padding: '12px 8px' }}>Owner & Contact</th>
                      <th style={{ padding: '12px 8px' }}>Category & City</th>
                      <th style={{ padding: '12px 8px' }}>Subscription & Plan</th>
                      <th style={{ padding: '12px 8px' }}>Monthly Quota</th>
                      <th style={{ padding: '12px 8px' }}>Payment Status</th>
                      <th style={{ padding: '12px 8px' }}>Account Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.map((b) => {
                      const isOverdue = b.subscription?.status === 'PAST_DUE';
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          {/* Business Name */}
                          <td style={{ padding: '14px 8px', fontWeight: 700, fontSize: '14px' }}>
                            {b.name}
                            <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-subtle)' }}>
                              {b.qrCount || 0} QR Code(s)
                            </div>
                          </td>

                          {/* Owner & Contact */}
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ fontWeight: 600 }}>{b.owner?.name || 'Owner'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.owner?.phone}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{b.owner?.email}</div>
                          </td>

                          {/* Category & City */}
                          <td style={{ padding: '14px 8px' }}>
                            <div>{b.subcategory}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.city}</div>
                          </td>

                          {/* Subscription */}
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ fontWeight: 600 }}>{b.subscription?.planName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{b.subscription?.planPriceInr || 0}/mo</div>
                          </td>

                          {/* Quota Usage */}
                          <td style={{ padding: '14px 8px', minWidth: '130px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                              <span>{b.subscription?.reviewsUsed || 0} / {b.subscription?.reviewLimit || 50}</span>
                              <span>{b.subscription?.percentUsed || 0}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--surface-container-high)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${b.subscription?.percentUsed || 0}%`,
                                  background: (b.subscription?.percentUsed || 0) >= 80 ? 'var(--warning)' : 'var(--primary)',
                                }}
                              />
                            </div>
                          </td>

                          {/* Payment Status Badge */}
                          <td style={{ padding: '14px 8px' }}>
                            <span
                              className={`badge ${
                                b.subscription?.status === 'ACTIVE'
                                  ? 'badge-success'
                                  : b.subscription?.status === 'PAST_DUE'
                                  ? 'badge-primary'
                                  : 'badge-warning'
                              }`}
                              style={{
                                background: isOverdue ? '#fee2e2' : undefined,
                                color: isOverdue ? '#b91c1c' : undefined,
                                border: isOverdue ? '1px solid #f87171' : undefined,
                              }}
                            >
                              {b.subscription?.status === 'PAST_DUE' ? '⚠️ OVERDUE / UNPAID' : b.subscription?.status}
                            </span>
                          </td>

                          {/* Account Status */}
                          <td style={{ padding: '14px 8px' }}>
                            <span className={`badge ${b.isActive ? 'badge-success' : 'badge-warning'}`}>
                              {b.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* Call / Contact Owner */}
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '5px 9px' }}
                                title="Call or Message Owner"
                                onClick={() => {
                                  setSelectedContactBusiness(b);
                                  setContactNote('');
                                }}
                              >
                                📞 Call / Contact
                              </button>

                              {/* Quota Limit Adjustment */}
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '5px 9px' }}
                                title="Adjust Monthly Review Quota"
                                onClick={() => {
                                  setLimitEditBusiness(b);
                                  setNewLimitValue(b.subscription?.reviewLimit || 1000);
                                }}
                              >
                                ⚙️ Limit
                              </button>

                              {/* Payment Status Toggle */}
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '5px 9px' }}
                                title="Toggle Payment Status"
                                onClick={() => {
                                  const nextStatus = b.subscription?.status === 'PAST_DUE' ? 'ACTIVE' : 'PAST_DUE';
                                  handleUpdatePaymentStatus(b.id, nextStatus);
                                }}
                              >
                                {b.subscription?.status === 'PAST_DUE' ? '✓ Mark Paid' : 'Flag Overdue'}
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                className={`btn ${b.isActive ? 'btn-outline' : 'btn-primary'}`}
                                style={{
                                  fontSize: '11px',
                                  padding: '5px 9px',
                                  color: b.isActive ? 'var(--error)' : undefined,
                                  borderColor: b.isActive ? 'var(--error)' : undefined,
                                }}
                                onClick={() => handleToggleBusinessStatus(b.id, b.isActive)}
                              >
                                {b.isActive ? 'Suspend' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* MODAL 1: Call & Contact Owner Drawer/Dialog */}
            {selectedContactBusiness && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1100,
                  padding: '20px',
                }}
              >
                <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="serif" style={{ fontSize: '22px' }}>
                      Contact: {selectedContactBusiness.name}
                    </h3>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px' }}
                      onClick={() => setSelectedContactBusiness(null)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Payment Warning Banner */}
                  {selectedContactBusiness.subscription?.status === 'PAST_DUE' && (
                    <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>⚠️</span>
                      <div>
                        <strong>Payment Overdue / Unpaid:</strong> Plan {selectedContactBusiness.subscription?.planName} (₹{selectedContactBusiness.subscription?.planPriceInr}/mo). Call to collect payment or extend grace period.
                      </div>
                    </div>
                  )}

                  {/* Contact Details */}
                  <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Business Owner:</span>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{selectedContactBusiness.owner?.name}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <a
                        href={`tel:${selectedContactBusiness.owner?.phone}`}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '10px' }}
                      >
                        📞 Call Phone: {selectedContactBusiness.owner?.phone}
                      </a>
                      <a
                        href={`https://wa.me/${(selectedContactBusiness.owner?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${selectedContactBusiness.owner?.name}, this is Reviewly Platform Administration regarding your account for ${selectedContactBusiness.name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '10px', color: '#16a34a', borderColor: '#16a34a' }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '13px' }}>
                      <div>✉️ Email: <a href={`mailto:${selectedContactBusiness.owner?.email}`}>{selectedContactBusiness.owner?.email}</a></div>
                      <div>📍 City & Address: {selectedContactBusiness.address}, {selectedContactBusiness.city}</div>
                    </div>
                  </div>

                  {/* Audit / Contact Log History */}
                  {selectedContactBusiness.contactLogs && selectedContactBusiness.contactLogs.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Past Call Notes:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                        {selectedContactBusiness.contactLogs.map((cl: any, i: number) => (
                          <div key={i} style={{ padding: '8px', background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                            <strong>{new Date(cl.createdAt).toLocaleDateString()}:</strong> {cl.details?.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form to log call note */}
                  <form onSubmit={handleSaveContactLog}>
                    <div className="form-group">
                      <label className="form-label">Record Internal Call Note</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="e.g., Called owner regarding payment follow-up. Owner confirmed payment will be initiated today..."
                        value={contactNote}
                        onChange={(e) => setContactNote(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedContactBusiness(null)}>
                        Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        💾 Save Call Note
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: Adjust Quota Limit */}
            {limitEditBusiness && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1100,
                  padding: '20px',
                }}
              >
                <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '28px' }}>
                  <h3 className="serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
                    Adjust Quota Limit
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Override monthly review generations for <strong>{limitEditBusiness.name}</strong>.
                  </p>

                  <form onSubmit={handleUpdateLimit}>
                    <div className="form-group">
                      <label className="form-label">Monthly Review Generation Limit</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newLimitValue}
                        onChange={(e) => setNewLimitValue(Number(e.target.value))}
                        min={1}
                        required
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Currently: {limitEditBusiness.subscription?.reviewLimit || 50} reviews/month
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setLimitEditBusiness(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Update Quota Limit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 3: Add Business Manually */}
            {showAddBusinessModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1100,
                  padding: '20px',
                }}
              >
                <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="serif" style={{ fontSize: '24px' }}>Add Business & Owner Manually</h3>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowAddBusinessModal(false)}>
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleManualCreateBusiness}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Business Name *</label>
                        <input
                          className="form-input"
                          placeholder="e.g. Copper Chimney"
                          value={newBizForm.businessName}
                          onChange={(e) => setNewBizForm({ ...newBizForm, businessName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Owner Full Name *</label>
                        <input
                          className="form-input"
                          placeholder="e.g. Ramesh Patel"
                          value={newBizForm.ownerName}
                          onChange={(e) => setNewBizForm({ ...newBizForm, ownerName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Owner Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="owner@domain.com"
                          value={newBizForm.email}
                          onChange={(e) => setNewBizForm({ ...newBizForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          className="form-input"
                          placeholder="+91 9876543210"
                          value={newBizForm.phone}
                          onChange={(e) => setNewBizForm({ ...newBizForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          className="form-input"
                          placeholder="Bengaluru"
                          value={newBizForm.city}
                          onChange={(e) => setNewBizForm({ ...newBizForm, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Business Category *</label>
                        <select
                          className="form-select"
                          value={newBizForm.mainCategory}
                          onChange={(e) => setNewBizForm({ ...newBizForm, mainCategory: e.target.value })}
                        >
                          <option value="FOOD & HOSPITALITY">FOOD & HOSPITALITY</option>
                          <option value="RETAIL">RETAIL</option>
                          <option value="SERVICES">SERVICES</option>
                          <option value="HEALTH & WELLNESS">HEALTH & WELLNESS</option>
                          <option value="EDUCATION">EDUCATION</option>
                          <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                          <option value="PROFESSIONAL">PROFESSIONAL</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Subcategory *</label>
                        <input
                          className="form-input"
                          placeholder="e.g. Restaurant / Salon / Gym"
                          value={newBizForm.subcategory}
                          onChange={(e) => setNewBizForm({ ...newBizForm, subcategory: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Subscription Plan</label>
                        <select
                          className="form-select"
                          value={newBizForm.planSlug}
                          onChange={(e) => {
                            const slug = e.target.value;
                            const defaultLimit = slug === 'trial' ? 50 : slug === 'starter' ? 100 : slug === 'growth' ? 500 : 1000;
                            setNewBizForm({ ...newBizForm, planSlug: slug, customReviewLimit: defaultLimit });
                          }}
                        >
                          <option value="trial">7-Day Free Trial Pass (₹2)</option>
                          <option value="starter">Testing Pack (₹79/mo, Reg. ₹149)</option>
                          <option value="growth">Growth Pack (₹149/mo, Reg. ₹249)</option>
                          <option value="pro">Scale / Pro Pack (₹249/mo, Reg. ₹399)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Initial Payment Status</label>
                        <select
                          className="form-select"
                          value={newBizForm.paymentStatus}
                          onChange={(e) => setNewBizForm({ ...newBizForm, paymentStatus: e.target.value })}
                        >
                          <option value="ACTIVE">Paid / Active</option>
                          <option value="PAST_DUE">Overdue / Unpaid</option>
                          <option value="TRIAL">Trialing</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Custom Monthly Review Limit</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newBizForm.customReviewLimit}
                          onChange={(e) => setNewBizForm({ ...newBizForm, customReviewLimit: Number(e.target.value) })}
                          min={10}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Google Review URL</label>
                        <input
                          className="form-input"
                          placeholder="https://maps.google.com/?cid=..."
                          value={newBizForm.googleReviewUrl}
                          onChange={(e) => setNewBizForm({ ...newBizForm, googleReviewUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddBusinessModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        🚀 Create Business & Generate QR
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Subscription Plans Manager */}
        {activeTab === 'plans' && (
          <div>
            <h3 className="serif" style={{ fontSize: '22px', marginBottom: '16px' }}>Manage Plans & Default Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {plans.map((p) => (
                <div key={p.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>{p.name}</div>
                  <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--primary)', margin: '10px 0' }}>
                    ₹{p.priceInr} <span style={{ fontSize: '14px', fontWeight: 400 }}>/{p.billingPeriod}</span>
                  </div>

                  <div style={{ margin: '16px 0', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Limit:</strong> {p.reviewGenerationLimit.toLocaleString()} reviews/mo</div>
                    <div><strong>QR Codes:</strong> {p.qrCodeLimit}</div>
                    <div><strong>Team Members:</strong> {p.teamMembersLimit}</div>
                  </div>

                  <button
                    className="btn btn-secondary btn-block"
                    onClick={async () => {
                      const newPrice = prompt(`Enter new price in INR for ${p.name}:`, String(p.priceInr));
                      if (newPrice !== null && !isNaN(Number(newPrice))) {
                        await api.updatePlan(p.id, { priceInr: Number(newPrice) });
                        showNotification('Plan price updated!');
                        loadAdminData();
                      }
                    }}
                  >
                    Edit Plan Pricing
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: API Retries, Rate-Limits & Audit Logs */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '22px' }}>Security Audit & Rate Limit Log Feed</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Tracks rate-limit blocks (429s), admin overrides, and business modifications.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                        {l.action}
                      </span>
                      <strong>{l.resourceType}</strong>
                      {l.details && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                          {JSON.stringify(l.details)}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-subtle)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(l.createdAt).toLocaleTimeString()} · {new Date(l.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: System Notifications Broadcast */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '22px' }}>Broadcast Announcements & System Alerts</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Send real-time alerts, maintenance notices, new feature launches, or promotions to all merchant dashboards.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowBroadcastModal(true)}
                style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📢</span>
                <span>Post New Announcement</span>
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📢</div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No Broadcast Notifications Yet</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px' }}>
                  Keep your merchants informed about scheduled maintenance, new software launches, or promotional packages.
                </p>
                <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
                  Create First Announcement
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notifications.map((n) => {
                  const typeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                    ALERT: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: '🚨 ALERT' },
                    WARNING: { bg: '#fffbeb', border: '#fcd34d', text: '#b45309', icon: '⚠️ WARNING' },
                    SUCCESS: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', icon: '✅ SUCCESS' },
                    PROMO: { bg: '#faf5ff', border: '#d8b4fe', text: '#7e22ce', icon: '🎁 PROMO' },
                    INFO: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', icon: 'ℹ️ INFO' },
                  };
                  const color = typeColors[n.type] || typeColors.INFO;

                  return (
                    <div
                      key={n.id}
                      className="card"
                      style={{
                        padding: '20px',
                        borderLeft: `4px solid ${color.text}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: '1 1 500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span
                            style={{
                              background: color.bg,
                              border: `1px solid ${color.border}`,
                              color: color.text,
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {color.icon}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            Audience: <strong>{n.targetBusinessId ? `Specific Business (${n.targetBusinessId})` : 'All Merchants (Global Broadcast)'}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>·</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>
                          {n.title}
                        </h4>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                          {n.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeleteNotification(n.id)}
                          style={{ fontSize: '12.5px', color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          🗑️ Retract / Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Custom Software Leads & Inquiries */}
        {activeTab === 'inquiries' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '22px' }}>Custom Software Leads & Enterprise Inquiries</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Consultation requests from businesses wanting Delivery Fleet Dispatch, ERP, Omnichannel Billing, or Bespoke Apps.
                </p>
              </div>
            </div>

            {/* Inquiries Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Inquiries</div>
                <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>{inquiries.length}</div>
              </div>
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#b45309' }}>Pending Outreach</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                  {inquiries.filter((i) => i.status === 'PENDING').length}
                </div>
              </div>
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#2563eb' }}>In Active Progress</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                  {inquiries.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'CONTACTED').length}
                </div>
              </div>
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#16a34a' }}>Completed / Won</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                  {inquiries.filter((i) => i.status === 'COMPLETED').length}
                </div>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💼</div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No Software Inquiries Yet</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                  When merchants request custom software (Delivery, ERP, Billing, Apps) from their dashboard, their lead details appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {inquiries.map((inq) => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    PENDING: { bg: '#fef3c7', text: '#92400e' },
                    CONTACTED: { bg: '#e0f2fe', text: '#0369a1' },
                    IN_PROGRESS: { bg: '#ede9fe', text: '#6d28d9' },
                    COMPLETED: { bg: '#dcfce7', text: '#15803d' },
                  };
                  const scolor = statusColors[inq.status] || statusColors.PENDING;

                  return (
                    <div
                      key={inq.id}
                      className="card"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '20px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: '1 1 500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span
                            style={{
                              background: scolor.bg,
                              color: scolor.text,
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            STATUS: {inq.status}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            Received: {new Date(inq.createdAt).toLocaleDateString()} {new Date(inq.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px', color: 'var(--primary)' }}>
                          {inq.serviceType}
                        </h4>

                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                          🏢 {inq.businessName || 'Business Client'} · <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{inq.ownerEmail || 'No email provided'}</span>
                        </div>

                        {inq.requirements && (
                          <div
                            style={{
                              background: 'var(--surface-container)',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: 'var(--text)',
                              marginTop: '8px',
                              borderLeft: '3px solid var(--primary)',
                            }}
                          >
                            <strong>Client Requirements / Notes:</strong> {inq.requirements}
                          </div>
                        )}
                      </div>

                      {/* Contact & Status Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a
                            href={`tel:${inq.contactPhone}`}
                            className="btn btn-secondary"
                            style={{ fontSize: '12.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
                          >
                            📞 Call {inq.contactPhone}
                          </a>
                          <a
                            href={`https://wa.me/${inq.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello! We received your custom software inquiry regarding "${inq.serviceType}" for ${inq.businessName}. Let's discuss your requirements!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{ background: '#25D366', borderColor: '#25D366', fontSize: '12.5px', padding: '6px 12px' }}
                          >
                            WhatsApp
                          </a>
                        </div>

                        {/* Status Change Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Change Status:</label>
                          <select
                            className="form-select"
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                            value={inq.status}
                            onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: Articles & Blogs Management */}
        {activeTab === 'blogs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '22px' }}>Editorial Knowledge Base &amp; Growth Articles</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Manage and publish field playbooks, Google SEO strategies, and custom software guides accessible publicly and to merchants.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={openNewBlog}
                  style={{ background: '#0284c7', borderColor: '#0284c7', color: '#ffffff', fontWeight: 600 }}
                >
                  ✍️ Write New Article
                </button>
              </div>
            </div>

            {/* Search Bar for Super Admin Blogs */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadBlogs(blogSearch);
                }}
                style={{ display: 'flex', gap: '10px' }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search articles by title, keywords, tags, or topic..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
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
            </div>

            {/* Articles List */}
            {loadingBlogs ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Searching articles...
              </div>
            ) : blogs.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📰</div>
                <h4 style={{ margin: '0 0 6px' }}>No articles found</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Create your first article or search with a different keyword.
                </p>
                <button className="btn btn-primary" onClick={openNewBlog}>
                  ✍️ Write New Article
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className="card"
                    style={{
                      padding: '22px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className={`badge ${b.isPublished ? 'badge-success' : 'badge-warning'}`}>
                          {b.isPublished ? '● Published Live' : '○ Draft Mode'}
                        </span>
                        <span className="badge badge-primary">{b.category}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {b.readTime} · By {b.author} · {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="serif" style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 6px', color: '#0f172a' }}>
                        {b.title}
                      </h4>

                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                        {b.excerpt}
                      </p>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {b.tags?.map((t: string, i: number) => (
                          <span key={i} className="stat-pill stat-pill-neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleTogglePublish(b)}
                        style={{ fontSize: '12px' }}
                      >
                        {b.isPublished ? 'Unpublish' : 'Publish Live'}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditBlog(b)}
                        style={{ fontSize: '12px' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteBlog(b.id)}
                        style={{ fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: Post Broadcast Announcement */}
        {showBroadcastModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '20px',
            }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600 }}>
                  Broadcast Announcement
                </h3>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                This message will be instantly displayed on merchant dashboards via their notification bell and top announcement alerts.
              </p>

              <form onSubmit={handleBroadcastNotification}>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 🚀 Platform Upgrade or ⚠️ Scheduled Maintenance"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alert Type / Severity</label>
                  <select
                    className="form-select"
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                  >
                    <option value="INFO">ℹ️ INFO (General Updates & Tips)</option>
                    <option value="SUCCESS">✅ SUCCESS (Feature Releases & Milestones)</option>
                    <option value="WARNING">⚠️ WARNING (Scheduled Maintenance / Latency)</option>
                    <option value="ALERT">🚨 ALERT (Urgent System Notices)</option>
                    <option value="PROMO">🎁 PROMO (Special Offers & Upgrade Discounts)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={broadcastForm.targetBusinessId}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetBusinessId: e.target.value })}
                  >
                    <option value="">🌐 All Merchants (Global Broadcast)</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        🏢 Only: {b.name} ({b.ownerEmail})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Announcement Message</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Write the full announcement text that merchants will read..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBroadcastModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingBroadcast}
                    style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff' }}
                  >
                    {sendingBroadcast ? 'Broadcasting...' : '📢 Broadcast Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Create / Edit Blog Article */}
        {showBlogModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '20px',
            }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {editingBlog ? 'Edit Growth Article' : 'Write New Growth Article & Playbook'}
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowBlogModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBlog}>
                <div className="form-group">
                  <label className="form-label">Article Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 5 Counter Strategies to Double Your Google 5-Star Reviews"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  />
                </div>

                <div className="grid-2" style={{ gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    >
                      <option value="Google Maps SEO">Google Maps SEO</option>
                      <option value="Conversion Tactics">Conversion Tactics</option>
                      <option value="Custom Software">Custom Software &amp; Tech</option>
                      <option value="Hospitality Intelligence">Hospitality Intelligence</option>
                      <option value="Case Studies">Case Studies &amp; Benchmarks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimated Read Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 4 min read"
                      value={blogForm.readTime}
                      onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Author Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Reviewly Editorial Team"
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. google-reviews, qr-stands, seo"
                      value={blogForm.tags}
                      onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Summary / Excerpt *</label>
                  <textarea
                    required
                    rows={2}
                    className="form-textarea"
                    placeholder="Brief 1-2 sentence hook explaining what readers will learn..."
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Article Content (Markdown / Text) *</label>
                  <textarea
                    required
                    rows={8}
                    className="form-textarea"
                    placeholder="Write the full content of the article or playbook..."
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    id="blogPublishCheck"
                    checked={blogForm.isPublished}
                    onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="blogPublishCheck" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Publish live immediately (visible to all merchants and public visitors)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBlogModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                    {editingBlog ? '💾 Update Article' : '🚀 Publish Article'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
