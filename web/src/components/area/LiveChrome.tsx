// Live-site header and footer (global blocks G1–G3), the same markup the static v2 pages use.
// The HTML is a static constant synced from assets/live/ by tools/sync_design_to_web.py.
import { areaPath } from '@/lib/siteUrl'

import { liveFooter, liveHeader } from './liveChromeHtml'

type Area = { name: string; slug: string; zip?: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// The SERVICES dropdown lists only the main areas, so the menu stays short over the hero; every
// area is on the All service areas page. Same list in tools/build_area_page.py (MAIN_AREAS).
export const MAIN_AREAS = ['west-loop', 'lincoln-park', 'wicker-park', 'lakeview']

/**
 * The header, with the main areas that are published filled into the SERVICES dropdown's
 * "Service areas" list. `current` marks the page's own area.
 */
export function LiveHeader({ areas = [], current }: { areas?: Area[]; current?: string }) {
  const bySlug = new Map(areas.map((a) => [a.slug, a]))
  const links = MAIN_AREAS.map((s) => bySlug.get(s))
    .filter((a): a is Area => !!a)
    .map((a) => `<li><a href="${esc(areaPath(a.slug, a.zip))}"${a.slug === current ? ' aria-current="page"' : ''}>${esc(a.name)}</a></li>`)
    .join('')
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveHeader.replace('<!--CH_AREAS-->', links) }} />
}

export function LiveFooter() {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveFooter }} />
}
