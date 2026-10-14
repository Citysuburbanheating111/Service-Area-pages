/**
 * Creates a service area page as a DRAFT in Sanity from a content file written with the
 * city-suburban-service-area-page skill (the same flat field keys it writes into Paper).
 *
 *   node --env-file=.env.local scripts/seed-area.mjs content/areas/west-town.json
 *
 * The file is { "area": {skill fields}, "extras": {fields Paper doesn't hold} }.
 * Blocks the skill treats as shared (process, five questions, price intro and median) are filled
 * from the approved template. Never overwrites an existing draft or published page.
 *
 *   --replace-draft  replaces this script's own draft after the content file changes, but only if
 *                    nobody has edited it in the Studio since this script last wrote it (revisions are
 *                    kept in content/areas/.seeded.json) and nothing is published.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

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

let n = 0
const k = () => `k${(n++).toString(36).padStart(3, '0')}`
const items = (type, list) => list.map((v) => ({ _key: k(), _type: type, ...v }))
const range = (count) => Array.from({ length: count }, (_, i) => i + 1)
const isPlaceholder = (s) => typeof s === 'string' && s.startsWith('[CONFIRM')
const wards = (chip) => (chip.match(/\d+/g) ?? []).map(Number)
const zips = (chip) => chip.match(/\b\d{5}\b/g) ?? []

// Shared blocks: identical on every area page (skill: "stays as designed")
const STEPS = [
  { title: 'You call, Rob listens', text: "Tell us the make of the furnace or condenser and what it's doing. A good description often narrows it down on the phone." },
  { title: 'Pick a time', text: "Monday to Saturday from 6 AM. High-rise visits are booked around your building's elevator and work hours." },
  { title: 'On-site diagnosis', text: 'The technician finds the actual fault: ignition, pressure, refrigerant, airflow or controls.' },
  { title: 'Honest price, repair first', text: 'You hear the price before any work. If the unit has years left, we say so and repair it.' },
  { title: 'We fix it', text: 'Repairs done on the spot where the part is on the van. Installs are scheduled and quoted separately.' },
  { title: 'Good to go', text: 'The system is tested through a full cycle before we leave, and you know what to watch for.' },
]
const QUESTIONS = [
  { title: 'Who diagnoses, and who quotes?', text: "If they're different people, ask who owns the outcome. Here it's Rob for both." },
  { title: 'Is the technician on commission?', text: 'Commission on replacements changes what "your furnace is done" means.' },
  { title: 'Does a permit count mean anything here?', text: "Not for repairs. Chicago doesn't permit HVAC repair or maintenance, so a permit count only measures installs." },
  { title: 'What do the newest reviews say?', text: 'Read the last 20, not the top 5. Look for names and specifics.' },
  { title: 'Will they tell you to keep it?', text: 'Ask if the unit has years left. Our reviewers record hearing "yes".' },
]

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
  hero: {
    h1: a['hero.h1'],
    lede: a['hero.lede'],
    formTitle: a['form.title'],
    buildingTypeOptions: x.buildingTypeOptions,
    defaultBuildingType: a['form.building_default'],
    // Same five options as the approved West Loop reference page
    issueOptions: ['No heat or no cooling', 'Strange noise or smell', 'Tune-up or maintenance', 'Replacement quote', 'Something else'],
  },
  services: { heading: a['services.heading'] },
  owner: { paragraph: a['who.copy'] },
  reviews: {
    heading: 'Why Chicago homeowners keep calling the same family',
    intro: 'Quoted word for word from Google, never edited. Several reviewers were told their old unit still had years left.',
    items: items('review', reviews),
  },
  process: { heading: 'From the first call to a warm apartment, in six steps', steps: items('step', STEPS) },
  price: {
    heading: a['scope.heading'],
    intro: "We don't publish a price book, and we're not going to invent one here. What we can show you is what moves the number.",
    medianValue: '$6,807',
    medianCaption: "Median reported value of 81 central-furnace replacement permits in Chicago over 24 months. That's the whole project's construction value, not a quote.",
    factors: items('factor', range(6).map((i) => ({ title: a[`scope.${i}.factor`], text: a[`scope.${i}.why`] }))),
  },
  choose: { heading: a['choose.heading'], questions: items('question', QUESTIONS) },
  districts: {
    // Skill writes the label in caps for Paper; the page sets the case with CSS
    eyebrow: a['districts.label'].toLowerCase().replace(/^./, (c) => c.toUpperCase()).replace(new RegExp(a._area, 'i'), a._area),
    heading: a['districts.heading'],
    zips: zips(a['districts.chip1']),
    wards: wards(a['districts.chip2']),
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
  permits: { areaCount: Number(a['permits.area_count']), areaCaption: a['permits.area_text'] },
  faq: {
    heading: a['faq.heading'],
    items: items('faqItem', range(5).map((i) => ({ question: a[`faq.${i}.q`], answer: a[`faq.${i}.a`] ?? x[`faq.${i}.a`] }))),
  },
  cta: { heading: 'No heat, no cooling, or just a question?', text: a['cta.body'] },
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
