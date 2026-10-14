import type { MetadataRoute } from 'next'

import { absolute, servedOnMainDomain } from '@/lib/siteUrl'

// This robots.txt is only ever reached on this deployment's own address (on the main domain,
// /robots.txt is WordPress's). Once the pages are served on the main domain, this address is a
// duplicate, so crawlers are kept off it; the canonical pages are on the main domain.
export default function robots(): MetadataRoute.Robots {
  if (servedOnMainDomain) {
    return { rules: { userAgent: '*', disallow: '/' }, sitemap: absolute('/service-areas/sitemap.xml') }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: absolute('/service-areas/sitemap.xml'),
  }
}
