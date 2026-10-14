'use client'

// B1 request form: real fields and phone validation. Not connected to a backend yet.
import { stegaClean } from 'next-sanity'
import { useRef, useState, type FormEvent } from 'react'

import { design } from './design'
import { Icon } from './Icon'

const ISSUES = ['No heat or no cooling', 'Strange noise or smell', 'Tune-up or maintenance', 'Replacement quote', 'Something else']

type Props = { title?: string; buildingOptions: string[]; defaultBuilding?: string; issueOptions?: string[]; crossStreets: string }

export function RequestForm({ title, buildingOptions, defaultBuilding, issueOptions, crossStreets }: Props) {
  const [phoneError, setPhoneError] = useState(false)
  const [sent, setSent] = useState(false)
  const phone = useRef<HTMLInputElement>(null)
  const msg = useRef<HTMLParagraphElement>(null)
  // Sanity can list its own options; the five standard ones are the fallback
  const issues = issueOptions && issueOptions.length > 1 ? issueOptions : ISSUES
  const selected = buildingOptions.find((o) => stegaClean(o) === stegaClean(defaultBuilding))

  function submit(e: FormEvent) {
    e.preventDefault()
    const ok = (phone.current?.value ?? '').replace(/\D/g, '').length >= 10
    setPhoneError(!ok)
    if (!ok) { phone.current?.focus(); return }
    setSent(true)
    setTimeout(() => msg.current?.focus(), 0)
  }

  return (
    <form className="v2-form" id="request" noValidate aria-labelledby="request-title" onSubmit={submit}>
      <h2 id="request-title">{title}</h2>
      <p className="sub">The person who diagnoses your system is the person who quotes it.</p>
      <fieldset>
        <legend><span className="n">1</span>Your details</legend>
        <div className="v2-row2">
          <div className="cs-field"><label htmlFor="rq-name">Name</label><input id="rq-name" name="name" autoComplete="name" /></div>
          <div className="cs-field"><label htmlFor="rq-phone">Phone</label>
            <input id="rq-phone" name="phone" type="tel" autoComplete="tel" required ref={phone} aria-invalid={phoneError} aria-describedby="rq-phone-err" /></div>
        </div>
        <span className="err" id="rq-phone-err" hidden={!phoneError}>Enter a phone number so Rob can call you back.</span>
        <div className="cs-field"><label htmlFor="rq-street">Street or cross streets</label>
          <div className="v2-ic-input"><Icon name="pin" size={18} /><input id="rq-street" name="street" autoComplete="street-address" placeholder={crossStreets} /></div></div>
      </fieldset>
      <fieldset>
        <legend><span className="n">2</span>Your job</legend>
        {buildingOptions.length > 0 && (
          <div className="cs-field"><label htmlFor="rq-building">Building type</label>
            <select id="rq-building" name="building" defaultValue={selected}>
              {buildingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select></div>
        )}
        <div className="cs-field"><span className="lbl" id="rq-issue-l">What&apos;s happening?</span>
          <div className="v2-chips" role="radiogroup" aria-labelledby="rq-issue-l">
            {issues.map((t, i) => (
              <label key={t} className="v2-chip"><input type="radio" name="issue" value={t} defaultChecked={i === 0} /><span><Icon name="check" size={14} strokeWidth={2.4} />{t}</span></label>
            ))}
          </div></div>
      </fieldset>
      <button className="cs-btn cs-btn-red" type="submit">Request a diagnosis<Icon name="arrow" size={16} strokeWidth={2} /></button>
      <p className="v2-reassure"><Icon name="check" size={16} strokeWidth={2.2} />Price agreed before any work starts.</p>
      <p className="cs-form-msg" role="status" tabIndex={-1} ref={msg} hidden={!sent}>
        Thanks. This preview form isn&apos;t connected yet, so nothing was sent. To book now, call <a href={design.tel}>{design.phone}</a>.
      </p>
    </form>
  )
}
