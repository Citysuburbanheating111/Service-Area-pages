/**
 * Checks that the area pages' request forms can deliver leads in production, without sending one.
 * Run by CI (.github/workflows/lead-delivery.yml) after every deploy and daily, and by
 * publish-area.mjs before a batch of pages goes live.
 *
 *   node scripts/check-lead-delivery.mjs                     (both domains, the West Loop page)
 *   node scripts/check-lead-delivery.mjs --wait 600          (after a deploy: retry for up to 10 minutes)
 *   node scripts/check-lead-delivery.mjs --allow-partial     (pass with email OR Jobber configured)
 *   node scripts/check-lead-delivery.mjs --host https://service-area-pages.vercel.app --page pilsen
 *
 * For each domain:
 *   1. GET /service-area/api/lead/ reports email (Resend) and Jobber (Zapier) delivery as configured. Both
 *      are required unless --allow-partial. The values themselves live in Vercel (Settings > Environment
 *      Variables, Production): RESEND_API_KEY, LEAD_FROM_EMAIL, LEAD_NOTIFICATION_EMAIL, LEAD_WEBHOOK_URL.
 *   2. A bot-trap POST (hidden "website" field filled) is accepted: form posts reach the app through the
 *      Cloudflare Worker. The route drops it, so nothing is sent.
 *   3. A POST with a bad phone number is rejected with 400: validation is live.
 *   4. A published area page renders both forms (hero booking form, footer quick quote) and its scripts
 *      load, so the forms can run.
 * It never submits a valid lead. Exit code 1 if anything fails.
 */
import { pathToFileURL } from 'node:url'

export const HOSTS = ['https://citysuburbanheating.com', 'https://service-area-pages.vercel.app']
const ENDPOINT = '/service-area/api/lead/'
const FIX = 'Set them in Vercel (Settings > Environment Variables, Production) and redeploy: email needs RESEND_API_KEY, '
  + 'LEAD_FROM_EMAIL and LEAD_NOTIFICATION_EMAIL; Jobber needs LEAD_WEBHOOK_URL (the Zapier Catch Hook).'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function request(url, init) {
  try {
    const res = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(20_000) })
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch { /* not JSON */ }
    return { status: res.status, json, text }
  } catch (error) {
    return { status: 0, json: null, text: String(error?.cause?.code ?? error?.name ?? error) }
  }
}

const post = (url, body) => request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

/** Status from GET, retrying while the deploy with the check isn't live yet (405) or delivery isn't ready */
async function deliveryStatus(host, waitSeconds, strict) {
  const until = Date.now() + waitSeconds * 1000
  for (;;) {
    const res = await request(host + ENDPOINT)
    const done = res.status === 200 && res.json && (strict ? res.json.email && res.json.jobber : res.json.ready)
    if (done || Date.now() >= until) return res
    await sleep(20_000)
  }
}

/** Runs every check; returns a list of failures (empty when all is well) and prints a report */
export async function checkLeadDelivery({ hosts = HOSTS, pages = ['west-loop'], waitSeconds = 0, strict = true, log = console.log } = {}) {
  const failures = []
  for (const host of hosts) {
    log(`\n${host}`)
    const fail = (msg) => { failures.push(`${host}: ${msg}`); log(`  FAIL  ${msg}`) }
    const ok = (msg) => log(`  ok    ${msg}`)

    // 1. Delivery configured
    const s = await deliveryStatus(host, waitSeconds, strict)
    if (s.status === 405) fail('the lead route has no delivery check yet (405): the deploy with it is not live')
    else if (s.status !== 200 || !s.json) fail(`delivery check answered ${s.status || s.text}`)
    else if (!s.json.ready) fail(`no lead delivery is configured, so every form shows "couldn't send". ${FIX}`)
    else if (strict && !(s.json.email && s.json.jobber)) fail(`only ${s.json.email ? 'email' : 'Jobber'} delivery is configured; ${s.json.email ? 'Jobber (LEAD_WEBHOOK_URL)' : 'email (RESEND_API_KEY, LEAD_FROM_EMAIL, LEAD_NOTIFICATION_EMAIL)'} is missing. ${FIX}`)
    else ok(`delivery configured: email ${s.json.email ? 'yes' : 'no'}, Jobber ${s.json.jobber ? 'yes' : 'no'}`)

    // 2. Form posts reach the app (bot trap: accepted and dropped, nothing is sent)
    const trap = await post(host + ENDPOINT, { website: 'lead-delivery-check' })
    if (trap.status === 200 && trap.json?.ok) ok('form posts reach the app')
    else fail(`a form post was answered ${trap.status || trap.text}${trap.json ? '' : ' (not the app: check the Cloudflare Worker route)'}`)

    // 3. Validation live
    const bad = await post(host + ENDPOINT, { phone: '1', email: 'not-an-email' })
    if (bad.status === 400) ok('validation is live')
    else fail(`a bad phone number was answered ${bad.status || bad.text}, not 400`)

    // 4. A published area page renders both forms and its scripts load
    for (const slug of pages) {
      const page = await request(`${host}/service-area/${slug}/`)
      if (page.status !== 200) { fail(`/service-area/${slug}/ answered ${page.status || page.text}`); continue }
      const forms = ['v3-book', 'v3-quote'].filter((c) => new RegExp(`<form[^>]*class="${c}"`).test(page.text))
      if (forms.length < 2) fail(`/service-area/${slug}/ is missing ${['booking form', 'quick quote form'].filter((_, i) => !forms.includes(['v3-book', 'v3-quote'][i])).join(' and ')}`)
      const scripts = [...new Set([...page.text.matchAll(/<script[^>]*src="(\/_next\/[^"]+)"/g)].map((m) => m[1]))].slice(0, 3)
      const broken = []
      for (const src of scripts) {
        const r = await request(host + src)
        if (r.status !== 200) broken.push(`${src} (${r.status})`)
      }
      if (!scripts.length) fail(`/service-area/${slug}/ has no app scripts, so its forms can't run`)
      else if (broken.length) fail(`/service-area/${slug}/ scripts don't load, so its forms can't run: ${broken.join(', ')}`)
      else if (forms.length === 2) ok(`/service-area/${slug}/ renders both forms and its scripts load`)
    }
  }
  log(failures.length ? `\n${failures.length} problem(s). No lead was sent.` : '\nLead delivery: all checks passed. No lead was sent.')
  return failures
}

// Run from the command line
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const values = (flag) => args.flatMap((a, i) => (a === flag && args[i + 1] ? [args[i + 1]] : []))
  const hosts = values('--host')
  const pages = values('--page')
  const failures = await checkLeadDelivery({
    hosts: hosts.length ? hosts : HOSTS,
    pages: pages.length ? pages : ['west-loop'],
    waitSeconds: Number(values('--wait')[0] ?? 0),
    strict: !args.includes('--allow-partial'),
  })
  process.exitCode = failures.length ? 1 : 0
}
