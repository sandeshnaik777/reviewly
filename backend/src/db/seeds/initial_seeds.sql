-- ====================================================================
-- Initial Seed Data: initial_seeds.sql
-- ====================================================================

-- 1. Insert Database-driven Subscription Plans (Prices & Quotas)
INSERT INTO subscription_plans (id, slug, name, price_inr, billing_period, review_generation_limit, qr_code_limit, analytics_enabled, custom_questions_enabled, custom_branding_enabled, team_members_limit, features, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'trial', '7-Day Free Trial Pass', 2, 'month', 50, 1, TRUE, TRUE, FALSE, 1, '["7-day full access", "₹2 trial verification fee", "50 AI review generations", "1 Smart QR Stand", "Standard analytics"]'::jsonb, TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'starter', 'Testing Pack', 79, 'month', 100, 2, TRUE, TRUE, FALSE, 1, '["100 AI review generations/mo", "First month offer: ₹79 (Reg. ₹149)", "2 Smart QR Stands", "Category question builder", "Scan & copy analytics", "Email support"]'::jsonb, TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'growth', 'Growth Pack', 149, 'month', 500, 5, TRUE, TRUE, TRUE, 3, '["500 AI review generations/mo", "First month offer: ₹149 (Reg. ₹249)", "5 Smart QR Stands", "Custom question builder", "Full funnel analytics", "Tone & length customization", "Priority support"]'::jsonb, TRUE),
  ('c0000000-0000-0000-0000-000000000004', 'pro', 'Scale / Pro Pack', 249, 'month', 1000, 15, TRUE, TRUE, TRUE, 10, '["1,000 AI review generations/mo", "First month offer: ₹249 (Reg. ₹399)", "15 Smart QR Stands", "Advanced anti-abuse guards", "Multi-staff RBAC", "Iron Man reputation shield", "Dedicated SLA"]'::jsonb, TRUE)
ON CONFLICT (slug) DO NOTHING;
