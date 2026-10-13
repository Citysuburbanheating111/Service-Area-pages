import type { SanityImageSource } from '@sanity/image-url'

// Shape returned by AREA_PAGE_QUERY. Every block is optional so a half-written draft still previews.
type Keyed<T> = T & { _key: string }
type Card = Keyed<{ title?: string; text?: string }>

export type AreaPageData = {
  _id: string
  areaName?: string
  areaNameInSentence?: string
  slug?: string
  hero?: {
    h1?: string
    lede?: string
    formTitle?: string
    buildingTypeOptions?: string[]
    defaultBuildingType?: string
    issueOptions?: string[]
    image?: (SanityImageSource & { alt?: string; illustrative?: boolean; asset?: unknown }) | null
  }
  services?: { heading?: string }
  owner?: { paragraph?: string }
  reviews?: {
    heading?: string
    intro?: string
    items?: Keyed<{ service?: string; quote?: string; reviewerName?: string; year?: number; googleUrl?: string }>[]
  }
  process?: { heading?: string; steps?: Card[] }
  price?: { heading?: string; intro?: string; medianValue?: string; medianCaption?: string; factors?: Card[] }
  choose?: { heading?: string; questions?: Card[] }
  districts?: {
    eyebrow?: string
    heading?: string
    zips?: string[]
    wards?: number[]
    communityArea?: string
    items?: Keyed<{ name?: string; description?: string; hvacHere?: string }>[]
  }
  buildings?: { heading?: string; types?: Keyed<{ tag?: string; name?: string; text?: string }>[] }
  permits?: { areaCount?: number; areaCaption?: string }
  faq?: { heading?: string; items?: Keyed<{ question?: string; answer?: string }>[] }
  cta?: { heading?: string; text?: string }
  seo?: { title?: string; description?: string }
  confirmNotes?: Keyed<{ block?: string; note?: string }>[]
}
