import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  KindlyRateLogo,
  KindlyRateIcon,
  GoogleLogo,
  WhatsAppLogo,
  InstagramLogo,
  FacebookLogo,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  ShieldIcon,
  ZapIcon,
  PrinterIcon,
  UsersIcon,
  ChefIcon,
  ChartBarIcon,
  BroadcastIcon,
  RefreshIcon,
  PlusIcon,
  MobileIcon,
  ClipboardCopyIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ScaleIcon,
  GiftIcon,
  TicketIcon,
  MapPinIcon,
  StorefrontIcon,
  SettingsIcon,
  GridIcon,
  DiceIcon,
  CheckCircleIcon,
} from '../components/Logos.js';
import { EmailVerificationModal } from '../components/EmailVerificationModal.js';
import {
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  LogOut,
  ExternalLink,
  Bell,
  Phone,
  Mail,
  Target,
  Tag,
  QrCode,
  SlidersHorizontal,
  Download,
  Printer,
  MapPin,
  MessageSquare,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Zap,
  Layers,
  Code2,
  Briefcase,
  Sparkles,
  Trash2,
  Edit2,
  Palette,
  AlertTriangle,
  RefreshCw,
  Star,
  Flame,
  Heart,
  Coffee,
  Save,
  Clock,
  Lightbulb,
  Shield,
  Store,
  Check,
  Lock,
} from 'lucide-react';
import { LegalModals, LegalModalType } from '../components/LegalModals.js';
import { DiwaliSpinningOffer } from '../components/DiwaliSpinningOffer.js';
import { GeoGridHeatmap } from '../components/GeoGridHeatmap.js';
import { ScratchCard } from '../components/ScratchCard.js';
import { convertGoogleMapsUrl } from '../utils/mapsUrlHelper.js';
import { PhoneInput } from '../components/PhoneInput.js';
import { validatePhoneNumber } from '../utils/phoneValidator.js';
import { loadRazorpay } from '../utils/razorpay.js';

const DEFAULT_SETTINGS = {
  reviewTone: 'friendly',
  reviewLength: 'medium',
  autoRedirectGoogle: false,
  thingsToHighlight: [],
  targetKeywords: [],
  scratchCardEnabled: false,
  scratchCardType: 'golden_ticket',
  scratchCardRewardTitle: '10% Off Your Next Visit',
  scratchCardRewardDescription: 'Show this code at billing to redeem!',
  scratchCardCouponCode: 'WELCOME10',
  scratchCardWinProbability: 100,
  scratchCardLoseMessage: 'Thank you for your review!',
};

interface Props {
  businessId: string;
  initialBusiness?: any;
  onLogout: () => void;
  onSwitchBusiness?: () => void;
}

export const BusinessDashboard: React.FC<Props> = ({ businessId, initialBusiness, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'qrs' | 'ai_settings' | 'history' | 'profile' | 'subscription' | 'custom_software'
  >('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enforce Clean Light Mode (Dark mode removed per user request)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('kindlyrate_theme');
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [business, setBusiness] = useState<any>(initialBusiness || null);
  const [usage, setUsage] = useState<any>(null);
  const [qrs, setQrs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [analytics, setAnalytics] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [planDurations, setPlanDurations] = useState<Record<string, 1 | 3 | 6 | 12>>({});
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Reputation & Shield Controls
  const [shieldStrictness, setShieldStrictness] = useState<'standard' | 'strict'>('standard');
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '30d'>('7d');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    googleReviewUrl: '',
    googleMapsShareUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    whatsappUrl: '',
    description: '',
    openingHours: '',
  });

  const [convertingMapsLink, setConvertingMapsLink] = useState(false);
  const [mapsLinkSuccessMsg, setMapsLinkSuccessMsg] = useState('');
  const [quickMapsUrl, setQuickMapsUrl] = useState('');
  const [quickSavingMaps, setQuickSavingMaps] = useState(false);
  const [quickMapsSuccess, setQuickMapsSuccess] = useState(false);

  // Settings Tags State
  const [newHighlightTag, setNewHighlightTag] = useState('');
  const [newTargetKeyword, setNewTargetKeyword] = useState('');

  // Create & Edit QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [newQRName, setNewQRName] = useState('');
  const [newQRLocation, setNewQRLocation] = useState('Table 1');
  const [newQRGoogleReviewUrl, setNewQRGoogleReviewUrl] = useState('');
  const [editingQR, setEditingQR] = useState<any | null>(null);
  // QR Stand Design & Color Studio State
  const [selectedQRForDesign, setSelectedQRForDesign] = useState<any | null>(null);
  const [designColor, setDesignColor] = useState<string>('#9a4018');
  const [designBgColor, setDesignBgColor] = useState<string>('#ffffff');
  const [designStyle, setDesignStyle] = useState<string>('classic');
  const [savingDesign, setSavingDesign] = useState<boolean>(false);

  const handleOpenQRDesignStudio = (qr: any) => {
    setSelectedQRForDesign(qr);
    setDesignColor(qr.colorDark || '#9a4018');
    setDesignBgColor(qr.colorLight || '#ffffff');
    setDesignStyle(qr.designStyle || 'classic');
  };

  const handleSaveQRDesign = async () => {
    if (!selectedQRForDesign) return;
    try {
      setSavingDesign(true);
      await api.updateQR(business.id, selectedQRForDesign.id, {
        colorDark: designColor,
        colorLight: designBgColor,
        designStyle: designStyle,
      });
      setQrs((prev) =>
        prev.map((q) =>
          q.id === selectedQRForDesign.id
            ? { ...q, colorDark: designColor, colorLight: designBgColor, designStyle }
            : q
        )
      );
      showNotification(`Saved custom design & color for "${selectedQRForDesign.name}"!`);
      setSelectedQRForDesign(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save stand design');
    } finally {
      setSavingDesign(false);
    }
  };


  // Software Inquiry Callback Modal
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    serviceType: 'Real-Time Delivery Fleet & Dispatch Logistics',
    contactPhone: '',
    requirements: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // System Notifications from Super Admin
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Help & Contact Modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpForm, setHelpForm] = useState({
    subject: 'General Question / System Support',
    message: '',
    phone: '',
  });
  const [submittingHelp, setSubmittingHelp] = useState(false);

  // Filters for Review History
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Google Maps AI Telemetry Refresh
  const [isRefreshingMaps, setIsRefreshingMaps] = useState(false);
  const [initiatingPlanId, setInitiatingPlanId] = useState<string | null>(null);

  // Toast / Status Message
  const [toast, setToast] = useState<string | null>(null);

  // Mobile & Banner UX states
  const [emailBannerDismissed, setEmailBannerDismissed] = useState(() => {
    try { return sessionStorage.getItem('kindlyrate_dismiss_email_banner') === 'true'; } catch { return false; }
  });
  const [systemNotifDismissed, setSystemNotifDismissed] = useState(() => {
    try { return sessionStorage.getItem('kindlyrate_dismiss_sys_notif') === 'true'; } catch { return false; }
  });
  const [mapsSetupDismissed, setMapsSetupDismissed] = useState(() => {
    try { return sessionStorage.getItem('kindlyrate_dismiss_maps_setup') === 'true'; } catch { return false; }
  });
  const [overviewMobileSubtab, setOverviewMobileSubtab] = useState<'kpis' | 'questions' | 'keywords' | 'charts'>('kpis');
  const [overviewSection, setOverviewSection] = useState<'activity' | 'setup' | 'seo' | 'roi'>('activity');
  const [weeklyViewSubtab, setWeeklyViewSubtab] = useState<'chart' | 'tips'>('chart');
  const [setupSubtab, setSetupSubtab] = useState<'questions' | 'keywords'>('questions');
  const [seoSubtab, setSeoSubtab] = useState<'grid' | 'table'>('grid');
  const [roiSubtab, setRoiSubtab] = useState<'financial' | 'competitors' | 'peakhours'>('financial');
  const [autoRenewChoice, setAutoRenewChoice] = useState<boolean>(true);
  const [newOverviewQuestion, setNewOverviewQuestion] = useState('');

  // Festive Limited-Time Offer Countdown Timer (Approx 2h 47m live countdown)
  const [offerTimeLeft, setOfferTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '02',
    minutes: '47',
    seconds: '19',
  });

  // Legal Modals & Account Deletion State
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }
    try {
      setIsDeletingAccount(true);
      setDeleteError(null);
      await api.deleteAccount();
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    let expiry = 0;
    try {
      const stored = localStorage.getItem('kindlyrate_festive_offer_expiry');
      if (stored) {
        expiry = parseInt(stored, 10);
      }
    } catch {}

    const now = Date.now();
    if (!expiry || expiry <= now) {
      expiry = now + (2 * 3600 + 47 * 60 + 19) * 1000;
      try {
        localStorage.setItem('kindlyrate_festive_offer_expiry', String(expiry));
      } catch {}
    }

    const updateTimer = () => {
      const diff = Math.max(0, expiry - Date.now());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setOfferTimeLeft({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAddQuestion = async (labelToAdd?: string) => {
    const text = (labelToAdd || newOverviewQuestion).trim();
    if (!text) return;

    const newKey = `q_${Date.now()}`;
    const newQ = {
      questionKey: newKey,
      label: text,
      scaleType: '1-5_STARS',
      displayOrder: questions.length,
      isRequired: true,
      isActive: true,
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    setNewOverviewQuestion('');

    try {
      const saved = await api.saveQuestions(businessId, updated);
      setQuestions(saved);
      showNotification(`✓ Rating question "${text}" is live on your QR stands!`);
    } catch (err: any) {
      console.error('Failed to auto-save question:', err);
      showNotification(`Added "${text}"`);
    }
  };

  const handleQuickRemoveQuestion = async (idxToRemove: number) => {
    const updated = questions.filter((_, i) => i !== idxToRemove);
    setQuestions(updated);
    try {
      const saved = await api.saveQuestions(businessId, updated);
      setQuestions(saved);
      showNotification('Rating question removed.');
    } catch (err: any) {
      console.error('Failed to auto-save question remove:', err);
    }
  };

  const handleDismissEmailBanner = () => {
    setEmailBannerDismissed(true);
    try { sessionStorage.setItem('kindlyrate_dismiss_email_banner', 'true'); } catch {}
  };
  const handleDismissSystemNotif = () => {
    setSystemNotifDismissed(true);
    try { sessionStorage.setItem('kindlyrate_dismiss_sys_notif', 'true'); } catch {}
  };
  const handleDismissMapsSetup = () => {
    setMapsSetupDismissed(true);
    try { sessionStorage.setItem('kindlyrate_dismiss_maps_setup', 'true'); } catch {}
  };

  // Subscription verification state
  const isPaidActive = Boolean(
    (subscriptionData?.status === 'ACTIVE') ||
    (subscriptionData?.status === 'TRIAL' && subscriptionData?.trialActivated === true) ||
    (usage?.subscription?.status === 'ACTIVE') ||
    (usage?.subscription?.status === 'TRIAL' && usage?.subscription?.trialActivated === true)
  );

  // Lucky Festive Spin Modal popup state
  const [showSpinModal, setShowSpinModal] = useState<boolean>(false);

  // Auto-prompt lucky spin popup once per session for unpaid visitors after short delay
  useEffect(() => {
    if (!loading && !isPaidActive) {
      try {
        const alreadyShown = sessionStorage.getItem('kindlyrate_spin_auto_shown');
        if (!alreadyShown) {
          const timer = setTimeout(() => {
            setShowSpinModal(true);
            sessionStorage.setItem('kindlyrate_spin_auto_shown', 'true');
          }, 1400);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [loading, isPaidActive]);

  useEffect(() => {
    loadAllData();
  }, [businessId]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  };

  const handlePayTrial = async () => {
    try {
      setInitiatingPlanId('trial');
      const trialPlan = plans.find((p) => p.slug === 'starter') || plans[0];
      const [order, isLoaded] = await Promise.all([
        api.createOrder(businessId, trialPlan.id, { isTrial: true }),
        loadRazorpay(),
      ]);
      if (isLoaded && (window as any).Razorpay) {
        const isSub = Boolean(order.subscriptionId || order.isSubscription);
        const options: any = {
          key: order.keyId,
          currency: order.currency,
          name: 'KindlyRate Platform',
          description: isSub
            ? 'Testing Pack (₹79 Starter Trial · Monthly UPI Autopay)'
            : 'Testing Pack (₹79 Starter Trial)',
          prefill: {
            name: business?.name || currentUser?.name || 'Business Owner',
            email: business?.email || currentUser?.email || '',
            contact: (business?.phone || currentUser?.phone || '').replace(/[^0-9]/g, '').slice(-10),
          },
          theme: { color: '#9a4018' },
          handler: async (response: any) => {
            try {
              await api.verifyPayment(businessId, {
                orderId: response.razorpay_subscription_id || response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                subscriptionId: response.razorpay_subscription_id,
              });
              showNotification('Testing Pack Trial Activated for ₹79 via UPI Autopay!');
              loadAllData();
            } catch (vErr: any) {
              showNotification(`Trial activation verification note: ${vErr.message}`);
            } finally {
              setInitiatingPlanId(null);
            }
          },
          modal: {
            ondismiss: () => {
              setInitiatingPlanId(null);
            },
          },
        };

        if (isSub) {
          options.subscription_id = order.subscriptionId || order.orderId;
        } else {
          options.order_id = order.orderId;
          options.amount = order.amount;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', () => {
          setInitiatingPlanId(null);
        });
        rzp.open();
      } else {
        setInitiatingPlanId(null);
        showNotification('Razorpay checkout is loading. Please try again in a moment.');
      }
    } catch (err: any) {
      setInitiatingPlanId(null);
      showNotification(err.message || 'Failed to start trial payment');
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Fast single round-trip bootstrap load
      try {
        const boot = await api.getDashboardBootstrap(businessId);
        if (boot && boot.business) {
          if (boot.user) setCurrentUser(boot.user);
          const bRes = boot.business;
          setBusiness(bRes);
          setProfileForm({
            name: bRes.name || '',
            phone: bRes.phone || '',
            address: bRes.address || '',
            city: bRes.city || '',
            state: bRes.state || '',
            pincode: bRes.pincode || '',
            googleReviewUrl: bRes.googleReviewUrl || '',
            googleMapsShareUrl: bRes.googleMapsShareUrl || '',
            instagramUrl: bRes.instagramUrl || '',
            facebookUrl: bRes.facebookUrl || '',
            whatsappUrl: bRes.whatsappUrl || '',
            description: bRes.description || '',
            openingHours: bRes.openingHours || '',
          });
          setInquiryForm((prev) => ({ ...prev, contactPhone: bRes.phone || '' }));
          setHelpForm((prev) => ({ ...prev, phone: bRes.phone || '' }));

          setUsage(boot.usage || null);
          setQrs(boot.qrs || []);
          setReviews(boot.reviews || []);
          setQuestions((boot.questions || []).map((q: any) => ({
            ...q,
            label: q.label || q.text || 'Rating Criteria',
            displayOrder: q.displayOrder ?? q.order ?? 0,
            isActive: q.isActive ?? q.active ?? true,
          })));
          setSettings(boot.settings || DEFAULT_SETTINGS);
          setAnalytics(boot.analytics || null);
          setPlans(boot.plans || []);
          setSystemNotifications(boot.notifications || []);
          setSubscriptionData(boot.subscription || null);
          setPaymentHistory(boot.paymentHistory || []);
          return;
        }
      } catch (bootErr) {
        console.warn('Bootstrap request fallback to parallel endpoints:', bootErr);
      }

      const [bRes, uRes, qRes, rRes, qsRes, sRes, aRes, pRes, meRes, notifRes, subRes, histRes] = await Promise.all([
        api.getBusiness(businessId),
        api.getUsage(businessId),
        api.getQRs(businessId),
        api.getReviews(businessId),
        api.getQuestions(businessId),
        api.getSettings(businessId),
        api.getAnalytics(businessId),
        api.getPlans(),
        api.getMe().catch(() => null),
        api.getBusinessNotifications(businessId).catch(() => []),
        api.getSubscription(businessId).catch(() => null),
        api.getPaymentHistory(businessId).catch(() => []),
      ]);

      if (meRes?.user) {
        setCurrentUser(meRes.user);
      }

      setBusiness(bRes);
      setProfileForm({
        name: bRes.name || '',
        phone: bRes.phone || '',
        address: bRes.address || '',
        city: bRes.city || '',
        state: bRes.state || '',
        pincode: bRes.pincode || '',
        googleReviewUrl: bRes.googleReviewUrl || '',
        googleMapsShareUrl: bRes.googleMapsShareUrl || '',
        instagramUrl: bRes.instagramUrl || '',
        facebookUrl: bRes.facebookUrl || '',
        whatsappUrl: bRes.whatsappUrl || '',
        description: bRes.description || '',
        openingHours: bRes.openingHours || '',
      });
      setInquiryForm((prev) => ({ ...prev, contactPhone: bRes.phone || '' }));
      setHelpForm((prev) => ({ ...prev, phone: bRes.phone || '' }));

      setUsage(uRes || null);
      setQrs(qRes || []);
      setReviews(rRes || []);
      setQuestions((qsRes || []).map((q: any) => ({
        ...q,
        label: q.label || q.text || 'Rating Criteria',
        displayOrder: q.displayOrder ?? q.order ?? 0,
        isActive: q.isActive ?? q.active ?? true,
      })));
      setSettings(sRes || DEFAULT_SETTINGS);
      setAnalytics(aRes || null);
      setPlans(pRes || []);
      setSystemNotifications(notifRes || []);
      setSubscriptionData(subRes || null);
      setPaymentHistory(histRes || []);
    } catch (e: any) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      setTogglingAutoRenew(true);
      const newStatus = !subscriptionData?.autoRenew;
      await api.toggleAutoRenew(businessId, newStatus);
      setSubscriptionData((prev: any) => ({ ...prev, autoRenew: newStatus }));
      showNotification(`Monthly Auto-Renewal ${newStatus ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle auto-renewal');
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  // 1. Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.phone && profileForm.phone.trim()) {
      const phoneVal = validatePhoneNumber(profileForm.phone);
      if (!phoneVal.isValid) {
        alert(phoneVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    try {
      setSavingProfile(true);
      const updated = await api.updateBusiness(businessId, profileForm);
      setBusiness(updated);
      showNotification('Profile and Google destination updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update business profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Convert Google Maps share link to direct review dialog link
  const handleConvertMapsLink = async () => {
    const rawToConvert = profileForm.googleMapsShareUrl || profileForm.googleReviewUrl;
    if (!rawToConvert || !rawToConvert.trim()) {
      showNotification('Please paste a Google Maps share link or location URL first.');
      return;
    }
    setConvertingMapsLink(true);
    setMapsLinkSuccessMsg('');
    try {
      const result = await convertGoogleMapsUrl(rawToConvert);
      setProfileForm((prev) => ({
        ...prev,
        googleReviewUrl: result.directReviewUrl,
        googleMapsShareUrl: prev.googleMapsShareUrl || rawToConvert,
      }));
      setMapsLinkSuccessMsg('Converted to direct 5-star Google Review link!');
      showNotification('Converted to direct review link! Test it below.');
    } catch (err: any) {
      alert(err.message || 'Failed to convert Google Maps link.');
    } finally {
      setConvertingMapsLink(false);
    }
  };

  const handleQuickConnectMaps = async () => {
    if (!quickMapsUrl || !quickMapsUrl.trim()) {
      showNotification('Please enter your Google Maps link or share link.');
      return;
    }
    setQuickSavingMaps(true);
    try {
      let targetUrl = quickMapsUrl.trim();
      try {
        const res = await convertGoogleMapsUrl(targetUrl);
        if (res && res.directReviewUrl) {
          targetUrl = res.directReviewUrl;
        }
      } catch {}

      const updated = await api.updateBusiness(businessId, {
        googleReviewUrl: targetUrl,
        googleMapsShareUrl: quickMapsUrl.trim(),
      });
      setBusiness(updated);
      setProfileForm((prev) => ({
        ...prev,
        googleReviewUrl: targetUrl,
        googleMapsShareUrl: quickMapsUrl.trim(),
      }));
      setQuickMapsSuccess(true);
      showNotification('✓ Google Maps Review Link Connected Successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update Google Maps link.');
    } finally {
      setQuickSavingMaps(false);
    }
  };

  // 2. Create, Edit & Delete QR Stands
  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalReviewUrl = newQRGoogleReviewUrl.trim();
      if (finalReviewUrl) {
        try {
          const res = await convertGoogleMapsUrl(finalReviewUrl);
          if (res?.directReviewUrl) {
            finalReviewUrl = res.directReviewUrl;
          }
        } catch {}
      }
      const created = await api.createQR(
        businessId,
        newQRName || 'QR Stand',
        newQRLocation,
        finalReviewUrl || undefined
      );
      setQrs([...qrs, created]);
      setShowQRModal(false);
      setNewQRName('');
      setNewQRLocation('Table 1');
      setNewQRGoogleReviewUrl('');
      showNotification(`QR Stand "${created.name}" created successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to create QR code.');
    }
  };

  const handleUpdateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQR) return;
    try {
      let finalReviewUrl = (editingQR.googleReviewUrl || '').trim();
      if (finalReviewUrl) {
        try {
          const res = await convertGoogleMapsUrl(finalReviewUrl);
          if (res?.directReviewUrl) {
            finalReviewUrl = res.directReviewUrl;
          }
        } catch {}
      }
      const updated = await api.updateQR(businessId, editingQR.id, {
        name: editingQR.name,
        locationTag: editingQR.locationTag,
        googleReviewUrl: finalReviewUrl || '',
      });
      setQrs(qrs.map((q) => (q.id === editingQR.id ? { ...q, ...updated } : q)));
      setEditingQR(null);
      showNotification(`QR Stand "${updated.name}" updated successfully`);
    } catch (err: any) {
      alert(err.message || 'Failed to update QR Stand.');
    }
  };

  const handleDeleteQR = async (qrId: string, qrName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${qrName}"? This stand will be permanently removed.`)) {
      return;
    }
    try {
      await api.deleteQR(businessId, qrId);
      setQrs(qrs.filter((q) => q.id !== qrId));
      showNotification(`QR Stand "${qrName}" deleted successfully`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete QR Stand.');
    }
  };

  // 3. Save Questions
  const handleSaveQuestions = async () => {
    try {
      const saved = await api.saveQuestions(businessId, questions);
      setQuestions(saved);
      showNotification('Customer rating criteria saved successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to save questions.');
    }
  };

  // 4. Save AI Settings & Tone
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const saved = await api.saveSettings(businessId, settings);
      setSettings(saved);
      showNotification('Review settings updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // 5. Submit Custom Software Inquiry
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryForm.contactPhone && inquiryForm.contactPhone.trim()) {
      const pVal = validatePhoneNumber(inquiryForm.contactPhone);
      if (!pVal.isValid) {
        alert(pVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    try {
      setSubmittingInquiry(true);
      await api.submitSoftwareInquiry(businessId, inquiryForm);
      setShowInquiryModal(false);
      showNotification('Consultation request sent! We will contact you shortly.');
      setInquiryForm({
        serviceType: 'Real-Time Delivery Fleet & Dispatch Logistics',
        contactPhone: business?.phone || '',
        requirements: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // 5b. Submit Help & Support Ticket
  const handleSendHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneToValidate = helpForm.phone || business?.phone;
    if (phoneToValidate && phoneToValidate.trim()) {
      const pVal = validatePhoneNumber(phoneToValidate);
      if (!pVal.isValid) {
        alert(pVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    try {
      setSubmittingHelp(true);
      await api.submitSoftwareInquiry(businessId, {
        serviceType: `[SUPPORT TICKET] ${helpForm.subject}`,
        contactPhone: helpForm.phone || business?.phone || '',
        requirements: helpForm.message,
      });
      setShowHelpModal(false);
      showNotification('Support request received! We will reply promptly.');
      setHelpForm({ subject: 'General Question / System Support', message: '', phone: business?.phone || '' });
    } catch (err: any) {
      alert(err.message || 'Failed to submit help ticket.');
    } finally {
      setSubmittingHelp(false);
    }
  };

  // 6. Handle Live Google Maps Ranking Refresh
  const handleRefreshMapsRankings = async () => {
    if (!businessId) return;
    try {
      setIsRefreshingMaps(true);
      const freshMaps = await api.refreshMapsRankings(businessId);
      setAnalytics((prev: any) => ({
        ...prev,
        keywordRankings: freshMaps.keywordRankings,
        competitorRadar: freshMaps.competitorRadar,
        localSeoMetrics: freshMaps.localSeoMetrics,
        isAiGrounding: freshMaps.isAiGrounding,
      }));
      showNotification('✓ Google Maps rankings updated!');
    } catch (err: any) {
      showNotification(`Failed to refresh Google Maps rankings: ${err.message || 'Error'}`);
    } finally {
      setIsRefreshingMaps(false);
    }
  };

  // 7. Handle Aura AI Lever Executions
  const handleExecuteAuraLever = async (leverId: string) => {
    if (leverId === 'dish_boost') {
      if (settings) {
        const existing = settings.thingsToHighlight || [];
        const dynamicAdditions = business?.subcategory ? [`Best ${business.subcategory}`, 'Quality Service', 'Top Hospitality'] : ['Quality Service', 'Top Hospitality'];
        const updated = Array.from(new Set([...existing, ...dynamicAdditions]));
        const newSettings = { ...settings, thingsToHighlight: updated, reviewTone: 'enthusiastic' };
        setSettings(newSettings);
        await api.saveSettings(businessId, newSettings);
        showNotification('Keywords saved! Suggestions will appear in review drafts.');
      }
    } else if (leverId === 'waiter_bonus') {
      showNotification('Team recognition updated successfully.');
    } else if (leverId === 'google_pack_gap') {
      showNotification('Google review priority activated.');
    }
  };

  const handleAddTargetKeyword = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed || !settings) return;
    const currentKeywords = settings.targetKeywords || settings.thingsToHighlight || [];
    if (currentKeywords.includes(trimmed)) return;
    const updated = [...currentKeywords, trimmed];
    const newSettings = {
      ...settings,
      targetKeywords: updated,
      thingsToHighlight: updated,
    };
    setSettings(newSettings);
    setNewTargetKeyword('');
    try {
      await api.saveSettings(business?.id || businessId, newSettings);
      showNotification(`Target keyword "${trimmed}" saved`);
    } catch (e: any) {
      console.warn('Failed saving target keyword:', e);
    }
  };

  const handleRemoveTargetKeyword = async (keyword: string) => {
    if (!settings) return;
    const currentKeywords = settings.targetKeywords || settings.thingsToHighlight || [];
    const updated = currentKeywords.filter((k: string) => k !== keyword);
    const newSettings = {
      ...settings,
      targetKeywords: updated,
      thingsToHighlight: updated,
    };
    setSettings(newSettings);
    try {
      await api.saveSettings(business?.id || businessId, newSettings);
      showNotification(`Removed keyword "${keyword}"`);
    } catch (e: any) {
      console.warn('Failed removing target keyword:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '3.5px', borderTopColor: 'var(--primary)', borderColor: 'rgba(154, 64, 24, 0.15)' }}></div>
          <Zap size={18} color='var(--primary)' style={{ position: 'absolute' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            Loading your business dashboard
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
            Syncing customer reviews, smart QR stands, and real-time growth insights
          </p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px 24px', boxShadow: 'var(--shadow-md)' }}>
          <AlertTriangle size={36} color="#d97706" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px 0' }}>
            Unable to Load Business Data
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            We could not connect to your business profile. Please check your connection or try refreshing.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={loadAllData} style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} />
              <span>Retry Loading</span>
            </button>
            <button className="btn btn-secondary" onClick={onLogout} style={{ fontSize: '13px', padding: '8px 18px' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Daily Trends for visual bar chart
  const dailyTrends = analytics?.dailyTrends || [];
  const maxDayReviews = Math.max(10, ...dailyTrends.map((d: any) => d.totalReviews || 0));

  const roi = analytics?.roiEstimate || {
    estimatedMonthlyRevenueBoostInr: 0,
    projectedAnnualGainsInr: 0,
    reviewsVelocityPerWeek: 0,
    negativeReviewsShielded: 0,
    reputationProtectionScore: '100%',
    googleLocalPackRank: 'Awaiting Initial Reviews',
    averageRatingLiftVsLocal: '0.0 ★',
  };

  const financial = analytics?.financialTelemetry || {
    walkInRevenueInr: 0,
    aggregatorCommissionsSavedInr: 0,
    shieldRecoveredRevenueInr: 0,
    totalMonthlyImpactInr: 0,
    customerLifetimeValueMultiplier: '1.0x',
    acquisitionCostVsAds: '₹0 / review',
  };

  const competitors = analytics?.competitorRadar || [];
  const aura = analytics?.auraBriefing || {
    statusText: 'All systems operating at peak efficiency. Aura Reputation Shield active.',
    defenseShieldHealth: '100% Shield Armed & Ready',
    recommendations: [],
  };

  const keywordRankings = analytics?.keywordRankings || [];

  const localSeo = analytics?.localSeoMetrics || {
    averageRankLift: 'Baseline Setup',
    totalSearchImpressions: 0,
    impressionsGrowth: '0%',
    mapsDirectionsClicks: 0,
    directionsGrowth: '0%',
    phoneCallClicks: 0,
    phoneCallsGrowth: '0%',
    topThreeShare: '0%',
    headline: 'Google Maps Rank Tracker Active',
    rankingMessage: `Live ranking tracker active for ${business?.city || 'your area'}. As customers scan your QR code and post 5-star reviews, your store's Google Maps ranking and local visibility will climb.`,
  };

  const navTabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: <ChartBarIcon size={18} />,
      badge: null,
    },
    {
      id: 'qrs' as const,
      label: 'QR Code Stands',
      icon: <MobileIcon size={18} />,
      badge: qrs.length,
    },
    {
      id: 'history' as const,
      label: 'Customer Reviews',
      icon: <ClipboardCopyIcon size={18} />,
      badge: reviews.length,
    },
    {
      id: 'ai_settings' as const,
      label: 'Review Settings',
      icon: <SettingsIcon size={18} />,
      badge: null,
    },
    {
      id: 'profile' as const,
      label: 'Business Profile',
      icon: <StorefrontIcon size={18} />,
      badge: null,
    },
    {
      id: 'subscription' as const,
      label: 'Subscription & Plans',
      icon: <ShieldCheckIcon size={18} />,
      badge: isPaidActive ? 'PRO' : 'TRIAL',
    },
    {
      id: 'custom_software' as const,
      label: 'Custom Software',
      icon: <Layers size={18} />,
      badge: 'SOLUTIONS',
    },
  ];

  const currentTabMeta = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <div className="dashboard-layout">
      {/* Toast Notification */}
      {toast && (
        <div className="app-toast">
          <span>{toast}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation (Google Ads / Stripe Style) */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-sidebar-header">
          <div className="dashboard-brand-row">
            <div className="dashboard-brand-logo">
              <KindlyRateIcon size={26} />
              <span className="dashboard-brand-title">KindlyRate</span>
            </div>
            <button
              type="button"
              className="show-mobile-only"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Business Info Card */}
          <div className="dashboard-biz-card">
            <div className="dashboard-biz-avatar">
              {business?.name ? business.name.charAt(0).toUpperCase() : 'K'}
            </div>
            <div className="dashboard-biz-info">
              <div className="dashboard-biz-name" title={business?.name || 'Your Business'}>
                {business?.name || 'Your Business'}
              </div>
              <div className="dashboard-biz-meta">
                {business?.city || 'Local Area'} · {business?.subcategory || 'Business'}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="dashboard-sidebar-nav">
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px' }}>
            Main Menu
          </div>
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`dashboard-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="dashboard-nav-item-content">
                  <span className="dashboard-nav-item-icon">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== null && (
                  <span className="dashboard-nav-pill">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ margin: '14px 0 6px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 14px 6px' }}>
              Quick Links
            </div>

            {qrs[0] && (
              <a
                href={`/r/${qrs[0].slug}`}
                target="_blank"
                rel="noreferrer"
                className="dashboard-nav-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="dashboard-nav-item-content">
                  <span className="dashboard-nav-item-icon">
                    <SparklesIcon size={16} />
                  </span>
                  <span>Test Review Flow</span>
                </div>
                <ExternalLink size={13} color="var(--text-subtle)" />
              </a>
            )}

            {business?.googleReviewUrl && (
              <a
                href={business.googleReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="dashboard-nav-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="dashboard-nav-item-content">
                  <span className="dashboard-nav-item-icon">
                    <GoogleLogo size={16} />
                  </span>
                  <span>Google Maps Profile</span>
                </div>
                <ExternalLink size={13} color="var(--text-subtle)" />
              </a>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="dashboard-sidebar-footer">
          <div className="dashboard-helpline-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              <Phone size={13} color="var(--primary)" />
              <span>Helpline &amp; Support</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '8px' }}>
              +91 81238 24899 (Mon–Sat)
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              Get Instant Assistance
            </button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 14px',
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>

          {/* Hidden Legal Documents & Terms Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-subtle)',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11px',
                textDecoration: 'underline',
              }}
            >
              Terms
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11px',
                textDecoration: 'underline',
              }}
            >
              Privacy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('refund')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11px',
                textDecoration: 'underline',
              }}
            >
              Refunds
            </button>
          </div>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="dashboard-main">
        {/* Slim Topbar Header */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              className="show-mobile-only"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="dashboard-page-title">
                  {currentTabMeta.label}
                </h1>
                <span className="badge badge-success hide-mobile" style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  Active
                </span>
              </div>
              <div className="hide-mobile" style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {business?.name || 'Your Business'} · {business?.city || 'Local Area'} · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Google Rank #{roi.googleLocalPackRank}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-topbar-actions">
            {/* Festive Spin & Win Trigger Button */}
            {!isPaidActive && (
              <button
                type="button"
                onClick={() => setShowSpinModal(true)}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: '1px solid var(--primary-hover)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                }}
                title="Spin Diwali Lucky Wheel - Win 84% OFF"
              >
                <Sparkles size={14} color="#fef08a" />
                <span className="hide-mobile">Spin & Win 84% OFF</span>
                <span className="show-mobile-only">Spin</span>
              </button>
            )}



            {/* Announcements & Notifications Bell */}
            <button
              type="button"
              className="hide-mobile"
              onClick={() => setShowNotifDrawer(true)}
              style={{
                position: 'relative',
                background: systemNotifications.length > 0 ? 'rgba(124, 58, 237, 0.08)' : 'var(--surface-container)',
                color: systemNotifications.length > 0 ? '#7c3aed' : 'var(--text)',
                border: systemNotifications.length > 0 ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid var(--border)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="System Announcements & Notifications"
            >
              <Bell size={15} />
              <span className="hide-mobile">Alerts</span>
              {systemNotifications.length > 0 && (
                <span
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '10px',
                  }}
                >
                  {systemNotifications.length}
                </span>
              )}
            </button>

            {/* Help & Contact Button */}
            <button
              type="button"
              className="hide-mobile"
              onClick={() => setShowHelpModal(true)}
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Get Help or Contact Support Anytime"
            >
              <Phone size={14} />
              <span className="hide-mobile">Help</span>
            </button>

            {/* Upgrade / Plan Status Button */}
            {!isPaidActive ? (
              <button
                type="button"
                onClick={handlePayTrial}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(154, 64, 24, 0.25)',
                }}
                title="Activate Testing Pack"
              >
                <Zap size={14} color="#ffffff" />
                <span>Activate Pack (₹79)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(154, 64, 24, 0.2)',
                }}
                title="Manage Subscription"
              >
                <TrendingUpIcon size={14} color="#ffffff" />
                <span className="hide-mobile">Manage Plan</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline hide-mobile"
              style={{ fontSize: '12.5px', padding: '7px 12px' }}
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        </header>

      {/* System Announcement Top Notification Bar */}
      {systemNotifications.length > 0 && !systemNotifDismissed && (
        <div
          className="mobile-slim-notice"
          style={{
            background:
              systemNotifications[0].type === 'ALERT'
                ? '#fef2f2'
                : systemNotifications[0].type === 'WARNING'
                  ? '#fffbeb'
                  : '#f0fdf4',
            borderBottom:
              systemNotifications[0].type === 'ALERT'
                ? '1px solid #fecaca'
                : systemNotifications[0].type === 'WARNING'
                  ? '1px solid #fde68a'
                  : '1px solid #bbf7d0',
            color:
              systemNotifications[0].type === 'ALERT'
                ? '#991b1b'
                : systemNotifications[0].type === 'WARNING'
                  ? '#92400e'
                  : '#166534',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }}>
              {systemNotifications[0].type === 'ALERT' ? 'ALERT' : systemNotifications[0].type === 'WARNING' ? 'NOTICE' : 'UPDATE'}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>{systemNotifications[0].title}:</strong> {systemNotifications[0].message}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => setShowNotifDrawer(true)}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, fontSize: '12px', color: 'inherit' }}
            >
              View All ({systemNotifications.length}) →
            </button>
            <button
              onClick={handleDismissSystemNotif}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '13px', padding: '0 4px', display: 'flex', alignItems: 'center' }}
              title="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Unverified Email Alert Banner */}
      {currentUser && currentUser.emailVerified === false && !emailBannerDismissed && (
        <div
          className="mobile-slim-notice"
          style={{
            background: '#fffbeb',
            borderBottom: '1px solid #fde047',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Mail size={14} style={{ flexShrink: 0, color: '#854d0e' }} />
            <span style={{ color: '#854d0e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong>Email unverified:</strong> Confirm <strong>{currentUser.email}</strong> for review alerts
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => setShowEmailVerifyModal(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px', height: '28px', whiteSpace: 'nowrap' }}
            >
              Verify Code →
            </button>
            <button
              onClick={handleDismissEmailBanner}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#854d0e', fontSize: '13px', padding: '0 4px', display: 'flex', alignItems: 'center' }}
              title="Dismiss for now"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Festive Countdown Bar (Top of Screen) */}
      {!loading && !isPaidActive && (
        <div
          className={`dashboard-paywall-banner ${activeTab === 'overview' ? 'hide-mobile' : ''}`}
          style={{
            background: 'var(--surface-container)',
            borderBottom: '1px solid var(--border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--primary)', color: '#ffffff', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
              Diwali Offer
            </span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>
              Testing Pass: <strong>₹79</strong> · Growth: <strong>₹149/mo</strong> · Pro: <strong>₹249/mo</strong>
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace', background: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} />
              <span>{offerTimeLeft.hours}h : {offerTimeLeft.minutes}m : {offerTimeLeft.seconds}s</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handlePayTrial}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                background: '#ea580c',
                borderColor: '#c2410c',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={13} />
              <span>Claim ₹79 Pass →</span>
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', padding: '6px 10px', whiteSpace: 'nowrap' }}
            >
              All Plans (2 Mos Free) →
            </button>
          </div>
        </div>
      )}

        {/* Main Content Body Area */}
        <main className="dashboard-content-body">

        {/* ======================================================== */}
        {/* TAB 1: STORE OVERVIEW                                    */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            {/* 1. Store Status & Greeting Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {business?.name || 'Your Business'}
                  </h2>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    ● Stand Active
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  {business?.city || 'Local Area'} · Counter Review Stand
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRefreshMapsRankings}
                  disabled={isRefreshingMaps}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <RefreshIcon size={13} />
                  <span>{isRefreshingMaps ? 'Syncing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* 2. Connect Google Maps (Only shown when not connected) */}
            {(!business?.googleReviewUrl || business?.googleReviewUrl === 'https://maps.google.com') && !quickMapsSuccess && !mapsSetupDismissed && (
              <div
                style={{
                  background: '#fffaf8',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#ea580c" />
                    <strong style={{ fontSize: '14px', color: '#9a3412' }}>Connect Google Maps Review Link</strong>
                  </div>
                  <button onClick={handleDismissMapsSetup} style={{ background: 'none', border: 'none', color: '#9a3412', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                    Dismiss
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#7c2d12', margin: '0 0 10px' }}>
                  Paste your Google Maps share link so reviews publish directly to your store profile:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Paste link: https://maps.app.goo.gl/..."
                    value={quickMapsUrl}
                    onChange={(e) => setQuickMapsUrl(e.target.value)}
                    style={{ flex: 1, minWidth: '180px', fontSize: '13px', padding: '8px 12px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={quickSavingMaps || !quickMapsUrl.trim()}
                    onClick={handleQuickConnectMaps}
                    style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                  >
                    {quickSavingMaps ? 'Saving...' : 'Connect Link →'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. Essential 3 KPIs (Clean, Compact, Easy to read on mobile) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Reviews
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {reviews.length}
                </div>
                <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span>{analytics?.avgRating ? `${analytics.avgRating} ★` : '5.0 ★'} Avg Rating</span>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Counter Scans
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {analytics?.scans ?? 0}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Total stand visits
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Google Maps Clicks
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#9a4018', marginTop: '4px' }}>
                  {analytics?.googleClicks ?? 0}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Direct review completions
                </div>
              </div>
            </div>

            {/* 4. THE CORE ASSET: Your Active QR Review Stand Card */}
            {qrs[0] && (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '18px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9a4018', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active Counter Review Stand
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '2px 0 0', color: '#0f172a' }}>
                      {qrs[0].name || 'Main Billing Counter Stand'}
                    </h3>
                  </div>
                  <span style={{ fontSize: '11.5px', background: 'var(--surface-container)', color: '#64748b', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    Code: <strong>{qrs[0].slug}</strong>
                  </span>
                </div>

                {/* Stand Visual & Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* Stand QR Image Display */}
                  <div
                    style={{
                      padding: '12px',
                      background: '#ffffff',
                      border: `2px solid ${qrs[0].colorDark || '#9a4018'}`,
                      borderRadius: '14px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={`/api/qrs/${qrs[0].slug}/image?format=svg&color=${encodeURIComponent(qrs[0].colorDark || '#9a4018')}`}
                      alt="Counter QR Code"
                      style={{ width: '140px', height: '140px', display: 'block', borderRadius: '6px' }}
                    />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: qrs[0].colorDark || '#9a4018', marginTop: '6px' }}>
                      ★ SCAN TO REVIEW ★
                    </div>
                  </div>

                  {/* Stand Quick Buttons */}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      Place this stand on your billing counter or dining table. Customers tap NFC or scan with any smartphone camera.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                      <a
                        href={`/r/${qrs[0].slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        <Sparkles size={14} color="#ffffff" />
                        <span>Test Stand ↗</span>
                      </a>

                      <a
                        href={`/api/qrs/${qrs[0].slug}/image?format=png&color=${encodeURIComponent(qrs[0].colorDark || '#9a4018')}`}
                        download={`kindlyrate-qr-${qrs[0].slug}.png`}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handlePrintStand(qrs[0])}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        <Printer size={14} />
                        <span>Print</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openQRDesignStudio(qrs[0])}
                        className="btn btn-outline"
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        <Palette size={14} color="var(--primary)" />
                        <span>Color/Style</span>
                      </button>
                    </div>

                    {/* Copy Direct Review Link */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <input
                        type="text"
                        readOnly
                        value={`https://kindlyrate.com/r/${qrs[0].slug}`}
                        style={{
                          flex: 1,
                          background: 'var(--surface-container)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '7px 10px',
                          fontSize: '12px',
                          color: '#64748b',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://kindlyrate.com/r/${qrs[0].slug}`);
                          setCopiedSlug(qrs[0].slug);
                          setTimeout(() => setCopiedSlug(null), 2000);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        {copiedSlug === qrs[0].slug ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Recent Customer Reviews */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Recent Customer Reviews
                </h3>
                {reviews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    style={{ background: 'none', border: 'none', color: '#9a4018', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    View All ({reviews.length}) →
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 16px', background: 'var(--surface-container)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <Star size={26} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Ready for your first customer review
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '380px', margin: '0 auto 12px' }}>
                    Place your stand on the counter. When customers scan and leave reviews, they will appear here in real time.
                  </p>
                  {qrs[0] && (
                    <a
                      href={`/r/${qrs[0].slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px' }}
                    >
                      Test Review Flow ↗
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reviews.slice(0, 5).map((rev: any, idx: number) => (
                    <div
                      key={rev.id || idx}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--surface-container)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} fill={s <= (rev.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                            {rev.customerName || 'Verified Customer'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                          {rev.comment || rev.generatedReview || 'Great experience and friendly service!'}
                        </p>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QR STANDS & GENERATOR (CLEAN & INSTANT)          */}
        {/* ======================================================== */}
        {activeTab === 'qrs' && (
          <div>
            {!isPaidActive && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1.5px solid #fde047',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#854d0e' }}>
                    <strong>QR Stands in Sandbox Preview:</strong> Scans will function, but live Google review drafting requires an active subscription.
                  </div>
                </div>
                <button
                  onClick={handlePayTrial}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '12.5px', padding: '6px 14px', background: '#d97706', borderColor: '#b45309' }}
                >
                  Activate for ₹79 →
                </button>
              </div>
            )}

            {/* Top Bar with Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="serif" style={{ fontSize: '24px', fontWeight: 700 }}>
                    QR Stands &amp; Instant Generator
                  </h3>
                  <span className="stat-pill stat-pill-success" style={{ fontSize: '11px' }}>
                    ● {qrs.length} Active Stands
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Generate table, counter, or takeaway QR codes and download high-resolution PNG or vector SVG files in one click.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowQRModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>+ Generate New QR Stand</span>
                </button>
              </div>
            </div>

            {/* Overall QR Performance & Traffic Telemetry Banner */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '24px 28px',
                marginBottom: '24px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} />
                    <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      QR Stand Performance
                    </h4>
                    <span className="badge badge-success" style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d' }}>
                      ● Live Attribution
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Individual performance tracking for every physical stand. See which table, bar counter, or billing desk generates the highest volume of 5-star Google reviews.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-pill stat-pill-primary" style={{ fontSize: '11.5px', padding: '6px 12px' }}>
                    {qrs.some((q) => (q.scanCount || 0) > 0) ? `Top Performer: ${qrs[0]?.name || 'Table 1'} (${qrs[0]?.conversionRate || 0}% conv.)` : 'Ready for Customer Scans'}
                  </span>
                </div>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Total QR Scans
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
                    {qrs.reduce((sum: number, q: any) => sum + (q.scanCount || 0), 0)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    Across {qrs.length} physical stands
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Reviews Generated
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    {qrs.reduce((sum: number, q: any) => sum + (q.reviewsGenerated || 0), 0)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Authentic review drafts completed
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Overall Conversion Rate
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                    {(() => { const totalScans = qrs.reduce((sum: number, q: any) => sum + (q.scanCount || 0), 0); const totalReviews = qrs.reduce((sum: number, q: any) => sum + (q.reviewsGenerated || 0), 0); return totalScans > 0 ? Math.round((totalReviews / totalScans) * 100) : 0; })()}%
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    Industry High (Avg is 18%)
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Google Maps Clicks
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                    {qrs.reduce((sum: number, q: any) => sum + (q.googleClicks || 0), 0)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Direct 1-tap Google Maps submissions
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Generator Box */}
            <div className="card dashboard-card-responsive" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Zap size={18} />
                <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  Quick Stand Generator
                </h4>
              </div>
              <form onSubmit={handleCreateQR} className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto', gap: '14px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Stand Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Table 1, Counter, Bar"
                    value={newQRName}
                    onChange={(e) => setNewQRName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Area / Section</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Counter 1, Billing Desk, Table 1"
                    value={newQRLocation}
                    onChange={(e) => setNewQRLocation(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Google Maps Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder={business?.googleReviewUrl || 'Inherits business default'}
                    value={newQRGoogleReviewUrl}
                    onChange={(e) => setNewQRGoogleReviewUrl(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', whiteSpace: 'nowrap', height: '46px' }}>
                  Generate &amp; Add Stand
                </button>
              </form>
            </div>

            {/* Stands Grid */}
            {qrs.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ marginBottom: '12px' }}><QrCode size={40} color="var(--primary)" /></div>
                <h4 style={{ margin: '0 0 6px', fontSize: '18px' }}>No QR Stands Generated Yet</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Create your first counter stand or table QR to start collecting 5-star Google reviews.
                </p>
                <button className="btn btn-primary" onClick={() => setShowQRModal(true)}>
                  + Generate First Stand
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {qrs.map((qr: any) => {
                  const standColor = qr.colorDark || '#9a4018';
                  const standBg = qr.colorLight || '#ffffff';
                  const standDesign = qr.designStyle || 'classic';
                  const targetCustomerUrl = `${window.location.origin}/r/${qr.slug}`;
                  const pngDownloadUrl = `/api/qrs/${qr.slug}/image?format=png&color=${encodeURIComponent(standColor)}&bgColor=${encodeURIComponent(standBg)}`;
                  const svgDownloadUrl = `/api/qrs/${qr.slug}/image?format=svg&color=${encodeURIComponent(standColor)}&bgColor=${encodeURIComponent(standBg)}`;

                  return (
                    <div
                      key={qr.id}
                      className="card"
                      style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-light)',
                        borderRadius: '14px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div>
                        {/* Stand Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                              {qr.name}
                            </h4>
                            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                              <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {qr.locationTag || 'Front Counter'}
                            </span>
                          </div>
                          <span className="stat-pill stat-pill-success" style={{ fontSize: '11px' }}>
                            ● Active
                          </span>
                        </div>

                        {/* QR Image Visual Display */}
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                          }}
                        >
                          <img
                            src={svgDownloadUrl}
                            alt={`QR for ${qr.name}`}
                            style={{ width: '160px', height: '160px', objectFit: 'contain' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: standColor, display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {qr.colorDark ? `Color: ${standColor}` : 'Brand Terracotta'} • {standDesign.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                            Direct Scan: /r/{qr.slug}
                          </div>
                        </div>

                        {/* Customize Design & Color Studio Button */}
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleOpenQRDesignStudio(qr)}
                          style={{
                            width: '100%',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            padding: '8px 12px',
                            borderColor: standColor,
                            color: standColor,
                            background: 'rgba(0,0,0,0.01)',
                          }}
                        >
                          <Palette size={14} color={standColor} />
                          <span>Customize Stand Design &amp; Color</span>
                        </button>

                        {/* Customer Link Box */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--surface-container)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {targetCustomerUrl}
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            onClick={() => {
                              navigator.clipboard.writeText(targetCustomerUrl);
                              showNotification(`Copied link for ${qr.name} to clipboard!`);
                            }}
                          >
                            Copy
                          </button>
                        </div>

                        {/* Active Google Review Destination for this Stand */}
                        <div style={{ background: qr.googleReviewUrl ? '#f0fdf4' : '#f8fafc', border: qr.googleReviewUrl ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: qr.googleReviewUrl ? '#166534' : '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <GoogleLogo size={13} />
                              <span>Google Destination</span>
                            </span>
                            <span className={`badge ${qr.googleReviewUrl ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                              {qr.googleReviewUrl ? 'Stand Custom Link' : 'Business Default'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <a
                              href={qr.googleReviewUrl || business?.googleReviewUrl || 'https://maps.google.com'}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: qr.googleReviewUrl ? '#15803d' : '#64748b', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: '11px' }}
                              title="Click to verify where customers are redirected"
                            >
                              {qr.googleReviewUrl || business?.googleReviewUrl || 'Default Business Link'}
                            </a>
                            <a
                              href={qr.googleReviewUrl || business?.googleReviewUrl || 'https://maps.google.com'}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '2px 8px', fontSize: '10px', whiteSpace: 'nowrap' }}
                            >
                              Test Link ↗
                            </a>
                          </div>
                        </div>

                        {/* Per-QR Performance & Usage Telemetry */}
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            marginBottom: '16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BarChart3 size={13} />
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Stand Analytics
                              </span>
                            </div>
                            <span
                              className={`stat-pill ${(qr.scanCount && qr.scanCount > 0) ? ((qr.conversionRate || 0) >= 55 ? 'stat-pill-success' : 'stat-pill-primary') : 'stat-pill-primary'}`}
                              style={{ fontSize: '10.5px', padding: '2px 8px', fontWeight: 600 }}
                            >
                              {(qr.scanCount && qr.scanCount > 0)
                                ? ((qr.conversionRate || 0) >= 60 ? 'Top Converting' : 'Steady Traffic')
                                : 'New Stand · Ready'}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 4px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                                {qr.scanCount || 0}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Scans</div>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 4px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                                {qr.reviewsGenerated || 0}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Reviews</div>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 4px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                                {(qr.scanCount && qr.scanCount > 0) ? `${qr.conversionRate || 0}%` : '0%'}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Conv.</div>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 4px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                                {qr.googleClicks || 0}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Google ↗</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                            <span>Rating Avg: <strong style={{ color: '#0f172a' }}>{qr.avgRating && qr.avgRating > 0 ? `${qr.avgRating} ★` : '—'}</strong></span>
                            <span>Last Scan: <strong style={{ color: '#0f172a' }}>{qr.lastScan && qr.lastScan !== '4m ago' ? qr.lastScan : ((qr.scanCount || 0) > 0 ? 'Recently' : 'No scans yet')}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Download & Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <a
                            href={pngDownloadUrl}
                            download={`${qr.name.replace(/\s+/g, '_')}_QR.png`}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '8px 10px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            Download PNG
                          </a>
                          <a
                            href={svgDownloadUrl}
                            download={`${qr.name.replace(/\s+/g, '_')}_QR.svg`}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '8px 10px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            Download SVG
                          </a>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '12px', padding: '6px 10px' }}
                            onClick={() => {
                              window.open(targetCustomerUrl, '_blank');
                            }}
                          >
                            Test Scan
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px' }}
                            onClick={() => window.print()}
                          >
                            Print Stand
                          </button>
                        </div>

                        {/* Stand Management Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={() => setEditingQR({ ...qr })}
                          >
                            <Edit2 size={13} />
                            <span>Edit Stand</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '12px', padding: '6px 10px', color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={() => handleDeleteQR(qr.id, qr.name)}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REVIEW ENGINE, AI TONE & REPUTATION SHIELD        */}
        {/* ======================================================== */}
        {activeTab === 'ai_settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Header & Fast Save Bar */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SettingsIcon size={20} color="#15803d" />
                  </div>
                  <div>
                    <h3 className="serif" style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                      Review Settings &amp; Feedback Protection
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      Customize customer rating questions, private feedback thresholds, and writing style.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  style={{
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 56, 59, 0.2)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={15} /> {savingSettings ? 'Saving...' : 'Save Settings'}
                  </span>
                </button>
              </div>
            </div>

            {settings && (
              <>
                {/* 1. CUSTOMER MOBILE RATING CRITERIA (QUESTIONS) - CORE RATING INPUT */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '26px 28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SlidersHorizontal size={20} color="var(--primary)" />
                        <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                          1. Customer Mobile Rating Criteria (Questions)
                        </h4>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                        Primary questions rated by customers on their mobile screen when scanning your counter QR stands.
                      </p>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '13px', padding: '8px 16px', fontWeight: 600 }}
                      onClick={() => {
                        const newKey = `q_${Date.now()}`;
                        setQuestions([
                          ...questions,
                          {
                            questionKey: newKey,
                            label: 'Overall Experience',
                            scaleType: '1-5_STARS',
                            displayOrder: questions.length,
                            isRequired: true,
                            isActive: true,
                          },
                        ]);
                      }}
                    >
                      + Add Custom Question
                    </button>
                  </div>

                  {/* Industry Presets */}
                  <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Click to quickly add industry-tailored criteria:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(() => {
                        const cat = (business?.mainCategory || '').toUpperCase();
                        const sub = (business?.subcategory || '').toLowerCase();
                        const bName = (business?.name || '').toLowerCase();

                        const isRetail =
                          cat === 'RETAIL' ||
                          /pc|computer|electronics|laptop|tech|mobile|gadget|hardware|store|shop/i.test(sub) ||
                          /pc|computer|electronics|laptop|tech|mobile|gadget|hardware/i.test(bName);

                        const isServices =
                          cat === 'SERVICES' ||
                          /auto|car|repair|garage|mechanic|service|plumb|clean/i.test(sub);

                        const isHealth =
                          cat === 'HEALTH & WELLNESS' ||
                          /salon|spa|dental|clinic|hospital|beauty|hair|skin/i.test(sub);

                        const presets = isRetail
                          ? [
                              { label: 'Product Authenticity & Genuine Parts', key: 'product_authenticity' },
                              { label: 'Staff Technical Knowledge & Advice', key: 'tech_advice' },
                              { label: 'Competitive Pricing & Value for Money', key: 'pricing_value' },
                              { label: 'Store Ambience & Product Selection', key: 'store_selection' },
                              { label: 'Warranty & After-Sales Support', key: 'warranty_support' },
                            ]
                          : isServices
                          ? [
                              { label: 'Diagnostic & Repair Quality', key: 'diagnostic_quality' },
                              { label: 'Turnaround Speed & Punctuality', key: 'turnaround_speed' },
                              { label: 'Transparent Pricing & Fair Estimates', key: 'transparent_pricing' },
                              { label: 'Technician Professionalism', key: 'technician_prof' },
                            ]
                          : isHealth
                          ? [
                              { label: 'Treatment Quality & Care', key: 'treatment_quality' },
                              { label: 'Staff Hospitality & Compassion', key: 'staff_care' },
                              { label: 'Hygiene & Clinic Cleanliness', key: 'hygiene_cleanliness' },
                              { label: 'Appointment Punctuality', key: 'appointment_time' },
                            ]
                          : [
                              { label: 'Food Taste & Culinary Quality', key: 'food_taste' },
                              { label: 'Speed of Service', key: 'service_speed' },
                              { label: 'Staff Hospitality & Attentiveness', key: 'staff_hospitality' },
                              { label: 'Ambiance & Cleanliness', key: 'ambiance_cleanliness' },
                            ];

                        return presets.map((preset) => {
                          const isAlreadyAdded = questions.some((q) => (q.label || q.text || '') === preset.label);
                          return (
                            <button
                              key={preset.key}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  setQuestions([
                                    ...questions,
                                    {
                                      questionKey: `q_${preset.key}_${Date.now()}`,
                                      label: preset.label,
                                      scaleType: '1-5_STARS',
                                      displayOrder: questions.length,
                                      isRequired: true,
                                      isActive: true,
                                    },
                                  ]);
                                  showNotification(`Added question: ${preset.label}`);
                                }
                              }}
                              style={{
                                background: isAlreadyAdded ? '#dcfce7' : '#ffffff',
                                border: isAlreadyAdded ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                                color: isAlreadyAdded ? '#15803d' : '#1e293b',
                                fontWeight: isAlreadyAdded ? 700 : 500,
                                padding: '5px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              {isAlreadyAdded ? '✓ ' : '+ '}
                              {preset.label}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Questions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {questions.map((q, idx) => (
                      <div
                        key={q.questionKey || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#475569', width: '24px' }}>
                          {idx + 1}.
                        </span>
                        <input
                          className="form-input"
                          value={q.label || q.text || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].label = e.target.value;
                            setQuestions(updated);
                          }}
                          style={{ flex: 1, padding: '9px 12px', fontSize: '13.5px' }}
                        />
                        <select
                          className="form-select"
                          style={{ width: '160px', padding: '9px 12px', fontSize: '13px' }}
                          value={q.scaleType}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].scaleType = e.target.value;
                            setQuestions(updated);
                          }}
                        >
                          <option value="1-5_STARS">1–5 Stars</option>
                          <option value="1-10_NUMERIC">1–10 Numeric</option>
                          <option value="THUMBS_UP_DOWN">Thumbs Up / Down</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                          title="Remove question"
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#991b1b',
                            cursor: 'pointer',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-lg" onClick={handleSaveQuestions} style={{ fontWeight: 700 }}>
                      Save Questions &amp; Rating Criteria
                    </button>
                  </div>
                </div>

                {/* 2. REPUTATION DEFENSE SHIELD (HIGH IMPACT FILTER) */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '26px 28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldIcon size={20} color="var(--primary)" />
                        <h4 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                          2. Negative Feedback Filter (Private Resolution)
                        </h4>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Ratings below this threshold are routed to your private inbox so you can resolve customer concerns directly.
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: shieldStrictness === 'strict' ? '#dbeafe' : '#dcfce7',
                        color: shieldStrictness === 'strict' ? '#1e40af' : '#15803d',
                        border: `1px solid ${shieldStrictness === 'strict' ? '#93c5fd' : '#86efac'}`,
                      }}
                    >
                      ● {shieldStrictness === 'strict' ? 'Maximum Defense Active (1–3★ Intercepted)' : 'Standard Shield Active (1–2★ Intercepted)'}
                    </span>
                  </div>

                  {/* Shield Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {/* Standard Shield */}
                    <div
                      onClick={() => {
                        setShieldStrictness('standard');
                        showNotification('Standard Shield Selected: 1-2 Star ratings intercepted privately; 3-5 Star proceed to Google.');
                      }}
                      style={{
                        padding: '20px',
                        borderRadius: '14px',
                        border: shieldStrictness === 'standard' ? '2.5px solid #10b981' : '1.5px solid #cbd5e1',
                        background: shieldStrictness === 'standard' ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: shieldStrictness === 'standard' ? '0 4px 14px rgba(16, 185, 129, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '15px', color: '#0f172a' }}>Standard Shield (1–2★ Intercepted)</strong>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: shieldStrictness === 'standard' ? '#d1fae5' : '#e2e8f0',
                              color: shieldStrictness === 'standard' ? '#065f46' : '#64748b',
                            }}
                          >
                            {shieldStrictness === 'standard' ? '✓ ACTIVE' : 'Click to Select'}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 12px', lineHeight: 1.5 }}>
                          Dissatisfied customers (1★ &amp; 2★) are caught internally. Satisfied and neutral customers (3★, 4★, 5★) proceed to Google Maps review drafting.
                        </p>
                      </div>

                      <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                        ⭐ Best for: High-volume retail, quick checkout, and rapid review velocity.
                      </div>
                    </div>

                    {/* Maximum Defense */}
                    <div
                      onClick={() => {
                        setShieldStrictness('strict');
                        showNotification('Maximum Defense Selected: 100% of 1-3 Star ratings intercepted; only 4-5 Stars proceed to Google.');
                      }}
                      style={{
                        padding: '20px',
                        borderRadius: '14px',
                        border: shieldStrictness === 'strict' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: shieldStrictness === 'strict' ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: shieldStrictness === 'strict' ? '0 4px 14px rgba(37, 99, 235, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '15px', color: '#0f172a' }}>Maximum Defense (1–3★ Intercepted)</strong>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: shieldStrictness === 'strict' ? '#bfdbfe' : '#e2e8f0',
                              color: shieldStrictness === 'strict' ? '#1e3a8a' : '#64748b',
                            }}
                          >
                            {shieldStrictness === 'strict' ? '✓ ACTIVE' : 'Click to Select'}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 12px', lineHeight: 1.5 }}>
                          Strict 5-star filter: Guarantees that ONLY genuine 4★ and 5★ reviews reach Google Maps. 100% of 1★, 2★, and 3★ feedback is kept strictly private.
                        </p>
                      </div>

                      <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, background: 'rgba(37, 99, 235, 0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Shield size={13} /> Best for: Specialty electronics, clinics, salons, and businesses guarding a 4.9★ rating.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. AI REVIEW VOICE & PERSONA (SIMPLIFIED) */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px 26px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SparklesIcon size={18} color="var(--primary)" />
                      <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                        3. Review Writing Voice &amp; Tone
                      </h4>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      Choose the writing style used when suggesting review drafts to customers on their phones.
                    </p>
                  </div>

                  {/* Compact Tone Selector */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                    {[
                      { id: 'enthusiastic', label: 'Enthusiastic', icon: Zap, desc: 'Energetic & high praise' },
                      { id: 'warm', label: 'Warm & Friendly', icon: Heart, desc: 'Welcoming & personal' },
                      { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Polished & articulate' },
                      { id: 'casual', label: 'Casual & Relaxed', icon: Coffee, desc: 'Everyday & authentic' },
                      { id: 'concise', label: 'Concise & Punchy', icon: Target, desc: 'Short 1–2 sentences' },
                    ].map((t) => {
                      const IconComp = t.icon;
                      const isSelected = settings.reviewTone === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, reviewTone: t.id })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--primary)' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#fef2ee' : '#f8fafc',
                            color: isSelected ? 'var(--primary)' : '#1e293b',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <IconComp size={15} color={isSelected ? 'var(--primary)' : '#64748b'} />
                          <span style={{ fontWeight: 600 }}>{t.label}</span>
                          <span style={{ fontSize: '11px', color: isSelected ? 'var(--primary)' : '#64748b', opacity: 0.85 }}>
                            · {t.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact Settings Row: Length + Instant Google Maps Forwarding */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '20px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        Review Length:
                      </label>
                      <select
                        className="form-select"
                        value={settings.reviewLength || 'medium'}
                        onChange={(e) => setSettings({ ...settings, reviewLength: e.target.value })}
                        style={{ fontSize: '13px', padding: '7px 12px', borderRadius: '8px', minWidth: '220px' }}
                      >
                        <option value="short">Short (1–2 sentences · Fast)</option>
                        <option value="medium">Balanced (3–4 sentences · Recommended for SEO)</option>
                        <option value="detailed">Detailed (In-depth story)</option>
                      </select>
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      <input
                        type="checkbox"
                        id="autoForwardCheck"
                        checked={settings.autoRedirectGoogle || false}
                        onChange={(e) => setSettings({ ...settings, autoRedirectGoogle: e.target.checked })}
                        style={{ width: '17px', height: '17px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span>Automatically open Google Maps upon review copy</span>
                    </label>
                  </div>
                </div>

                {/* 4. KEYWORDS & OFFERINGS TO HIGHLIGHT (SEO ENGINE) */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '26px 28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={20} color="var(--success)" />
                        <h4 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                          4. Specialties &amp; Keywords to Highlight
                        </h4>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Highlight specialties or popular items. When customer reviews mention these terms, your Google Maps local visibility improves naturally.
                      </p>
                    </div>

                    <span className="badge badge-success" style={{ fontSize: '11px' }}>
                      Active Keywords
                    </span>
                  </div>

                  {/* Active Highlight Tags */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      Active Highlight Keywords ({((settings.thingsToHighlight || settings.targetKeywords) || []).length}):
                    </div>
                    {((settings.thingsToHighlight || settings.targetKeywords) || []).length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                        No target keywords configured yet. Click suggestions below or type custom offerings.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {((settings.thingsToHighlight || settings.targetKeywords) || []).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              background: '#f0fdf4',
                              border: '1.5px solid #86efac',
                              color: '#15803d',
                              fontWeight: 600,
                              fontSize: '13px',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            <span>✓ {tag}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (settings.thingsToHighlight || settings.targetKeywords) || [];
                                const updated = current.filter((_: any, i: number) => i !== idx);
                                setSettings({ ...settings, thingsToHighlight: updated, targetKeywords: updated });
                              }}
                              title="Remove keyword"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#15803d',
                                cursor: 'pointer',
                                padding: '0 2px',
                                fontWeight: 800,
                                fontSize: '14px',
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category-Adaptive Quick Select Suggestion Pills */}
                  <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Click to quickly add industry-tailored keywords:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(() => {
                        const cat = (business?.mainCategory || '').toUpperCase();
                        const sub = (business?.subcategory || '').toLowerCase();
                        const bName = (business?.name || '').toLowerCase();

                        const isRetail =
                          cat === 'RETAIL' ||
                          /pc|computer|electronics|laptop|tech|mobile|gadget|hardware|store|shop/i.test(sub) ||
                          /pc|computer|electronics|laptop|tech|mobile|gadget|hardware/i.test(bName);

                        const isServices =
                          cat === 'SERVICES' ||
                          /auto|car|repair|garage|mechanic|service|plumb|clean/i.test(sub);

                        const isHealth =
                          cat === 'HEALTH & WELLNESS' ||
                          /salon|spa|dental|clinic|hospital|beauty|hair|skin/i.test(sub);

                        const items = isRetail
                          ? [
                              '16GB RAM',
                              'SSD Upgrade',
                              'Custom Gaming PC',
                              'Genuine Warranty',
                              'Quick Diagnostics',
                              'Fair Pricing',
                              'Clean Setup',
                              'Official Parts',
                              'Helpful Support',
                              'Fast Turnaround',
                            ]
                          : isServices
                          ? [
                              'Expert Diagnostics',
                              'Fast Turnaround',
                              'Genuine Spare Parts',
                              'Transparent Quotations',
                              'Clean Workshop',
                              'Honest Technicians',
                              'Reliable Quality',
                            ]
                          : isHealth
                          ? [
                              'Painless Treatment',
                              'Courteous Doctor',
                              'Immaculate Hygiene',
                              'Attentive Staff',
                              'Modern Equipment',
                              'Personalized Care',
                            ]
                          : [
                              'Signature Taste',
                              'Craft Beverages',
                              'Prompt Service',
                              'Warm Hospitality',
                              'Generous Portions',
                              'Cozy Ambience',
                              'Fresh Ingredients',
                            ];

                        const currentActive = (settings.thingsToHighlight || settings.targetKeywords) || [];

                        return items.map((item) => {
                          const isAdded = currentActive.includes(item);

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (!isAdded) {
                                  const updated = [...currentActive, item];
                                  setSettings({
                                    ...settings,
                                    thingsToHighlight: updated,
                                    targetKeywords: updated,
                                  });
                                }
                              }}
                              style={{
                                background: isAdded ? '#dcfce7' : '#ffffff',
                                border: isAdded ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                                color: isAdded ? '#15803d' : '#1e293b',
                                fontWeight: isAdded ? 700 : 500,
                                padding: '5px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {isAdded ? '✓ ' : '+ '}
                              {item}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Add Custom Keyword Input */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '680px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type custom keyword (e.g. 16GB RAM, SSD Upgrade, Doctor Care, Fair Pricing)..."
                      value={newHighlightTag}
                      onChange={(e) => setNewHighlightTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newHighlightTag.trim()) {
                          e.preventDefault();
                          const current = (settings.thingsToHighlight || settings.targetKeywords) || [];
                          const updated = [...current, newHighlightTag.trim()];
                          setSettings({ ...settings, thingsToHighlight: updated, targetKeywords: updated });
                          setNewHighlightTag('');
                        }
                      }}
                      style={{ flex: 1, padding: '10px 14px', fontSize: '13.5px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13.5px', fontWeight: 600, whiteSpace: 'nowrap' }}
                      onClick={() => {
                        if (newHighlightTag.trim()) {
                          const current = (settings.thingsToHighlight || settings.targetKeywords) || [];
                          const updated = [...current, newHighlightTag.trim()];
                          setSettings({ ...settings, thingsToHighlight: updated, targetKeywords: updated });
                          setNewHighlightTag('');
                        }
                      }}
                    >
                      + Add Keyword
                    </button>
                  </div>
                </div>

                {/* 5. CUSTOMER SCRATCH CARD REWARDS (OPTIONAL) */}
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '26px 28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GiftIcon size={20} color="var(--primary)" />
                        <h4 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                          5. Customer Thank-You Rewards (Optional Scratch Card)
                        </h4>
                        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>Optional</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Reward guests with a digital scratch card or discount voucher immediately after submitting their review.
                      </p>
                    </div>

                    {/* Enable Toggle Switch */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: settings.scratchCardEnabled ? '#15803d' : '#64748b' }}>
                        {settings.scratchCardEnabled ? '✓ Rewards Enabled' : 'Rewards Disabled'}
                      </span>
                      <div
                        onClick={() => setSettings({ ...settings, scratchCardEnabled: !settings.scratchCardEnabled })}
                        style={{
                          width: '52px',
                          height: '28px',
                          borderRadius: '14px',
                          background: settings.scratchCardEnabled ? '#15803d' : '#cbd5e1',
                          padding: '3px',
                          transition: 'background 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            transform: settings.scratchCardEnabled ? 'translateX(24px)' : 'translateX(0)',
                            transition: 'transform 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                    </label>
                  </div>

                  {settings.scratchCardEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                      {/* Theme Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                          Scratch Card Visual Theme
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                          {[
                            { id: 'golden_ticket', name: 'Golden Ticket', desc: 'Luxury gold foil', bg: '#f59e0b' },
                            { id: 'neon_glow', name: 'Neon Glow', desc: 'Cyber purple glow', bg: '#8b5cf6' },
                            { id: 'festive_confetti', name: 'Festive Fiesta', desc: 'Emerald celebration', bg: '#10b981' },
                            { id: 'minimal_classic', name: 'Minimal Classic', desc: 'Sleek dark slate', bg: '#475569' },
                          ].map((theme) => {
                            const isThemeSelected = (settings.scratchCardType || 'golden_ticket') === theme.id;
                            return (
                              <div
                                key={theme.id}
                                onClick={() => setSettings({ ...settings, scratchCardType: theme.id })}
                                style={{
                                  padding: '12px',
                                  borderRadius: '10px',
                                  border: isThemeSelected ? `2.5px solid ${theme.bg}` : '1.5px solid #cbd5e1',
                                  background: isThemeSelected ? '#f8fafc' : '#ffffff',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  boxShadow: isThemeSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                }}
                              >
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: theme.bg, margin: '0 auto 6px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{theme.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{theme.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Win Probability */}
                      <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>Customer Win Probability</strong>
                            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                              Percentage of customers who win the discount vs receive a thank-you note.
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 800,
                              color: '#15803d',
                              background: '#dcfce7',
                              padding: '4px 14px',
                              borderRadius: '8px',
                              border: '1px solid #86efac',
                            }}
                          >
                            {settings.scratchCardWinProbability ?? 100}% Win Chance
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={settings.scratchCardWinProbability ?? 100}
                          onChange={(e) => setSettings({ ...settings, scratchCardWinProbability: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: '#15803d', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Title & Coupon Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                            Reward Title
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 10% Off Your Next Purchase"
                            value={settings.scratchCardRewardTitle || ''}
                            onChange={(e) => setSettings({ ...settings, scratchCardRewardTitle: e.target.value })}
                            style={{ padding: '9px 12px', fontSize: '13.5px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                            Coupon / Voucher Code
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. SAVE10, THANKYOU"
                            value={settings.scratchCardCouponCode || ''}
                            onChange={(e) => setSettings({ ...settings, scratchCardCouponCode: e.target.value })}
                            style={{ padding: '9px 12px', fontSize: '13.5px' }}
                          />
                        </div>
                      </div>

                      {/* Live Scratch Preview */}
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase' }}>
                          Live Scratch Card Preview (Try scratching):
                        </div>
                        <ScratchCard
                          cardType={settings.scratchCardType || 'golden_ticket'}
                          rewardTitle={settings.scratchCardRewardTitle || '10% Off Your Next Visit'}
                          rewardDescription={settings.scratchCardRewardDescription || 'Show this code at billing to redeem!'}
                          couponCode={settings.scratchCardCouponCode || 'SAMPLE10'}
                          businessName={business?.name || 'Your Business'}
                          customLogoUrl={settings.scratchCardCustomLogoUrl || business?.logoUrl}
                          winProbability={settings.scratchCardWinProbability ?? 100}
                          loseMessage={settings.scratchCardLoseMessage || 'Thank you for your review!'}
                          previewMode={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM STICKY SAVE BAR */}
                <div
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '20px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '16px', color: '#f8fafc', display: 'block' }}>
                      Ready to apply your Review Engine settings?
                    </strong>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Updates your live QR counter stands and Gemini review drafting persona instantly.
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    style={{
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 800,
                      background: '#38bdf8',
                      color: '#0f172a',
                      border: 'none',
                    }}
                  >
                    {savingSettings ? 'Saving All Settings...' : 'Save All Review Settings →'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: REVIEWS & SHIELD LOG                              */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                placeholder="Search reviews by dish, service, or customer keyword..."
                style={{ flex: 1, minWidth: '220px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select"
                style={{ width: '200px' }}
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
              >
                <option value="">All Sentiments</option>
                <option value="positive">Delighted (5★ Google)</option>
                <option value="neutral">Neutral (3-4★)</option>
                <option value="constructive_critical">Shielded Interceptions (1-2★)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews
                .filter(
                  (r) =>
                    (!sentimentFilter || r.sentiment === sentimentFilter) &&
                    (!searchTerm || (r.generatedText || r.comment || '').toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((r) => {
                  const isShielded = r.sentiment === 'constructive_critical';

                  return (
                    <div
                      key={r.id}
                      className="card"
                      style={{
                        padding: '18px 22px',
                        borderLeft: isShielded ? '4px solid #ef4444' : '4px solid #22c55e',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`stat-pill ${isShielded ? 'stat-pill-neutral' : 'stat-pill-success'}`}>
                            {isShielded ? 'Shield Intercepted' : 'Delighted 5★'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontSize: '12.5px', color: r.isGoogleClicked ? 'var(--success)' : 'var(--text-subtle)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {r.isGoogleClicked && <GoogleLogo size={14} />}
                          {r.isGoogleClicked ? 'Posted to Google' : isShielded ? 'Contained Internally' : 'Copied'}
                        </span>
                      </div>

                      <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)', margin: '4px 0' }}>
                        "{r.generatedText}"
                      </p>

                      {r.customerComment && (
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', background: 'var(--surface-container)', padding: '6px 12px', borderRadius: '4px', marginTop: '6px' }}>
                          Customer note: <em>"{r.customerComment}"</em>
                        </div>
                      )}

                      {/* Shield Recovery Action for Unhappy Customers */}
                      {isShielded && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>
                            Prevented from Google Maps. Guest can be recovered.
                          </span>
                          <button
                            onClick={() => {
                              showNotification('Recovery Voucher Drafted! Send WhatsApp apology message.');
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <WhatsAppLogo size={14} />
                            <span>Send Recovery Voucher</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {reviews.length === 0 && (
                <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer reviews found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: BUSINESS PROFILE                                  */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="serif" style={{ fontSize: '22px', fontWeight: 600 }}>Business Profile & Maps Setup</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Keep your establishment contact details and Google destination up to date.
              </p>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="settings-section-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Brand Identity</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Your public establishment name and primary contact.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Business Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <PhoneInput
                    label="Business Phone Number"
                    value={profileForm.phone}
                    onChange={(val) => setProfileForm({ ...profileForm, phone: val })}
                    required
                  />
                </div>
              </div>

              <div className="settings-section-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GoogleLogo size={18} />
                    <span>Google Maps &amp; Direct Review Link</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Paste your Google Maps share link to convert it into a direct 5-star review dialog link, or edit/change it anytime.
                  </div>
                </div>

                <div>
                  {/* Share Link Input & Converter */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Google Maps Share Link (From Maps App / Share Button)</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>maps.app.goo.gl/... or goo.gl/maps/...</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="url"
                        className="form-input"
                        value={profileForm.googleMapsShareUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, googleMapsShareUrl: e.target.value })}
                        placeholder="Paste share link (e.g. https://maps.app.goo.gl/xxx)"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleConvertMapsLink}
                        disabled={convertingMapsLink || (!profileForm.googleMapsShareUrl && !profileForm.googleReviewUrl)}
                        style={{ whiteSpace: 'nowrap', fontSize: '12.5px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {convertingMapsLink ? 'Converting...' : 'Convert to Review Link'}
                      </button>
                    </div>
                  </div>

                  {mapsLinkSuccessMsg && (
                    <div style={{ fontSize: '12px', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                      ✓ {mapsLinkSuccessMsg}
                    </div>
                  )}

                  {/* Direct Google Review URL (Editable) */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Direct 5-Star Review Submission URL (Editable)</span>
                      <span className="badge badge-primary" style={{ fontSize: '10.5px' }}>Opens Direct 5★ Modal</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="url"
                        className="form-input"
                        value={profileForm.googleReviewUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, googleReviewUrl: e.target.value })}
                        placeholder="https://search.google.com/local/writereview?placeid=... or https://maps.google.com/?cid=..."
                        required
                      />
                      {profileForm.googleReviewUrl && (
                        <a
                          href={profileForm.googleReviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ whiteSpace: 'nowrap', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Click to verify the Google review dialog opens"
                        >
                          <GoogleLogo size={14} />
                          <span>Test ↗</span>
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        When customers tap &quot;Post on Google Maps&quot;, this exact URL directly opens their review submission popup.
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={savingProfile}
                        onClick={handleSaveProfile}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        {savingProfile ? 'Saving...' : '✓ Save Google Destination'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels & Follow Links */}
              <div className="settings-section-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Social Follow Channels (Optional)</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Grow your online brand. When added, clean follow badges appear on customer review screens. If left blank, nothing is displayed.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Instagram */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <InstagramLogo size={16} />
                      <span>Instagram Profile or Handle</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.instagramUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                        placeholder="@yourbusiness or https://instagram.com/yourbusiness"
                      />
                      {profileForm.instagramUrl && (
                        <a
                          href={profileForm.instagramUrl.startsWith('http') ? profileForm.instagramUrl : `https://instagram.com/${profileForm.instagramUrl.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ whiteSpace: 'nowrap', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <InstagramLogo size={14} />
                          <span>Test ↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <WhatsAppLogo size={16} />
                      <span>WhatsApp Business Number or Link</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.whatsappUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, whatsappUrl: e.target.value })}
                        placeholder="+919876543210 or https://wa.me/919876543210"
                      />
                      {profileForm.whatsappUrl && (
                        <a
                          href={profileForm.whatsappUrl.startsWith('http') ? profileForm.whatsappUrl : `https://wa.me/${profileForm.whatsappUrl.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ whiteSpace: 'nowrap', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <WhatsAppLogo size={14} />
                          <span>Test ↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FacebookLogo size={16} />
                      <span>Facebook Page URL</span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.facebookUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/yourbusiness"
                      />
                      {profileForm.facebookUrl && (
                        <a
                          href={profileForm.facebookUrl.startsWith('http') ? profileForm.facebookUrl : `https://facebook.com/${profileForm.facebookUrl.replace(/^\//, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ whiteSpace: 'nowrap', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FacebookLogo size={14} />
                          <span>Test ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Location & Specialties</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Used to personalize customer review suggestions.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.pincode}
                        onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Operating Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mon–Sun: 11:30 AM – 11:30 PM"
                      value={profileForm.openingHours}
                      onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Signature Offerings & Highlights</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Woodfired Pizzas, Sunset Rooftop Seating, Specialty Cocktails"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('overview')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>

            {/* Legal & Compliance Section */}
            <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                Platform Legal & Compliance Policies
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                Review KindlyRate's terms of service, privacy & data protection commitments, and merchant policies.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLegalModal('terms')}
                  style={{ fontSize: '12.5px', padding: '7px 14px' }}
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLegalModal('privacy')}
                  style={{ fontSize: '12.5px', padding: '7px 14px' }}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLegalModal('refund')}
                  style={{ fontSize: '12.5px', padding: '7px 14px' }}
                >
                  Merchant Refund Policy
                </button>
              </div>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div
              style={{
                marginTop: '28px',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                background: 'rgba(220, 38, 38, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trash2 size={16} />
                    <span>Danger Zone · Delete Account</span>
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '560px', lineHeight: 1.5 }}>
                    Permanently delete your merchant profile, active QR stands, customer review history, and disconnect Google Maps routing. This action cannot be reversed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteError(null);
                    setShowDeleteModal(true);
                  }}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SUBSCRIPTION & BILLING                            */}
        {/* ======================================================== */}
        {activeTab === 'subscription' && (
          <div>
            {/* Sleek Festive Banner Trigger in Subscription Tab */}
            {!usage?.subscription?.trialActivated ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.12) 100%)',
                  border: '1.5px solid rgba(234, 88, 12, 0.28)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '18px 22px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #b45309, #f59e0b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                        Special Offer
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Offer expires in <strong>{offerTimeLeft.hours}h {offerTimeLeft.minutes}m {offerTimeLeft.seconds}s</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                      Spin the Festive Wheel for 84% OFF ₹79 Launch Pass
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpinModal(true)}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #b45309 0%, #ea580c 50%, #f59e0b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Spin Lucky Wheel</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1.5px solid var(--success)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-pill stat-pill-success" style={{ fontSize: '11.5px' }}>✓ Active Pass</span>
                  <strong style={{ fontSize: '15px' }}>30-Day Testing Pack Active</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    (100 reviews &amp; 2 counter stands active. Switch or upgrade below at any time.)
                  </span>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="stat-pill stat-pill-primary">Current Active Plan</span>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: (subscriptionData?.status || usage?.subscription?.status) === 'ACTIVE' ? '#dcfce7' : '#fef3eb',
                        color: (subscriptionData?.status || usage?.subscription?.status) === 'ACTIVE' ? '#166534' : '#9a4018',
                      }}
                    >
                      {subscriptionData?.status || usage?.subscription?.status || 'TRIAL'}
                    </span>
                  </div>
                  <h3 className="serif" style={{ fontSize: '24px', margin: 0 }}>
                    {subscriptionData?.plan?.name || usage?.plan?.name || 'Growth Pack'}
                  </h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    Quota: {(usage?.reviewLimit ?? 100).toLocaleString()} reviews per billing cycle
                  </div>
                  {subscriptionData?.nextBillingDate && (
                    <div style={{ fontSize: '12.5px', color: '#78716c', marginTop: '4px' }}>
                      Next Billing Date:{' '}
                      <strong>
                        {new Date(subscriptionData.nextBillingDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </div>
                  )}
                  {subscriptionData?.lastTransactionId && (
                    <div style={{ fontSize: '12px', color: '#78716c', marginTop: '3px', fontFamily: 'monospace' }}>
                      Last Txn ID: {subscriptionData.lastTransactionId}
                    </div>
                  )}
                </div>

                {/* Auto-Renewal Status & Toggle */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
                    ₹{subscriptionData?.plan?.priceInr || usage?.plan?.priceInr || 149}{' '}
                    <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleAutoRenew}
                    disabled={togglingAutoRenew}
                    className={`btn btn-sm ${subscriptionData?.autoRenew ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{subscriptionData?.autoRenew ? 'Auto-Renewal: ON' : 'Auto-Renewal: OFF'}</span>
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {subscriptionData?.autoRenew
                      ? 'Automatically renews every month with transaction ID logged'
                      : 'One-time billing. Will not renew automatically.'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 600 }}>Upgrade or Switch Subscription Pack</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Flame size={14} color="#ea580c" />
                <span>Special festive discount active across all tiers. Cancel or switch anytime.</span>
              </p>
            </div>

            {/* Recurring Autopay Preference Card */}
            <div
              style={{
                background: autoRenewChoice ? '#f0fdf4' : '#f8fafc',
                border: autoRenewChoice ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="dashboardAutoRenewPref"
                  checked={autoRenewChoice}
                  onChange={(e) => setAutoRenewChoice(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                />
                <label htmlFor="dashboardAutoRenewPref" style={{ cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                    UPI &amp; Card Autopay: {autoRenewChoice ? 'Active (Default & Recommended)' : 'Off (One-time payment)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Seamless recurring renewals via Google Pay, PhonePe, Paytm, or Cards. Cancel anytime with 1 click.
                  </div>
                </label>
              </div>
              <span className={`badge ${autoRenewChoice ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                {autoRenewChoice ? '✓ Autopay Enabled' : 'One-Time Payment'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {plans
                .filter((p) => p.slug !== 'trial')
                .map((p) => {
                  const selectedDuration = planDurations[p.id] || 12; // Default 12 Months (1 Year with 2 Months Free)

                  let activePrice = p.priceInr;
                  let originalPrice = p.originalPriceInr || Math.round(p.priceInr * 1.5);
                  let durationLabel = '1 Month';
                  let durationSub = '/month';
                  let reviewLimitDisplay = `${(p.reviewGenerationLimit ?? 100).toLocaleString()} Monthly Reviews`;
                  let discountTag: string | null = null;

                  if (selectedDuration === 3) {
                    activePrice = p.priceInr3Months || p.priceInr * 3;
                    originalPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 3;
                    durationLabel = '3 Months';
                    durationSub = `for 3 mos (₹${Math.round(activePrice / 3)}/mo)`;
                    reviewLimitDisplay = `${((p.reviewGenerationLimit ?? 100) * 3).toLocaleString()} Total Reviews (Quarterly)`;
                    discountTag = 'Quarterly Pack';
                  } else if (selectedDuration === 6) {
                    activePrice = p.priceInr6Months || p.priceInr * 6;
                    originalPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 6;
                    durationLabel = '6 Months';
                    durationSub = `for 6 mos (₹${Math.round(activePrice / 6)}/mo)`;
                    reviewLimitDisplay = `${((p.reviewGenerationLimit ?? 100) * 6).toLocaleString()} Total Reviews (Semi-Annual)`;
                    discountTag = 'Semi-Annual Pack';
                  } else if (selectedDuration === 12) {
                    // 1 Year Pack gets discount of 2 months!
                    activePrice = p.priceInr1Year || (p.priceInr * 10);
                    originalPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 12;
                    durationLabel = '1 Year';
                    durationSub = `for 1 yr (₹${Math.round(activePrice / 12)}/mo)`;
                    reviewLimitDisplay = `${((p.reviewGenerationLimit ?? 100) * 12).toLocaleString()} Total Reviews (1-Year Pass)`;
                    discountTag = '2 Months Free Applied!';
                  }

                  const isCurrentPlan = Boolean(
                    (subscriptionData?.plan?.slug === p.slug) ||
                    (!subscriptionData?.plan && usage?.plan?.slug === p.slug)
                  );

                  return (
                    <div
                      key={p.id}
                      className="card"
                      style={{
                        padding: '24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        border: isCurrentPlan
                          ? '2.5px solid #16a34a'
                          : p.slug === 'growth'
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border)',
                        background: isCurrentPlan ? '#f0fdf4' : '#ffffff',
                      }}
                    >
                      {isCurrentPlan ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-11px',
                            left: '20px',
                            background: '#16a34a',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 12px',
                            borderRadius: '12px',
                          }}
                        >
                          ● YOUR CURRENT ACTIVE PLAN
                        </div>
                      ) : p.slug === 'growth' ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-11px',
                            left: '20px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 12px',
                            borderRadius: '12px',
                          }}
                        >
                          MOST POPULAR
                        </div>
                      ) : null}

                      {/* Header with Title and Month Duration Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 100%)',
                            color: '#ffffff',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Flame size={12} color="#ffffff" />
                            <span>FESTIVE FLASH SALE</span>
                          </span>
                        </span>
                        {autoRenewChoice && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '2px 7px', borderRadius: '8px' }}>
                            ✓ Autopay Enabled
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '18px' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                            {discountTag || p.offerBadge || 'Special First Month Offer'}
                          </div>
                        </div>

                        {/* Select Months */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', marginTop: '4px' }}>
                          <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.4px' }}>
                            Select Months
                          </span>
                          <div style={{ display: 'inline-flex', flexWrap: 'wrap', background: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)', gap: '2px' }}>
                            {[
                              { m: 1 as const, lbl: '1M' },
                              { m: 3 as const, lbl: '3M' },
                              { m: 6 as const, lbl: '6M' },
                              { m: 12 as const, lbl: '1Y (2M Free)' },
                            ].map((tab) => (
                              <button
                                key={tab.m}
                                type="button"
                                onClick={() => setPlanDurations((prev) => ({ ...prev, [p.id]: tab.m }))}
                                style={{
                                  background: selectedDuration === tab.m ? 'var(--primary)' : 'transparent',
                                  color: selectedDuration === tab.m ? '#ffffff' : 'var(--text)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: selectedDuration === tab.m ? 700 : 500,
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

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 14px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{activePrice}
                        </span>
                        {originalPrice && originalPrice > activePrice && (
                          <span style={{ fontSize: '15px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{originalPrice}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {durationSub}
                        </span>
                      </div>

                      {selectedDuration === 12 && (
                        <div style={{ fontSize: '11.5px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                          1-Year Pack: 2 Months Free Discount Applied!
                        </div>
                      )}

                      <ul style={{ listStyle: 'none', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviewLimitDisplay}</li>
                        <li>✓ {p.qrCodeLimit} Smart QR Stands</li>
                        <li>✓ Conversion Funnel Tracking</li>
                        <li>✓ Real-Time Analytics &amp; Reputation Shield</li>
                      </ul>

                      <button
                        className="btn btn-primary btn-block"
                        disabled={initiatingPlanId !== null}
                        style={{
                          marginTop: '18px',
                          fontSize: '14px',
                          padding: '12px 16px',
                          fontWeight: 700,
                          background: isCurrentPlan ? '#15803d' : 'var(--primary)',
                          borderColor: isCurrentPlan ? '#15803d' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                        onClick={async () => {
                          try {
                            setInitiatingPlanId(p.id);
                            const [order, isLoaded] = await Promise.all([
                              api.createOrder(businessId, p.id, { durationMonths: selectedDuration, autoRenew: autoRenewChoice }),
                              loadRazorpay(),
                            ]);
                            if (isLoaded && (window as any).Razorpay) {
                              const isSub = Boolean(order.subscriptionId || order.isSubscription);
                              const options: any = {
                                key: order.keyId,
                                currency: order.currency,
                                name: 'KindlyRate Platform',
                                description: isSub
                                  ? `Upgrade to ${p.name} · ${selectedDuration === 12
                                    ? '1-Year Autopay (2 Mos Free)'
                                    : selectedDuration === 6
                                      ? '6-Month Autopay'
                                      : selectedDuration === 3
                                        ? '3-Month Autopay'
                                        : 'Monthly UPI Autopay'
                                  }`
                                  : `Upgrade to ${p.name} (${selectedDuration} Months · ${autoRenewChoice ? 'UPI Autopay' : 'One-Time'})`,
                                prefill: {
                                  name: business?.name || currentUser?.name || 'Business Owner',
                                  email: business?.email || currentUser?.email || '',
                                  contact: (business?.phone || currentUser?.phone || '').replace(/[^0-9]/g, '').slice(-10),
                                },
                                theme: {
                                  color: '#9a4018',
                                },
                                handler: async (response: any) => {
                                  try {
                                    await api.verifyPayment(businessId, {
                                      orderId: response.razorpay_subscription_id || response.razorpay_order_id,
                                      paymentId: response.razorpay_payment_id,
                                      signature: response.razorpay_signature,
                                      subscriptionId: response.razorpay_subscription_id,
                                    });
                                    showNotification(`Payment Successful! Account upgraded to ${p.name}.`);
                                    loadAllData();
                                  } catch (vErr: any) {
                                    showNotification(`Payment verification note: ${vErr.message}`);
                                  } finally {
                                    setInitiatingPlanId(null);
                                  }
                                },
                                modal: {
                                  ondismiss: () => {
                                    setInitiatingPlanId(null);
                                  },
                                },
                              };
                              if (isSub) {
                                options.subscription_id = order.subscriptionId || order.orderId;
                              } else {
                                options.order_id = order.orderId;
                                options.amount = order.amount;
                              }
                              const rzp = new (window as any).Razorpay(options);
                              rzp.on('payment.failed', (resp: any) => {
                                setInitiatingPlanId(null);
                                showNotification(`Payment Notice: ${resp.error?.description || 'Transaction was not completed'}`);
                              });
                              rzp.open();
                            } else {
                              setInitiatingPlanId(null);
                              showNotification('Razorpay checkout is loading. Please try again in a moment.');
                            }
                          } catch (err: any) {
                            setInitiatingPlanId(null);
                            showNotification(err.message || 'Failed to initialize payment');
                          }
                        }}
                      >
                        {initiatingPlanId === p.id ? (
                          <>
                            <span className="spinner" style={{ width: '16px', height: '16px' }} />
                            <span>Opening Secure Checkout...</span>
                          </>
                        ) : isCurrentPlan ? (
                          <span>✓ Active Plan (Switch / Renew: ₹{activePrice})</span>
                        ) : (
                          <span>Upgrade to {p.name} (₹{activePrice}) →</span>
                        )}
                      </button>
                    </div>
                  );
                })}

              {/* 4th Plan: Custom Enterprise & Bespoke Software */}
              <div
                className="card"
                style={{
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: '1.5px solid #d97706',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fffdf8 100%)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '20px',
                    background: '#d97706',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '12px',
                  }}
                >
                  BESPOKE SYSTEMS
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>Custom / Bespoke Software</div>
                    <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, marginTop: '2px' }}>
                      Enterprise &amp; Multi-Branch
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 14px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>
                    Custom Quote
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Tailored to your scope
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  For multi-branch chains, franchise networks, clinics, and businesses requiring custom POS/ERP integration or delivery dispatch.
                </p>

                <ul style={{ listStyle: 'none', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ Unlimited Smart QR Stands across all locations</li>
                  <li>✓ Multi-Branch Centralized Command Center</li>
                  <li>✓ Bespoke POS &amp; ERP sync (Tally, SAP, Marg, Zoho)</li>
                  <li>✓ In-House Delivery Fleet &amp; Dispatch Logistics</li>
                  <li>✓ Custom Laser-Engraved NFC Hardware Stands</li>
                  <li>✓ Dedicated Solutions Engineer &amp; 24/7 Hotline SLA</li>
                </ul>

                <button
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: '18px', fontSize: '13.5px', padding: '10px', background: '#d97706', borderColor: '#d97706', color: '#ffffff', fontWeight: 700 }}
                  onClick={() => setShowInquiryModal(true)}
                >
                  Request Custom Quote →
                </button>
              </div>
            </div>

            {/* TRANSACTION ID & PAYMENT AUDIT LEDGER */}
            <div className="card" style={{ padding: '24px', marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    Transaction History &amp; Payment Ledger
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                    Audited record of all trial activations, direct plan purchases, and recurring monthly charges with stored Transaction IDs.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadAllData()}
                  style={{ fontSize: '12px' }}
                >
                  Refresh History
                </button>
              </div>

              {paymentHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  No payment transactions recorded yet. When you activate your trial or plan, your transaction IDs will appear here.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Transaction ID</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Plan / Purpose</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Recurring</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((item: any) => {
                        const txnId = item.transactionId || item.paymentId || item.orderId;
                        const isCopied = copiedTxnId === txnId;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ background: '#f5f5f4', padding: '3px 7px', borderRadius: '4px', fontSize: '12px' }}>
                                  {txnId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(txnId);
                                    setCopiedTxnId(txnId);
                                    setTimeout(() => setCopiedTxnId(null), 2000);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: isCopied ? 'var(--success)' : 'var(--primary)',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 4px',
                                  }}
                                >
                                  {isCopied ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 500 }}>
                              {item.planName}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text)' }}>
                              ₹{item.amountInr}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {item.paymentType === 'recurring_monthly' ? (
                                <span style={{ color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                  Auto-Renew
                                </span>
                              ) : item.autoRenew ? (
                                <span style={{ color: '#9a4018', background: '#fef3eb', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                  Recurring Enabled
                                </span>
                              ) : (
                                <span style={{ color: '#78716c', background: '#f5f5f4', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                                  One-time
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span
                                style={{
                                  background: item.status === 'captured' ? '#dcfce7' : '#fee2e2',
                                  color: item.status === 'captured' ? '#166534' : '#991b1b',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {item.status === 'captured' ? '✓ Paid' : item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: CUSTOM SOFTWARE & ENTERPRISE SOLUTIONS           */}
        {/* ======================================================== */}
        {activeTab === 'custom_software' && (
          <div>
            <div className="executive-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <span className="stat-pill" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', marginBottom: '8px' }}>
                    Custom Software &amp; Enterprise Solutions
                  </span>
                  <h2 className="serif" style={{ fontSize: '26px', fontWeight: 700, color: '#fcfaf7', marginTop: '6px', lineHeight: 1.25 }}>
                    Need Custom Software, Fleet Delivery &amp; Business Management Solutions?
                  </h2>
                  <p style={{ color: '#d6cec7', fontSize: '14px', maxWidth: '720px', marginTop: '8px', lineHeight: 1.6 }}>
                    Whatever your business needs, we engineer and build it. From Real-Time Delivery Fleet &amp; Dispatch Management, Multi-Branch Enterprise ERPs, to Omnichannel Billing/POS and Bespoke Mobile Apps — you tell us what you need, and our engineering team builds it for you.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ background: '#d97706', borderColor: '#d97706', color: '#1c1815', fontWeight: 700, fontSize: '14px', padding: '12px 22px', borderRadius: '10px' }}
                  onClick={() => setShowInquiryModal(true)}
                >
                  Request Custom Software Consultation
                </button>
              </div>

              {/* 4 Feature Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <MapPin size={18} color="#fbbf24" />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#fcfaf7' }}>Delivery Fleet &amp; Dispatch</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#a89f91', lineHeight: 1.55 }}>
                    Real-time rider GPS tracking, live customer ETA links, automated dispatch routing, and SMS/WhatsApp driver alerts.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <StorefrontIcon size={18} />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#fcfaf7' }}>Enterprise ERP &amp; CRM</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#a89f91', lineHeight: 1.55 }}>
                    Multi-branch inventory ledger, vendor procurement, customer CRM, staff payroll, and real-time financial reporting.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Printer size={18} color="#fbbf24" />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#fcfaf7' }}>Omnichannel POS &amp; Billing</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#a89f91', lineHeight: 1.55 }}>
                    Barcode scanning, thermal receipt printing, GST compliance, offline-sync billing, and multi-store warehouse transfers.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Code2 size={18} color="#fbbf24" />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#fcfaf7' }}>Bespoke Mobile Apps &amp; Automation</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#a89f91', lineHeight: 1.55 }}>
                    You tell us what you need, we build it. Custom iOS/Android apps, third-party webhooks, and automated workflows.
                  </div>
                </div>
              </div>

              {/* Contact Bar with Real Logos */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '14px', color: '#d6cec7' }}>
                  <div>Direct Phone: <strong style={{ color: '#fcfaf7' }}>+91 81238 24899</strong></div>
                  <div>Email: <strong style={{ color: '#fcfaf7' }}>sandeshnaik525@gmail.com</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="tel:+918123824899"
                    style={{
                      color: '#fcfaf7',
                      border: '1px solid rgba(255,255,255,0.25)',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Phone size={14} />
                    <span>Call Direct</span>
                  </a>
                  <a
                    href={`https://wa.me/918123824899?text=${encodeURIComponent(
                      `Hello! I manage "${business?.name || 'My Business'}" and would like details regarding custom software development (Delivery fleet / ERP / Billing / Custom Apps).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                    }}
                  >
                    <WhatsAppLogo size={18} />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* In-Page Quick Consultation Form Card */}
            <div
              className="card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px 32px',
                marginTop: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                  Schedule Free Engineering Consultation
                </span>
                <h3 className="serif" style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 6px', color: 'var(--text)' }}>
                  Tell Us What You Want to Build for {business?.name || 'Your Business'}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Our senior software architects will analyze your business requirements, prepare a turnkey architectural plan, and provide an accurate cost and timeline estimate.
                </p>
              </div>

              <form onSubmit={handleSubmitInquiry}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
                    What type of custom system or application do you need?
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={inquiryForm.serviceType}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, serviceType: e.target.value })}
                    placeholder="e.g. Real-time Delivery Fleet App, Multi-Outlet Retail ERP, Thermal Billing POS..."
                    required
                    style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px' }}
                  />

                  {/* Preset Quick Chips */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                      Quick Ideas (Click to auto-fill):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        'Delivery Fleet & Dispatch Tracking',
                        'Multi-Store Inventory ERP & Ledger',
                        'Omnichannel POS & Thermal Billing',
                        'Bespoke Mobile App (iOS & Android)',
                        'Automated WhatsApp Customer Bot',
                        'Online Ordering & Payment System',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setInquiryForm({ ...inquiryForm, serviceType: preset })}
                          style={{
                            background: inquiryForm.serviceType === preset ? '#fef3c7' : '#f8fafc',
                            border: inquiryForm.serviceType === preset ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                            color: inquiryForm.serviceType === preset ? '#92400e' : '#334155',
                            borderRadius: '20px',
                            padding: '5px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: inquiryForm.serviceType === preset ? 700 : 500,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
                    Briefly describe your requirements or current bottlenecks
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={inquiryForm.requirements}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, requirements: e.target.value })}
                    placeholder="Describe how your store operates today, how many branches or riders you have, and what features you want..."
                    style={{ padding: '12px 14px', fontSize: '13.5px', borderRadius: '10px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '14.5px', fontWeight: 700, padding: '12px 28px', borderRadius: '10px' }}
                  >
                    Submit Consultation Request →
                  </button>

                  <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={13} color="#64748b" />
                    <span>Confidential · Free Architecture Blueprint · Response within 4 hours</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        </main>

        {/* Sticky Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-bottom-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-item ${activeTab === 'qrs' ? 'active' : ''}`}
            onClick={() => setActiveTab('qrs')}
          >
            <QrCode size={18} />
            <span>QR Stands</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
            style={!isPaidActive ? { color: '#b45309', fontWeight: 700 } : undefined}
          >
            <Zap size={18} color={!isPaidActive ? '#d97706' : 'currentColor'} />
            <span>{!isPaidActive ? '₹79 Offer' : 'Plans'}</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <MessageSquare size={18} />
            <span>Reviews</span>
          </button>
          <button
            type="button"
            className="mobile-bottom-nav-item"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        </nav>
      </div>

        
        {/* MODAL: QR Stand Design & Color Studio */}
        {selectedQRForDesign && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1200,
              padding: '16px',
            }}
            onClick={() => setSelectedQRForDesign(null)}
          >
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: '16px',
                maxWidth: '920px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: '32px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedQRForDesign(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22, 163, 74, 0.08)', color: '#15803d', fontSize: '11.5px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px', marginBottom: '8px' }}>
                  <Palette size={13} />
                  <span>Hardware Stand &amp; QR Color Studio</span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  Customize QR Stand for "{selectedQRForDesign.name}"
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Choose from 5 physical counter stand styles and curated brand color palettes, or pick your exact brand hex code.
                </p>
              </div>

              {/* 2-Column Responsive Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {/* LEFT: Live Interactive Stand Artwork Preview */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Live Stand Preview
                  </div>

                  {/* Render based on designStyle */}
                  <div
                    style={{
                      background: designBgColor === '#18181b' ? '#0f172a' : '#f8fafc',
                      border: '2px solid var(--border)',
                      borderRadius: '16px',
                      padding: '24px 20px',
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Stand Design 1: Classic Counter Stand */}
                    {designStyle === 'classic' && (
                      <div style={{ background: designBgColor, borderRadius: '14px', padding: '24px 18px', border: `3px solid ${designColor}`, color: designBgColor === '#18181b' ? '#ffffff' : '#09090b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                          <GoogleLogo size={18} />
                          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em' }}>Google Reviews</span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: designColor }}>
                          {business?.name || 'Your Business Name'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '6px 0 14px' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon key={i} size={18} color="#f59e0b" filled={true} />
                          ))}
                        </div>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <img
                            src={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor === '#18181b' ? '#ffffff' : designBgColor)}`}
                            alt="QR Preview"
                            style={{ width: '160px', height: '160px', display: 'block' }}
                          />
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '12px', color: designColor }}>
                          Scan with your phone camera
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Takes under 15 seconds • Verified Direct Link
                        </div>
                      </div>
                    )}

                    {/* Stand Design 2: Modern Acrylic Plaque */}
                    {designStyle === 'acrylic' && (
                      <div
                        style={{
                          background: designBgColor === '#18181b' ? '#18181b' : 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          padding: '28px 20px',
                          border: '1.5px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                          color: designBgColor === '#18181b' ? '#ffffff' : '#09090b',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: designColor }}>{business?.name || 'KindlyRate Verified'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedQRForDesign.locationTag || 'Front Desk'}</div>
                          </div>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: 'rgba(22, 163, 74, 0.1)', color: '#15803d', padding: '3px 8px', borderRadius: '12px' }}>
                            NFC + QR
                          </span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                          <img
                            src={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor === '#18181b' ? '#ffffff' : designBgColor)}`}
                            alt="QR Preview"
                            style={{ width: '160px', height: '160px', display: 'block' }}
                          />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <GoogleLogo size={14} />
                          <span>Tap Phone Here or Scan</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Leave your genuine 5-star experience
                        </div>
                      </div>
                    )}

                    {/* Stand Design 3: Hospitality Table Tent */}
                    {designStyle === 'table-tent' && (
                      <div style={{ background: designBgColor, borderRadius: '12px', padding: '22px 18px', border: `2px dashed ${designColor}`, color: designBgColor === '#18181b' ? '#ffffff' : '#09090b' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: designColor, marginBottom: '4px' }}>
                          Table Talker · Dining Edition
                        </div>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px' }}>
                          Loved Your Visit Today?
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                          Share a quick review and help others discover {business?.name || 'our kitchen'}!
                        </p>
                        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          <img
                            src={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor === '#18181b' ? '#ffffff' : designBgColor)}`}
                            alt="QR Preview"
                            style={{ width: '150px', height: '150px', display: 'block' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '10px' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon key={i} size={16} color="#f59e0b" filled={true} />
                          ))}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '6px' }}>
                          Scan to Rate Us on Google Maps
                        </div>
                      </div>
                    )}

                    {/* Stand Design 4: POS Register Sticker */}
                    {designStyle === 'pos-sticker' && (
                      <div style={{ background: designColor, borderRadius: '14px', padding: '16px', color: '#ffffff', maxWidth: '280px', margin: '0 auto', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                          ★ RATE US ON GOOGLE ★
                        </div>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', display: 'inline-block' }}>
                          <img
                            src={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=#ffffff`}
                            alt="QR Preview"
                            style={{ width: '150px', height: '150px', display: 'block' }}
                          />
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px', color: '#ffffff' }}>
                          SCAN WITH CAMERA
                        </div>
                      </div>
                    )}

                    {/* Stand Design 5: Minimal Pure QR */}
                    {designStyle === 'minimal' && (
                      <div style={{ background: designBgColor, borderRadius: '12px', padding: '24px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                        <img
                          src={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor)}`}
                          alt="QR Preview"
                          style={{ width: '190px', height: '190px', display: 'block' }}
                        />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                          Lossless Pure Vector QR
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Color & Template Selection Controls */}
                <div>
                  {/* Color Palette Section */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                      Choose Stand Color Palette
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                      {[
                        { name: 'Terracotta', hex: '#9a4018', bg: '#ffffff', label: 'Signature Warm' },
                        { name: 'Obsidian', hex: '#09090b', bg: '#ffffff', label: 'Classic Minimal' },
                        { name: 'Emerald', hex: '#059669', bg: '#ffffff', label: 'Trust & Growth' },
                        { name: 'Royal Blue', hex: '#2563eb', bg: '#ffffff', label: 'Professional' },
                        { name: 'Violet', hex: '#7c3aed', bg: '#ffffff', label: 'Modern Tech' },
                        { name: 'Crimson', hex: '#e11d48', bg: '#ffffff', label: 'Hospitality' },
                        { name: 'Luxury Gold', hex: '#b45309', bg: '#ffffff', label: 'Salons & Spas' },
                        { name: 'Ocean Teal', hex: '#0d9488', bg: '#ffffff', label: 'Medical/Clinics' },
                        { name: 'Night Mode', hex: '#ffffff', bg: '#18181b', label: 'Dark Plaque' },
                      ].map((preset) => {
                        const isSelected = designColor.toLowerCase() === preset.hex.toLowerCase() && designBgColor === preset.bg;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setDesignColor(preset.hex);
                              setDesignBgColor(preset.bg);
                            }}
                            style={{
                              background: isSelected ? 'rgba(0,0,0,0.06)' : 'var(--bg-canvas)',
                              border: isSelected ? `2px solid ${preset.hex}` : '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '8px 6px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: preset.hex,
                                border: '1.5px solid rgba(0,0,0,0.15)',
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 800 : 600, color: 'var(--text)' }}>
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Hex Color Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-canvas)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <input
                        type="color"
                        value={designColor}
                        onChange={(e) => setDesignColor(e.target.value)}
                        style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0, background: 'none' }}
                        title="Pick custom brand color"
                      />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Custom Brand Hex</span>
                        <input
                          type="text"
                          value={designColor}
                          onChange={(e) => setDesignColor(e.target.value)}
                          placeholder="#9a4018"
                          style={{ border: 'none', background: 'none', fontSize: '13px', fontWeight: 700, color: 'var(--text)', outline: 'none', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Design Template Options */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                      Choose Physical Stand Template
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { id: 'classic', title: 'Classic Counter Stand', desc: 'Vertical acrylic stand with Google 5-star header & scan prompt.', badge: 'Most Popular' },
                        { id: 'acrylic', title: 'Modern Acrylic Plaque', desc: 'Glassmorphic frosted border with NFC badge & verified seal.', badge: 'Premium Look' },
                        { id: 'table-tent', title: 'Hospitality Table Tent', desc: 'Foldable dining table format: "Loved your food? Scan to review".', badge: 'Dining & Cafes' },
                        { id: 'pos-sticker', title: 'Checkout Register Sticker', desc: 'Compact square badge formatted for monitor corners or drawers.', badge: 'Compact' },
                        { id: 'minimal', title: 'Minimal Pure QR', desc: 'Lossless vector QR code without frame text for custom printing.', badge: 'Vector' },
                      ].map((tpl) => {
                        const isSelected = designStyle === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setDesignStyle(tpl.id)}
                            style={{
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: isSelected ? 'rgba(154, 64, 24, 0.04)' : 'var(--bg-canvas)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{tpl.title}</span>
                                <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                  {tpl.badge}
                                </span>
                              </div>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>
                                {tpl.desc}
                              </p>
                            </div>
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid var(--primary)' : '2px solid var(--border)',
                                background: '#ffffff',
                                flexShrink: 0,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveQRDesign}
                      disabled={savingDesign}
                      style={{ width: '100%', padding: '10px 16px', fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{savingDesign ? 'Saving Preferences...' : 'Save as Stand Default Style'}</span>
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <a
                        href={`/api/qrs/${selectedQRForDesign.slug}/image?format=png&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor === '#18181b' ? '#ffffff' : designBgColor)}`}
                        download={`${selectedQRForDesign.name.replace(/\s+/g, '_')}_${designColor.replace('#', '')}_QR.png`}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '8px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Download size={13} />
                        <span>Download PNG</span>
                      </a>
                      <a
                        href={`/api/qrs/${selectedQRForDesign.slug}/image?format=svg&color=${encodeURIComponent(designColor)}&bgColor=${encodeURIComponent(designBgColor === '#18181b' ? '#ffffff' : designBgColor)}`}
                        download={`${selectedQRForDesign.name.replace(/\s+/g, '_')}_${designColor.replace('#', '')}_QR.svg`}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '8px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Download size={13} />
                        <span>Download SVG</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => window.print()}
                      style={{ width: '100%', fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Printer size={13} />
                      <span>Print Stand Sheet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create QR Modal */}
        {showQRModal && (
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
              padding: '12px',
            }}
          >
            <div className="card modal-responsive-card" style={{ width: '100%', maxWidth: '440px' }}>
              <h3 className="serif" style={{ fontSize: '19px', marginBottom: '14px' }}>
                New Smart QR Stand
              </h3>
              <form onSubmit={handleCreateQR}>
                <div className="form-group">
                  <label className="form-label">QR Stand Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Table 9, Patio Table 3, Bar 2"
                    value={newQRName}
                    onChange={(e) => setNewQRName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Section Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Billing Counter, Service Desk, Front Lobby"
                    value={newQRLocation}
                    onChange={(e) => setNewQRLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Specific Google Maps Link (Optional)</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empty = Business Default</span>
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder={business?.googleReviewUrl || 'https://maps.app.goo.gl/...'}
                    value={newQRGoogleReviewUrl}
                    onChange={(e) => setNewQRGoogleReviewUrl(e.target.value)}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Direct customers from this specific stand to a different branch or custom Google review dialog.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowQRModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create QR Stand
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit QR Stand Modal */}
        {editingQR && (
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
              padding: '12px',
            }}
          >
            <div className="card modal-responsive-card" style={{ width: '100%', maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="serif" style={{ fontSize: '19px', margin: 0 }}>
                  Edit QR Stand: {editingQR.name}
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingQR(null)}
                  style={{ padding: '2px 8px', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateQR}>
                <div className="form-group">
                  <label className="form-label">QR Stand Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingQR.name || ''}
                    onChange={(e) => setEditingQR({ ...editingQR, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Section Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingQR.locationTag || ''}
                    onChange={(e) => setEditingQR({ ...editingQR, locationTag: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Google Maps Review Destination</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empty = Business Default</span>
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder={business?.googleReviewUrl || 'Inherits default business review link'}
                    value={editingQR.googleReviewUrl || ''}
                    onChange={(e) => setEditingQR({ ...editingQR, googleReviewUrl: e.target.value })}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Paste a specific Google Maps link or leave empty to use your default business link.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingQR(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Software Inquiry Modal */}
        {showInquiryModal && (
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
              padding: '12px',
            }}
          >
            <div className="card modal-responsive-card" style={{ width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="serif" style={{ fontSize: '19px', fontWeight: 600 }}>
                  Request Custom Software Development
                </h3>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Tell us what system you need for <strong>{business?.name || 'Your Business'}</strong>. Our engineering team will prepare a custom proposal and architectural plan.
              </p>

              <form onSubmit={handleSubmitInquiry}>
                {/* Type freely input instead of dropdown select */}
                <div className="form-group">
                  <label className="form-label">What Custom Software Do You Need? (Type freely)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inquiryForm.serviceType}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, serviceType: e.target.value })}
                    placeholder="e.g. Delivery fleet tracking system, custom retail ERP, billing POS, bespoke mobile app..."
                    required
                  />

                  {/* Suggestion Chips */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '4px', fontWeight: 600 }}>
                      Quick Ideas (Click to fill or edit):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        'Delivery Fleet & Dispatch Management',
                        'Enterprise ERP & CRM Suite',
                        'Omnichannel Billing & POS',
                        'Custom Mobile App (iOS / Android)',
                        'Custom Workflow Automation',
                        'Online Ordering & E-Commerce',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setInquiryForm({ ...inquiryForm, serviceType: preset })}
                          style={{
                            background: inquiryForm.serviceType === preset ? 'rgba(217, 119, 6, 0.15)' : 'var(--surface-container)',
                            border: inquiryForm.serviceType === preset ? '1px solid #d97706' : '1px solid var(--border)',
                            color: inquiryForm.serviceType === preset ? '#d97706' : 'var(--text)',
                            borderRadius: '16px',
                            padding: '3px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <PhoneInput
                    label="Contact Phone Number"
                    value={inquiryForm.contactPhone}
                    onChange={(val) => setInquiryForm({ ...inquiryForm, contactPhone: val })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements & Feature Details (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe specific features: e.g. need 15 delivery bikes tracked live, customer tracking link, offline billing, thermal printer, custom staff roles..."
                    value={inquiryForm.requirements}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, requirements: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInquiryModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingInquiry} style={{ background: '#d97706', borderColor: '#d97706', color: '#1c1815', fontWeight: 700 }}>
                    {submittingInquiry ? 'Sending...' : 'Submit Software Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Help & Support Modal */}
        {showHelpModal && (
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
              zIndex: 1150,
              padding: '12px',
            }}
          >
            <div className="card modal-responsive-card" style={{ width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={20} />
                  <h3 className="serif" style={{ fontSize: '19px', fontWeight: 600 }}>
                    Help & Technical Support
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Encountering an issue or have a question? Our support engineers are on standby to help you.
              </p>

              {/* Fast Direct Contacts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <a
                  href="tel:+918123824899"
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Call Hotline</span>
                </a>
                <a
                  href={`https://wa.me/918123824899?text=${encodeURIComponent(
                    `Hello Support! I manage "${business?.name || 'My Business'}" and need assistance with my dashboard/reviews.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ background: '#25D366', borderColor: '#25D366', fontSize: '12.5px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>WhatsApp Support</span>
                </a>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '12px', textAlign: 'center' }}>
                — Or submit a direct ticket below —
              </div>

              <form onSubmit={handleSendHelp}>
                <div className="form-group">
                  <label className="form-label">Subject / Issue Topic</label>
                  <input
                    type="text"
                    className="form-input"
                    value={helpForm.subject}
                    onChange={(e) => setHelpForm({ ...helpForm, subject: e.target.value })}
                    required
                  />
                </div>

                <PhoneInput
                  label="Callback Phone Number"
                  value={helpForm.phone}
                  onChange={(val) => setHelpForm({ ...helpForm, phone: val })}
                  required
                />

                <div className="form-group">
                  <label className="form-label">How can we help? (Describe what happened)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide details about the issue or question..."
                    value={helpForm.message}
                    onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowHelpModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingHelp}>
                    {submittingHelp ? 'Sending...' : 'Send Help Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Platform Announcements & Broadcasts Drawer/Modal */}
        {showNotifDrawer && (
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
              zIndex: 1150,
              padding: '12px',
            }}
          >
            <div className="card modal-responsive-card" style={{ width: '100%', maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={20} />
                  <h3 className="serif" style={{ fontSize: '19px', fontWeight: 600 }}>
                    System Announcements ({systemNotifications.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                {systemNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                    No announcements posted at this time.
                  </div>
                ) : (
                  systemNotifications.map((n) => {
                    const typeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                      ALERT: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: 'ALERT' },
                      WARNING: { bg: '#fffbeb', border: '#fcd34d', text: '#b45309', icon: 'NOTICE' },
                      SUCCESS: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', icon: 'UPDATE' },
                      PROMO: { bg: '#faf5ff', border: '#d8b4fe', text: '#7e22ce', icon: 'PROMO' },
                      INFO: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', icon: 'ℹ️ INFO' },
                    };
                    const c = typeColors[n.type] || typeColors.INFO;

                    return (
                      <div
                        key={n.id}
                        style={{
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: c.text,
                              textTransform: 'uppercase',
                            }}
                          >
                            {c.icon}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                          {n.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                          {n.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowNotifDrawer(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        <EmailVerificationModal
          isOpen={showEmailVerifyModal}
          email={currentUser?.email || business?.email || ''}
          onClose={() => setShowEmailVerifyModal(false)}
          onSuccess={() => {
            showNotification('Email successfully verified!');
            loadAllData();
          }}
        />

        {/* Festive Lucky Spin Modal Popup */}
        <DiwaliSpinningOffer
          isOpen={showSpinModal}
          onClose={() => setShowSpinModal(false)}
          onClaimTrial={handlePayTrial}
          onViewAllPlans={() => {
            setShowSpinModal(false);
            setActiveTab('subscription');
          }}
          offerTimeLeft={offerTimeLeft}
        />

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeletingAccount) {
                setShowDeleteModal(false);
              }
            }}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                color: 'var(--text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#dc2626' }}>
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '8px', borderRadius: '50%' }}>
                  <AlertTriangle size={24} color="#dc2626" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                  Permanently Delete Account?
                </h3>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                This will immediately and irreversibly delete your login credentials, <strong>{business?.name || 'your business'}</strong>, all QR stand routes, customer review logs, and analytics.
              </p>

              {deleteError && (
                <div className="alert alert-error" style={{ marginBottom: '14px', fontSize: '12.5px' }}>
                  {deleteError}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                  To confirm, type <strong style={{ color: '#dc2626' }}>DELETE</strong> below:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={isDeletingAccount}
                  style={{ width: '100%', textTransform: 'uppercase' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                  style={{
                    background: deleteConfirmText.trim().toUpperCase() === 'DELETE' ? '#dc2626' : '#9ca3af',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: deleteConfirmText.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDeletingAccount ? <span className="spinner" /> : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legal Modals (Terms, Privacy, Refund) */}
        {legalModal && (
          <LegalModals type={legalModal} onClose={() => setLegalModal(null)} />
        )}
    </div>
  );
};
