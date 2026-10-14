/**
 * Finds placeholder text and empty sections in every service area page (drafts and published).
 *   node --env-file=.env.local scripts/check-placeholders.mjs
 * Read-only. The token is never printed.
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-10-01',
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const PLACEHOLDER = /\[CONFIRM|to confirm|lorem|reviewer name|TODO|TBD|\{\{|xxx/i
const docs = await client.fetch(`*[_type == "areaPage"] | order(_id)`)
let problems = 0

for (const d of docs) {
  const found = []
  // every string anywhere in the document, except the editor-only confirm notes
  const walk = (v, path) => {
    if (typeof v === 'string') { if (PLACEHOLDER.test(v)) found.push(`${path}: "${v.slice(0, 70)}"`) }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!k.startsWith('_') && k !== 'confirmNotes') walk(x, path ? `${path}.${k}` : k)
  }
  walk(d, '')
  const empty = []
  if (!d.reviews?.items?.length) empty.push('reviews')
  if ((d.faq?.items ?? []).some((f) => !f.answer)) empty.push('faq answer')
  if ((d.districts?.items ?? []).some((x) => !x.hvacHere)) empty.push('district HVAC note')
  if (!d.hero?.buildingTypeOptions?.length) empty.push('building options')
  for (const k of ['h1', 'lede', 'formTitle']) if (!d.hero?.[k]) empty.push(`hero.${k}`)
  if (!d.seo?.title) empty.push('seo.title')
  const n = found.length + empty.length
  problems += n
  console.log(`${n ? 'FAIL' : ' ok '}  ${d._id}${d._id.startsWith('drafts.') ? '' : ' (published)'}`)
  for (const f of found) console.log('      placeholder', f)
  for (const e of empty) console.log('      empty', e)
}
process.exit(problems ? 1 : 0)
