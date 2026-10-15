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

import { permitBreakdown } from './permit-breakdown.mjs'

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

// Pages arrive in Sanity with nothing left to confirm: resolve open items while writing (decide from
// data and sources, soften what can't be verified). Hero photo, licence and hours are template facts.
if (x.confirmNotes?.length) {
  throw new Error(`${file} still has ${x.confirmNotes.length} open confirm note(s). Resolve them first (python scripts/audit_area.py ${file}).`)
}

// A suburb (place.locality, e.g. "Skokie, IL") has no wards and no City permit data: it names
// its permit authority instead of the graph, and asks its own permit question as FAQ 4.
const suburb = !!a['place.locality']

// Every page follows the v3 standard design: the permit bar graph (a suburb: its permit authority)
// and 3-6 nearby neighborhoods
const nearbyCount = [1, 2, 3, 4, 5, 6].filter((i) => a[`nearby.${i}.name`]).length
if (suburb ? !a['permits.authority'] || nearbyCount < 3 : !(a['permits.by_equipment'] ?? x._sources?.permits?.by_equipment) || nearbyCount < 3) {
  throw new Error(`${file} doesn't follow the v3 design: it needs permits.by_equipment (with permits.total and the window) and 3-6 nearby.N.name / nearby.N.text (has ${nearbyCount}). Check it with python scripts/audit_area.py ${file}.`)
}

let n = 0
const k = () => `k${(n++).toString(36).padStart(3, '0')}`
const items = (type, list) => list.map((v) => ({ _key: k(), _type: type, ...v }))
const range = (count) => Array.from({ length: count }, (_, i) => i + 1)
const isPlaceholder = (s) => typeof s === 'string' && s.startsWith('[CONFIRM')
const wards = (chip) => (chip.match(/\d+/g) ?? []).map(Number)
const zips = (chip) => chip.match(/\b\d{5}\b/g) ?? []

// The permit graph: the content file's permits.* keys (skill v3), or hvac_permits.py's output in _sources
const permitSource = () =>
  a['permits.by_equipment']
    ? { by_equipment: a['permits.by_equipment'], permits_in_box: a['permits.total'], window: { from: a['permits.window_from'], to: a['permits.window_to'] } }
    : x._sources?.permits

// Shared blocks (process, questions, price intro and median, review heading, CTA heading, the
// "What's happening?" options and the shared FAQs) live in the Service area template, not here.

// Real reviews only: placeholders stay in the confirm notes, never in the page
const reviews = range(4)
  .filter((i) => !isPlaceholder(a[`reviews.${i}.quote`]))
  .map((i) => {
    const [name, year] = String(a[`reviews.${i}.by`]).split(' · ')
    return { service: a[`reviews.${i}.tag`], quote: a[`reviews.${i}.quote`], reviewerName: name, year: Number(year), googleUrl: x[`reviews.${i}.url`] }
  })

const doc = {
  _id: `drafts.area-${a._slug}`,
  _type: 'areaPage',
  areaName: a._area,
  areaNameInSentence: a._area_the,
  slug: { _type: 'slug', current: a._slug },
  ...(suburb ? { locality: a['place.locality'] } : {}),
  hero: {
    h1: a['hero.h1'],
    lede: a['hero.lede'],
    formTitle: a['form.title'],
    buildingTypeOptions: x.buildingTypeOptions,
    defaultBuildingType: a['form.building_default'],
  },
  services: { heading: a['services.heading'] },
  owner: { paragraph: a['who.copy'] },
  reviews: { items: items('review', reviews) },
  price: {
    heading: a['scope.heading'],
    factors: items('factor', range(6).map((i) => ({ title: a[`scope.${i}.factor`], text: a[`scope.${i}.why`] }))),
  },
  choose: { heading: a['choose.heading'] },
  districts: {
    // Skill writes the label in caps for Paper; the page sets the case with CSS
    eyebrow: a['districts.label'].toLowerCase().replace(/^./, (c) => c.toUpperCase()).replace(new RegExp(a._area, 'i'), a._area),
    heading: a['districts.heading'],
    zips: zips(a['districts.chip1']),
    wards: suburb ? [] : wards(a['districts.chip2']),
    communityArea: a['districts.chip3'],
    items: items('district', range(4).map((i) => ({
      name: a[`districts.${i}.name`],
      description: a[`districts.${i}.intro`],
      hvacHere: String(a[`districts.${i}.hvac`] ?? x[`districts.${i}.hvac`] ?? '').replace(/^HVAC here:\s*/i, ''),
    }))),
  },
  buildings: {
    heading: a['buildings.heading'],
    types: items('buildingType', range(4).map((i) => ({ tag: a[`buildings.${i}.tag`], name: a[`buildings.${i}.title`], text: a[`buildings.${i}.body`] }))),
  },
  permits: suburb
    ? { authority: a['permits.authority'] }
    : { areaCount: Number(a['permits.area_count']), areaCaption: a['permits.area_text'], ...permitBreakdown(permitSource()) },
  nearby: { items: items('nearbyArea', range(6).filter((i) => a[`nearby.${i}.name`]).map((i) => ({ name: a[`nearby.${i}.name`], text: a[`nearby.${i}.text`] }))) },
  faq: {
    heading: a['faq.heading'],
    // Questions 1-3 are the area's own; 4 and 5 (permits, hours) come from the template.
    // A suburb asks its own permit question as 4.
    items: items('faqItem', range(suburb ? 4 : 3).map((i) => ({ question: a[`faq.${i}.q`], answer: a[`faq.${i}.a`] ?? x[`faq.${i}.a`] }))),
  },
  cta: { text: a['cta.body'] },
  seo: { title: x['seo.title'], description: x['seo.description'] },
  confirmNotes: items('confirmNote', x.confirmNotes ?? []),
}

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
