import { useEffect } from 'react';

const SITE_NAME = 'tryHimandsee ministries';
const SITE_URL = 'https://tryhimandseeministries.org';
const DEFAULT_IMAGE = '/images/header-logo.png';

const setMeta = (selector, content) => {
  if (!content) return;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    // Selector is either `meta[name="X"]` or `meta[property="X"]`
    const m = selector.match(/(name|property)="([^"]+)"/);
    if (m) tag.setAttribute(m[1], m[2]);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (url) => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

// Per-page SEO + social-sharing meta tag manager.
// Drop <PageMeta title="..." description="..." image="..." path="..." /> at the
// top of any page and it updates <title>, meta description, Open Graph, and
// Twitter Card tags on mount, then restores defaults on unmount.
const PageMeta = ({ title, description, image, path, type = 'website' }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
    const url = path ? `${SITE_URL}${path}` : SITE_URL;
    const ogImage = image
      ? (image.startsWith('http') ? image : `${SITE_URL}${image}`)
      : `${SITE_URL}${DEFAULT_IMAGE}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:type"]', type);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);
    setCanonical(url);
  }, [title, description, image, path, type]);

  return null;
};

export default PageMeta;
