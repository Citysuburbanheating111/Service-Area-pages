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

// Public URLs:
//   collection  /service-areas/        area page  /service-area/near-me-<slug>-<main ZIP>/
// The main ZIP is the first ZIP on the page's ZIP chip (districts.zips[0] in Sanity), e.g.
// /service-area/near-me-west-loop-60607/. The old /service-area/<slug>/ URLs redirect (next.config.ts).
// The Next.js routes live at /service-areas/[slug]; next.config.ts rewrites /service-area/:slug to it,
// so the route's [slug] is the whole URL segment ("near-me-west-loop-60607"), read with parseAreaSegment.
export const collectionPath = '/service-areas/'
export const areaSegment = (slug: string, zip?: string | null) => (zip ? `near-me-${slug}-${zip}` : slug)
export const areaPath = (slug: string, zip?: string | null) => `/service-area/${areaSegment(slug, zip)}/`
/** "near-me-west-loop-60607" → { slug: "west-loop", zip: "60607" }; an old bare slug → { slug, zip: null } */
export function parseAreaSegment(segment: string): { slug: string; zip: string | null } {
  const m = segment.match(/^near-me-([a-z0-9-]+)-(\d{5})$/)
  return m ? { slug: m[1], zip: m[2] } : { slug: segment, zip: null }
}
export const absolute = (path: string) => `${siteUrl}${path}`
