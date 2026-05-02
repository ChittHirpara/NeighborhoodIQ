import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
}

const BASE_URL = 'https://neighborhoodiq.app';

export function useSEO({ title, description, keywords, canonicalPath }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = `${title} | NeighborhoodIQ`;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // Open Graph
    setMeta('og:title', `${title} | NeighborhoodIQ`, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', 'NeighborhoodIQ', 'property');
    if (canonicalPath) {
      setMeta('og:url', `${BASE_URL}${canonicalPath}`, 'property');
    }

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | NeighborhoodIQ`);
    setMeta('twitter:description', description);

    // Canonical link
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${BASE_URL}${canonicalPath}`);
    }
  }, [title, description, keywords, canonicalPath]);
}
