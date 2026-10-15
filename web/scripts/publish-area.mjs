/**
 * Publishes service area drafts, the same as the Studio's Publish button: the draft becomes the
 * published document and the draft is removed, in one transaction.
 *
 *   node --env-file=.env.local scripts/publish-area.mjs wicker-park pilsen
 *   node --env-file=.env.local scripts/publish-area.mjs template        (the Service area template)
 *
 * Refuses a slug that has no draft, and an area page that doesn't follow the v3 standard design:
 * it needs the permit bar graph (permits.byEquipment with the window and total; a suburb: its permit
 * authority instead) and 3-6 nearby
 * neighborhoods. Lists any "to confirm" notes still on the page (they're editorial and never shown
 * on the site).
 */
import { createClient } from '@sanity/client'

const slugs = process.argv.slice(2)
if (!slugs.length) throw new Error('Usage: node --env-file=.env.local scripts/publish-area.mjs <slug|template> [more]')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

/** What an area page needs before it can go live in the v3 design */
function missingV3(doc) {
  const p = doc.permits ?? {}
  const gaps = []
  if (doc.locality) {
    // A suburb: no City permit data, so it names who issues permits there instead of the graph
    if (!p.authority) gaps.push('the permit authority (permits.authority, e.g. "The Village of Skokie")')
  } else {
    if (!p.byEquipment?.length) gaps.push('the permit bar graph (permits.byEquipment)')
    if (typeof p.totalPermits !== 'number' || !p.windowFrom || !p.windowTo) gaps.push('the data-source numbers (permits.totalPermits, windowFrom, windowTo)')
  }
  const near = doc.nearby?.items?.length ?? 0
  if (near < 3) gaps.push(`3-6 nearby neighborhoods (has ${near})`)
  return gaps
}

for (const slug of slugs) {
  const id = slug === 'template' ? 'areaTemplate' : `area-${slug}`
  const draftId = `drafts.${id}`
  const draft = await client.getDocument(draftId)
  if (!draft) {
    console.log(`${slug}: no draft to publish`)
    continue
  }
  if (slug !== 'template') {
    const gaps = missingV3(draft)
    if (gaps.length) {
      console.log(`${slug}: not published. Missing ${gaps.join('; ')}. Run scripts/backfill-v3-fields.mjs or fix the content file.`)
      process.exitCode = 1
      continue
    }
  }
  const fields = Object.fromEntries(Object.entries(draft).filter(([k]) => !['_id', '_rev', '_createdAt', '_updatedAt'].includes(k)))
  await client.transaction().createOrReplace({ ...fields, _id: id }).delete(draftId).commit()
  const notes = draft.confirmNotes?.length ?? 0
  console.log(`${slug}: published as ${id}${notes ? ` (${notes} confirm note${notes > 1 ? 's' : ''} still listed)` : ''}`)
}
