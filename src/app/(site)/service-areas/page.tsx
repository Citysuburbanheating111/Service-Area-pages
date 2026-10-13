import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Footer, Header, UtilityBar } from '@/components/area/SiteChrome'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_LIST_QUERY } from '@/sanity/queries'

export const metadata: Metadata = { title: 'Service areas · City & Suburban Heating & Cooling' }

type Row = { _id: string; areaName?: string; slug?: string; h1?: string }

export default function ServiceAreasPage() {
  return (
    <div className="cs">
      <UtilityBar />
      <Header />
      <main className="cs-sec cs-stack">
        <div className="cs-head">
          <p className="cs-eyebrow">Service areas</p>
          <h1 className="cs-h2">Chicago neighbourhoods we serve</h1>
        </div>
        <Suspense fallback={null}>
          <AreaList />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

async function AreaList() {
  const { perspective, variant, stega } = await getDynamicFetchOptions()
  const { data } = await cachedSanity({ query: AREA_LIST_QUERY, perspective, variant, stega })
  const rows = (data ?? []) as Row[]
  if (!rows.length) {
    return <p>No published area pages yet. Drafts appear here in the Sanity preview.</p>
  }
  return (
    <ul className="cs-cards" style={{ gridAutoFlow: 'row', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {rows.map((r) => (
        <li key={r._id} className="cs-bt">
          <a href={`/service-areas/${r.slug}`}>
            <span className="tag">Service area</span>
            <h3>{r.areaName}</h3>
            <p>{r.h1}</p>
          </a>
        </li>
      ))}
    </ul>
  )
}
