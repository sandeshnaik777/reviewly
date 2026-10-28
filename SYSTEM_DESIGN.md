# KindlyReview — Complete Production System Design & Architecture Specification

> **Document Version:** 2.0.0  
> **Last Updated:** October 2026  
> **Target Platform:** AWS EC2 (Ubuntu 24.04 LTS), Nginx Reverse Proxy, PM2 Process Supervisor, Node.js v20+, TypeScript, React + Vite, PostgreSQL 16+

---

## 1. Executive Summary & Core Objectives

**KindlyReview** is an enterprise-grade, multi-tenant SaaS platform engineered specifically for **every local in-person business** — spanning Retail Stores, Healthcare & Dental Clinics, Salons & Spas, Gyms & Fitness Centers, Automobile Care & Workshops, Hotels & Hospitality, Cafes & Restaurants, and Professional Services. Its core mission is to **bridge the friction gap between happy in-person customers and authoritative 5-star Google Maps reviews**, while providing an automated **Reputation Shield** that intercepts dissatisfied customers privately before negative feedback reaches the public domain.

### Key Value Propositions
1. **Zero-App In-Person Customer Experience:** Customers never install an app or register. Scanning a physical counter, desk, or table QR code instantly launches an ultra-lightweight mobile browser experience (Chrome/Safari) taking under 30 seconds to complete.
2. **Authentic, Humanized AI Review Drafting:** Rather than asking customers to write lengthy essays on mobile keyboards, our server-side Google Gemini Flash AI engine synthesizes natural customer ratings and selected highlights into natural, conversational review drafts with 1-tap **Copy & Post to Google Maps**.
3. **Reputation Shield (Private Interception):** Ratings of 1 to 3 stars bypass Google Maps entirely and route directly to the manager's dashboard and WhatsApp/SMS for immediate in-store private resolution.
4. **Starter Trial Pack (₹79) & Recurring Monthly Subscriptions:** High-converting introductory pack at ₹79 (30 days access, 100 reviews, 2 QR stands) with seamless Razorpay integration, automated monthly recurring billing, and persistent transaction ID auditing.

---

## 2. High-Level System Architecture

The following diagram illustrates the end-to-end topology across the client layer, edge reverse proxy, application server, persistent data store, and external third-party cloud APIs.

```mermaid
flowchart TD
    subgraph Clients["1. Client Layer"]
        Customer["Mobile Customer Phone\n(QR Camera Scan -> /r/:slug)"]
        Merchant["Business Owner / Manager\n(Mobile & Desktop Dashboard -> /app)"]
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

### Business & High-Speed Dashboard
- `GET  /api/business/:businessId/dashboard-bootstrap` — High-speed single round-trip bootstrap endpoint bundling business, usage, QRs, recent reviews, questions, settings, analytics summary, subscription, notifications, and payment ledger.
- `GET  /api/business/:businessId` — Returns single business details and settings.
- `PUT  /api/business/:businessId` — Updates business contact, Google Maps URLs, and operational hours.
- `GET  /api/plans` — Public endpoint returning all active subscription tiers.

### Knowledge, Articles & System Telemetry
- `GET  /api/blogs` — Public search and listing of published articles and growth guides.
- `GET  /api/blogs/:slug` — Fetches individual published blog article by slug.
- `GET  /api/health` — Verifies API health, environment status, and PostgreSQL connectivity.

---

## 11. Complete End-to-End System Design & Data Flow Architecture

### 11.1 Flow 1: Macro End-to-End Platform Lifecycle
The macro system flowchart connects merchant onboarding, physical QR deployment, in-person customer scanning, AI synthesis, reputation shielding, and automated revenue expansion.

```mermaid
flowchart TD
    Start([Merchant Visits Platform]) --> Signup["1. Merchant Sign Up\n(Name, Email, Password, Mobile)"]
    Signup --> CatSelect["2. Choose Business Category\n(Retail, Dining, Healthcare, Salon, Auto, Gym, Services)"]
    CatSelect --> BizDetails["3. Enter Store & Business Details\n(Name, Address, Phone, Hours)"]
    BizDetails --> GoogleLink["4. Connect Google Review Link\n(Place ID, Hex CID, or Direct URL)"]
    GoogleLink --> PlanChoice{"5. Subscription Choice"}
    PlanChoice -->|Testing Pack Trial| PayTrial["₹79 Razorpay Payment\n(30 Days Access, 100 Reviews, 2 QRs)"]
    PlanChoice -->|Direct Paid Tier| PayPaid["₹149 Growth / ₹249 Pro\n(Auto-Renewal Enabled)"]
    PayTrial --> Dashboard["6. Business Dashboard Activated"]
    PayPaid --> Dashboard
    
    Dashboard --> DeployQR["7. Deploy Physical QR Stands\n(Billing Counter, Reception, Tables)"]
    DeployQR --> CustScan["8. Customer Scans QR with Phone\n(No App Download Required)"]
    CustScan --> RateTap["9. Customer Taps Quick Ratings\n(Quality, Service, Value, Speed: 1-5 Stars)"]
    
    RateTap --> SentimentCheck{"Rating Sentiment Check"}
    SentimentCheck -->|4 or 5 Stars - Happy| AISynth["10. Server-Side AI Synthesizes\nNatural 5-Star Review Draft"]
    AISynth --> CopyClick["11. 1-Tap 'Copy & Post to Google Maps'"]
    CopyClick --> GoogleMaps["12. Review Posted on Google Business Profile\nSurges Local 3-Pack SEO Rank"]
    
    SentimentCheck -->|1 to 3 Stars - Critical| ShieldRouter["10B. Reputation Shield Activated\nBypasses Public Google Maps"]
    ShieldRouter --> PrivateResolution["11B. Intercepted Directly to Manager\nSMS / WhatsApp Alert for Instant Resolution"]
    
    GoogleMaps --> VelocityEngine["13. Review Velocity Tracked in Analytics"]
    PrivateResolution --> VelocityEngine
    VelocityEngine --> RecurringBilling["14. Monthly Recurring Billing Engine\nAuto-Advances Cycle & Audits Transactions"]
```

---

### 11.2 Flow 2: Merchant Authentication & Onboarding Lifecycle
This sequence tracks the registration, bcrypt hashing, dual-channel verification (AWS SNS SMS + Email OTP), and multi-tenant business creation.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Business Owner
    participant Client as Frontend SPA (React)
    participant API as Express API Server
    participant DB as Database Service
    participant SMS as AWS SNS SMS Service
    participant Mail as Email OTP Service

    Owner->>Client: Enters Name, Email, Password, Mobile Phone
    Client->>API: POST /api/auth/signup
    API->>DB: Check if email already registered
    alt Email exists
        API-->>Client: 409 Conflict (Inline sign-in box offered)
    else New Account
        API->>API: Bcrypt salt hash (10 rounds)
        API->>DB: Persist User (isActive: true, emailVerified: false)
        API->>Mail: Dispatch 6-digit transactional email OTP
        API->>SMS: Dispatch 6-digit transactional SMS OTP (E.164)
        API-->>Client: 201 Created (Token + Session Cookie)
    end
    Owner->>Client: Enters 6-digit OTP code
    Client->>API: POST /api/auth/verify-email
    API->>DB: Validate codeHash & expiry (10-min window)
    API->>DB: Mark emailVerified = true
    API-->>Client: 200 OK (Account Fully Verified)
    Owner->>Client: Completes Category & Store Details
    Client->>API: POST /api/business/setup
    API->>DB: Create Business + Default Questions for Category
    API->>DB: Auto-generate Initial Smart QR Stand
    API-->>Client: 200 OK (Business Initialized)
```

---

### 11.3 Flow 3: Customer QR Scan, Category AI Synthesis & Reputation Shield
This sequence diagram shows the zero-friction customer interaction, AI prompt generation with anti-hallucination guards, and private routing.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as In-Store Customer
    participant Mobile as Mobile Browser
    participant API as Express API
    participant AI as Google Gemini Flash AI
    participant DB as In-Memory / PostgreSQL
    participant Maps as Google Maps App / Web
    actor Mgr as Store Manager

    Customer->>Mobile: Points camera at QR Stand (/r/:slug)
    Mobile->>API: GET /api/customer/qr/:slug
    API->>DB: Fetch business profile, category, & active questions
    API->>DB: Record QR_SCAN analytics event
    API-->>Mobile: 200 OK (Business details, category-specific criteria)
    Customer->>Mobile: Selects ratings (e.g., Food: 5★, Ambience: 5★, Service: 5★)
    Customer->>Mobile: Taps "Generate My Review"
    Mobile->>API: POST /api/customer/generate { ratings, comments, format }
    
    alt Overall Rating >= 4 Stars (Positive Experience)
        API->>AI: Synthesize conversational, humanized review draft
        AI-->>API: Returns natural review (no clichés, category vocabulary)
        API->>DB: Record REVIEW_GENERATED event
        API-->>Mobile: 200 OK { reviewText, directGoogleMapsUrl }
        Customer->>Mobile: Taps "Copy Review" -> Clipboard updated
        Customer->>Mobile: Taps "Open Google Maps"
        Mobile->>Maps: Launches direct review dialog on Google Maps
        Customer->>Maps: Pastes draft & hits Submit
    else Overall Rating <= 3 Stars (Reputation Shield Triggered)
        API->>DB: Record SHIELD_INTERCEPT event
        API-->>Mobile: 200 OK { shielded: true, managerFeedbackReceived: true }
        API->>Mgr: Immediate Alert (Manager SMS / WhatsApp notification)
        Customer->>Mobile: Sees warm thank you: "Manager alerted directly for resolution"
    end
```

---

### 11.4 Flow 4: High-Performance Unified Dashboard Bootstrap Flow
Rather than firing 12 individual requests that choke mobile browsers under the standard 6-connection pool limit, the unified bootstrap endpoint fetches everything in a single round trip.

```mermaid
flowchart LR
    Browser["Client Browser\n(Dashboard Mount)"] -->|1 Single HTTP GET\n/api/business/:id/dashboard-bootstrap| Nginx["Nginx Reverse Proxy"]
    Nginx --> Express["Express Route Handler\n(Auth & Tenant Verified ONCE)"]
    
    Express --> P1["db.findBusinessById()"]
    Express --> P2["db.getUsageRecord()"]
    Express --> P3["db.listQRCodes()"]
    Express --> P4["db.listBusinessReviews()"]
    Express --> P5["db.getBusinessQuestions()"]
    Express --> P6["db.getBusinessSettings()"]
    Express --> P7["db.getBusinessAnalytics()"]
    Express --> P8["db.listSubscriptionPlans()"]
    Express --> P9["subscriptionService.getActiveSubscription()"]
    Express --> P10["db.listNotifications()"]
    Express --> P11["db.listPayments()"]

    P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11 --> Aggregator["Bundle Single JSON Payload\n(Gzip Compressed ~3KB)"]
    Aggregator -->|Instant ~50ms Response| Browser
```

---

### 11.5 Flow 5: Subscription Activation & Recurring Billing Engine
The lifecycle of payment order creation, webhook verification, 30-day period activation, and automated monthly recurring renewals.

```mermaid
flowchart TD
    Checkout["Merchant Chooses Plan\n(Testing Pack ₹79 or Paid ₹149/₹249)"] --> CreateOrder["POST /api/payment/create-order\n(Razorpay Order Created)"]
    CreateOrder --> RzpModal["Razorpay Modal Opens on Client\n(UPI, Card, Netbanking)"]
    RzpModal -->|Customer Pays| RzpCallback["Client Receives Signature & PaymentId"]
    RzpCallback --> VerifyCall["POST /api/payment/verify\n(Payload: orderId, paymentId, signature)"]
    
    VerifyCall --> HMAC["Verify HMAC-SHA256 Signature\nUsing Razorpay Key Secret"]
    HMAC -->|Signature Match| RecordTxn["1. Record in Payment Ledger\n(Stores Transaction ID, Provider, Amount)"]
    RecordTxn --> ActivateSub["2. Activate Subscription Status = 'ACTIVE'\n(Sets Period End = +30 Days, nextBillingDate)"]
    ActivateSub --> AuditLog["3. Write System Audit Log\n(Multi-Tenant Ledger Verified)"]
    AuditLog --> ActiveState["Merchant Enjoys Full Features"]

    ActiveState --> CronJob["Automated Recurring Billing Engine\n(Runs Daily at 00:00 UTC)"]
    CronJob --> DueCheck{"Is nextBillingDate <= NOW()\nAND autoRenew == true?"}
    DueCheck -->|Yes| RenewTxn["Process Recurring Charge\nRecord New Transaction ID"]
    RenewTxn --> AdvanceDate["Advance nextBillingDate by +1 Month"]
    DueCheck -->|No / Paused| NoOp["Skip Until Next Cycle"]
```

---

### 11.6 Flow 6: High-Concurrency In-Memory Map Indexing & Dual Persistence
Ensures $O(1)$ sub-millisecond query performance in memory while guaranteeing zero data loss via PostgreSQL write-through synchronization.

```mermaid
flowchart TD
    Req["Incoming API Request\n(e.g., Tenant Check or QR Query)"] --> MapCheck{"Check In-Memory Map Index\n(usersById, businessesById, settingsById)"}
    MapCheck -->|Cache Hit: O(1) ~0.02ms| ReturnDirect["Return Object Instantly"]
    MapCheck -->|Cache Miss| ArrayScan["Scan Array & Populate Map Index"]
    ArrayScan --> ReturnDirect

    Mutation["Write Mutation\n(e.g., Update Profile, Save Settings, Record Review)"] --> MemUpdate["1. Update In-Memory Array & Map Indexes\n(Immediate O(1) Availability)"]
    MemUpdate --> WriteLock["2. Acquire Async Write Lock Sequence"]
    WriteLock --> LocalJSON["3. Atomic Write to Local JSON Store\n(CPU-Optimized Single Compact JSON)"]
    LocalJSON --> PGStore["4. UPSERT into PostgreSQL Cluster\nkindlyreview_store (id = 'primary')"]
    LocalJSON --> RelationalSync["5. Direct Dual-Write to Relational Tables\n(payment_records & system_audit_logs)"]
    PGStore --> Ack["6. Return Verified Response to Client"]
    RelationalSync --> Ack
```

### 11.7 Flow 7: Target Keyword Injection, Humanized Review Voice & 9–10 Line Story Flow
Illustrates how merchant-configured target keywords (e.g., "16GB RAM", "SSD Upgrade", "Honest Pricing") are combined with smart category suggestions, surfaced on customer mobile touchpoints, and naturally woven into authentic, non-formal everyday English reviews.

```mermaid
flowchart TD
    Merchant["Merchant in Dashboard"] --> SetKw["1. Configures Target Keywords\n(e.g., '16GB RAM', 'SSD Upgrade')\nOr Clicks Smart Category Suggestions"]
    SetKw --> SaveSettings["PUT /api/business/:id/settings\n(Persisted in targetKeywords & PostgreSQL)"]
    
    Customer["In-Store Customer"] --> ScanQR["2. Scans QR Counter Stand\nGET /api/customer/qr/:slug"]
    SaveSettings -.-> ScanQR
    ScanQR --> MobileView["3. Customer Mobile View Loads\nDisplays Target Keyword Chips\n+ 9-10 Line Story Option"]
    
    MobileView --> TapItems["4. Customer Taps Keyword Chips\n(Optional) & Chooses Review Length"]
    TapItems --> SubmitRatings["5. POST /api/customer/generate\n(Ratings + Chosen Keywords + Length: detailed)"]
    
    SubmitRatings --> AIEngine["6. Gemini AI / High-Entropy Combinatorial Engine"]
    
    subgraph NaturalHumanVoiceRules ["Everyday Human English Rules"]
        R1["Strictly casual, everyday conversational tone"]
        R2["FORBIDDEN: 'impeccable', 'culinary delight', 'testament', 'patronage', 'ambiance'"]
        R3["MUST sound like real customer writing on smartphone"]
        R4["9–10 Line Detailed Story Structure:\nReason for visit -> Staff -> Keyword/Item -> Quality -> Honest Price -> Turnaround -> Testing -> Recommendation"]
    end
    
    AIEngine --> NaturalHumanVoiceRules
    NaturalHumanVoiceRules --> ReviewOutput["7. 9–10 Line Authentic Customer Review Generated"]
    ReviewOutput --> ShieldCheck{"Customer Rating Check"}
    ShieldCheck -->|4-5 Stars| OneTapGoogle["8. 1-Tap Copy & Forward to Google Maps"]
    ShieldCheck -->|1-3 Stars| PrivateShield["8. Private Interception into Merchant Inbox"]
    
    OneTapGoogle --> AuditLog["9. Log Audited to PostgreSQL system_audit_logs"]
    PrivateShield --> AuditLog
```



