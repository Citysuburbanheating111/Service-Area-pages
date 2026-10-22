'use client'

// Sideways card rows from the Paper master design: the review cards (with a scroll indicator) and the
// six process steps (with the numbered stepper). Arrows, dots and scrolling stay in step.
import { stegaClean } from 'next-sanity'
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

import { GoogleG } from './Brand'
import { Svg } from './Svg'

/**
 * A sideways row of cards. `index` is the current card: the one picked with the arrows or the
 * numbered stepper, kept while its card is in view (near the end of the row, several cards can't
 * reach the left edge, so a picked card there stays current without the row moving). Scrolling by
 * hand moves it to the card at the left edge, or to the last card at the end of the row.
 * `edge` is the card nearest the left edge, `progress` how far along the row is (0-1).
 */
function useTrack(ref: RefObject<HTMLElement | null>, count: number) {
  const [state, setState] = useState({ index: 0, edge: 0, progress: 0, ratio: 1 })
  // The card picked with a button, and where the row is heading, while it scrolls there
  // (smooth scrolling fires many scroll events on the way)
  const picked = useRef<{ index: number; left: number } | null>(null)
  const fallback = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // The latest current and left-edge cards, so quick repeated clicks each move one card
  const latest = useRef({ index: 0, edge: 0 })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const cards = Array.from(el.children) as HTMLElement[]
    if (!cards.length) return
    const base = cards[0].offsetLeft
    const left = el.scrollLeft
    // Arrived at the picked card: scrolling by hand takes over again
    if (picked.current && Math.abs(left - picked.current.left) <= 2) picked.current = null
    let edge = 0
    cards.forEach((c, i) => { if (Math.abs(c.offsetLeft - base - left) < Math.abs(cards[edge].offsetLeft - base - left)) edge = i })
    const inView = (i: number) => {
      const x = cards[i].offsetLeft - base
      return x >= left - 2 && x + cards[i].offsetWidth <= left + el.clientWidth + 2
    }
    const atEnd = max > 0 && left >= max - 2
    let index = picked.current?.index ?? latest.current.index
    if (!picked.current && !inView(index)) index = atEnd ? count - 1 : edge
    latest.current = { index, edge }
    setState({ index, edge, progress: max > 0 ? left / max : 0, ratio: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1 })
  }, [ref, count])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    // Touching, clicking or wheeling the row is scrolling by hand
    const byHand = () => { picked.current = null }
    el.addEventListener('scroll', measure, { passive: true })
    el.addEventListener('wheel', byHand, { passive: true })
    el.addEventListener('touchstart', byHand, { passive: true })
    el.addEventListener('pointerdown', byHand)
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', measure)
      el.removeEventListener('wheel', byHand)
      el.removeEventListener('touchstart', byHand)
      el.removeEventListener('pointerdown', byHand)
      window.removeEventListener('resize', measure)
      clearTimeout(fallback.current)
    }
  }, [ref, measure])

  const go = (i: number) => {
    const el = ref.current
    if (!el) return
    const n = Math.max(0, Math.min(count - 1, i))
    const cards = Array.from(el.children) as HTMLElement[]
    // The row can't scroll past its end; a card there is already in view and just becomes current
    const left = Math.max(0, Math.min(cards[n].offsetLeft - cards[0].offsetLeft, el.scrollWidth - el.clientWidth))
    // The row is heading for card n: quick repeated clicks count on from there
    latest.current = { index: n, edge: n }
    setState((s) => ({ ...s, index: n }))
    if (Math.abs(el.scrollLeft - left) <= 2) { picked.current = null; return }
    picked.current = { index: n, left }
    el.scrollTo({ left, behavior: 'smooth' })
    // In case the row never gets there (stopped mid-way), hand control back
    clearTimeout(fallback.current)
    fallback.current = setTimeout(() => { picked.current = null; measure() }, 1500)
  }
  /** One card from the current card (steps) or from the card at the left edge (reviews) */
  const step = (by: number, from: 'index' | 'edge' = 'index') => go(latest.current[from] + by)
  return { ...state, go, step }
}

function Arrows({ prev, next, onPrev, onNext, label }: { prev: boolean; next: boolean; onPrev: () => void; onNext: () => void; label: string }) {
  return (
    <span className="v3-arrows">
      <button type="button" aria-label={`Previous ${label}`} disabled={!prev} onClick={onPrev}><Svg.arrowLeft size={14} stroke={prev ? '#09263A' : '#B9C2CA'} /></button>
      <button type="button" aria-label={`Next ${label}`} disabled={!next} onClick={onNext}><Svg.arrow size={14} stroke="#FFFFFF" /></button>
    </span>
  )
}

export type Review = { _key: string; service?: string; quote?: string; reviewerName?: string; year?: number; googleUrl?: string }

export function ReviewTrack({ title, rating, count, items }: { title: string; rating: ReactNode; count: ReactNode; items: Review[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const t = useTrack(ref, items.length)
  const left = t.progress * (1 - t.ratio) * 100
  return (
    <>
      <div className="v3-row-head">
        <h3>{title}</h3>
        <div className="meta"><GoogleG size={20} /><b>{rating}</b><span>· {count} Google reviews</span>
          <Arrows label="review" prev={t.progress > 0.01} next={t.progress < 0.99 && t.ratio < 1} onPrev={() => t.step(-1, 'edge')} onNext={() => t.step(1, 'edge')} />
        </div>
      </div>
      <ul className="v3-reviews" ref={ref}>
        {items.map((r) => {
          const name = r.reviewerName ?? ''
          return (
            <li key={r._key}>
              <header>
                <span className="av" aria-hidden="true">{stegaClean(name).slice(0, 1)}</span>
                <div><b>{name}</b><small>Google review, {r.year}</small></div>
                <GoogleG size={18} />
              </header>
              <span className="stars" aria-label="5 stars">★★★★★</span>
              <blockquote>{r.quote}</blockquote>
              {r.googleUrl && <a className="more" href={stegaClean(r.googleUrl)} target="_blank" rel="noopener noreferrer">Read more</a>}
              <div className="rule" />
              <span className="tag">{r.service}</span>
            </li>
          )
        })}
      </ul>
      <div className="v3-scroll" aria-hidden="true"><span style={{ width: `${t.ratio * 100}%`, marginLeft: `${left}%` }} /></div>
    </>
  )
}

export type Step = { _key: string; title?: string; text?: string }
const STEP_ICONS = [Svg.phone, Svg.calendar, Svg.search, Svg.docLines, Svg.wrench, Svg.checkCircle]
const nn = (n: number) => String(n).padStart(2, '0')

export function StepTrack({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const t = useTrack(ref, steps.length)
  return (
    <>
      <div className="v3-stepper">
        <p className="count"><b>{nn(t.index + 1)}</b><span>/ {nn(steps.length)}</span></p>
        <div className="dots">
          {steps.map((s, i) => (
            <button key={s._key} type="button" aria-label={`Step ${i + 1}`} aria-current={i === t.index ? 'step' : undefined} onClick={() => t.go(i)}>{i + 1}</button>
          ))}
        </div>
        <Arrows label="step" prev={t.index > 0} next={t.index < steps.length - 1} onPrev={() => t.step(-1)} onNext={() => t.step(1)} />
      </div>
      <ol className="v3-steps" ref={ref} tabIndex={0} aria-label="Steps: use the arrows or scroll sideways">
        {steps.map((s, i) => {
          const Icon = STEP_ICONS[i % STEP_ICONS.length]
          return (
            <li key={s._key} aria-current={i === t.index ? 'step' : undefined}>
              <header><b>{nn(i + 1)}</b><span className="ic"><Icon size={16} /></span></header>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          )
        })}
      </ol>
      <p className="v3-hint"><Svg.swipe size={16} stroke="#6A7782" />Swipe or use the arrows to see all {steps.length} steps</p>
    </>
  )
}
