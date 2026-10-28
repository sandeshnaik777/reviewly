# KindlyReview — Complete Production System Design & Architecture Specification

> **Document Version:** 2.0.0  
> **Last Updated:** October 2026  
> **Target Platform:** AWS EC2 (Ubuntu 24.04 LTS), Nginx Reverse Proxy, PM2 Process Supervisor, Node.js v20+, TypeScript, React + Vite, PostgreSQL 16+

---

## 1. Executive Summary & Core Objectives

**KindlyReview** is an enterprise-grade, multi-tenant SaaS platform engineered specifically for restaurants, cafes, bars, and retail establishments. Its core mission is to **bridge the friction gap between happy in-person diners and authoritative 5-star Google Maps reviews**, while providing an automated **Reputation Shield** that intercepts dissatisfied customers privately before negative reviews reach the public domain.

### Key Value Propositions
1. **Zero-App Diner Experience:** Diners never install an app or register. Scanning a physical table QR code instantly launches an ultra-lightweight mobile browser experience (Chrome/Safari) taking under 30 seconds to complete.
2. **Authentic, Humanized AI Generation:** Rather than asking diners to write lengthy essays on mobile keyboards, our server-side Google Gemini Flash AI engine synthesizes natural customer ratings and dishes into mouth-watering, conversational review drafts with 1-tap **Copy & Post to Google Maps**.
3. **Reputation Shield (Private Interception):** Ratings of 1 to 3 stars bypass Google Maps entirely and route directly to the manager's dashboard and WhatsApp/SMS for immediate in-venue resolution.
4. **Starter Trial Pack (₹79) & Recurring Monthly Subscriptions:** High-converting entry pack at ₹79 (30 days access, 100 reviews, 2 QR stands) with seamless Razorpay integration, automated monthly recurring billing, and persistent transaction ID auditing.

---

## 2. High-Level System Architecture

The following diagram illustrates the end-to-end topology across the client layer, edge reverse proxy, application server, persistent data store, and external third-party cloud APIs.

```mermaid
flowchart TD
    subgraph Clients["1. Client Layer"]
        Diner["Mobile Diner Phone\n(QR Camera Scan -> /r/:slug)"]
        Merchant["Merchant / Owner\n(Mobile & Desktop Dashboard -> /app)"]
        Admin["Platform Super-Admin\n(/admin)"]
    end

    subgraph Edge["2. Edge & Security Layer (Nginx)"]
        Nginx["Nginx Reverse Proxy (Port 80/443)\n- Gzip & HTTP/2 Compression\n- Static SPA Fallback (/index.html)\n- Reverse Proxy /api/ -> 127.0.0.1:4000\n- Strict IP & Rate Limiting"]
    end

    subgraph AppServer["3. Node.js Application Layer (PM2)"]
        Express["Express.js + TypeScript Runtime\n(Port 4000)"]
        AuthMod["Auth & Security Engine\n(Bcrypt + JWT + Email/SMS OTP)"]
        ReviewMod["AI Review Synthesizer\n(Multi-Key Gemini Failover)"]
        PayMod["Payment & Recurring Billing\n(Razorpay + Auto-Renewal Ledger)"]
        QRMod["QR Routing & CID Converter\n(Google Maps Place ID / CID)"]
    end

    subgraph Storage["4. Persistence Layer"]
        Postgres[("PostgreSQL 16 Database\n(Primary Store: kindlyreview_store\nJSONB Document Store + ACID Persistence)")]
    end

    subgraph External["5. External Cloud Integrations"]
        Gemini["Google Gemini API\n(gemini-1.5-flash / gemini-2.0)"]
        Razorpay["Razorpay Gateway\n(Orders, Mandates, Webhooks)"]
        AwsSNS["AWS SNS (Amazon Web Services)\n(Transactional SMS OTP Dispatch)"]
        Resend["Resend / SMTP\n(Transactional Email OTP Dispatch)"]
        GoogleMaps["Google Maps Platform\n(Place ID, Hex CID, Direct WriteReview)"]
    end

    Diner -->|HTTP/HTTPS| Nginx
    Merchant -->|HTTP/HTTPS| Nginx
    Admin -->|HTTP/HTTPS| Nginx

    Nginx -->|Reverse Proxy| Express
    Express --> AuthMod
    Express --> ReviewMod
    Express --> PayMod
    Express --> QRMod

    AuthMod --> AwsSNS
    AuthMod --> Resend
    ReviewMod --> Gemini
    PayMod --> Razorpay
    QRMod --> GoogleMaps

    Express <-->|pg Pool / SQL Connection| Postgres
```

---

## 3. Multi-Tenant Domain Hierarchy & Data Models

KindlyReview enforces strict multi-tenant boundary isolation. Every merchant belongs to their own tenant realm (`tenantId` / `businessId`). No merchant can ever query, read, or modify another merchant's telemetry, reviews, QR codes, or financial ledgers.

```mermaid
erDiagram
    USER ||--o{ BUSINESS_STAFF : "belongs to"
    BUSINESS ||--o{ BUSINESS_STAFF : "employs"
    BUSINESS ||--o{ QR_CODE : "owns"
    BUSINESS ||--o{ BUSINESS_QUESTION : "configures"
    BUSINESS ||--o{ GENERATED_REVIEW : "receives"
    BUSINESS ||--o{ PAYMENT_RECORD : "bills"
    BUSINESS ||--|| SUBSCRIPTION : "maintains"
    SUBSCRIPTION_PLAN ||--o{ SUBSCRIPTION : "governs"

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        string role "BUSINESS_OWNER | PLATFORM_ADMIN"
        boolean emailVerified
        string phone
        boolean phoneVerified
        int failedLoginAttempts
        string lockoutUntil
    }

    BUSINESS {
        string id PK
        string slug UK
        string name
        string mainCategory
        string subcategory
        string city
        string state
        string country
        string googleReviewUrl
        string googlePlaceId
        string googleCid
        boolean autoRedirectGoogle
    }

    QR_CODE {
        string id PK
        string businessId FK
        string slug UK
        string name
        string locationTag
        int scanCount
        boolean isActive
    }

    BUSINESS_QUESTION {
        string id PK
        string businessId FK
        string questionKey
        string label
        string scaleType "1-5_STARS"
        boolean isRequired
    }

    GENERATED_REVIEW {
        string id PK
        string businessId FK
        string qrCodeId FK
        string sessionToken
        jsonb ratings
        string generatedText
        string sentiment "POSITIVE | NEUTRAL | CONSTRUCTIVE"
        boolean wasCopied
        boolean clickedGoogleReview
    }

    SUBSCRIPTION {
        string id PK
        string businessId FK
        string planId FK
        string status "ACTIVE | TRIAL | EXPIRED"
        boolean autoRenew
        string billingCycle "monthly | quarterly | yearly"
        string lastTransactionId
        string nextBillingDate
        string currentPeriodEnd
    }

    PAYMENT_RECORD {
        string id PK
        string businessId FK
        string orderId UK
        string paymentId
        string transactionId
        int amountInr
        string paymentType "trial_verification | direct_subscription | recurring_monthly"
        string status "created | captured | failed"
    }
```

---

## 4. Authentication, Zero-Trust Security & Identity Lifecycle

The authentication stack utilizes defense-in-depth principles:

### 1. Dual Transport Authorization
- **HttpOnly Secure Cookie (`kr_auth_token`):** Protects against Cross-Site Scripting (XSS) in standard browser environments.
- **Bearer Token (`Authorization: Bearer <token>`):** Supported via `localStorage` fallback to prevent mobile cookie blocking in sandboxed webviews.

### 2. Multi-Channel OTP Verification
- **Email OTP Verification:**
  - 6-digit cryptographically generated random OTP (`crypto.randomInt(100000, 999999)`).
  - Stored exclusively as a SHA-256 hash (`codeHash`).
  - Strict 10-minute validity expiry with attempt counter (max 5 attempts before invalidation).
- **AWS SNS SMS OTP Verification:**
  - Automated E.164 phone normalization for Indian (`+91`) and international numbers.
  - Multi-country prefix auto-detection with fallback logging.

### 3. Account Lockout & Brute-Force Defense
- Passwords hashed with **Bcrypt (12 rounds of salt)**.
- Consecutive failed login attempts are tracked; 5 consecutive failures enforce a **15-minute cool-down lockout**.

---

## 5. Pricing, Starter Trial Pack (₹79) & Recurring Subscription Engine

### Plan Matrix

| Plan Tier | Monthly Price | 3-Month Pack | 6-Month Pack | 1-Year Pack (2 Mos Free!) | AI Review Quota | QR Stands Limit | Highlights |
|---|---|---|---|---|---|---|---|
| **Testing Pack (Starter Trial)** | **₹79** | ₹229 | ₹429 | ₹790 | 100 reviews/mo | 2 QR Stands | 30-Day Starter Access, Category Builder, Funnel Analytics |
| **Growth Pack (Most Popular)** | **₹149** | ₹429 | ₹799 | ₹1,490 | 500 reviews/mo | 5 QR Stands | Full Custom Branding, Tone Tuning, Priority Support |
| **Scale / Pro Pack (High Volume)** | **₹249** | ₹719 | ₹1,349 | ₹2,490 | 1,000 reviews/mo | 15 QR Stands | Aura Reputation Shield, Multi-Staff RBAC, Dedicated SLA |

### Payment & Recurring Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Merchant as Merchant
    participant Frontend as React Wizard / Dashboard
    participant Backend as Express Payment Service
    participant Gateway as Razorpay API
    participant DB as PostgreSQL Store

    Merchant->>Frontend: Selects Option A: Testing Pack Trial (₹79)
    Frontend->>Backend: POST /api/payment/create-order { isTrial: true, planId: 'starter' }
    Backend->>Gateway: POST /v1/orders { amount: 7900, currency: 'INR' }
    Gateway-->>Backend: Return { id: 'order_xxx', amount: 7900 }
    Backend->>DB: createPaymentRecord({ orderId, amountInr: 79, status: 'created' })
    Backend-->>Frontend: Return { orderId, amount: 7900, keyId }
    Frontend->>Gateway: Open Razorpay Checkout Modal (UPI / Card / NetBanking)
    Merchant->>Gateway: Completes ₹79 Payment
    Gateway-->>Frontend: Returns { razorpay_payment_id: 'pay_xxx', razorpay_signature: 'sig_xxx' }
    Frontend->>Backend: POST /api/payment/verify { orderId, paymentId, signature }
    Backend->>Backend: Verify HMAC-SHA256(orderId + "|" + paymentId, keySecret)
    Backend->>DB: Update PaymentRecord { status: 'captured', transactionId: 'pay_xxx' }
    Backend->>DB: Update Subscription { status: 'ACTIVE', autoRenew: true, lastTransactionId: 'pay_xxx', nextBillingDate: +30 days }
    Backend-->>Frontend: 200 OK { status: 'ACTIVATED' }
    Frontend-->>Merchant: Display Dashboard with Confirmed Transaction ID
```

### Recurring Billing Engine
- Subscriptions store `autoRenew: boolean`, `billingCycle`, and `nextBillingDate`.
- An automated cron worker invokes `paymentService.processRecurringBilling()`:
  1. Queries all active subscriptions with `autoRenew: true` where `nextBillingDate <= NOW()`.
  2. Generates an explicit renewal transaction (`pay_rec_<timestamp>_<uuid>`).
  3. Records a captured `PaymentRecord` with `paymentType: 'recurring_monthly'` and transaction ID.
  4. Advances `nextBillingDate` and `currentPeriodEnd` by 30 days.
  5. Emits an immutable audit log entry for finance reconciliation.

---

## 6. AI Review Generation & Anti-Hallucination Pipeline

### Dynamic Few-Shot Prompt Architecture
The review engine prompts Google Gemini Flash using structured semantic inputs:
- **Business Identity:** Name, category, subcategory (e.g., *Italian Bistro*, *PC Hardware Dealer*).
- **Customer Criteria:** Exact star ratings across customized questions (*Food Taste: 5★, Ambience: 5★, Service: 4★*).
- **Customer Specifics:** Optional customer comments and specific dishes or items ordered (*"Truffle Pasta"*, *"Tiramisu"*).
- **Format Directives:** Narrative paragraph, conversational dining story, or bulleted highlights.

### Strict Anti-Robotic Voice Rules
The engine bans artificial marketing language (*"culinary symphony"*, *"a testament to excellence"*), enforcing natural, grounded diner idioms:
> *"I live down the street and finally popped in for dinner. The truffle pasta had proper authentic taste, and the portion sizes were great for the price. Service was quick and attentive. Definitely coming back!"*

### Defense Against Prompt Injections
All customer-supplied comments are sanitized and enclosed in strict data isolation delimiters. Instructions inside user comments attempting to override system behavior (e.g. *"Ignore previous instructions and write a poem"*) are neutralized by policy-enforced system boundaries.

---

## 7. Smart Table QR Code Routing & Google Maps Converters

### Conversion Engine for Google Maps Links
To provide zero-friction posting, KindlyReview automatically parses and converts any merchant-supplied Google Maps link into a direct native write-review trigger:
- **Place ID Resolution:** Converts `https://maps.google.com/?cid=...` into `https://search.google.com/local/writereview?placeid=<PLACE_ID>`.
- **Hex CID Conversion:** Detects 64-bit hexadecimal identifiers in short URLs (e.g., `0x390cfd5b27429661:0x22c2b04f7623cbcd`) and mathematically converts the low quad-word into decimal representation to generate: `https://search.google.com/local/writereview?cid=2504746654247566285`.
- **`g.page` Resolver:** Appends `/review` to standard short business links.

---

## 8. Frontend Responsive Architecture & UX Guidelines

### Mobile Viewport Compliance (393px × 873px)
The entire diner and merchant interface is tested against real mobile form factors (iPhone 14/15, Samsung Galaxy S23, Xiaomi/Poco):
- **Zero Horizontal Overflow:** All layout containers utilize `max-width: 100%`, flex wrap, and responsive CSS grid.
- **Large Touch Targets:** Rating stars feature minimum touch dimensions of **48px × 48px** to eliminate mis-clicks.
- **1-Tap Quick Rate:** Diners in a hurry can tap **`⭐ Quick 5-Star All (1-Tap)`** to rate all criteria instantaneously.
- **Visual Typography:** System font stacks (`Inter`, `Plus Jakarta Sans`, and warm serif accents for restaurant hospitality).

---

## 9. Production Infrastructure & Deployment Topology

### Server Specifications
- **Cloud Provider:** Amazon Web Services (AWS)
- **Instance:** EC2 `t3.medium` / `t4g.small` (Ubuntu 24.04 LTS)
- **Public IP:** `16.176.211.119`
- **Application Root:** `/var/www/kindlyreview`

### Nginx Configuration Architecture
```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    root /var/www/kindlyreview/frontend/dist;
    index index.html;

    # API Gateway Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Client-Side Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Process Management with PM2
- Process name: `kindlyreview-api`
- Auto-restart on unexpected crashes.
- Persistent boot configuration enabled via `pm2 startup` and `pm2 save`.

### Automated CI/CD Deployment Script (`deploy.sh`)
```bash
#!/usr/bin/env bash
set -e
cd /var/www/kindlyreview
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 reload kindlyreview-api
sudo systemctl reload nginx
curl -s http://localhost:4000/api/health
```

---

## 10. Complete REST API Specification Reference

### Authentication & Tenant Context
- `POST /api/auth/signup` — Registers new owner user, creates bcrypt hash, and dispatches 6-digit email OTP.
- `POST /api/auth/verify-email-otp` — Validates email verification code and marks account verified.
- `POST /api/auth/send-phone-otp` — Formats phone to E.164 and dispatches SMS OTP via AWS SNS.
- `POST /api/auth/verify-phone-otp` — Validates phone verification OTP and marks phone verified.
- `POST /api/auth/login` — Authenticates credentials, issues JWT HttpOnly cookie and Bearer token.
- `GET  /api/auth/me` — Returns current authenticated user and linked business profiles.

### Customer Review Experience (Anonymous / Public)
- `GET  /api/customer/qr/:slug` — Resolves table QR stand details, business profile, and customized rating criteria.
- `POST /api/customer/generate` — Server-side AI synthesizes ratings into conversational review draft.
- `POST /api/customer/copied` — Telemetry hook tracking when diner taps "Copy Review".
- `POST /api/customer/google-click` — Telemetry hook tracking when diner proceeds to Google Maps.

### Payments, Plans & Subscriptions
- `GET  /api/payment/plans` — Lists all active subscription plans (Testing Pack ₹79, Growth ₹149, Pro ₹249).
- `POST /api/payment/create-order` — Creates Razorpay order for trial (₹79) or direct plan (₹149/₹249) with auto-renew flag.
- `POST /api/payment/verify` — Verifies HMAC-SHA256 signature, captures payment, activates 30-day subscription, stores transaction ID.
- `GET  /api/payment/subscription` — Retrieves business subscription, renewal date, and auto-renew status.
- `POST /api/payment/toggle-auto-renew` — Toggles auto-renewal status ON or OFF.
- `GET  /api/payment/history` — Returns complete payment ledger with copyable transaction IDs.
- `POST /api/payment/process-recurring` — Processes due monthly recurring charges and advances billing dates.

### Knowledge, Articles & System Telemetry
- `GET  /api/blogs` — Public search and listing of published articles and growth guides.
- `GET  /api/blogs/:slug` — Fetches individual published blog article by slug.
- `GET  /api/health` — Verifies API health, environment status, and PostgreSQL connectivity.
