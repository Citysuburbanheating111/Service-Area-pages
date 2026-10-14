'use client'

// B4 review card: full verbatim text is in the HTML, clamped to 5 lines with a toggle.
import { stegaClean } from 'next-sanity'
import { useEffect, useId, useRef, useState } from 'react'

import { GLogo, Icon } from './Icon'

export type Review = { _key: string; service?: string; quote?: string; reviewerName?: string; year?: number; googleUrl?: string }

export function ReviewCard({ r }: { r: Review }) {
  const id = useId()
  const quote = useRef<HTMLQuoteElement>(null)
  const [open, setOpen] = useState(false)
  const [clamped, setClamped] = useState(true)

  useEffect(() => {
    const el = quote.current
    if (!el) return
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const name = r.reviewerName ?? ''
  return (
    <li className="v2-review">
      <header>
        <span className="av" aria-hidden="true">{stegaClean(name).slice(0, 1)}</span>
        <div><b>{name}</b><small>{r.year} · {r.service}</small></div>
        <GLogo />
      </header>
      <span className="cs-stars" aria-label="5 stars">★★★★★</span>
      <blockquote className={open ? undefined : 'clamp'} id={id} ref={quote}>{r.quote}</blockquote>
      {(clamped || open) && (
        <button className="v2-more" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
      <footer>
        <span>Posted on Google</span>
        {r.googleUrl && <a href={stegaClean(r.googleUrl)} target="_blank" rel="noopener noreferrer">View on Google<Icon name="arrow" size={14} strokeWidth={2} /></a>}
      </footer>
    </li>
  )
}
