/**
 * "Exit preview" link: turns draft mode off and returns to the page.
 */
import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  const to = request.nextUrl.searchParams.get('redirect') || '/'
  // Only allow same-site paths
  const safe = to.startsWith('/') && !to.startsWith('//') ? to : '/'
  return NextResponse.redirect(new URL(safe, request.url))
}
