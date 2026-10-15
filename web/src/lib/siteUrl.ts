// The site's public address, for canonical URLs, Open Graph, structured data and the sitemap.
// Set NEXT_SITE_URL=https://citysuburbanheating.com in Vercel once the Cloudflare Worker serves
// these pages on the main domain (NEXT_PUBLIC_SITE_URL works too). Without it, Vercel's own address is
// used (VERCEL_PROJECT_PRODUCTION_URL). Read on the server only: metadata, JSON-LD, sitemap, robots.
export const siteUrl = (
  process.env.NEXT_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

/** True when the pages are published under another domain (the main site) than this deployment's own. */
export const servedOnMainDomain = !/\.vercel\.app$|localhost/.test(new URL(siteUrl).hostname)

// Public URLs, the same shape as the main site (WordPress) always used:
//   collection  /service-areas/        area page  /service-area/<slug>/
// The Next.js routes live at /service-areas/[slug]; next.config.ts rewrites /service-area/:slug to it.
export const collectionPath = '/service-areas/'
export const areaPath = (slug: string) => `/service-area/${slug}/`
export const absolute = (path: string) => `${siteUrl}${path}`
