'use client'

/**
 * Sanity Studio, embedded in the Next.js app at /studio
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
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
    // GROQ query playground inside the Studio
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
