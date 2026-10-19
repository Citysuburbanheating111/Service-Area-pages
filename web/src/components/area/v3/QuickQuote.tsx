'use client'

// Footer "Request a quick quote" form, as in the Paper master design. Like the booking form, a valid
// request is emailed to City & Suburban (see sendLead), and a failure points to the phone line.
import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react'

import { telHref } from '../template'
import { sendLead } from './sendLead'

export function QuickQuote({ phone: phoneNumber, area }: { phone: string; area?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [phoneError, setPhoneError] = useState(false)
  const phone = useRef<HTMLInputElement>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const ok = (phone.current?.value ?? '').replace(/\D/g, '').length >= 10
    setPhoneError(!ok)
    if (!ok) { phone.current?.focus(); return }
    setStatus('sending')
    const sent = await sendLead(form, { area: area ?? '', form: 'Quick quote form' })
    if (sent) form.reset()
    setStatus(sent ? 'sent' : 'failed')
  }

  return (
    <form className="v3-quote" noValidate aria-labelledby="quote-title" onSubmit={submit}>
      <h2 id="quote-title">Request a quick <span>quote</span></h2>
      <p>Tell us what your system is doing and we&apos;ll call you back to book a diagnosis.</p>
      <div className="v3-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="row">
        <label>Name<input name="name" autoComplete="name" placeholder="Your name" /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="Your phone" ref={phone} aria-invalid={phoneError} /></label>
      </div>
      <label>How can we help?<textarea name="message" rows={3} placeholder="e.g. Furnace won't light, 2nd-floor loft" /></label>
      <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Request free quote'}</button>
      <p className="msg" role="status" hidden={!phoneError && status !== 'sent' && status !== 'failed'}>
        {phoneError
          ? 'Enter a phone number so we can call you back.'
          : status === 'sent'
            ? <>Thanks. Your request was sent, and we&apos;ll call you back. To talk now, call <a href={telHref(phoneNumber)}>{phoneNumber}</a>.</>
            : <>Your request could not be sent. Please call <a href={telHref(phoneNumber)}>{phoneNumber}</a> for a quote.</>}
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
