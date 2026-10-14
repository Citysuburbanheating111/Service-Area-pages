/**
 * Prints the fields an area's content file keeps in "extras" (FAQ answers 2–5, district HVAC notes,
 * building type options, SEO, confirm notes), read from the Sanity draft (or published) document.
 *
 *   node --env-file=.env.local scripts/pull-area-extras.mjs west-loop
 *
 * Read-only. The token is never printed.
 */
import { createClient } from '@sanity/client'

const slug = process.argv[2]
if (!slug) throw new Error('Usage: pull-area-extras.mjs <slug>')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'drafts', // draft if there is one, otherwise published
})

const doc = await client.fetch(
  `*[_type == "areaPage" && slug.current == $slug][0]{
    _id, _updatedAt,
    "faq": faq.items[]{question, answer},
    "districts": districts.items[]{name, hvacHere},
    "buildingTypeOptions": hero.buildingTypeOptions,
    "defaultBuildingType": hero.defaultBuildingType,
    seo,
    "confirmNotes": confirmNotes[]{block, note}
  }`,
  { slug },
)
console.log(JSON.stringify(doc, null, 2))
