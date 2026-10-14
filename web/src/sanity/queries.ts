import { defineQuery } from 'next-sanity'

export const AREA_PAGE_QUERY = defineQuery(`
  *[_type == "areaPage" && slug.current == $slug][0]{
    _id,
    areaName,
    areaNameInSentence,
    "slug": slug.current,
    hero{
      h1, lede, formTitle, buildingTypeOptions, defaultBuildingType, issueOptions,
      image{ asset, hotspot, crop, alt, illustrative }
    },
    services{ heading },
    owner{ paragraph },
    reviews{ heading, intro, items[]{ _key, service, quote, reviewerName, year, googleUrl } },
    process{ heading, steps[]{ _key, title, text } },
    price{ heading, intro, medianValue, medianCaption, factors[]{ _key, title, text } },
    choose{ heading, questions[]{ _key, title, text } },
    districts{ eyebrow, heading, zips, wards, communityArea, items[]{ _key, name, description, hvacHere } },
    buildings{ heading, types[]{ _key, tag, name, text } },
    permits{ areaCount, areaCaption },
    faq{ heading, items[]{ _key, question, answer } },
    cta{ heading, text },
    seo{ title, description },
    confirmNotes[]{ _key, block, note }
  }
`)

export const AREA_LIST_QUERY = defineQuery(`
  *[_type == "areaPage" && defined(slug.current)] | order(areaName asc){
    _id, areaName, "slug": slug.current, "h1": hero.h1
  }
`)
