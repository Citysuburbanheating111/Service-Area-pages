import type { MetadataRoute } from 'next'
import { defineQuery } from 'next-sanity'

import { absolute, areaPath, collectionPath } from '@/lib/siteUrl'
import { cachedSanity } from '@/sanity/live'

// Served at /service-areas/sitemap.xml (the main site's /sitemap.xml belongs to WordPress/Yoast).
// The collection and every area page published in Sanity; drafts are never listed.
const SITEMAP_QUERY = defineQuery(`
  *[_type == "areaPage" && defined(slug.current)] | order(areaName asc){ "slug": slug.current, _updatedAt }
`)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await cachedSanity({ query: SITEMAP_QUERY, perspective: 'published', stega: false })
  const pages = (data ?? []) as { slug: string; _updatedAt: string }[]
  const newest = pages.map((p) => p._updatedAt).sort().at(-1)
  return [
    { url: absolute(collectionPath), lastModified: newest, changeFrequency: 'weekly', priority: 1 },
    ...pages.map((p) => ({
      url: absolute(areaPath(p.slug)),
      lastModified: p._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
