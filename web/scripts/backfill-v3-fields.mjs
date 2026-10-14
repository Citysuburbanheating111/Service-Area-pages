/**
 * Brings every service area page already in Sanity up to the v3 standard design, from its content file
 * in content/areas/<slug>.json: the permit bar graph and data-source line (permits.totalPermits,
 * windowFrom, windowTo, byEquipment) and the neighborhoods next to the area (nearby.items).
 *
 *   node --env-file=.env.local scripts/backfill-v3-fields.mjs
 *
 * Writes DRAFTS only: a published page gets a draft copy with the new fields; an existing draft is
 * patched. Fields that already have a value are left alone. Publish each page in the Studio to make
 * it live. Pages are skipped when the content file is missing or its permit count disagrees with
 * the page's.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

import { permitBreakdown } from './permit-breakdown.mjs'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const docs = await client.fetch('*[_type == "areaPage"]{_id, "slug": slug.current, areaName, permits, nearby}')
const bySlug = Object.groupBy(docs, (d) => d.slug)

for (const [slug, versions] of Object.entries(bySlug)) {
  const file = new URL(`../content/areas/${slug}.json`, import.meta.url)
  if (!existsSync(file)) { console.log(`${slug}: no content file, skipped`); continue }
  const { area, extras } = JSON.parse(readFileSync(file, 'utf8'))
  const fields = permitBreakdown(extras?._sources?.permits)
  if (!fields.byEquipment) { console.log(`${slug}: no permit breakdown in the content file, skipped`); continue }
  const nearby = [1, 2, 3, 4, 5, 6].filter((i) => area[`nearby.${i}.name`])
    .map((i) => ({ _key: `nearby${i}`, _type: 'nearbyArea', name: area[`nearby.${i}.name`], text: area[`nearby.${i}.text`] }))

  const draft = versions.find((d) => d._id.startsWith('drafts.'))
  const current = draft ?? versions[0]
  const count = current.permits?.areaCount
  if (count !== Number(area['permits.area_count'])) {
    console.log(`${slug}: page shows ${count} permits but the content file has ${area['permits.area_count']}, skipped`)
    continue
  }
  const set = Object.fromEntries(Object.entries(fields).filter(([k]) => current.permits?.[k] == null).map(([k, v]) => [`permits.${k}`, v]))
  if (nearby.length && !current.nearby?.items?.length) set['nearby.items'] = nearby
  if (!Object.keys(set).length) { console.log(`${slug}: already up to date`); continue }

  const draftId = `drafts.${current._id.replace(/^drafts\./, '')}`
  const tx = client.transaction()
  if (!draft) {
    const doc = await client.getDocument(current._id)
    const published = Object.fromEntries(Object.entries(doc).filter(([k]) => !['_rev', '_createdAt', '_updatedAt'].includes(k)))
    tx.createIfNotExists({ ...published, _id: draftId })
  }
  tx.patch(draftId, (p) => p.set(set))
  await tx.commit()
  const rows = fields.byEquipment.map((r) => `${r.label} ${r.count}`).join(', ')
  console.log(`${slug}: ${draft ? 'draft updated' : 'draft created'} · ${Object.keys(set).join(', ')} · ${fields.totalPermits} permits, ${count} HVAC · ${rows}`)
}
console.log('Publish each page in the Studio to make the changes live.')
