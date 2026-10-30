import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MapPin, Check, Heart, Sparkles } from 'lucide-react';
import {
  KindlyRateLogo,
  GoogleLogo,
  SparklesIcon,
  StarIcon,
  InstagramLogo,
  FacebookLogo,
  WhatsAppLogo,
  ClipboardCopyIcon,
  GiftIcon,
} from '../components/Logos.js';
import { ScratchCard } from '../components/ScratchCard.js';

interface Props {
  slug: string;
}

export const CustomerReviewFlow: React.FC<Props> = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Form State
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [customerComment, setCustomerComment] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customDish, setCustomDish] = useState('');
  const [showAddDish, setShowAddDish] = useState(false);
  const [reviewLength] = useState<'short' | 'medium' | 'detailed'>('medium');
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
      (res.questions || []).forEach((q: any) => {
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

  const handleRatingChange = (key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSetAllFives = () => {
    const all: Record<string, number> = {};
    const qs = data?.questions || [];
    qs.forEach((q: any) => {
      all[q.questionKey] = 5;
    });
    setRatings(all);
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
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13.5px' }}>Loading review experience...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mobile-viewport" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 className="serif" style={{ fontSize: '22px', color: 'var(--error)', marginBottom: '12px' }}>Review Page Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '13.5px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={loadQRDetails}>Try Again</button>
      </div>
    );
  }

  const { business } = data;
  const questions = (data.questions && data.questions.length > 0)
    ? data.questions
    : [{ questionKey: 'overall_experience', label: 'Overall Experience' }];

  const allFives = questions.every((q: any) => (ratings[q.questionKey] ?? 5) === 5);

  // Category-Aware Quick Highlight Pills
  const suggestions = (() => {
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
          'High Quality',
          'Fast Diagnostics',
          'Genuine Products',
          'Fair Pricing',
          'Helpful Staff',
          'Great Value',
        ]
      : isServices
      ? [
          'Quick Service',
          'Transparent Billing',
          'Honest Work',
          'Neat Workmanship',
          'Polite Team',
          'Highly Recommended',
        ]
      : isHealth
      ? [
          'Painless Care',
          'Friendly Staff',
          'Clean Clinic',
          'Short Wait Time',
          'Professional Doctor',
          'Great Advice',
        ]
      : cat === 'FOOD & HOSPITALITY'
      ? [
          'Delicious Food',
          'Warm Hospitality',
          'Quick Service',
          'Great Ambiance',
          'Fresh Quality',
          'Fair Prices',
        ]
      : [
          'Quality Service',
          'Helpful Staff',
          'Quick Turnaround',
          'Fair Pricing',
          'Clean Space',
          'Great Hospitality',
        ];

    return Array.from(new Set([...targetKeywords, ...rawSuggestions]));
  })();

  return (
    <div className="mobile-viewport" style={{ background: '#fdfbf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🌟 WARM & WELCOMING HEADER */}
      <div
        style={{
          background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
          padding: '18px 16px 14px',
          textAlign: 'center',
          borderBottom: '1px solid #fed7aa44',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fef3c7',
            color: '#92400e',
            fontSize: '11px',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '20px',
            marginBottom: '6px',
            letterSpacing: '0.3px',
          }}
        >
          <span>✨</span>
          <span>THANK YOU FOR VISITING!</span>
        </div>

        <h1
          className="serif"
          style={{
            fontSize: '21px',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '2px 0 4px',
            color: '#0f172a',
          }}
        >
          {business.name}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 600 }}>
            <Check size={12} strokeWidth={3} />
            <span>Verified Google Store</span>
          </span>
          <span>•</span>
          <span>{business.city || 'Local Store'}</span>
        </div>

        {business.welcomeMessage && (
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9a3412', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{business.welcomeMessage}"
          </p>
        )}
      </div>

      <div style={{ padding: '14px 14px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: '12px', fontSize: '13px' }}>{error}</div>}

        {/* ======================================================== */}
        {/* SCREEN 1: COMPACT RATING & DRAFT CREATION                */}
        {/* ======================================================== */}
        {!generatedReview ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 🌟 UNIFIED ULTRA-COMPACT RATING CARD */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '10px',
                boxShadow: '0 2px 10px rgba(234, 88, 12, 0.04)',
              }}
            >
              {/* Card Header with 1-Tap All 5★ */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    How was your experience?
                  </div>
                  <div style={{ fontSize: '11px', color: allFives ? '#15803d' : '#ea580c', fontWeight: 600 }}>
                    {allFives ? '⭐⭐⭐⭐⭐ 5.0 · Outstanding' : 'Tap stars to customize rating'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSetAllFives}
                  style={{
                    background: allFives ? '#dcfce7' : '#fff7ed',
                    border: allFives ? '1px solid #86efac' : '1px solid #fdba74',
                    color: allFives ? '#15803d' : '#ea580c',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {allFives ? '✓ All 5★' : '⚡ Rate All 5★'}
                </button>
              </div>

              {/* Compact Criteria Rows (Takes minimal height!) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {questions.map((q: any) => {
                  const currentRating = ratings[q.questionKey] ?? 5;
                  return (
                    <div
                      key={q.questionKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '3px 0',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#334155',
                          flex: 1,
                          paddingRight: '6px',
                          lineHeight: 1.25,
                        }}
                      >
                        {q.label || q.text || 'Service Quality'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(q.questionKey, star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              fontSize: '23px',
                              lineHeight: 1,
                              color: star <= currentRating ? '#f59e0b' : '#e2e8f0',
                              transform: star <= currentRating ? 'scale(1.05)' : 'scale(1)',
                              transition: 'all 0.1s ease',
                            }}
                            aria-label={`Rate ${star} star`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 💡 COMPACT HORIZONTAL QUICK MENTIONS */}
            {suggestions.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>
                    💡 Tap what you liked (Optional):
                  </span>
                  {selectedDishes.length > 0 && (
                    <span style={{ fontSize: '10.5px', color: '#ea580c', fontWeight: 700 }}>
                      {selectedDishes.length} selected
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '5px',
                    overflowX: 'auto',
                    paddingBottom: '3px',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                  }}
                >
                  {suggestions.map((item) => {
                    const isSelected = selectedDishes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDish(item)}
                        style={{
                          whiteSpace: 'nowrap',
                          padding: '5px 10px',
                          borderRadius: '16px',
                          fontSize: '11.5px',
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? '#fff7ed' : '#ffffff',
                          border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          color: isSelected ? '#ea580c' : '#475569',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
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
                          whiteSpace: 'nowrap',
                          padding: '5px 10px',
                          borderRadius: '16px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: '#fff7ed',
                          border: '1.5px solid #ea580c',
                          color: '#ea580c',
                          cursor: 'pointer',
                          flexShrink: 0,
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
                        whiteSpace: 'nowrap',
                        padding: '5px 9px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: '1px dashed #cbd5e1',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      + Custom
                    </button>
                  ) : (
                    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                      <input
                        type="text"
                        placeholder="e.g. Latte"
                        value={customDish}
                        onChange={(e) => setCustomDish(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomDish();
                          }
                        }}
                        autoFocus
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          width: '90px',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomDish}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          borderRadius: '12px',
                          background: '#ea580c',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddDish(false);
                          setCustomDish('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 💬 COMPACT 1-LINE COMPLIMENT INPUT */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="💬 Compliment or shoutout for staff? (Optional)"
                value={customerComment}
                onChange={(e) => setCustomerComment(e.target.value)}
                maxLength={300}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              />
            </div>

            {/* 🚀 PRIMARY CTA: GENERATE DRAFT IN 1 TAP */}
            <button
              type="button"
              onClick={handleGenerateReview}
              disabled={submitting}
              className="btn btn-primary btn-block"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                padding: '13px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
                borderColor: '#9a3412',
                boxShadow: '0 4px 14px rgba(194, 65, 12, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Writing Your Review Draft...</span>
                </>
              ) : (
                <>
                  <SparklesIcon size={16} color="white" />
                  <span>Generate 5-Star Review with AI ✨</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
              ⚡ Ready in 3 seconds · You can edit text before posting
            </div>

            {/* 🔗 DIRECT GOOGLE REVIEW LINK */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleOpenGoogleDirect}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <GoogleLogo size={12} />
                <span>Or write in your own words on Google Maps ↗</span>
              </button>
            </div>

            {/* 🌐 COMPACT SOCIAL MEDIA LINKS */}
            {(Boolean(business?.instagramUrl?.trim()) ||
              Boolean(business?.whatsappUrl?.trim()) ||
              Boolean(business?.facebookUrl?.trim())) && (
              <div style={{ marginTop: '14px', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                  Connect with {business.name}:
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Boolean(business?.instagramUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('instagram', business.instagramUrl)}
                      style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <InstagramLogo size={12} />
                      <span>Instagram</span>
                    </button>
                  )}
                  {Boolean(business?.whatsappUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('whatsapp', business.whatsappUrl)}
                      style={{
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <WhatsAppLogo size={12} />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  {Boolean(business?.facebookUrl?.trim()) && (
                    <button
                      type="button"
                      onClick={() => handleSocialClick('facebook', business.facebookUrl)}
                      style={{
                        background: '#1877F2',
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FacebookLogo size={12} />
                      <span>Facebook</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 2: GENERATED REVIEW READY & ONE-TAP POSTING      */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ecfdf5',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '6px',
                }}
              >
                <Check size={12} strokeWidth={3} />
                <span>REVIEW READY</span>
              </div>
              <h2
                className="serif"
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  margin: '2px 0 4px',
                  color: '#0f172a',
                }}
              >
                Thank You for Supporting Us! ❤️
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Copy your review below and post on Google Maps in 1 click:
              </p>
            </div>

            {/* Clean Review Box with Tap to Edit */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '12px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', color: '#f59e0b' }}>★★★★★</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#c2410c' }}>5-Star Experience</span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Tap to edit</span>
              </div>

              <textarea
                className="form-textarea"
                rows={4}
                style={{
                  fontSize: '14px',
                  lineHeight: 1.55,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  background: '#fffdfa',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </div>

            {/* Post to Google Maps Button */}
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleCopyAndOpenGoogle}
              style={{
                fontSize: '15px',
                fontWeight: 800,
                padding: '13px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(194, 65, 12, 0.35)',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
                borderColor: '#9a3412',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <GoogleLogo size={18} />
              <span>{copied ? '✓ Copied! Opening Google Maps...' : '📋 Copy Review & Open Google Maps ↗'}</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
              ✨ Copies automatically · Just tap <b>Paste</b> on Google Maps!
            </div>

            {/* Secondary Controls */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleCopyReview}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '7px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <ClipboardCopyIcon size={13} />
                <span>{copied ? '✓ Copied' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={() => setGeneratedReview(null)}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '7px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                ← Edit Ratings
              </button>
            </div>

            {/* Optional Scratch Card Reward */}
            {data?.scratchCard?.enabled && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <span
                    className="badge badge-primary"
                    style={{
                      fontSize: '10.5px',
                      padding: '3px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <GiftIcon size={12} color="var(--primary)" />
                    <span>Customer Reward</span>
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0 2px', color: 'var(--text)' }}>
                    Scratch to Reveal Your Perk
                  </div>
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
          </div>
        )}

        {/* Brand Trust Watermark */}
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '16px', paddingBottom: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', opacity: 0.65, fontSize: '11px', color: '#94a3b8' }}>
            <span>Powered by</span>
            <KindlyRateLogo height={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
