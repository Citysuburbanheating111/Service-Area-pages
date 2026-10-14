import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { collectionCss, collectionDescription, collectionMain, collectionTitle } from '@/components/area/collectionHtml'
import { design } from '@/components/area/design'
import { LiveFooter, LiveHeader } from '@/components/area/LiveChrome'
import { resolveTemplate } from '@/components/area/template'
import { collectionSchema, jsonLd } from '@/lib/schema'
import { areaPath, collectionPath } from '@/lib/siteUrl'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY, AREA_TEMPLATE_QUERY } from '@/sanity/queries'
import type { AreaTemplateData } from '@/sanity/types'

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

type Row = { slug?: string; areaName?: string }

export default async function ServiceAreasPage() {
  // Published pages are the same for every visitor, so their links are in the first HTML
  // (crawlers and no-JS visitors see them). Inside the preview, drafts get linked too.
  const published = await linkedHtml('published')
  const [{ data: list }, { data: tpl }] = await Promise.all([
    cachedSanity({ query: AREA_LIST_QUERY, perspective: 'published', stega: false }),
    cachedSanity({ query: AREA_TEMPLATE_QUERY, perspective: 'published', stega: false }),
  ])
  const areas = ((list ?? []) as Row[]).filter((r) => r.slug).map((r) => ({ slug: r.slug as string, name: r.areaName ?? r.slug as string }))
  const schema = collectionSchema(resolveTemplate(tpl as AreaTemplateData | null), areas, { title: collectionTitle, description: collectionDescription })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <style dangerouslySetInnerHTML={{ __html: collectionCss }} />
      <LiveHeader />
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
  const slugs = new Set(((data ?? []) as Row[]).map((r) => stegaClean(r.slug)).filter((s): s is string => !!s))
  return publishedOnly(collectionMain, slugs)
}

function Collection({ html }: { html: string }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
}

// The collection shows only areas with a page in Sanity: their cards (linked), their photo credits,
// and the count. The Chicago citywide card always stays. Same rules as tools/update_design.py.
function publishedOnly(html: string, slugs: Set<string>) {
  const shown: string[] = []
  // One card (<article>) at a time, so a card without an "HVAC here" line can't run into the next one
  let out = html.replace(/\s*<article class="area[^"]*"[\s\S]*?<\/article>/g, (card) => {
    const m = card.match(/<h3 id="area-([a-z-]+)">([^<]+)<\/h3>/)
    if (!m || card.includes('class="area city"')) return card
    const [heading, slug, name] = m
    if (!slugs.has(slug)) return ''
    shown.push(name)
    return card
      .replace(heading, `<h3 id="area-${slug}"><a class="stretch" href="${areaPath(slug)}">${name}</a></h3>`)
      .replace(/(<p class="hvac">[\s\S]*?<\/p>)/, `$1\n          <p class="open" aria-hidden="true">Open the ${name} page <span>→</span></p>`)
  })
  // Photo credits: Chicago, the hero and the cards on the page
  out = out.replace(/\s*<li>([A-Z][A-Za-z .']+): <a [\s\S]*?<\/li>/g, (li, name: string) =>
    name === 'Chicago' || shown.includes(name) ? li : '',
  )
  const n = shown.length
  return out
    .replace(/aria-label="\d+ service areas?"/, `aria-label="${n} service area${n === 1 ? '' : 's'}"`)
    .replace(/<strong class="num">\d+<\/strong>/, `<strong class="num">${n}</strong>`)
    .replace(/(<strong class="num">\d+<\/strong>\s*<p>)[^<]*(<\/p>)/,
      `$1Chicago neighborhood${n === 1 ? '' : 's'} we serve, each with its own page, all from one family shop.$2`)
    .replace('The nine neighborhoods below are', 'The neighborhoods below are')
}
