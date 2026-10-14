/**
 * Publishes service area drafts, the same as the Studio's Publish button: the draft becomes the
 * published document and the draft is removed, in one transaction.
 *
 *   node --env-file=.env.local scripts/publish-area.mjs wicker-park pilsen
 *
 * Refuses a slug that has no draft. Lists any "to confirm" notes still on the page (they're
 * editorial and never shown on the site).
 */
import { createClient } from '@sanity/client'

const slugs = process.argv.slice(2)
if (!slugs.length) throw new Error('Usage: node --env-file=.env.local scripts/publish-area.mjs <slug> [more slugs]')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

for (const slug of slugs) {
  const draftId = `drafts.area-${slug}`
  const draft = await client.getDocument(draftId)
  if (!draft) {
    console.log(`${slug}: no draft to publish`)
    continue
  }
  const { _id, _rev, _createdAt, _updatedAt, ...fields } = draft
  await client.transaction().createOrReplace({ ...fields, _id: `area-${slug}` }).delete(draftId).commit()
  const notes = draft.confirmNotes?.length ?? 0
  console.log(`${slug}: published as area-${slug}${notes ? ` (${notes} confirm note${notes > 1 ? 's' : ''} still listed)` : ''}`)
}
