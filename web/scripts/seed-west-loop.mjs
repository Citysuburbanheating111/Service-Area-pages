/**
 * Creates the West Loop service area page as a DRAFT in Sanity.
 * Copy comes from the approved West Loop template (Paper / live preview).
 *
 * Run from the web folder:
 *   node --env-file=.env.local scripts/seed-west-loop.mjs
 *
 * Uses SANITY_API_WRITE_TOKEN from .env.local. The token is never printed.
 * Safe to re-run: it won't overwrite a draft that already exists.
 */
import { createClient } from '@sanity/client'

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
})

let n = 0
const k = () => `k${(n++).toString(36).padStart(3, '0')}`
const items = (type, list) => list.map((x) => ({ _key: k(), _type: type, ...x }))

const doc = {
  _id: 'drafts.area-west-loop',
  _type: 'areaPage',

  areaName: 'West Loop',
  areaNameInSentence: 'the West Loop',
  slug: { _type: 'slug', current: 'west-loop' },

  hero: {
    h1: 'Heating and cooling repair in the West Loop, Chicago',
    lede: 'Furnaces, boilers, central air, ductless systems and restaurant make-up air, for West Loop lofts, high-rise condos, townhomes and kitchens. Family-owned since 1952, with the owner, Rob, still on the calls.',
    formTitle: 'Book HVAC service in the West Loop',
    buildingTypeOptions: ['Converted warehouse loft', 'High-rise condo', 'Condo or townhome', 'Restaurant or office'],
    defaultBuildingType: 'Converted warehouse loft',
    issueOptions: ['No heat or no cooling'],
  },

  services: {
    heading: 'Every heating and cooling service we offer in the West Loop',
  },

  owner: {
    paragraph: 'City & Suburban is run from 1225 N Cleaver St, about a mile and a half north of Fulton Market. Rob, the owner, still runs the calls and does the diagnosis on the jobs that need it.',
  },

  reviews: {
    heading: 'Why Chicago homeowners keep calling the same family',
    intro: 'Quoted word for word from Google, never edited. Several reviewers were told their old unit still had years left.',
    items: [],
  },

  process: {
    heading: 'From the first call to a warm apartment, in six steps',
    steps: items('step', [
      { title: 'You call, Rob listens', text: "Tell us the make of the furnace or condenser and what it's doing. A good description often narrows it down on the phone." },
      { title: 'Pick a time', text: "Monday to Saturday from 6 AM. High-rise visits are booked around your building's elevator and work hours." },
      { title: 'On-site diagnosis', text: 'The technician finds the actual fault: ignition, pressure, refrigerant, airflow or controls.' },
      { title: 'Honest price, repair first', text: 'You hear the price before any work. If the unit has years left, we say so and repair it.' },
      { title: 'We fix it', text: 'Repairs done on the spot where the part is on the van. Installs are scheduled and quoted separately.' },
      { title: 'Good to go', text: 'The system is tested through a full cycle before we leave, and you know what to watch for.' },
    ]),
  },

  price: {
    heading: 'The same repair costs differently in a loft, a tower and a kitchen',
    intro: "We don't publish a price book, and we're not going to invent one here. What we can show you is what moves the number.",
    medianValue: '$6,807',
    medianCaption: "Median reported value of 81 central-furnace replacement permits in Chicago over 24 months. That's the whole project's construction value, not a quote.",
    factors: items('factor', [
      { title: 'Rooftop access', text: "Condensers on loft and tower roofs mean roof hatches, ladders, and sometimes a crane for a replacement." },
      { title: 'Building rules', text: 'High-rises want a certificate of insurance, a booked freight elevator and set working hours before anyone arrives.' },
      { title: 'The system you inherited', text: 'Steam and hot-water boilers in converted warehouses, fan coils in towers, forced air in newer mid-rises. Each is a different repair.' },
      { title: 'Concrete and exposed ceilings', text: "Line sets and ductwork can't be hidden in a slab. In a loft they have to run where they look intentional." },
      { title: 'Restaurant kitchens', text: 'Make-up air has to balance the hood. Work is scheduled around service on Randolph and in Fulton Market.' },
      { title: 'Repair or replace', text: 'The biggest swing of all. Where the unit has years left, we say so.' },
    ]),
  },

  choose: {
    heading: 'Five questions that sort West Loop HVAC companies',
    questions: items('question', [
      { title: 'Who diagnoses, and who quotes?', text: "If they're different people, ask who owns the outcome. Here it's Rob for both." },
      { title: 'Is the technician on commission?', text: 'Commission on replacements changes what "your furnace is done" means.' },
      { title: 'Does a permit count mean anything here?', text: "Not for repairs. Chicago doesn't permit HVAC repair or maintenance, so a permit count only measures installs." },
      { title: 'What do the newest reviews say?', text: 'Read the last 20, not the top 5. Look for names and specifics.' },
      { title: 'Will they tell you to keep it?', text: 'Ask if the unit has years left. Our reviewers record hearing "yes".' },
    ]),
  },

  districts: {
    eyebrow: 'The West Loop, district by district',
    heading: 'Grand Ave to I-290, Ashland to the river',
    zips: ['60607', '60661', '60606'],
    wards: [27, 34, 42],
    communityArea: 'Near West Side (28)',
    items: items('district', [
      { name: 'Fulton Market', description: 'Former cold-storage and meatpacking buildings, now offices, hotels and restaurants.', hvacHere: 'rooftop units, make-up air, steam in older lofts.' },
      { name: 'Randolph Street', description: 'Restaurant Row, between Halsted and Racine.', hvacHere: 'kitchen make-up air, dining-room cooling, after-hours visits.' },
      { name: 'West Loop Gate', description: 'High-rise apartments and offices around Union Station and Ogilvie.', hvacHere: 'fan coils, in-unit air handlers, building-managed access.' },
      { name: 'Greektown', description: 'Halsted south of Madison: restaurants with condos above.', hvacHere: 'restaurant make-up air below, condo heating and cooling above.' },
    ]),
  },

  buildings: {
    heading: 'What heats and cools your West Loop building',
    types: items('buildingType', [
      { tag: 'LOFT', name: 'Converted warehouse', text: 'Steam or hot-water radiators, or split systems added later. Exposed ceilings decide where ducts go.' },
      { tag: 'TOWER', name: 'High-rise condo', text: 'In-unit fan coils or air handlers on a building loop. Management approval and elevator booking first.' },
      { tag: 'MID-RISE', name: 'Condo or townhome', text: 'Forced-air furnaces with roof or balcony condensers, and newer heat pumps in recent builds.' },
      { tag: 'COMMERCIAL', name: 'Restaurant or office', text: 'Rooftop units, make-up air and exhaust. Scheduled around service and opening hours.' },
    ]),
  },

  permits: {
    areaCount: 62,
    areaCaption: 'West Loop permits in 24 months that even mention HVAC equipment.',
  },

  faq: {
    heading: 'West Loop HVAC, answered',
    items: items('faqItem', [
      { question: 'Do I need a new furnace, or can mine be repaired?', answer: 'Often it can be repaired. We diagnose first, and where the unit has years left, we say so. Replacement is quoted only when the repair stops making sense.' },
      { question: 'Do you work in West Loop high-rises?', answer: "Yes. Before a visit, high-rises usually want a certificate of insurance, a booked freight elevator and set working hours, so we book around your building's elevator and work hours. In towers that's often in-unit fan coils or air handlers on a building loop." },
      { question: 'Can you service the steam boiler in my loft?', answer: 'Yes. We service hot-water and steam boilers in vintage two-flats and converted lofts: pressure, circulators, zone valves and venting.' },
      { question: 'Does HVAC repair in Chicago need a permit?', answer: "No. Chicago doesn't require a permit to repair, diagnose or maintain heating and cooling. Permits cover installs and construction, so a company's permit count says little about its repair work." },
      { question: 'What are your hours?', answer: 'Monday to Friday, 6:00 AM to 6:00 PM, and Saturday, 6:00 AM to 3:30 PM. Call (773) 238-3838.' },
    ]),
  },

  cta: {
    heading: 'No heat, no cooling, or just a question?',
    text: "Have the make of your furnace, boiler or condenser to hand, and tell us what it's doing. In a high-rise, mention your building's work hours.",
  },

  seo: {
    title: 'HVAC Repair in the West Loop, Chicago | City & Suburban',
    description: 'Furnace, boiler, AC and make-up air repair for West Loop lofts, high-rises and restaurants. Family-owned since 1952. Call (773) 238-3838.',
  },

  confirmNotes: items('confirmNote', [
    { block: 'B1 Hero', note: 'Add the hero photo. Confirm it is City & Suburban\'s own or licensed; tick "Illustrative photo" if not.' },
    { block: 'B4 Reviews', note: 'Add 4 verbatim Google reviews from the review workbook (opening 60–70 words, cut at a sentence end). Rank by equipment match for West Loop jobs: furnace, boiler, high-rise AC, restaurant make-up air.' },
    { block: 'B9 Districts', note: 'Greektown "HVAC here" note is not in the design. Drafted from its description (restaurants with condos above). Check it.' },
    { block: 'B12 FAQ', note: 'Answers to questions 2–5 are not in the design. Drafted only from facts elsewhere on this page (building rules, boiler service, permit record, hours). Review before publishing.' },
    { block: 'B11 Permits', note: 'Confirm the 62 West Loop permits and the 24-month window against the City of Chicago permit data.' },
    { block: 'SEO', note: 'Meta title and description are new. Review them.' },
  ]),
}

// Sanity rejects a create when the _id already exists, so an existing draft is never overwritten.
const existing = await client.getDocument(doc._id)
if (existing) {
  console.log(`Draft already exists (${doc._id}). Nothing changed.`)
} else {
  const res = await client.create(doc)
  console.log(`Created draft: ${res._id} (${res.areaName})`)
}
