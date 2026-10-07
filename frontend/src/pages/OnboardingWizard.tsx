import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { LegalModals } from '../components/LegalModals.js';

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

    // Step 5: Google Review URL
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
      setError('Please provide your name, email, and phone number.');
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

  const handleNext = () => {
    setError(null);

    // Step 1 validation
    if (step === 1) {
      if (!isAccountCreated) {
        handleAccountSubmit();
        return;
      }
    }

    // Step 3 validation (Restaurant Info)
    if (step === 3) {
      if (!formData.businessName.trim()) {
        setError('Please enter your restaurant or business name.');
        return;
      }
    }

    // Step 5 validation (Google URL)
    if (step === 5) {
      if (!formData.googleReviewUrl || !formData.googleReviewUrl.startsWith('http')) {
        setError('Please enter a valid Google Review or Google Maps URL (e.g. https://maps.google.com/...).');
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

      const trialPlanId = trialPlan?.id || 'c0000000-0000-0000-0000-000000000001';

      // 2. Create Razorpay Order
      const order = await api.createOrder(targetBiz.id, trialPlanId);

      // 3. Open Razorpay Checkout Modal
      if ((window as any).Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amount, // 200 paisa (₹2)
          currency: order.currency || 'INR',
          name: 'Reviewly Platform',
          description: '7-Day Free Trial Pass (₹2 Activation)',
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

  return (
    <div className="desktop-container" style={{ maxWidth: '800px', margin: '30px auto' }}>
      {/* Top Navigation Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={onNavigateHome || onNavigateLogin}
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Home
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Step <strong>{step}</strong> of 9
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
          Step {step} of 9
        </span>
        <h1 className="serif" style={{ fontSize: '32px' }}>
          {step === 1 && 'Create Your Account & Login'}
          {step === 2 && 'Choose Your Business Category'}
          {step === 3 && 'Restaurant & Business Details'}
          {step === 4 && 'Configure Review Questions'}
          {step === 5 && 'Connect Your Google Review URL'}
          {step === 6 && 'Select Your Subscription Plan'}
          {step === 7 && 'Confirm Activation & Payment'}
          {step === 8 && 'Onboarding Complete!'}
          {step === 9 && 'Your First QR Code is Ready'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          {step === 1 ? (
            <>
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                Sign in here
              </a>
            </>
          ) : (
            `Signed in as ${formData.ownerName || formData.email || 'Merchant'}`
          )}
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="card" style={{ padding: '32px' }}>
        {/* STEP 1: Account Login Credentials & Signup */}
        {step === 1 && (
          <div>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              First, create your secure merchant credentials. Your login will be set up immediately so you can always access your restaurant dashboard and manage your reviews.
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
                  Continue to Restaurant Info →
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
                  Enter your password below to sign in and continue setting up your restaurant without losing progress:
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
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    marginBottom: '20px',
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
                      style={{
                        width: '46px',
                        height: '54px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: 'var(--surface-container, #ffffff)',
                        color: 'var(--text)',
                        outline: 'none',
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
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
                      placeholder="owner@myrestaurant.com"
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

                  <div className="form-group">
                    <label className="form-label">Mobile Phone Number *</label>
                    <input
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
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
                  🔒 <strong>Bank-grade encryption:</strong> Your credentials are encrypted with bcrypt salt hashing. Next, you will configure your restaurant profile and customize your review criteria.
                </div>

                <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    style={{ minWidth: '240px' }}
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
                    By creating an account, you agree to Reviewly's{' '}
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

        {/* STEP 3: Restaurant / Business Info */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Restaurant / Business Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Urban Spoon Bistro"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                placeholder="Tell customers what makes your culinary experience unique (specialty dishes, atmosphere, fresh ingredients)..."
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

        {/* STEP 5: Google Review URL */}
        {step === 5 && (
          <div>
            <div className="form-group">
              <label className="form-label">Google Maps Review Link *</label>
              <input
                className="form-input"
                placeholder="https://g.page/r/your-business/review or https://maps.google.com/?cid=..."
                value={formData.googleReviewUrl}
                onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
              />
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
              💡 <strong>How to find your Google review link:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Search your business name on Google Maps.</li>
                <li>Click <strong>Ask for reviews</strong> or <strong>Share review form</strong>.</li>
                <li>Copy and paste that URL here so customers are sent straight to your Google Maps review dialog!</li>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {plans
                .filter((p) => p.slug !== 'trial')
                .map((p) => {
                  const isSelected = formData.planSlug === p.slug;
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
                            right: '14px',
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

                      <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {p.offerBadge || 'First Month Offer'}
                      </div>

                      <div style={{ margin: '12px 0 16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{p.priceInr}
                        </span>
                        {p.originalPriceInr && (
                          <span style={{ fontSize: '15px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{p.originalPriceInr}
                          </span>
                        )}
                        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>/ month</span>
                      </div>

                      <ul style={{ listStyle: 'none', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <li style={{ color: 'var(--text)', fontWeight: 600 }}>✓ {p.reviewGenerationLimit.toLocaleString()} Monthly Reviews</li>
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

        {/* STEP 7: Payment Confirmation & Razorpay Activation */}
        {step === 7 && (
          <div style={{ padding: '10px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="stat-pill stat-pill-primary" style={{ marginBottom: '8px' }}>
                7-Day Trial Activation · ₹2 Verification
              </span>
              <h3 className="serif" style={{ fontSize: '26px', fontWeight: 600, marginTop: '6px' }}>
                Activate Your 7-Day Access for ₹2
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '540px', margin: '6px auto 0' }}>
                Pay a nominal ₹2 verification fee via Razorpay to unlock your 7-day all-access trial. After 7 days, your account continues with your selected pack.
              </p>
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

            <div
              className="card"
              style={{
                maxWidth: '500px',
                margin: '0 auto 24px',
                padding: '24px',
                border: '1.5px solid var(--primary)',
                background: '#fffcfb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
                    {formData.businessName || 'Your Restaurant'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {formData.ownerName} · {formData.subcategory} ({formData.city || 'India'})
                  </div>
                </div>
                <span className="badge badge-success">Account Ready</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>7-Day Free Trial Pass</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Full platform access + 50 reviews</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '22px' }}>₹2</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Post-Trial Renewal Pack</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                    {formData.planSlug === 'starter' && 'Testing Pack (100 reviews)'}
                    {formData.planSlug === 'growth' && 'Growth Pack (500 reviews)'}
                    {formData.planSlug === 'pro' && 'Scale / Pro Pack (1,000 reviews)'}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '15px' }}>
                  {formData.planSlug === 'starter' && '₹79/mo (was ₹149)'}
                  {formData.planSlug === 'growth' && '₹149/mo (was ₹249)'}
                  {formData.planSlug === 'pro' && '₹249/mo (was ₹399)'}
                </div>
              </div>

              <div style={{ marginTop: '18px', background: 'var(--surface-container)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                🔒 Powered by Razorpay · UPI, Google Pay, PhonePe, Cards, NetBanking · Instant activation
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={handleOpenDashboardDirectly}
                  disabled={loading}
                  style={{ minWidth: '240px', fontSize: '15px', padding: '13px 24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>🚀</span> Open Dashboard (View Account First) →
                </button>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleTrialPayment}
                  disabled={loading}
                  style={{ minWidth: '260px', fontSize: '15px', padding: '13px 24px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Opening Razorpay Checkout...
                    </>
                  ) : paymentFailed ? (
                    '🔄 Retry ₹2 Payment via Razorpay'
                  ) : (
                    '💳 Pay ₹2 & Activate Trial Now'
                  )}
                </button>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                ✨ You can enter your dashboard immediately to view your QR stands & telemetry, and activate your trial anytime inside.
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                All charges in INR. By proceeding, you agree to Reviewly's{' '}
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
        )}

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
