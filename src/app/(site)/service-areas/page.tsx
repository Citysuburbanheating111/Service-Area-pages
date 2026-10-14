import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { Icon } from '@/components/area/Icon'
import { LiveFooter, LiveHeader } from '@/components/area/LiveChrome'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY } from '@/sanity/queries'

export const metadata: Metadata = { title: 'Service areas · City & Suburban Heating & Cooling' }

type Row = { _id: string; areaName?: string; slug?: string; h1?: string }

export default function ServiceAreasPage() {
  return (
    <>
      <LiveHeader />
      <div className="cs v2">
        <main className="cs-sec v2-stack">
          <div className="v2-head">
            <p className="cs-eyebrow">Service areas</p>
            <h1 className="cs-h2">Chicago neighbourhoods we serve</h1>
          </div>
          <Suspense fallback={null}>
            <AreaList />
          </Suspense>
        </main>
      </div>
      <LiveFooter />
    </>
  )
}

async function AreaList() {
  const { perspective, variant, stega } = await getDynamicFetchOptions()
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, perspective, variant, stega })
  const rows = (data ?? []) as Row[]
  if (!rows.length) return <p className="v2-lede">No published area pages yet. Drafts appear here in the Sanity preview.</p>
  return (
    <ul className="v2-cos">
      {rows.map((r) => {
        const slug = stegaClean(r.slug) ?? ''
        return (
          <li key={r._id} className="v2-co">
            <span className="badge"><Icon name="pin" size={20} /></span>
            <h3><a href={`/service-areas/${slug}`}>{r.areaName}</a></h3>
            <p>{r.h1}</p>
            <a className="v2-link" href={`/service-areas/${slug}`}>Open the page<Icon name="arrow" size={16} strokeWidth={2} /></a>
          </li>
        )
      })}
    </ul>
  )
}
