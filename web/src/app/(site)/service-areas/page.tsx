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
export const metadata: Metadata = {
  title: collectionTitle,
  description: collectionDescription,
  alternates: { canonical: '/service-areas' },
}

type Row = { slug?: string }

export default async function ServiceAreasPage() {
  // Published pages are the same for every visitor, so their links are in the first HTML
  // (crawlers and no-JS visitors see them). Inside the preview, drafts get linked too.
  const published = await linkedHtml('published')
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: collectionCss }} />
      <LiveHeader />
      <Suspense fallback={<Collection html={published} />}>
        <PreviewAwareCollection />
      </Suspense>
      <LiveFooter />
    </>
  )
}

async function PreviewAwareCollection() {
  const { perspective, variant } = await getDynamicFetchOptions()
  return <Collection html={await linkedHtml(perspective, variant)} />
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
      .replace(heading, `<h3 id="area-${slug}"><a class="stretch" href="/service-areas/${slug}">${name}</a></h3>`)
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
