'use client'

/**
 * Sanity Studio, embedded in the Next.js app at /studio
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

import { areaPath } from './src/lib/siteUrl'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { TEMPLATE_ID } from './src/sanity/schemaTypes/areaTemplate'

export default defineConfig({
  name: 'city-suburban',
  title: 'City & Suburban',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    ...schema,
    // The template is a single document: it can't be created again from "+ Create"
    templates: (templates) => templates.filter((t) => t.schemaType !== 'areaTemplate'),
  },
  document: {
    // ...or duplicated or deleted
    actions: (actions, { schemaType }) =>
      schemaType === 'areaTemplate' ? actions.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? '')) : actions,
  },
  plugins: [
    structureTool({
      // The shared template first, then the area pages
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Service area template')
              .id(TEMPLATE_ID)
              .child(S.document().schemaType('areaTemplate').documentId(TEMPLATE_ID).title('Service area template')),
            S.divider(),
            S.documentTypeListItem('areaPage').title('Service area pages'),
          ]),
    }),
    // Live preview: the page next to its fields, drafts included, click any text to edit it
    presentationTool({
      title: 'Preview',
      previewUrl: {
        initial: '/service-areas/',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      resolve: {
        // Opening a page in Preview selects its document
        mainDocuments: defineDocuments([
          // Public URL /service-area/near-<slug>-<main ZIP>/ (src/lib/siteUrl.ts)
          { route: '/service-area/:segment/', filter: `_type == "areaPage" && "near-" + slug.current + "-" + districts.zips[0] == $segment` },
          { route: '/service-area/:segment', filter: `_type == "areaPage" && "near-" + slug.current + "-" + districts.zips[0] == $segment` },
        ]),
        // "Used on" links shown at the top of each document
        locations: {
          // The template shows on every area page
          areaTemplate: defineLocations({
            message: 'Shared by every service area page',
            locations: [{ title: 'All service areas', href: '/service-areas/' }],
          }),
          areaPage: defineLocations({
            select: { title: 'areaName', slug: 'slug.current', zip: 'districts.zips.0' },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    { title: doc.title || 'Untitled', href: areaPath(doc.slug, doc.zip) },
                    { title: 'All service areas', href: '/service-areas/' },
                  ]
                : [],
            }),
          }),
        },
      },
    }),
    // GROQ query playground inside the Studio
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
