import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { AreaPageV3 } from '@/components/area/AreaPageV3'
import { design } from '@/components/area/design'
import { resolveTemplate } from '@/components/area/template'
import { areaPageSchema, jsonLd } from '@/lib/schema'
import { areaPath, areaSegment, parseAreaSegment } from '@/lib/siteUrl'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY, AREA_PAGE_QUERY, AREA_TEMPLATE_QUERY } from '@/sanity/queries'
import type { AreaListItem, AreaPageData, AreaTemplateData } from '@/sanity/types'

// Public URL: /service-area/near-<slug>-<main ZIP>/ (next.config.ts rewrites it to this route), so
// the [slug] param is that whole segment; parseAreaSegment gives the page's slug.
type Props = PageProps<'/service-areas/[slug]'>

const published = { perspective: 'published' as const, stega: false }

// Every published area page is built into static HTML; a page published later is rendered on its
// first visit and cached (ISR with Cache Components).
export async function generateStaticParams() {
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, ...published })
  const rows = ((data ?? []) as AreaListItem[]).filter((r): r is AreaListItem & { slug: string } => !!r.slug)
  return rows.map((r) => ({ slug: areaSegment(r.slug, r.zip) }))
}

function metaFor(page: AreaPageData) {
  return {
    title: stegaClean(page.seo?.title || page.hero?.h1) ?? '',
    description: stegaClean(page.seo?.description || page.hero?.lede) ?? '',
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = parseAreaSegment((await props.params).slug)
  const { data } = await cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, ...published })
  const page = data as AreaPageData | null
  if (!page) return {}
  const { title, description } = metaFor(page)
  const url = areaPath(slug, stegaClean(page.districts?.zips?.[0]))
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'City & Suburban Heating & Cooling',
      locale: 'en_US',
      images: [{ url: design.images.van, width: 1235, height: 848, alt: 'A City & Suburban Heating & Cooling service van on a Chicago street' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [design.images.van] },
  }
}

// The published page, from cached data: built into the static HTML that visitors and crawlers get.
// params is awaited outside any Suspense boundary so every URL gets its own complete HTML.
export default async function AreaPage({ params }: Props) {
  const segment = (await params).slug
  const { slug } = parseAreaSegment(segment)
  const [{ data }, { data: tpl }, { data: list }] = await Promise.all([
    cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, ...published }),
    // The shared Service area template (one document for every area page)
    cachedSanity({ query: AREA_TEMPLATE_QUERY, ...published }),
    // The other published area pages, for "Other neighbourhoods we serve"
    cachedSanity({ query: AREA_LIST_QUERY, ...published }),
  ])
  const page = data as AreaPageData | null
  const template = resolveTemplate(tpl as AreaTemplateData | null)
  const live = page && stegaClean(page.slug) ? page : null
  // An old URL (/service-area/<slug>/) or a ZIP that is no longer the page's main ZIP: send the
  // visitor to the page's own URL. The 21 URLs that were live before the near-URL change also
  // have fixed 301s in next.config.ts; this covers anything else.
  const own = live && areaSegment(slug, stegaClean(live.districts?.zips?.[0]))
  if (own && own !== segment) permanentRedirect(areaPath(slug, stegaClean(live.districts?.zips?.[0])))
  return (
    <>
      {live && (
        <div className="cs-published" style={{ display: 'contents' }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(areaPageSchema(live, template, metaFor(live))) }} />
          <AreaPageV3 page={live} template={template} others={(list ?? []) as AreaListItem[]} preview={false} />
        </div>
      )}
      <Suspense fallback={null}>
        <PreviewAware slug={slug} hasPublished={!!live} />
      </Suspense>
    </>
  )
}

// Visitors: nothing (the published page above is the page), or a 404 when the slug has no
// published page. Inside the Studio's Preview (draft mode): the draft, shown in place of the
// published page.
async function PreviewAware({ slug, hasPublished }: { slug: string; hasPublished: boolean }) {
  const { perspective, variant, stega } = await getDynamicFetchOptions()
  if (perspective === 'published') {
    if (!hasPublished) notFound()
    return null
  }
  const [{ data }, { data: tpl }, { data: list }] = await Promise.all([
    cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, perspective, variant, stega }),
    cachedSanity({ query: AREA_TEMPLATE_QUERY, perspective, variant, stega }),
    cachedSanity({ query: AREA_LIST_QUERY, ...published }),
  ])
  const page = data as AreaPageData | null
  if (!page || !stegaClean(page.slug)) notFound()
  return (
    <>
      <style>{'.cs-published{display:none!important}'}</style>
      <AreaPageV3 page={page} template={resolveTemplate(tpl as AreaTemplateData | null)} others={(list ?? []) as AreaListItem[]} preview />
    </>
  )
}
