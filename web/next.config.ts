import type { NextConfig } from "next";

// The area page URLs before the near-URL change (2026-10-22), each with its new URL
// (/service-area/near-<slug>-<main ZIP>/, src/lib/siteUrl.ts). A fixed list: pages published
// later are born with their near URL. Kept in this file because next.config.ts can't import
// project files when Next is started from the repo root (next start web).
const areaUrlRedirects: Record<string, string> = {
  "/service-area/bucktown/": "/service-area/near-bucktown-60647/",
  "/service-area/des-plaines/": "/service-area/near-des-plaines-60016/",
  "/service-area/glenview/": "/service-area/near-glenview-60025/",
  "/service-area/humboldt-park/": "/service-area/near-humboldt-park-60651/",
  "/service-area/lakeview/": "/service-area/near-lakeview-60657/",
  "/service-area/lincoln-park/": "/service-area/near-lincoln-park-60614/",
  "/service-area/logan-square/": "/service-area/near-logan-square-60647/",
  "/service-area/niles/": "/service-area/near-niles-60714/",
  "/service-area/northbrook/": "/service-area/near-northbrook-60062/",
  "/service-area/old-town/": "/service-area/near-old-town-60614/",
  "/service-area/park-ridge/": "/service-area/near-park-ridge-60068/",
  "/service-area/pilsen/": "/service-area/near-pilsen-60608/",
  "/service-area/rogers-park/": "/service-area/near-rogers-park-60626/",
  "/service-area/skokie/": "/service-area/near-skokie-60076/",
  "/service-area/ukrainian-village/": "/service-area/near-ukrainian-village-60622/",
  "/service-area/west-loop/": "/service-area/near-west-loop-60607/",
  "/service-area/west-town/": "/service-area/near-west-town-60622/",
  "/service-area/wicker-park/": "/service-area/near-wicker-park-60622/",
  "/service-area/wilmette/": "/service-area/near-wilmette-60091/",
  "/service-area/winnetka/": "/service-area/near-winnetka-60093/",
  "/service-area/wrigleyville/": "/service-area/near-wrigleyville-60613/",
};

// Both old forms go to the new URL in one hop, as 301s: /service-area/<slug>/ and the older /service-areas/<slug>/.
const areaRedirects = Object.entries(areaUrlRedirects).flatMap(([from, to]) => [
  { source: from, destination: to, statusCode: 301 as const },
  { source: from.replace("/service-area/", "/service-areas/"), destination: to, statusCode: 301 as const },
]);

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // URLs end in "/" like the main site's (WordPress), so the Cloudflare Worker can pass paths
  // through unchanged: /service-areas/, /service-area/<slug>/. Files (sitemap.xml) keep none.
  trailingSlash: true,
  experimental: {
    // The pages are also served on the main domain through a Cloudflare Worker (../cloudflare/), so
    // Sanity Live's Server Action arrives with that origin while the host is this deployment's.
    serverActions: {
      allowedOrigins: ["citysuburbanheating.com", "www.citysuburbanheating.com"],
    },
  },
  async redirects() {
    return [
      // No home page design yet: send visitors to the service area collection (temporary, so a
      // future home page can take over "/").
      { source: "/", destination: "/service-areas/", permanent: false },
      // Area pages' public URL is /service-area/near-<slug>-<main ZIP>/ (src/lib/siteUrl.ts).
      ...areaRedirects,
      // Any other old plural URL goes to the singular form, where the page redirects to its own URL.
      // The sitemap at /service-areas/sitemap.xml is left alone.
      { source: "/service-areas/:slug((?!sitemap\\.xml$)[^/]+)", destination: "/service-area/:slug/", permanent: true },
    ];
  },
  async rewrites() {
    // /service-area/<slug> is served by the /service-areas/[slug] route
    return [{ source: "/service-area/:slug/", destination: "/service-areas/:slug/" }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
