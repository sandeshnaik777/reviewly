import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export const careersRouter = Router();

// 12 Curated Real-World Job Openings for KindlyRate
export const OPEN_JOBS = [
  {
    id: 'job-bda-01',
    title: 'Business Development Associate (Inside & Field Sales)',
    department: 'Sales & BD',
    location: 'Bengaluru, Karnataka (On-site / Field)',
    type: 'Full-time',
    experience: '0–2 Years (Freshers with strong communication welcome)',
    salaryRange: '₹4.5 LPA – ₹7.5 LPA + Uncapped Monthly Incentives',
    tags: ['Sales', 'B2B SaaS', 'Merchant Onboarding', 'Field Growth'],
    summary: 'Drive in-person and inside outreach to high-traffic restaurant chains, aesthetic clinics, salons, and retail stores across Bengaluru and South India.',
    responsibilities: [
      'Conduct live product demos of KindlyRate acrylic QR counter stands to store owners and branch managers.',
      'Manage sales pipeline from discovery calls to on-site closure and counter placement.',
      'Collaborate with the Merchant Success team to ensure active QR stand deployment and customer scan adoption.',
      'Achieve monthly recurring subscription and stand distribution targets.'
    ],
    requirements: [
      'High-energy communicator with persuasive oral presentation skills in English and Kannada or Hindi.',
      'Self-driven hunger to learn tech B2B sales and field territory mapping.',
      'Prior internship or experience in retail sales, foodtech (Zomato/Swiggy), or SaaS onboarding is a strong plus.'
    ],
  },
  {
    id: 'job-sde-intern-02',
    title: 'Software Development Engineer Intern (Full-Stack)',
    department: 'Engineering',
    location: 'Bengaluru (Hybrid / Office)',
    type: 'Internship (6 Months)',
    experience: 'Student / Recent Graduate (Batch 2024 / 2025 / 2026)',
    salaryRange: '₹25,000 – ₹35,000 / month Stipend + Full-Time PPO',
    tags: ['Node.js', 'React', 'TypeScript', 'Vite', 'PostgreSQL'],
    summary: 'Work directly alongside our founding engineering team shipping customer-facing features on KindlyRate web apps, QR routing engines, and analytics telemetry.',
    responsibilities: [
      'Build responsive UI workflows in React, TypeScript, and modern CSS for merchant dashboards.',
      'Develop robust Node.js / Express REST APIs with end-to-end integration test coverage.',
      'Optimize client load times, mobile touch responsiveness, and automated SEO pre-rendering pipelines.',
      'Participate in daily engineering scrums, PR code reviews, and production releases on AWS.'
    ],
    requirements: [
      'Strong command of JavaScript/TypeScript, React hooks, HTML/CSS, and Node.js fundamentals.',
      'Personal coding projects, open-source contributions, or previous internship experience.',
      'Eager to learn clean architecture, concurrency safety, and scalable cloud deployments.'
    ],
  },
  {
    id: 'job-senior-sde-03',
    title: 'Senior Software Engineer (Backend / Node.js & Architecture)',
    department: 'Engineering',
    location: 'Bengaluru / Remote (India)',
    type: 'Full-time',
    experience: '4–7 Years',
    salaryRange: '₹18 LPA – ₹28 LPA + ESOPs',
    tags: ['Node.js', 'TypeScript', 'System Design', 'Microservices', 'AWS'],
    summary: 'Architect our high-throughput review routing engine, distributed multi-tenant tenancy, webhooks failover, and high-concurrency QR scan pipelines.',
    responsibilities: [
      'Lead backend architecture, API resilience, and zero-downtime deployment pipelines.',
      'Design idempotent webhook processors for Razorpay, AWS SNS SMS gateways, and Google Business Profile APIs.',
      'Enforce rigorous automated testing, security audit controls, and multi-tenant isolation.',
      'Mentor junior engineers and interns on scalable code patterns and system design.'
    ],
    requirements: [
      '4+ years building high-traffic production backends in Node.js / TypeScript.',
      'Deep understanding of RESTful architecture, relational/document storage, caching, and background workers.',
      'Track record of building secure, mission-critical SaaS infrastructure.'
    ],
  },
  {
    id: 'job-senior-fe-04',
    title: 'Senior Frontend Engineer (React, UI/UX & Design Systems)',
    department: 'Engineering',
    location: 'Bengaluru / Hybrid',
    type: 'Full-time',
    experience: '3–6 Years',
    salaryRange: '₹16 LPA – ₹24 LPA + ESOPs',
    tags: ['React', 'CSS Architecture', 'Performance', 'Design Systems'],
    summary: 'Craft pixel-perfect, accessible, and blindingly fast merchant dashboards and mobile customer review flows that rival Stripe and Linear.',
    responsibilities: [
      'Lead frontend architecture, bundle optimization, and UI design system governance across desktop and mobile.',
      'Build ultra-smooth interactive widgets: live review marquee streams, interactive analytics heatmaps, and festive gamified modals.',
      'Enforce lighthouse 95+ performance scores and mobile-first responsiveness down to 320px viewports.',
      'Collaborate closely with product designers and founders to iterate rapidly on merchant user feedback.'
    ],
    requirements: [
      'Deep expertise in modern React (v18+), TypeScript, custom CSS/variables, and Vite tooling.',
      'Fanatical eye for typography, micro-interactions, layout spacing, and animation physics.',
      'Demonstrated portfolio or production apps showcasing world-class UI polish.'
    ],
  },
  {
    id: 'job-enterprise-ae-05',
    title: 'Enterprise Account Executive (Hospitality & Healthcare Chains)',
    department: 'Sales & BD',
    location: 'Mumbai / Delhi NCR / Bengaluru',
    type: 'Full-time',
    experience: '3–6 Years',
    salaryRange: '₹10 LPA – ₹16 LPA Base + Heavy Performance Bonuses',
    tags: ['Enterprise Sales', 'Multi-Unit Brands', 'Franchise Sales'],
    summary: 'Lead enterprise deals with multi-outlet restaurant franchises, dental hospital networks, salon chains, and national retail brands across tier-1 metros.',
    responsibilities: [
      'Map and penetrate regional directors, marketing heads, and franchise CEOs of multi-unit chains.',
      'Structure custom multi-stand hardware deployments, centralized API integrations, and SLA agreements.',
      'Manage complex multi-stakeholder contract negotiations from pilot tests to 50+ outlet rollouts.'
    ],
    requirements: [
      'Proven track record closing B2B corporate contracts with ₹5L+ average contract values.',
      'Strong network in retail, healthcare, hospitality, or automotive service sectors.',
      'Exceptional executive presence, contract negotiation acumen, and quota discipline.'
    ],
  },
  {
    id: 'job-local-seo-06',
    title: 'Local SEO Specialist & Search Growth Strategist',
    department: 'Marketing & Growth',
    location: 'Remote / Bengaluru',
    type: 'Full-time',
    experience: '2–5 Years',
    salaryRange: '₹6 LPA – ₹10 LPA',
    tags: ['Google Maps SEO', 'Local 3-Pack', 'Schema.org', 'Content Strategy'],
    summary: 'Own algorithmic strategy for Google Maps Local 3-Pack domination, review sentiment keyword clustering, and organic search content for our 876+ merchant network.',
    responsibilities: [
      'Analyze Google Business Profile ranking algorithms, review velocity impacts, and local citation dynamics.',
      'Design automated keyword injection templates for AI review drafting across categories (Cafes, Dentists, Salons, Auto).',
      'Author industry-defining technical SEO playbooks and guides for local business owners.',
      'Track search ranking movements across major pin codes using geo-grid rank telemetry.'
    ],
    requirements: [
      'Demonstrated wins ranking local businesses into Top 3 Google Maps positions in competitive keywords.',
      'Thorough knowledge of Google guidelines, review policy compliance, and programmatic Schema markup.',
      'Analytical mindset with proficiency in Google Search Console, Ahrefs/Semrush, and Local Falcon.'
    ],
  },
  {
    id: 'job-csm-07',
    title: 'Customer Success & Merchant Onboarding Manager',
    department: 'Customer Success',
    location: 'Bengaluru (Hybrid)',
    type: 'Full-time',
    experience: '1–3 Years',
    salaryRange: '₹5 LPA – ₹8 LPA',
    tags: ['Customer Retention', 'Merchant Coaching', 'Churn Prevention', 'NPS'],
    summary: 'Ensure newly onboarded merchants activate their acrylic QR stands, achieve their first 50 verified 5-star reviews, and experience measurable walk-in ROI.',
    responsibilities: [
      'Welcome newly subscribed business owners via WhatsApp and phone; assist in initial Google link setup.',
      'Monitor weekly scan velocity and proactively reach out to outlets with lagging review adoption.',
      'Share best practices with billing counter staff to maximize QR scan conversion rates.',
      'Identify upsell opportunities to multi-counter packs and annual enterprise plans.'
    ],
    requirements: [
      'Empathetic, articulate relationship-builder with genuine passion for small business success.',
      'Experience in SaaS customer success, client management, or hospitality front-office operations.',
      'Fluent in English, Hindi, and regional South Indian languages.'
    ],
  },
  {
    id: 'job-uiux-designer-08',
    title: 'Product & Visual UI/UX Designer',
    department: 'Product & Design',
    location: 'Bengaluru / Hybrid',
    type: 'Full-time',
    experience: '2–4 Years',
    salaryRange: '₹8 LPA – ₹14 LPA',
    tags: ['Figma', 'Design Systems', 'Micro-Interactions', 'SaaS UX'],
    summary: 'Design end-to-end customer scan review flows, merchant desktop analytics, and tactile laser-engraved acrylic QR stand hardware mockups.',
    responsibilities: [
      'Maintain and evolve our design tokens, component library, and responsive mobile layouts in Figma.',
      'Prototype intuitive customer review journeys that convert walk-ins to Google reviews within 15 seconds.',
      'Design physical POS counter collateral, acrylic stand laser-cut templates, and unboxing packaging.',
      'Conduct user testing with real store managers to identify and remove onboarding friction.'
    ],
    requirements: [
      'Stellar portfolio showcasing modern, clean SaaS products (Linear, Raycast, Vercel aesthetic).',
      'Mastery of Figma, responsive auto-layout, design tokens, and prototyping.',
      'Understanding of frontend CSS capabilities and realistic engineering trade-offs.'
    ],
  },
  {
    id: 'job-devops-09',
    title: 'Cloud DevOps & Infrastructure Engineer',
    department: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    experience: '3–6 Years',
    salaryRange: '₹14 LPA – ₹22 LPA',
    tags: ['AWS', 'Docker', 'Nginx', 'Cloudflare', 'CI/CD', 'PM2'],
    summary: 'Maintain 99.99% uptime for KindlyRate API servers, SSL termination, Cloudflare CDN caching, and automated staging/production deployments.',
    responsibilities: [
      'Manage AWS EC2 infrastructure, VPC security groups, and automated daily backup snapshots.',
      'Optimize Nginx reverse proxy configurations, HTTP/2 & HTTP/3 SSL termination, and Cloudflare Edge caching.',
      'Build seamless CI/CD GitHub Actions workflows for automated linting, test suites, and zero-downtime rolling deploys.',
      'Configure proactive CloudWatch telemetry alerts for memory, CPU, disk I/O, and API latency.'
    ],
    requirements: [
      'Solid experience managing Linux/Ubuntu cloud environments on AWS.',
      'Proficiency with Docker, Nginx, Node.js process managers (PM2), and shell automation.',
      'Strong grasp of network security, DDoS mitigation, and SSL certificate lifecycles.'
    ],
  },
  {
    id: 'job-qa-automation-10',
    title: 'QA Automation & Test Reliability Engineer',
    department: 'Engineering',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
    experience: '2–5 Years',
    salaryRange: '₹7 LPA – ₹12 LPA',
    tags: ['Automated Testing', 'TypeScript', 'Playwright', 'API Testing'],
    summary: 'Ensure flawless end-to-end reliability across our payment webhooks, subscription billing engines, and customer rating flows.',
    responsibilities: [
      'Expand our 77+ automated backend test suite covering payment signatures, quota limits, and IDOR isolation.',
      'Build end-to-end browser automation suites with Playwright across mobile Safari and desktop Chrome.',
      'Execute load testing simulating peak weekend scan concurrency across hundreds of restaurant QR stands.'
    ],
    requirements: [
      'Strong hands-on experience in Node.js test frameworks (Node Test Runner, Jest, Playwright/Cypress).',
      'Deep understanding of API testing, mock services, and edge case generation.',
      'Passion for software quality and breaking things before merchants do.'
    ],
  },
  {
    id: 'job-content-copywriter-11',
    title: 'Technical Content & Growth Copywriter',
    department: 'Marketing & Growth',
    location: 'Remote',
    type: 'Full-time',
    experience: '1–3 Years',
    salaryRange: '₹4.5 LPA – ₹7 LPA',
    tags: ['B2B Copywriting', 'SEO Articles', 'Case Studies', 'Email Campaigns'],
    summary: 'Write high-converting website copy, merchant success case studies, SEO guides, and transactional email copy that merchant owners love reading.',
    responsibilities: [
      'Interview thriving salon owners, cafe founders, and clinic managers to produce data-backed ROI case studies.',
      'Author authoritative 2,000+ word guides on Google Maps SEO and customer retention strategies.',
      'Write punchy, high-open-rate onboarding email sequences and SMS notification templates.'
    ],
    requirements: [
      'Exceptional portfolio of published B2B SaaS articles, landing page copy, or tech journalism.',
      'Ability to demystify complex algorithms into clear, actionable advice for busy shop owners.',
      'Native fluency in written English with crisp editorial judgment.'
    ],
  },
  {
    id: 'job-hardware-ops-12',
    title: 'Hardware Logistics & QR Stand Operations Lead',
    department: 'Operations',
    location: 'Bengaluru (On-site HQ)',
    type: 'Full-time',
    experience: '1–3 Years',
    salaryRange: '₹3.6 LPA – ₹5.5 LPA',
    tags: ['Supply Chain', 'Vendor Management', 'Quality Control', 'Shipping'],
    summary: 'Manage precision acrylic laser-cutting, high-definition QR UV printing, and same-day courier dispatch to store locations across India.',
    responsibilities: [
      'Oversee acrylic fabrication partners, QR print quality inspection, and NFC chip encoding verification.',
      'Manage inventory of acrylic stands, wooden bases, and protective packaging materials.',
      'Coordinate with Bluedart, Delhivery, and DTDC for rapid 48-hour delivery across pin codes nationwide.',
      'Handle hardware replacement requests and merchant shipping inquiries.'
    ],
    requirements: [
      'Detail-oriented mindset with high standards for physical product finish and print accuracy.',
      'Prior experience in e-commerce fulfillment, logistics coordination, or hardware operations.',
      'Organized, energetic, and proactive problem-solver.'
    ],
  },
];

// GET /api/careers/jobs - Public endpoint to list all openings
careersRouter.get('/jobs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: OPEN_JOBS,
    total: OPEN_JOBS.length,
  });
});

// POST /api/careers/apply - Public endpoint to submit application
careersRouter.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      jobId,
      jobTitle,
      department,
      fullName,
      email,
      phone,
      experience,
      currentCompany,
      portfolioUrl,
      linkedinUrl,
      resumeUrl,
      coverNote,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      throw new AppError('Full Name is required', 400, 'VALIDATION_ERROR');
    }
    if (!email || !email.trim() || !email.includes('@')) {
      throw new AppError('Valid Email address is required', 400, 'VALIDATION_ERROR');
    }
    if (!phone || !phone.trim()) {
      throw new AppError('Mobile Phone number is required', 400, 'VALIDATION_ERROR');
    }
    if (!jobTitle) {
      throw new AppError('Position applied for is required', 400, 'VALIDATION_ERROR');
    }

    const application = await db.createJobApplication({
      jobId: jobId || 'custom-role',
      jobTitle: jobTitle.trim(),
      department: department || 'General',
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      experience: experience || 'Not specified',
      currentCompany: currentCompany?.trim() || '',
      portfolioUrl: portfolioUrl?.trim() || '',
      linkedinUrl: linkedinUrl?.trim() || '',
      resumeUrl: resumeUrl?.trim() || '',
      coverNote: coverNote?.trim() || '',
      status: 'PENDING',
    });

    // Notify Super Admin through System Notifications
    try {
      await db.createNotification({
        title: `New Candidate: ${fullName.trim()} applied for ${jobTitle}`,
        message: `${fullName.trim()} submitted an application for ${jobTitle} (${department || 'Team'}). Experience: ${experience || 'N/A'}. Phone: ${phone.trim()}. Email: ${email.trim()}`,
        type: 'INFO',
      });
    } catch {
      // Non-fatal notification failure
    }

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application received successfully! Our talent team will review your application within 48 hours.',
    });
  } catch (error) {
    next(error);
  }
});
