/**
 * Adds the v3 (Highlights layout) fields to the Service area template in Sanity, as a DRAFT:
 * review stats, "Why family-owned matters", "How we price", the How-to-choose table columns,
 * the company rows (and the fifth company type), "Where we fit", the permit intro, Other neighborhoods and the
 * call checklist. Values come from src/lib/template-defaults.json.
 *
 *   node --env-file=.env.local scripts/update-template-v3.mjs
 *
 * Additive only: a field that already has a value is never overwritten, so Studio edits are kept.
 * Publish the draft in the Studio (Service area template) once the v3 page is deployed.
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

const t = JSON.parse(readFileSync(new URL('../src/lib/template-defaults.json', import.meta.url), 'utf8'))
const keyed = (type, list) => list.map((item, i) => ({ _key: `${type}${i + 1}`, _type: type, ...item }))
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

const [published, draft] = await Promise.all([client.getDocument('areaTemplate'), client.getDocument('drafts.areaTemplate')])
if (!published) throw new Error('No Service area template in Sanity. Run scripts/seed-template.mjs first.')
const doc = structuredClone(draft ?? published)
const changed = []

// Set obj[key] only when it's empty
function fill(obj, key, value, label) {
  if (!empty(obj[key])) return
  obj[key] = value
  changed.push(label)
}

doc.about ??= {}
fill(doc.about, 'familyHeading', t.about.familyHeading, 'about.familyHeading')
fill(doc.about, 'familyPoints', t.about.familyPoints, 'about.familyPoints')

doc.reviews ??= {}
fill(doc.reviews, 'statsHeading', t.reviews.statsHeading, 'reviews.statsHeading')
fill(doc.reviews, 'statsIntro', t.reviews.statsIntro, 'reviews.statsIntro')
fill(doc.reviews, 'stats', keyed('reviewStat', t.reviews.stats), 'reviews.stats')
fill(doc.reviews, 'statsNote', t.reviews.statsNote, 'reviews.statsNote')

doc.price ??= {}
fill(doc.price, 'howWePrice', t.price.howWePrice, 'price.howWePrice')
fill(doc.price, 'medianQuestion', t.price.medianQuestion, 'price.medianQuestion')

// Table columns for the five questions, matched by title so a rewritten question is left alone
for (const q of doc.choose?.questions ?? []) {
  const d = t.choose.questions.find((x) => x.title === q.title)
  if (!d) continue
  fill(q, 'verify', d.verify, `choose "${q.title}" verify`)
  fill(q, 'answer', d.answer, `choose "${q.title}" answer`)
}

// Company rows, matched by title; the fifth company type is added if it isn't there
doc.companies ??= {}
doc.companies.items ??= []
for (const [i, d] of t.companies.items.entries()) {
  let c = doc.companies.items.find((x) => x.title === d.title)
  if (!c) {
    if (i < 4) continue // an edited original: leave it to the Studio
    c = { _key: `company${i + 1}`, _type: 'company', title: d.title, text: d.text, us: d.us }
    doc.companies.items.push(c)
    changed.push(`companies + "${d.title}"`)
  }
  for (const k of ['talkTo', 'priceSet', 'fitsWhen']) fill(c, k, d[k], `companies "${d.title}" ${k}`)
}
fill(doc.companies, 'fitNote', t.companies.fitNote, 'companies.fitNote')

doc.permits ??= {}
fill(doc.permits, 'intro', t.permits.intro, 'permits.intro')

doc.nearby ??= {}
for (const k of ['eyebrow', 'heading', 'intro']) fill(doc.nearby, k, t.nearby[k], `nearby.${k}`)

doc.cta ??= {}
fill(doc.cta, 'checklist', t.cta.checklist, 'cta.checklist')

if (!changed.length) {
  console.log('The template already has every v3 field. Nothing changed.')
} else {
  const body = Object.fromEntries(Object.entries(doc).filter(([k]) => !['_rev', '_createdAt', '_updatedAt'].includes(k)))
  const res = await client.createOrReplace({ ...body, _id: 'drafts.areaTemplate' })
  console.log(`${draft ? 'Updated' : 'Created'} draft ${res._id} with ${changed.length} new field(s):\n  ${changed.join('\n  ')}`)
  console.log('Publish it in the Studio (Service area template) when the v3 page is live.')
}
