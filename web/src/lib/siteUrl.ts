// The site's public address, for canonical URLs, robots.txt and the sitemap.
// Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment (e.g. service-area-pages.vercel.app).
// Set NEXT_PUBLIC_SITE_URL in Vercel once the site moves to its own domain.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')
