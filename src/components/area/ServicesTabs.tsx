'use client'

// B2: every group is in the HTML; only the selected one is visible (playbook Part F).
import { useId, useRef, useState, type KeyboardEvent } from 'react'

import { site, type ServiceGroup } from '@/lib/site'

import { Icon } from './Icon'

type Props = { groups: ServiceGroup[]; preview: boolean }

export function ServicesTabs({ groups, preview }: Props) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  function onKey(e: KeyboardEvent, i: number) {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + groups.length) % groups.length
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
              id={`${id}-tab-${g.key}`}
              className="cs-tab"
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${id}-panel-${g.key}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="ic"><Icon name={g.key} /></span>
              <span className="name">{g.name}</span>
              <span className="count">{g.count}</span>
            </button>
          ))}
        </div>
        <div className="cs-urgent">
          <b>No heat in January?</b>
          <span>Call {site.phone}. Tell us the furnace or boiler make and what it&apos;s doing.</span>
        </div>
      </div>

      {groups.map((g, i) => (
        <div
          key={g.key}
          id={`${id}-panel-${g.key}`}
          className="cs-panel"
          role="tabpanel"
          aria-labelledby={`${id}-tab-${g.key}`}
          hidden={i !== active}
        >
          <div>
            <h3>{g.title}</h3>
            {g.lede && <p>{g.lede}</p>}
          </div>
          {g.services.length > 0 ? (
            <ul className="cs-tiles">
              {g.services.map((s) => (
                <li key={s.title} className="cs-tile">
                  <span className="ic"><Icon name={s.icon} size={22} strokeWidth={1.7} /></span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            preview && (
              <p className="cs-confirm">
                [CONFIRM: the {g.count} {g.name.toLowerCase()} services aren&apos;t written yet. Add them to
                src/lib/site.ts. This group is hidden on the published site until then.]
              </p>
            )
          )}
        </div>
      ))}
    </div>
  )
}
