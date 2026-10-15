'use client'

// Hero booking form, as in the Paper master design. Real fields and phone validation; not connected
// to a backend yet, so a valid request shows a note with the phone number.
import { stegaClean } from 'next-sanity'
import { useRef, useState, type FormEvent } from 'react'

import { telHref } from '../template'
import { Svg } from './Svg'

const ISSUES = ['No heat or no cooling', 'Strange noise or smell', 'Tune-up or maintenance', 'Replacement quote', 'Something else']

type Props = {
  title?: string
  promise: string
  buildingOptions: string[]
  defaultBuilding?: string
  issueOptions?: string[]
  crossStreets: string
  submitLabel: string
  reassurance: string
  phone: string
  ownerName: string
}

export function BookingForm({ title, promise, buildingOptions, defaultBuilding, issueOptions, crossStreets, submitLabel, reassurance, phone: phoneNumber, ownerName }: Props) {
  const [phoneError, setPhoneError] = useState(false)
  const [sent, setSent] = useState(false)
  const phone = useRef<HTMLInputElement>(null)
  const msg = useRef<HTMLParagraphElement>(null)
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
    <form className="v3-book" id="request" noValidate aria-labelledby="request-title" onSubmit={submit}>
      <div className="head">
        <h2 id="request-title">{title}</h2>
        <p>{promise}</p>
      </div>
      <div className="rule" />
      <div className="group" role="group" aria-labelledby="rq-g1">
        <p className="legend" id="rq-g1"><span className="n">1</span>Your details</p>
        <div className="row">
          <div className="field"><label htmlFor="rq-name">Name</label><input id="rq-name" name="name" autoComplete="name" /></div>
          <div className="field"><label htmlFor="rq-phone">Phone</label>
            <input id="rq-phone" name="phone" type="tel" autoComplete="tel" required ref={phone} aria-invalid={phoneError} aria-describedby="rq-phone-err" /></div>
        </div>
        <p className="err" id="rq-phone-err" hidden={!phoneError}>Enter a phone number so {ownerName} can call you back.</p>
        <div className="field"><label htmlFor="rq-street">Street or cross streets</label>
          <div className="ic"><Svg.pinOnly size={14} stroke="#6A7782" /><input id="rq-street" name="street" autoComplete="street-address" placeholder={crossStreets} /></div></div>
      </div>
      <div className="group" role="group" aria-labelledby="rq-g2">
        <p className="legend two" id="rq-g2"><span className="n">2</span>Your job</p>
        {buildingOptions.length > 0 && (
          <div className="field"><label htmlFor="rq-building">Building type</label>
            <div className="sel">
              <select id="rq-building" name="building" defaultValue={selected}>
                {buildingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <Svg.chev size={12} stroke="#6A7782" />
            </div></div>
        )}
        <div className="field chips"><span className="lbl" id="rq-issue-l">What&apos;s happening?</span>
          <div className="list" role="radiogroup" aria-labelledby="rq-issue-l">
            {issues.map((t, i) => (
              <label key={t}><input type="radio" name="issue" value={t} defaultChecked={i === 0} /><span><Svg.check size={11} width={3} />{t}</span></label>
            ))}
          </div></div>
      </div>
      <button type="submit">{submitLabel}<Svg.arrow size={16} stroke="#FFFFFF" /></button>
      <p className="reassure"><Svg.checkCircle size={13} stroke="#186AA4" />{reassurance}</p>
      <p className="sent" role="status" tabIndex={-1} ref={msg} hidden={!sent}>
        Thanks. This form isn&apos;t connected yet, so nothing was sent. To book now, call <a href={telHref(phoneNumber)}>{phoneNumber}</a>.
      </p>
    </form>
  )
}
