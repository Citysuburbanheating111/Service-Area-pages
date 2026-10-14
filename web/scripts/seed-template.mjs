/**
 * Creates the Service area template in Sanity (document id "areaTemplate", published) from
 * src/lib/template-defaults.json. Run once; after that, edit the template in the Studio.
 *
 *   node --env-file=.env.local scripts/seed-template.mjs
 *
 * Never overwrites an existing template.
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
delete t._note
const keyed = (type, list) => list.map((item, i) => ({ _key: `${type}${i + 1}`, _type: type, ...item }))

const doc = {
  ...t,
  _id: 'areaTemplate',
  _type: 'areaTemplate',
  choose: { ...t.choose, questions: keyed('question', t.choose.questions) },
  companies: { ...t.companies, items: keyed('company', t.companies.items) },
  about: { ...t.about, promises: keyed('promise', t.about.promises) },
  process: { ...t.process, steps: keyed('step', t.process.steps) },
  faq: { items: keyed('faqItem', t.faq.items) },
}

const existing = await client.fetch('*[_id in ["areaTemplate", "drafts.areaTemplate"]]._id')
if (existing.length) {
  console.log(`Template already in Sanity (${existing.join(', ')}). Nothing changed; edit it in the Studio.`)
} else {
  const res = await client.create(doc)
  console.log(`Created and published: ${res._id}`)
}
