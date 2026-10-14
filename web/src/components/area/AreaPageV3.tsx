/**
 * The service area page template (v3), driven by Sanity. Every area page renders through this one
 * component, so a design change here reaches every area, now and later.
 *
 * Layout: the Highlights Chicago service area page (highlightschicago.com/service-areas/evanston),
 * section for section, in City & Suburban's design system. The approved design is the Paper file
 * https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG/p-1-0, exported 1:1 as west-loop-v3.html
 * on the design-system site; the styles are assets/area-page-v3.css, synced by tools/sync_design_to_web.py.
 *
 * Two Sanity sources, as in v2:
 * - `template`: the Service area template, ONE document shared by every page.
 * - `page`: one area page, with only what is specific to that area.
 * `others` is the list of published area pages, for "Other neighborhoods we serve".
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
import { GLogo, Icon } from './Icon'
import { LiveFooter, LiveHeader } from './LiveChrome'
import { RequestForm } from './RequestForm'
import { ReviewCard } from './ReviewCard'
import { ServicesTabs } from './ServicesTabs'
import { StepsTrack } from './StepsTrack'
import { fill, mergeFaq, telHref, type Template } from './template'

type Props = { page: AreaPageData; template: Template; others: AreaListItem[]; preview: boolean }
type P = { page: AreaPageData; t: Template }

const scrim = (g: string, img: string) => ({ backgroundImage: `${g},url(${img})` })
const maps = (t: Template) => stegaClean(t.business.mapsUrl)
const nn = (i: number) => String(i + 1).padStart(2, '0')
const clean = (s?: string) => stegaClean(s) ?? ''

export function AreaPageV3({ page, template: t, others, preview }: Props) {
  const slug = clean(page.slug)
  const toc = sections(page, t, preview)
  return (
    <>
      {preview && <PreviewBar page={page} slug={slug} />}
      <LiveHeader />
      <div className="cs v3">
        <main>
          <Hero page={page} t={t} toc={toc} />
          <Services page={page} t={t} />
          <About page={page} t={t} />
          <Reviews page={page} t={t} preview={preview} />
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
      </div>
      <LiveFooter />
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
    faq: !!mergeFaq(page.faq?.items, t).own.length,
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

function Head({ eyebrow, title, id, aside, wide }: { eyebrow: string; title?: string; id: string; aside?: string; wide?: boolean }) {
  return (
    <div className={`v3-head${aside ? '' : ' solo'}${wide ? ' wide' : ''}`}>
      <div>
        <p className="v3-eyebrow">{eyebrow}</p>
        <h2 id={id} className="v3-h2">{title}</h2>
      </div>
      {aside && <p className="v3-aside">{aside}</p>}
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

function Stars() {
  return <span className="cs-stars" aria-hidden="true">★★★★★</span>
}

// ── Hero + request form ────────────────────────────────
function Hero({ page, t, toc }: P & { toc: { id: string; label: string }[] }) {
  const hero = page.hero ?? {}
  const b = t.business
  const slug = clean(page.slug)
  const img = t.hero.image?.asset ? urlFor(t.hero.image).width(1920).quality(80).auto('format').url() : design.images.hero
  const places = [page.areaName, ...(page.districts?.items ?? []).map((d) => d.name)].filter(Boolean).slice(0, 4)
  const chips = [b.licensing, ...t.hero.badges]
  return (
    <section className="v3-hero on-dark" aria-labelledby="hero-title"
      style={scrim('linear-gradient(90deg,rgb(9 38 58 / 94%) 0%,rgb(9 38 58 / 86%) 50%,rgb(9 38 58 / 55%) 100%)', img)}>
      <div className="v3-hero-copy">
        <nav className="v3-crumbs" aria-label="Breadcrumb">
          <ol><li><a href={`${design.live}/`}>Home</a></li><li><Link href={collectionPath}>Service areas</Link></li><li aria-current="page">{page.areaName}</li></ol>
        </nav>
        <p className="v3-eyebrow">{places.join(' · ')}</p>
        <h1 className="v3-h1" id="hero-title">{hero.h1}</h1>
        {hero.lede && <p className="v3-lede">{hero.lede}</p>}
        <ul className="v3-trust" aria-label={`Why ${b.companyName}`}>
          {chips.map((c, i) => (
            <li key={c}><Icon name={['shield', 'home', 'check'][i % 3]} size={16} strokeWidth={2} />{c}</li>
          ))}
          <li className="rt"><a href={maps(t)} target="_blank" rel="noopener noreferrer"><span className="gc"><GLogo /></span><b>{b.rating}</b><small>/5</small><Stars />{b.reviewCount} Google reviews</a></li>
        </ul>
        <div className="v3-actions">
          <a className="v3-btn white" href={telHref(b.phone)}><Icon name="phone" size={16} strokeWidth={2} />Call {b.phone}</a>
          <a className="v3-btn ghost" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
        <nav className="v3-toc" aria-label="On this page">
          <p><span>On this page</span><small>{toc.length} sections</small></p>
          <ol>{toc.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><b>{nn(i)}</b>{s.label}</a></li>)}</ol>
        </nav>
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

// ── All services ───────────────────────────────────────
function Services({ page, t }: P) {
  const count = design.groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <section className="v3-sec fog" aria-labelledby="services">
      <Head eyebrow={`All services · ${count} in ${design.groups.length} groups`} title={page.services?.heading} id="services" aside={t.services.intro} />
      <ServicesTabs groups={design.groups} />
    </section>
  )
}

// ── Who you're actually calling (van) ──────────────────
function About({ page, t }: P) {
  const b = t.business
  const a = t.about
  const facts = [
    { k: 'Owner', icon: 'user', v: b.ownerName, p: a.ownerTile },
    { k: 'Family owned', icon: 'home', v: String(b.foundedYear), p: a.foundedTile },
    { k: 'Permit record', icon: 'shield', v: t.permits.ourNumber, p: a.permitTile },
    { k: 'Working hours', icon: 'clock', v: b.hours, p: a.hoursTile },
  ]
  return (
    <section className="v3-sec navy on-dark" aria-labelledby="who">
      <Head eyebrow={a.eyebrow} title={a.heading} id="who" aside={`${a.lead} ${page.owner?.paragraph ?? ''}`.trim()} />
      <div className="v3-who">
        <figure className="v3-van">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.van} alt={`A ${b.companyName} service van parked on a Chicago street at dusk, with the skyline behind it`} width={1235} height={848} loading="lazy" decoding="async" />
          <a className="v3-addr" href={maps(t)} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={14} strokeWidth={2} />{b.addressShort}, Chicago</a>
        </figure>
        <div className="v3-facts">
          {facts.map((f) => (
            <div key={f.k} className="v3-fact"><p className="k"><Icon name={f.icon} size={14} strokeWidth={2} />{f.k}</p><b>{f.v}</b><p>{f.p}</p></div>
          ))}
          <a className="v3-fact v3-grating" href={maps(t)} target="_blank" rel="noopener noreferrer">
            <span className="gc"><GLogo /></span>
            <b>{b.rating}<small>/5</small></b>
            <span className="gr"><Stars />{b.reviewCount} Google reviews, as of {b.ratingAsOf}</span>
            <span className="k"><Icon name="check" size={13} strokeWidth={2.6} />Google rating</span>
          </a>
        </div>
      </div>
      <div className="v3-family">
        <div><p className="v3-label">Family-owned</p><h3>{fill(a.familyHeading, clean(page.areaName))}</h3></div>
        <ol>{a.familyPoints.map((p, i) => <li key={p}><b>{nn(i)}</b>{p}</li>)}</ol>
      </div>
      <div className="v3-how">
        <h3><span>How we work</span></h3>
        <ul>
          {a.promises.map((p, i) => (
            <li key={p._key}><span className="badge"><Icon name={['question', 'tool', 'tag'][i % 3]} size={18} /></span><h4>{p.title}</h4><p>{p.text}</p></li>
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
    <section className="v3-sec" aria-labelledby="reviews">
      <Head eyebrow={`Google reviews · all ${b.reviewCount} read`} title={r.statsHeading} id="reviews" aside={r.statsIntro} />
      <ul className="v3-stats">
        {r.stats.map((s) => (
          <li key={s._key}>
            <b>{s.value}</b><span>{s.label}</span>
            <span className="bar" aria-hidden="true"><span style={{ width: `${s.percent}%` }} /></span><small>{s.percent}%</small>
          </li>
        ))}
      </ul>
      <p className="v3-note"><Icon name="question" size={14} />{r.statsNote}</p>
      <div className="v3-row-head">
        <h3>{r.heading}</h3>
        <a href={maps(t)} target="_blank" rel="noopener noreferrer"><GLogo /><b>{b.rating}</b>· {b.reviewCount} Google reviews</a>
      </div>
      {items.length
        ? <ul className="v3-reviews">{items.map((x) => <ReviewCard key={x._key} r={x} />)}</ul>
        : <p className="cs-confirm">[CONFIRM: add 4 verbatim Google reviews. This section is hidden on the published page until then.]</p>}
      <p className="v3-note"><Icon name="check" size={14} strokeWidth={2.2} />{r.intro}</p>
    </section>
  )
}

// ── What happens when you call ─────────────────────────
function Process({ t }: { t: Template }) {
  const steps = t.process.steps
  return (
    <section className="v3-sec fog" aria-labelledby="process">
      <Head eyebrow={`The process · ${steps.length} steps`} title="What happens when you call" id="process" aside={t.process.heading} />
      <StepsTrack steps={steps} />
    </section>
  )
}

// ── What changes the price ─────────────────────────────
function Price({ page, t }: P) {
  const factors = page.price?.factors ?? []
  if (!factors.length) return null
  const pr = t.price
  return (
    <section className="v3-sec" aria-labelledby="price">
      <div className="v3-head solo wide">
        <div>
          <p className="v3-eyebrow">Scope &amp; price · {factors.length} factors</p>
          <h2 id="price" className="v3-h2">{page.price?.heading}</h2>
          <p className="v3-aside">{pr.intro}</p>
        </div>
      </div>
      <div className="v3-pricing">
        <div className="v3-howprice on-dark">
          <div><span className="badge red"><Icon name="tag" size={20} /></span><h3>How we price</h3></div>
          <ul>{pr.howWePrice.map((p) => <li key={p}><Icon name="check" size={16} strokeWidth={2.4} />{p}</li>)}</ul>
        </div>
        <div className="v3-median">
          <h3>{pr.medianQuestion}</h3>
          <p className="big"><b>{pr.medianValue}</b><small>Chicago median</small></p>
          <p>{pr.medianCaption}</p>
        </div>
      </div>
      <div className="v3-row-head line"><h3>Factor · why it changes the work</h3></div>
      <ol className="v3-factors">
        {factors.map((f, i) => (
          <li key={f._key}><b>{nn(i)}</b><h4>{f.title}</h4><p>{f.text}</p></li>
        ))}
      </ol>
    </section>
  )
}

// ── How to choose: the checks table ────────────────────
function Choose({ page, t }: P) {
  const c = t.choose
  const area = clean(page.areaNameInSentence) || clean(page.areaName)
  return (
    <section className="v3-sec fog" aria-labelledby="choose">
      <div className="v3-head solo wide">
        <div>
          <p className="v3-eyebrow">{c.eyebrow} · {c.questions.length} checks</p>
          <h2 id="choose" className="v3-h2">{page.choose?.heading}</h2>
          <p className="v3-aside">{c.lede}</p>
        </div>
      </div>
      <div className="v3-table" role="table" aria-label="How to choose an HVAC company">
        <div className="tr th" role="row">
          <span role="columnheader">What to check</span>
          <span role="columnheader">Why it matters in {area}</span>
          <span role="columnheader">How to verify it</span>
          <span role="columnheader" className="us">{t.business.companyName.replace(/ Heating.*$/, '')}&apos;s answer</span>
        </div>
        {c.questions.map((q, i) => (
          <div key={q._key} className="tr" role="row">
            <span role="cell" className="q"><small>{nn(i)}</small>{q.title}</span>
            <span role="cell">{q.text}</span>
            <span role="cell">{q.verify}</span>
            <span role="cell" className="us"><Icon name="check" size={15} strokeWidth={2.4} />{q.answer}</span>
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
    <section className="v3-sec" aria-labelledby="companies">
      <Head eyebrow={`${c.items.length} kinds of HVAC company`} title={c.heading} id="companies"
        aside="Service businesses can't be compared on features. They differ in how they're run, and that decides who answers the phone and how the price is set." />
      <ul className="v3-cos">
        {c.items.map((x, i) => (
          <li key={x._key} className={x.us ? 'us on-dark' : undefined}>
            {x.us ? <span className="flag"><Icon name="check" size={11} strokeWidth={3} />Where we fit</span> : <small>{nn(i)}</small>}
            <h3>{x.title}</h3>
            <dl>
              <dt>Who you talk to</dt><dd>{x.talkTo}</dd>
              <dt>How the price is set</dt><dd>{x.priceSet}</dd>
              <dt>Fits best when</dt><dd>{x.fitsWhen}</dd>
            </dl>
          </li>
        ))}
      </ul>
      <div className="v3-fit">
        <span className="badge"><Icon name="shield" size={16} strokeWidth={2} /></span>
        <div><p className="v3-label">Where we fit, honestly</p><p>{fill(c.fitNote, clean(page.areaNameInSentence) || clean(page.areaName))}</p></div>
      </div>
    </section>
  )
}

// ── District by district ───────────────────────────────
function Districts({ page, t }: P) {
  const d = page.districts
  if (!d?.items?.length) return null
  const areaQ = `${clean(page.areaName)}, Chicago, IL`.replace(/ /g, '+')
  const here = (h: string) => clean(h).replace(/^HVAC here:\s*/i, '').replace(/^./, (c) => c.toUpperCase())
  const facts = [
    d.communityArea && { k: 'Community area', v: d.communityArea },
    d.zips?.length && { k: 'ZIP codes', v: d.zips.join(', ') },
    d.wards?.length && { k: 'City wards', v: d.wards.join(', ') },
    { k: 'Our shop', v: `${t.business.addressShort}, Chicago` },
    { k: 'Permits', v: 'City of Chicago Department of Buildings. HVAC repair, diagnosis and maintenance need no permit' },
  ].filter(Boolean) as { k: string; v: string }[]
  return (
    <section className="v3-sec navy on-dark" aria-labelledby="area">
      <Head eyebrow={`${d.eyebrow ?? 'Service area'} · ${d.items.length} districts`} title={d.heading} id="area" />
      <div className="v3-area">
        <div className="v3-map">
          <iframe title={`Map of ${clean(page.areaName)}, Chicago`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${areaQ}!6i14`} />
          <p>District edges are approximate, because sources draw them differently.</p>
        </div>
        <dl className="v3-area-facts">{facts.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      </div>
      <ol className="v3-districts">
        {d.items.map((x, i) => (
          <li key={x._key}>
            <h3><b>{nn(i)}</b>{x.name}</h3>
            <p>{x.description}</p>
            {x.hvacHere && <><p className="k">What the HVAC work looks like</p><p className="here">{here(x.hvacHere)}</p></>}
          </li>
        ))}
      </ol>
    </section>
  )
}

// ── Your building type ─────────────────────────────────
function Buildings({ page }: { page: AreaPageData }) {
  const types = page.buildings?.types ?? []
  if (!types.length) return null
  return (
    <section className="v3-sec fog" aria-labelledby="buildings">
      <Head eyebrow={`Start here · ${types.length} building types`} title={page.buildings?.heading} id="buildings"
        aside="Find your building and see what heats and cools it." />
      <ul className="v3-buildings">
        {types.map((b) => (
          <li key={b._key}>
            <span className="badge"><Icon name={/commercial|restaurant|office|store/i.test(clean(`${b.tag} ${b.name}`)) ? 'store' : 'home'} size={20} /></span>
            <small>{b.tag}</small>
            <h3>{b.name}</h3>
            <p className="k">What heats and cools it</p>
            <p>{b.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Nearby: the area's own bordering neighbourhoods, or else the other published area pages ──
function Nearby({ page, t, others }: { page: AreaPageData; t: Template; others: AreaListItem[] }) {
  const own = page.nearby?.items ?? []
  const published = new Map(others.map((o) => [clean(o.areaName).toLowerCase(), clean(o.slug)]))
  const cards = own.length
    ? own.map((x) => ({ key: x._key, name: x.name, text: x.text, slug: published.get(clean(x.name).toLowerCase()) }))
    : others.map((o) => ({ key: o._id, name: o.areaName, text: o.districts?.length ? o.districts.slice(0, 3).join(', ') : o.h1, slug: clean(o.slug) }))
  if (!cards.length) return null
  const n = t.nearby
  const area = clean(page.areaNameInSentence) || clean(page.areaName)
  return (
    <section className="v3-sec" aria-labelledby="nearby">
      <Head eyebrow={`${own.length ? 'Nearby' : n.eyebrow} · ${cards.length} neighborhoods`} title={own.length ? `Neighborhoods next to ${area}` : n.heading} id="nearby" aside={n.intro} />
      <ul className="v3-nearby">
        {cards.map((c) => {
          const body = (
            <>
              <h3>{c.name}{c.slug && <span className="go"><Icon name="arrow" size={12} strokeWidth={2.4} /></span>}</h3>
              <p>{c.text}</p>
            </>
          )
          return <li key={c.key}>{c.slug ? <Link href={areaPath(c.slug)}>{body}</Link> : <div>{body}</div>}</li>
        })}
      </ul>
    </section>
  )
}

// ── Permit record ──────────────────────────────────────
const date = (iso?: string) =>
  iso ? new Date(`${clean(iso)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

function Permits({ page, t }: P) {
  const p = page.permits
  const s = t.permits
  const area = clean(page.areaNameInSentence) || clean(page.areaName)
  // Biggest first, so the graph reads top-down
  const rows = (p?.byEquipment ?? []).filter((r) => (r.count ?? 0) > 0).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
  const max = Math.max(1, ...rows.map((r) => r.count ?? 0))
  const source = p?.windowFrom && p?.windowTo && typeof p.totalPermits === 'number' && typeof p.areaCount === 'number'
    ? `City of Chicago building permits (dataset ydr8-5enu), ${date(p.windowFrom)} to ${date(p.windowTo)}, inside the ${clean(page.areaName)} boundary on this page: ${p.totalPermits.toLocaleString('en-US')} permits, of which ${p.areaCount} mention HVAC equipment. Shown as counts, never by address.`
    : ''
  return (
    <section className="v3-sec fog" aria-labelledby="permits">
      <div className="v3-head solo wide">
        <div>
          <p className="v3-eyebrow">{s.eyebrow} · {page.areaName}</p>
          <h2 id="permits" className="v3-h2">{s.heading}</h2>
          <p className="v3-aside">{fill(s.intro, area)}</p>
        </div>
      </div>
      {source && (
        <p className="v3-source"><Icon name="shield" size={16} /><b>Data source</b><span>{source}</span></p>
      )}
      <div className="v3-permits">
        {typeof p?.areaCount === 'number' && (
          <div className="v3-permit-area on-dark">
            <h3><span className="badge red"><Icon name="shield" size={16} strokeWidth={2} /></span>{page.areaName} HVAC permits, 24 months</h3>
            <p className="big"><b>{p.areaCount}</b><span>{p.areaCaption}</span></p>
            {rows.length > 0 && (
              <>
                <ul className="v3-bars">
                  {rows.map((r) => (
                    <li key={r._key}><span>{r.label}</span><span className="bar" aria-hidden="true"><span style={{ width: `${((r.count ?? 0) / max) * 100}%` }} /></span><b>{r.count}</b></li>
                  ))}
                </ul>
                <p className="small">A permit can name more than one kind of equipment, so the rows can add up to more than {p.areaCount}.</p>
              </>
            )}
          </div>
        )}
        <div className="v3-honest">
          <h3><span className="badge"><Icon name="question" size={16} /></span>The honest context</h3>
          <p className="num"><b className="red">{s.ourNumber}</b><span>{s.ourCaption}</span></p>
          <p className="num"><b>{s.citywideNumber}</b><span>{s.citywideCaption}</span></p>
          <p>{s.text}</p>
        </div>
      </div>
    </section>
  )
}

// ── FAQ: the area's own questions, then the template's shared ones ──
function Faq({ page, t }: P) {
  const { own, items } = mergeFaq(page.faq?.items, t)
  if (!own.length) return null
  const b = t.business
  return (
    <section className="v3-sec v3-faq" aria-labelledby="faq">
      <div className="v3-faq-side">
        <p className="v3-eyebrow">FAQs · {items.length} questions</p>
        <h2 id="faq" className="v3-h2">{page.faq?.heading}</h2>
        <div className="v3-ask on-dark" style={scrim('linear-gradient(180deg,rgb(9 38 58 / 5%) 25%,rgb(9 38 58 / 92%) 100%)', design.images.acService)}>
          <p>Didn&apos;t find your question?</p>
          <a className="v3-btn white sm" href={telHref(b.phone)}><Icon name="phone" size={14} strokeWidth={2} />Call {b.phone}</a>
        </div>
        <div className="v3-proof-card">
          <a href={maps(t)} target="_blank" rel="noopener noreferrer"><GLogo /><span><b>{b.rating} <Stars /></b><small>{b.reviewCount} Google reviews</small></span></a>
          <p><span className="badge red-tint"><Icon name="shield" size={14} strokeWidth={2.2} /></span><span><b>Since {b.foundedYear}</b><small>Family owned. {b.licensing}</small></span></p>
        </div>
      </div>
      <div className="v3-faq-list">
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
    <section className="v3-sec v3-next on-dark" aria-labelledby="cta"
      style={scrim('linear-gradient(90deg,rgb(9 38 58 / 96%) 0%,rgb(9 38 58 / 86%) 45%,rgb(9 38 58 / 55%) 100%)', design.images.van)}>
      <div className="v3-next-copy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="v3-logo"><img src={design.images.logo} alt={b.companyName} width={125} height={44} /></span>
        <p className="v3-eyebrow">{t.cta.eyebrow}</p>
        <h2 id="cta" className="v3-h2">{t.cta.heading}</h2>
        {page.cta?.text && <p className="v3-lede">{page.cta.text}</p>}
        <div className="v3-actions">
          <a className="v3-btn white" href={telHref(b.phone)}><Icon name="phone" size={16} strokeWidth={2} />Call {b.phone}</a>
          <a className="v3-btn red" href="#request">Schedule service<Icon name="arrow" size={16} strokeWidth={2} /></a>
        </div>
      </div>
      <ul className="v3-proof">
        <li><a href={maps(t)} target="_blank" rel="noopener noreferrer"><b><span className="gc"><GLogo /></span>{b.rating}<Stars /></b><small>{b.reviewCount} Google reviews</small></a></li>
        <li><b>{b.foundedYear}</b><small>Family owned, second generation</small></li>
        <li><b>{b.hours}</b><small>Working hours</small></li>
        <li><b>{b.ownerName}</b><small>The owner, on the calls</small></li>
      </ul>
      <div className="v3-ready">
        <div><span className="badge red"><Icon name="check" size={20} strokeWidth={2.2} /></span><h3>Have these ready when you call</h3>
          <a href={telHref(b.phone)}>Call {b.phone}<Icon name="arrow" size={13} strokeWidth={2.2} /></a></div>
        <ol>{t.cta.checklist.map((c, i) => <li key={c}><b>{nn(i)}</b>{c}</li>)}</ol>
      </div>
    </section>
  )
}
