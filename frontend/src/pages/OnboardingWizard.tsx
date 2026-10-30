import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';
import { KindlyRateLogo } from '../components/Logos.js';
import { convertGoogleMapsUrl } from '../utils/mapsUrlHelper.js';
import { PhoneInput } from '../components/PhoneInput.js';
import { validatePhoneNumber } from '../utils/phoneValidator.js';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal.js';
import { GoogleAuthButton } from '../components/GoogleAuthButton.js';
import { loadRazorpay } from '../utils/razorpay.js';
import {
  Key,
  Mail,
  Terminal,
  Eye,
  EyeOff,
  Lock,
  Link2,
  Zap,
  Lightbulb,
  AlertTriangle,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onComplete: (business: any) => void;
  onNavigateLogin: () => void;
  onNavigateHome?: () => void;
  currentUser?: any;
  initialStep?: number;
}

export const OnboardingWizard: React.FC<Props> = ({
  onComplete,
  onNavigateLogin,
  onNavigateHome,
  currentUser,
  initialStep,
}) => {
  const [step, setStep] = useState<number>(() => {
    if (initialStep) return initialStep;
    if (currentUser) return 2;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('step') === '2') return 2;
    }
    return 1;
  });
  const [categories, setCategories] = useState<any>({});
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Maps Share Link conversion state
  const [convertingMapsUrl, setConvertingMapsUrl] = useState(false);
  const [mapsConvertSuccess, setMapsConvertSuccess] = useState<string | null>(null);

  // Plan duration selections (1, 3, 6, 12 months)
  const [onboardingPlanDurations, setOnboardingPlanDurations] = useState<Record<string, 1 | 3 | 6 | 12>>({});

  // Payment Choice: Autopay Direct Subscription (Forced First Option) vs Starter Trial
  const [paymentChoice, setPaymentChoice] = useState<'direct' | 'trial'>('direct');
  const [autoRenewDirect, setAutoRenewDirect] = useState<boolean>(true);

  // Auth & Account state
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(() => Boolean(currentUser));
  const [showPassword, setShowPassword] = useState(false);
  const [emailExistsNotice, setEmailExistsNotice] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineLoginLoading, setInlineLoginLoading] = useState(false);

  // Email Verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => Boolean(currentUser?.emailVerified));
  const [signupDevOtp, setSignupDevOtp] = useState<string | undefined>(undefined);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpResending, setOtpResending] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Sync state if currentUser becomes available asynchronously
  useEffect(() => {
    if (currentUser) {
      setIsAccountCreated(true);
      if (currentUser.emailVerified) {
        setIsEmailVerified(true);
      }
      setFormData((prev: any) => ({
        ...prev,
        ownerName: prev.ownerName || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
      setStep((prev) => (prev === 1 ? 2 : prev));
    }
  }, [currentUser]);

  // Sync initialStep if explicitly updated by parent
  useEffect(() => {
    if (initialStep && initialStep !== step) {
      setStep(initialStep);
    }
  }, [initialStep]);

  // Form Data across steps
  const [formData, setFormData] = useState<any>({
    // Step 1: Merchant Account & Login Credentials
    ownerName: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    phone: currentUser?.phone || '',

    // Step 2: Category
    mainCategory: 'FOOD & HOSPITALITY',
    subcategory: 'Restaurant',
    customCategory: '',

    // Step 3: Restaurant / Business Details
    businessName: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    description: '',
    openingHours: '10:00 AM - 10:00 PM',

    // Step 4: Review Config
    questions: [] as any[],
    reviewTone: 'enthusiastic',
    reviewLength: 'medium',

    // Step 5: Google Review URL & Share Link
    googleMapsShareUrl: '',
    googleReviewUrl: '',

    // Step 6: Plan
    planSlug: 'starter',
  });

  const [createdBusiness, setCreatedBusiness] = useState<any>(null);
  const [firstQRSlug, setFirstQRSlug] = useState<string>('');
  const [trialPlanData, setTrialPlanData] = useState<any>(null);
  const [paymentNote, setPaymentNote] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [catRes, planRes, meRes] = await Promise.all([
        api.getCategories().catch(() => ({})),
        api.getPlans().catch(() => []),
        api.getMe().catch(() => null),
      ]);

      setCategories(catRes);
      setPlans(planRes);

      // Check if user is already authenticated
      if (meRes?.user) {
        setIsAccountCreated(true);
        setIsEmailVerified(meRes.user.emailVerified ?? true);
        setFormData((prev: any) => ({
          ...prev,
          ownerName: meRes.user.name || prev.ownerName,
          email: meRes.user.email || prev.email,
          phone: meRes.user.phone || prev.phone || '',
        }));
      }

      // Initialize default questions for Food & Hospitality
      const defaultCat = catRes['FOOD & HOSPITALITY'];
      if (defaultCat?.defaultQuestions) {
        setFormData((prev: any) => ({
          ...prev,
          questions: defaultCat.defaultQuestions.map((q: any, i: number) => ({
            questionKey: q.key,
            label: q.label,
            scaleType: '1-5_STARS',
            displayOrder: i,
          })),
        }));
      }
    } catch (e: any) {
      console.error('Failed to load onboarding catalog:', e);
    }
  };

  const handleCategorySelect = (mainCat: string, subCat: string) => {
    const catDef = categories[mainCat];
    const defaultQs = catDef?.defaultQuestions || [];
    setFormData((prev: any) => ({
      ...prev,
      mainCategory: mainCat,
      subcategory: subCat,
      questions: defaultQs.map((q: any, i: number) => ({
        questionKey: q.key,
        label: q.label,
        scaleType: '1-5_STARS',
        displayOrder: i,
      })),
    }));
  };

  // Step 1: Submit Account Creation
  const handleAccountSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setEmailExistsNotice(false);

    if (!formData.ownerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please provide your name, email, and mobile phone number.');
      return;
    }
    const phoneVal = validatePhoneNumber(formData.phone);
    if (!phoneVal.isValid) {
      setError(phoneVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      const signupRes = await api.signup({
        name: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });
      setIsAccountCreated(true);
      if (signupRes?.devOtp) {
        setSignupDevOtp(signupRes.devOtp);
      }
      if (signupRes?.user?.emailVerified) {
        setIsEmailVerified(true);
        setStep(2); // Proceed to Category
      } else {
        setShowOtpVerification(true);
        setOtpCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError(null);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      }
    } catch (err: any) {
      if (err.code === 'EMAIL_EXISTS' || (err.message && err.message.toLowerCase().includes('already exists'))) {
        setEmailExistsNotice(true);
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Account registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }
    const char = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (index < 5 && char) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 || newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      if (code.length === 6) {
        handleVerifyOtp(code);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError(null);
      await api.verifyEmail(code, formData.email.trim().toLowerCase());
      setOtpSuccess(true);
      setIsEmailVerified(true);
      setTimeout(() => {
        setShowOtpVerification(false);
        setStep(2); // Proceed to Category
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    try {
      setOtpResending(true);
      setOtpError(null);
      const res = await api.sendVerificationOtp(formData.email.trim().toLowerCase());
      setOtpCooldown(60);
      if (res?.devOtp) {
        setSignupDevOtp(res.devOtp);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setOtpResending(false);
    }
  };

  const handleFillDevOtp = () => {
    if (!signupDevOtp || signupDevOtp.length !== 6) return;
    setOtpDigits(signupDevOtp.split(''));
    handleVerifyOtp(signupDevOtp);
  };

  // Step 1 Inline Login (when email already exists)
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inlinePassword) {
      setError('Please enter your password to sign in.');
      return;
    }
    try {
      setInlineLoginLoading(true);
      const res = await api.login({
        email: formData.email.trim().toLowerCase(),
        password: inlinePassword,
      });
      setIsAccountCreated(true);
      setEmailExistsNotice(false);
      setFormData((prev: any) => ({
        ...prev,
        ownerName: res.user?.name || prev.ownerName,
        password: inlinePassword,
      }));
      setStep(2); // Move to Category
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please check your credentials.');
    } finally {
      setInlineLoginLoading(false);
    }
  };

  const handleConvertOnboardingMapsLink = async () => {
    const raw = (formData.googleMapsShareUrl || '').trim();
    if (!raw) {
      setError('Please enter a Google Maps share link or URL to convert.');
      return;
    }

    try {
      setConvertingMapsUrl(true);
      setError(null);
      setMapsConvertSuccess(null);

      const res = await convertGoogleMapsUrl(raw);
      if (res && res.directReviewUrl) {
        setFormData((prev: any) => ({
          ...prev,
          googleReviewUrl: res.directReviewUrl,
        }));
        setMapsConvertSuccess(`✓ Converted to direct 5-star review link! (${res.detectedType})`);
      } else {
        throw new Error('Could not convert this link. Please enter your direct review URL manually.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert Google Maps link.');
    } finally {
      setConvertingMapsUrl(false);
    }
  };

  const handlePasteOnboardingMapsLink = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setFormData((prev: any) => ({ ...prev, googleMapsShareUrl: text.trim() }));
          setError(null);
        }
      }
    } catch {
      // Clipboard API might require user permission
    }
  };

  const handleNext = async () => {
    setError(null);

    // Step 1 validation
    if (step === 1) {
      if (!isAccountCreated) {
        handleAccountSubmit();
        return;
      }
      setStep(2);
      return;
    }

    // Step 2: Instant Store Setup (Fast, zero-friction)
    if (step === 2) {
      if (!formData.businessName || !formData.businessName.trim()) {
        setError('Please enter your business or store name.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        let targetBiz = createdBusiness;
        if (!targetBiz) {
          const setupRes = await api.setupBusiness({
            businessName: formData.businessName.trim(),
            mainCategory: formData.mainCategory || 'FOOD & HOSPITALITY',
            subcategory: formData.subcategory || 'General',
            customCategory: formData.customCategory || undefined,
            phone: (formData.phone || '').trim(),
            address: 'Central Location',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '000000',
            googleReviewUrl: 'https://maps.google.com',
            planSlug: 'starter',
          });
          targetBiz = setupRes.business;
          setCreatedBusiness(targetBiz);
          setFirstQRSlug(setupRes.firstQRSlug);
          setTrialPlanData(setupRes.trialPlan);
        }
        setStep(3); // Advance straight to software flow explanation!
        return;
      } catch (err: any) {
        setError(err.message || 'Failed to setup store. Please try again.');
        return;
      } finally {
        setLoading(false);
      }
    }

    // Step 5 validation (Google URL)
    if (step === 5) {
      let targetReviewUrl = formData.googleReviewUrl;
      if (!targetReviewUrl && formData.googleMapsShareUrl) {
        try {
          setConvertingMapsUrl(true);
          const res = await convertGoogleMapsUrl(formData.googleMapsShareUrl);
          if (res && res.directReviewUrl) {
            targetReviewUrl = res.directReviewUrl;
            setFormData((prev: any) => ({ ...prev, googleReviewUrl: res.directReviewUrl }));
            setMapsConvertSuccess(`✓ Converted to direct 5-star review link! (${res.detectedType})`);
          }
        } catch {
          // fallback validation below
        } finally {
          setConvertingMapsUrl(false);
        }
      }

      if (!targetReviewUrl || !targetReviewUrl.startsWith('http')) {
        setError('Please enter or convert a valid Google Review URL (e.g. https://search.google.com/local/writereview?...).');
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Open Dashboard Directly without waiting for payment
  const handleOpenDashboardDirectly = async () => {
    try {
      setLoading(true);
      setError(null);
      let targetBiz = createdBusiness;
      if (!targetBiz) {
        try {
          const setupRes = await api.setupBusiness({
            businessName: formData.businessName,
            mainCategory: formData.mainCategory,
            subcategory: formData.subcategory,
            customCategory: formData.customCategory || undefined,
            phone: formData.phone,
            address: formData.address || 'Central Address',
            city: formData.city || 'Metropolis',
            state: formData.state || 'State',
            country: formData.country || 'India',
            pincode: formData.pincode || '000000',
            googleReviewUrl: formData.googleReviewUrl,
            googleMapsShareUrl: formData.googleMapsShareUrl || undefined,
            description: formData.description,
            openingHours: formData.openingHours,
            questions: formData.questions,
            planSlug: formData.planSlug,
          });
          targetBiz = setupRes.business;
          setCreatedBusiness(targetBiz);
        } catch {
          const bizList = await api.getMyBusinesses().catch(() => []);
          targetBiz = bizList[0];
          if (targetBiz) setCreatedBusiness(targetBiz);
        }
      }
      if (targetBiz) {
        onComplete(targetBiz);
      } else {
        setError('Please check your business details.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize business account');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Create/Ensure Business & Trigger Razorpay Trial Activation
  const handleTrialPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentNote(null);

      let targetBiz = createdBusiness;
      let targetQR = firstQRSlug;
      let trialPlan = trialPlanData;

      // 1. Ensure business is created/setup if not yet created
      if (!targetBiz) {
        if (!formData.businessName || !formData.businessName.trim()) {
          setError('Please provide your business name.');
          setStep(3);
          return;
        }

        try {
          const setupRes = await api.setupBusiness({
            businessName: formData.businessName.trim(),
            mainCategory: formData.mainCategory || 'FOOD & HOSPITALITY',
            subcategory: formData.subcategory || 'General',
            customCategory: formData.customCategory || undefined,
            phone: (formData.phone || '').trim(),
            address: formData.address || 'Central Address',
            city: formData.city || 'Metropolis',
            state: formData.state || 'State',
            country: formData.country || 'India',
            pincode: formData.pincode || '000000',
            googleReviewUrl: formData.googleReviewUrl || 'https://maps.google.com',
            googleMapsShareUrl: formData.googleMapsShareUrl || undefined,
            description: formData.description,
            openingHours: formData.openingHours,
            questions: formData.questions,
            planSlug: formData.planSlug || 'starter',
          });

          targetBiz = setupRes.business;
          targetQR = setupRes.firstQRSlug;
          trialPlan = setupRes.trialPlan;

          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
          setTrialPlanData(trialPlan);
        } catch (setupErr: any) {
          // If setup fails and account wasn't pre-created (e.g. offline form with password), fallback to register
          if (!isAccountCreated && formData.password) {
            const regRes = await api.register({
              email: formData.email,
              password: formData.password,
              ownerName: formData.ownerName,
              businessName: formData.businessName.trim(),
              mainCategory: formData.mainCategory || 'FOOD & HOSPITALITY',
              subcategory: formData.subcategory || 'General',
              customCategory: formData.customCategory || undefined,
              phone: (formData.phone || '').trim(),
              address: formData.address || 'Central Address',
              city: formData.city || 'Metropolis',
              state: formData.state || 'State',
              country: formData.country || 'India',
              pincode: formData.pincode || '000000',
              googleReviewUrl: formData.googleReviewUrl || 'https://maps.google.com',
              googleMapsShareUrl: formData.googleMapsShareUrl || undefined,
              description: formData.description,
              openingHours: formData.openingHours,
              questions: formData.questions,
              planSlug: formData.planSlug || 'starter',
            });

            targetBiz = regRes.business;
            targetQR = regRes.firstQRSlug;
            trialPlan = regRes.trialPlan;

            setCreatedBusiness(targetBiz);
            setFirstQRSlug(targetQR);
            setTrialPlanData(trialPlan);
          } else {
            throw setupErr;
          }
        }
      }

      const starterPlan = plans.find((p) => p.slug === 'starter') || plans[0];
      const trialPlanId = starterPlan?.id || 'c0000000-0000-0000-0000-000000000002';

      // 2. Create Razorpay Order and ensure Razorpay SDK is loaded
      const [order, isLoaded] = await Promise.all([
        api.createOrder(targetBiz.id, trialPlanId, { isTrial: true }),
        loadRazorpay(),
      ]);

      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay checkout script failed to load. Please check your connection and retry.');
      }

      // 3. Open Razorpay Checkout Modal (Supports UPI Autopay Mandates & Direct Orders)
      const isSub = Boolean(order.subscriptionId || order.isSubscription);
      const options: any = {
        key: order.keyId,
        currency: order.currency || 'INR',
        name: 'KindlyRate Platform',
        description: isSub
          ? 'Testing Pack (₹79 Starter Trial · Monthly UPI Autopay)'
          : 'Testing Pack (₹79 Starter Trial)',
        prefill: {
          name: formData.ownerName,
          email: formData.email,
          contact: (formData.phone || '').replace(/[^0-9]/g, '').slice(-10),
        },
        theme: {
          color: '#00383B',
        },
        handler: async (resp: any) => {
          try {
            setLoading(true);
            await api.verifyPayment(targetBiz.id, {
              orderId: resp.razorpay_subscription_id || resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
              subscriptionId: resp.razorpay_subscription_id,
            });
            window.history.pushState({}, '', '/thank-you');
            try {
              if (typeof window !== 'undefined') {
                const win = window as any;
                if (win.gtag) {
                  win.gtag('event', 'conversion', {
                    send_to: 'AW-18507163783',
                    value: 79.0,
                    currency: 'INR',
                    transaction_id: resp.razorpay_payment_id || resp.razorpay_order_id,
                  });
                }
              }
            } catch {}
            setStep(8); // Step 8: Welcome - ONLY after successful payment verification!
          } catch (vErr: any) {
            setError(`Trial payment verification note: ${vErr.message || 'Verification failed'}`);
            setPaymentFailed(true);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentFailed(true);
            setPaymentNote(
              'Payment attempt was dismissed. You can retry with any UPI Autopay, Google Pay, PhonePe, or Card option below, or continue to your dashboard.'
            );
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
      rzp.on('payment.failed', (fResp: any) => {
        setPaymentFailed(true);
        setPaymentNote(
          `Payment note: ${fResp.error?.description || 'Payment was unsuccessful'}. You can retry anytime with UPI / Card.`
        );
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. You can retry below.');
      setPaymentFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Direct Full Plan Payment (Skip Trial) with Recurring Mandate
  const handleDirectPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentNote(null);

      let targetBiz = createdBusiness;
      let targetQR = firstQRSlug;

      if (!targetBiz) {
        if (!formData.businessName || !formData.businessName.trim()) {
          setError('Please provide your business name.');
          setStep(3);
          return;
        }

        try {
          const setupRes = await api.setupBusiness({
            businessName: formData.businessName.trim(),
            mainCategory: formData.mainCategory || 'FOOD & HOSPITALITY',
            subcategory: formData.subcategory || 'General',
            customCategory: formData.customCategory || undefined,
            phone: (formData.phone || '').trim(),
            address: formData.address || 'Central Address',
            city: formData.city || 'Metropolis',
            state: formData.state || 'State',
            country: formData.country || 'India',
            pincode: formData.pincode || '000000',
            googleReviewUrl: formData.googleReviewUrl || 'https://maps.google.com',
            googleMapsShareUrl: formData.googleMapsShareUrl || undefined,
            description: formData.description,
            openingHours: formData.openingHours,
            questions: formData.questions,
            planSlug: formData.planSlug || 'starter',
          });

          targetBiz = setupRes.business;
          targetQR = setupRes.firstQRSlug;
          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
        } catch (setupErr: any) {
          if (!isAccountCreated && formData.password) {
            const regRes = await api.register({
              email: formData.email,
              password: formData.password,
              ownerName: formData.ownerName,
              businessName: formData.businessName.trim(),
              mainCategory: formData.mainCategory || 'FOOD & HOSPITALITY',
              subcategory: formData.subcategory || 'General',
              customCategory: formData.customCategory || undefined,
              phone: (formData.phone || '').trim(),
              address: formData.address || 'Central Address',
              city: formData.city || 'Metropolis',
              state: formData.state || 'State',
              country: formData.country || 'India',
              pincode: formData.pincode || '000000',
              googleReviewUrl: formData.googleReviewUrl || 'https://maps.google.com',
              googleMapsShareUrl: formData.googleMapsShareUrl || undefined,
              description: formData.description,
              openingHours: formData.openingHours,
              questions: formData.questions,
              planSlug: formData.planSlug || 'starter',
            });

            targetBiz = regRes.business;
            targetQR = regRes.firstQRSlug;
            setCreatedBusiness(targetBiz);
            setFirstQRSlug(targetQR);
          } else {
            throw setupErr;
          }
        }
      }

      const selectedPlan =
        plans.find((p) => p.slug === formData.planSlug) ||
        plans.find((p) => p.slug === 'growth') ||
        plans[0];
      const dur = onboardingPlanDurations[selectedPlan.id] || 12;

      // Create Razorpay Order for Direct Subscription and ensure Razorpay SDK is loaded
      const [order, isLoaded] = await Promise.all([
        api.createOrder(targetBiz.id, selectedPlan.id, {
          durationMonths: dur,
          isTrial: false,
          autoRenew: autoRenewDirect,
        }),
        loadRazorpay(),
      ]);

      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay checkout script failed to load. Please check your connection and retry.');
      }

      const isSub = Boolean(order.subscriptionId || order.isSubscription);
      const options: any = {
        key: order.keyId,
        currency: order.currency || 'INR',
        name: 'KindlyRate Platform',
        description: isSub
          ? `${selectedPlan.name} · ${
              dur === 12
                ? '1-Year Autopay (2 Mos Free)'
                : dur === 6
                ? '6-Month Autopay'
                : dur === 3
                ? '3-Month Autopay'
                : 'Monthly UPI Autopay'
            }`
          : `${selectedPlan.name} (${dur} Month${dur > 1 ? 's' : ''})`,
        prefill: {
          name: formData.ownerName,
          email: formData.email,
          contact: (formData.phone || '').replace(/[^0-9]/g, '').slice(-10),
        },
        theme: {
          color: '#00383B',
        },
        handler: async (resp: any) => {
          try {
            setLoading(true);
            await api.verifyPayment(targetBiz.id, {
              orderId: resp.razorpay_subscription_id || resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
              subscriptionId: resp.razorpay_subscription_id,
            });
            window.history.pushState({}, '', '/thank-you');
            try {
              if (typeof window !== 'undefined') {
                const win = window as any;
                if (win.gtag) {
                  win.gtag('event', 'conversion', {
                    send_to: 'AW-18507163783',
                    value: 79.0,
                    currency: 'INR',
                    transaction_id: resp.razorpay_payment_id || resp.razorpay_order_id,
                  });
                }
              }
            } catch {}
            setStep(8); // Step 8: Welcome - ONLY after successful payment verification!
          } catch (vErr: any) {
            setError(`Payment verification note: ${vErr.message || 'Signature mismatch'}`);
            setPaymentFailed(true);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentFailed(true);
            setPaymentNote(
              'Payment attempt was dismissed. You can retry with any UPI Autopay, Google Pay, PhonePe, or Card option below, or continue to your dashboard.'
            );
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
      rzp.on('payment.failed', (fResp: any) => {
        setPaymentFailed(true);
        setPaymentNote(
          `Payment failed: ${fResp.error?.description || 'Payment was unsuccessful'}. You can retry anytime with UPI / Card.`
        );
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. You can retry below.');
      setPaymentFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      {/* Top Navigation Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={onNavigateHome || onNavigateLogin}
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back
        </button>
        <KindlyRateLogo height={32} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {step <= 3 ? (
            <>Step <strong>{step}</strong> of 3</>
          ) : (
            <>Plan Activation</>
          )}
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
          {step <= 3 ? `Step ${step} of 3` : 'Plan Activation'}
        </span>
        <h1 className="serif serif-h1" style={{ fontSize: '28px', lineHeight: 1.25 }}>
          {step === 1 && 'Create Your Free Account'}
          {step === 2 && 'Name Your Store & Business'}
          {step === 3 && 'How KindlyRate Works · Your Store is Ready!'}
          {step === 6 && 'Select Your Subscription Plan'}
          {step === 7 && 'Confirm Activation & Payment'}
          {step > 7 && 'Onboarding Complete!'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          {step === 1 ? (
            <>
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                Sign in here
              </a>
            </>
          ) : step === 2 ? (
            'Fast 15-second setup. You can add your Google Maps link and customize details anytime inside your dashboard.'
          ) : step === 3 ? (
            `Congratulations! Your business is active. Here is how your smart review system works:`
          ) : (
            `Signed in as ${formData.ownerName || formData.email || 'Business Owner'}`
          )}
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="wizard-card">
        {/* STEP 1: Account Login Credentials & Signup */}
        {step === 1 && (
          <div>
            {!isAccountCreated && (
              <div style={{ display: 'flex', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px', marginBottom: '22px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    cursor: 'default',
                  }}
                >
                  🚀 Sign Up Free
                </button>
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  🔑 Have an account? Sign In
                </button>
              </div>
            )}
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              First, create your business login credentials. Your account is activated immediately so you can access your dashboard anytime on mobile or desktop.
            </p>

            {isAccountCreated && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '14.5px' }}>
                    ✓ Account Active & Signed In
                  </div>
                  <div style={{ fontSize: '13px', color: '#15803d', marginTop: '3px' }}>
                    Logged in as <strong>{formData.ownerName}</strong> ({formData.email})
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setStep(2)}
                  style={{ fontSize: '13px' }}
                >
                  Continue to Business Details →
                </button>
              </div>
            )}

            {/* Email Exists Inline Login Box */}
            {emailExistsNotice && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1.5px solid #fcd34d',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} /> Account with this email already exists
                </div>
                <p style={{ fontSize: '13px', color: '#b45309', margin: '0 0 14px' }}>
                  Enter your password below to sign in and continue setting up your business without losing progress:
                </p>
                <form onSubmit={handleInlineLogin} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your account password"
                      value={inlinePassword}
                      onChange={(e) => setInlinePassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={inlineLoginLoading}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {inlineLoginLoading ? 'Signing In...' : 'Sign In & Continue →'}
                  </button>
                </form>

                <div style={{ margin: '14px 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#fde68a' }}></div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#92400e', fontWeight: 700 }}>
                    Or if you signed in with Google
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#fde68a' }}></div>
                </div>

                <div>
                  <GoogleAuthButton
                    label="Continue with Google"
                    flow="onboarding"
                    onSuccess={(res) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        ownerName: res.user.name || prev.ownerName,
                        email: res.user.email || prev.email,
                        phone: res.user.phone || prev.phone || '',
                      }));
                      setIsAccountCreated(true);
                      setIsEmailVerified(true);
                      if (res.businesses && res.businesses.length > 0) {
                        setCreatedBusiness(res.businesses[0]);
                      }
                      setStep(2);
                    }}
                    onError={(err) => setError(err)}
                    disabled={loading}
                  />
                </div>

                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b45309',
                      fontSize: '12.5px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {/* Email OTP Verification View */}
            {showOtpVerification && (
              <div
                style={{
                  background: 'var(--surface-container, #ffffff)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  padding: '28px',
                  marginTop: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Mail size={36} color="var(--primary)" />
                </div>
                <h3 className="serif" style={{ fontSize: '22px', marginBottom: '8px' }}>
                  Verify Your Email Address
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                  We sent a 6-digit confirmation code to <strong>{formData.email}</strong>.
                  <br />
                  Enter the code below to verify your email and activate your account.
                </p>

                {otpError && (
                  <div className="alert alert-error" style={{ marginBottom: '20px', fontSize: '13px', padding: '10px 14px' }}>
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#15803d',
                      fontWeight: 600,
                      fontSize: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    ✓ Email Successfully Verified! Moving to business details...
                  </div>
                )}

                <div
                  onPaste={handleOtpPaste}
                  className="otp-digits-container"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    width: '100%',
                    maxWidth: '340px',
                    margin: '0 auto 20px',
                  }}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={otpLoading || otpSuccess}
                      className="otp-digit-input"
                      style={{
                        border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      }}
                    />
                  ))}
                </div>

                {signupDevOtp && (
                  <div
                    onClick={handleFillDevOtp}
                    style={{
                      background: '#eff6ff',
                      border: '1px dashed #3b82f6',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '20px',
                      fontSize: '12.5px',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    title="Click to automatically fill code"
                  >
                    <Terminal size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    <strong>Development Mode:</strong> Your code is{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
                      {signupDevOtp}
                    </span>{' '}
                    <span style={{ textDecoration: 'underline' }}>(Click to auto-fill)</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={otpLoading || otpSuccess || otpDigits.some((d) => !d)}
                    onClick={() => handleVerifyOtp()}
                    style={{ minWidth: '180px' }}
                  >
                    {otpLoading ? 'Verifying...' : otpSuccess ? '✓ Verified' : 'Verify Email & Continue →'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '13px' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpResending || otpCooldown > 0 || otpSuccess}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: otpCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                      cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {otpResending
                      ? 'Sending code...'
                      : otpCooldown > 0
                      ? `Resend code in ${otpCooldown}s`
                      : 'Resend Verification Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerification(false);
                      setStep(2);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Skip for now & verify later →
                  </button>
                </div>
              </div>
            )}

            {!isAccountCreated && !showOtpVerification && (
              <>
                {/* 1-Click Google Sign Up */}
                <div style={{ marginBottom: '18px' }}>
                  <GoogleAuthButton
                    label="Sign up / Continue with Google"
                    flow="onboarding"
                    onSuccess={(res) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        ownerName: res.user.name || prev.ownerName,
                        email: res.user.email || prev.email,
                        phone: res.user.phone || prev.phone || '',
                      }));
                      setIsAccountCreated(true);
                      setIsEmailVerified(true);
                      if (res.businesses && res.businesses.length > 0) {
                        setCreatedBusiness(res.businesses[0]);
                      }
                      setStep(2);
                    }}
                    onError={(err) => setError(err)}
                    disabled={loading}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    or create with email & password
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <form onSubmit={handleAccountSubmit}>
                <div className="form-grid-responsive">
                  <div className="form-group">
                    <label className="form-label">Full Name (Owner / Manager) *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="owner@mybusiness.com"
                      value={formData.email}
                      onChange={(e) => {
                        setEmailExistsNotice(false);
                        setFormData({ ...formData, email: e.target.value });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Password (8+ characters) *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        style={{ paddingRight: '45px' }}
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
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted)',
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <PhoneInput
                      label="Mobile Phone Number"
                      required
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      defaultCountryCode="IN"
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-container)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                    marginTop: '20px',
                  }}
                >
                  <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> <strong>Bank-grade encryption:</strong> Your credentials are encrypted with bcrypt salt hashing. Next, you will configure your business profile and review questions.
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg mobile-btn-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span> Creating Account...
                      </>
                    ) : (
                      'Create Account & Continue →'
                    )}
                  </button>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    By creating an account, you agree to KindlyRate's{' '}
                    <button
                      type="button"
                      onClick={() => setLegalModal('terms')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '11.5px', fontWeight: 500 }}
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setLegalModal('privacy')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '11.5px', fontWeight: 500 }}
                    >
                      Privacy Policy
                    </button>.
                  </div>
                </div>
              </form>
            </>
          )}
          </div>
        )}

        {/* STEP 2: Fast Store Setup (Store Name & Category only, zero friction!) */}
        {step === 2 && (
          <div>
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Business or Store Name *
              </label>
              <input
                className="form-input"
                style={{ fontSize: '16px', padding: '12px 14px', borderRadius: '10px' }}
                placeholder="e.g. Royal Spice Bistro, Sharma Electronics, or Apex Clinic"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                autoFocus
              />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter the name your customers know you by.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                Select Your Business Industry
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'FOOD & HOSPITALITY', label: '🍽️ Food & Dining', desc: 'Cafes, Restaurants, Bakeries' },
                  { key: 'RETAIL', label: '🛍️ Retail Store', desc: 'Clothing, Electronics, Grocery' },
                  { key: 'HEALTH & WELLNESS', label: '🩺 Clinic & Health', desc: 'Doctors, Salons, Spas' },
                  { key: 'SERVICES', label: '💼 Services & Repair', desc: 'Auto, Technicians, Agencies' },
                  { key: 'OTHER', label: '🏢 Other Business', desc: 'Showrooms, Specialty shops' },
                ].map((cat) => {
                  const isSelected = formData.mainCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, mainCategory: cat.key, subcategory: cat.desc.split(',')[0].trim() })}
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: isSelected ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: isSelected ? 'var(--primary)' : 'var(--text)' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                Business Mobile Phone (Optional)
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210 (Optional for alerts)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Reassuring Zero-Friction Trust Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '26px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '24px' }}>🛡️</div>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                <strong>Zero complex setup:</strong> You do <em>not</em> need your Google Maps link or store address right now. We will generate your instant QR stand immediately, and you can connect Google Maps inside your dashboard whenever you are ready!
              </div>
            </div>

            {/* Single Large Submit Button */}
            <div>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || !formData.businessName?.trim()}
                onClick={handleNext}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(154, 64, 24, 0.35)',
                  borderRadius: '12px',
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Creating Your Store &amp; Stand...
                  </>
                ) : (
                  '🚀 Create My Store & Get My QR Stand →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Software Flow Explanation & Launch Screen */}
        {step === 3 && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  color: '#166534',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                ✓ Store Created &amp; Smart QR Stand Generated!
              </div>
              <h2 className="serif" style={{ fontSize: '26px', fontWeight: 700, margin: '4px 0 8px', color: '#0f172a' }}>
                How KindlyRate Works for {formData.businessName || 'Your Business'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '640px', margin: '0 auto' }}>
                Your smart QR stand is live. Here is the exact 15-second customer flow that turns walk-ins into top-ranking Google reviews:
              </p>
            </div>

            {/* 3 Step Cards Flow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {/* Card 1 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a' }}>Place Your Smart Stand</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>No app download needed</div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Place your printed or acrylic QR stand on your billing counter, reception, or tables. Customers scan it with their phone camera in 3 seconds.
                </p>
              </div>

              {/* Card 2 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a' }}>AI Generates 5-Star Reviews</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>No typing required</div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Customers answer 2 quick rating questions. Server-side Gemini AI instantly writes an authentic, glowing 5-star review tailored to your store.
                </p>
              </div>

              {/* Card 3 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a' }}>1-Tap Post &amp; Shield</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>100% Reputation Shield</div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Happy customers post directly to Google Maps in 1 tap, pushing you to #1 on search. Unhappy feedback stays private with you to protect your rating!
                </p>
              </div>
            </div>

            {/* Note about adding Google Maps link */}
            <div
              style={{
                background: '#fffaf5',
                border: '1.5px solid #fed7aa',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '26px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '26px' }}>📍</div>
              <div>
                <strong style={{ color: '#9a3412', fontSize: '14px', display: 'block', marginBottom: '2px' }}>
                  Next Step: Connect Your Google Maps Link Inside Dashboard
                </strong>
                <span style={{ fontSize: '13px', color: '#7c2d12' }}>
                  Your dashboard is ready right now! Whenever you're ready, paste your Google Maps link inside your dashboard so customer reviews link directly to your business listing.
                </span>
              </div>
            </div>

            {/* Main Action Hub */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onComplete(createdBusiness)}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(154, 64, 24, 0.35)',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🎉 Enter My Dashboard &amp; View My QR Stand →</span>
              </button>

              {firstQRSlug && (
                <a
                  href={`/r/${firstQRSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-lg"
                  style={{
                    padding: '14px 22px',
                    fontSize: '15px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                  }}
                >
                  <span>📱 Test QR Flow on Phone ↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review Questions & Tone */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600 }}>Customize 5-Star Rating Questions</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Pre-configured for <strong>{formData.subcategory}</strong>. You can remove unwanted criteria or add your own custom questions.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const newQ = {
                    questionKey: `custom_${Date.now()}`,
                    label: 'New Customer Criterion',
                    scaleType: '1-5_STARS',
                    displayOrder: formData.questions.length,
                  };
                  setFormData({ ...formData, questions: [...formData.questions, newQ] });
                }}
                style={{ fontSize: '13px', padding: '6px 14px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                + Add Custom Question
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {formData.questions.map((q: any, idx: number) => (
                <div
                  key={q.questionKey || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>{idx + 1}.</span>
                  <input
                    className="form-input"
                    style={{ flex: 1, padding: '8px 12px' }}
                    value={q.label}
                    placeholder="e.g. Food Taste, Cleanliness, Service..."
                    onChange={(e) => {
                      const updated = [...formData.questions];
                      updated[idx].label = e.target.value;
                      setFormData({ ...formData, questions: updated });
                    }}
                  />
                  <span className="badge badge-primary" style={{ whiteSpace: 'nowrap' }}>1–5 Stars</span>
                  <button
                    type="button"
                    title="Remove Question"
                    onClick={() => {
                      if (formData.questions.length <= 1) {
                        alert('Your review flow needs at least 1 rating question.');
                        return;
                      }
                      const filtered = formData.questions.filter((_: any, i: number) => i !== idx);
                      setFormData({ ...formData, questions: filtered });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--error)')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-subtle)')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="form-grid-responsive" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Desired Review Tone</label>
                <select
                  className="form-select"
                  value={formData.reviewTone}
                  onChange={(e) => setFormData({ ...formData, reviewTone: e.target.value })}
                >
                  <option value="enthusiastic">Enthusiastic & Warm</option>
                  <option value="professional">Professional & Polished</option>
                  <option value="casual">Casual & Friendly</option>
                  <option value="concise">Concise & Direct</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Review Length</label>
                <select
                  className="form-select"
                  value={formData.reviewLength}
                  onChange={(e) => setFormData({ ...formData, reviewLength: e.target.value })}
                >
                  <option value="short">Short (1-2 sentences)</option>
                  <option value="medium">Medium (3-4 sentences)</option>
                  <option value="detailed">Detailed (5+ sentences)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Google Review URL & Google Maps Share Link */}
        {step === 5 && (
          <div>
            {/* Visual 3-Step Guide */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} color="var(--primary)" />
                <span>How to get your Google Maps Link (takes 10 seconds):</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px', color: '#475569' }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>1. Open Maps</strong>
                  <span>Open Google Maps app or site on phone/laptop.</span>
                </div>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>2. Search Business</strong>
                  <span>Search <strong>{formData.businessName || 'Your Store'}</strong>.</span>
                </div>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>3. Tap "Share"</strong>
                  <span>Tap "Share" ➔ "Copy link" (e.g. <code>maps.app.goo.gl/...</code>) &amp; paste below!</span>
                </div>
              </div>
            </div>

            {/* 1. Google Maps Share Link Converter */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px', border: '1.5px dashed var(--primary)', background: '#fffcfb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Link2 size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>Paste Any Google Maps Share Link</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Copy from Google Maps app (e.g. <code>https://maps.app.goo.gl/...</code>) or browser URL
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '6px' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="https://maps.app.goo.gl/... or https://goo.gl/maps/..."
                    value={formData.googleMapsShareUrl || ''}
                    onChange={(e) => setFormData({ ...formData, googleMapsShareUrl: e.target.value })}
                  />
                  {typeof navigator !== 'undefined' && (
                    <button
                      type="button"
                      onClick={handlePasteOnboardingMapsLink}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '0 12px', whiteSpace: 'nowrap' }}
                      title="Paste URL directly from clipboard"
                    >
                      📋 Paste
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={convertingMapsUrl || !formData.googleMapsShareUrl?.trim()}
                  onClick={handleConvertOnboardingMapsLink}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 18px' }}
                >
                  {convertingMapsUrl ? (
                    <>
                      <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                      <span>Resolving...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Convert to Review Link</span>
                    </>
                  )}
                </button>
              </div>

              {mapsConvertSuccess && (
                <div
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#166534" />
                    <span>{mapsConvertSuccess}</span>
                  </div>
                  {formData.googleReviewUrl && (
                    <a
                      href={formData.googleReviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '11.5px', padding: '4px 12px', textDecoration: 'none' }}
                    >
                      Test My Review Link ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* 2. Direct Review Link (Editable & Testable) */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Direct Google 5-Star Review Submission URL *
                </label>
                {formData.googleReviewUrl && (
                  <a
                    href={formData.googleReviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '3px 10px', height: 'auto', textDecoration: 'none' }}
                  >
                    Test Link ↗
                  </a>
                )}
              </div>
              <input
                className="form-input"
                placeholder="https://search.google.com/local/writereview?placeid=... or ?cid=..."
                value={formData.googleReviewUrl}
                onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You can freely edit or test this URL. When guests scan your table stand, this link immediately opens Google's 5-star review modal.
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-container)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              <Lightbulb size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> <strong>Tips for your Google review link:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Paste your standard Google Maps share link above and click <strong>Convert to Review Link</strong>.</li>
                <li>Or go to Google Maps on desktop, search your business, and click <strong>Ask for reviews</strong>.</li>
                <li>You can freely update this link anytime later in your Business Settings!</li>
              </ol>
            </div>

            {/* Skip for now option for mobile users */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    googleReviewUrl: prev.googleReviewUrl || 'https://maps.google.com',
                  }));
                  setStep(6);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '6px 12px',
                }}
              >
                Don't have your Google Maps link handy right now? Skip for now &amp; add later in dashboard →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Plans */}
        {step === 6 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <span className="stat-pill stat-pill-primary" style={{ marginBottom: '8px' }}>
                7-Day Free Trial Available for ₹2
              </span>
              <h3 className="serif" style={{ fontSize: '24px', fontWeight: 600, marginTop: '6px' }}>
                Select Your Post-Trial Monthly Pack
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '580px', margin: '4px auto 0' }}>
                You will start with the <strong>7-Day Trial for only ₹2</strong>. Select which plan you want to continue with after your trial ends:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {plans
                .filter((p) => p.slug !== 'trial')
                .map((p) => {
                  const isSelected = formData.planSlug === p.slug;
                  const dur = onboardingPlanDurations[p.id] || 12;

                  let activePrice = p.priceInr;
                  let origPrice = p.originalPriceInr || Math.round(p.priceInr * 1.5);
                  let subLabel = '/ month';
                  let reviewsDisplay = `${p.reviewGenerationLimit.toLocaleString()} Monthly Reviews`;
                  let tag = p.offerBadge || 'First Month Offer';

                  if (dur === 3) {
                    activePrice = p.priceInr3Months || p.priceInr * 3;
                    origPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 3;
                    subLabel = `for 3 mos (₹${Math.round(activePrice / 3)}/mo)`;
                    reviewsDisplay = `${(p.reviewGenerationLimit * 3).toLocaleString()} Total Reviews (Quarterly)`;
                    tag = 'Quarterly Pack';
                  } else if (dur === 6) {
                    activePrice = p.priceInr6Months || p.priceInr * 6;
                    origPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 6;
                    subLabel = `for 6 mos (₹${Math.round(activePrice / 6)}/mo)`;
                    reviewsDisplay = `${(p.reviewGenerationLimit * 6).toLocaleString()} Total Reviews (Semi-Annual)`;
                    tag = 'Semi-Annual Pack';
                  } else if (dur === 12) {
                    // 1 Year Pack: 2 Months Free discount!
                    activePrice = p.priceInr1Year || (p.priceInr * 10);
                    origPrice = (p.originalPriceInr || Math.round(p.priceInr * 1.5)) * 12;
                    subLabel = `for 1 yr (₹${Math.round(activePrice / 12)}/mo)`;
                    reviewsDisplay = `${(p.reviewGenerationLimit * 12).toLocaleString()} Total Reviews (1-Year Pass)`;
                    tag = '2 Months Free Applied!';
                  }

                  return (
                    <div
                      key={p.slug}
                      onClick={() => setFormData({ ...formData, planSlug: p.slug })}
                      style={{
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '22px 18px',
                        background: isSelected ? '#fffcfb' : 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 16px rgba(154, 64, 24, 0.12)' : 'none',
                      }}
                    >
                      {p.slug === 'growth' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '16px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                          }}
                        >
                          MOST POPULAR
                        </div>
                      )}

                      {/* Header with Title and Month Duration Selector in Right Upper Container */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                            {tag}
                          </div>
                        </div>

                        {/* In right upper of container: Select Months */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}
                        >
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.4px' }}>
                            Select Months
                          </span>
                          <div style={{ display: 'inline-flex', background: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            {[
                              { m: 1 as const, lbl: '1M' },
                              { m: 3 as const, lbl: '3M' },
                              { m: 6 as const, lbl: '6M' },
                              { m: 12 as const, lbl: '1Y (2M Free)' },
                            ].map((tab) => (
                              <button
                                key={tab.m}
                                type="button"
                                onClick={() => setOnboardingPlanDurations((prev) => ({ ...prev, [p.id]: tab.m }))}
                                style={{
                                  background: dur === tab.m ? 'var(--primary)' : 'transparent',
                                  color: dur === tab.m ? '#ffffff' : 'var(--text)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '10.5px',
                                  fontWeight: dur === tab.m ? 700 : 500,
                                  padding: '2px 6px',
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

                      <div style={{ margin: '8px 0 12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{activePrice}
                        </span>
                        {origPrice && origPrice > activePrice && (
                          <span style={{ fontSize: '15px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{origPrice}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subLabel}</span>
                      </div>

                      {dur === 12 && (
                        <div style={{ fontSize: '11px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '5px 8px', borderRadius: '6px', marginBottom: '10px', fontWeight: 600 }}>
                          1-Year Pack: 2 Months Free Discount Applied!
                        </div>
                      )}

                      <ul style={{ listStyle: 'none', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviewsDisplay}</li>
                        <li>✓ {p.qrCodeLimit} Smart QR Stands</li>
                        <li>✓ Full Funnel Conversion Tracking</li>
                        <li>✓ Real-Time Analytics & Reputation Shield</li>
                      </ul>

                      <div style={{ marginTop: '16px' }}>
                        <button
                          type="button"
                          className={`btn btn-block ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{ fontSize: '13px', padding: '9px' }}
                        >
                          {isSelected ? '✓ Selected Pack' : 'Choose Pack'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* STEP 7: Payment Confirmation & Razorpay Activation (Autopay Direct Plan or Trial) */}
        {step === 7 && (() => {
          const selectedPlan =
            plans.find((p) => p.slug === formData.planSlug) ||
            plans.find((p) => p.slug === 'growth') ||
            plans[0];
          const dur = (selectedPlan && onboardingPlanDurations[selectedPlan.id]) || 12;
          let directPrice = selectedPlan ? selectedPlan.priceInr : 149;
          let durLabel = '12 Months (1 Year · 2 Mos Free!)';
          if (selectedPlan) {
            if (dur === 1) {
              directPrice = selectedPlan.priceInr;
              durLabel = '1 Month';
            } else if (dur === 3) {
              directPrice = selectedPlan.priceInr3Months || selectedPlan.priceInr * 3;
              durLabel = '3 Months (Quarterly)';
            } else if (dur === 6) {
              directPrice = selectedPlan.priceInr6Months || selectedPlan.priceInr * 6;
              durLabel = '6 Months (Semi-Annual)';
            } else if (dur === 12) {
              directPrice = selectedPlan.priceInr1Year || selectedPlan.priceInr * 10;
              durLabel = '1 Year (2 Mos Free Applied!)';
            }
          }

          return (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="stat-pill stat-pill-primary" style={{ marginBottom: '8px' }}>
                  Step 7: Plan Activation & Checkout
                </span>
                <h3 className="serif" style={{ fontSize: '26px', fontWeight: 600, marginTop: '6px' }}>
                  Activate Your KindlyRate Plan
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '580px', margin: '6px auto 0' }}>
                  Choose <strong>UPI Autopay Subscription (Recommended)</strong> with 1-Year discount, or start with the <strong>Testing Pack Trial for ₹79</strong>.
                </p>
              </div>

              {/* DUAL PAYMENT ROUTE SELECTOR TABS (OPTION A: AUTOPAY FIRST) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                  maxWidth: '560px',
                  margin: '0 auto 22px',
                }}
              >
                {/* OPTION A: AUTOPAY SUBSCRIPTION (FORCED FIRST OPTION) */}
                <div
                  onClick={() => setPaymentChoice('direct')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: paymentChoice === 'direct' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentChoice === 'direct' ? '#fffaf7' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: paymentChoice === 'direct' ? '0 4px 14px rgba(154, 64, 24, 0.12)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Option A · 🪔 Diwali Autopay (Recommended)
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>₹{directPrice}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
                    {selectedPlan?.name || 'Growth Pack'} · Autopay
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Instant activation · {durLabel}
                  </div>
                </div>

                {/* OPTION B: TESTING PACK STARTER TRIAL */}
                <div
                  onClick={() => setPaymentChoice('trial')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: paymentChoice === 'trial' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentChoice === 'trial' ? '#fffaf7' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: paymentChoice === 'trial' ? '0 4px 14px rgba(154, 64, 24, 0.1)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Option B · 🪔 Festive Pass
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)' }}>₹79</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
                    Testing Pack (Diwali Offer)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ₹79 starter pass · 100 reviews · 2 QRs
                  </div>
                </div>
              </div>

              {paymentNote && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    color: '#991b1b',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertTriangle size={18} color="#b91c1c" />
                  <div style={{ flex: 1 }}>{paymentNote}</div>
                </div>
              )}

              {/* OPTION A: TESTING PACK TRIAL CARD */}
              {paymentChoice === 'trial' ? (
                <div
                  className="card"
                  style={{
                    maxWidth: '520px',
                    margin: '0 auto 24px',
                    padding: '24px',
                    border: '1.5px solid var(--primary)',
                    background: '#fffcfb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
                        {formData.businessName || 'Your Business'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {formData.ownerName} · {formData.subcategory} ({formData.city || 'India'})
                      </div>
                    </div>
                    <span className="badge badge-success">Account Ready</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>Testing Pack (Starter Trial)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Full access + 100 reviews + 2 Smart QR Stands</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '24px' }}>₹79</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', fontSize: '13px' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Post-Trial Renewal Pack</div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                        {selectedPlan?.name || 'Growth Pack'} ({durLabel})
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '15px' }}>
                      ₹{directPrice}
                    </div>
                  </div>

                  <div style={{ marginTop: '18px', background: 'var(--surface-container)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Powered by Razorpay · UPI Autopay (Google Pay, PhonePe, Paytm), Cards · Instant activation
                  </div>
                </div>
              ) : (
                /* OPTION A: DIRECT FULL PLAN CARD WITH AUTOPAY & DURATION SELECTOR */
                <div
                  className="card"
                  style={{
                    maxWidth: '540px',
                    margin: '0 auto 24px',
                    padding: '24px',
                    border: '1.5px solid var(--primary)',
                    background: '#fffcfb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
                        {formData.businessName || 'Your Business'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        UPI Autopay Activation · {selectedPlan?.name}
                      </div>
                    </div>
                    <span className="badge badge-primary">Recommended</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{selectedPlan?.name}</div>
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>🪔 Diwali Offer</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Duration: {durLabel} · {selectedPlan?.reviewGenerationLimit} Monthly Reviews
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '26px' }}>₹{directPrice}</div>
                  </div>

                  {/* DURATION SWITCHER (DEFAULT 12M / 1 YEAR) */}
                  <div style={{ marginTop: '14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Plan Duration</span>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>1 Year includes 2 Months Free</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[
                        { m: 1 as const, lbl: '1 Month' },
                        { m: 3 as const, lbl: '3 Months' },
                        { m: 6 as const, lbl: '6 Months' },
                        { m: 12 as const, lbl: '1 Year (2M Free)' },
                      ].map((tab) => (
                        <button
                          key={tab.m}
                          type="button"
                          onClick={() => setOnboardingPlanDurations((prev) => ({ ...prev, [selectedPlan.id]: tab.m }))}
                          style={{
                            background: dur === tab.m ? 'var(--primary)' : 'var(--surface-container)',
                            color: dur === tab.m ? '#ffffff' : 'var(--text)',
                            border: dur === tab.m ? '1px solid var(--primary)' : '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: dur === tab.m ? 700 : 500,
                            padding: '8px 4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {tab.lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {dur === 12 && (
                    <div style={{ fontSize: '11.5px', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', marginTop: '10px', fontWeight: 600 }}>
                      ✓ 1-Year Pack: 2 Months Free Applied! Autopay renews annually.
                    </div>
                  )}

                  {/* RECURRING AUTO-RENEWAL TOGGLE / CHECKBOX */}
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      background: autoRenewDirect ? '#fef6ee' : 'var(--surface-container)',
                      border: autoRenewDirect ? '1.5px solid #fed7aa' : '1px solid var(--border)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="autoRenewDirect"
                      checked={autoRenewDirect}
                      onChange={(e) => setAutoRenewDirect(e.target.checked)}
                      style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <label htmlFor="autoRenewDirect" style={{ cursor: 'pointer', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                        Enable Recurring UPI Autopay
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: '2px' }}>
                        Seamless recurring renewals via Google Pay, PhonePe, Paytm, or Cards. You can cancel or pause anytime from your dashboard.
                      </div>
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', background: 'var(--surface-container)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Powered by Razorpay · UPI Autopay (Google Pay, PhonePe, Paytm), Cards · Instant activation
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  {paymentChoice === 'direct' ? (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleDirectPayment}
                      disabled={loading}
                      style={{ minWidth: '280px', fontSize: '15px', padding: '13px 24px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Opening UPI Autopay...
                        </>
                      ) : paymentFailed ? (
                        `Retry ₹${directPrice} Payment`
                      ) : (
                        `Pay ₹${directPrice} & Activate UPI Autopay`
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleTrialPayment}
                      disabled={loading}
                      style={{ minWidth: '280px', fontSize: '15px', padding: '13px 24px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Opening Checkout...
                        </>
                      ) : paymentFailed ? (
                        'Retry ₹79 Payment via Razorpay'
                      ) : (
                        'Pay ₹79 & Start Testing Pack Trial'
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={handleOpenDashboardDirectly}
                    disabled={loading}
                    style={{ minWidth: '220px', fontSize: '15px', padding: '13px 22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Open Dashboard First →
                  </button>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  You can enter your dashboard immediately to view your QR stands & telemetry, and manage payments anytime inside.
                </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                All charges in INR. By proceeding, you agree to KindlyRate's{' '}
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '11.5px', fontWeight: 500 }}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '11.5px', fontWeight: 500 }}
                >
                  Privacy Policy
                </button>.
              </div>
            </div>
          </div>
        );
      })()}

        {/* STEP 8: Success */}
        {step === 8 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h2 className="serif" style={{ fontSize: '28px', marginTop: '12px', marginBottom: '8px' }}>
              Welcome, {formData.businessName}!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Your account and multi-tenant environment have been successfully created.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setStep(9)}>
              View Your First Smart QR Code →
            </button>
          </div>
        )}

        {/* STEP 9: First QR Ready */}
        {step === 9 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <h2 className="serif" style={{ fontSize: '24px', marginBottom: '16px' }}>
              Your Smart QR Code is Ready
            </h2>
            <div
              style={{
                display: 'inline-block',
                padding: '24px',
                background: 'white',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
              }}
            >
              <img
                src={`/api/qrs/${firstQRSlug}/image?format=svg`}
                alt="QR Code"
                style={{ width: '220px', height: '220px' }}
              />
              <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600 }}>
                Main Counter QR
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <a
                href={`/api/qrs/${firstQRSlug}/image?format=png`}
                download
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download PNG
              </a>
              <a
                href={`/api/qrs/${firstQRSlug}/image?format=svg`}
                download
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download SVG
              </a>
              <button
                className="btn btn-primary"
                onClick={() => onComplete(createdBusiness)}
              >
                Open Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons for Optional Steps 4-6 */}
        {step > 3 && step < 7 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px',
            }}
          >
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              Next Step →
            </button>
          </div>
        )}
      </div>

      {legalModal && (
        <LegalModals type={legalModal} onClose={() => setLegalModal(null)} />
      )}

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={formData.email}
        onSuccessLogin={(user) => {
          setIsAccountCreated(true);
          setEmailExistsNotice(false);
          setShowForgotPassword(false);
          setFormData((prev: any) => ({
            ...prev,
            ownerName: user?.name || prev.ownerName,
          }));
          setStep(2);
        }}
      />
    </div>
  );
};
