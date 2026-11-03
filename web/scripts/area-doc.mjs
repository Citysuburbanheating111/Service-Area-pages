/**
 * The area page a content file makes: { "area": {skill fields}, "extras": {fields Paper doesn't hold} } -> an
 * areaPage document (no _id). Used by scripts/seed-area.mjs and bundled into the writing sheet's Apps Script, so a
 * file pasted into "Add a page from Claude" gets exactly the same page. No Node imports.
 */
import { permitBreakdown } from './permit-breakdown.mjs'

/** @returns {{ doc?: Record<string, any>, errors: string[] }} */
export function buildAreaDoc({ area: a = {}, extras: x = {} }) {
  const fail = (message) => ({ errors: [message] })
  // Pages arrive in Sanity with nothing left to confirm: resolve open items while writing (decide from
  // data and sources, soften what can't be verified). Hero photo, licence and hours are template facts.
  if (x.confirmNotes?.length) {
    return fail(`still has ${x.confirmNotes.length} open confirm note(s). Resolve them first (python scripts/audit_area.py <file>).`)
  }

  // A suburb (place.locality, e.g. "Skokie, IL") has no wards and no City permit data: it names
  // its permit authority instead of the graph, and asks its own permit question as FAQ 4.
  const suburb = !!a['place.locality']

  // Every page follows the v3 standard design: the permit bar graph (a suburb: its permit authority)
  // and 3-6 nearby neighborhoods
  const nearbyCount = [1, 2, 3, 4, 5, 6].filter((i) => a[`nearby.${i}.name`]).length
  if (suburb ? !a['permits.authority'] || nearbyCount < 3 : !(a['permits.by_equipment'] ?? x._sources?.permits?.by_equipment) || nearbyCount < 3) {
    return fail(`doesn't follow the v3 design: it needs permits.by_equipment (with permits.total and the window) and 3-6 nearby.N.name / nearby.N.text (has ${nearbyCount}). Check it with python scripts/audit_area.py <file>.`)
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
  delete doc._id
  return { doc, errors: [] }
}
