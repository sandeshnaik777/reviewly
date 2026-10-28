import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_BLOGS, BlogPost } from '../data/defaultBlogs.js';
import { KindlyReviewBrand, StarIcon } from '../components/Logos.js';

interface Props {
  initialSlug?: string;
  onNavigateHome: () => void;
  onStartOnboarding: () => void;
  onNavigateLogin: () => void;
}

export const BlogPage: React.FC<Props> = ({
  initialSlug = '',
  onNavigateHome,
  onStartOnboarding,
  onNavigateLogin,
}) => {
  const [currentSlug, setCurrentSlug] = useState<string>(initialSlug);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state with browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/blog(?:\/([^/]+))?/);
      if (match) {
        setCurrentSlug(match[1] || '');
      } else {
        onNavigateHome();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onNavigateHome]);

  // Find active blog if slug is set
  const currentBlog = useMemo(() => {
    if (!currentSlug) return null;
    return DEFAULT_BLOGS.find((b) => b.slug === currentSlug) || null;
  }, [currentSlug]);

  // Dynamic SEO & Title Tag Management
  useEffect(() => {
    let scriptTag: HTMLScriptElement | null = null;

    if (currentBlog) {
      document.title = `${currentBlog.title} — KindlyRate`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', currentBlog.excerpt);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', `https://kindlyrate.com/blog/${currentBlog.slug}`);

      // Inject Schema.org BlogPosting Structured Data
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'schema-blog-posting';
      scriptTag.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': currentBlog.title,
        'description': currentBlog.excerpt,
        'author': {
          '@type': 'Organization',
          'name': currentBlog.author || 'KindlyRate Research Lab',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'KindlyRate',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://kindlyrate.com/favicon.svg',
          },
        },
        'datePublished': currentBlog.publishedAt || currentBlog.createdAt,
        'dateModified': currentBlog.updatedAt,
        'mainEntityOfPage': `https://kindlyrate.com/blog/${currentBlog.slug}`,
      });
      document.head.appendChild(scriptTag);
    } else {
      document.title = 'Business Growth & Google Maps Local SEO Blog — KindlyRate';
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Actionable playbooks to optimize customer reviews, shield your rating, dominate Google Maps Local 3-Pack, and scale your business.'
        );
      }

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', 'https://kindlyrate.com/blog');
    }

    return () => {
      if (scriptTag && document.head.contains(scriptTag)) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [currentBlog]);

  const handleSelectBlog = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    window.history.pushState({}, '', '/blog');
    setCurrentSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Filtered list for Hub view
  const categories = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_BLOGS.forEach((b) => set.add(b.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredBlogs = useMemo(() => {
    return DEFAULT_BLOGS.filter((b) => {
      const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Related Blogs for Single Post view
  const relatedBlogs = useMemo(() => {
    if (!currentBlog) return [];
    return DEFAULT_BLOGS.filter((b) => b.id !== currentBlog.id).slice(0, 3);
  }, [currentBlog]);

  // Render Markdown Body with Semantic HTML
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inCode = false;
    let codeContent: string[] = [];

    const flushTable = (key: number) => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-wrapper-${key}`} style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13.5px',
                lineHeight: 1.5,
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              {tableHeaders.length > 0 && (
                <thead>
                  <tr style={{ background: 'var(--surface-container-high)', borderBottom: '2px solid var(--border)' }}>
                    {tableHeaders.map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {formatInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      background: rIdx % 2 === 0 ? '#ffffff' : 'rgba(255,248,245,0.4)',
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '10px 16px', color: '#334155' }}>
                        {formatInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    };

    const flushCode = (key: number) => {
      if (codeContent.length > 0) {
        elements.push(
          <pre
            key={`code-${key}`}
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              padding: '18px',
              borderRadius: '8px',
              fontSize: '12.5px',
              lineHeight: 1.6,
              overflowX: 'auto',
              margin: '20px 0',
              fontFamily: 'monospace',
            }}
          >
            <code>{codeContent.join('\n')}</code>
          </pre>
        );
      }
      inCode = false;
      codeContent = [];
    };

    const formatInline = (text: string): React.ReactNode => {
      // Bold **text**
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();

      // Code blocks
      if (line.startsWith('```')) {
        if (inCode) {
          flushCode(index);
        } else {
          if (inTable) flushTable(index);
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeContent.push(rawLine);
        return;
      }

      // Markdown Tables
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());

        // Skip separator row |---|---|
        if (cells.every((c) => /^[-:]+$/.test(c))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={index}
            className="serif"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '36px 0 16px',
              lineHeight: 1.25,
            }}
          >
            {formatInline(line.slice(2))}
          </h1>
        );
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="serif"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '32px 0 14px',
              lineHeight: 1.3,
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '8px',
            }}
          >
            {formatInline(line.slice(3))}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1e293b',
              margin: '24px 0 10px',
              lineHeight: 1.4,
            }}
          >
            {formatInline(line.slice(4))}
          </h3>
        );
        return;
      }

      // Divider
      if (line === '---' || line === '***') {
        elements.push(
          <hr
            key={index}
            style={{
              border: 'none',
              borderTop: '1px solid var(--border)',
              margin: '32px 0',
            }}
          />
        );
        return;
      }

      // Bullet List
      if (line.startsWith('* ') || line.startsWith('- ')) {
        elements.push(
          <li
            key={index}
            style={{
              margin: '6px 0',
              paddingLeft: '6px',
              color: '#334155',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            {formatInline(line.slice(2))}
          </li>
        );
        return;
      }

      // Numbered List
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              margin: '8px 0',
              color: '#334155',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '22px' }}>
              {numMatch[1]}.
            </span>
            <span>{formatInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty Line
      if (!line) {
        return;
      }

      // Regular Paragraph
      elements.push(
        <p
          key={index}
          style={{
            fontSize: '15.5px',
            lineHeight: 1.8,
            color: '#334155',
            margin: '14px 0',
          }}
        >
          {formatInline(line)}
        </p>
      );
    });

    if (inTable) flushTable(lines.length);
    if (inCode) flushCode(lines.length);

    return elements;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      {/* ================================================================ */}
      {/* TOP GLOBAL NAVBAR                                                */}
      {/* ================================================================ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 248, 245, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            onClick={() => {
              window.history.pushState({}, '', '/');
              onNavigateHome();
            }}
            style={{ cursor: 'pointer' }}
          >
            <KindlyReviewBrand />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                window.history.pushState({}, '', '/');
                onNavigateHome();
              }}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              ← Back to Home
            </button>
            <button
              className="btn btn-secondary hide-on-phone"
              onClick={onNavigateLogin}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary"
              onClick={onStartOnboarding}
              style={{ fontSize: '13px', padding: '7px 16px' }}
            >
              Get Started for ₹79 →
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* VIEW A: SINGLE BLOG POST READER (FULL PAGE)                       */}
      {/* ================================================================ */}
      {currentBlog ? (
        <article style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 20px 80px' }}>
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginBottom: '24px',
            }}
          >
            <span
              onClick={() => {
                window.history.pushState({}, '', '/');
                onNavigateHome();
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Home
            </span>
            <span>/</span>
            <span onClick={handleBackToHub} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Blog & Guides
            </span>
            <span>/</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{currentBlog.category}</span>
          </nav>

          {/* Article Header */}
          <header style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-primary">{currentBlog.category}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{currentBlog.readTime}</span>
            </div>

            <h1
              className="serif"
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                margin: '12px 0 16px',
              }}
            >
              {currentBlog.title}
            </h1>

            <p style={{ fontSize: '17px', lineHeight: 1.6, color: '#475569', margin: '0 0 20px' }}>
              {currentBlog.excerpt}
            </p>

            {/* Author & Share Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '16px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  KR
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                    {currentBlog.author}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Published • {new Date(currentBlog.publishedAt || currentBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleShareCopy}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {copiedLink ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentBlog.title + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentBlog.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </header>

          {/* Formatted Markdown Content */}
          <div
            style={{
              background: '#ffffff',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {renderMarkdown(currentBlog.content)}

            {/* Tags */}
            <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {currentBlog.tags.map((tag, tIdx) => (
                <span key={tIdx} className="stat-pill stat-pill-neutral" style={{ fontSize: '12px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Inline Action Callout Banner */}
          <div
            style={{
              marginTop: '48px',
              background: 'linear-gradient(135deg, #00383b, #002224)',
              color: '#ffffff',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={18} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#99f6e4', fontWeight: 600 }}>
                Google Local 3-Pack Growth Engine
              </span>
            </div>

            <h3 className="serif" style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Ready to Turn In-Store Customers into Verified 5-Star Reviews?
            </h3>

            <p style={{ fontSize: '14.5px', color: '#ccfbf1', lineHeight: 1.6, margin: 0 }}>
              Deploy physical smart counter QR stands, automate server-side AI drafting, and shield your rating with KindlyRate. Get started with our introductory Testing Pack for just ₹79.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={onStartOnboarding}
                style={{
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  padding: '10px 24px',
                  fontWeight: 600,
                }}
              >
                Claim Your ₹79 Testing Stand Now →
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBackToHub}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.2)',
                  padding: '10px 20px',
                }}
              >
                Explore More Playbooks
              </button>
            </div>
          </div>

          {/* Related Articles Section */}
          <section style={{ marginTop: '56px' }}>
            <h3 className="serif" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>
              Related Guides &amp; Research Playbooks
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
              {relatedBlogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBlog(b.slug)}
                  className="card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    border: '1.5px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  <div>
                    <span className="badge badge-primary" style={{ fontSize: '10.5px' }}>
                      {b.category}
                    </span>
                    <h4
                      className="serif"
                      style={{ fontSize: '16px', fontWeight: 600, margin: '8px 0 6px', color: '#0f172a' }}
                    >
                      {b.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {b.excerpt.slice(0, 110)}...
                    </p>
                  </div>
                  <div style={{ marginTop: '14px', color: 'var(--primary)', fontWeight: 600, fontSize: '12.5px' }}>
                    Read Guide →
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>
      ) : (
        /* ================================================================ */
        /* VIEW B: DEDICATED BLOG HUB LISTING (/blog)                       */
        /* ================================================================ */
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px' }}>
          {/* Hero Header */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
            <span className="badge badge-primary">KindlyRate Research Lab &amp; Knowledge Base</span>
            <h1
              className="serif"
              style={{
                fontSize: '40px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '12px 0 16px',
                lineHeight: 1.2,
              }}
            >
              Business Growth &amp; Google Maps Local SEO Guides
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Actionable engineering breakdowns, behavioral studies, and step-by-step playbooks to optimize customer review velocity, prevent negative complaints, and rank #1 on Google Local 3-Pack.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '36px',
            }}
          >
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
              <input
                type="text"
                placeholder="Search articles by keyword (e.g., NFC, 3-Pack, 1-Star Defense)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`stat-pill ${selectedCategory === cat ? 'stat-pill-primary' : 'stat-pill-neutral'}`}
                  style={{
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '6px 14px',
                    border: selectedCategory === cat ? 'none' : '1px solid var(--border-light)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredBlogs.map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBlog(b.slug)}
                className="card"
                style={{
                  padding: '28px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '14px',
                  transition: 'all 0.2s ease',
                  background: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <span className="badge badge-primary">{b.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.readTime}</span>
                  </div>

                  <h2
                    className="serif"
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.35,
                      margin: '10px 0 12px',
                    }}
                  >
                    {b.title}
                  </h2>

                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {b.excerpt}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    By {b.author}
                  </span>
                  <span
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '13.5px',
                    }}
                  >
                    Read Guide →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ================================================================ */}
      {/* GLOBAL FOOTER                                                    */}
      {/* ================================================================ */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          background: 'rgba(255, 248, 245, 0.6)',
          padding: '36px 20px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 KindlyRate Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span
              onClick={() => {
                window.history.pushState({}, '', '/');
                onNavigateHome();
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Home
            </span>
            <span
              onClick={handleBackToHub}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              All Blogs
            </span>
            <span
              onClick={() => {
                window.history.pushState({}, '', '/terms');
                onNavigateHome();
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Terms
            </span>
            <span
              onClick={() => {
                window.history.pushState({}, '', '/privacy');
                onNavigateHome();
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Privacy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
