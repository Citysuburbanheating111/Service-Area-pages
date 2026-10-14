// Live-site header and footer (global blocks G1–G3), the same markup the static v2 pages use.
// The HTML is a static constant synced from assets/live/ by tools/sync_design_to_web.py.
import { liveFooter, liveHeader } from './liveChromeHtml'

export function LiveHeader() {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveHeader }} />
}

export function LiveFooter() {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: liveFooter }} />
}
