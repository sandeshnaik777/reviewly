import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MapPin, Check } from 'lucide-react';
import {
  KindlyRateLogo,
  GoogleLogo,
  SparklesIcon,
  DirectReviewIcon,
  StarIcon,
  InstagramLogo,
  FacebookLogo,
  WhatsAppLogo,
  ClipboardCopyIcon,
  GiftIcon,
  CheckCircleIcon,
  StorefrontIcon,
} from '../components/Logos.js';
import { ScratchCard } from '../components/ScratchCard.js';

interface Props {
  slug: string;
}

export const CustomerReviewFlow: React.FC<Props> = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Review Flow Mode: defaults directly to 'ai' rating criteria for 0-friction fast completion
  const [reviewMode, setReviewMode] = useState<'choice' | 'ai'>('ai');

  // Form State
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [customerComment, setCustomerComment] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customDish, setCustomDish] = useState('');
  const [showAddDish, setShowAddDish] = useState(false);
  const [reviewLength, setReviewLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [reviewFormat, setReviewFormat] = useState<
    'narrative' | 'bullet_highlights' | 'casual_conversational' | 'professional_critique'
  >('narrative');
  const [submitting, setSubmitting] = useState(false);

  // Review Result State
  const [generatedReview, setGeneratedReview] = useState<any>(null);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadQRDetails();
  }, [slug]);

  const loadQRDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCustomerQR(slug);
      setData(res);

      // Pre-fill default ratings to 5 stars
      const initialRatings: Record<string, number> = {};
      res.questions.forEach((q: any) => {
        initialRatings[q.questionKey] = 5;
      });
      setRatings(initialRatings);

      if (res.preferredReviewFormat) {
        setReviewFormat(res.preferredReviewFormat);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load review page.');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels: Record<number, { text: string; color: string; bg: string }> = {
    5: { text: '⭐⭐⭐⭐⭐ Outstanding', color: '#b45309', bg: '#fef3c7' },
    4: { text: '⭐⭐⭐⭐ Great', color: '#15803d', bg: '#dcfce7' },
    3: { text: '⭐⭐⭐ Good', color: '#0369a1', bg: '#e0f2fe' },
    2: { text: '⭐⭐ Fair', color: '#d97706', bg: '#fef3c7' },
    1: { text: '⭐ Needs Attention', color: '#dc2626', bg: '#fee2e2' },
  };

  const handleRatingChange = (key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const toggleDish = (dish: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dish) ? prev.filter((d) => d !== dish) : [...prev, dish]
    );
  };

  const handleAddCustomDish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDish.trim();
    if (trimmed && !selectedDishes.includes(trimmed)) {
      setSelectedDishes((prev) => [...prev, trimmed]);
      setCustomDish('');
      setShowAddDish(false);
    }
  };

  const handleGenerateReview = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await api.generateReview({
        sessionToken: data.sessionToken,
        ratings,
        customerComment: customerComment.trim() || undefined,
        dishesTried: selectedDishes.length > 0 ? selectedDishes : undefined,
        reviewLength,
        reviewFormat,
      });
      setGeneratedReview(res);
      setEditedText(res.reviewText);
    } catch (err: any) {
      setError(err.message || 'Failed to generate review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReview = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      if (generatedReview?.reviewId) {
        api.markCopied(generatedReview.reviewId).catch(() => {});
      }
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
    }
  };

  const handleOpenGoogle = () => {
    if (generatedReview?.reviewId) {
      api.markGoogleClick(generatedReview.reviewId).catch(() => {});
    }
    const url = generatedReview?.googleReviewUrl || data?.business?.googleReviewUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyAndOpenGoogle = async () => {
    await handleCopyReview();
    setTimeout(() => {
      handleOpenGoogle();
    }, 450);
  };

  // Direct Google Review Shortcut
  const handleOpenGoogleDirect = () => {
    const url = data?.business?.googleReviewUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFormattedSocialUrl = (platform: 'instagram' | 'facebook' | 'whatsapp', rawUrl?: string) => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (platform === 'instagram') {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      const handle = trimmed.replace(/^@/, '');
      return `https://instagram.com/${handle}`;
    }
    if (platform === 'facebook') {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      return `https://facebook.com/${trimmed.replace(/^\//, '')}`;
    }
    if (platform === 'whatsapp') {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      const digits = trimmed.replace(/[^\d]/g, '');
      return `https://wa.me/${digits}`;
    }
    return trimmed;
  };

  const handleSocialClick = (platform: 'instagram' | 'facebook' | 'whatsapp', rawUrl?: string) => {
    const targetUrl = getFormattedSocialUrl(platform, rawUrl);
    if (!targetUrl) return;
    if (data?.business?.id) {
      api.trackSocialClick(data.business.id, platform).catch(() => {});
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="mobile-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)' }}></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading review experience...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mobile-viewport" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 className="serif" style={{ fontSize: '24px', color: 'var(--error)', marginBottom: '12px' }}>Review Page Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={loadQRDetails}>Try Again</button>
      </div>
    );
  }

  const { business, questions } = data;

  return (
    <div className="mobile-viewport">
      {/* Business Header Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, #fffcfb 0%, #faf6f2 100%)',
          padding: '24px 20px 20px',
          borderBottom: '1px solid #ede8e3',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
          <Check size={12} strokeWidth={3} />
          <span>Verified Google Business</span>
        </div>
        <h1 className="serif" style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.25, marginBottom: '6px', color: '#0f172a' }}>
          {business.name}
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: 0 }}>
          <MapPin size={13} color="var(--primary)" /> {business.city || 'Local Area'} · {business.subcategory}
        </p>
      </div>

      <div style={{ padding: '20px 16px', flex: 1, paddingBottom: reviewMode === 'ai' && !generatedReview ? '100px' : '40px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        {/* ======================================================== */}
        {/* SCREEN 1: FIRST CHOICE (AI GENERATION vs DIRECT GOOGLE)   */}
        {/* ======================================================== */}
        {reviewMode === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className="serif" style={{ fontSize: '22px', fontWeight: 600 }}>
                How would you like to review us?
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Select your preferred way to share your experience
              </p>
            </div>

            {/* OPTION 1: Generate with AI (Recommended) */}
            <div
              className="card"
              style={{
                padding: '22px 20px',
                border: '1.5px solid var(--primary)',
                background: '#fffcfb',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onClick={() => setReviewMode('ai')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="stat-pill stat-pill-primary" style={{ fontSize: '11.5px' }}>
                  Recommended · Fast & Easy
                </span>
                <SparklesIcon size={22} color="var(--primary)" />
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Personalized Review in 15s
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Rate a few quick criteria and get an authentic, natural review draft crafted from your genuine experience.
              </p>

              <button
                className="btn btn-primary btn-block"
                style={{ fontSize: '14.5px', padding: '12px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setReviewMode('ai');
                }}
              >
                <SparklesIcon size={16} color="white" />
                <span>Draft My Review →</span>
              </button>
            </div>

            {/* OPTION 2: Direct Google Review */}
            <div
              className="card"
              style={{
                padding: '22px 20px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={handleOpenGoogleDirect}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="stat-pill stat-pill-neutral" style={{ fontSize: '11.5px' }}>
                  Direct Option
                </span>
                <GoogleLogo size={22} />
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Direct Google Review
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Prefer writing in your own words? Skip the questions and open our official Google Maps page directly.
              </p>

              <button
                className="btn btn-secondary btn-block"
                style={{ fontSize: '14.5px', padding: '12px', borderColor: 'var(--border)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenGoogleDirect();
                }}
              >
                <GoogleLogo size={18} />
                <span>Open Google Reviews ↗</span>
              </button>
            </div>

            {/* OPTIONAL SOCIAL MEDIA CONNECTIONS (Only shown if added by merchant) */}
            {(Boolean(business?.instagramUrl?.trim()) || Boolean(business?.whatsappUrl?.trim()) || Boolean(business?.facebookUrl?.trim())) && (
              <div
                className="card"
                style={{
                  padding: '16px 18px',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>Connect With Us</span>
                  <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 7px' }}>Official</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Follow our official channels for offers, news &amp; direct assistance
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {Boolean(business?.instagramUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('instagram', business.instagramUrl)}
                      className="btn"
                      style={{
                        flex: '1 1 auto',
                        minWidth: '120px',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '10px 14px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(220, 39, 67, 0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      <InstagramLogo size={18} />
                      <span>Follow on Instagram</span>
                    </button>
                  )}

                  {Boolean(business?.whatsappUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('whatsapp', business.whatsappUrl)}
                      className="btn"
                      style={{
                        flex: '1 1 auto',
                        minWidth: '120px',
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '10px 14px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      <WhatsAppLogo size={18} />
                      <span>Chat on WhatsApp</span>
                    </button>
                  )}

                  {Boolean(business?.facebookUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('facebook', business.facebookUrl)}
                      className="btn"
                      style={{
                        flex: '1 1 auto',
                        minWidth: '120px',
                        background: '#1877F2',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '10px 14px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(24, 119, 242, 0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      <FacebookLogo size={18} />
                      <span>Visit Facebook</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: AI REVIEW FLOW (Questions & Ratings)            */}
        {/* ======================================================== */}
        {reviewMode === 'ai' && !generatedReview && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 className="serif" style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Rate Your Experience
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                  Tap stars for each aspect
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenGoogleDirect}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                title="Open Google Maps directly without AI assistance"
              >
                <GoogleLogo size={13} />
                <span>Write Direct ↗</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Quick 1-Tap 5-Star Banner */}
              <div
                onClick={() => {
                  const allFives: Record<string, number> = {};
                  questions.forEach((q: any) => { allFives[q.questionKey] = 5; });
                  setRatings(allFives);
                }}
                style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1.5px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.1)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⭐</span>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400e' }}>
                      Loved everything?
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#b45309' }}>
                      Tap to set all aspects to 5★ instantly
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const allFives: Record<string, number> = {};
                    questions.forEach((q: any) => { allFives[q.questionKey] = 5; });
                    setRatings(allFives);
                  }}
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Rate All 5★
                </button>
              </div>

              {questions.map((q: any) => {
                const currentRating = ratings[q.questionKey] || 5;
                const labelInfo = ratingLabels[currentRating] || ratingLabels[5];

                return (
                  <div
                    key={q.questionKey}
                    className="card"
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                        {q.label}
                      </span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: labelInfo.color,
                          background: labelInfo.bg,
                          padding: '3px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        {labelInfo.text}
                      </span>
                    </div>

                    <div className="star-rating" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', padding: '4px 0' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= currentRating ? 'active' : ''}`}
                          onClick={() => handleRatingChange(q.questionKey, star)}
                          aria-label={`Rate ${star} stars`}
                          style={{
                            padding: '8px',
                            minWidth: '46px',
                            minHeight: '46px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            background: star <= currentRating ? '#fff8f4' : 'transparent',
                            border: star <= currentRating ? '1px solid #fed7aa' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <StarIcon size={32} filled={star <= currentRating} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category-Aware Products / Services / Dishes Chips */}
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

              const targetKeywords: string[] = data?.targetKeywords || [];
              const rawSuggestions = isRetail
                ? [
                    '16GB RAM Upgrade',
                    'Custom Gaming PC Build',
                    'Laptop Upgrade & SSD',
                    'Mechanical Keyboard',
                    'GPU Graphics Card',
                    'High Refresh Monitor',
                    'Fast RAM & Storage',
                    'Technical Diagnostics',
                    'Genuine Components',
                  ]
                : isServices
                ? [
                    'Periodic Maintenance',
                    'Brake & Suspension',
                    'Engine Diagnostics',
                    'Oil & Filter Service',
                    'AC Servicing',
                    'Wheel Alignment',
                    'Express Repair',
                    'Transparent Billing',
                  ]
                : isHealth
                ? [
                    'Hair Styling & Cut',
                    'Facial & Skincare',
                    'Spa Wellness Therapy',
                    'Dental Cleaning',
                    'Doctor Consultation',
                    'Pedicure & Manicure',
                    'Attentive Staff',
                    'Clean Clinic',
                  ]
                : cat === 'FOOD & HOSPITALITY'
                ? [
                    'Signature Dishes',
                    'Chef Specials',
                    'Woodfired Pizza',
                    'Crispy Starters',
                    'Craft Beverages',
                    'Fresh Dessert',
                    'Tasting Platter',
                    'Warm Hospitality',
                  ]
                : [
                    'Quality Service',
                    'Helpful Team',
                    'Fair Pricing',
                    'Clean Atmosphere',
                    'Prompt Turnaround',
                    'Professional Care',
                    'Highly Recommended',
                    'Great Hospitality',
                  ];

              const suggestions = Array.from(new Set([...targetKeywords, ...rawSuggestions]));

              const sectionTitle = isRetail
                ? 'Products, Hardware or Services Purchased'
                : isServices
                ? 'Services or Maintenance Performed'
                : isHealth
                ? 'Treatments or Care Received'
                : cat === 'FOOD & HOSPITALITY'
                ? 'Dishes or Beverages Enjoyed'
                : 'Products, Offerings or Services Highlighted';

              const sectionSubtitle = isRetail
                ? 'Tap items to mention them in your review, or type any specific component:'
                : isServices
                ? 'Tap services to mention them in your review, or type any specific work:'
                : isHealth
                ? 'Tap treatments to mention them in your review, or type any care received:'
                : cat === 'FOOD & HOSPITALITY'
                ? 'Tap dishes to mention them in your review, or type your favorites:'
                : 'Tap items to mention them in your review, or type your highlights:';

              return (
                <div className="card" style={{ marginTop: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                      {sectionTitle} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    {selectedDishes.length > 0 && (
                      <span style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 600 }}>
                        {selectedDishes.length} selected
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {sectionSubtitle}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {suggestions.map((item) => {
                      const isSelected = selectedDishes.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleDish(item)}
                          style={{
                            padding: '7px 13px',
                            borderRadius: '20px',
                            fontSize: '12.5px',
                            fontWeight: isSelected ? 600 : 500,
                            border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? '#fef2ee' : 'var(--surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--text)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {item}
                        </button>
                      );
                    })}

                    {selectedDishes
                      .filter((d) => !suggestions.includes(d))
                      .map((customItem) => (
                        <button
                          key={customItem}
                          type="button"
                          onClick={() => toggleDish(customItem)}
                          style={{
                            padding: '7px 13px',
                            borderRadius: '20px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            border: '1.5px solid var(--primary)',
                            background: '#fef2ee',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          ✓ {customItem} ✕
                        </button>
                      ))}

                    {!showAddDish ? (
                      <button
                        type="button"
                        onClick={() => setShowAddDish(true)}
                        style={{
                          padding: '7px 13px',
                          borderRadius: '20px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          border: '1px dashed var(--primary)',
                          background: 'transparent',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                        }}
                      >
                        + Add Custom Item
                      </button>
                    ) : (
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Custom item..."
                          value={customDish}
                          onChange={(e) => setCustomDish(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomDish();
                            }
                          }}
                          autoFocus
                          style={{ padding: '6px 10px', fontSize: '12.5px', width: '130px', borderRadius: '16px' }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomDish}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '16px' }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddDish(false);
                            setCustomDish('');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Optional Customer Note */}
            <div
              className="card"
              style={{
                marginTop: '14px',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
              }}
            >
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Special shoutout or compliment? <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Loved the friendly staff, quick service, loved the food..."
                value={customerComment}
                onChange={(e) => setCustomerComment(e.target.value)}
                maxLength={500}
                style={{ borderRadius: '10px', fontSize: '13.5px', padding: '10px 12px' }}
              />
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleOpenGoogleDirect}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <GoogleLogo size={13} />
                <span>Prefer writing in your own words? Open Google Maps directly ↗</span>
              </button>
            </div>

            {/* OPTIONAL SOCIAL MEDIA CONNECTIONS (Shown if added by merchant) */}
            {(Boolean(business?.instagramUrl?.trim()) || Boolean(business?.whatsappUrl?.trim()) || Boolean(business?.facebookUrl?.trim())) && (
              <div
                className="card"
                style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                    Connect With {business.name}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 6px' }}>Official</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                  {Boolean(business?.instagramUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('instagram', business.instagramUrl)}
                      className="btn"
                      style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <InstagramLogo size={15} />
                      <span>Instagram</span>
                    </button>
                  )}
                  {Boolean(business?.whatsappUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('whatsapp', business.whatsappUrl)}
                      className="btn"
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <WhatsAppLogo size={15} />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  {Boolean(business?.facebookUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('facebook', business.facebookUrl)}
                      className="btn"
                      style={{
                        background: '#1877F2',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <FacebookLogo size={15} />
                      <span>Facebook</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: GENERATED REVIEW & POST TO GOOGLE              */}
        {/* ======================================================== */}
        {reviewMode === 'ai' && generatedReview && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                <Check size={13} strokeWidth={3} />
                <span>Review Ready</span>
              </div>
              <h2 className="serif" style={{ fontSize: '22px', fontWeight: 700, margin: '2px 0 4px', color: '#0f172a' }}>
                Your Review is Ready!
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Personalize any words below or post directly to Google Maps
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.07)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#c2410c' }}>5-Star Experience</span>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                  Tap text to edit
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows={reviewLength === 'detailed' ? 8 : 5}
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.65,
                  minHeight: '130px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  background: '#fffdfa',
                  fontFamily: 'inherit',
                }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCopyAndOpenGoogle}
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  padding: '15px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 16px rgba(154, 64, 24, 0.35)',
                  borderRadius: '14px',
                  width: '100%',
                }}
              >
                <GoogleLogo size={22} />
                <span>{copied ? '✓ Copied! Opening Google Maps...' : '📋 Copy & Open Google Maps ↗'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                ✨ Copies automatically &amp; opens Google Maps so you just tap <b>Paste</b>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleCopyReview}
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <ClipboardCopyIcon size={14} />
                  <span>{copied ? '✓ Copied' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setGeneratedReview(null)}
                >
                  ← Adjust Ratings
                </button>
              </div>
            </div>

            {/* OPTIONAL SCRATCH CARD REWARD (If enabled by merchant) */}
            {data?.scratchCard?.enabled && (
              <div style={{ marginTop: '22px', marginBottom: '14px' }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <span
                    className="badge badge-primary"
                    style={{
                      fontSize: '11px',
                      padding: '4px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <GiftIcon size={13} color="var(--primary)" />
                    <span>Customer Appreciation Reward</span>
                  </span>
                  <h3 className="serif" style={{ fontSize: '19px', margin: '8px 0 3px', color: 'var(--text)' }}>
                    Scratch to Reveal Your Perk
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Special thank-you voucher for reviewing {business.name}!
                  </p>
                </div>

                <ScratchCard
                  cardType={data.scratchCard.type || 'golden_ticket'}
                  rewardTitle={data.scratchCard.rewardTitle || '10% Off Your Next Visit'}
                  rewardDescription={data.scratchCard.rewardDescription}
                  couponCode={data.scratchCard.couponCode}
                  businessName={business.name}
                  customLogoUrl={data.scratchCard.customLogoUrl || business.logoUrl}
                  winProbability={data.scratchCard.winProbability ?? 100}
                  loseMessage={data.scratchCard.loseMessage}
                />
              </div>
            )}

              {/* OPTIONAL SOCIAL MEDIA CONNECTIONS on Review Completion */}
              {(Boolean(business?.instagramUrl?.trim()) || Boolean(business?.whatsappUrl?.trim()) || Boolean(business?.facebookUrl?.trim())) && (
                <div
                  className="card"
                  style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Follow {business.name}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 7px' }}>Community</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Stay connected with us for special perks &amp; newest updates
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {Boolean(business?.instagramUrl?.trim()) && (
                      <button
                        type="button"
                        onClick={() => handleSocialClick('instagram', business.instagramUrl)}
                        className="btn"
                        style={{
                          flex: '1 1 auto',
                          minWidth: '120px',
                          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          padding: '10px 14px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(220, 39, 67, 0.25)',
                          cursor: 'pointer',
                        }}
                      >
                        <InstagramLogo size={18} />
                        <span>Follow on Instagram</span>
                      </button>
                    )}

                    {Boolean(business?.whatsappUrl?.trim()) && (
                      <button
                        type="button"
                        onClick={() => handleSocialClick('whatsapp', business.whatsappUrl)}
                        className="btn"
                        style={{
                          flex: '1 1 auto',
                          minWidth: '120px',
                          background: '#25D366',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          padding: '10px 14px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                          cursor: 'pointer',
                        }}
                      >
                        <WhatsAppLogo size={18} />
                        <span>Chat on WhatsApp</span>
                      </button>
                    )}

                    {Boolean(business?.facebookUrl?.trim()) && (
                      <button
                        type="button"
                        onClick={() => handleSocialClick('facebook', business.facebookUrl)}
                        className="btn"
                        style={{
                          flex: '1 1 auto',
                          minWidth: '120px',
                          background: '#1877F2',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          padding: '10px 14px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(24, 119, 242, 0.25)',
                          cursor: 'pointer',
                        }}
                      >
                        <FacebookLogo size={18} />
                        <span>Visit Facebook</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
        )}

        {/* Brand Trust Watermark */}
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '12px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: 0.75, fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Powered by</span>
            <KindlyRateLogo height={18} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button for AI Rating Step */}
      {reviewMode === 'ai' && !generatedReview && (
        <div className="sticky-bottom-bar" style={{ textAlign: 'center', padding: '12px 16px 14px' }}>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleGenerateReview}
            disabled={submitting}
            style={{
              fontSize: '16px',
              fontWeight: 700,
              padding: '15px 20px',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(154, 64, 24, 0.35)',
            }}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                <span>Writing Your Review Draft...</span>
              </>
            ) : (
              <>
                <SparklesIcon size={18} color="white" />
                <span>Generate My Review Draft ✨</span>
              </>
            )}
          </button>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
            ⚡ Ready in 5 seconds · Zero signup needed
          </div>
        </div>
      )}
    </div>
  );
};
