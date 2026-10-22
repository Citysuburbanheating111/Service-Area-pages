/**
 * City & Suburban: serve the service area pages (Next.js + Sanity on Vercel) on the main domain.
 *
 *   https://citysuburbanheating.com/service-areas/              -> collection page
 *   https://citysuburbanheating.com/service-area/near-me-<slug>-<ZIP>/ -> one area page
 *   https://citysuburbanheating.com/service-areas/sitemap.xml   -> sitemap for Search Console
 *
 * Visitors only ever see citysuburbanheating.com. Every other path (the WordPress site) never
 * reaches this Worker, because the Worker only runs on the routes listed in cloudflare/README.md;
 * if a request outside those paths does arrive, it goes to WordPress untouched.
 */

// The Vercel project's production address (Vercel → Project → Domains)
const ORIGIN = 'https://service-area-pages.vercel.app'

// Paths served by the Vercel project
const PROXIED = [
  /^\/service-areas\/?$/, // collection
  /^\/service-areas\/sitemap\.xml$/, // sitemap
  /^\/service-areas\/[^/]+\/?$/, // old plural area URLs (the app redirects them)
  /^\/service-area\/.*/, // area pages
  /^\/_next\//, // the app's scripts, styles and fonts
  /^\/cs-assets\//, // the pages' images
]

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // Not ours: let WordPress answer
    if (!PROXIED.some((re) => re.test(path))) return fetch(request)

    // Old area URLs (/service-areas/<slug>/ and /service-area/<slug>/) are redirected by the app
    // (web/next.config.ts) straight to the page's near-me URL, in a single hop.

    // /service-area/ on its own -> the collection
    if (path === '/service-area/' || path === '/service-area') return redirect(url, '/service-areas/')

    // Forward to Vercel: same method, path, query, headers and body
    const headers = new Headers(request.headers)
    headers.set('X-Forwarded-Host', url.host)
    headers.set('X-Forwarded-Proto', 'https')
    const isHead = request.method === 'HEAD'
    const upstream = await fetch(new URL(path + url.search, ORIGIN), {
      // HEAD is sent as GET so a missing page can still be told apart (see below)
      method: isHead ? 'GET' : request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    })

    const out = new Headers(upstream.headers)
    // Redirects from Vercel must stay on the main domain
    const location = out.get('Location')
    if (location) {
      const to = new URL(location, ORIGIN)
      if (to.origin === ORIGIN) out.set('Location', `${url.origin}${to.pathname}${to.search}${to.hash}`)
    }
    // The pages set their own robots meta tags; the vercel.app address's rules don't apply here
    out.delete('X-Robots-Tag')

    // An area page that isn't published yet is a "not found" page: answer with a real 404
    // so search engines drop the URL instead of indexing an empty page.
    const isPage = path.startsWith('/service-area/') && (out.get('Content-Type') || '').includes('text/html')
    if (isPage && upstream.status === 200 && ['GET', 'HEAD'].includes(request.method)) {
      const html = await upstream.text()
      const status = /<meta name="robots" content="noindex"/.test(html) ? 404 : 200
      out.delete('Content-Length')
      return new Response(isHead ? null : html, { status, headers: out })
    }

    return new Response(isHead ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    })
  },
}

function redirect(url, path) {
  return Response.redirect(`${url.origin}${path}${url.search}`, 301)
}
