// Tests the area pages' lead email route without sending a real email: fetch is replaced, so
// nothing reaches Resend. Run with `npm run test:lead`.
import assert from 'node:assert/strict'

import { POST } from '../src/app/service-area/api/lead/route.ts'

type Sent = { url: string; init?: RequestInit }
const realFetch = globalThis.fetch
let sent: Sent[] = []

function mockResend(response: () => Response | Promise<Response>) {
  sent = []
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    sent.push({ url: String(url), init })
    return response()
  }) as typeof fetch
}

function lead(payload: unknown) {
  return new Request('http://localhost/service-area/api/lead/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

const settings = ['RESEND_API_KEY', 'LEAD_FROM_EMAIL', 'LEAD_NOTIFICATION_EMAIL', 'LEAD_WEBHOOK_URL'] as const

function configure(env: Partial<Record<(typeof settings)[number], string>>) {
  for (const key of settings) {
    if (env[key] === undefined) delete process.env[key]
    else process.env[key] = env[key]
  }
}

const ready = {
  RESEND_API_KEY: 're_test_key',
  LEAD_FROM_EMAIL: 'City & Suburban Website <leads@updates.example.com>',
  LEAD_NOTIFICATION_EMAIL: 'dispatch@example.com, owner@example.com',
}

const booking = {
  name: 'QA Customer',
  phone: '(773) 555-0100',
  email: 'qa@example.com',
  street: 'Damen & North',
  building: 'Two-flat',
  issue: 'No heat or no cooling',
  area: 'Wicker Park',
  form: 'Booking form',
  page: '/service-area/wicker-park/',
}

async function run() {
  // A valid booking form request is emailed to every recipient
  configure(ready)
  mockResend(() => Response.json({ id: 'email_1' }))
  let res = await POST(lead(booking))
  assert.equal(res.status, 200)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].url, 'https://api.resend.com/emails')
  assert.equal(sent[0].init?.method, 'POST')
  const headers = sent[0].init?.headers as Record<string, string>
  assert.equal(headers.authorization, 'Bearer re_test_key')
  assert.match(headers['Idempotency-Key'], /^area-lead\/[0-9a-f-]{36}$/)
  const email = JSON.parse(String(sent[0].init?.body)) as { from: string; to: string[]; subject: string; text: string }
  assert.equal(email.from, ready.LEAD_FROM_EMAIL)
  assert.deepEqual(email.to, ['dispatch@example.com', 'owner@example.com'])
  assert.equal(email.subject, 'New area page lead: Wicker Park (Booking form)')
  for (const line of ['Name: QA Customer', 'Phone: (773) 555-0100', 'Email: qa@example.com', 'Street or cross streets: Damen & North', 'Building type: Two-flat',
    "What's happening: No heat or no cooling", 'Message: Not provided', 'Area: Wicker Park', 'Form: Booking form', 'Page: /service-area/wicker-park/']) {
    assert.ok(email.text.includes(line), `email text has "${line}"`)
  }

  // The quick quote form sends a free-text message; line breaks and control characters are flattened
  mockResend(() => Response.json({ id: 'email_2' }))
  res = await POST(lead({ name: 'QA', phone: '7735550100', email: 'qa@example.com', message: "Furnace won't light\r\nBcc: x@example.com", area: 'Pilsen', form: 'Quick quote form' }))
  assert.equal(res.status, 200)
  const quote = JSON.parse(String(sent[0].init?.body)) as { subject: string; text: string }
  assert.equal(quote.subject, 'New area page lead: Pilsen (Quick quote form)')
  assert.ok(quote.text.includes("Message: Furnace won't light Bcc: x@example.com"))
  assert.ok(!quote.text.includes('\nBcc:'))

  // Bot trap filled: answers ok so bots learn nothing, but sends nothing
  mockResend(() => Response.json({ id: 'never' }))
  res = await POST(lead({ ...booking, website: 'spam.example' }))
  assert.equal(res.status, 200)
  assert.equal(sent.length, 0)

  // Phone numbers shorter than 10 digits are refused, as in the forms
  res = await POST(lead({ ...booking, phone: '555-0100' }))
  assert.equal(res.status, 400)
  assert.equal(sent.length, 0)

  // Jobber needs an email to create the client, so a missing or malformed email is refused before sending
  for (const email of [undefined, '', 'not-an-email', 'qa@example', 'qa @example.com']) {
    res = await POST(lead({ ...booking, email }))
    assert.equal(res.status, 400, `email ${JSON.stringify(email)} is refused`)
    assert.equal(sent.length, 0)
  }

  // Not JSON at all
  res = await POST(new Request('http://localhost/service-area/api/lead/', { method: 'POST', body: 'not json' }))
  assert.equal(res.status, 200)
  assert.equal(sent.length, 0)

  // Missing settings or template placeholders: refused with 503, nothing sent
  for (const env of [{}, { ...ready, RESEND_API_KEY: 'PASTE_RESEND_KEY' }, { ...ready, LEAD_FROM_EMAIL: '' }, { ...ready, LEAD_NOTIFICATION_EMAIL: 'not-an-email' }]) {
    configure(env)
    res = await POST(lead(booking))
    assert.equal(res.status, 503)
    assert.equal(sent.length, 0)
  }

  // Resend refuses (for example a sending domain that is not verified yet): 502, so the form says to call
  configure(ready)
  mockResend(() => new Response('{"message":"domain not verified"}', { status: 403 }))
  res = await POST(lead(booking))
  assert.equal(res.status, 502)

  // Resend unreachable
  mockResend(() => { throw new TypeError('fetch failed') })
  res = await POST(lead(booking))
  assert.equal(res.status, 502)

  // With the Zapier webhook set, each lead goes to email and to Zapier (for Jobber) at the same time
  const hook = 'https://hooks.zapier.com/hooks/catch/123/test/'
  configure({ ...ready, LEAD_WEBHOOK_URL: hook })
  mockResend(() => Response.json({ status: 'success' }))
  res = await POST(lead({ ...booking, name: 'Mary Ann Smith' }))
  assert.equal(res.status, 200)
  assert.deepEqual(sent.map((s) => s.url).sort(), ['https://api.resend.com/emails', hook])
  const zap = sent.find((s) => s.url === hook)!
  assert.equal(zap.init?.method, 'POST')
  const data = JSON.parse(String(zap.init?.body)) as Record<string, string>
  assert.deepEqual(Object.keys(data).sort(), ['area', 'building_type', 'email', 'first_name', 'form', 'full_name', 'issue', 'last_name',
    'message', 'page_url', 'phone', 'service', 'source', 'street', 'submitted_at'])
  assert.equal(data.source, 'Area page')
  assert.equal(data.first_name, 'Mary')
  assert.equal(data.last_name, 'Ann Smith')
  assert.equal(data.full_name, 'Mary Ann Smith')
  assert.equal(data.phone, '(773) 555-0100')
  assert.equal(data.email, 'qa@example.com')
  assert.equal(data.street, 'Damen & North')
  assert.equal(data.building_type, 'Two-flat')
  assert.equal(data.issue, 'No heat or no cooling')
  assert.equal(data.area, 'Wicker Park')
  assert.equal(data.form, 'Booking form')
  assert.equal(data.page_url, 'https://citysuburbanheating.com/service-area/wicker-park/')
  assert.match(data.submitted_at, /^\d{4}-\d\d-\d\dT/)

  // Zapier only (no email settings yet): still accepted
  configure({ LEAD_WEBHOOK_URL: hook })
  mockResend(() => Response.json({ status: 'success' }))
  res = await POST(lead(booking))
  assert.equal(res.status, 200)
  assert.deepEqual(sent.map((s) => s.url), [hook])

  // One delivery failing does not lose the lead: the visitor is told it was sent
  configure({ ...ready, LEAD_WEBHOOK_URL: hook })
  mockResend(() => new Response(null, { status: 500 }))
  res = await POST(lead(booking))
  assert.equal(res.status, 502, 'both failing is a failure')
  for (const failing of ['https://api.resend.com/emails', hook]) {
    sent = []
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      sent.push({ url: String(url), init })
      if (String(url) === failing) throw new TypeError('fetch failed')
      return Response.json({ ok: true })
    }) as typeof fetch
    res = await POST(lead(booking))
    assert.equal(res.status, 200, `lead accepted when only ${failing} fails`)
    assert.equal(sent.length, 2)
  }

  // A webhook value that is not an https address is ignored
  configure({ LEAD_WEBHOOK_URL: 'http://hooks.zapier.com/x' })
  mockResend(() => Response.json({ status: 'success' }))
  res = await POST(lead(booking))
  assert.equal(res.status, 503)
  assert.equal(sent.length, 0)

  console.log('Lead route: all checks passed')
}

run()
  .catch((error) => { console.error(error); process.exitCode = 1 })
  .finally(() => { globalThis.fetch = realFetch })
