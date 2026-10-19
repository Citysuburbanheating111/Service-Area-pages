/**
 * Receives the area pages' request forms (the booking form in the hero and the quick quote form in the
 * footer) and emails each lead through Resend, like the service pages do. It sits under /service-area/
 * because the Cloudflare Worker already sends that path to this app, so the forms work on
 * citysuburbanheating.com and on the vercel.app address alike.
 *
 * Needs three Vercel environment variables: RESEND_API_KEY, LEAD_FROM_EMAIL (a sender on a domain
 * verified in Resend) and LEAD_NOTIFICATION_EMAIL (one address, or several separated by commas).
 */
import { randomUUID } from 'node:crypto'

const fields = ['name', 'phone', 'street', 'building', 'issue', 'message', 'area', 'form', 'page'] as const
type Lead = Record<(typeof fields)[number], string>

const resendEndpoint = 'https://api.resend.com/emails'

// Ignores empty values and unfilled template placeholders such as "PASTE_KEY_HERE"
function configured(value: string | undefined) {
  return value && !/^(PASTE_|your_)/i.test(value.trim()) ? value.trim() : ''
}

// One line of plain text, without control characters, at most 1,000 characters
function cleanField(value: unknown) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000)
}

function recipients(value: string) {
  return value.split(',').map((email) => email.trim()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).slice(0, 50)
}

function leadEmail(lead: Lead, submitted = new Date()) {
  const where = lead.area ? `: ${lead.area}` : ''
  const subject = `New area page lead${where}${lead.form ? ` (${lead.form})` : ''}`.slice(0, 200)
  const text = [
    'New request from a service area page',
    '',
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone}`,
    `Street or cross streets: ${lead.street || 'Not provided'}`,
    `Building type: ${lead.building || 'Not provided'}`,
    `What's happening: ${lead.issue || 'Not provided'}`,
    `Message: ${lead.message || 'Not provided'}`,
    `Area: ${lead.area || 'Not provided'}`,
    `Form: ${lead.form || 'Not provided'}`,
    `Page: ${lead.page || 'Not provided'}`,
    `Submitted (UTC): ${submitted.toISOString()}`,
  ].join('\n')
  return { subject, text }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null
  // "website" is a hidden field people never see; a value there means a bot filled the form
  if (!payload || payload.website) return Response.json({ ok: true })

  const lead = Object.fromEntries(fields.map((field) => [field, cleanField(payload[field])])) as Lead
  if (lead.phone.replace(/\D/g, '').length < 10) {
    return Response.json({ message: 'A valid phone number is required' }, { status: 400 })
  }

  const apiKey = configured(process.env.RESEND_API_KEY)
  const from = configured(process.env.LEAD_FROM_EMAIL)
  const to = recipients(configured(process.env.LEAD_NOTIFICATION_EMAIL))
  if (!apiKey || !from || !to.length) {
    console.error('Lead email delivery is not configured')
    return Response.json({ message: 'Lead email delivery is not configured' }, { status: 503 })
  }

  const { subject, text } = leadEmail(lead)
  try {
    const response = await fetch(resendEndpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'Idempotency-Key': `area-lead/${randomUUID()}`,
      },
      body: JSON.stringify({ from, to, subject, text }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      console.error('Resend lead delivery failed', { status: response.status })
      return Response.json({ message: 'Lead email delivery failed' }, { status: 502 })
    }
    return Response.json({ ok: true })
  } catch (error: unknown) {
    console.error('Resend lead delivery request failed', { error: error instanceof Error ? error.name : 'UnknownError' })
    return Response.json({ message: 'Lead email delivery failed' }, { status: 502 })
  }
}
