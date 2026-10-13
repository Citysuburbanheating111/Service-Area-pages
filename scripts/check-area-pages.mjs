/**
 * Lists every service area page (drafts and published) with block item counts.
 *   node --env-file=.env.local scripts/check-area-pages.mjs
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const rows = await client.fetch(`*[_type == "areaPage"]{
  _id, areaName,
  "steps": count(process.steps), "factors": count(price.factors), "questions": count(choose.questions),
  "districts": count(districts.items), "buildings": count(buildings.types), "faqs": count(faq.items),
  "toConfirm": count(confirmNotes)
}`)
console.table(rows)
