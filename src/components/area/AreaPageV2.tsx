/**
 * The service area page template (v2), driven by Sanity. Every area page renders through this one
 * component, so a design change here reaches every area, now and later.
 *
 * Markup and class names mirror tools/build_area_page_v2.py (the static v2 pages on the design-system
 * site); the styles are the same files, synced by tools/sync_design_to_web.py.
 *
 * `preview` is true only in draft mode (Sanity Presentation): it adds the "to confirm" bar and shows
 * placeholders where content isn't written yet. The published page leaves those parts out.
 */
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { urlFor } from '@/sanity/lib/image'
import type { AreaPageData } from '@/sanity/types'

import { BuildingPicker } from './BuildingPicker'
import { design } from './design'
import { GLogo, Icon } from './Icon'
import { LiveFooter, LiveHeader } from './LiveChrome'
import { RequestForm } from './RequestForm'
import { ReviewCard } from './ReviewCard'
import { ServicesTabs } from './ServicesTabs'
import { StepsTrack } from './StepsTrack'

type Props = { page: AreaPageData; preview: boolean }

const scrim = (g: string, img: string) => ({ backgroundImage: `${g},url(${img})` })

export function AreaPageV2({ page, preview }: Props) {
  const slug = stegaClean(page.slug) ?? ''
  return (
    <>
      {preview && <PreviewBar page={page} slug={slug} />}
      <LiveHeader />
      <div className="cs v2">
        <main>
          <Hero page={page} slug={slug} />
          <Picker page={page} />
          <Services page={page} />
          <Price page={page} />
          <Choose page={page} />
          <Companies />
          <About page={page} />
          <Reviews page={page} preview={preview} />
          <Process page={page} />
          <Districts page={page} />
          <Permits page={page} />
          <Faq page={page} />
          <NextStep page={page} />
          <Credits slug={slug} />
        </main>
      </div>
      <LiveFooter />
    </>
  )
}

function Head({ eyebrow, title, id, lede }: { eyebrow: string; title?: string; id: string; lede?: string }) {
  return (
    <div className="v2-head">
      <p className="cs-eyebrow">{eyebrow}</p>
      <h2 id={id} className="cs-h2">{title}</h2>
      {lede && <p className="v2-lede">{lede}</p>}
    </div>
  )
}

function PreviewBar({ page, slug }: { page: AreaPageData; slug: string }) {
  const notes = page.confirmNotes ?? []
  return (
    <details className="cs-preview-bar">
      <summary>
        <span>Draft preview · {notes.length ? `${notes.length} item${notes.length > 1 ? 's' : ''} to confirm before publishing` : 'nothing left to confirm'}</span>
        <a href={`/api/draft-mode/disable?redirect=/service-areas/${slug}`}>Exit preview</a>
      </summary>
      {notes.length > 0 && <ul>{notes.map((n) => <li key={n._key}><b>{n.block}</b>{n.note}</li>)}</ul>}
    </details>
  )
}

// ── B1 Hero + request form ─────────────────────────────
function Hero({ page, slug }: { page: AreaPageData; slug: string }) {
  const hero = page.hero ?? {}
  const img = hero.image?.asset ? urlFor(hero.image).width(1920).quality(80).auto('format').url() : design.images.hero
  const credit = design.areaPhotos.includes(slug) ? design.credits[slug] : undefined
  const strip = [
    ...(credit ? [{ src: `/cs-assets/areas/${slug}.webp`, cap: credit.caption }] : []),
    { src: design.images.acService, cap: 'A technician servicing an AC unit · Illustrative photo' },
    { src: design.images.furnaceFilter, cap: 'A furnace filter change · Illustrative photo' },
  ]
  return (
    <section className="v2-hero on-dark" aria-labelledby="hero-title"
      style={scrim('linear-gradient(90deg,rgb(9 38 58 / 95%) 0%,rgb(9 38 58 / 86%) 50%,rgb(9 38 58 / 45%) 100%)', img)}>
      {hero.image?.illustrative && <span className="cs-illustrative">Illustrative photo</span>}
      <div className="v2-hero-copy">
        <nav className="cs-crumbs" aria-label="Breadcrumb">
          <ol><li><a href={`${design.live}/`}>Home</a></li><li><Link href="/service-areas">Service area</Link></li><li aria-current="page">{page.areaName}</li></ol>
        </nav>
        <p className="cs-eyebrow v2-dot">Chicago · {page.areaName}</p>
        <h1 className="cs-h1" id="hero-title">{hero.h1}</h1>
        {hero.lede && <p className="cs-lede">{hero.lede}</p>}
        <ul className="v2-glass" aria-label="Why City & Suburban">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <li><img src={design.images.seal} alt="" width={22} height={22} />Family owned since 1952</li>
          <li><Icon name="check" size={16} strokeWidth={2.2} />Price agreed before any work starts</li>
          <li className="rt"><a href={design.gmaps} target="_blank" rel="noopener noreferrer"><GLogo /><b>4.98</b><small>/5</small><span className="cs-stars" aria-hidden="true">★★★★★</span>204 reviews</a></li>
        </ul>
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={design.tel}><Icon name="phone" size={18} strokeWidth={2} />Call {design.phone}</a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
        <div className="v2-strip">
          <p className="v2-strip-title">On the job, around {page.areaName}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ul>{strip.map((s) => <li key={s.src}><img src={s.src} alt="" loading="lazy" decoding="async" /><span>{s.cap}</span></li>)}</ul>
        </div>
      </div>
      <RequestForm
        title={hero.formTitle}
        buildingOptions={hero.buildingTypeOptions ?? []}
        defaultBuilding={hero.defaultBuildingType}
        issueOptions={hero.issueOptions}
        crossStreets={design.cross[slug] ?? 'Street & cross street'}
      />
    </section>
  )
}

// ── B10 Building selector ("Start here") ───────────────
function Picker({ page }: { page: AreaPageData }) {
  const types = page.buildings?.types ?? []
  if (!types.length) return null
  return (
    <section className="cs-sec v2-stack" aria-labelledby="pick-title">
      <div className="v2-head-row">
        <Head eyebrow="Start here" title={page.buildings?.heading} id="pick-title" />
        <p className="v2-hint"><Icon name="home" size={18} />Select your building to see what heats and cools it</p>
      </div>
      <BuildingPicker types={types} />
    </section>
  )
}

// ── B2 Services ────────────────────────────────────────
function Services({ page }: { page: AreaPageData }) {
  return (
    <section className="cs-services" aria-labelledby="services-title">
      <div className="cs-services-head">
        <span className="cs-pill-light">From city to suburbs</span>
        <h2 id="services-title">{page.services?.heading}</h2>
        <p>24 services in four groups, from a furnace that won&apos;t light to a restaurant&apos;s make-up air unit.</p>
      </div>
      <ServicesTabs groups={design.groups} />
    </section>
  )
}

// ── B6 What changes the price ──────────────────────────
function Price({ page }: { page: AreaPageData }) {
  const p = page.price
  if (!p?.factors?.length) return null
  return (
    <section className="cs-sec v2-split" aria-labelledby="price-title">
      <div className="v2-split-side">
        <Head eyebrow="What changes the price" title={p.heading} id="price-title" lede={p.intro} />
        <figure className="v2-tall">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.acService} alt="A technician tightening a refrigerant line valve on an outdoor AC unit" loading="lazy" decoding="async" />
          <span className="v2-badge"><b>{p.factors.length}</b><span>Things that<br />move the price</span></span>
          <figcaption>Illustrative photo</figcaption>
        </figure>
      </div>
      <ol className="v2-checklist">
        {p.factors.map((f, i) => (
          <li key={f._key}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span className="badge"><Icon name={design.factorIcons[i % design.factorIcons.length]} size={18} /></span>
            <div><h3>{f.title}</h3><p>{f.text}</p></div>
          </li>
        ))}
      </ol>
      {p.medianValue && (
        <div className="v2-callout on-dark">
          <span className="badge"><Icon name="dollar" size={22} /></span>
          <div><b className="big">{p.medianValue}</b><p>{p.medianCaption}</p></div>
        </div>
      )}
    </section>
  )
}

// ── B7 How to choose ───────────────────────────────────
function Choose({ page }: { page: AreaPageData }) {
  const qs = page.choose?.questions ?? []
  if (!qs.length) return null
  return (
    <section className="cs-sec cs-fog v2-stack" aria-labelledby="choose-title">
      <Head eyebrow="How to choose" title={page.choose?.heading} id="choose-title" lede="Ask them of anyone you call, including us." />
      <div className="v2-acc-split">
        <figure className="v2-tall">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.furnaceFilter} alt="Hands sliding a dirty pleated filter out of a furnace" loading="lazy" decoding="async" />
          <figcaption>Illustrative photo</figcaption>
        </figure>
        <div>
          <p className="v2-label">Questions to ask</p>
          <div className="v2-acc">
            {qs.map((q, i) => (
              <details key={q._key} open={i === 0}>
                <summary><span className="badge"><Icon name={design.questionIcons[i % design.questionIcons.length]} size={18} /></span><span className="q">{q.title}</span><Icon name="chev" size={18} strokeWidth={2.2} /></summary>
                <div className="ans"><p className="k">Why it matters</p><p>{q.text}</p></div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── B8 Kinds of company (shared) ───────────────────────
function Companies() {
  return (
    <section className="cs-sec v2-stack" aria-labelledby="companies-title">
      <Head eyebrow="Kinds of HVAC company" title="Who you'll meet, and what limits each of them" id="companies-title" />
      <ul className="v2-cos">
        {design.companies.map((c, i) => (
          <li key={c.title} className={`v2-co${c.us ? ' us' : ''}`}>
            {c.us && <span className="flag">This is us</span>}
            <span className="badge"><Icon name={design.companyIcons[i]} size={20} /></span>
            <h3>{c.title}</h3><p>{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── B3 About City & Suburban (van) ─────────────────────
function About({ page }: { page: AreaPageData }) {
  return (
    <section className="cs-sec cs-navy v2-cred on-dark" aria-labelledby="owner-title">
      <div className="v2-head-row">
        <Head eyebrow="About City & Suburban" title="Who you're actually calling?" id="owner-title" />
        <div className="v2-aside">
          <p><b>One family. Second generation. Since 1952.</b> {page.owner?.paragraph}</p>
          <div className="v2-names"><small>Names our reviewers remember</small><ul>{design.names.map((n) => <li key={n}>{n}</li>)}</ul></div>
        </div>
      </div>
      <div className="v2-cred-grid">
        <figure className="v2-van">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.van} alt="A City & Suburban Heating & Cooling service van parked on a Chicago street at dusk, with the skyline behind it" width={1235} height={848} loading="lazy" decoding="async" />
          <figcaption>Illustrative image</figcaption>
          <a className="v2-addr" href={design.gmaps} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={16} strokeWidth={2} />1225 N Cleaver St</a>
        </figure>
        <div className="v2-tiles">
          <div className="v2-tile"><p className="k"><Icon name="user" size={16} strokeWidth={2} />Owner</p><b>Rob</b><p>Owner-operator. He runs the calls himself, so the person who quotes is the person accountable.</p></div>
          <div className="v2-tile"><p className="k"><Icon name="home" size={16} strokeWidth={2} />Founded</p><b>1952</b><p>74 years, family owned, now in its second generation.</p></div>
          <div className="v2-tile"><p className="k"><Icon name="shield" size={16} strokeWidth={2} />Permit record</p><b>0</b><p>Permits on record. Chicago doesn&apos;t permit HVAC repair, which is most of what we do.</p></div>
          <div className="v2-tile"><p className="k"><Icon name="clock" size={16} strokeWidth={2} />Hours</p><b>6 AM</b><p>Monday to Friday until 6 PM, Saturday until 3:30 PM.</p></div>
          <a className="v2-tile v2-gtile" href={design.gmaps} target="_blank" rel="noopener noreferrer">
            <span className="gc"><GLogo /></span><b>4.98<small>/5</small></b>
            <span className="gr"><span className="cs-stars" aria-hidden="true">★★★★★</span>204 Google reviews, as of 31 Aug 2026</span>
            <span className="k gk"><Icon name="check" size={14} strokeWidth={2.4} />Google rating</span>
          </a>
        </div>
      </div>
      <ul className="v2-promises">
        <li><span className="badge"><Icon name="user" size={20} /></span><h3>The owner on the call</h3><p>Rob still runs the calls and does the diagnosis on the jobs that need it.</p></li>
        <li><span className="badge"><Icon name="tool" size={20} /></span><h3>Repair first</h3><p>If the unit has years left, we say so and repair it.</p></li>
        <li><span className="badge"><Icon name="dollar" size={20} /></span><h3>The price before the work</h3><p>You hear the price before any work starts.</p></li>
      </ul>
    </section>
  )
}

// ── B4 Google reviews ──────────────────────────────────
function Reviews({ page, preview }: { page: AreaPageData; preview: boolean }) {
  const items = page.reviews?.items ?? []
  if (!items.length && !preview) return null
  const mapQ = design.shop.replace(/ /g, '+')
  return (
    <section className="cs-sec v2-stack" aria-labelledby="reviews-title">
      <Head eyebrow="What customers say" title={page.reviews?.heading} id="reviews-title" />
      <div className="v2-rev-grid">
        <aside className="v2-place">
          <div className="top">
            <p className="pt"><GLogo /><span><b>Google reviews</b><small>City &amp; Suburban Heating &amp; Cooling</small></span></p>
            <p className="score"><b>4.98</b><small>/5</small><span><span className="cs-stars" aria-hidden="true">★★★★★</span>204 reviews</span></p>
            <a className="v2-link" href={design.gmaps} target="_blank" rel="noopener noreferrer">Read all 204 reviews<Icon name="arrow" size={16} strokeWidth={2} /></a>
          </div>
          <iframe className="v2-map" title={`Map: City & Suburban, ${design.shop}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${mapQ}!6i15`} />
          <div className="bot"><b>City &amp; Suburban · 1225 N Cleaver St</b><a className="v2-link" href={design.gmaps} target="_blank" rel="noopener noreferrer">Open in Google Maps<Icon name="arrow" size={16} strokeWidth={2} /></a></div>
        </aside>
        {items.length
          ? <ul className="v2-reviews">{items.map((r) => <ReviewCard key={r._key} r={r} />)}</ul>
          : <p className="cs-confirm">[CONFIRM: add 4 verbatim Google reviews in B4 Reviews. This section is hidden on the published page until then.]</p>}
      </div>
      {page.reviews?.intro && <p className="v2-note"><Icon name="check" size={16} strokeWidth={2.2} />{page.reviews.intro}</p>}
    </section>
  )
}

// ── B5 Process ─────────────────────────────────────────
function Process({ page }: { page: AreaPageData }) {
  const steps = page.process?.steps ?? []
  if (!steps.length) return null
  return (
    <section className="cs-sec cs-fog v2-stack" aria-labelledby="process-title">
      <div className="v2-head-row">
        <Head eyebrow={`What happens when you call · ${steps.length} steps`} title={page.process?.heading} id="process-title" />
        <div className="v2-legend"><p>Who does the step</p><ul>
          <li className="who"><Icon name="user" size={14} strokeWidth={2} />You</li>
          <li className="who us"><Icon name="tool" size={14} strokeWidth={2} />City &amp; Suburban</li>
        </ul></div>
      </div>
      <StepsTrack steps={steps} />
    </section>
  )
}

// ── B9 Districts ───────────────────────────────────────
function Districts({ page }: { page: AreaPageData }) {
  const d = page.districts
  if (!d?.items?.length) return null
  const chips = [d.zips?.length ? `ZIP ${d.zips.join(' · ')}` : null, d.wards?.length ? `Wards ${d.wards.join(', ')}` : null, d.communityArea ?? null]
    .filter(Boolean) as string[]
  const areaQ = `${stegaClean(page.areaName) ?? ''}, Chicago, IL`.replace(/ /g, '+')
  const here = (h: string) => (stegaClean(h).startsWith('HVAC here') ? h : `HVAC here: ${h}`)
  return (
    <section className="cs-sec cs-navy v2-stack on-dark" aria-labelledby="districts-title">
      <div className="v2-head-row">
        <Head eyebrow={d.eyebrow ?? ''} title={d.heading} id="districts-title" />
        <ul className="v2-dchips">{chips.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <div className="v2-area-grid">
        <div className="v2-map-card">
          <iframe className="v2-map" title={`Map of ${stegaClean(page.areaName)}, Chicago`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${areaQ}!6i14`} />
          <a className="v2-shop" href={design.gmaps} target="_blank" rel="noopener noreferrer"><Icon name="van" size={18} /><span><b>Our shop</b>1225 N Cleaver St</span></a>
        </div>
        <ul className="v2-districts">
          {d.items.map((x) => (
            <li key={x._key}>
              <h3><Icon name="pin" size={16} strokeWidth={2} />{x.name}</h3>
              <p>{x.description}</p>
              {x.hvacHere && <p className="here">{here(x.hvacHere)}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── B11 Permit record ──────────────────────────────────
function Permits({ page }: { page: AreaPageData }) {
  const p = page.permits
  return (
    <section className="cs-sec cs-permits v2-permits on-dark" aria-labelledby="permits-title">
      <div className="v2-permits-copy">
        <p className="cs-eyebrow">The permit record, honestly</p>
        <h2 id="permits-title" className="cs-h2">Why you won&apos;t find us in the City&apos;s permit file</h2>
        <p>Chicago doesn&apos;t require a permit to repair, diagnose or maintain heating and cooling, which is most of what we do. The permit file measures construction, not service. So when a company waves a permit count at you, ask how much of their work is repair.</p>
      </div>
      <ul className="v2-nums">
        {typeof p?.areaCount === 'number' && <li><b>{p.areaCount}</b><span>{p.areaCaption}</span></li>}
        <li><b>1,539</b><span>Firms that pull HVAC permits citywide, across 4,888 permits in 24 months.</span></li>
        <li><b>0</b><span>Permits on record for City &amp; Suburban. We said we&apos;d be honest.</span></li>
      </ul>
    </section>
  )
}

// ── B12 FAQ ────────────────────────────────────────────
function Faq({ page }: { page: AreaPageData }) {
  const items = page.faq?.items ?? []
  if (!items.length) return null
  return (
    <section className="cs-sec v2-faq" aria-labelledby="faq-title">
      <div className="v2-faq-side">
        <Head eyebrow={`Questions · ${items.length}`} title={page.faq?.heading} id="faq-title" />
        <div className="v2-ask on-dark" style={scrim('linear-gradient(180deg,rgb(9 38 58 / 30%) 0%,rgb(9 38 58 / 92%) 70%)', design.images.hero)}>
          <p>Didn&apos;t find your question?</p>
          <a className="cs-btn cs-btn-red cs-btn-sm" href={design.tel}><Icon name="phone" size={16} strokeWidth={2} />Call {design.phone}</a>
        </div>
        <a className="v2-mini" href={design.gmaps} target="_blank" rel="noopener noreferrer"><GLogo /><span><b>4.98 <span className="cs-stars" aria-hidden="true">★★★★★</span></b><small>204 Google reviews</small></span></a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="v2-mini"><img src={design.images.seal} alt="" width={40} height={40} /><span><b>Family owned since 1952</b><small>Rob, the owner, still on the calls</small></span></div>
      </div>
      <div className="cs-faq-list v2-faq-list">
        {items.map((f, i) => (
          <details key={f._key} open={i === 0}>
            <summary><span className="n">{String(i + 1).padStart(2, '0')}</span><span className="q">{f.question}</span><span className="pm" aria-hidden="true" /></summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

// ── B13 Next step ──────────────────────────────────────
function NextStep({ page }: { page: AreaPageData }) {
  return (
    <section className="cs-sec v2-next on-dark" aria-labelledby="cta-title"
      style={scrim('linear-gradient(180deg,rgb(9 38 58 / 88%) 0%,var(--color-navy) 62%)', design.images.hero)}>
      <div className="v2-next-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="v2-logo-badge"><img src={design.images.logo} alt="City & Suburban Heating & Cooling" width={170} height={60} /></span>
        <p className="cs-eyebrow">Your next step</p>
        <h2 id="cta-title" className="cs-h2">{page.cta?.heading}</h2>
        {page.cta?.text && <p className="v2-lede">{page.cta.text}</p>}
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={design.tel}><Icon name="phone" size={18} strokeWidth={2} />Call {design.phone}</a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
      </div>
      <ul className="v2-proof">
        <li><a href={design.gmaps} target="_blank" rel="noopener noreferrer"><span className="gc"><GLogo /></span><span><b>4.98 <span className="cs-stars" aria-hidden="true">★★★★★</span></b><small>204 Google reviews</small></span></a></li>
        <li><span className="badge"><Icon name="home" size={18} /></span><span><b>1952</b><small>Founded, family owned</small></span></li>
        <li><span className="badge"><Icon name="user" size={18} /></span><span><b>Rob</b><small>The owner, on the calls</small></span></li>
        <li><span className="badge"><Icon name="clock" size={18} /></span><span><b>From 6 AM</b><small>Monday to Saturday</small></span></li>
      </ul>
    </section>
  )
}

function Credits({ slug }: { slug: string }) {
  const c = design.areaPhotos.includes(slug) ? design.credits[slug] : undefined
  return (
    <div className="cs-sec v2-credits"><details><summary>Photo credits</summary><ul>
      {c && <li>{c.caption}: {c.author} · {c.licence} · <a href={c.url} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></li>}
      <li>Van on a Chicago street: City &amp; Suburban, AI-generated illustrative image.</li>
      <li>Hero, AC service and furnace filter photos: from citysuburbanheating.com, illustrative.</li>
    </ul></details></div>
  )
}
