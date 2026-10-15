'use client'

// Footer "Request a quick quote" form, as in the Paper master design. Not connected to a backend yet,
// like the booking form: it validates the phone number and points to the phone line.
import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react'

import { telHref } from '../template'

export function QuickQuote({ phone: phoneNumber }: { phone: string }) {
  const [sent, setSent] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const phone = useRef<HTMLInputElement>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const ok = (phone.current?.value ?? '').replace(/\D/g, '').length >= 10
    setPhoneError(!ok)
    if (!ok) { phone.current?.focus(); return }
    setSent(true)
  }

  return (
    <form className="v3-quote" noValidate aria-labelledby="quote-title" onSubmit={submit}>
      <h2 id="quote-title">Request a quick <span>quote</span></h2>
      <p>Tell us what your system is doing and we&apos;ll call you back to book a diagnosis.</p>
      <div className="row">
        <label>Name<input name="name" autoComplete="name" placeholder="Your name" /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="Your phone" ref={phone} aria-invalid={phoneError} /></label>
      </div>
      <label>How can we help?<textarea name="message" rows={3} placeholder="e.g. Furnace won't light, 2nd-floor loft" /></label>
      <button type="submit">Request free quote</button>
      <p className="msg" role="status" hidden={!sent && !phoneError}>
        {phoneError ? 'Enter a phone number so we can call you back.' : <>Thanks. This form isn&apos;t connected yet, so nothing was sent. To book now, call <a href={telHref(phoneNumber)}>{phoneNumber}</a>.</>}
      </p>
    </form>
  )
}

/** The current year for the footer's copyright line, set in the browser so the page itself stays static */
const noop = () => () => {}

export function Year() {
  // The visitor's current year; 2026 in the prerendered HTML
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => 2026)
  return <>{year}</>
}
