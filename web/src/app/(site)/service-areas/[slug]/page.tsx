import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { stegaClean } from 'next-sanity'
import { Suspense } from 'react'

import { AreaPageV2 } from '@/components/area/AreaPageV2'
import { resolveTemplate } from '@/components/area/template'
import { cachedSanity, getDynamicFetchOptions } from '@/sanity/live'
import { AREA_PAGE_QUERY, AREA_TEMPLATE_QUERY } from '@/sanity/queries'
import type { AreaPageData, AreaTemplateData } from '@/sanity/types'

type Props = PageProps<'/service-areas/[slug]'>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const { data } = await cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, perspective: 'published', stega: false })
  const page = data as AreaPageData | null
  if (!page) return {}
  return {
    title: page.seo?.title || page.hero?.h1,
    description: page.seo?.description || page.hero?.lede,
    alternates: { canonical: `/service-areas/${slug}` },
  }
}

export default function AreaPage(props: Props) {
  return (
    <Suspense fallback={<div className="cs" style={{ minHeight: '100vh' }} />}>
      <AreaRoute params={props.params} />
    </Suspense>
  )
}

async function AreaRoute({ params }: Pick<Props, 'params'>) {
  const { slug } = await params
  const { perspective, variant, stega } = await getDynamicFetchOptions()
  const [{ data }, { data: tpl }] = await Promise.all([
    cachedSanity({ query: AREA_PAGE_QUERY, params: { slug }, perspective, variant, stega }),
    // The shared Service area template (one document for every area page)
    cachedSanity({ query: AREA_TEMPLATE_QUERY, perspective, variant, stega }),
  ])
  const page = data as AreaPageData | null
  if (!page || !stegaClean(page.slug)) notFound()

  // Drafts are only visible in preview (draft mode); published visitors never see placeholders.
  return <AreaPageV2 page={page} template={resolveTemplate(tpl as AreaTemplateData | null)} preview={perspective !== 'published'} />
}
