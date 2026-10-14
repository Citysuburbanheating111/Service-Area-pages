import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { collectionCss, collectionDescription, collectionMain, collectionTitle } from '@/components/area/collectionHtml'
import { LiveFooter, LiveHeader } from '@/components/area/LiveChrome'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY } from '@/sanity/queries'

// The live "All service areas" collection page, synced from services-v2/service-areas/ by
// tools/sync_design_to_web.py. Cards link to an area page only when that page exists in Sanity:
// published pages for visitors, drafts too inside the Presentation preview.
export const metadata: Metadata = { title: collectionTitle, description: collectionDescription }

type Row = { slug?: string }

export default function ServiceAreasPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: collectionCss }} />
      <LiveHeader />
      <Suspense fallback={<Collection html={collectionMain} />}>
        <LinkedCollection />
      </Suspense>
      <LiveFooter />
    </>
  )
}

async function LinkedCollection() {
  const { perspective, variant } = await getDynamicFetchOptions()
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, perspective, variant, stega: false })
  const slugs = new Set(((data ?? []) as Row[]).map((r) => stegaClean(r.slug)).filter((s): s is string => !!s))
  return <Collection html={linkCards(collectionMain, slugs)} />
}

function Collection({ html }: { html: string }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
}

// Turn a card's heading into a link (stretched over the card) and add the "Open the … page" line
function linkCards(html: string, slugs: Set<string>) {
  // One card (<article>) at a time, so a card without an "HVAC here" line can't run into the next one
  return html.replace(/<article class="area[^"]*"[\s\S]*?<\/article>/g, (card) => {
    const m = card.match(/<h3 id="area-([a-z-]+)">([^<]+)<\/h3>/)
    if (!m || !slugs.has(m[1])) return card
    const [heading, slug, name] = m
    return card
      .replace(heading, `<h3 id="area-${slug}"><a class="stretch" href="/service-areas/${slug}">${name}</a></h3>`)
      .replace(/(<p class="hvac">[\s\S]*?<\/p>)/, `$1\n          <p class="open" aria-hidden="true">Open the ${name} page <span>→</span></p>`)
  })
}
