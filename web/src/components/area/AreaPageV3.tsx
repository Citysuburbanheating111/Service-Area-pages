/**
 * The service area page template (v3), driven by Sanity. Every area page renders through this one
 * component, so a design change here reaches every area, now and later.
 *
 * The design is the Paper master file https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG
 * (artboard "C&S — TEMPLATE West Loop area page v3"): the Highlights Chicago service area layout in
 * City & Suburban's design. Markup and values follow that artboard section for section; the styles are
 * assets/area-page-v3.css, synced by tools/sync_design_to_web.py. west-loop-v3.html is its 1:1 export.
 *
 * Two Sanity sources:
 * - `template`: the Service area template, ONE document shared by every page.
 * - `page`: one area page, with only what is specific to that area.
 * `others` is the list of published area pages (header menu, nearby fallback).
 *
 * `preview` is true only in draft mode (Sanity Presentation): it adds the "to confirm" bar and shows
 * placeholders where content isn't written yet. The published page leaves those parts out.
 */
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { areaPath, collectionPath } from '@/lib/siteUrl'
import { urlFor } from '@/sanity/lib/image'
import type { AreaListItem, AreaPageData } from '@/sanity/types'

import { design } from './design'
import { areaCity, fill, isSuburb, mergeFaq, telHref, type Template } from './template'
import { BookingForm } from './v3/BookingForm'
import { GoogleG, PartnerLine, RatingRow, TrustBand, WriteReview } from './v3/Brand'
import { LiveHeader } from './LiveChrome'
import { V3Footer } from './v3/Chrome'
import { ServicesTabs } from './v3/ServicesTabs'
import { Svg } from './v3/Svg'
import { ReviewTrack, StepTrack } from './v3/Track'

type Props = { page: AreaPageData; template: Template; others: AreaListItem[]; preview: boolean }
type P = { page: AreaPageData; t: Template }

const bg = (g: string, img: string) => ({ backgroundImage: `${g},url(${img})` })
const maps = (t: Template) => stegaClean(t.business.mapsUrl)
const nn = (i: number) => String(i + 1).padStart(2, '0')
const clean = (s?: string) => stegaClean(s) ?? ''
const sentence = (page: AreaPageData) => clean(page.areaNameInSentence) || clean(page.areaName)

export function AreaPageV3({ page, template: t, others, preview }: Props) {
  const slug = clean(page.slug)
  return (
    <>
      {preview && <div className="v3"><PreviewBar page={page} slug={slug} /></div>}
      {/* The live citysuburbanheating.com header, the same as on /service-areas; outside .v3 so the
          page's resets don't touch it */}
      <LiveHeader areas={others.map((o) => ({ name: clean(o.areaName), slug: clean(o.slug) })).filter((a) => a.slug)} current={slug} />
      <div className="v3">
        <main>
          <Hero page={page} t={t} toc={sections(page, t, preview)} />
          <Services page={page} t={t} />
          <About page={page} t={t} />
          <Reviews page={page} t={t} preview={preview} />
          <TrustBand trust={t.trust} />
          <Process t={t} />
          <Price page={page} t={t} />
          <Choose page={page} t={t} />
          <Companies page={page} t={t} />
          <Districts page={page} t={t} />
          <Buildings page={page} />
          <Nearby page={page} t={t} others={others.filter((o) => clean(o.slug) !== slug)} />
          <Permits page={page} t={t} />
          <Faq page={page} t={t} />
          <NextStep page={page} t={t} />
        </main>
        <V3Footer t={t} area={clean(page.areaName)} city={areaCity(page)} />
      </div>
    </>
  )
}

/** "On this page" links: only the sections this page actually shows */
function sections(page: AreaPageData, t: Template, preview: boolean) {
  const has = {
    reviews: !!page.reviews?.items?.length || preview,
    price: !!page.price?.factors?.length,
    area: !!page.districts?.items?.length,
    buildings: !!page.buildings?.types?.length,
    faq: !!mergeFaq(page.faq?.items, t, isSuburb(page)).own.length,
  }
  return [
    { id: 'services', label: 'All services' },
    { id: 'who', label: "Who you're calling" },
    has.reviews && { id: 'reviews', label: 'What customers say' },
    { id: 'process', label: 'What happens when you call' },
    has.price && { id: 'price', label: 'What changes the price' },
    { id: 'choose', label: 'How to choose' },
    { id: 'companies', label: 'Kinds of HVAC company' },
    has.area && { id: 'area', label: 'District by district' },
    has.buildings && { id: 'buildings', label: 'Your building type' },
    has.faq && { id: 'faq', label: 'Questions' },
  ].filter(Boolean) as { id: string; label: string }[]
}

/** Section heading: eyebrow and H2 on the left, a short note on the right (or under it, `solo`) */
function Head({ eyebrow, title, id, aside, solo, wide }: { eyebrow: string; title?: string; id: string; aside?: string; solo?: boolean; wide?: boolean }) {
  return (
    <div className={`v3-head${solo ? ' solo' : ''}${wide ? ' wide' : ''}`}>
      <div className="main">
        <p className="v3-eyebrow">{eyebrow}</p>
        <h2 id={id} className="v3-h2">{title}</h2>
        {solo && aside && <p className="v3-intro">{aside}</p>}
      </div>
      {!solo && aside && <p className="v3-aside">{aside}</p>}
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

const Stars = () => <span className="stars" aria-hidden="true">★★★★★</span>
// The real Google G in a white circle, for navy backgrounds
const G = ({ size = '' }: { size?: string }) => (
  <span className={`v3-g ${size}`} aria-hidden="true"><GoogleG size={size === 'lg' ? 30 : 18} /></span>
)

// ── Hero + booking form ────────────────────────────────
function Hero({ page, t, toc }: P & { toc: { id: string; label: string }[] }) {
  const hero = page.hero ?? {}
  const b = t.business
  const slug = clean(page.slug)
  const img = t.hero.image?.asset ? urlFor(t.hero.image).width(1920).quality(80).auto('format').url() : design.images.hero
  const places = [page.areaName, ...(page.districts?.items ?? []).map((d) => d.name)].filter(Boolean).slice(0, 4)
  const chips = [
    { icon: <Svg.shieldCheck size={16} />, text: b.licensing },
    { icon: <Svg.people size={16} />, text: t.hero.badges[0] },
    { icon: <Svg.clock size={16} />, text: t.hero.badges[1] },
  ].filter((c) => c.text)
  return (
    <section className="v3-hero" aria-labelledby="hero-title"
      style={bg('linear-gradient(90deg,rgb(9 38 58 / 94%) 0%,rgb(9 38 58 / 86%) 50%,rgb(9 38 58 / 55%) 100%)', img)}>
      <div className="copy">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol><li><a href={`${design.live}/`}>Home</a></li><li><Link href={collectionPath}>Service areas</Link></li><li aria-current="page">{page.areaName}</li></ol>
        </nav>
        <p className="v3-eyebrow light big">{places.join(' · ')}</p>
        <RatingRow rating={b.rating} count={b.reviewCount} mapsUrl={maps(t)} trust={t.trust} />
        <h1 id="hero-title">{hero.h1}</h1>
        {hero.lede && <p className="lede">{hero.lede}</p>}
        <ul className="trust" aria-label={`Why ${b.companyName}`}>
          {chips.map((c) => <li key={c.text}>{c.icon}<span>{c.text}</span></li>)}
        </ul>
        <div className="acts">
          <a className="v3-pill white" href={telHref(b.phone)}><Svg.phone size={16} />Call {b.phone}</a>
          <a className="v3-pill ghost" href="#request">Schedule service<Svg.arrow size={16} stroke="#FFFFFF" /></a>
        </div>
        <nav className="toc" aria-label="On this page">
          <p><span>On this page</span><small>{toc.length} sections</small></p>
          <ol>{toc.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><b>{nn(i)}</b><span>{s.label}</span></a></li>)}</ol>
        </nav>
      </div>
      <BookingForm
        title={hero.formTitle}
        area={clean(page.areaName)}
        city={areaCity(page)}
        promise={t.form.promise}
        buildingOptions={hero.buildingTypeOptions ?? []}
        defaultBuilding={hero.defaultBuildingType}
        issueOptions={t.form.issueOptions}
        crossStreets={design.cross[slug] ?? 'Street & cross street'}
        submitLabel={t.form.submitLabel}
        reassurance={t.form.reassurance}
        phone={b.phone}
        ownerName={b.ownerName}
      />
    </section>
  )
}

// ── All services ───────────────────────────────────────
function Services({ page, t }: P) {
  const count = design.groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <section className="v3-sec fog v3-services" aria-labelledby="services">
      <Head eyebrow={`All services · ${count} in ${design.groups.length} groups`} title={page.services?.heading} id="services" aside={t.services.intro} />
      <ServicesTabs groups={design.groups} />
      <PartnerLine trust={t.trust} />
    </section>
  )
}

// ── Who you're actually calling (van) ──────────────────
function About({ page, t }: P) {
  const b = t.business
  const a = t.about
  const facts = [
    { k: 'Owner', icon: <Svg.user size={14} />, v: b.ownerName, p: a.ownerTile },
    { k: 'Family owned', icon: <Svg.shield size={14} />, v: String(b.foundedYear), p: a.foundedTile },
    { k: 'Permit record', icon: <Svg.check size={14} />, v: t.permits.ourNumber, p: a.permitTile },
    { k: 'Working hours', icon: <Svg.clock size={14} />, v: b.hours, p: a.hoursTile },
  ]
  const how = [<Svg.search key="1" size={18} />, <Svg.docCheck key="2" size={18} />, <Svg.tag key="3" size={18} />]
  return (
    <section className="v3-sec navy v3-who" aria-labelledby="who">
      <Head eyebrow={a.eyebrow} title={a.heading?.includes('\n') ? a.heading : a.heading?.replace(/^(Who you're) /i, '$1\n')} id="who" aside={`${a.lead} ${page.owner?.paragraph ?? ''}`.trim()} />
      <div className="body">
        <figure className="van">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.van} alt={`A ${b.companyName} service van parked on a Chicago street at dusk, with the skyline behind it`} width={1235} height={848} loading="lazy" decoding="async" />
          <a className="addr" href={maps(t)} target="_blank" rel="noopener noreferrer"><Svg.pin size={14} />{b.addressShort}, Chicago</a>
        </figure>
        <div className="facts">
          {facts.map((f) => (
            <div key={f.k} className="fact"><p className="k">{f.icon}{f.k}</p><b>{f.v}</b><p>{f.p}</p></div>
          ))}
          <a className="fact rating" href={maps(t)} target="_blank" rel="noopener noreferrer">
            <G size="lg" />
            <b>{b.rating}<small>/5</small></b>
            <span className="rule" />
            <span className="gr"><Stars /><span>{b.reviewCount} Google reviews, as of {b.ratingAsOf}</span></span>
            <span className="k"><Svg.check size={13} width={3} />Google rating</span>
          </a>
        </div>
      </div>
      <div className="family">
        <div><p className="label">Family-owned</p><h3>{fill(a.familyHeading, clean(page.areaName))}</h3></div>
        <ol>{a.familyPoints.map((p, i) => <li key={p}><b>{nn(i)}</b><span>{p}</span></li>)}</ol>
      </div>
      <div className="how">
        <h3><span>How we work</span></h3>
        <ul>
          {a.promises.map((p, i) => (
            <li key={p._key}><span className="ic">{how[i % how.length]}</span><h4>{p.title}</h4><p>{p.text}</p></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── What customers say: review stats + verbatim reviews ─
function Reviews({ page, t, preview }: P & { preview: boolean }) {
  const items = page.reviews?.items ?? []
  if (!items.length && !preview) return null
  const r = t.reviews
  const b = t.business
  return (
    <section className="v3-sec v3-reviews-sec" aria-labelledby="reviews">
      <Head eyebrow={`Google reviews · all ${b.reviewCount} read`} title={r.statsHeading} id="reviews" aside={r.statsIntro?.replace('our Google reviews', `our ${b.reviewCount} Google reviews`)} />
      <ul className="v3-stats">
        {r.stats.map((s) => (
          <li key={s._key}>
            <b>{s.value}</b><span>{s.label}</span>
            <span className="row"><span className="bar" aria-hidden="true"><span style={{ width: `${s.percent}%` }} /></span><small>{s.percent}%</small></span>
          </li>
        ))}
      </ul>
      <p className="v3-note"><Svg.info size={14} stroke="#6A7782" />{r.statsNote}</p>
      {items.length
        ? <><ReviewTrack title={r.heading} rating={b.rating} count={b.reviewCount} items={items} /><WriteReview trust={t.trust} mapsUrl={maps(t)} /></>
        : <p className="cs-confirm">[CONFIRM: add 4 verbatim Google reviews. This section is hidden on the published page until then.]</p>}
    </section>
  )
}

// ── What happens when you call ─────────────────────────
function Process({ t }: { t: Template }) {
  const steps = t.process.steps
  return (
    <section className="v3-sec fog v3-process" aria-labelledby="process">
      <Head eyebrow={`The process · ${steps.length} steps`} title="What happens when you call" id="process" aside={t.process.heading} />
      <StepTrack steps={steps} />
    </section>
  )
}

// ── What changes the price ─────────────────────────────
function Price({ page, t }: P) {
  const factors = page.price?.factors ?? []
  if (!factors.length) return null
  const pr = t.price
  return (
    <section className="v3-sec v3-price" aria-labelledby="price">
      <Head eyebrow={`Scope & price · ${factors.length} factors`} title={page.price?.heading} id="price" aside={pr.intro} solo />
      <div className="pricing">
        <div className="how">
          <div><span className="ic"><Svg.tag size={20} stroke="#FFFFFF" /></span><h3>How we price</h3></div>
          <ul>{pr.howWePrice.map((p) => <li key={p}><Svg.check size={16} /><span>{p}</span></li>)}</ul>
        </div>
        <div className="median">
          <h3>{pr.medianQuestion}</h3>
          <p className="big"><b>{pr.medianValue}</b><small>Chicago median</small></p>
          <p>{pr.medianCaption}</p>
        </div>
      </div>
      <h3 className="factor-head">Factor · why it changes the work</h3>
      <ol className="factors">
        {factors.map((f, i) => <li key={f._key}><b>{nn(i)}</b><h4>{f.title}</h4><p>{f.text}</p></li>)}
      </ol>
    </section>
  )
}

// ── How to choose: the checks table ────────────────────
function Choose({ page, t }: P) {
  const c = t.choose
  return (
    <section className="v3-sec fog v3-choose" aria-labelledby="choose">
      <Head eyebrow={`${c.eyebrow} · ${c.questions.length} checks`} title={page.choose?.heading} id="choose" aside={c.lede} solo wide />
      <div className="table" role="table" aria-label="How to choose an HVAC company">
        <div className="tr th" role="row">
          <span role="columnheader">What to check</span>
          <span role="columnheader">Why it matters in {sentence(page)}</span>
          <span role="columnheader">How to verify it</span>
          <span role="columnheader" className="us">City &amp; Suburban&apos;s answer</span>
        </div>
        {c.questions.map((q, i) => (
          <div key={q._key} className="tr" role="row">
            <span role="cell" className="q"><small>{nn(i)}</small><b>{q.title}</b></span>
            <span role="cell">{isSuburb(page) && /permit/i.test(clean(q.title)) ? t.permits.suburbChooseText : q.text}</span>
            <span role="cell">{q.verify}</span>
            <span role="cell" className="us"><Svg.checkCircle size={16} stroke="#186AA4" /><span>{q.answer}</span></span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Kinds of HVAC company ──────────────────────────────
function Companies({ page, t }: P) {
  const c = t.companies
  return (
    <section className="v3-sec v3-companies" aria-labelledby="companies">
      <Head eyebrow={`${c.items.length} kinds of HVAC company`} title={c.heading} id="companies"
        aside="Service businesses can't be compared on features. They differ in how they're run, and that decides who answers the phone and how the price is set." />
      <ul className="cos">
        {c.items.map((x, i) => (
          <li key={x._key} className={x.us ? 'us' : undefined}>
            {x.us ? <span className="flag"><Svg.check size={10} stroke="#FFFFFF" width={3.5} />Where we fit</span> : <small>{nn(i)}</small>}
            <h3>{x.title}</h3>
            <dl>
              <dt>Who you talk to</dt><dd>{x.talkTo}</dd>
              <dt>How the price is set</dt><dd>{x.priceSet}</dd>
              <dt>Fits best when</dt><dd>{x.fitsWhen}</dd>
            </dl>
          </li>
        ))}
      </ul>
      <div className="fit">
        <span className="ic"><Svg.shieldCheck size={16} /></span>
        <div><p className="label">Where we fit, honestly</p><p>{fill(c.fitNote, sentence(page))}</p></div>
      </div>
    </section>
  )
}

// ── District by district ───────────────────────────────
function Districts({ page, t }: P) {
  const d = page.districts
  if (!d?.items?.length) return null
  const suburb = isSuburb(page)
  const place = clean(page.locality) || 'Chicago, IL'
  const areaQ = `${clean(page.areaName)}, ${place}`.replace(/ /g, '+')
  const here = (h: string) => clean(h).replace(/^HVAC here:\s*/i, '').replace(/^./, (ch) => ch.toUpperCase())
  const facts = [
    d.communityArea && { k: suburb ? 'Township' : 'Community area', v: d.communityArea },
    d.zips?.length && { k: 'ZIP codes', v: d.zips.join(', ') },
    d.wards?.length && { k: 'City wards', v: d.wards.join(', ') },
    { k: 'Our shop', v: `${t.business.addressShort}, Chicago` },
    suburb
      ? { k: 'Permits', v: `${clean(page.permits?.authority) || 'The village'}, which sets its own rules. Chicago's permit file doesn't cover ${clean(page.areaName)}` }
      : { k: 'Permits', v: 'City of Chicago Department of Buildings. HVAC repair, diagnosis and maintenance need no permit' },
  ].filter(Boolean) as { k: string; v: string }[]
  return (
    <section className="v3-sec navy v3-area" aria-labelledby="area">
      <Head eyebrow={`${d.eyebrow ?? 'Service area'} · ${d.items.length} districts`} title={d.heading} id="area" />
      <div className="row">
        <div className="map">
          <iframe title={`Map of ${clean(page.areaName)}, ${place}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${areaQ}!6i14`} />
          <p>District edges are approximate, because sources draw them differently.</p>
        </div>
        <dl className="facts">{facts.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      </div>
      <ol className="districts">
        {d.items.map((x, i) => (
          <li key={x._key}>
            <h3><b>{nn(i)}</b><span>{x.name}</span></h3>
            <p className="intro">{x.description}</p>
            {x.hvacHere && <><span className="rule" /><p className="k">What the HVAC work looks like</p><p className="here">{here(x.hvacHere)}</p></>}
          </li>
        ))}
      </ol>
    </section>
  )
}

// ── Your building type ─────────────────────────────────
function buildingIcon(tag = '', name = '') {
  const s = `${tag} ${name}`.toLowerCase()
  if (/commercial|restaurant|office|store|shop/.test(s)) return <Svg.store size={20} stroke="#186AA4" />
  if (/tower|high-rise|highrise/.test(s)) return <Svg.tower size={20} stroke="#186AA4" />
  if (/loft|warehouse|courtyard|apartment|greystone|flat/.test(s)) return <Svg.building size={20} stroke="#186AA4" />
  return <Svg.house size={20} stroke="#186AA4" />
}

function Buildings({ page }: { page: AreaPageData }) {
  const types = page.buildings?.types ?? []
  if (!types.length) return null
  return (
    <section className="v3-sec fog v3-buildings" aria-labelledby="buildings">
      <Head eyebrow={`Start here · ${types.length} building types`} title={page.buildings?.heading} id="buildings"
        aside="Find your building and see what heats and cools it." />
      <ul className="cards">
        {types.map((b) => (
          <li key={b._key}>
            <span className="ic">{buildingIcon(clean(b.tag), clean(b.name))}</span>
            <small>{b.tag}</small>
            <h3>{b.name}</h3>
            <span className="rule" />
            <p className="k">What heats and cools it</p>
            <p>{b.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Nearby: the area's own bordering neighborhoods, or else the other published area pages ──
function Nearby({ page, t, others }: { page: AreaPageData; t: Template; others: AreaListItem[] }) {
  const own = page.nearby?.items ?? []
  const published = new Map(others.map((o) => [clean(o.areaName).toLowerCase(), clean(o.slug)]))
  const cards = own.length
    ? own.map((x) => ({ key: x._key, name: x.name, text: x.text, slug: published.get(clean(x.name).toLowerCase()) }))
    : others.map((o) => ({ key: o._id, name: o.areaName, text: o.districts?.length ? o.districts.slice(0, 3).join(', ') : o.h1, slug: clean(o.slug) }))
  if (!cards.length) return null
  const n = t.nearby
  return (
    <section className="v3-sec v3-nearby" aria-labelledby="nearby">
      <Head eyebrow={`${own.length ? 'Nearby' : n.eyebrow} · ${cards.length} neighborhoods`} title={own.length ? `Neighborhoods next to ${sentence(page)}` : n.heading} id="nearby" aside={n.intro} />
      <ul className="cards">
        {cards.map((c) => {
          const body = <><h3><span>{c.name}</span><span className="go"><Svg.upRight size={11} /></span></h3><p>{c.text}</p></>
          return <li key={c.key}>{c.slug ? <Link href={areaPath(c.slug)}>{body}</Link> : <div>{body}</div>}</li>
        })}
      </ul>
    </section>
  )
}

// ── Permit record: data source, the area's bar graph, the honest context ──
const date = (iso?: string) =>
  iso ? new Date(`${clean(iso)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

function Permits({ page, t }: P) {
  const p = page.permits
  const s = t.permits
  if (isSuburb(page)) return <SuburbPermits page={page} t={t} />
  // Biggest first, so the graph reads top-down
  const rows = (p?.byEquipment ?? []).filter((r) => (r.count ?? 0) > 0).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
  const max = Math.max(1, ...rows.map((r) => r.count ?? 0))
  const source = p?.windowFrom && p?.windowTo && typeof p.totalPermits === 'number' && typeof p.areaCount === 'number'
    ? `City of Chicago building permits (dataset ydr8-5enu), ${date(p.windowFrom)} to ${date(p.windowTo)}, inside the ${clean(page.areaName)} boundary on this page: ${p.totalPermits.toLocaleString('en-US')} permits, of which ${p.areaCount} mention HVAC equipment. Shown as counts, never by address.`
    : ''
  return (
    <section className="v3-sec fog v3-permits" aria-labelledby="permits">
      <Head eyebrow={`${s.eyebrow} · ${page.areaName}`} title={s.heading} id="permits" aside={fill(s.intro, sentence(page))} solo />
      {source && <p className="source"><Svg.database size={16} stroke="#186AA4" /><b>Data source</b><span>{source}</span></p>}
      <div className="cards">
        {typeof p?.areaCount === 'number' && (
          <div className="area">
            <h3><span className="ic"><Svg.docCheck size={15} stroke="#FFFFFF" /></span>{page.areaName} HVAC permits, 24 months</h3>
            <p className="big"><b>{p.areaCount}</b><span>{p.areaCaption}</span></p>
            {rows.length > 0 && (
              <>
                <span className="rule" />
                <ul className="bars">
                  {rows.map((r) => (
                    <li key={r._key}><span className="l">{r.label}</span><span className="bar" aria-hidden="true"><span style={{ width: `${Math.round(((r.count ?? 0) / max) * 100)}%` }} /></span><b>{r.count}</b></li>
                  ))}
                </ul>
                <p className="small">A permit can name more than one kind of equipment, so the rows can add up to more than {p.areaCount}.</p>
              </>
            )}
          </div>
        )}
        <div className="honest">
          <h3><span className="ic"><Svg.info size={15} stroke="#186AA4" /></span>The honest context</h3>
          <p className="num"><b className="red">{s.ourNumber}</b><span>{s.ourCaption}</span></p>
          <p className="num"><b>{s.citywideNumber}</b><span>{s.citywideCaption}</span></p>
          <p className="text">{s.text}</p>
        </div>
      </div>
    </section>
  )
}

// A suburb: the City's permit file stops at the border and the village publishes no permit data,
// so the graph's card says so instead. The honest context stays.
function SuburbPermits({ page, t }: P) {
  const s = t.permits
  const area = sentence(page)
  const card = fill(s.suburbCard, area).replace(/\{authority\}/g, clean(page.permits?.authority) || 'The village')
  return (
    <section className="v3-sec fog v3-permits" aria-labelledby="permits">
      <Head eyebrow={`${s.eyebrow} · ${page.areaName}`} title={fill(s.suburbHeading, area)} id="permits" aside={fill(s.suburbIntro, area)} solo />
      <div className="cards">
        <div className="area">
          <h3><span className="ic"><Svg.docCheck size={15} stroke="#FFFFFF" /></span>{page.areaName} HVAC permits</h3>
          <p className="note">{card}</p>
        </div>
        <div className="honest">
          <h3><span className="ic"><Svg.info size={15} stroke="#186AA4" /></span>The honest context</h3>
          <p className="num"><b className="red">{s.ourNumber}</b><span>{s.ourCaption}</span></p>
          <p className="num"><b>{s.citywideNumber}</b><span>{s.citywideCaption}</span></p>
          <p className="text">{s.suburbText}</p>
        </div>
      </div>
    </section>
  )
}

// ── FAQ: the area's own questions, then the template's shared ones ──
function Faq({ page, t }: P) {
  const { own, items } = mergeFaq(page.faq?.items, t, isSuburb(page))
  if (!own.length) return null
  const b = t.business
  return (
    <section className="v3-sec v3-faq" aria-labelledby="faq">
      <div className="side">
        <div className="v3-head solo"><div className="main">
          <p className="v3-eyebrow">FAQs · {items.length} questions</p>
          <h2 id="faq" className="v3-h2">{page.faq?.heading}</h2>
        </div></div>
        <div className="ask" style={bg('linear-gradient(180deg,rgb(9 38 58 / 5%) 25%,rgb(9 38 58 / 92%) 100%)', design.images.acService)}>
          <p>Didn&apos;t find your question?</p>
          <a className="v3-pill white sm" href={telHref(b.phone)}><Svg.phone size={14} />Call {b.phone}</a>
        </div>
        <div className="proof">
          <a href={maps(t)} target="_blank" rel="noopener noreferrer"><span className="g"><GoogleG size={24} /></span><span><b>{b.rating} <Stars /></b><small>{b.reviewCount} Google reviews</small></span></a>
          <p><span className="ic"><Svg.shield size={13} width={2.4} /></span><span><b>Since {b.foundedYear}</b><small>Family owned, {b.licensing.replace(/^./, (c) => c.toLowerCase()).replace(/ technicians$/, '')}</small></span></p>
        </div>
      </div>
      <div className="list">
        {items.map((f, i) => (
          <details key={f._key} open={i === 0}>
            <summary><span className="n">{nn(i)}</span><span className="q">{f.question}</span><span className="pm" aria-hidden="true" /></summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

// ── Next step ──────────────────────────────────────────
function NextStep({ page, t }: P) {
  const b = t.business
  return (
    <section className="v3-sec v3-next" aria-labelledby="cta"
      style={bg('linear-gradient(90deg,rgb(9 38 58 / 96%) 0%,rgb(9 38 58 / 86%) 45%,rgb(9 38 58 / 55%) 100%)', design.images.van)}>
      <div className="copy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="v3-logo"><img src={design.images.logo} alt={b.companyName} width={125} height={44} /></span>
        <p className="v3-eyebrow light">{t.cta.eyebrow}</p>
        <h2 id="cta">{t.cta.heading}</h2>
        {page.cta?.text && <p className="lede">{page.cta.text}</p>}
        <div className="acts">
          <a className="v3-pill white" href={telHref(b.phone)}><Svg.phone size={16} />Call {b.phone}</a>
          <a className="v3-pill red" href="#request">Schedule service<Svg.arrow size={16} stroke="#FFFFFF" /></a>
        </div>
      </div>
      <ul className="proof">
        <li className="google"><a href={maps(t)} target="_blank" rel="noopener noreferrer"><b><G size="md" />{b.rating}<Stars /></b><small>{b.reviewCount} Google reviews</small></a></li>
        <li><b>{b.foundedYear}</b><small>Family owned, second generation</small></li>
        <li><b>{b.hours}</b><small>Working hours</small></li>
        <li><b>{b.ownerName}</b><small>The owner, on the calls</small></li>
      </ul>
      <div className="ready">
        <div><span className="ic"><Svg.clipboard size={20} stroke="#FFFFFF" /></span><h3>Have these ready when you call</h3>
          <a href={telHref(b.phone)}>Call {b.phone}<Svg.arrow size={13} stroke="#F08A80" /></a></div>
        <ol>{t.cta.checklist.map((c, i) => <li key={c}><b>{nn(i)}</b><span>{c}</span></li>)}</ol>
      </div>
    </section>
  )
}
