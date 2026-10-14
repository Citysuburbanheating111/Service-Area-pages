import { cookies, draftMode } from 'next/headers'
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
  type LivePerspective,
  type StrictDefinedFetchType,
} from 'next-sanity/live'

import { client } from './lib/client'

// Viewer token: lets draft mode read unpublished drafts. Server-only, never sent to the page HTML
// unless draft mode is on (then the Live API needs it in the browser to stream draft changes).
const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN in .env.local (Viewer token from sanity.io/manage → API → Tokens)')
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  browserToken: token,
  serverToken: token,
  strict: true,
})

// The app's one shared 'use cache' boundary.
export const cachedSanity: StrictDefinedFetchType = async (options) => {
  'use cache'
  return sanityFetch(options)
}

export interface DynamicFetchOptions {
  perspective: LivePerspective
  variant?: string
  stega: boolean
}

// Published content for visitors; drafts + click-to-edit markers inside the Presentation tool.
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  // Local-only: start the server with CS_LOCAL_DRAFTS=1 to see drafts without the Studio.
  // Never active on Vercel.
  if (process.env.CS_LOCAL_DRAFTS === '1' && !process.env.VERCEL) {
    return { perspective: 'drafts', stega: false }
  }

  const { isEnabled: isDraftMode } = await draftMode()
  if (!isDraftMode) {
    return { perspective: 'published', stega: false }
  }

  const jar = await cookies()
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar })
  const variant = await resolveVariantFromCookies({ cookies: jar })
  return { perspective: perspective ?? 'drafts', variant, stega: true }
}
