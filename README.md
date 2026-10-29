# KindlyRate — Enterprise AI Google Review Platform & Reputation Engine

> **Live Production URL:** [https://kindlyrate.com](https://kindlyrate.com)  
> **Brand Name:** KindlyRate  
> **Repository:** `git@github.com:sandeshnaik777/reviewly.git` (Branch: `main`)

---

## 1. System Overview

**KindlyRate** is a multi-tenant SaaS platform built for local brick-and-mortar merchants (retailers, computer/hardware shops, clinics, salons, restaurants) to rapidly capture genuine 5-star Google Maps reviews at checkout via smart counter QR stands, while intercepting negative customer feedback privately before it hurts their public rating.

### Key Architectural Highlights:
* **Frontend:** React 19 + TypeScript + Vite + Lucide Icons + Google Identity Services (One-Tap & OAuth 2.0 Web Flow).
* **Backend:** Node.js (v20+) + Express + TypeScript + Strict Multi-Tenant RBAC + HMAC-SHA256 Payment Verification.
* **Database:** Dual-engine architecture:
  * **Production:** PostgreSQL database (`kindlyreview_store`) on EC2.
  * **Fallback / Development:** Zero-dependency file JSON engine (`data/review_platform.json`).
* **AI Engine:** Google Gemini configured to the lowest-cost model: `gemini-1.5-flash-8b`.
* **Payments & Mandates:** Real production Razorpay UPI Autopay / e-mandates & one-time subscriptions.
* **Deployment:** AWS EC2 Ubuntu 24.04 LTS managed via PM2 and Nginx reverse proxy with Cloudflare SSL.

---

## 2. Server & Cloud Infrastructure

| Property | Value |
|---|---|
| **Host Provider** | AWS EC2 (Asia Pacific - Singapore / Mumbai) |
| **Server Public IP** | `16.176.211.119` |
| **Operating System** | Ubuntu 24.04 LTS |
| **SSH Key Path (Local)** | `C:\Users\sande\Downloads\kindlyreview-server.pem` |
| **SSH Login Command** | `ssh -i "C:\Users\sande\Downloads\kindlyreview-server.pem" ubuntu@16.176.211.119` |
| **App Directory on Server** | `/var/www/kindlyreview` |
| **Process Manager** | PM2 (`pm2 reload 0 --update-env`, `pm2 logs`, `pm2 status`) |
| **Web Server / SSL** | Nginx Reverse Proxy (Port 4000) + Cloudflare Full (Strict) SSL |

### 🚀 One-Line EC2 Deployment Command:
Run this from your local machine to push and build live on EC2:
```bash
git push origin main && ssh -i "C:\Users\sande\Downloads\kindlyreview-server.pem" -o StrictHostKeyChecking=no ubuntu@16.176.211.119 "cd /var/www/kindlyreview && git fetch origin main && git reset --hard origin/main && npm --prefix frontend run build && npm --prefix backend run build && pm2 reload 0 --update-env"
```

---

## 3. Standard Login Accounts

Strictly preserve these two system accounts:

### 👑 Platform Super Administrator
* **Email:** `admin@kindlyrate.com`
* **Password:** `AdminSecurePassword123!`
* **Role:** `PLATFORM_ADMIN`
* **Access URL:** `https://kindlyrate.com/admin`
* **Capabilities:** Oversee all merchants, manage Gemini API key pools & multi-key failover, configure subscription plans, adjust pricing (1M, 3M, 6M, 1Y), and view platform telemetry.

### 🏪 Standard Demo Merchant
* **Email:** `demo@kindlyrate.com`
* **Password:** `DemoRate2026!`
* **Role:** `BUSINESS_OWNER`
* **Access URL:** `https://kindlyrate.com/login`
* **Business:** Priya Sharma (Computer & Tech Hardware Demo Store)

---

## 4. Third-Party Integrations & Environment Variables

All live credentials are securely maintained in `.env` and `backend/.env` (and on EC2 at `/var/www/kindlyreview/backend/.env`).

### 💳 Razorpay (Live Production Mode)
* **Key ID:** `RAZORPAY_KEY_ID` (Live production key `rzp_live_...`)
* **Key Secret:** `RAZORPAY_KEY_SECRET` in `.env`
* **Mandate / UPI Autopay Recipient:**
  * When clients set up UPI Autopay on PhonePe/GPay, the recipient name and VPA come directly from Razorpay.
  * To change the recipient name from "To Kcetcutoff" to "KindlyRate", go to **Razorpay Dashboard $\rightarrow$ Settings $\rightarrow$ Business Profile $\rightarrow$ Brand Name / Business Name**.
* **Live Razorpay Plan IDs (Active on Account):**
  * **Testing Pack Starter Trial (₹79/mo):** `plan_TtcqSdkuxmyqoH`
  * **Growth Pack (₹149/mo):** `plan_Ttd2A0R5v2g4A9`
  * **Scale / Pro Pack (₹249/mo):** `plan_Ttd2AG8y0o19Vb`
  * **Testing Pack 1-Year (₹790/yr · 2 Months Free):** `plan_TtdVkbhz7I8Eob`
  * **Growth Pack 1-Year (₹1,490/yr · 2 Months Free):** `plan_TtdVky0x2dSqAV`
  * **Scale / Pro Pack 1-Year (₹2,490/yr · 2 Months Free):** `plan_TtdVl8YjFaT0Te`
  * **3-Month & 6-Month plans:** Mapped in `backend/src/modules/payment/service.ts`.

### 🔑 Google OAuth 2.0 Web Authentication
* **Client ID:** Configured in `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` in `.env`
* **Client Secret:** `GOOGLE_CLIENT_SECRET` in `backend/.env`
* **Authorized JavaScript Origins:**
  * `https://kindlyrate.com`
  * `http://localhost:5173`
  * `http://localhost:4000`
* **Authorized Redirect URIs:**
  * `https://kindlyrate.com/api/auth/google/callback`
  * `http://localhost:4000/api/auth/google/callback`

### 🤖 Google Gemini AI Engine
* **Configured Model:** `gemini-1.5-flash-8b` *(Cost-optimized model)*
* **Fallback & Multi-Key System:** Super admin can add multiple Gemini API keys in `/admin` with automatic failover on quota exhaustion or error.

### 📧 Brevo SMTP (Transactional Emails & OTP)
* **Host:** `smtp-relay.brevo.com` (Port 587)
* **User & Password:** Configured under `SMTP_USER` and `SMTP_PASS` in `.env`
* **Sender:** `KindlyRate <sandeshnaik525@gmail.com>`

### 📱 AWS SNS SMS (Transactional Phone OTP)
* **Region:** `ap-south-1`
* **Credentials:** Configured under `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `backend/.env`
* **Sender ID:** `KNDLYREV`

---

## 5. Critical Business Rules & Logic

1. **Subscription Paywall & Trial Enforcement:**
   * A merchant in free preview mode (`isPaidActive === false`) cannot accept live customer review submissions.
   * `POST /api/customer/generate-review` calls `subscriptionService.enforceReviewQuota(businessId)`.
   * Unpaid / unactivated accounts throw HTTP 402 `SUBSCRIPTION_REQUIRED`.
   * The dashboard renders a persistent top warning banner and Hero Card prompting plan activation for ₹79 or yearly autopay.

2. **No Rate Limiting:**
   * All rate limiting middlewares in `backend/src/middleware/rateLimiter.ts` are configured as pass-throughs per user requirements.

3. **Authentic City & Near-Place Ranking (Geo-Grid):**
   * Replaced artificial compass points (`NW`, `SE`) in miles with realistic landmark zones in **kilometers/meters**:
     * `Storefront (<200m)`
     * `Main High Street & Commercial Hub (0.5 km)`
     * `Central Metro & Transit Station (1.1 km)`
     * `Commercial Tech & Business Park (1.8 km)`
     * `Sector Market Circle (1.4 km)`
     * `East Shopping Plaza (1.6 km)`
     * `Ring Road & Arterial Bypass (2.8 km)`
     * `South Residential Corridor (2.2 km)`
     * `Greater {city} Wide Standing (4.8 km)`
   * Accompanied by a dedicated City-Wide standing card.

4. **Conditional AI Insights:**
   * Insights only render when there is actual review activity (`reviews.length >= 3`).
   * For accounts with $< 3$ reviews, renders a clean **"AI Growth Insights Standby"** card instead of dummy wall-of-text recommendations.
   * Removed duplicate bottom recommendation blocks with restaurant-specific levers (`dish_boost`, `waiter_bonus`).

5. **Reputation Shield:**
   * Customers giving 1, 2, or 3 stars are seamlessly routed to a private internal feedback form intercepted directly into the merchant dashboard without redirecting to Google Maps.
   * Customers giving 4 or 5 stars receive AI-crafted review options and a one-click button that opens the direct Google Maps review dialog.

---

## 6. Local Development Commands

### Install Dependencies:
```bash
npm run install:all
```

### Run Locally (Frontend on 5173, Backend on 4000):
```bash
npm run dev
```

### Run Backend Unit & Integration Tests (72 Tests):
```bash
npm test --prefix backend
```

### Build for Production:
```bash
npm run build
```

---

## 7. Directory Structure

```
c:\Code\Review\
├── backend/
│   ├── src/
│   │   ├── config/              # App config, database options, Gemini model config
│   │   ├── db/                  # PostgreSQL schema, seeds, file-DB fallback
│   │   ├── middleware/          # Auth, RBAC, tenant isolation, error handler
│   │   ├── modules/
│   │   │   ├── auth/            # Password bcrypt, OTP, Google OAuth 2.0 flow
│   │   │   ├── business/        # Business profiles, keywords, target highlights
│   │   │   ├── customer/        # Customer QR scan, question rating, review generation
│   │   │   ├── payment/         # Razorpay orders, subscriptions, autopay, HMAC verification
│   │   │   ├── review/          # AI review drafting, prompt injection guards
│   │   │   ├── sms/             # AWS SNS SMS phone verification
│   │   │   └── subscription/    # Quota enforcement, trial activation, isPaidActive check
│   │   └── index.ts             # Express entry point
│   └── tests/
│       └── suite.test.ts        # Comprehensive 72-test test suite
├── frontend/
│   ├── src/
│   │   ├── components/          # GeoGridHeatmap, Logos, Modals, Navbar
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx      # Super Admin panel (/admin)
│   │   │   ├── BusinessDashboard.tsx   # Merchant dashboard (/dashboard)
│   │   │   ├── CustomerReviewFlow.tsx  # Customer review capture (/r/:slug)
│   │   │   ├── LandingPage.tsx         # Public marketing website (/)
│   │   │   ├── LoginPage.tsx           # Merchant login & Google Sign-In
│   │   │   └── OnboardingWizard.tsx    # 4-step merchant onboarding & setup
│   │   └── services/api.ts      # Typed frontend API client
│   └── index.html
├── data/
│   └── review_platform.json     # File database storage fallback
├── scripts/                     # Operational scripts (seed-demo, reset accounts, etc.)
└── SYSTEM_DESIGN.md             # Detailed engineering system design & data contracts
```
