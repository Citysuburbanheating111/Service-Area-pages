import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Published content by default. In draft mode, `sanityFetch` switches perspective and turns on
// stega so the Presentation tool can map every string back to its field.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: { studioUrl: '/studio' },
})
