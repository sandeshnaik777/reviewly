import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Route modules
import { authRouter } from './modules/auth/routes.js';
import { businessRouter } from './modules/business/routes.js';
import { qrRouter } from './modules/qr/routes.js';
import { customerRouter } from './modules/customer/routes.js';
import { paymentRouter } from './modules/payment/routes.js';
import { adminRouter } from './modules/admin/routes.js';
import { db } from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  // Resolve static dist directory for SPA and SEO assets
  const possibleStaticPaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../dist/public'),
    path.resolve(__dirname, '../public'),
  ];
  const staticPath = possibleStaticPaths.find((p) => fs.existsSync(p)) || possibleStaticPaths[0];

  // Trust reverse proxy (Nginx) for accurate client IP in multi-user environments
  app.set('trust proxy', 1);

  // 1. Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible modern UI embedding
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Strict CORS Configuration (Section 35)
  app.use(
    cors({
      origin: [config.appUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Business-ID', 'X-Razorpay-Signature'],
    })
  );

  // 3. Body Parsing & Cookies
  app.use(cookieParser(config.jwt.secret));
  app.use(
    express.json({
      limit: '1mb', // Request body size limit
      verify: (req: any, _res, buf) => {
        // Preserve rawBody for webhook HMAC verification
        req.rawBody = buf.toString('utf-8');
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Health Check & Diagnostics
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        database: {
          type: db.isPostgresConnected() ? 'postgresql' : 'json_store',
          postgresConnected: db.isPostgresConnected(),
        },
      },
    });
  });

  // Client Runtime Error Telemetry
  app.post('/api/telemetry/client-error', (req, res) => {
    console.error('🚨 [CLIENT RUNTIME ERROR CAUGHT BY ERRORBOUNDARY]:\n', JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  // 5. SEO & AI Crawler Endpoints (robots.txt, sitemap.xml, llms.txt)
  app.get('/robots.txt', (_req, res) => {
    const robotsPath = path.join(staticPath, 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(robotsPath);
    }
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(`User-agent: *\nAllow: /\nAllow: /r/*\nDisallow: /api/\nDisallow: /admin\nCrawl-delay: 1\nSitemap: ${config.appUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (_req, res) => {
    const sitemapPath = path.join(staticPath, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(sitemapPath);
    }
    res.type('application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${config.appUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${config.appUrl}/#features</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${config.appUrl}/#pricing</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${config.appUrl}/#testimonials</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${config.appUrl}/#faq</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${config.appUrl}/help</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${config.appUrl}/terms</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${config.appUrl}/privacy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${config.appUrl}/refund</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`);
  });

  app.get('/llms.txt', (_req, res, next) => {
    const llmsPath = path.join(staticPath, 'llms.txt');
    if (fs.existsSync(llmsPath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(llmsPath);
    }
    next();
  });

  // Favicon direct handler (Googlebot & Browser Root Fallback)
  app.get('/favicon.ico', (_req, res, next) => {
    const icoPath = path.join(staticPath, 'favicon.ico');
    if (fs.existsSync(icoPath)) {
      res.setHeader('Content-Type', 'image/x-icon');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.sendFile(icoPath);
    }
    next();
  });

  // 6. API Modules
  app.use('/api/auth', authRouter);
  app.use('/api/business', businessRouter);
  app.use('/api/qrs', qrRouter);
  app.use('/api/customer', customerRouter);
  app.use('/api/payment', paymentRouter);
  app.use('/api/admin', adminRouter);

  // Public Subscription Plans API
  app.get('/api/plans', async (_req, res, next) => {
    try {
      const plans = await db.listSubscriptionPlans();
      res.json({ success: true, data: plans, plans });
    } catch (err) {
      next(err);
    }
  });

  // Public Blog Articles API
  app.get('/api/blogs', async (req, res, next) => {
    try {
      const { search } = req.query as { search?: string };
      const blogs = await db.listBlogPosts(search, true);
      res.json({ success: true, data: blogs, blogs });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/blogs/:slug', async (req, res, next) => {
    try {
      const blog = await db.getBlogPostBySlug(req.params.slug as string);
      if (!blog || !blog.isPublished) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } });
        return;
      }
      res.json({ success: true, data: blog, blog });
    } catch (err) {
      next(err);
    }
  });

  // 7. Serve Static Frontend in Production with Caching Optimizations
  app.use(
    express.static(staticPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        // Hashed assets (JS, CSS, fonts, SVG) can be cached immutably for 1 year
        if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html')) {
          // HTML files should never be cached permanently so users get updates instantly
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      },
    })
  );

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexFile = path.join(staticPath, 'index.html');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(indexFile, (err) => {
      if (err) next();
    });
  });

  // 8. Centralized Error Handler (Section 28)
  app.use(errorHandler);

  return app;
}
