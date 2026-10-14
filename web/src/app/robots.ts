import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/siteUrl'

// Area pages and the collection are public; the Studio and the draft-mode API are not for crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
