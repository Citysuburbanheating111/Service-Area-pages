'use client'

// B2: every group is in the HTML; only the selected one is visible (playbook Part F).
import { useRef, useState, type KeyboardEvent } from 'react'

import { design, type ServiceGroup } from './design'
import { Icon } from './Icon'

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
    <div className="cs-services-card">
      <div className="cs-tabs">
        <div className="cs-tablist" role="tablist" aria-orientation="vertical" aria-label="Service groups">
          {groups.map((g, i) => (
            <button
              key={g.key}
              ref={(el) => { tabs.current[i] = el }}
              className="cs-tab"
              role="tab"
              type="button"
              id={`tab-${g.key}`}
              aria-controls={`panel-${g.key}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="ic"><Icon name={g.key} /></span>
              <span className="name">{g.name}</span>
              <span className="count">{g.items.length}</span>
            </button>
          ))}
        </div>
        <div className="cs-urgent">
          <b>No heat in January?</b>
          <span>Call <a href={design.tel} style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{design.phone}</a>. Tell us the furnace or boiler make and what it&apos;s doing.</span>
        </div>
      </div>
      {groups.map((g, i) => (
        <div key={g.key} className="cs-panel" role="tabpanel" id={`panel-${g.key}`} aria-labelledby={`tab-${g.key}`} hidden={i !== active}>
          <div>
            <h3>{g.title}</h3>
            {g.lede ? <p>{g.lede}</p> : <p><a href={g.url} style={{ color: 'var(--color-blue)', fontWeight: 600 }}>All {g.name.toLowerCase()} services →</a></p>}
          </div>
          <ul className="cs-tiles">
            {g.items.map((s) => (
              <li key={s.title}>
                <a className="cs-tile" href={s.url}>
                  <span className="ic"><Icon name={s.icon} size={22} strokeWidth={1.7} /></span>
                  <div><h4>{s.title}</h4>{s.text ? <p>{s.text}</p> : <span className="more">See the service →</span>}</div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
