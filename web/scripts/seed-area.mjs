/**
 * Creates a service area page as a DRAFT in Sanity from a content file written with the
 * city-suburban-service-area-page skill (the same flat field keys it writes into Paper).
 *
 *   node --env-file=.env.local scripts/seed-area.mjs content/areas/west-town.json
 *
 * The file is { "area": {skill fields}, "extras": {fields Paper doesn't hold} }.
 * Only area-specific fields are written: everything shared lives in the Service area template
 * (scripts/seed-template.mjs). Never overwrites an existing draft or published page.
 *
 *   --replace-draft  replaces this script's own draft after the content file changes, but only if
 *                    nobody has edited it in the Studio since this script last wrote it (revisions are
 *                    kept in content/areas/.seeded.json) and nothing is published.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

import { buildAreaDoc } from './area-doc.mjs'

const file = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
const replaceDraft = process.argv.includes('--replace-draft')
if (!file) throw new Error('Usage: node --env-file=.env.local scripts/seed-area.mjs <content file> [--replace-draft]')

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN } = process.env
for (const [k, v] of Object.entries({ NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN })) {
  if (!v) throw new Error(`${k} is empty in .env.local`)
}

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw', // see drafts too, so the existing-page check works
})

const { area: a, extras: x } = JSON.parse(readFileSync(file, 'utf8'))

const built = buildAreaDoc({ area: a, extras: x })
if (built.errors.length) throw new Error(`${file} ${built.errors.join('; ')}`)
const doc = { _id: `drafts.area-${a._slug}`, ...built.doc }
const pubId = doc._id.replace('drafts.', '')
const SEEDED = new URL('../content/areas/.seeded.json', import.meta.url)
const seeded = existsSync(SEEDED) ? JSON.parse(readFileSync(SEEDED, 'utf8')) : {}
const remember = (res) => writeFileSync(SEEDED, JSON.stringify({ ...seeded, [res._id]: res._rev }, null, 1) + '\n')

const existing = await client.fetch('*[_id in [$id, $pub]]{_id, _rev, _createdAt, _updatedAt}', { id: doc._id, pub: pubId })
const draft = existing.find((d) => d._id === doc._id)
// Ours to replace: never touched since created, or still exactly the revision this script last wrote
const untouched = draft && (draft._createdAt === draft._updatedAt || seeded[draft._id] === draft._rev)
if (replaceDraft && draft && untouched && !existing.some((d) => d._id === pubId)) {
  const res = await client.createOrReplace(doc)
  remember(res)
  console.log(`Replaced draft: ${res._id} (${res.areaName})`)
} else if (existing.length) {
  const why = replaceDraft && draft && !untouched ? ' The draft has Studio edits, so it was left alone.' : ''
  console.log(`Already in Sanity (${existing.map((d) => d._id).join(', ')}). Nothing changed.${why}`)
} else {
  const res = await client.create(doc)
  remember(res)
  console.log(`Created draft: ${res._id} (${res.areaName})`)
}
