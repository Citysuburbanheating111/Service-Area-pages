'use client'

/**
 * Sanity Studio, embedded in the Next.js app at /studio
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'city-suburban',
  title: 'City & Suburban',
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(),
    // Live preview: the page next to its fields, drafts included, click any text to edit it
    presentationTool({
      title: 'Preview',
      previewUrl: {
        initial: '/service-areas',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      resolve: {
        // Opening a page in Preview selects its document
        mainDocuments: defineDocuments([
          { route: '/service-areas/:slug', filter: `_type == "areaPage" && slug.current == $slug` },
        ]),
        // "Used on" links shown at the top of each document
        locations: {
          areaPage: defineLocations({
            select: { title: 'areaName', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    { title: doc.title || 'Untitled', href: `/service-areas/${doc.slug}` },
                    { title: 'All service areas', href: '/service-areas' },
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
