// Live-site header and footer (global blocks G1–G3), the same markup the static v2 pages use.
// The HTML is a static constant synced from assets/live/ by tools/sync_design_to_web.py.
import { areaPath } from '@/lib/siteUrl'

import { liveFooter, liveHeader } from './liveChromeHtml'

type Area = { name: string; slug: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/**
 * The header, with the published areas filled into the SERVICES dropdown's "Services by area" card,
 * so a newly published area page shows up there on its own. `current` marks the page's own area.
 */
export function LiveHeader({ areas = [], current }: { areas?: Area[]; current?: string }) {
  const links = areas
    .map((a) => `<a href="${esc(areaPath(a.slug))}"${a.slug === current ? ' aria-current="page"' : ''}>${esc(a.name)}</a>`)
    .join('')
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveHeader.replace('<!--CH_AREAS-->', links) }} />
}

export function LiveFooter() {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveFooter }} />
}
