/**
 * The "All service areas" cards: the designed cards (collectionHtml.ts) for the published areas,
 * plus a card built from Sanity for any published area that has no designed card yet. The count
 * and photo credits follow. Used by web/src/app/(site)/service-areas/page.tsx.
 */
import { stegaClean } from 'next-sanity'

import { areaPath } from '@/lib/siteUrl'
import type { AreaListItem } from '@/sanity/types'

import { design } from './design'

type Row = AreaListItem

const escHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const PIN = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>'

// A published area that has no card in the collection design (a new area): its card is built from
// its own page in Sanity, in the same markup, so publishing it is all it takes. The photo is the
// shared service van until a card with its own photo is designed.
function builtCard(r: Row) {
  const slug = stegaClean(r.slug) as string
  const name = stegaClean(r.areaName) || slug
  const place = (stegaClean(r.communityArea) ?? '').replace(/\s*\(\d+\)$/, '')
  const chip = stegaClean(r.locality) ? `Suburb${place ? ` · ${place}` : ''}` : `Chicago${place ? ` · ${place}` : ''}`
  const desc = (stegaClean(r.lede) ?? '').replace(/\s*Family-owned since 1952.*$/, '')
  const hvac = stegaClean(r.hvac) ?? ''
  return `
      <article class="area"${stegaClean(r.locality) ? ' data-place="suburb"' : ''} aria-labelledby="area-${slug}">
        <div class="media"><img src="${design.images.van}" width="1235" height="848" alt="A City &amp; Suburban Heating &amp; Cooling service van" loading="lazy" decoding="async"><span class="chip">${PIN}${escHtml(chip)}</span></div>
        <div class="body">
          <p class="eyebrow">Service area</p>
          <h3 id="area-${slug}">${escHtml(name)}</h3>
          <p class="desc">${escHtml(desc)}</p>
          ${hvac ? `<p class="hvac">HVAC here: ${escHtml(hvac.replace(/^HVAC here:\s*/i, ''))}</p>` : ''}
        </div>
      </article>
`
}

// The collection shows only areas with a page in Sanity: their cards (linked), their photo credits,
// and the count. The Chicago citywide card always stays. Same rules as tools/update_design.py.
// A published area with no designed card gets one built from its page (builtCard), so the cards
// and the count always match the published pages, with no code change.
export function publishedOnly(designed: string, rows: Row[]) {
  const slugs = new Set(rows.map((r) => stegaClean(r.slug) as string))
  const has = new Set([...designed.matchAll(/<h3 id="area-([a-z0-9-]+)">/g)].map((m) => m[1]))
  const extra = rows.filter((r) => !has.has(stegaClean(r.slug) as string)).map(builtCard).join('')
  const html = extra ? designed.replace(/(<\/article>\s*)(<\/div>\s*<details class="credits">)/, `$1${extra}\n    $2`) : designed
  const shown: string[] = []
  let suburbs = 0
  // One card (<article>) at a time, so a card without an "HVAC here" line can't run into the next one
  let out = html.replace(/\s*<article class="area[^"]*"[\s\S]*?<\/article>/g, (card) => {
    const m = card.match(/<h3 id="area-([a-z-]+)">([^<]+)<\/h3>/)
    if (!m || card.includes('class="area city"')) return card
    const [heading, slug, name] = m
    if (!slugs.has(slug)) return ''
    shown.push(name)
    if (card.includes('data-place="suburb"')) suburbs++
    return card
      .replace(heading, `<h3 id="area-${slug}"><a class="stretch" href="${areaPath(slug)}">${name}</a></h3>`)
      .replace(/(<p class="hvac">[\s\S]*?<\/p>)/, `$1\n          <p class="open" aria-hidden="true">Open the ${name} page <span>→</span></p>`)
  })
  // Photo credits: Chicago, the hero and the cards on the page
  out = out.replace(/\s*<li>([A-Z][A-Za-z .']+): <a [\s\S]*?<\/li>/g, (li, name: string) =>
    name === 'Chicago' || shown.includes(name) ? li : '',
  )
  const n = shown.length
  const what = suburbs ? `Chicago neighborhoods and suburbs` : `Chicago neighborhood${n === 1 ? '' : 's'}`
  return out
    .replace(/aria-label="\d+ service areas?"/, `aria-label="${n} service area${n === 1 ? '' : 's'}"`)
    .replace(/<strong class="num">\d+<\/strong>/, `<strong class="num">${n}</strong>`)
    .replace(/(<strong class="num">\d+<\/strong>\s*<p>)[^<]*(<\/p>)/,
      `$1${what} we serve, each with its own page, all from one family shop.$2`)
    .replace('The nine neighborhoods below are', suburbs ? 'The neighborhoods and suburbs below are' : 'The neighborhoods below are')
}
