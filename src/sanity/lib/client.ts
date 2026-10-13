import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Public, read-only client for published content. No token, safe in the browser.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
