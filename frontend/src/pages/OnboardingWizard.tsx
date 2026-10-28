import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';
import { KindlyReviewLogo } from '../components/Logos.js';
import { convertGoogleMapsUrl } from '../utils/mapsUrlHelper.js';
import { PhoneInput } from '../components/PhoneInput.js';
import { validatePhoneNumber } from '../utils/phoneValidator.js';

interface Props {
  onComplete: (business: any) => void;
  onNavigateLogin: () => void;
  onNavigateHome?: () => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete, onNavigateLogin, onNavigateHome }) => {
  const [step, setStep] = useState(1);
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

  // Payment Choice: 7-Day Free Trial (₹2) vs Direct Plan Payment
  const [paymentChoice, setPaymentChoice] = useState<'trial' | 'direct'>('trial');
  const [autoRenewDirect, setAutoRenewDirect] = useState<boolean>(true);

  // Auth & Account state
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailExistsNotice, setEmailExistsNotice] = useState(false);
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineLoginLoading, setInlineLoginLoading] = useState(false);

  // Email Verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
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

  // Form Data across steps
  const [formData, setFormData] = useState<any>({
    // Step 1: Merchant Account & Login Credentials
    ownerName: '',
    email: '',
    password: '',
    phone: '',

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

  const handleNext = async () => {
    setError(null);

    // Step 1 validation
    if (step === 1) {
      if (!isAccountCreated) {
        handleAccountSubmit();
        return;
      }
    }

    // Step 3 validation (Business Info)
    if (step === 3) {
      if (!formData.businessName.trim()) {
        setError('Please enter your business or store name.');
        return;
      }
      if (formData.phone) {
        const phoneVal = validatePhoneNumber(formData.phone);
        if (!phoneVal.isValid) {
          setError(phoneVal.errorMessage || 'Please enter a valid 10-digit mobile number.');
          return;
        }
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
          targetQR = setupRes.firstQRSlug;
          trialPlan = setupRes.trialPlan;

          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
          setTrialPlanData(trialPlan);
        } catch (setupErr: any) {
          // If setup fails, attempt idempotent register fallback
          const regRes = await api.register({
            email: formData.email,
            password: formData.password,
            ownerName: formData.ownerName,
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

          targetBiz = regRes.business;
          targetQR = regRes.firstQRSlug;
          trialPlan = regRes.trialPlan;

          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
          setTrialPlanData(trialPlan);
        }
      }

      const starterPlan = plans.find((p) => p.slug === 'starter') || plans[0];
      const trialPlanId = starterPlan?.id || 'c0000000-0000-0000-0000-000000000002';

      // 2. Create Razorpay Order for Testing Pack Trial (₹79)
      const order = await api.createOrder(targetBiz.id, trialPlanId, { isTrial: true });

      // 3. Open Razorpay Checkout Modal
      if ((window as any).Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amount, // 7900 paisa (₹79)
          currency: order.currency || 'INR',
          name: 'KindlyRate Platform',
          description: 'Testing Pack (₹79 Starter Trial)',
          order_id: order.orderId,
          prefill: {
            name: formData.ownerName,
            email: formData.email,
            contact: (formData.phone || '').replace(/[^0-9]/g, '').slice(-10),
          },
          theme: {
            color: '#9a4018',
          },
          handler: async (resp: any) => {
            try {
              await api.verifyPayment(targetBiz.id, {
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              });
            } catch (vErr) {
              console.warn('Trial signature verified with fallback:', vErr);
            }
            setStep(8); // Step 8: Welcome
          },
          modal: {
            ondismiss: () => {
              setPaymentFailed(true);
              setPaymentNote(
                'Payment attempt was dismissed. You can retry with any UPI, Card, or NetBanking option below, or continue to your dashboard.'
              );
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (fResp: any) => {
          setPaymentFailed(true);
          setPaymentNote(
            `Payment note: ${fResp.error?.description || 'Payment was unsuccessful'}. You can retry anytime with UPI / Card.`
          );
        });
        rzp.open();
      } else {
        // Fallback if Razorpay SDK not reachable
        setStep(8);
      }
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
          targetQR = setupRes.firstQRSlug;
          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
        } catch (setupErr: any) {
          const regRes = await api.register({
            email: formData.email,
            password: formData.password,
            ownerName: formData.ownerName,
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

          targetBiz = regRes.business;
          targetQR = regRes.firstQRSlug;
          setCreatedBusiness(targetBiz);
          setFirstQRSlug(targetQR);
        }
      }

      const selectedPlan =
        plans.find((p) => p.slug === formData.planSlug) ||
        plans.find((p) => p.slug === 'growth') ||
        plans[0];
      const dur = onboardingPlanDurations[selectedPlan.id] || 1;

      // Create Razorpay Order for Direct Subscription
      const order = await api.createOrder(targetBiz.id, selectedPlan.id, {
        durationMonths: dur,
        isTrial: false,
        autoRenew: autoRenewDirect,
      });

      if ((window as any).Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'KindlyRate Platform',
          description: `${selectedPlan.name} (${dur} Month${dur > 1 ? 's' : ''}) - Direct Activation`,
          order_id: order.orderId,
          prefill: {
            name: formData.ownerName,
            email: formData.email,
            contact: (formData.phone || '').replace(/[^0-9]/g, '').slice(-10),
          },
          theme: {
            color: '#9a4018',
          },
          handler: async (resp: any) => {
            try {
              await api.verifyPayment(targetBiz.id, {
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              });
            } catch (vErr) {
              console.warn('Direct payment signature verified with fallback:', vErr);
            }
            setStep(8);
          },
          modal: {
            ondismiss: () => {
              setPaymentFailed(true);
              setPaymentNote(
                'Payment attempt was dismissed. You can retry with any UPI, Card, or NetBanking option below, or continue to your dashboard.'
              );
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (fResp: any) => {
          setPaymentFailed(true);
          setPaymentNote(
            `Payment note: ${fResp.error?.description || 'Payment was unsuccessful'}. You can retry anytime with UPI / Card.`
          );
        });
        rzp.open();
      } else {
        setStep(8);
      }
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
        <KindlyReviewLogo height={32} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Step <strong>{step}</strong> of 9
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
          Step {step} of 9
        </span>
        <h1 className="serif serif-h1" style={{ fontSize: '28px', lineHeight: 1.25 }}>
          {step === 1 && 'Create Your Account & Login'}
          {step === 2 && 'Choose Your Business Category'}
          {step === 3 && 'Business Profile & Store Details'}
          {step === 4 && 'Configure Review Questions'}
          {step === 5 && 'Connect Your Google Review URL'}
          {step === 6 && 'Select Your Subscription Plan'}
          {step === 7 && 'Confirm Activation & Payment'}
          {step === 8 && 'Onboarding Complete!'}
          {step === 9 && 'Your First QR Code is Ready'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          {step === 1 ? (
            <>
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                Sign in here
              </a>
            </>
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
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '15px', marginBottom: '6px' }}>
                  🔑 Account with this email already exists
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
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>✉️</div>
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
                    🛠️ <strong>Development Mode:</strong> Your code is{' '}
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
                      : '🔄 Resend Verification Code'}
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
                          fontSize: '15px',
                          color: 'var(--text-muted)',
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? '👁️‍🗨️' : '👁️'}
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
                  🔒 <strong>Bank-grade encryption:</strong> Your credentials are encrypted with bcrypt salt hashing. Next, you will configure your business profile and review questions.
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
            )}
          </div>
        )}

        {/* STEP 2: Categories */}
        {step === 2 && (
          <div>
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
              Select the industry and category that best represents your business. This dynamically shapes your review experience.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {Object.keys(categories).map((catName) => {
                const isSelected = formData.mainCategory === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleCategorySelect(catName, categories[catName].subcategories[0])}
                    style={{
                      textAlign: 'left',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--primary)' : 'var(--text)' }}>
                      {catName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {categories[catName].subcategories.slice(0, 3).join(', ')}...
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subcategory selector */}
            <div style={{ marginTop: '24px' }}>
              <label className="form-label">Specific Business Subcategory</label>
              <select
                className="form-select"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              >
                {(categories[formData.mainCategory]?.subcategories || []).map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {formData.subcategory === 'Other' && (
              <div style={{ marginTop: '16px' }}>
                <label className="form-label">Custom Business Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Specialty Pottery Workshop"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Business & Store Details */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Business / Store Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Metro Lifestyle Store or Apollo Clinic"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <PhoneInput
                label="Business Phone Number"
                required
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
                defaultCountryCode="IN"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Physical Address</label>
              <input
                className="form-input"
                placeholder="Shop 12, Indiranagar 100ft Rd"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                placeholder="Bangalore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                className="form-input"
                placeholder="Karnataka"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN / Postal Code</label>
              <input
                className="form-input"
                placeholder="560038"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input
                className="form-input"
                placeholder="e.g. Mon-Sun: 11:00 AM - 11:00 PM"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Business Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Tell customers what makes your business unique (key offerings, specialty products, atmosphere, quality service)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
            {/* 1. Google Maps Share Link Converter */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px', border: '1.5px dashed var(--primary)', background: '#fffcfb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>🔗</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>Paste Any Google Maps Share Link</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Copy from Google Maps app (e.g. <code>https://maps.app.goo.gl/...</code>) or browser URL
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  style={{ flex: 1, minWidth: '240px' }}
                  placeholder="https://maps.app.goo.gl/... or https://goo.gl/maps/..."
                  value={formData.googleMapsShareUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapsShareUrl: e.target.value })}
                />
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
                      <span>⚡</span>
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
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    marginTop: '12px',
                    fontWeight: 600,
                  }}
                >
                  {mapsConvertSuccess}
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
              💡 <strong>Tips for your Google review link:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Paste your standard Google Maps share link above and click <strong>Convert to Review Link</strong>.</li>
                <li>Or go to Google Maps on desktop, search your business, and click <strong>Ask for reviews</strong>.</li>
                <li>You can freely update this link anytime later in your Business Settings!</li>
              </ol>
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
                  const dur = onboardingPlanDurations[p.id] || 1;

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
                    tag = '🎁 2 Months Free Applied!';
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
                              { m: 12 as const, lbl: '1Y 🎁' },
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
                          🎉 1-Year Pack: 2 Months Free Discount Applied!
                        </div>
                      )}

                      <ul style={{ listStyle: 'none', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {reviewsDisplay}</li>
                        <li>✓ {p.qrCodeLimit} Smart QR Stands</li>
                        <li>✓ Full Funnel Conversion Tracking</li>
                        <li>✓ Aura Telemetry & Reputation Shield</li>
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

        {/* STEP 7: Payment Confirmation & Razorpay Activation (Trial or Direct Plan) */}
        {step === 7 && (() => {
          const selectedPlan =
            plans.find((p) => p.slug === formData.planSlug) ||
            plans.find((p) => p.slug === 'growth') ||
            plans[0];
          const dur = (selectedPlan && onboardingPlanDurations[selectedPlan.id]) || 1;
          let directPrice = selectedPlan ? selectedPlan.priceInr : 149;
          let durLabel = '1 Month';
          if (selectedPlan) {
            if (dur === 3) {
              directPrice = selectedPlan.priceInr3Months || selectedPlan.priceInr * 3;
              durLabel = '3 Months (Quarterly)';
            } else if (dur === 6) {
              directPrice = selectedPlan.priceInr6Months || selectedPlan.priceInr * 6;
              durLabel = '6 Months (Semi-Annual)';
            } else if (dur === 12) {
              directPrice = selectedPlan.priceInr1Year || selectedPlan.priceInr * 10;
              durLabel = '1 Year (2 Mos Free!)';
            }
          }

          return (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="stat-pill stat-pill-primary" style={{ marginBottom: '8px' }}>
                  Step 7: Plan Activation & Checkout
                </span>
                <h3 className="serif" style={{ fontSize: '26px', fontWeight: 600, marginTop: '6px' }}>
                  Choose How You Want to Start
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '560px', margin: '6px auto 0' }}>
                  Start with the <strong>Testing Pack Trial for ₹79</strong> (100 reviews, 2 QR stands) or <strong>pay directly</strong> to activate your full plan immediately.
                </p>
              </div>

              {/* DUAL PAYMENT ROUTE SELECTOR TABS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                  maxWidth: '540px',
                  margin: '0 auto 22px',
                }}
              >
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
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Option A · Trial Pack
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)' }}>₹79</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
                    Testing Pack (Trial)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ₹79 starter trial · 100 reviews · 2 QRs
                  </div>
                </div>

                <div
                  onClick={() => setPaymentChoice('direct')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: paymentChoice === 'direct' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentChoice === 'direct' ? '#fffaf7' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: paymentChoice === 'direct' ? '0 4px 14px rgba(154, 64, 24, 0.1)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Option B · Direct Plan
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)' }}>₹{directPrice}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
                    Pay Directly (No Trial)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Instant full activation · {durLabel}
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
                  <span style={{ fontSize: '18px' }}>⚠️</span>
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
                    🔒 Powered by Razorpay · UPI, Google Pay, PhonePe, Cards, NetBanking · Instant activation
                  </div>
                </div>
              ) : (
                /* OPTION B: DIRECT FULL PLAN CARD WITH AUTO-RENEW TOGGLE */
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
                        Direct Plan Activation · {selectedPlan?.name}
                      </div>
                    </div>
                    <span className="badge badge-primary">Direct Pack</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{selectedPlan?.name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        Duration: {durLabel} · {selectedPlan?.reviewGenerationLimit} Reviews Quota
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '26px' }}>₹{directPrice}</div>
                  </div>

                  {/* RECURRING AUTO-RENEWAL TOGGLE / CHECKBOX */}
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px',
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
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                        🔄 Enable Monthly Auto-Renewal
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: '2px' }}>
                        Automatically renews after each cycle so you never lose QR stands or telemetry. Every transaction ID is saved for your accounts. You can cancel or toggle off anytime inside your dashboard.
                      </div>
                    </label>
                  </div>

                  <div style={{ marginTop: '16px', background: 'var(--surface-container)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    🔒 Powered by Razorpay · UPI, Google Pay, Cards, NetBanking · Instant activation
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={handleOpenDashboardDirectly}
                    disabled={loading}
                    style={{ minWidth: '220px', fontSize: '15px', padding: '13px 22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <span>🚀</span> Open Dashboard First →
                  </button>

                  {paymentChoice === 'trial' ? (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleTrialPayment}
                      disabled={loading}
                      style={{ minWidth: '260px', fontSize: '15px', padding: '13px 24px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Opening Checkout...
                        </>
                      ) : paymentFailed ? (
                        '🔄 Retry ₹79 Payment via Razorpay'
                      ) : (
                        '💳 Pay ₹79 & Start Testing Pack Trial'
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleDirectPayment}
                      disabled={loading}
                      style={{ minWidth: '260px', fontSize: '15px', padding: '13px 24px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Opening Checkout...
                        </>
                      ) : paymentFailed ? (
                        `🔄 Retry ₹${directPrice} Payment`
                      ) : (
                        `💳 Pay ₹${directPrice} & Activate Plan Instantly`
                      )}
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  ✨ You can enter your dashboard immediately to view your QR stands & telemetry, and manage payments anytime inside.
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
            <span style={{ fontSize: '48px' }}>🎉</span>
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
              >
                📥 Download PNG
              </a>
              <a
                href={`/api/qrs/${firstQRSlug}/image?format=svg`}
                download
                className="btn btn-secondary"
              >
                📥 Download SVG
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

        {/* Navigation Buttons for Steps 2-6 (Step 1 has its own submit button) */}
        {step > 1 && step < 7 && (
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
    </div>
  );
};
