'use client'

// B10 "Start here": building cards act as tabs; every detail panel is in the HTML.
import { useRef, useState, type KeyboardEvent } from 'react'

import { buildingArt } from './design'
import { Icon } from './Icon'

export type Building = { _key: string; tag?: string; name?: string; text?: string }

export function BuildingPicker({ types }: { types: Building[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(e: KeyboardEvent, i: number) {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -i, End: types.length - 1 - i }
    const d = map[e.key]
    if (d === undefined) return
    e.preventDefault()
    const next = (i + d + types.length) % types.length
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <ul className="v2-picks" role="tablist" aria-label="Building types">
        {types.map((t, i) => (
          <li key={t._key}>
            <button
              ref={(el) => { refs.current[i] = el }}
              className="v2-pick"
              type="button"
              role="tab"
              id={`bt-${i + 1}`}
              aria-controls={`btp-${i + 1}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="art">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" dangerouslySetInnerHTML={{ __html: buildingArt(t.tag, t.name) }} />
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tick"><Icon name="check" size={14} strokeWidth={2.6} /></span>
              </span>
              <span className="body">
                <span className="tag">{t.tag}</span>
                <span className="t">{t.name}</span>
                <span className="more">What heats and cools it<Icon name="chev" size={16} strokeWidth={2.2} /></span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {types.map((t, i) => (
        <div key={t._key} className="v2-pick-panel" role="tabpanel" id={`btp-${i + 1}`} aria-labelledby={`bt-${i + 1}`} hidden={i !== active}>
          <div className="cell">
            <span className="badge"><Icon name="home" size={20} /></span>
            <div><p className="k">What heats and cools a {(t.name ?? '').toLowerCase()}</p><p className="v">{t.text}</p></div>
          </div>
          <div className="cell">
            <span className="badge red"><Icon name="phone2" size={18} strokeWidth={2} /></span>
            <div><p className="k">First step</p><p className="v">Tell us the make of the furnace or condenser and what it&apos;s doing.</p></div>
          </div>
          <a className="v2-link" href="#price-title">What changes the price<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
      ))}
    </div>
  )
}
