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

  // 4. Global API Rate Limiting
  app.use(
    '/api',
    rateLimiter({
      windowMs: config.rateLimits.globalApiWindowMs,
      max: config.rateLimits.globalApiMaxPerIp,
      message: 'Global API rate limit exceeded.',
    })
  );

  // 5. Health Check & SEO Meta Crawlers
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
      },
    });
  });

  // SEO: Dynamic Robots.txt
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nAllow: /r/*\nDisallow: /api/\nDisallow: /admin\nCrawl-delay: 1\nSitemap: ${config.appUrl}/sitemap.xml\n`);
  });

  // SEO: Dynamic Sitemap.xml
  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml');
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

  // 6. API Modules
  app.use('/api/auth', authRouter);
  app.use('/api/business', businessRouter);
  app.use('/api/qrs', qrRouter);
  app.use('/api/customer', customerRouter);
  app.use('/api/payment', paymentRouter);
  app.use('/api/admin', adminRouter);

  // Public Blog Articles API
  app.get('/api/blogs', async (req, res, next) => {
    try {
      const { search } = req.query as { search?: string };
      const blogs = await db.listBlogPosts(search, true);
      res.json({ success: true, data: blogs });
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
      res.json({ success: true, data: blog });
    } catch (err) {
      next(err);
    }
  });

  // 7. Serve Static Frontend in Production
  const possibleStaticPaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../dist/public'),
    path.resolve(__dirname, '../public'),
  ];
  const staticPath = possibleStaticPaths.find((p) => fs.existsSync(p)) || possibleStaticPaths[0];

  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexFile = path.join(staticPath, 'index.html');
    res.sendFile(indexFile, (err) => {
      if (err) next();
    });
  });

  // 8. Centralized Error Handler (Section 28)
  app.use(errorHandler);

  return app;
}
