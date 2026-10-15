'use client'

// All services: group tabs on the left, the selected group's services on the right, as in the Paper
// master design. Every group is in the HTML; only the selected one is visible.
import { useRef, useState, type KeyboardEvent } from 'react'

import type { ServiceGroup } from '../design'
import { Svg } from './Svg'

const nn = (n: number) => String(n).padStart(2, '0')

export function ServicesTabs({ groups }: { groups: ServiceGroup[] }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(e: KeyboardEvent, i: number) {
    const map: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: -i, End: groups.length - 1 - i }
    const d = map[e.key]
    if (d === undefined) return
    e.preventDefault()
    const next = (i + d + groups.length) % groups.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="v3-svc">
      <div className="tabs" role="tablist" aria-orientation="vertical" aria-label="Service groups">
        {groups.map((g, i) => (
          <button
            key={g.key}
            ref={(el) => { tabs.current[i] = el }}
            role="tab"
            type="button"
            id={`tab-${g.key}`}
            aria-controls={`panel-${g.key}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span>{g.name}</span><span className="count">{nn(g.items.length)}</span>
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div key={g.key} className="panel" role="tabpanel" id={`panel-${g.key}`} aria-labelledby={`tab-${g.key}`} hidden={i !== active}>
          <div className="top">
            <div><h3>{g.title}</h3>{g.lede && <p>{g.lede}</p>}</div>
            <span className="pill">{g.items.length} services</span>
          </div>
          <ul className="cards">
            {g.items.map((s) => (
              <li key={s.title}>
                <a href={s.url}>
                  <div><h4>{s.title}</h4>{s.text && <p>{s.text}</p>}</div>
                  <span className="go"><Svg.upRight size={12} /></span>
                </a>
              </li>
            ))}
            <li className="all"><a href={g.url}>See all {g.name.toLowerCase()} services<Svg.arrow size={14} stroke="#09263A" /></a></li>
          </ul>
        </div>
      ))}
    </div>
  )
}
