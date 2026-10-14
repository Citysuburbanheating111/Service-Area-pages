'use client'

// B5 process track: counter, dots, arrows and the highlighted card follow the current step.
// Same rules as assets/area-page-v2.js: the last cards share the final stretch of scroll, so
// scrolling to the end is always the last step and every step is reachable.
import { useCallback, useEffect, useRef, useState } from 'react'

import { design } from './design'
import { Icon } from './Icon'

export type Step = { _key: string; title?: string; text?: string }
// Ignore the scroll events a programmatic scroll causes for a moment (kept outside render)
const lockFor = (ref: { current: number }, ms: number) => { ref.current = Date.now() + ms }
const locked = (ref: { current: number }) => Date.now() < ref.current

const OWNERS = ['You', 'You', 'City & Suburban', 'City & Suburban', 'City & Suburban', 'City & Suburban']

export function StepsTrack({ steps }: { steps: Step[] }) {
  const track = useRef<HTMLOListElement>(null)
  const lock = useRef(0)
  const [current, setCurrent] = useState(0)
  const last = steps.length - 1

  const positions = useCallback((): number[] => {
    const el = track.current
    if (!el) return []
    const cards = Array.from(el.children) as HTMLElement[]
    const max = el.scrollWidth - el.clientWidth
    if (max < 1) return cards.map(() => 0)
    const base = cards[0].offsetLeft
    const p = cards.map((c) => c.offsetLeft - base)
    let j = 1
    while (j <= last && p[j] < max) j++
    if (j > last) return p
    const from = p[j - 1]
    for (let k = j; k <= last; k++) p[k] = from + ((max - from) * (k - j + 1)) / (last - j + 1)
    return p
  }, [last])

  function go(i: number) {
    const n = Math.max(0, Math.min(last, i))
    setCurrent(n)
    lockFor(lock, 900)
    track.current?.scrollTo({ left: positions()[n] })
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
    const paint = () => {
      if (locked(lock)) return
      const left = el.scrollLeft
      const p = positions()
      let best = 0
      p.forEach((v, n) => { if (Math.abs(v - left) < Math.abs(p[best] - left)) best = n })
      setCurrent(best)
    }
    const end = () => { lock.current = 0; paint() }
    el.addEventListener('scroll', paint, { passive: true })
    el.addEventListener('scrollend', end)
    window.addEventListener('resize', paint)
    return () => { el.removeEventListener('scroll', paint); el.removeEventListener('scrollend', end); window.removeEventListener('resize', paint) }
  }, [positions])

  return (
    <div className="v2-steps-wrap">
      <div className="v2-steps-bar">
        <p className="count"><b>{String(current + 1).padStart(2, '0')}</b> / {String(steps.length).padStart(2, '0')}</p>
        <div className="dots">
          {steps.map((s, i) => (
            <button key={s._key} type="button" className="dot" aria-label={`Step ${i + 1}`} aria-current={i === current ? 'step' : undefined} onClick={() => go(i)}>{i + 1}</button>
          ))}
        </div>
        <div className="cs-arrows">
          <button className="cs-arrow" type="button" aria-label="Previous step" disabled={current === 0} onClick={() => go(current - 1)}><Icon name="left" size={20} strokeWidth={2.2} /></button>
          <button className="cs-arrow" type="button" aria-label="Next step" disabled={current === last} onClick={() => go(current + 1)}><Icon name="right" size={20} strokeWidth={2.2} /></button>
        </div>
      </div>
      <ol
        className="v2-steps"
        ref={track}
        tabIndex={0}
        aria-label="Steps: use the arrows or scroll sideways"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1) }
        }}
      >
        {steps.map((s, i) => {
          const owner = OWNERS[i] ?? 'City & Suburban'
          const us = owner !== 'You'
          return (
            <li key={s._key} className={`v2-step${i === current ? ' is-active' : ''}`}>
              <header>
                <span className="big">{String(i + 1).padStart(2, '0')}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.stepIcons[i % design.stepIcons.length]} alt="" height={52} />
              </header>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <footer><span className={`who${us ? ' us' : ''}`}><Icon name={us ? 'tool' : 'user'} size={14} strokeWidth={2} />{owner}</span></footer>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
