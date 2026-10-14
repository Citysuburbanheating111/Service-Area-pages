import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Suspense } from 'react'

import { SanityLive } from '@/sanity/live'

// The shared design (synced from the design-system site), then the Next-only additions
import './design/live-chrome.css'
import './design/area-page.css'
import './design/area-page-v2.css'
import './next-only.css'

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <LiveTools />
      </Suspense>
    </>
  )
}

// Live updates for everyone; drafts + click-to-edit overlays only inside the Presentation tool.
async function LiveTools() {
  const { isEnabled: isDraftMode } = await draftMode()
  return (
    <>
      <SanityLive includeDrafts={isDraftMode} />
      {isDraftMode && <VisualEditing />}
    </>
  )
}
