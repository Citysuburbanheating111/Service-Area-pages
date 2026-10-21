import { defineQuery } from 'next-sanity'

export const AREA_PAGE_QUERY = defineQuery(`
  *[_type == "areaPage" && slug.current == $slug][0]{
    _id,
    areaName,
    areaNameInSentence,
    "slug": slug.current,
    locality,
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
    permits{ areaCount, areaCaption, totalPermits, windowFrom, windowTo, authority, byEquipment[]{ _key, label, count } },
    nearby{ items[]{ _key, name, text } },
    faq{ heading, items[]{ _key, question, answer } },
    cta{ heading, text },
    seo{ title, description },
    confirmNotes[]{ _key, block, note }
  }
`)

export const AREA_LIST_QUERY = defineQuery(`
  *[_type == "areaPage" && defined(slug.current)] | order(areaName asc){
    _id, areaName, "slug": slug.current, "h1": hero.h1, "districts": districts.items[].name,
    // For the collection card of an area that has no designed card
    locality, "lede": hero.lede, "communityArea": districts.communityArea, "hvac": districts.items[0].hvacHere
  }
`)

// The one shared template (id "areaTemplate"): business facts and every shared section
export const AREA_TEMPLATE_QUERY = defineQuery(`
  *[_id == "areaTemplate"][0]{
    business,
    hero{ badges, stripTitle, image{ asset, hotspot, crop } },
    form,
    services,
    price,
    choose{ eyebrow, lede, questions[]{ _key, title, text, verify, answer } },
    companies{ eyebrow, heading, fitNote, items[]{ _key, title, text, us, talkTo, priceSet, fitsWhen } },
    about{ eyebrow, heading, lead, ownerTile, foundedTile, permitTile, hoursTile, familyHeading, familyPoints, promises[]{ _key, title, text } },
    reviews{ eyebrow, heading, intro, statsHeading, statsIntro, statsNote, stats[]{ _key, value, label, percent } },
    trust{ yelpRating, yelpUrl, googleReviewUrl, writeReviewText, writeReviewLink, band[]{ _key, label, icon }, partnerText, partnerName, partnerLogo{ asset }, facebookUrl, instagramUrl },
    process{ heading, steps[]{ _key, title, text } },
    permits,
    nearby,
    faq{ items[]{ _key, question, answer } },
    cta
  }
`)
