import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found! Run "vite build" first.');
  process.exit(1);
}

const baseIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const pages = [
  {
    path: 'pricing',
    title: 'Pricing & Transparent Subscription Plans — KindlyRate',
    description: 'Explore affordable KindlyRate pricing: Starter Pack at ₹79, Growth Pack at ₹149/mo, and Scale Pro at ₹249/mo. Smart NFC QR counter stands, AI review assistant, and local SEO booster with zero platform lock-in.',
    heading: 'Simple, Transparent Pricing for Growing Businesses',
    subheading: 'No hidden setup fees. Deploy smart QR stands and start collecting verified 5-star Google Maps reviews immediately.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Pricing', url: 'https://kindlyrate.com/pricing' }
    ],
    schemaType: 'Product',
    schemaExtra: {
      name: 'KindlyRate Google Review Platform',
      description: 'Smart NFC QR counter stand and AI-driven Google Maps review management platform.',
      brand: { '@type': 'Brand', name: 'KindlyRate' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: '79',
        highPrice: '249',
        offerCount: '3',
        offers: [
          {
            '@type': 'Offer',
            name: 'Testing Starter Pack',
            price: '79',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            description: '30-day trial with full access, smart counter QR stand, and AI review generator.'
          },
          {
            '@type': 'Offer',
            name: 'Growth Pack',
            price: '149',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            description: 'Monthly subscription with 100 review generations/month, multi-lingual AI drafting, and WhatsApp alerts.'
          },
          {
            '@type': 'Offer',
            name: 'Scale Pro Pack',
            price: '249',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            description: 'Unlimited review generations, prioritized Google Maps SEO keyword injection, and multi-location management.'
          }
        ]
      }
    },
    contentHtml: `
      <section style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; font-size: 14px; color: #64748b;">
          <a href="/" style="color: #9a4018; text-decoration: none;">Home</a> &gt; <span>Pricing</span>
        </nav>
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">KindlyRate Pricing & Subscription Plans</h1>
        <p style="font-size: 18px; color: #475569; max-width: 800px; line-height: 1.6; margin-bottom: 40px;">
          Empower your retail store, clinic, salon, cafe, or business with physical smart QR counter stands and cutting-edge AI review generation. Flexible monthly billing with no lock-ins.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px;">
          <div style="border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff;">
            <span style="display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 20px; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 16px;">TRIAL ACTIVATION</span>
            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Starter Pack</h2>
            <div style="font-size: 38px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">₹79 <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ 30-day access</span></div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Ideal for testing on-counter QR conversion and seeing initial review velocity.</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; font-size: 14px; line-height: 2; color: #334155;">
              <li>✓ Instant Smart QR Code Generation</li>
              <li>✓ Ready-to-print counter stand templates</li>
              <li>✓ Multi-lingual AI review drafting</li>
              <li>✓ 100% Negative Review Interception Shield</li>
            </ul>
            <a href="/signup" style="display: block; text-align: center; background: #9a4018; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">Start With ₹79 Pack</a>
          </div>

          <div style="border: 2px solid #9a4018; border-radius: 16px; padding: 32px; background: #fffaf8; position: relative;">
            <span style="display: inline-block; padding: 4px 12px; background: #9a4018; border-radius: 20px; font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">MOST POPULAR</span>
            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Growth Pack</h2>
            <div style="font-size: 38px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">₹149 <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ month</span></div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Engineered for active single-location businesses targeting Rank #1 on Google Maps.</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; font-size: 14px; line-height: 2; color: #334155;">
              <li>✓ Everything in Starter Pack</li>
              <li>✓ 100 AI review drafts per month</li>
              <li>✓ Target Keyword Injection for Local 3-Pack</li>
              <li>✓ WhatsApp alerts for private customer feedback</li>
              <li>✓ Live counter scan telemetry & analytics</li>
            </ul>
            <a href="/signup" style="display: block; text-align: center; background: #9a4018; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">Choose Growth Pack</a>
          </div>

          <div style="border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff;">
            <span style="display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 20px; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 16px;">HIGH VELOCITY</span>
            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Scale Pro Pack</h2>
            <div style="font-size: 38px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">₹249 <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ month</span></div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">For busy stores, clinics, and multi-location businesses needing maximum review volume.</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; font-size: 14px; line-height: 2; color: #334155;">
              <li>✓ Unlimited AI review generations</li>
              <li>✓ Multiple counter QR stands support</li>
              <li>✓ Dynamic review routing by staff / table</li>
              <li>✓ Dedicated priority support & onboarding</li>
            </ul>
            <a href="/signup" style="display: block; text-align: center; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">Choose Scale Pro</a>
          </div>
        </div>
      </section>
    `
  },
  {
    path: 'features',
    title: 'Platform Features & Smart QR Stand Technology — KindlyRate',
    description: 'Explore KindlyRate features: Smart QR & NFC counter stands, dynamic multi-lingual AI review drafting, 100% negative feedback interception shield, and Google Maps Local 3-Pack rank booster.',
    heading: 'Purpose-Built Review Automation for Brick-and-Mortar Businesses',
    subheading: 'Capture 5-star customer reviews at the exact moment of peak satisfaction.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Features', url: 'https://kindlyrate.com/features' }
    ],
    schemaType: 'SoftwareApplication',
    schemaExtra: {
      name: 'KindlyRate Review Acceleration Suite',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '79', priceCurrency: 'INR' },
      featureList: [
        'Smart QR & NFC Counter Stands',
        'AI Natural English & Multilingual Review Drafting',
        'Private Negative Feedback Interception Shield',
        'Target Keyword Injection for Google Maps Local 3-Pack',
        'Live Real-time Scan & Review Telemetry'
      ]
    },
    contentHtml: `
      <section style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; font-size: 14px; color: #64748b;">
          <a href="/" style="color: #9a4018; text-decoration: none;">Home</a> &gt; <span>Features</span>
        </nav>
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">KindlyRate Platform Features &amp; Smart QR Stand Technology</h1>
        <p style="font-size: 18px; color: #475569; max-width: 800px; line-height: 1.6; margin-bottom: 40px;">
          Everything you need to turn customer footfall into verified 5-star Google Maps reviews while protecting your reputation.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px;">
          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 28px;">
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">1. Smart QR &amp; NFC Counter Stands</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              Place our laser-crafted counter stands on billing desks, reception tables, or dining areas. Customers simply tap with NFC or scan with their phone camera to launch your branded review flow in under 3 seconds.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 28px;">
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">2. AI-Assisted Natural Review Assistant</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              Most happy customers hesitate because they don't know what to write. KindlyRate's built-in AI drafts authentic, articulate reviews based on quick feedback tags, giving customers a polished review to post with 1 tap.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 28px;">
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">3. 100% Reputation Shield (Private Resolution)</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              If a customer has a complaint or rates 1–3 stars, KindlyRate intercepts the feedback privately and delivers it directly to your management WhatsApp and dashboard before it ever hits Google Maps.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 28px;">
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">4. Target Keyword Injection for Local 3-Pack</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              Google Maps ranks businesses based on keywords in real customer reviews. KindlyRate prompts customers to mention specific services (e.g., "fast screen replacement", "hygienic root canal") boosting your ranking for local search queries.
            </p>
          </div>
        </div>
      </section>
    `
  },
  {
    path: 'faq',
    title: 'Frequently Asked Questions — KindlyRate Google Reviews Platform',
    description: 'Frequently asked questions about KindlyRate: How smart QR stands work, pricing, Google Maps compliance, negative review interception, and hardware delivery.',
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about KindlyRate, Google reviews compliance, and smart QR counter stands.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'FAQ', url: 'https://kindlyrate.com/faq' }
    ],
    schemaType: 'FAQPage',
    schemaExtra: {
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does KindlyRate violate Google Maps review guidelines?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. KindlyRate is 100% compliant with Google Business Profile policies. All reviews are posted directly by verified customers using their own Google accounts from their personal mobile devices.'
          }
        },
        {
          '@type': 'Question',
          name: 'How does KindlyRate protect my business against 1-star negative reviews?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If a customer indicates an issue by choosing 1 to 3 stars on the QR stand flow, KindlyRate intercepts the complaint privately. Rather than routing them to Google Maps, it opens a private resolution form that alerts the business manager immediately.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I test KindlyRate before committing to a long-term plan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! KindlyRate offers a ₹79 Starter Testing Pack with 30-day access, allowing you to test customer scan rates and review generation risk-free.'
          }
        }
      ]
    },
    contentHtml: `
      <section style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; font-size: 14px; color: #64748b;">
          <a href="/" style="color: #9a4018; text-decoration: none;">Home</a> &gt; <span>FAQ</span>
        </nav>
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Frequently Asked Questions</h1>
        <p style="font-size: 18px; color: #475569; margin-bottom: 40px;">Answers to common merchant questions about KindlyRate smart review stands, local SEO, and billing.</p>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Does KindlyRate comply with Google Maps review policies?</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Yes, absolutely. KindlyRate does not use bots, incentivized fake reviews, or automated posting. Customers authenticate and submit reviews from their personal mobile devices on Google Maps.</p>
          </div>
          <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How does KindlyRate intercept negative reviews?</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">When a dissatisfied customer selects 1 to 3 stars, KindlyRate opens a private, internal feedback form. The manager receives an instant alert via WhatsApp or email, allowing you to resolve the problem before it becomes a public negative review on Google Maps.</p>
          </div>
          <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How soon will my business rank in the Google Maps Local 3-Pack?</h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Most businesses see significant ranking improvements within 14 to 30 days of consistent daily review capture. Our keyword injection ensures that reviews contain the high-intent search terms Google algorithms prioritize.</p>
          </div>
        </div>
      </section>
    `
  },
  {
    path: 'blog',
    title: 'Local SEO Playbooks & Google Maps Ranking Guides — KindlyRate Blog',
    description: 'Expert actionable playbooks on Google Maps Local 3-Pack optimization, smart QR counter stands, review velocity algorithms, and legal reputation management for brick-and-mortar merchants.',
    heading: 'KindlyRate Local SEO & Business Growth Playbook',
    subheading: 'Actionable, data-backed masterclasses for business owners, clinic directors, salon founders, and enterprise multi-location managers.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Blog', url: 'https://kindlyrate.com/blog' }
    ],
    schemaType: 'CollectionPage',
    contentHtml: `
      <section style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; font-size: 14px; color: #64748b;">
          <a href="/" style="color: #9a4018; text-decoration: none;">Home</a> &gt; <span>Blog &amp; Local SEO Guides</span>
        </nav>
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Local SEO Guides &amp; Google Maps Playbooks</h1>
        <p style="font-size: 18px; color: #475569; max-width: 800px; line-height: 1.6; margin-bottom: 40px;">
          Learn the architectural secrets of Google Maps Local 3-Pack, review velocity optimization, and customer review conversion.
        </p>

        <div style="display: flex; flex-direction: column; gap: 24px;">
          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/how-to-dominate-google-maps-local-3-pack-rankings-2026" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">The Definitive 2026 Guide to Dominating Google Maps Local 3-Pack Rankings for Every Business</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">Comprehensive 15-point architectural breakdown of Google Maps local algorithm: how review velocity, keyword density in reviews, recency, and proximity interact to propel retail shops, clinics, and service businesses to Rank #1.</p>
            <a href="/blog/how-to-dominate-google-maps-local-3-pack-rankings-2026" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Masterclass →</a>
          </article>

          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/smart-nfc-qr-stands-vs-sms-whatsapp-review-requests" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Why Smart Counter QR &amp; NFC Stands Outperform SMS &amp; WhatsApp Review Links by 800%</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">Point-of-experience review capture analysis: why requesting reviews 3 hours later via SMS yields less than 4% conversion, while physical on-counter NFC stands convert over 34% of retail and clinic visitors.</p>
            <a href="/blog/smart-nfc-qr-stands-vs-sms-whatsapp-review-requests" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Analysis →</a>
          </article>

          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/shielding-business-from-unfair-1-star-fake-reviews-legally" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How to Shield Your Business from Unfair 1-Star &amp; Competitor Fake Reviews Legally</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">The playbook for legal reputation shielding: intercepting disgruntled customer feedback in real time, converting potential public complaints into private resolution tickets, and successfully challenging defamatory reviews.</p>
            <a href="/blog/shielding-business-from-unfair-1-star-fake-reviews-legally" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Playbook →</a>
          </article>

          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/keyword-injection-and-semantic-search-in-customer-reviews" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How Customer Review Keywords Power Google Maps Semantic Search Rankings</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">Deep dive into Google Maps semantic entity extraction: how specific purchase keywords in customer reviews trigger Google Local 3-Pack justifications and boost map rankings.</p>
            <a href="/blog/keyword-injection-and-semantic-search-in-customer-reviews" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Deep Dive →</a>
          </article>

          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/why-businesses-are-replacing-generic-aggregators-with-bespoke-software" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Why Modern Merchants Are Replacing Generic Review Aggregators with KindlyRate</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">Analysis of modern local marketing: why brick-and-mortar stores are abandoning clunky legacy review software for lightweight, high-converting smart QR platforms.</p>
            <a href="/blog/why-businesses-are-replacing-generic-aggregators-with-bespoke-software" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Case Study →</a>
          </article>

          <article style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <a href="/blog/enterprise-multi-location-review-architecture" style="text-decoration: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Enterprise Architecture for Multi-Location Google Business Profile Management</h2>
            </a>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 12px;">How retail chains, multi-location franchises, and restaurant groups scale Google reviews across 50+ branches with centralized API telemetry and branch leaderboards.</p>
            <a href="/blog/enterprise-multi-location-review-architecture" style="color: #9a4018; font-weight: 700; text-decoration: none;">Read Architecture Guide →</a>
          </article>
        </div>
      </section>
    `
  },
  {
    path: 'login',
    title: 'Merchant Sign In — KindlyRate Business Portal',
    description: 'Log into your KindlyRate merchant portal to monitor real-time QR stand scans, customize AI prompt keywords, view analytics, and manage customer reviews.',
    heading: 'Sign In to Your Merchant Dashboard',
    subheading: 'Access your Google Maps review telemetry, customize your QR stands, and monitor customer satisfaction.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Login', url: 'https://kindlyrate.com/login' }
    ],
    contentHtml: `
      <section style="max-width: 500px; margin: 40px auto; padding: 32px 20px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Merchant Sign In</h1>
        <p style="font-size: 15px; color: #64748b; margin-bottom: 24px;">Manage your smart QR stands and Google reviews.</p>
        <p style="font-size: 14px; color: #334155;">Please sign in using your registered merchant email or Google Account.</p>
      </section>
    `
  },
  {
    path: 'signup',
    title: 'Get Started Free — Create Your KindlyRate Merchant Account',
    description: 'Create your KindlyRate merchant account in 60 seconds. Claim your smart review stand, configure your Google Business Profile, and start capturing 5-star reviews.',
    heading: 'Create Your KindlyRate Merchant Account',
    subheading: 'Join thousands of local businesses boosting their Google Maps Local 3-Pack rankings.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Sign Up', url: 'https://kindlyrate.com/signup' }
    ],
    contentHtml: `
      <section style="max-width: 550px; margin: 40px auto; padding: 32px 20px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Claim Your Smart Review Stand</h1>
        <p style="font-size: 15px; color: #64748b; margin-bottom: 24px;">Start capturing 5-star Google Maps reviews at your counter today.</p>
      </section>
    `
  },
  {
    path: 'help',
    title: 'Help Center & Merchant Support — KindlyRate',
    description: 'KindlyRate Help Center: Step-by-step merchant setup guides, QR stand placement best practices, Google Business Profile troubleshooting, and merchant support contact.',
    heading: 'KindlyRate Help Center & Support',
    subheading: 'Find answers, video tutorials, and direct support for your smart review stands.',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Help', url: 'https://kindlyrate.com/help' }
    ],
    contentHtml: `
      <section style="max-width: 800px; margin: 40px auto; padding: 32px 20px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Help Center &amp; Support</h1>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Need assistance with your KindlyRate QR stand or Google Maps integration?</p>
        <p style="font-size: 15px; color: #334155;">Contact our support team directly at <a href="mailto:support@kindlyrate.com" style="color: #9a4018; font-weight: 600;">support@kindlyrate.com</a> or message us on WhatsApp for rapid assistance.</p>
      </section>
    `
  },
  {
    path: 'terms',
    title: 'Terms of Service — KindlyRate Platform',
    description: 'Terms of Service and merchant agreement for KindlyRate Google Reviews & Local SEO Platform.',
    heading: 'KindlyRate Terms of Service',
    subheading: 'Last updated: November 2026',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Terms of Service', url: 'https://kindlyrate.com/terms' }
    ],
    contentHtml: `
      <section style="max-width: 800px; margin: 40px auto; padding: 32px 20px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Terms of Service</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Review the terms and conditions governing the use of the KindlyRate platform and smart review stands.</p>
      </section>
    `
  },
  {
    path: 'privacy',
    title: 'Privacy Policy — KindlyRate Platform',
    description: 'Privacy Policy: Learn how KindlyRate collects, protects, and handles merchant and customer data.',
    heading: 'KindlyRate Privacy Policy',
    subheading: 'Last updated: November 2026',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Privacy Policy', url: 'https://kindlyrate.com/privacy' }
    ],
    contentHtml: `
      <section style="max-width: 800px; margin: 40px auto; padding: 32px 20px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Privacy Policy</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">We respect your privacy and protect all merchant and customer data in strict compliance with applicable privacy regulations.</p>
      </section>
    `
  },
  {
    path: 'refund',
    title: 'Cancellation & Refund Policy — KindlyRate',
    description: 'KindlyRate Cancellation and Refund Policy: Transparent terms for monthly subscriptions and starter packs.',
    heading: 'Cancellation & Refund Policy',
    subheading: 'Last updated: November 2026',
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Refund Policy', url: 'https://kindlyrate.com/refund' }
    ],
    contentHtml: `
      <section style="max-width: 800px; margin: 40px auto; padding: 32px 20px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Cancellation &amp; Refund Policy</h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">You can cancel your KindlyRate subscription at any time directly from your merchant billing dashboard with zero cancellation penalties.</p>
      </section>
    `
  }
];

// Blog articles data for pre-rendering
const blogArticles = [
  {
    slug: 'how-to-dominate-google-maps-local-3-pack-rankings-2026',
    title: 'The Definitive 2026 Guide to Dominating Google Maps Local 3-Pack Rankings for Every Business',
    description: 'Comprehensive 15-point architectural breakdown of Google Maps local algorithm: how review velocity, keyword density in reviews, recency, and proximity interact to propel retail shops, clinics, and service businesses to Rank #1.',
    author: 'Platform SEO Research Lab',
    publishedDate: '2026-10-25',
    content: `
      <h2>The Three Pillars of Google Local Search Ranking</h2>
      <p>Google's internal ranking pipeline evaluates local listings across three core dimensions: <strong>Relevance</strong>, <strong>Distance (Proximity)</strong>, and <strong>Prominence</strong>.</p>
      <h3>1. Prominence (~48% Weight)</h3>
      <p>Total review count, rolling 30-day velocity, average rating (4.7★+), and sentiment polarity. Continuous on-site QR capture generates fresh daily reviews from verified customer devices.</p>
      <h3>2. Relevance (~34% Weight)</h3>
      <p>Semantic keywords inside customer review texts, business category alignment, and profile attributes. Target keyword prompts suggest specific purchases that customers inject into reviews.</p>
      <h3>3. Distance & Proximity (~18% Weight)</h3>
      <p>Physical distance between searcher GPS coordinates and Google Business listing. High prominence and velocity allow listings to outrank competitors up to 8.5 km outside their immediate physical radius.</p>
    `
  },
  {
    slug: 'smart-nfc-qr-stands-vs-sms-whatsapp-review-requests',
    title: 'Why Smart Counter QR & NFC Stands Outperform SMS & WhatsApp Review Links by 800%',
    description: 'Point-of-experience review capture analysis: why requesting reviews 3 hours later via SMS yields less than 4% conversion, while physical on-counter NFC stands convert over 34% of retail and clinic visitors.',
    author: 'Conversion Engineering Team',
    publishedDate: '2026-10-26',
    content: `
      <h2>The Post-Transaction Friction Valley</h2>
      <p>When merchants send review links via SMS or WhatsApp hours after the customer has left, conversion plummets to under 4%. Customers are driving, working, or with family.</p>
      <h2>Point-of-Experience Capture at the Billing Counter</h2>
      <p>Having a dedicated, tactile NFC & QR stand at the counter captures reviews during peak customer gratitude. The transaction is fresh, the customer is physically present, and completion takes under 20 seconds.</p>
    `
  },
  {
    slug: 'shielding-business-from-unfair-1-star-fake-reviews-legally',
    title: 'How to Shield Your Business from Unfair 1-Star & Competitor Fake Reviews Legally',
    description: 'The playbook for legal reputation shielding: intercepting disgruntled customer feedback in real time, converting potential public complaints into private resolution tickets, and successfully challenging defamatory reviews.',
    author: 'Legal & Reputation Operations Team',
    publishedDate: '2026-10-27',
    content: `
      <h2>The Damage of a Single 1-Star Rating</h2>
      <p>Harvard Business School research proves a one-star drop on Google Maps results in a 5% to 9% decline in top-line revenue for local businesses.</p>
      <h2>Private Interception and Recovery</h2>
      <p>KindlyRate provides an immediate private resolution channel for ratings of 1 to 3 stars, notifying store managers within seconds so complaints are resolved in-store rather than published permanently on Google Maps.</p>
    `
  },
  {
    slug: 'keyword-injection-and-semantic-search-in-customer-reviews',
    title: 'How Customer Review Keywords Power Google Maps Semantic Search Rankings',
    description: 'Deep dive into Google Maps semantic entity extraction: how specific purchase keywords in customer reviews trigger Google Local 3-Pack justifications and boost map rankings.',
    author: 'Semantic Search Specialist',
    publishedDate: '2026-10-28',
    content: `
      <h2>Entity Extraction in Modern Local Algorithms</h2>
      <p>Google no longer just matches keywords in your business title. Google's BERT and Gemini algorithms read the actual words written by customers in your reviews to justify search placements.</p>
      <h2>Dynamic AI Keyword Prompts</h2>
      <p>KindlyRate's AI suggests specific positive tags (e.g. "quick battery replacement", "fair pricing", "expert haircut") which customers naturally incorporate into their reviews.</p>
    `
  },
  {
    slug: 'why-businesses-are-replacing-generic-aggregators-with-bespoke-software',
    title: 'Why Modern Merchants Are Replacing Generic Review Aggregators with KindlyRate',
    description: 'Analysis of modern local marketing: why brick-and-mortar stores are abandoning clunky legacy review software for lightweight, high-converting smart QR platforms.',
    author: 'Retail Strategy Group',
    publishedDate: '2026-10-29',
    content: `
      <h2>The Problem with Legacy Enterprise Aggregators</h2>
      <p>Legacy review aggregators charge expensive monthly retainers, mandate annual contracts, and provide clunky software meant for desk workers rather than physical retail counters.</p>
      <h2>Lightweight, Hardware-Driven Excellence</h2>
      <p>KindlyRate simplifies review growth into a plug-and-play experience designed specifically for billing counters, reception desks, and physical merchant locations.</p>
    `
  },
  {
    slug: 'enterprise-multi-location-review-architecture',
    title: 'Enterprise Architecture for Multi-Location Google Business Profile Management',
    description: 'How retail chains, multi-location franchises, and restaurant groups scale Google reviews across 50+ branches with centralized API telemetry and branch leaderboards.',
    author: 'Enterprise Solutions Architect',
    publishedDate: '2026-10-30',
    content: `
      <h2>Scaling Across 50+ Physical Locations</h2>
      <p>Managing multi-branch review velocity manually is impossible. KindlyRate enables corporate headquarters to deploy branded stands across dozens of branches with unified performance dashboards and regional leaderboards.</p>
    `
  }
];

// Add blog posts to pages list
for (const blog of blogArticles) {
  pages.push({
    path: `blog/${blog.slug}`,
    title: `${blog.title} — KindlyRate`,
    description: blog.description,
    heading: blog.title,
    subheading: `By ${blog.author} • Published on ${blog.publishedDate}`,
    breadcrumbs: [
      { name: 'Home', url: 'https://kindlyrate.com/' },
      { name: 'Blog', url: 'https://kindlyrate.com/blog' },
      { name: blog.title, url: `https://kindlyrate.com/blog/${blog.slug}` }
    ],
    schemaType: 'BlogPosting',
    schemaExtra: {
      headline: blog.title,
      description: blog.description,
      author: { '@type': 'Person', name: blog.author },
      publisher: {
        '@type': 'Organization',
        name: 'KindlyRate',
        url: 'https://kindlyrate.com',
        logo: { '@type': 'ImageObject', url: 'https://kindlyrate.com/favicon-192x192.png' }
      },
      datePublished: blog.publishedDate,
      dateModified: '2026-11-10',
      mainEntityOfPage: `https://kindlyrate.com/blog/${blog.slug}`
    },
    contentHtml: `
      <article style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; font-size: 14px; color: #64748b;">
          <a href="/" style="color: #9a4018; text-decoration: none;">Home</a> &gt; 
          <a href="/blog" style="color: #9a4018; text-decoration: none;">Blog</a> &gt; 
          <span style="color: #0f172a;">${blog.title}</span>
        </nav>
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 12px;">${blog.title}</h1>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
          By <strong>${blog.author}</strong> • Published ${blog.publishedDate} • KindlyRate Research Lab
        </div>
        <div style="font-size: 16px; color: #334155; line-height: 1.8;">
          ${blog.content}
        </div>
        <div style="margin-top: 48px; padding: 24px; background: #fffaf8; border: 2px solid #9a4018; border-radius: 12px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Ready to boost your Google Maps rankings?</h2>
          <p style="font-size: 15px; color: #475569; margin-bottom: 18px;">Deploy KindlyRate smart QR stands at your counter and collect 5-star customer reviews automatically.</p>
          <a href="/signup" style="display: inline-block; background: #9a4018; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700;">Get Started for ₹79 →</a>
        </div>
      </article>
    `
  });
}

console.log(`🚀 Starting SEO static page pre-rendering for ${pages.length} pages...`);

let generatedCount = 0;

for (const p of pages) {
  const pageUrl = `https://kindlyrate.com/${p.path}`;
  const outDir = path.join(distDir, p.path);
  fs.mkdirSync(outDir, { recursive: true });

  // Build Breadcrumb Schema
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: p.breadcrumbs.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      item: b.url
    }))
  };

  // Build Page Schemas
  const schemas = [breadcrumbSchema];
  if (p.schemaType && p.schemaExtra) {
    schemas.push({
      '@type': p.schemaType,
      '@id': `${pageUrl}#${p.schemaType.toLowerCase()}`,
      url: pageUrl,
      ...p.schemaExtra
    });
  }

  const pageSchemaScript = `
    <!-- Page Specific Structured Data (Schema.org) -->
    <script type="application/ld+json">
    ${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemas }, null, 2)}
    </script>
  `;

  let html = baseIndexHtml;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${p.title}</title>`);

  // Replace Canonical Link (THIS IS THE CRITICAL FIX FOR GSC)
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${pageUrl}" />`
  );

  // Replace Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${p.description.replace(/"/g, '&quot;')}" />`
  );

  // Replace OpenGraph Tags
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${pageUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${p.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${p.description.replace(/"/g, '&quot;')}" />`
  );

  // Replace Twitter Card Tags
  html = html.replace(
    /<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:url" content="${pageUrl}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${p.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${p.description.replace(/"/g, '&quot;')}" />`
  );

  // Inject Page Specific Structured Data before </head>
  html = html.replace('</head>', `${pageSchemaScript}\n  </head>`);

  // Inject Pre-rendered Crawlable Content inside <div id="root">
  // When React mounts, it replaces this content seamlessly
  const crawlableRoot = `
    <div id="root">
      <header style="background: #ffffff; border-bottom: 1.5px solid #e2e8f0; padding: 14px 20px;">
        <nav aria-label="Main Navigation" style="max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <a href="/" style="font-size: 20px; font-weight: 800; color: #9a4018; text-decoration: none;">KindlyRate</a>
          <div style="display: flex; gap: 16px; font-size: 14px; font-weight: 600;">
            <a href="/features" style="color: #334155; text-decoration: none;">Features</a>
            <a href="/pricing" style="color: #334155; text-decoration: none;">Pricing</a>
            <a href="/blog" style="color: #334155; text-decoration: none;">Blog</a>
            <a href="/faq" style="color: #334155; text-decoration: none;">FAQ</a>
            <a href="/login" style="color: #334155; text-decoration: none;">Sign In</a>
            <a href="/signup" style="color: #9a4018; text-decoration: none;">Get Started</a>
          </div>
        </nav>
      </header>
      <main role="main">
        ${p.contentHtml}
      </main>
      <footer style="background: #0f172a; color: #94a3b8; padding: 40px 20px; margin-top: 60px;">
        <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; font-size: 14px;">
          <div>
            <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin-bottom: 12px;">KindlyRate</h3>
            <p style="line-height: 1.6;">#1 AI Google Reviews &amp; Local SEO Platform for Every Business.</p>
          </div>
          <div>
            <h4 style="color: #ffffff; font-size: 14px; font-weight: 700; margin-bottom: 12px;">Navigation</h4>
            <p><a href="/" style="color: #94a3b8; text-decoration: none;">Home</a></p>
            <p><a href="/features" style="color: #94a3b8; text-decoration: none;">Features</a></p>
            <p><a href="/pricing" style="color: #94a3b8; text-decoration: none;">Pricing</a></p>
            <p><a href="/blog" style="color: #94a3b8; text-decoration: none;">Blog &amp; SEO Guides</a></p>
          </div>
          <div>
            <h4 style="color: #ffffff; font-size: 14px; font-weight: 700; margin-bottom: 12px;">Legal &amp; Support</h4>
            <p><a href="/help" style="color: #94a3b8; text-decoration: none;">Help Center</a></p>
            <p><a href="/terms" style="color: #94a3b8; text-decoration: none;">Terms of Service</a></p>
            <p><a href="/privacy" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a></p>
            <p><a href="/refund" style="color: #94a3b8; text-decoration: none;">Refund Policy</a></p>
          </div>
        </div>
      </footer>
    </div>
  `;

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, crawlableRoot.trim());

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  generatedCount++;
}

console.log(`✅ Successfully generated ${generatedCount} SEO static pages with individual canonical tags!`);
