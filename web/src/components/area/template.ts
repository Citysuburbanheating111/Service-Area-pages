/**
 * The Service area template (one Sanity document shared by every area page), merged over the
 * starting content in template-defaults.json so a page still renders if a field is left empty.
 */
import { stegaClean } from 'next-sanity'

import defaults from '@/lib/template-defaults.json'
import type { AreaTemplateData } from '@/sanity/types'

type D = typeof defaults
type Keyed<T> = T & { _key: string }
type Card = Keyed<{ title: string; text: string }>

export type Template = {
  business: D['business']
  hero: D['hero'] & { image?: NonNullable<AreaTemplateData['hero']>['image'] }
  form: D['form']
  services: D['services']
  price: D['price']
  choose: Omit<D['choose'], 'questions'> & { questions: Card[] }
  companies: Omit<D['companies'], 'items'> & { items: Keyed<{ title: string; text: string; us: boolean }>[] }
  about: Omit<D['about'], 'promises'> & { promises: Card[] }
  reviews: D['reviews']
  process: Omit<D['process'], 'steps'> & { steps: Card[] }
  permits: D['permits']
  faq: { items: Keyed<{ question: string; answer: string }>[] }
  cta: D['cta']
}

const filled = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)

// Sanity values win where they are filled in; arrays get stable keys either way
function merge<T extends Record<string, unknown>>(base: T, over: Record<string, unknown> | undefined | null): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(base)) {
    const o = over?.[k]
    const pick = filled(o) ? o : v
    out[k] = Array.isArray(pick)
      ? pick.map((x, i) => (x && typeof x === 'object' ? { _key: String(i), ...(x as object) } : x))
      : pick && typeof pick === 'object' && !Array.isArray(pick) && v && typeof v === 'object'
        ? merge(v as Record<string, unknown>, filled(o) ? (o as Record<string, unknown>) : undefined)
        : pick
  }
  return out as T
}

export function resolveTemplate(t: AreaTemplateData | null | undefined): Template {
  const { _note, ...base } = defaults
  void _note
  const merged = merge(base as Record<string, unknown>, t as Record<string, unknown>) as unknown as Template
  merged.hero.image = t?.hero?.image ?? undefined
  return merged
}

/** {area} in template text becomes the area's name */
export const fill = (text: string | undefined, area: string | undefined) => (text ?? '').replace(/\{area\}/g, area ?? '')

/** tel: link for a phone number as written, e.g. (773) 238-3838 -> tel:+17732383838 */
export const telHref = (phone: string) => `tel:+1${(stegaClean(phone) ?? '').replace(/\D/g, '').slice(-10)}`

/** FAQ shown on an area page: the area's own questions, then the template's shared ones. Older pages
 *  still store the shared questions themselves; the template's version wins, so nothing repeats. */
export function mergeFaq(own: { _key: string; question?: string; answer?: string }[] | undefined, t: Template) {
  const norm = (q?: string) => (stegaClean(q) ?? '').trim().toLowerCase()
  const shared = new Set(t.faq.items.map((f) => norm(f.question)))
  const mine = (own ?? []).filter((f) => !shared.has(norm(f.question)))
  return { own: mine, items: [...mine, ...t.faq.items] }
}
