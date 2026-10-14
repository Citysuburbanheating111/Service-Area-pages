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

// Shape returned by AREA_TEMPLATE_QUERY (the shared Service area template)
export type AreaTemplateData = {
  business?: {
    companyName?: string
    ownerName?: string
    phone?: string
    email?: string
    addressShort?: string
    addressFull?: string
    mapsUrl?: string
    hours?: string
    foundedYear?: number
    experience?: string
    licensing?: string
    rating?: number
    reviewCount?: number
    ratingAsOf?: string
    reviewerNames?: string[]
  }
  hero?: { badges?: string[]; stripTitle?: string; image?: (SanityImageSource & { asset?: unknown }) | null }
  form?: { promise?: string; issueOptions?: string[]; submitLabel?: string; reassurance?: string }
  services?: { pill?: string; intro?: string }
  price?: { eyebrow?: string; intro?: string; medianValue?: string; medianCaption?: string }
  choose?: { eyebrow?: string; lede?: string; questions?: Card[] }
  companies?: { eyebrow?: string; heading?: string; items?: Keyed<{ title?: string; text?: string; us?: boolean }>[] }
  about?: {
    eyebrow?: string
    heading?: string
    lead?: string
    ownerTile?: string
    foundedTile?: string
    permitTile?: string
    hoursTile?: string
    promises?: Card[]
  }
  reviews?: { eyebrow?: string; heading?: string; intro?: string }
  process?: { heading?: string; steps?: Card[] }
  permits?: {
    eyebrow?: string
    heading?: string
    text?: string
    citywideNumber?: string
    citywideCaption?: string
    ourNumber?: string
    ourCaption?: string
  }
  faq?: { items?: Keyed<{ question?: string; answer?: string }>[] }
  cta?: { eyebrow?: string; heading?: string }
}
