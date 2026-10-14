import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { AreaPageV2 } from '@/components/area/AreaPageV2'
import { design } from '@/components/area/design'
import { resolveTemplate } from '@/components/area/template'
import { areaPageSchema, jsonLd } from '@/lib/schema'
import { areaPath } from '@/lib/siteUrl'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY, AREA_PAGE_QUERY, AREA_TEMPLATE_QUERY } from '@/sanity/queries'
import type { AreaPageData, AreaTemplateData } from '@/sanity/types'

// Public URL: /service-area/<slug>/ (next.config.ts rewrites it to this route).
type Props = PageProps<'/service-areas/[slug]'>

const published = { perspective: 'published' as const, stega: false }

// Every published area page is built into static HTML; a page published later is rendered on its
// first visit and cached (ISR with Cache Components).
export async function generateStaticParams() {
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, ...published })
  const slugs = ((data ?? []) as { slug?: string }[]).map((r) => r.slug).filter((s): s is string => !!s)
  return slugs.map((slug) => ({ slug }))
}

function metaFor(page: AreaPageData) {
  return {
    title: stegaClean(page.seo?.title || page.hero?.h1) ?? '',
    description: stegaClean(page.seo?.description || page.hero?.lede) ?? '',
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const { data } = await cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, ...published })
  const page = data as AreaPageData | null
  if (!page) return {}
  const { title, description } = metaFor(page)
  const url = areaPath(slug)
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
  const { slug } = await params
  const [{ data }, { data: tpl }] = await Promise.all([
    cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, ...published }),
    // The shared Service area template (one document for every area page)
    cachedSanity({ query: AREA_TEMPLATE_QUERY, ...published }),
  ])
  const page = data as AreaPageData | null
  const template = resolveTemplate(tpl as AreaTemplateData | null)
  const live = page && stegaClean(page.slug) ? page : null
  return (
    <>
      {live && (
        <div className="cs-published" style={{ display: 'contents' }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(areaPageSchema(live, template, metaFor(live))) }} />
          <AreaPageV2 page={live} template={template} preview={false} />
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
  const [{ data }, { data: tpl }] = await Promise.all([
    cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, perspective, variant, stega }),
    cachedSanity({ query: AREA_TEMPLATE_QUERY, perspective, variant, stega }),
  ])
  const page = data as AreaPageData | null
  if (!page || !stegaClean(page.slug)) notFound()
  return (
    <>
      <style>{'.cs-published{display:none!important}'}</style>
      <AreaPageV2 page={page} template={resolveTemplate(tpl as AreaTemplateData | null)} preview />
    </>
  )
}
