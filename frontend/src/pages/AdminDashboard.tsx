import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  KindlyRateLogo,
  GoogleLogo,
  InstagramLogo,
  FacebookLogo,
  WhatsAppLogo,
  ChartBarIcon,
  BroadcastIcon,
  RefreshIcon,
  PlusIcon,
  MobileIcon,
  ClipboardCopyIcon,
  TrophyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  StorefrontIcon,
} from '../components/Logos.js';
import { PhoneInput } from '../components/PhoneInput.js';
import { validatePhoneNumber } from '../utils/phoneValidator.js';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'businesses' | 'plans' | 'blogs' | 'notifications' | 'inquiries' | 'logs' | 'apikeys'>('overview');
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
    author: 'KindlyRate Editorial Team',
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

  // Super Admin Plan Pricing & Quota Editor State
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    priceInr: 79,
    priceInr3Months: 229,
    priceInr6Months: 429,
    priceInr1Year: 790,
    reviewGenerationLimit: 100,
    qrCodeLimit: 2,
    offerBadge: '',
    isActive: true,
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // System API Keys Management State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testingRaw, setTestingRaw] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [filterKeyService, setFilterKeyService] = useState('ALL');
  const [apiKeyForm, setApiKeyForm] = useState({
    service: 'GEMINI',
    name: '',
    keyValue: '',
    secondaryValue: 'gemini-flash-latest',
    isActive: true,
  });

  // Search & Filter states for Customer / Tenant Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'usage' | 'qrs'>('newest');

  // Created Subscriber Success Modal State
  const [createdSubscriberModal, setCreatedSubscriberModal] = useState<{
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    loginUrl: string;
    plan: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Manual Creation Form
  const [newBizForm, setNewBizForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: 'KindlyRate@123',
    phone: '',
    mainCategory: 'FOOD & HOSPITALITY',
    subcategory: 'Restaurant',
    city: 'Bengaluru',
    planSlug: 'starter',
    customReviewLimit: 100,
    paymentStatus: 'ACTIVE',
    googleReviewUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    whatsappUrl: '',
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Rev@';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewBizForm((prev) => ({ ...prev, password: pass }));
  };

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
      const [sRes, bRes, pRes, lRes, nRes, iRes, blRes, kRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminBusinesses(),
        api.getAdminPlans(),
        api.getAuditLogs(),
        api.getAdminNotifications().catch(() => []),
        api.getAdminInquiries().catch(() => []),
        api.getAdminBlogs().catch(() => []),
        api.getAdminApiKeys().catch(() => []),
      ]);
      setStats(sRes);
      setBusinesses(bRes);
      setPlans(pRes);
      setLogs(lRes);
      setNotifications(nRes || []);
      setInquiries(iRes || []);
      setBlogs(Array.isArray(blRes) ? blRes : (blRes?.blogs || blRes?.data || []));
      setApiKeys(kRes || []);
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const res = await api.getAdminApiKeys();
      setApiKeys(res || []);
    } catch (e: any) {
      console.error('Failed to load API keys:', e);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyForm.name.trim() || !apiKeyForm.keyValue.trim()) {
      showNotification('Please fill in key name and API key secret.');
      return;
    }
    try {
      await api.createAdminApiKey(apiKeyForm);
      showNotification(`API Key "${apiKeyForm.name}" registered successfully!`);
      setShowApiKeyModal(false);
      setApiKeyForm({
        service: 'GEMINI',
        name: '',
        keyValue: '',
        secondaryValue: 'gemini-flash-latest',
        isActive: true,
      });
      setTestResult(null);
      loadApiKeys();
    } catch (err: any) {
      showNotification(`Failed to add API key: ${err.message}`);
    }
  };

  const handleToggleApiKey = async (k: any) => {
    try {
      await api.updateAdminApiKey(k.id, { isActive: !k.isActive });
      showNotification(`Key "${k.name}" ${!k.isActive ? 'activated' : 'paused'}.`);
      loadApiKeys();
    } catch (err: any) {
      showNotification(`Failed to toggle key: ${err.message}`);
    }
  };

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete API key "${name}"?`)) return;
    try {
      await api.deleteAdminApiKey(id);
      showNotification('API Key deleted successfully.');
      loadApiKeys();
    } catch (err: any) {
      showNotification(`Failed to delete key: ${err.message}`);
    }
  };

  const handleTestApiKey = async (id: string) => {
    try {
      setTestingKeyId(id);
      const res = await api.testAdminApiKey(id);
      showNotification(res?.data?.message || res?.message || 'Key verified and active!');
      loadApiKeys();
    } catch (err: any) {
      showNotification(`Test failed: ${err.message}`);
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleTestRawKey = async () => {
    if (!apiKeyForm.keyValue.trim()) {
      showNotification('Paste an API key first to test connection.');
      return;
    }
    try {
      setTestingRaw(true);
      setTestResult(null);
      const res = await api.testRawApiKey({
        service: apiKeyForm.service,
        keyValue: apiKeyForm.keyValue,
        secondaryValue: apiKeyForm.secondaryValue,
      });
      setTestResult({ status: 'HEALTHY', message: res?.data?.message || res?.message || 'Key responded successfully!' });
      showNotification('Connection verified successfully!');
    } catch (err: any) {
      setTestResult({ status: 'FAILED', message: err.message || 'Verification failed.' });
      showNotification(`Verification failed: ${err.message}`);
    } finally {
      setTestingRaw(false);
    }
  };

  const loadBlogs = async (query?: string) => {
    setLoadingBlogs(true);
    try {
      const res = await api.getAdminBlogs(query);
      const list = Array.isArray(res) ? res : (res?.blogs || res?.data || []);
      setBlogs(list);
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
      author: 'KindlyRate Editorial Team',
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
    if (newBizForm.phone && newBizForm.phone.trim()) {
      const pVal = validatePhoneNumber(newBizForm.phone);
      if (!pVal.isValid) {
        showNotification(pVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    try {
      const res = await api.createBusinessManual(newBizForm);
      showNotification(`Business "${newBizForm.businessName}" created successfully!`);
      setShowAddBusinessModal(false);

      const loginUrl = `${window.location.origin}/login`;
      const pass = res?.credentials?.password || newBizForm.password || 'KindlyRate@123';
      const email = res?.credentials?.email || newBizForm.email;

      setCreatedSubscriberModal({
        businessName: newBizForm.businessName,
        ownerName: newBizForm.ownerName,
        email,
        password: pass,
        loginUrl,
        plan: newBizForm.planSlug,
      });

      setNewBizForm({
        businessName: '',
        ownerName: '',
        email: '',
        password: 'KindlyRate@123',
        phone: '',
        mainCategory: 'FOOD & HOSPITALITY',
        subcategory: 'Restaurant',
        city: 'Bengaluru',
        planSlug: 'starter',
        customReviewLimit: 100,
        paymentStatus: 'ACTIVE',
        googleReviewUrl: '',
        instagramUrl: '',
        facebookUrl: '',
        whatsappUrl: '',
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
          <KindlyRateLogo height={34} />
          <span style={{ color: 'var(--border)', height: '22px', borderLeft: '1px solid var(--border)' }} />
          <h2 className="serif" style={{ fontSize: '20px', margin: 0 }}>Super-Admin Portal</h2>
          <span className="badge badge-primary">Operations & Finance</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddBusinessModal(true)}
            style={{ fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={15} />
            <span>Add Subscriber</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowBroadcastModal(true)}
            style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BroadcastIcon size={15} />
            <span>Broadcast Announcement</span>
          </button>
          <button className="btn btn-secondary" onClick={loadAdminData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshIcon size={14} />
            <span>Refresh Metrics</span>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ChartBarIcon size={15} />
            <span>Financial &amp; API Observability</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <TrophyIcon size={15} />
            <span>Platform Analytics &amp; Social Traffic</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'businesses' ? 'active' : ''}`}
            onClick={() => setActiveTab('businesses')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <StorefrontIcon size={15} />
            <span>Tenant Businesses ({businesses.length})</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheckIcon size={15} />
            <span>Subscription Plans &amp; Pricing</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <BroadcastIcon size={15} />
            <span>Broadcast Notifications ({notifications.length})</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MobileIcon size={15} />
            <span>Custom Software Leads ({inquiries.length})</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ClipboardCopyIcon size={15} />
            <span>Articles &amp; Blogs ({blogs.length})</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircleIcon size={15} />
            <span>Audit &amp; Security Logs</span>
          </button>
          <button
            className={`segmented-nav-item ${activeTab === 'apikeys' ? 'active' : ''}`}
            onClick={() => setActiveTab('apikeys')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <SparklesIcon size={15} color={activeTab === 'apikeys' ? 'var(--primary)' : 'inherit'} />
            <span>API Keys &amp; AI Engine ({apiKeys.length})</span>
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
              <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="card dashboard-kpi-card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monthly Recurring Revenue</div>
                  <div className="kpi-value" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                    ₹{(stats?.mrrInr || 0).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                    ▲ +{stats?.revenueGrowthRatePct || 24.8}% MoM Growth
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Captured Revenue</div>
                  <div className="kpi-value" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>
                    ₹{(stats?.totalRevenueInr || 0).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    ARR Run-Rate: ₹{(stats?.arrInr || 0).toLocaleString()}
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Paid Subscriptions</div>
                  <div className="kpi-value" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
                    {stats?.activeSubscriptions || 0}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Trials: {stats?.trialSubscriptions || 0} active
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '22px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overdue / Unpaid Subscriptions</div>
                  <div className="kpi-value" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: (stats?.overdueSubscriptions || 0) > 0 ? 'var(--error)' : 'var(--text)' }}>
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

        {/* TAB: Platform Analytics & Social Traffic */}
        {activeTab === 'analytics' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '24px' }}>Platform Analytics &amp; Conversion Velocity</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                  End-to-end QR scan funnels, merchant social media engagement, category share &amp; reputation shield metrics.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={loadAdminData} style={{ fontSize: '13px' }}>
                🔄 Refresh Analytics
              </button>
            </div>

            {/* Row 1: Key Conversion KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Total Physical QR Scans</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                  {(stats?.funnelAnalytics?.totalScans || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Across all active table displays
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Overall Conversion Rate</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
                  {stats?.funnelAnalytics?.overallConversionRate || 0}%
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                  Scans ➔ Google Reviews
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Google Review Clicks</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: '#1a73e8' }}>
                  {(stats?.funnelAnalytics?.totalGoogleClicks || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Copy-to-Google Rate: {stats?.funnelAnalytics?.copyToGoogleRate || 0}%
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Reputation Shield Protection</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: '#7c3aed' }}>
                  {stats?.sentimentBreakdown?.satisfactionPct || 100}%
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {stats?.sentimentBreakdown?.shieldDivertedCount || 0} critical reviews kept in-house
                </div>
              </div>
            </div>

            {/* Row 2: Visual Conversion Funnel */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Customer Review Conversion Funnel</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Tracking customer journey from physical QR scan to authenticated Google Maps review submission
                  </p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '11px' }}>Full Platform Aggregation</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {/* Stage 1 */}
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage 1</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MobileIcon size={16} color="var(--primary)" />
                    <span>QR Scans</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
                    {(stats?.funnelAnalytics?.totalScans || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    100% (Baseline)
                  </div>
                </div>

                {/* Stage 2 */}
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage 2</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StarIcon size={16} filled={true} />
                    <span>Ratings Given</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
                    {(stats?.funnelAnalytics?.totalSubmissions || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats?.funnelAnalytics?.totalScans ? Math.round((stats.funnelAnalytics.totalSubmissions / stats.funnelAnalytics.totalScans) * 100) : 0}% retention
                  </div>
                </div>

                {/* Stage 3 */}
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage 3</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SparklesIcon size={16} color="#10b981" />
                    <span>AI Generated</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
                    {(stats?.funnelAnalytics?.totalGenerations || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats?.funnelAnalytics?.scanToReviewRate || 0}% from scans
                  </div>
                </div>

                {/* Stage 4 */}
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage 4</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClipboardCopyIcon size={16} color="#6366f1" />
                    <span>Copied Text</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1', marginTop: '8px' }}>
                    {(stats?.funnelAnalytics?.totalCopied || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats?.funnelAnalytics?.totalGenerations ? Math.round((stats.funnelAnalytics.totalCopied / stats.funnelAnalytics.totalGenerations) * 100) : 0}% copy rate
                  </div>
                </div>

                {/* Stage 5 */}
                <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #1a73e8' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage 5</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GoogleLogo size={16} />
                    <span>Google Reviews</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a73e8', marginTop: '8px' }}>
                    {(stats?.funnelAnalytics?.totalGoogleClicks || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--success)', fontWeight: 600, marginTop: '4px' }}>
                    {stats?.funnelAnalytics?.overallConversionRate || 0}% overall conversion
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Social Media Presence & Outreach */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Social Media Follow &amp; Direct Engagement</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Clicks initiated by customers connecting directly with merchants on social channels
                  </p>
                </div>
                <span className="stat-pill stat-pill-primary" style={{ fontSize: '12px' }}>
                  {stats?.socialEngagement?.socialAdoptionRatePct || 0}% Businesses with Social Links Active
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {/* Instagram Card */}
                <div className="card" style={{ padding: '20px', borderTop: '3px solid #e1306c' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <InstagramLogo size={22} />
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>Instagram Follows</span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {stats?.socialEngagement?.businessesWithInstagram || 0} Stores
                    </span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#e1306c' }}>
                    {(stats?.socialEngagement?.instagramClicks || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Total customer profile visits &amp; follow clicks
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="card" style={{ padding: '20px', borderTop: '3px solid #25D366' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <WhatsAppLogo size={22} />
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>WhatsApp Chats</span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {stats?.socialEngagement?.businessesWithWhatsApp || 0} Stores
                    </span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#25D366' }}>
                    {(stats?.socialEngagement?.whatsappClicks || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Direct WhatsApp customer conversations initiated
                  </div>
                </div>

                {/* Facebook Card */}
                <div className="card" style={{ padding: '20px', borderTop: '3px solid #1877F2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FacebookLogo size={22} />
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>Facebook Page Visits</span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {stats?.socialEngagement?.businessesWithFacebook || 0} Stores
                    </span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1877F2' }}>
                    {(stats?.socialEngagement?.facebookClicks || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Facebook fan page clicks &amp; visits
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Category Distribution & Sentiment */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Category Breakdown */}
              <div className="card" style={{ padding: '22px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Industry Category Distribution</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Tenant business distribution and review volume by sector
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(stats?.categoryDistribution || []).map((cat: any) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{cat.category}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          <strong>{cat.count}</strong> biz ({cat.percentage}%) · {cat.reviews} reviews
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--surface-container)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.max(cat.percentage, 5)}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment & Shield */}
              <div className="card" style={{ padding: '22px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>AI Sentiment &amp; Shield Health</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Feedback classification and negative review deflection
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#166534', fontSize: '14px' }}>🌟 Enthusiastic 5-Star Reviews</span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: '#166534' }}>
                        {stats?.sentimentBreakdown?.positive || 0}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                      Delighted customers pushed directly to Google Maps
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>⚖️ Neutral / Balanced Reviews</span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: '#334155' }}>
                        {stats?.sentimentBreakdown?.neutral || 0}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Standard experience reviews with mixed points
                    </div>
                  </div>

                  <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#86198f', fontSize: '14px' }}>🛡️ Reputation Shield Diverted</span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: '#86198f' }}>
                        {stats?.sentimentBreakdown?.shieldDivertedCount || 0}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#a21caf', marginTop: '4px' }}>
                      Constructive feedback resolved privately without hurting Google Maps score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Top Performing Businesses Leaderboard */}
            <div className="card" style={{ padding: '22px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>🏆 Top Performing Merchant Leaderboard</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Merchants generating highest review volume and Google Maps conversion
              </p>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Category &amp; City</th>
                      <th>Physical Scans</th>
                      <th>Reviews Generated</th>
                      <th>Google Clicks</th>
                      <th>Conversion Rate</th>
                      <th>Social Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.topPerformers || []).map((tp: any, idx: number) => (
                      <tr key={tp.id}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ marginRight: '8px', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                          {tp.name}
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '11px', marginRight: '6px' }}>
                            {tp.category}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tp.city}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{tp.scans}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tp.reviews}</td>
                        <td style={{ fontWeight: 700, color: '#1a73e8' }}>{tp.googleClicks}</td>
                        <td>
                          <span className={`badge ${tp.conversionRate >= 30 ? 'badge-success' : 'badge-neutral'}`}>
                            {tp.conversionRate}%
                          </span>
                        </td>
                        <td>
                          {tp.hasSocial ? (
                            <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ Configured</span>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    placeholder="Search by business name, owner, email, phone, city..."
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
                    <option value="starter">Testing Pack (₹79 Trial)</option>
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
                          `Hello ${selectedContactBusiness.owner?.name}, this is KindlyRate Platform Administration regarding your account for ${selectedContactBusiness.name}.`
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

          </div>
        )}

        {/* TAB 3: Subscription Plans Manager */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '22px' }}>Subscription Packs, Pricing &amp; Review Quotas</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Set monthly, quarterly, semi-annual, and 1-year pack prices. Configure review quotas and QR allowances.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {plans.map((p) => {
                const yearPrice = p.priceInr1Year || (p.priceInr * 10);
                const threeMoPrice = p.priceInr3Months || (p.priceInr * 3);
                const sixMoPrice = p.priceInr6Months || (p.priceInr * 6);

                return (
                  <div key={p.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '18px' }}>{p.name}</div>
                        <span className="badge badge-primary" style={{ fontSize: '11px', marginTop: '4px' }}>
                          {p.slug.toUpperCase()} PACK
                        </span>
                      </div>
                      <span className="stat-pill stat-pill-success" style={{ fontSize: '11px' }}>
                        Active
                      </span>
                    </div>

                    {/* Multi-month Pricing Breakdown Table */}
                    <div style={{ background: 'var(--surface-container)', borderRadius: '8px', padding: '12px', margin: '14px 0' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                        Configured Pricing Tiers
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>1 Month: </span>
                          <strong style={{ color: 'var(--primary)' }}>₹{p.priceInr}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>3 Months: </span>
                          <strong>₹{threeMoPrice}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>6 Months: </span>
                          <strong>₹{sixMoPrice}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>1 Year (12M): </span>
                          <strong style={{ color: '#166534' }}>₹{yearPrice}</strong>
                          <span style={{ fontSize: '10px', color: '#166534', display: 'block' }}>2 Mo Free applied</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', flex: 1 }}>
                      <div><strong>Review Generations:</strong> <span style={{ color: 'var(--text)', fontWeight: 700 }}>{p.reviewGenerationLimit.toLocaleString()} reviews/mo</span></div>
                      <div><strong>Smart QR Stands:</strong> {p.qrCodeLimit} stands</div>
                      <div><strong>Team Members:</strong> {p.teamMembersLimit} staff</div>
                      {p.offerBadge && <div><strong>Offer Badge:</strong> {p.offerBadge}</div>}
                    </div>

                    <button
                      className="btn btn-secondary btn-block"
                      style={{ padding: '10px', fontSize: '13.5px', fontWeight: 600 }}
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanForm({
                          name: p.name || '',
                          priceInr: p.priceInr || 0,
                          priceInr3Months: p.priceInr3Months || (p.priceInr * 3),
                          priceInr6Months: p.priceInr6Months || (p.priceInr * 6),
                          priceInr1Year: p.priceInr1Year || (p.priceInr * 10),
                          reviewGenerationLimit: p.reviewGenerationLimit || 100,
                          qrCodeLimit: p.qrCodeLimit || 2,
                          offerBadge: p.offerBadge || '',
                          isActive: p.isActive !== false,
                        });
                      }}
                    >
                      ⚙️ Edit Plan Pricing &amp; Review Quotas
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SUPER ADMIN PLAN PRICING & QUOTA EDIT MODAL */}
            {editingPlan && (
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
                <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 className="serif" style={{ fontSize: '22px' }}>Edit {editingPlan.name}</h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                        Configure subscriber pricing and review generation quotas for this pack.
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px' }}
                      onClick={() => setEditingPlan(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSavingPlan(true);
                      try {
                        await api.updatePlan(editingPlan.id, planForm);
                        showNotification(`Plan "${planForm.name}" updated with new pricing and review limits!`);
                        setEditingPlan(null);
                        loadAdminData();
                      } catch (err: any) {
                        alert(err.message || 'Failed to update plan');
                      } finally {
                        setSavingPlan(false);
                      }
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Plan Display Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* SUPER ADMIN CAN CHANGE NUMBER OF REVIEWS */}
                    <div style={{ background: '#fef8f5', border: '1.5px solid #fbdcd0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                      <label className="form-label" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                        ⭐ Monthly Review Generation Quota (Number of Reviews in Pack)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={planForm.reviewGenerationLimit}
                        onChange={(e) => setPlanForm({ ...planForm, reviewGenerationLimit: Number(e.target.value) })}
                        min={1}
                        required
                        style={{ fontSize: '16px', fontWeight: 700 }}
                      />
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Controls how many AI customer reviews a merchant on this plan can generate each month.
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">1 Month Price (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={planForm.priceInr}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPlanForm({
                              ...planForm,
                              priceInr: val,
                              // Suggest 1 year with 2 months free discount (10x)
                              priceInr1Year: val * 10,
                            });
                          }}
                          min={0}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">3 Months Price (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={planForm.priceInr3Months}
                          onChange={(e) => setPlanForm({ ...planForm, priceInr3Months: Number(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">6 Months Price (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={planForm.priceInr6Months}
                          onChange={(e) => setPlanForm({ ...planForm, priceInr6Months: Number(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label className="form-label" style={{ margin: 0 }}>1 Year Price (₹)</label>
                          <button
                            type="button"
                            onClick={() => setPlanForm({ ...planForm, priceInr1Year: planForm.priceInr * 10 })}
                            style={{ background: 'none', border: 'none', color: '#166534', fontSize: '11px', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                          >
                            Set 10x (2 Mo Free)
                          </button>
                        </div>
                        <input
                          type="number"
                          className="form-input"
                          value={planForm.priceInr1Year}
                          onChange={(e) => setPlanForm({ ...planForm, priceInr1Year: Number(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Smart QR Stand Limit</label>
                        <input
                          type="number"
                          className="form-input"
                          value={planForm.qrCodeLimit}
                          onChange={(e) => setPlanForm({ ...planForm, qrCodeLimit: Number(e.target.value) })}
                          min={1}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Promotional Offer Badge</label>
                        <input
                          type="text"
                          className="form-input"
                          value={planForm.offerBadge}
                          onChange={(e) => setPlanForm({ ...planForm, offerBadge: e.target.value })}
                          placeholder="e.g. ₹149 First Month Offer"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingPlan(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={savingPlan}
                      >
                        {savingPlan ? 'Saving Changes...' : 'Save Pricing & Quota'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

        {/* ======================================================== */}
        {/* TAB: SYSTEM API KEYS & AI MULTI-KEY FAILOVER ENGINE      */}
        {/* ======================================================== */}
        {activeTab === 'apikeys' && (
          <div>
            {/* Top Metrics Row */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h3 className="serif" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
                    API Keys &amp; Multi-Model AI Routing Pool
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Manage and rotate Google Gemini keys, Google Maps keys, and platform secrets with automatic failover and live health status.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setApiKeyForm({
                      service: 'GEMINI',
                      name: '',
                      keyValue: '',
                      secondaryValue: 'gemini-flash-latest',
                      isActive: true,
                    });
                    setTestResult(null);
                    setShowApiKeyModal(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13.5px' }}
                >
                  <PlusIcon size={15} />
                  <span>Add New API Key</span>
                </button>
              </div>

              <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="card dashboard-kpi-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Total Registered Keys</div>
                  <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
                    {apiKeys.length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Across all integrated services
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Active Gemini AI Keys</div>
                  <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
                    {apiKeys.filter((k) => k.service === 'GEMINI' && k.isActive).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                    ● In active rotation pool
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Total AI Reviews Served</div>
                  <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                    {apiKeys.reduce((acc, k) => acc + (k.callCount || 0), 0)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Lifetime successful generations
                  </div>
                </div>

                <div className="card dashboard-kpi-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Quota / Rate Limit Errors</div>
                  <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: apiKeys.some((k) => (k.errorCount || 0) > 0) ? '#dc2626' : 'var(--text)' }}>
                    {apiKeys.reduce((acc, k) => acc + (k.errorCount || 0), 0)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Auto-failed over without diner disruption
                  </div>
                </div>
              </div>
            </div>

            {/* High Availability & Rotation Notice */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #bbf7d0',
                padding: '16px 20px',
                marginBottom: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '22px' }}>🛡️</span>
              <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
                <strong>Zero-Downtime Multi-Key Failover:</strong> When diners scan QR stands, KindlyRate rotates requests across all active Gemini API keys. If any individual key hits Google rate limits (HTTP 429) or quota caps, the engine automatically fails over to the next active key instantly.
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['ALL', 'GEMINI', 'GOOGLE_MAPS', 'RAZORPAY', 'EMAIL', 'AWS_SMS', 'OTHER'].map((srv) => (
                <button
                  key={srv}
                  type="button"
                  onClick={() => setFilterKeyService(srv)}
                  className={`btn btn-sm ${filterKeyService === srv ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px' }}
                >
                  {srv === 'ALL' ? '🌐 All Services' : srv}
                </button>
              ))}
            </div>

            {/* API Keys Table / Card List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {apiKeys
                .filter((k) => filterKeyService === 'ALL' || k.service === filterKeyService)
                .map((key) => {
                  const isGemini = key.service === 'GEMINI';
                  return (
                    <div
                      key={key.id}
                      className="card"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        borderLeft: key.isActive ? '4px solid #16a34a' : '4px solid #94a3b8',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span
                            className="badge"
                            style={{
                              background: isGemini ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: isGemini ? '#15803d' : '#0284c7',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          >
                            {isGemini ? '🤖 ' : '⚙️ '}
                            {key.service}
                          </span>
                          <span className={`badge ${key.isActive ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                            {key.isActive ? '● Active in Pool' : '○ Paused'}
                          </span>
                          {key.secondaryValue && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              [{key.secondaryValue}]
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                          {key.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <span>Key:</span>
                          <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                            {key.maskedKey || '****'}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(key.keyValue);
                              showNotification('Key copied to clipboard');
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--primary)' }}
                            title="Copy full key"
                          >
                            📋
                          </button>
                        </div>

                        {key.lastError && (
                          <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '6px', fontWeight: 500 }}>
                            ⚠️ Recent notice: {key.lastError}
                          </div>
                        )}
                      </div>

                      {/* Telemetry Numbers */}
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Requests</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{key.callCount || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Errors</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: (key.errorCount || 0) > 0 ? '#dc2626' : 'var(--text-muted)' }}>
                            {key.errorCount || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Used</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={testingKeyId === key.id}
                          onClick={() => handleTestApiKey(key.id)}
                          style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {testingKeyId === key.id ? 'Testing...' : '⚡ Test Connection'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleApiKey(key)}
                          style={{ fontSize: '12px' }}
                        >
                          {key.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteApiKey(key.id, key.name)}
                          style={{ fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}

              {apiKeys.length === 0 && (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔑</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>No API Keys Registered</div>
                  <p style={{ fontSize: '13px', margin: '4px 0 16px' }}>
                    Add one or more Google Gemini API keys to enable seamless AI review generation with automatic rotation.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowApiKeyModal(true)}
                  >
                    + Add Your First API Key
                  </button>
                </div>
              )}
            </div>
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
                      placeholder="e.g. KindlyRate Editorial Team"
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

        {/* MODAL: Add Business / Subscriber Manually */}
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

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Initial / Sample Password * <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginLeft: '6px' }}>✓ No OTP Required for Subscriber</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline',
                        }}
                      >
                        🎲 Generate Random
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="e.g. KindlyRate@123"
                        value={newBizForm.password}
                        onChange={(e) => setNewBizForm({ ...newBizForm, password: e.target.value })}
                        required
                        style={{ paddingRight: '80px', fontFamily: showPassword ? 'inherit' : 'monospace', letterSpacing: showPassword ? 'normal' : '1px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {showPassword ? 'Hide 👁️' : 'Show 👁️'}
                      </button>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Give this password to the subscriber. They can immediately log in at <code>/login</code> without needing any OTP.
                    </div>
                  </div>

                  <PhoneInput
                    label="Phone Number *"
                    value={newBizForm.phone}
                    onChange={(val) => setNewBizForm({ ...newBizForm, phone: val })}
                    required
                  />

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
                      <option value="starter">Testing Pack (₹79 Trial)</option>
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

                  <div className="form-group">
                    <label className="form-label">Instagram Handle / URL <span style={{ fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      className="form-input"
                      placeholder="@business or https://instagram.com/..."
                      value={newBizForm.instagramUrl}
                      onChange={(e) => setNewBizForm({ ...newBizForm, instagramUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Contact / Link <span style={{ fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      className="form-input"
                      placeholder="+919876543210 or https://wa.me/..."
                      value={newBizForm.whatsappUrl}
                      onChange={(e) => setNewBizForm({ ...newBizForm, whatsappUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Facebook Page URL <span style={{ fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      className="form-input"
                      placeholder="https://facebook.com/..."
                      value={newBizForm.facebookUrl}
                      onChange={(e) => setNewBizForm({ ...newBizForm, facebookUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddBusinessModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    🚀 Create Subscriber & Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Created Subscriber Credentials Card */}
        {createdSubscriberModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1200,
              padding: '20px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '540px',
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    margin: '0 auto 12px',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  ✓
                </div>
                <h3 className="serif" style={{ fontSize: '24px', marginBottom: '6px' }}>
                  Subscriber Created Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  Account is pre-verified. The subscriber can log in immediately with zero OTP.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--surface-container)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '12px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Business:</span>
                  <strong style={{ color: 'var(--text)' }}>{createdSubscriberModal.businessName}</strong>

                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Owner:</span>
                  <span>{createdSubscriberModal.ownerName}</span>

                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Login Email:</span>
                  <strong style={{ color: 'var(--primary)' }}>{createdSubscriberModal.email}</strong>

                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Password:</span>
                  <code style={{ background: 'var(--surface)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600, color: '#10b981' }}>
                    {createdSubscriberModal.password}
                  </code>

                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Login Portal:</span>
                  <a href={createdSubscriberModal.loginUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    {createdSubscriberModal.loginUrl}
                  </a>

                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Verification:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Pre-verified (No OTP Required)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
                  onClick={() => {
                    const text = `🎉 Welcome to KindlyRate!\n\nYour business account for *${createdSubscriberModal.businessName}* is activated.\n\n🌐 Login URL: ${createdSubscriberModal.loginUrl}\n📧 Email: ${createdSubscriberModal.email}\n🔑 Password: ${createdSubscriberModal.password}\n\n✓ No OTP required. You can log in directly anytime.`;
                    navigator.clipboard.writeText(text);
                    setCopiedCredentials(true);
                    setTimeout(() => setCopiedCredentials(false), 3000);
                  }}
                >
                  {copiedCredentials ? '✅ Copied to Clipboard!' : '📋 Copy Login Credentials'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '12px 20px' }}
                  onClick={() => setCreatedSubscriberModal(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Register New System API Key */}
        {showApiKeyModal && (
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
              zIndex: 1150,
              padding: '20px',
            }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🔑</span>
                  <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                    Register System API Key
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Add keys to the active rotation pool. You can register multiple Gemini keys to handle high review generation volume without hitting quota limits.
              </p>

              <form onSubmit={handleCreateApiKey}>
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select
                    className="form-select"
                    value={apiKeyForm.service}
                    onChange={(e) => {
                      const s = e.target.value;
                      setApiKeyForm({
                        ...apiKeyForm,
                        service: s,
                        secondaryValue: s === 'GEMINI' ? 'gemini-flash-latest' : '',
                      });
                      setTestResult(null);
                    }}
                  >
                    <option value="GEMINI">🤖 Google Gemini AI (Review Generation)</option>
                    <option value="AWS_SMS">📱 AWS SNS SMS (Phone Verification OTP)</option>
                    <option value="GOOGLE_MAPS">📍 Google Maps API (Local Telemetry &amp; CID)</option>
                    <option value="RAZORPAY">💳 Razorpay (Subscriptions &amp; Verification)</option>
                    <option value="EMAIL">✉️ SMTP / Email Service (OTP &amp; Receipts)</option>
                    <option value="OTHER">⚙️ Other Custom Integration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Label / Description *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Primary Gemini Flash Account, Backup Key 2..."
                    value={apiKeyForm.name}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">API Key Secret *</label>
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      style={{ background: 'none', border: 'none', fontSize: '11.5px', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      {showKeySecret ? 'Hide 👁️' : 'Show 👁️'}
                    </button>
                  </div>
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="e.g. AIzaSy..."
                    value={apiKeyForm.keyValue}
                    onChange={(e) => {
                      setApiKeyForm({ ...apiKeyForm, keyValue: e.target.value });
                      setTestResult(null);
                    }}
                    style={{ fontFamily: showKeySecret ? 'inherit' : 'monospace' }}
                  />
                </div>

                {apiKeyForm.service === 'GEMINI' && (
                  <div className="form-group">
                    <label className="form-label">Gemini Model (Default: gemini-flash-latest)</label>
                    <select
                      className="form-select"
                      value={apiKeyForm.secondaryValue}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, secondaryValue: e.target.value })}
                    >
                      <option value="gemini-flash-latest">gemini-flash-latest (Recommended - Fastest &amp; High RPM)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Production)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
                    </select>
                  </div>
                )}

                {/* Live Pre-Validation Button & Result */}
                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    disabled={testingRaw || !apiKeyForm.keyValue.trim()}
                    onClick={handleTestRawKey}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {testingRaw ? 'Pinging Google Gemini...' : '⚡ Test Key Live Before Saving'}
                  </button>

                  {testResult && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: testResult.status === 'HEALTHY' ? '#dcfce7' : '#fee2e2',
                        color: testResult.status === 'HEALTHY' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {testResult.status === 'HEALTHY' ? '✓ ' : '✕ '}
                      {testResult.message}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="keyActiveCheck"
                    checked={apiKeyForm.isActive}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="keyActiveCheck" style={{ fontSize: '13px', cursor: 'pointer', margin: 0 }}>
                    Enable this key immediately in the active pool
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowApiKeyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 600 }}>
                    Register API Key
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
