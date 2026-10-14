/**
 * Copies the picked reviews from content/areas/<slug>.json into each area page in Sanity,
 * as a DRAFT. Published pages are never changed: if a page is only published, a draft copy is
 * made with the reviews added, ready to review and publish in the Studio.
 *
 *   node --env-file=.env.local scripts/sync-reviews.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const dir = new URL('../content/areas/', import.meta.url)
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const { area: a, extras: x } = JSON.parse(readFileSync(new URL(file, dir), 'utf8'))
  const items = [1, 2, 3, 4]
    .filter((i) => a[`reviews.${i}.quote`] && !a[`reviews.${i}.quote`].startsWith('[CONFIRM'))
    .map((i) => {
      const [name, year] = a[`reviews.${i}.by`].split(' · ')
      return {
        _key: `review${i}`,
        _type: 'review',
        service: a[`reviews.${i}.tag`],
        quote: a[`reviews.${i}.quote`],
        reviewerName: name,
        year: Number(year),
        googleUrl: x[`reviews.${i}.url`],
      }
    })
  if (!items.length) continue

  const pub = `area-${a._slug}`
  const draft = `drafts.${pub}`
  const [d, p] = await Promise.all([client.getDocument(draft), client.getDocument(pub)])
  if (!d && !p) {
    console.log(`${a._area}: not in Sanity, skipped`)
    continue
  }
  const base = d ?? { ...p, _id: draft }
  const notes = (base.confirmNotes ?? []).filter((n) => n.block !== 'B4 Reviews')
  const next = { ...base, reviews: { ...(base.reviews ?? {}), items }, confirmNotes: notes }
  delete next._rev
  delete next._updatedAt
  delete next._createdAt
  await client.createOrReplace(next)
  console.log(`${a._area}: ${items.length} reviews written to ${draft}${d ? '' : ' (new draft from the published page)'}`)
}
