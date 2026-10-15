# Service area pages on citysuburbanheating.com

The service area pages are a Next.js + Sanity app on Vercel
(`https://service-area-pages.vercel.app`). A Cloudflare Worker serves them on the main domain, so
visitors and Google only see `citysuburbanheating.com`. Everything else stays on WordPress.

| Public URL | Served by |
| --- | --- |
| `https://citysuburbanheating.com/service-areas/` | Vercel (collection page) |
| `https://citysuburbanheating.com/service-area/<slug>/` | Vercel (area page; unpublished slugs return 404) |
| `https://citysuburbanheating.com/service-areas/sitemap.xml` | Vercel (sitemap for Search Console) |
| `/service-areas/<slug>/` (old plural URLs) | Worker: 301 to `/service-area/<slug>/` |
| Every other URL | WordPress, unchanged |

The code is [`service-areas-worker.js`](service-areas-worker.js).

## 1. Vercel: tell the app its public address

1. Vercel → **Service-Area-pages** project → **Settings → Environment Variables**.
2. Add `NEXT_PUBLIC_SITE_URL` = `https://citysuburbanheating.com` for **Production**.
3. **Deployments** → the latest production deployment → **⋯ → Redeploy**.

With this set:

- canonicals, Open Graph URLs, JSON-LD and the sitemap use the main domain;
- the `vercel.app` address's `robots.txt` blocks crawlers, so the duplicate there is never indexed.

## 2. Sanity: allow the main domain

**sanity.io/manage** → project → **API → CORS origins → Add CORS origin**:

- `https://citysuburbanheating.com`, with **Allow credentials** ticked.

Live content updates use this origin.

## 3. Cloudflare: create the Worker

1. Cloudflare dashboard → **Workers & Pages → Create → Create Worker**.
2. Name it `cs-service-areas` → **Deploy**.
3. Choose **Edit code**, replace everything with the contents of `service-areas-worker.js`, then **Deploy**.

## 4. Cloudflare: attach the routes

Go to **Websites → citysuburbanheating.com → Workers Routes → Add route**. Add each route below, with worker `cs-service-areas`:

| Route | Why |
| --- | --- |
| `citysuburbanheating.com/service-areas*` | collection, sitemap, old plural URLs |
| `citysuburbanheating.com/service-area/*` | area pages |
| `citysuburbanheating.com/_next/*` | the app's scripts and styles |
| `citysuburbanheating.com/cs-assets/*` | the pages' images |

Notes:

- `www.citysuburbanheating.com` already redirects to the apex domain, so it needs no routes.
- **If a Cache Rule or Page Rule uses "Cache Everything" for the whole site,** add a rule that bypasses the cache for `/service-areas*` and `/service-area/*`. Pages update from Sanity, and Next.js serves different responses on the same URL.

## 5. Check it

Open each of these in a browser:

- `https://citysuburbanheating.com/service-areas/`: the new collection page.
- `https://citysuburbanheating.com/service-area/west-loop/`: the new area page. The address bar stays on citysuburbanheating.com.
- `https://citysuburbanheating.com/service-areas/sitemap.xml`: lists only `https://citysuburbanheating.com/...` URLs.
- `https://citysuburbanheating.com/service-areas/west-loop/`: lands on `/service-area/west-loop/`.

## 6. WordPress / Yoast clean-up

- **Old area posts.** The WordPress "service area" posts at `/service-area/<slug>/` are now hidden behind the Worker. Turn off their sitemap: Yoast → **Settings → Content types → Service areas → Show in search results: off**. Yoast's `sitemap_index.xml` then stops listing URLs that WordPress no longer serves.
- **The WordPress `/service-areas/` page.** It is also hidden behind the Worker. Leave it, or set it to noindex. Either way, visitors get the new page.

## 7. Google Search Console

1. Open **Search Console** for the `citysuburbanheating.com` property, then go to **Sitemaps**.
2. Submit `https://citysuburbanheating.com/service-areas/sitemap.xml`.

Publishing a new area page in Sanity adds it to this sitemap; nothing else to do.

## Publishing a new area

Publish it in the Studio (`https://service-area-pages.vercel.app/studio`). It appears at
`https://citysuburbanheating.com/service-area/<slug>/` and in the sitemap. Until it is published,
that URL returns 404.

Edits to a page that's already live (or to the Service area template) show up on the next visit
once the publish webhook below is set up. Without it they only appear while someone has the page
open, or after the next deploy.

### Publish webhook (one-time setup)

1. Pick a long random string as the secret. In Vercel → the project → **Settings → Environment
   Variables**, add `SANITY_REVALIDATE_SECRET` with it (Production), then redeploy.
2. In **sanity.io/manage** → the project → **API → Webhooks → Create webhook**:
   - URL: `https://service-area-pages.vercel.app/api/revalidate`
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["areaPage", "areaTemplate"]`
   - Drafts and versions: off (only publishes)
   - HTTP method: POST
   - Secret: the same string as in Vercel
3. Publish any page and check its webhook log in sanity.io/manage shows a `200`.
