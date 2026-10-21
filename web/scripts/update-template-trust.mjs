/**
 * Adds the design system v3.1 "Trust & Reviews" fields to the Service area template in Sanity, as a
 * DRAFT: the Yelp rating and page, the "Review on Google" link, the "write a review" box, the blue
 * trust band, the partner line and logo (American Standard), and the footer's Facebook and Instagram
 * pages. Values come from src/lib/template-defaults.json ("trust"); the logo from
 * public/cs-assets/live/american-standard-logo.png.
 *
 *   node --env-file=.env.local scripts/update-template-trust.mjs
 *
 * Additive only: a field that already has a value is never overwritten, so Studio edits are kept.
 * Every area page (published, draft and future) reads the template, so nothing changes per page.
 * Publish the draft in the Studio (Service area template) once the v3.1 design is deployed.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const t = JSON.parse(readFileSync(new URL('../src/lib/template-defaults.json', import.meta.url), 'utf8')).trust
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

const [published, draft] = await Promise.all([client.getDocument('areaTemplate'), client.getDocument('drafts.areaTemplate')])
if (!published) throw new Error('No Service area template in Sanity. Run scripts/seed-template.mjs first.')
const doc = structuredClone(draft ?? published)
const changed = []

doc.trust ??= {}
for (const [k, v] of Object.entries(t)) {
  if (k === 'band' || empty(v) || !empty(doc.trust[k])) continue
  doc.trust[k] = v
  changed.push(`trust.${k}`)
}
if (empty(doc.trust.band)) {
  doc.trust.band = t.band.map((b, i) => ({ _key: `band${i + 1}`, _type: 'bandItem', ...b }))
  changed.push('trust.band')
}
if (!doc.trust.partnerLogo?.asset) {
  const file = readFileSync(new URL('../public/cs-assets/live/american-standard-logo.png', import.meta.url))
  const asset = await client.assets.upload('image', file, { filename: 'american-standard-logo.png' })
  doc.trust.partnerLogo = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  changed.push('trust.partnerLogo')
}

if (!changed.length) {
  console.log('Nothing to add: the template already has every trust field.')
  process.exit(0)
}
doc._id = 'drafts.areaTemplate'
delete doc._rev
delete doc._createdAt
delete doc._updatedAt
await client.createOrReplace(doc)
console.log(`Draft saved (drafts.areaTemplate), ${changed.length} field(s) added:\n  ${changed.join('\n  ')}`)
console.log('Publish it in the Studio (Service area template) once the v3.1 design is deployed.')
