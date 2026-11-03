/**
 * The "Service area pages" tab of the City Suburban writing sheet: areaPage documents in Sanity project fe0qsjo6.
 * Used by the Apps Script build and its test. No Node or Sanity imports: it is bundled into the sheet.
 */
import {buildAreaDoc} from '../area-doc.mjs'
import type {SheetOptions} from './sheet'

type Json = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- free-form Sanity documents

/** Lists: the longest list in the dataset on 03/11/2026 plus 2 spare. Map and permit data are one JSON cell. */
export const AREA_SHEET_OPTIONS: SheetOptions = {
  json: ['permits'],
  capacity: {
    'hero.buildingTypeOptions': 6, 'hero.issueOptions': 7, 'reviews.items': 6, 'price.factors': 8, 'choose.questions': 7,
    'districts.zips': 5, 'districts.wards': 7, 'districts.items': 6, 'buildings.types': 6, 'process.steps': 8,
    'nearby.items': 8, 'faq.items': 7, confirmNotes: 4,
  },
  defaultCapacity: 6,
}

/** Fields a page cannot be pushed without (required in the Studio). */
export const REQUIRED_FIELDS = ['areaName', 'areaNameInSentence', 'slug', 'hero.h1', 'hero.lede']

export const idForSlug = (slug: string) => `area-${slug}`
const slugOf = (doc: Json) => String(doc.slug?.current || '')
const valueAt = (doc: Json, path: string) => path.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Json)[k] : undefined), doc)

export function checkAreaRow(doc: Json, idCell: string): {errors: string[]; warnings: string[]} {
  const errors: string[] = []
  const warnings: string[] = []
  for (const field of REQUIRED_FIELDS) if (!valueAt(doc, field)) errors.push(`${field} is required`)
  const slug = slugOf(doc)
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`slug "${slug}" must be lowercase words joined by hyphens`)
  if (idCell && slug && idCell !== idForSlug(slug)) errors.push(`_id ${idCell} does not match the slug (expected ${idForSlug(slug)})`)
  for (const field of ['seo.title', 'seo.description']) if (!valueAt(doc, field)) warnings.push(`${field} is empty`)
  const confirm = JSON.stringify(doc).match(/\[CONFIRM[^\]]*\]/g) || []
  if (confirm.length) warnings.push(`${confirm.length} [CONFIRM] item(s) still to answer`)
  return {errors, warnings}
}

export const areaProject = {
  type: 'areaPage',
  prefix: 'serviceAreaPages',
  menu: 'Service area pages → Sanity',
  tokenKey: 'CITY_SUBURBAN_SERVICE_AREA_PAGES_SANITY_TOKEN',
  order: 'areaName asc',
  idOf: (doc: Json) => (slugOf(doc) ? idForSlug(slugOf(doc)) : ''),
  checkRow: checkAreaRow,
  ownerKey: (doc: Json) => (slugOf(doc) ? `slug ${slugOf(doc)}` : ''),
  urlOf: (doc: Json) => (slugOf(doc) ? `https://citysuburbanheating.com/service-area/${slugOf(doc)}/` : ''),
  /** The skill's content file, { "area": {...}, "extras": {...} }: built exactly as scripts/seed-area.mjs builds it. */
  build: (input: Json) => {
    if (!input.area || typeof input.area !== 'object') return undefined
    const built = buildAreaDoc({area: input.area, extras: input.extras || {}}) as {doc?: Json; errors: string[]}
    return {doc: built.doc ? {...built.doc, _type: 'areaPage'} : undefined, errors: built.errors, warnings: [], placeholders: JSON.stringify(input).match(/\[CONFIRM[^\]]*\]/g) || []}
  },
}
