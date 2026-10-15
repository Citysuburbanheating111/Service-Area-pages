/**
 * Called by a Sanity webhook on every publish (sanity.io/manage → API → Webhooks), so published
 * changes reach the cached pages even when nobody has a page open. The webhook signs its requests
 * with SANITY_REVALIDATE_SECRET; anything else is refused.
 */
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

import { CONTENT_TAG } from '@/sanity/live'

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 })

  // Waits for Content Lake consistency, so the refreshed pages read the new content
  const { isValidSignature, body } = await parseBody<{ _type?: string; _id?: string }>(req, secret, true)
  if (!isValidSignature) return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })

  // expire: 0 so the next visitor gets the new content, not one more stale copy
  revalidateTag(CONTENT_TAG, { expire: 0 })
  return NextResponse.json({ revalidated: CONTENT_TAG, document: body?._id ?? null })
}
