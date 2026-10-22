import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { publishedOnly } from '@/components/area/collectionCards'
import { collectionCss, collectionDescription, collectionMain, collectionTitle } from '@/components/area/collectionHtml'
import { design } from '@/components/area/design'
import { LiveFooter, LiveHeader } from '@/components/area/LiveChrome'
import { resolveTemplate } from '@/components/area/template'
import { collectionSchema, jsonLd } from '@/lib/schema'
import { collectionPath } from '@/lib/siteUrl'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY, AREA_TEMPLATE_QUERY } from '@/sanity/queries'
import type { AreaListItem, AreaTemplateData } from '@/sanity/types'

// The live "All service areas" collection page, synced from services-v2/service-areas/ by
// tools/sync_design_to_web.py. Cards link to an area page only when that page exists in Sanity:
// published pages for visitors, drafts too inside the Presentation preview.
export const metadata: Metadata = {
  title: collectionTitle,
  description: collectionDescription,
  alternates: { canonical: collectionPath },
  openGraph: {
    type: 'website',
    url: collectionPath,
    title: collectionTitle,
    description: collectionDescription,
    siteName: 'City & Suburban Heating & Cooling',
    locale: 'en_US',
    images: [{ url: design.images.van, width: 1235, height: 848, alt: 'A City & Suburban Heating & Cooling service van on a Chicago street' }],
  },
  twitter: { card: 'summary_large_image', title: collectionTitle, description: collectionDescription, images: [design.images.van] },
}

type Row = AreaListItem

export default async function ServiceAreasPage() {
  // Published pages are the same for every visitor, so their links are in the first HTML
  // (crawlers and no-JS visitors see them). Inside the preview, drafts get linked too.
  const published = await linkedHtml('published')
  const [{ data: list }, { data: tpl }] = await Promise.all([
    cachedSanity({ query: AREA_LIST_QUERY, perspective: 'published', stega: false }),
    cachedSanity({ query: AREA_TEMPLATE_QUERY, perspective: 'published', stega: false }),
  ])
  const areas = ((list ?? []) as Row[]).filter((r) => r.slug).map((r) => ({ slug: r.slug as string, zip: r.zip, name: r.areaName ?? r.slug as string }))
  const schema = collectionSchema(resolveTemplate(tpl as AreaTemplateData | null), areas, { title: collectionTitle, description: collectionDescription })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <style dangerouslySetInnerHTML={{ __html: collectionCss }} />
      <LiveHeader areas={areas} />
      <div className="cs-published" style={{ display: 'contents' }}><Collection html={published} /></div>
      <Suspense fallback={null}>
        <PreviewAwareCollection />
      </Suspense>
      <LiveFooter />
    </>
  )
}

// Visitors: nothing (the published collection above is the page). Inside the Studio's Preview
// (draft mode): the collection with drafts linked too, shown in place of the published one.
async function PreviewAwareCollection() {
  const { perspective, variant } = await getDynamicFetchOptions()
  if (perspective === 'published') return null
  return (
    <>
      <style>{'.cs-published{display:none!important}'}</style>
      <Collection html={await linkedHtml(perspective, variant)} />
    </>
  )
}

async function linkedHtml(perspective: Awaited<ReturnType<typeof getDynamicFetchOptions>>['perspective'], variant?: string) {
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, perspective, variant, stega: false })
  const rows = ((data ?? []) as Row[]).filter((r) => stegaClean(r.slug))
  return publishedOnly(collectionMain, rows)
}

function Collection({ html }: { html: string }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
}
