import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { GoogleLogo, SparklesIcon, DirectReviewIcon, StarIcon } from '../components/Logos.js';

interface Props {
  slug: string;
}

export const CustomerReviewFlow: React.FC<Props> = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Review Flow Mode: 'choice' (first screen), 'ai' (rating criteria + AI generation), or 'direct'
  const [reviewMode, setReviewMode] = useState<'choice' | 'ai'>('choice');

  // Form State
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [customerComment, setCustomerComment] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customDish, setCustomDish] = useState('');
  const [showAddDish, setShowAddDish] = useState(false);
  const [reviewLength, setReviewLength] = useState<'short' | 'medium' | 'detailed'>('medium');
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
    } catch (err: any) {
      setError(err.message || 'Unable to load review page.');
    } finally {
      setLoading(false);
    }
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

  // Direct Google Review Shortcut
  const handleOpenGoogleDirect = () => {
    const url = data?.business?.googleReviewUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
          background: 'linear-gradient(135deg, #fef8f5 0%, #f7eeea 100%)',
          padding: '28px 20px 22px',
          borderBottom: '1px solid var(--border-light)',
          textAlign: 'center',
        }}
      >
        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
          {business.subcategory}
        </span>
        <h1 className="serif" style={{ fontSize: '26px', lineHeight: 1.25, marginBottom: '6px' }}>
          {business.name}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          📍 {business.city} · Verified Google Business
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
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: AI REVIEW FLOW (Questions & Ratings)            */}
        {/* ======================================================== */}
        {reviewMode === 'ai' && !generatedReview && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 className="serif" style={{ fontSize: '20px', fontWeight: 600 }}>Rate Your Experience</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Tap stars for each aspect</p>
              </div>
              <button
                onClick={() => setReviewMode('choice')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Back
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q: any) => {
                const currentRating = ratings[q.questionKey] || 5;
                return (
                  <div
                    key={q.questionKey}
                    className="card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{q.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                        {currentRating} / 5
                      </span>
                    </div>

                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= currentRating ? 'active' : ''}`}
                          onClick={() => handleRatingChange(q.questionKey, star)}
                          aria-label={`Rate ${star} stars`}
                        >
                          <StarIcon size={26} filled={star <= currentRating} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECTION: Dishes / What Did You Enjoy */}
            <div className="card" style={{ marginTop: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                  🍽️ What did you enjoy or order? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                {selectedDishes.length > 0 && (
                  <span style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 600 }}>
                    {selectedDishes.length} selected
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Tap dishes to mention them in your review, or type any custom dish you had:
              </p>

              {/* Dish Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {[
                  'Signature Biryani',
                  'Butter Chicken & Naan',
                  'Woodfired Pizza',
                  'Crispy Masala Dosa',
                  'Creamy Pasta',
                  'Craft Beverages',
                  'Chef Tasting Platter',
                  'Sizzling Brownie',
                ].map((dish) => {
                  const isSelected = selectedDishes.includes(dish);
                  return (
                    <button
                      key={dish}
                      type="button"
                      onClick={() => toggleDish(dish)}
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
                      {dish}
                    </button>
                  );
                })}

                {/* Custom Added Dishes */}
                {selectedDishes
                  .filter(
                    (d) =>
                      ![
                        'Signature Biryani',
                        'Butter Chicken & Naan',
                        'Woodfired Pizza',
                        'Crispy Masala Dosa',
                        'Creamy Pasta',
                        'Craft Beverages',
                        'Chef Tasting Platter',
                        'Sizzling Brownie',
                      ].includes(d)
                  )
                  .map((dish) => (
                    <button
                      key={dish}
                      type="button"
                      onClick={() => toggleDish(dish)}
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
                      ✓ {dish} ✕
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
                    + Add Other Dish
                  </button>
                ) : (
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Garlic Naan"
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

            {/* SECTION: Review Length / Story Depth Selector */}
            <div className="card" style={{ marginTop: '14px', padding: '16px' }}>
              <label className="form-label" style={{ marginBottom: '6px', fontWeight: 600 }}>
                ✍️ Review Length & Story Depth
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {[
                  { id: 'short', label: '⚡ Quick', desc: '1–2 lines' },
                  { id: 'medium', label: '✍️ Balanced', desc: '3–5 lines' },
                  { id: 'detailed', label: '📖 Foodie Story', desc: '7+ lines' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReviewLength(item.id as any)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: reviewLength === item.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: reviewLength === item.id ? '#fef2ee' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '13px', color: reviewLength === item.id ? 'var(--primary)' : 'var(--text)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
                {reviewLength === 'detailed'
                  ? '🌟 In-depth Foodie Story: Crafts a multi-paragraph, 7+ line detailed narrative with taste notes, atmosphere, and dish highlights.'
                  : reviewLength === 'short'
                  ? '⚡ Quick & Crisp: Direct 1-2 sentence recommendation for swift reading.'
                  : '✍️ Balanced: Standard 3-5 sentence organic Google review covering food and hospitality.'}
              </p>
            </div>

            {/* Optional Customer Note */}
            <div className="card" style={{ marginTop: '14px', padding: '16px' }}>
              <label className="form-label" style={{ marginBottom: '6px' }}>
                Any other compliment or favorite memory? <span style={{ fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Loved the attentive service, quick table seating, warm hospitality..."
                value={customerComment}
                onChange={(e) => setCustomerComment(e.target.value)}
                maxLength={500}
              />
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                onClick={handleOpenGoogleDirect}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <GoogleLogo size={14} />
                <span>Want to write directly instead? Open Google Maps ↗</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: GENERATED REVIEW & POST TO GOOGLE              */}
        {/* ======================================================== */}
        {reviewMode === 'ai' && generatedReview && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span className="stat-pill stat-pill-success" style={{ marginBottom: '8px' }}>
                Review Generated
              </span>
              <h2 className="serif" style={{ fontSize: '22px', lineHeight: 1.25 }}>
                Your Custom Review is Ready
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Review or personalize the text below before copying.
              </p>
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
                  {reviewLength === 'detailed' ? '🌟 7+ Line Foodie Story' : 'Personalized Review Draft'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {editedText.split('\n').filter(Boolean).length} lines · {editedText.length} characters
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows={reviewLength === 'detailed' ? 9 : 5}
                style={{ fontSize: '14.5px', lineHeight: 1.6 }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </div>

            {/* Instructions Strip */}
            <div
              style={{
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                How to post to Google in 2 clicks:
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                1. Tap <strong>Copy Review Text</strong>.<br />
                2. Tap <strong>Post to Google Maps</strong> and paste your review!
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className={`btn btn-lg ${copied ? 'btn-secondary' : 'btn-outline'}`}
                onClick={handleCopyReview}
                style={{ fontSize: '15px' }}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Review Text'}
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleOpenGoogle}
                style={{ fontSize: '15.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <GoogleLogo size={20} />
                <span>Post on Google Maps ↗</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ marginTop: '4px', fontSize: '13px' }}
                onClick={() => setGeneratedReview(null)}
              >
                ← Adjust Ratings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Button for AI Rating Step */}
      {reviewMode === 'ai' && !generatedReview && (
        <div className="sticky-bottom-bar">
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleGenerateReview}
            disabled={submitting}
            style={{ fontSize: '15.5px' }}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                <span>Crafting Your Review Draft...</span>
              </>
            ) : (
              <>
                <SparklesIcon size={18} color="white" />
                <span>Generate Review Draft ✨</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
