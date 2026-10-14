/**
 * The service area page template (v2), driven by Sanity. Every area page renders through this one
 * component, so a design change here reaches every area, now and later.
 *
 * Two Sanity sources:
 * - `template`: the Service area template, ONE document shared by every page (business facts, the
 *   hero photo, section intros, questions, company types, About tiles, process, permit record,
 *   shared FAQs). Edit it once and every page changes.
 * - `page`: one area page, with only what is specific to that area.
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
import { areaPath, collectionPath } from '@/lib/siteUrl'

import { fill, mergeFaq, telHref, type Template } from './template'

type Props = { page: AreaPageData; template: Template; preview: boolean }
type P = { page: AreaPageData; t: Template }

const scrim = (g: string, img: string) => ({ backgroundImage: `${g},url(${img})` })
const maps = (t: Template) => stegaClean(t.business.mapsUrl)

export function AreaPageV2({ page, template: t, preview }: Props) {
  const slug = stegaClean(page.slug) ?? ''
  return (
    <>
      {preview && <PreviewBar page={page} slug={slug} />}
      <LiveHeader />
      <div className="cs v2">
        <main>
          <Hero page={page} t={t} slug={slug} />
          <Picker page={page} />
          <Services page={page} t={t} />
          <Price page={page} t={t} />
          <Choose page={page} t={t} />
          <Companies t={t} />
          <About page={page} t={t} />
          <Reviews page={page} t={t} preview={preview} />
          <Process page={page} t={t} />
          <Districts page={page} t={t} />
          <Permits page={page} t={t} />
          <Faq page={page} t={t} />
          <NextStep page={page} t={t} />
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
        <a href={`/api/draft-mode/disable?redirect=${areaPath(slug)}`}>Exit preview</a>
      </summary>
      {notes.length > 0 && <ul>{notes.map((n) => <li key={n._key}><b>{n.block}</b>{n.note}</li>)}</ul>}
    </details>
  )
}

function Rating({ t, small = '/5' }: { t: Template; small?: string }) {
  return <><b>{t.business.rating}</b><small>{small}</small></>
}

// ── B1 Hero + request form ─────────────────────────────
function Hero({ page, t, slug }: P & { slug: string }) {
  const hero = page.hero ?? {}
  const b = t.business
  const img = t.hero.image?.asset ? urlFor(t.hero.image).width(1920).quality(80).auto('format').url() : design.images.hero
  const credit = design.areaPhotos.includes(slug) ? design.credits[slug] : undefined
  const strip = [
    ...(credit ? [{ src: `/cs-assets/areas/${slug}.webp`, cap: credit.caption }] : []),
    { src: design.images.acService, cap: 'A technician servicing an AC unit · Illustrative photo' },
    { src: design.images.furnaceFilter, cap: 'A furnace filter change · Illustrative photo' },
  ]
  return (
    <section className="v2-hero on-dark" aria-labelledby="hero-title"
      style={scrim('linear-gradient(90deg,rgb(9 38 58 / 95%) 0%,rgb(9 38 58 / 86%) 50%,rgb(9 38 58 / 45%) 100%)', img)}>
      <div className="v2-hero-copy">
        <nav className="cs-crumbs" aria-label="Breadcrumb">
          <ol><li><a href={`${design.live}/`}>Home</a></li><li><Link href={collectionPath}>Service area</Link></li><li aria-current="page">{page.areaName}</li></ol>
        </nav>
        <p className="cs-eyebrow v2-dot">Chicago · {page.areaName}</p>
        <h1 className="cs-h1" id="hero-title">{hero.h1}</h1>
        {hero.lede && <p className="cs-lede">{hero.lede}</p>}
        <ul className="v2-glass" aria-label={`Why ${b.companyName}`}>
          {t.hero.badges.map((badge, i) => (
            <li key={badge}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i === 0 ? <img src={design.images.seal} alt="" width={22} height={22} /> : <Icon name="check" size={16} strokeWidth={2.2} />}
              {badge}
            </li>
          ))}
          <li className="rt"><a href={maps(t)} target="_blank" rel="noopener noreferrer"><GLogo /><Rating t={t} /><span className="cs-stars" aria-hidden="true">★★★★★</span>{b.reviewCount} reviews</a></li>
        </ul>
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={telHref(b.phone)}><Icon name="phone" size={18} strokeWidth={2} />Call {b.phone}</a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
        <div className="v2-strip">
          <p className="v2-strip-title">{fill(t.hero.stripTitle, page.areaName)}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ul>{strip.map((s) => <li key={s.src}><img src={s.src} alt="" loading="lazy" decoding="async" /><span>{s.cap}</span></li>)}</ul>
        </div>
      </div>
      <RequestForm
        title={hero.formTitle}
        buildingOptions={hero.buildingTypeOptions ?? []}
        defaultBuilding={hero.defaultBuildingType}
        issueOptions={t.form.issueOptions}
        crossStreets={design.cross[slug] ?? 'Street & cross street'}
        promise={t.form.promise}
        submitLabel={t.form.submitLabel}
        reassurance={t.form.reassurance}
        phone={b.phone}
        ownerName={b.ownerName}
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
function Services({ page, t }: P) {
  return (
    <section className="cs-services" aria-labelledby="services-title">
      <div className="cs-services-head">
        <span className="cs-pill-light">{t.services.pill}</span>
        <h2 id="services-title">{page.services?.heading}</h2>
        <p>{t.services.intro}</p>
      </div>
      <ServicesTabs groups={design.groups} />
    </section>
  )
}

// ── B6 What changes the price ──────────────────────────
function Price({ page, t }: P) {
  const factors = page.price?.factors ?? []
  if (!factors.length) return null
  return (
    <section className="cs-sec v2-split" aria-labelledby="price-title">
      <div className="v2-split-side">
        <Head eyebrow={t.price.eyebrow} title={page.price?.heading} id="price-title" lede={t.price.intro} />
        <figure className="v2-tall">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.acService} alt="A technician tightening a refrigerant line valve on an outdoor AC unit" loading="lazy" decoding="async" />
          <span className="v2-badge"><b>{factors.length}</b><span>Things that<br />move the price</span></span>
          <figcaption>Illustrative photo</figcaption>
        </figure>
      </div>
      <ol className="v2-checklist">
        {factors.map((f, i) => (
          <li key={f._key}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span className="badge"><Icon name={design.factorIcons[i % design.factorIcons.length]} size={18} /></span>
            <div><h3>{f.title}</h3><p>{f.text}</p></div>
          </li>
        ))}
      </ol>
      <div className="v2-callout on-dark">
        <span className="badge"><Icon name="dollar" size={22} /></span>
        <div><b className="big">{t.price.medianValue}</b><p>{t.price.medianCaption}</p></div>
      </div>
    </section>
  )
}

// ── B7 How to choose ───────────────────────────────────
function Choose({ page, t }: P) {
  const qs = t.choose.questions
  return (
    <section className="cs-sec cs-fog v2-stack" aria-labelledby="choose-title">
      <Head eyebrow={t.choose.eyebrow} title={page.choose?.heading} id="choose-title" lede={t.choose.lede} />
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
function Companies({ t }: { t: Template }) {
  return (
    <section className="cs-sec v2-stack" aria-labelledby="companies-title">
      <Head eyebrow={t.companies.eyebrow} title={t.companies.heading} id="companies-title" />
      <ul className="v2-cos">
        {t.companies.items.map((c, i) => (
          <li key={c._key} className={`v2-co${c.us ? ' us' : ''}`}>
            {c.us && <span className="flag">This is us</span>}
            <span className="badge"><Icon name={design.companyIcons[i % design.companyIcons.length]} size={20} /></span>
            <h3>{c.title}</h3><p>{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── B3 About City & Suburban (van) ─────────────────────
function About({ page, t }: P) {
  const b = t.business
  const a = t.about
  return (
    <section className="cs-sec cs-navy v2-cred on-dark" aria-labelledby="owner-title">
      <div className="v2-head-row">
        <Head eyebrow={a.eyebrow} title={a.heading} id="owner-title" />
        <div className="v2-aside">
          <p><b>{a.lead}</b> {page.owner?.paragraph}</p>
          <div className="v2-names"><small>Names our reviewers remember</small><ul>{b.reviewerNames.map((n) => <li key={n}>{n}</li>)}</ul></div>
        </div>
      </div>
      <div className="v2-cred-grid">
        <figure className="v2-van">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.van} alt={`A ${b.companyName} service van parked on a Chicago street at dusk, with the skyline behind it`} width={1235} height={848} loading="lazy" decoding="async" />
          <figcaption>Illustrative image</figcaption>
          <a className="v2-addr" href={maps(t)} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={16} strokeWidth={2} />{b.addressShort}</a>
        </figure>
        <div className="v2-tiles">
          <div className="v2-tile"><p className="k"><Icon name="user" size={16} strokeWidth={2} />Owner</p><b>{b.ownerName}</b><p>{a.ownerTile}</p></div>
          <div className="v2-tile"><p className="k"><Icon name="home" size={16} strokeWidth={2} />Founded</p><b>{b.foundedYear}</b><p>{a.foundedTile}</p></div>
          <div className="v2-tile"><p className="k"><Icon name="shield" size={16} strokeWidth={2} />Permit record</p><b>{t.permits.ourNumber}</b><p>{a.permitTile}</p></div>
          <div className="v2-tile"><p className="k"><Icon name="clock" size={16} strokeWidth={2} />Hours</p><b>{b.hours}</b><p>{a.hoursTile}</p></div>
          <a className="v2-tile v2-gtile" href={maps(t)} target="_blank" rel="noopener noreferrer">
            <span className="gc"><GLogo /></span><Rating t={t} />
            <span className="gr"><span className="cs-stars" aria-hidden="true">★★★★★</span>{b.reviewCount} Google reviews, as of {b.ratingAsOf}</span>
            <span className="k gk"><Icon name="check" size={14} strokeWidth={2.4} />Google rating</span>
          </a>
        </div>
      </div>
      <ul className="v2-promises">
        {a.promises.map((p, i) => (
          <li key={p._key}><span className="badge"><Icon name={['user', 'tool', 'dollar'][i % 3]} size={20} /></span><h3>{p.title}</h3><p>{p.text}</p></li>
        ))}
      </ul>
    </section>
  )
}

// ── B4 Google reviews ──────────────────────────────────
function Reviews({ page, t, preview }: P & { preview: boolean }) {
  const items = page.reviews?.items ?? []
  if (!items.length && !preview) return null
  const b = t.business
  const mapQ = (stegaClean(b.addressFull) ?? '').replace(/ /g, '+')
  return (
    <section className="cs-sec v2-stack" aria-labelledby="reviews-title">
      <Head eyebrow={t.reviews.eyebrow} title={t.reviews.heading} id="reviews-title" />
      <div className="v2-rev-grid">
        <aside className="v2-place">
          <div className="top">
            <p className="pt"><GLogo /><span><b>Google reviews</b><small>{b.companyName}</small></span></p>
            <p className="score"><Rating t={t} /><span><span className="cs-stars" aria-hidden="true">★★★★★</span>{b.reviewCount} reviews</span></p>
            <a className="v2-link" href={maps(t)} target="_blank" rel="noopener noreferrer">Read all {b.reviewCount} reviews<Icon name="arrow" size={16} strokeWidth={2} /></a>
          </div>
          <iframe className="v2-map" title={`Map: ${stegaClean(b.companyName)}, ${stegaClean(b.addressFull)}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${mapQ}!6i15`} />
          <div className="bot"><b>City &amp; Suburban · {b.addressShort}</b><a className="v2-link" href={maps(t)} target="_blank" rel="noopener noreferrer">Open in Google Maps<Icon name="arrow" size={16} strokeWidth={2} /></a></div>
        </aside>
        {items.length
          ? <ul className="v2-reviews">{items.map((r) => <ReviewCard key={r._key} r={r} />)}</ul>
          : <p className="cs-confirm">[CONFIRM: add 4 verbatim Google reviews in B4 Reviews. This section is hidden on the published page until then.]</p>}
      </div>
      <p className="v2-note"><Icon name="check" size={16} strokeWidth={2.2} />{t.reviews.intro}</p>
    </section>
  )
}

// ── B5 Process ─────────────────────────────────────────
function Process({ t }: P) {
  const steps = t.process.steps
  return (
    <section className="cs-sec cs-fog v2-stack" aria-labelledby="process-title">
      <div className="v2-head-row">
        <Head eyebrow={`What happens when you call · ${steps.length} steps`} title={t.process.heading} id="process-title" />
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
function Districts({ page, t }: P) {
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
          <a className="v2-shop" href={maps(t)} target="_blank" rel="noopener noreferrer"><Icon name="van" size={18} /><span><b>Our shop</b>{t.business.addressShort}</span></a>
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
function Permits({ page, t }: P) {
  const p = page.permits
  const s = t.permits
  return (
    <section className="cs-sec cs-permits v2-permits on-dark" aria-labelledby="permits-title">
      <div className="v2-permits-copy">
        <p className="cs-eyebrow">{s.eyebrow}</p>
        <h2 id="permits-title" className="cs-h2">{s.heading}</h2>
        <p>{s.text}</p>
      </div>
      <ul className="v2-nums">
        {typeof p?.areaCount === 'number' && <li><b>{p.areaCount}</b><span>{p.areaCaption}</span></li>}
        <li><b>{s.citywideNumber}</b><span>{s.citywideCaption}</span></li>
        <li><b>{s.ourNumber}</b><span>{s.ourCaption}</span></li>
      </ul>
    </section>
  )
}

// ── B12 FAQ: the area's own questions, then the template's shared ones ──
function Faq({ page, t }: P) {
  const { own, items } = mergeFaq(page.faq?.items, t)
  if (!own.length) return null
  const b = t.business
  return (
    <section className="cs-sec v2-faq" aria-labelledby="faq-title">
      <div className="v2-faq-side">
        <Head eyebrow={`Questions · ${items.length}`} title={page.faq?.heading} id="faq-title" />
        <div className="v2-ask on-dark" style={scrim('linear-gradient(180deg,rgb(9 38 58 / 30%) 0%,rgb(9 38 58 / 92%) 70%)', design.images.hero)}>
          <p>Didn&apos;t find your question?</p>
          <a className="cs-btn cs-btn-red cs-btn-sm" href={telHref(b.phone)}><Icon name="phone" size={16} strokeWidth={2} />Call {b.phone}</a>
        </div>
        <a className="v2-mini" href={maps(t)} target="_blank" rel="noopener noreferrer"><GLogo /><span><b>{b.rating} <span className="cs-stars" aria-hidden="true">★★★★★</span></b><small>{b.reviewCount} Google reviews</small></span></a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="v2-mini"><img src={design.images.seal} alt="" width={40} height={40} /><span><b>Family owned since {b.foundedYear}</b><small>{b.ownerName}, the owner, still on the calls</small></span></div>
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
function NextStep({ page, t }: P) {
  const b = t.business
  return (
    <section className="cs-sec v2-next on-dark" aria-labelledby="cta-title"
      style={scrim('linear-gradient(180deg,rgb(9 38 58 / 88%) 0%,var(--color-navy) 62%)', design.images.hero)}>
      <div className="v2-next-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="v2-logo-badge"><img src={design.images.logo} alt={b.companyName} width={170} height={60} /></span>
        <p className="cs-eyebrow">{t.cta.eyebrow}</p>
        <h2 id="cta-title" className="cs-h2">{t.cta.heading}</h2>
        {page.cta?.text && <p className="v2-lede">{page.cta.text}</p>}
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={telHref(b.phone)}><Icon name="phone" size={18} strokeWidth={2} />Call {b.phone}</a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
      </div>
      <ul className="v2-proof">
        <li><a href={maps(t)} target="_blank" rel="noopener noreferrer"><span className="gc"><GLogo /></span><span><b>{b.rating} <span className="cs-stars" aria-hidden="true">★★★★★</span></b><small>{b.reviewCount} Google reviews</small></span></a></li>
        <li><span className="badge"><Icon name="home" size={18} /></span><span><b>{b.foundedYear}</b><small>Founded, family owned</small></span></li>
        <li><span className="badge"><Icon name="user" size={18} /></span><span><b>{b.ownerName}</b><small>The owner, on the calls</small></span></li>
        <li><span className="badge"><Icon name="clock" size={18} /></span><span><b>{b.hours}</b><small>Working hours</small></span></li>
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
