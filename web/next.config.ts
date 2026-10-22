import type { NextConfig } from "next";

import areaUrls from "./content/area-url-redirects.json";

// The area pages that were live before the near-me URLs: old URL -> new URL, as 301s.
// Both old forms go to the new URL in one hop: /service-area/<slug>/ and the older /service-areas/<slug>/.
const areaRedirects = Object.entries(areaUrls.redirects as Record<string, string>).flatMap(([from, to]) => [
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
      // Area pages' public URL is /service-area/near-me-<slug>-<main ZIP>/ (src/lib/siteUrl.ts).
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
