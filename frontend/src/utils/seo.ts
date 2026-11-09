/**
 * Client-Side SEO & Meta Manager
 * Updates document.title, canonical URL, and meta description dynamically during SPA transitions.
 */

export interface PageSeoConfig {
  title: string;
  description?: string;
  path?: string;
}

export function updatePageSeo({ title, description, path }: PageSeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = title;

  // 2. Update Canonical Link
  const canonicalUrl = path ? `https://kindlyrate.com${path.startsWith('/') ? path : `/${path}`}` : window.location.origin + window.location.pathname;
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 3. Update Meta Description
  if (description) {
    let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.setAttribute('name', 'description');
      document.head.appendChild(descEl);
    }
    descEl.setAttribute('content', description);

    // OpenGraph & Twitter
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);
  }

  // 4. Update OpenGraph URL & Title
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
}
