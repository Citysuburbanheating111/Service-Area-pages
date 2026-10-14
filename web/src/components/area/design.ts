/**
 * Shared design data for the v2 area page template, synced from the design-system site by
 * tools/sync_design_to_web.py (services, steps, questions, icons, photo credits...).
 * Never edit design-data.json by hand: change the Python builders and re-run the sync.
 */
import data from '@/lib/design-data.json'

export type ServiceItem = { icon: string; title: string; text: string; url: string }
export type ServiceGroup = { key: string; name: string; title: string; lede: string; url: string; items: ServiceItem[] }
export type Credit = { caption: string; author: string; licence: string; url: string }

export const design = data as unknown as {
  phone: string
  tel: string
  live: string
  gmaps: string
  shop: string
  images: { hero: string; van: string; seal: string; acService: string; furnaceFilter: string; logo: string; favicon: string }
  groups: ServiceGroup[]
  stepIcons: string[]
  steps: { title: string; text: string }[]
  questions: { title: string; text: string }[]
  companies: { title: string; text: string; us: boolean }[]
  names: string[]
  icons: Record<string, string>
  factorIcons: string[]
  questionIcons: string[]
  companyIcons: string[]
  buildings: Record<string, string>
  buildingKeys: [string, string][]
  gLogo: string
  credits: Record<string, Credit>
  cross: Record<string, string>
  areaPhotos: string[]
}

/** Illustration for a building card, picked by keywords in its tag and title. */
export function buildingArt(tag = '', title = ''): string {
  const t = `${tag} ${title}`.toLowerCase()
  for (const [keys, art] of design.buildingKeys) {
    if (keys.split(' ').some((k) => t.includes(k))) return design.buildings[art]
  }
  return ''
}
