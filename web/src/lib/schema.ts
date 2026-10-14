/**
 * Structured data (JSON-LD, schema.org) for the service area pages. Business facts come from the
 * Service area template (the same as citysuburbanheating.com), so there is one source of truth.
 */
import { stegaClean } from 'next-sanity'

import { design } from '@/components/area/design'
import { mergeFaq, type Template } from '@/components/area/template'
import type { AreaPageData } from '@/sanity/types'

import { absolute, areaPath, collectionPath } from './siteUrl'

const clean = (s?: string) => stegaClean(s ?? '') ?? ''
const MAIN_SITE = `${design.live}/`
const BUSINESS_ID = `${MAIN_SITE}#business`

function business(t: Template) {
  const b = t.business
  // "1225 North Cleaver Street, Chicago, Illinois 60642"
  const [street, city, regionZip = ''] = clean(b.addressFull).split(',').map((s) => s.trim())
  const zip = regionZip.match(/\d{5}/)?.[0]
  return {
    '@type': 'HVACBusiness',
    '@id': BUSINESS_ID,
    name: clean(b.companyName),
    url: MAIN_SITE,
    telephone: `+1-${clean(b.phone).replace(/\D/g, '').slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`,
    email: clean(b.email),
    image: absolute(design.images.logo),
    logo: absolute(design.images.logo),
    foundingDate: String(b.foundedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: city,
      addressRegion: regionZip.includes('Illinois') ? 'IL' : regionZip.replace(/\s*\d{5}/, ''),
      ...(zip ? { postalCode: zip } : {}),
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 41.9043, longitude: -87.6637 },
    // The live site says "Working Hours: 24/7"
    ...(clean(b.hours) === '24/7'
      ? { openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }] }
      : {}),
    hasMap: clean(b.mapsUrl),
  }
}

function breadcrumb(id: string, items: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${id}#breadcrumb`,
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
  }
}

/** JSON-LD for one area page */
export function areaPageSchema(page: AreaPageData, t: Template, meta: { title: string; description: string }) {
  const slug = clean(page.slug)
  const url = absolute(areaPath(slug))
  const area = clean(page.areaName)
  const faq = mergeFaq(page.faq?.items, t).items
  return {
    '@context': 'https://schema.org',
    '@graph': [
      business(t),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: clean(page.hero?.h1),
        serviceType: 'Heating and cooling repair',
        description: clean(page.hero?.lede),
        provider: { '@id': BUSINESS_ID },
        areaServed: { '@type': 'Place', name: `${area}, Chicago, IL` },
        url,
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en-US',
        about: { '@id': `${url}#service` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      breadcrumb(url, [['Home', MAIN_SITE], ['Service areas', absolute(collectionPath)], [area, url]]),
      ...(faq.length
        ? [{
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            mainEntity: faq.map((f) => ({ '@type': 'Question', name: clean(f.question), acceptedAnswer: { '@type': 'Answer', text: clean(f.answer) } })),
          }]
        : []),
    ],
  }
}

/** JSON-LD for the collection page: the published area pages as a list */
export function collectionSchema(t: Template, areas: { slug: string; name: string }[], meta: { title: string; description: string }) {
  const url = absolute(collectionPath)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      business(t),
      {
        '@type': 'CollectionPage',
        '@id': url,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en-US',
        about: { '@id': BUSINESS_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: areas.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: absolute(areaPath(a.slug)) })),
        },
      },
      breadcrumb(url, [['Home', MAIN_SITE], ['Service areas', url]]),
    ],
  }
}

/** <script type="application/ld+json"> body: "<" escaped so text can never close the tag */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
