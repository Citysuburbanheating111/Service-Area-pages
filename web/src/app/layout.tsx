import type { Metadata } from 'next'
import { Noto_Sans, Ubuntu } from 'next/font/google'

import { siteUrl } from '@/lib/siteUrl'

import './globals.css'

// City & Suburban type: Ubuntu for display, Noto Sans for body (playbook Part B).
// Variable names match the shared design CSS (live-chrome.css reads --font-ubuntu / --font-noto-sans).
const display = Ubuntu({ variable: '--font-ubuntu', subsets: ['latin'], weight: ['500', '700'] })
const body = Noto_Sans({ variable: '--font-noto-sans', subsets: ['latin'], weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'City & Suburban Heating & Cooling', template: '%s' },
  description: 'Family-owned Chicago heating and cooling since 1952.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
