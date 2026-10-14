import type { MetadataRoute } from 'next'
import { defineQuery } from 'next-sanity'

import { siteUrl } from '@/lib/siteUrl'
import { cachedSanity } from '@/sanity/live'

// The collection page and every area page published in Sanity (drafts are never listed).
const SITEMAP_QUERY = defineQuery(`
  *[_type == "areaPage" && defined(slug.current)] | order(areaName asc){ "slug": slug.current, _updatedAt }
`)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await cachedSanity({ query: SITEMAP_QUERY, perspective: 'published', stega: false })
  const pages = (data ?? []) as { slug: string; _updatedAt: string }[]
  const newest = pages.map((p) => p._updatedAt).sort().at(-1)
  return [
    { url: `${siteUrl}/service-areas`, lastModified: newest, changeFrequency: 'weekly', priority: 1 },
    ...pages.map((p) => ({
      url: `${siteUrl}/service-areas/${p.slug}`,
      lastModified: p._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
