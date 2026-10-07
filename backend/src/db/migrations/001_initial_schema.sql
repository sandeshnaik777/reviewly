-- ====================================================================
-- Production PostgreSQL Database Migration: 001_initial_schema.sql
-- Multi-Tenant Business Review Platform SaaS
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'BUSINESS_OWNER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Businesses (Tenants)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    custom_category VARCHAR(100) NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    pincode VARCHAR(20) NOT NULL,
    google_review_url TEXT NOT NULL,
    logo_url TEXT NULL,
    cover_image_url TEXT NULL,
    description TEXT NULL,
    opening_hours VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(main_category, subcategory);

-- 3. Business Members (RBAC inside tenant)
CREATE TABLE IF NOT EXISTS business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'BUSINESS_STAFF',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_business_members_business_user ON business_members(business_id, user_id);

-- 4. Business Types / Categories Reference
CREATE TABLE IF NOT EXISTS business_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    main_category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(main_category, subcategory)
);

-- 5. Business Review Questions (Dynamic & Customizable)
CREATE TABLE IF NOT EXISTS business_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    scale_type VARCHAR(50) NOT NULL DEFAULT '1-5_STARS',
    min_value INT NOT NULL DEFAULT 1,
    max_value INT NOT NULL DEFAULT 5,
    display_order INT NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, question_key)
);
CREATE INDEX IF NOT EXISTS idx_business_questions_tenant ON business_questions(business_id, display_order);

-- 6. Business Settings (Review Tone, Length, Prompt Constraints)
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    review_tone VARCHAR(50) NOT NULL DEFAULT 'enthusiastic',
    review_length VARCHAR(50) NOT NULL DEFAULT 'medium',
    custom_instructions TEXT NULL,
    words_to_avoid JSONB NOT NULL DEFAULT '[]'::jsonb,
    things_to_highlight JSONB NOT NULL DEFAULT '[]'::jsonb,
    auto_redirect_google BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_settings_tenant ON business_settings(business_id);

-- 7. QR Codes
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    location_tag VARCHAR(100) NOT NULL DEFAULT 'Main Counter',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    scan_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business_id ON qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);

-- 8. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price_inr INT NOT NULL,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'month',
    review_generation_limit INT NOT NULL,
    qr_code_limit INT NOT NULL,
    analytics_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    custom_questions_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    custom_branding_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    team_members_limit INT NOT NULL DEFAULT 1,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'TRIAL',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE NULL,
    trial_end TIMESTAMP WITH TIME ZONE NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 10. Usage Records (Atomic Quota Enforcement)
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    period_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    reviews_generated_count INT NOT NULL DEFAULT 0,
    qr_scans_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, period_month)
);
CREATE INDEX IF NOT EXISTS idx_usage_records_business_period ON usage_records(business_id, period_month);

-- 11. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    subscription_id UUID NULL REFERENCES subscriptions(id) ON DELETE SET NULL,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    payment_id VARCHAR(100) NULL,
    amount_inr INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'created',
    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    provider_reference TEXT NULL,
    idempotency_key VARCHAR(120) NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- 12. Review Sessions (Anonymous Customer)
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    qr_code_id UUID NULL REFERENCES qr_codes(id) ON DELETE SET NULL,
    session_token VARCHAR(128) NOT NULL UNIQUE,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_sessions_business ON review_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_token ON review_sessions(session_token);

-- 13. Review Ratings
CREATE TABLE IF NOT EXISTS review_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES review_sessions(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    rating_value INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_ratings_session ON review_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_review_ratings_business ON review_ratings(business_id);

-- 14. Generated Reviews
CREATE TABLE IF NOT EXISTS generated_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES review_sessions(id) ON DELETE CASCADE,
    ratings_snapshot JSONB NOT NULL,
    customer_comment TEXT NULL,
    generated_text TEXT NOT NULL,
    edited_text TEXT NULL,
    sentiment VARCHAR(50) NOT NULL,
    is_copied BOOLEAN NOT NULL DEFAULT FALSE,
    is_google_clicked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generated_reviews_business_created ON generated_reviews(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reviews_session ON generated_reviews(session_id);

-- 15. Analytics Events (Funnel Analysis)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    qr_code_id UUID NULL REFERENCES qr_codes(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_business ON analytics_events(business_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_qr ON analytics_events(qr_code_id, created_at);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NULL,
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON audit_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
