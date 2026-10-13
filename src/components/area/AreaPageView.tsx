/**
 * The universal service area page template. Every area page renders through this one component,
 * in the playbook's fixed order (Part C): G1, G2, B1–B13 (no B8 variation), G3.
 *
 * `preview` is true only in draft mode (Sanity Presentation). It shows editorial placeholders and
 * [CONFIRM] notes; the published page hides anything that isn't written yet.
 */
import { stegaClean } from 'next-sanity'

import { companyTypes, serviceGroups, site } from '@/lib/site'
import { urlFor } from '@/sanity/lib/image'
import type { AreaPageData } from '@/sanity/types'

import { Icon } from './Icon'
import { ServicesTabs } from './ServicesTabs'
import { Footer, Header, UtilityBar } from './SiteChrome'

type Props = { page: AreaPageData; preview: boolean }

const STEP_ICONS = ['/cs/step-01.webp', '/cs/step-02.webp', '/cs/step-03.webp', '/cs/step-04.webp', '/cs/step-05.webp', '/cs/step-06.webp']
const REVIEW_PLACEHOLDERS = ['Furnace repair', 'Boiler service', 'High-rise AC', 'Restaurant make-up air']

export function AreaPageView({ page, preview }: Props) {
  return (
    <div className="cs">
      {preview && <PreviewBar page={page} />}
      <UtilityBar />
      <Header />
      <main>
        <Hero page={page} />
        <Services page={page} preview={preview} />
        <Owner page={page} preview={preview} />
        <Reviews page={page} preview={preview} />
        <Process page={page} />
        <Price page={page} />
        <Choose page={page} />
        <Companies />
        <Districts page={page} />
        <Buildings page={page} />
        <Permits page={page} />
        <Faq page={page} />
        <ClosingCta page={page} />
      </main>
      <Footer />
    </div>
  )
}

function PreviewBar({ page }: { page: AreaPageData }) {
  const notes = page.confirmNotes ?? []
  return (
    <details className="cs-preview-bar">
      <summary>
        <span>
          Draft preview · {notes.length ? `${notes.length} item${notes.length > 1 ? 's' : ''} to confirm before publishing` : 'nothing left to confirm'}
        </span>
        <a href={`/api/draft-mode/disable?redirect=/service-areas/${stegaClean(page.slug) ?? ''}`}>Exit preview</a>
      </summary>
      {notes.length > 0 && (
        <ul>
          {notes.map((n) => (
            <li key={n._key}><b>{n.block}</b>{n.note}</li>
          ))}
        </ul>
      )}
    </details>
  )
}

// ── B1 Hero + request card ─────────────────────────────
function Hero({ page }: { page: AreaPageData }) {
  const hero = page.hero ?? {}
  const img = hero.image?.asset ? urlFor(hero.image).width(1920).quality(80).auto('format').url() : '/cs/hero-default.webp'
  const scrim = 'linear-gradient(90deg, rgb(9 38 58 / 96%) 0%, rgb(9 38 58 / 88%) 55%, rgb(9 38 58 / 62%) 100%)'
  const options = hero.buildingTypeOptions ?? []
  const defaultOption = stegaClean(hero.defaultBuildingType)

  return (
    <section className="cs-hero on-dark" style={{ backgroundImage: `${scrim}, url(${img})` }} aria-label="Introduction">
      {hero.image?.illustrative && <span className="cs-illustrative">Illustrative photo</span>}
      <div className="cs-hero-copy">
        <nav className="cs-crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/service-areas">Service area</a></li>
            <li aria-current="page">{page.areaName}</li>
          </ol>
          <span className="cs-pill-red">{page.areaName}</span>
        </nav>
        <h1 className="cs-h1">{hero.h1}</h1>
        {hero.lede && <p className="cs-lede">{hero.lede}</p>}
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={site.phoneHref}>
            <Icon name="phone" size={18} strokeWidth={2} />
            Call {site.phone}
          </a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service</a>
        </div>
      </div>

      <form className="cs-form" id="request" aria-labelledby="request-title">
        <h2 id="request-title">{hero.formTitle}</h2>
        <p>The person who diagnoses your system is the person who quotes it.</p>
        <div className="cs-field">
          <label htmlFor="rq-name">Name</label>
          <input id="rq-name" name="name" autoComplete="name" />
        </div>
        <div className="cs-field">
          <label htmlFor="rq-phone">Phone</label>
          <input id="rq-phone" name="phone" type="tel" autoComplete="tel" required />
        </div>
        {options.length > 0 && (
          <div className="cs-field">
            <label htmlFor="rq-building">Building type</label>
            <select id="rq-building" name="building" defaultValue={options.find((o) => stegaClean(o) === defaultOption)}>
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
        {(hero.issueOptions ?? []).length > 0 && (
          <div className="cs-field">
            <label htmlFor="rq-issue">What&apos;s happening?</label>
            <select id="rq-issue" name="issue">
              {hero.issueOptions!.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
        <button className="cs-btn cs-btn-red" type="button">Request a diagnosis</button>
        <p className="note">Price agreed before any work starts.</p>
      </form>

      <ul className="cs-trust" aria-label="Why City & Suburban">
        <li><img src="/cs/trust-local.webp" alt="" />Chicago local</li>
        <li className="sep" aria-hidden="true" />
        <li><img src="/cs/trust-family.webp" alt="" />Family owned</li>
        <li className="sep" aria-hidden="true" />
        <li><img src="/cs/trust-since.webp" alt="" />Since {site.founded}</li>
        <li className="sep" aria-hidden="true" />
        <li className="rating">
          <b>{site.rating.value}</b>
          <span className="cs-stars" aria-label="5 stars">★★★★★</span>
          <small>{site.rating.count} Google reviews</small>
        </li>
      </ul>
    </section>
  )
}

// ── B2 Services ────────────────────────────────────────
function Services({ page, preview }: { page: AreaPageData; preview: boolean }) {
  const groups = preview ? serviceGroups : serviceGroups.filter((g) => g.services.length > 0)
  return (
    <section className="cs-services" aria-labelledby="services-title">
      <div className="cs-services-head">
        <span className="cs-pill-light">From city to suburbs</span>
        <h2 id="services-title">{page.services?.heading}</h2>
        <p>24 services in four groups, from a furnace that won&apos;t light to a restaurant&apos;s make-up air unit.</p>
      </div>
      <ServicesTabs groups={groups} preview={preview} />
    </section>
  )
}

// ── B3 Who you're calling ──────────────────────────────
function Owner({ page, preview }: { page: AreaPageData; preview: boolean }) {
  return (
    <section className="cs-sec cs-owner" aria-labelledby="owner-title">
      <div className="cs-owner-copy">
        <p className="cs-eyebrow">Who you&apos;re calling</p>
        <h2 id="owner-title" className="cs-h2">One family. Second generation. Since {site.founded}.</h2>
        {page.owner?.paragraph && <p>{page.owner.paragraph}</p>}
        <div className="cs-names">
          <small>Names our reviewers remember</small>
          <ul>{site.reviewerNames.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      </div>
      <div className="cs-facts">
        <div className="cs-fact navy">
          <span className="label">Founded</span>
          <div><div className="big">{site.founded}</div><p>{site.yearsFamilyOwned} years, family owned, now in its second generation.</p></div>
        </div>
        <div className="cs-fact red">
          <span className="label">Google rating</span>
          <div><div className="big">{site.rating.value}</div><p>Across {site.rating.count} Google reviews, as of {site.rating.asOf}.</p></div>
        </div>
        <div className="cs-fact fog">
          <span className="label">Who answers</span>
          <div><div className="mid">Rob, the owner</div><p>Owner-operator. He runs the calls himself, so the person who quotes is the person accountable.</p></div>
        </div>
        {site.licenceNumber ? (
          <div className="cs-fact fog">
            <span className="label">Licence</span>
            <div><div className="mid">{site.licenceNumber}</div><p>City of Chicago HVAC licence.</p></div>
          </div>
        ) : (
          preview && (
            <div className="cs-fact confirm">
              <span className="label">Licences · to confirm</span>
              <div><div className="mid">City of Chicago HVAC licence no.</div><p>Pull from the City&apos;s registry before publishing. Not in any workbook or permit file.</p></div>
            </div>
          )
        )}
      </div>
    </section>
  )
}

// ── B4 Reviews ─────────────────────────────────────────
function Reviews({ page, preview }: { page: AreaPageData; preview: boolean }) {
  const items = page.reviews?.items ?? []
  if (!items.length && !preview) return null
  return (
    <section className="cs-sec cs-fog cs-reviews cs-scroller" aria-labelledby="reviews-title">
      <div className="cs-head-row">
        <div className="cs-head">
          <p className="cs-eyebrow">What customers say</p>
          <h2 id="reviews-title" className="cs-h2">{page.reviews?.heading}</h2>
        </div>
        {page.reviews?.intro && <p className="cs-aside">{page.reviews.intro}</p>}
      </div>
      <ul className="cs-track">
        {items.length
          ? items.map((r) => (
              <li key={r._key} className="cs-review">
                <header><span className="cs-stars" aria-label="5 stars">★★★★★</span><span className="cs-tag">{r.service}</span></header>
                <blockquote>{r.quote}</blockquote>
                <footer>
                  <b>{r.reviewerName} · {r.year}</b>
                  {r.googleUrl && <a href={stegaClean(r.googleUrl)} target="_blank" rel="noopener noreferrer">Read on Google</a>}
                </footer>
              </li>
            ))
          : REVIEW_PLACEHOLDERS.map((tag) => (
              <li key={tag} className="cs-review">
                <header><span className="cs-stars">★★★★★</span><span className="cs-tag">{tag}</span></header>
                <p className="cs-confirm">[CONFIRM: the opening 60–70 words of an eligible Google review, quoted verbatim from the review workbook. Add it in B4 Reviews.]</p>
                <footer><b>Reviewer name · year</b><span style={{ color: 'var(--color-blue)', fontWeight: 600, fontSize: 14 }}>Read on Google</span></footer>
              </li>
            ))}
      </ul>
      <div className="cs-progress" aria-hidden="true"><i /></div>
    </section>
  )
}

// ── B5 Process ─────────────────────────────────────────
function Process({ page }: { page: AreaPageData }) {
  const steps = page.process?.steps ?? []
  if (!steps.length) return null
  return (
    <section className="cs-sec cs-stack" aria-labelledby="process-title">
      <div className="cs-head">
        <p className="cs-eyebrow">What happens when you call</p>
        <h2 id="process-title" className="cs-h2">{page.process?.heading}</h2>
      </div>
      <ol className="cs-steps">
        {steps.map((s, i) => (
          <li key={s._key} className="cs-step">
            <header><img src={STEP_ICONS[i % STEP_ICONS.length]} alt="" /><span>{String(i + 1).padStart(2, '0')}</span></header>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ── B6 Scope and price ─────────────────────────────────
function Price({ page }: { page: AreaPageData }) {
  const p = page.price
  if (!p) return null
  return (
    <section className="cs-sec cs-navy cs-price on-dark" aria-labelledby="price-title">
      <div className="cs-price-copy">
        <p className="cs-eyebrow">What changes the price</p>
        <h2 id="price-title" className="cs-h2">{p.heading}</h2>
        {p.intro && <p>{p.intro}</p>}
        {p.medianValue && (
          <div className="cs-median"><b>{p.medianValue}</b><p>{p.medianCaption}</p></div>
        )}
      </div>
      <div className="cs-factors" role="table" aria-label="What moves the price">
        <div className="row th" role="row"><span className="k" role="columnheader">Factor</span><span className="v" role="columnheader">Why it changes the work</span></div>
        {(p.factors ?? []).map((f) => (
          <div key={f._key} className="row" role="row"><span className="k" role="cell">{f.title}</span><span className="v" role="cell">{f.text}</span></div>
        ))}
      </div>
    </section>
  )
}

// ── B7 How to choose ───────────────────────────────────
function Choose({ page }: { page: AreaPageData }) {
  const qs = page.choose?.questions ?? []
  if (!qs.length) return null
  return (
    <section className="cs-sec cs-fog cs-stack" aria-labelledby="choose-title">
      <div className="cs-head-row">
        <div className="cs-head">
          <p className="cs-eyebrow">How to choose</p>
          <h2 id="choose-title" className="cs-h2">{page.choose?.heading}</h2>
        </div>
        <p className="cs-aside">Ask them of anyone you call, including us.</p>
      </div>
      <ol className="cs-cards">
        {qs.map((q, i) => (
          <li key={q._key} className="cs-q"><span className="n">Q{i + 1}</span><h3>{q.title}</h3><p>{q.text}</p></li>
        ))}
      </ol>
    </section>
  )
}

// ── B8 Kinds of company (shared) ───────────────────────
function Companies() {
  return (
    <section className="cs-sec cs-stack" aria-labelledby="companies-title">
      <div className="cs-head">
        <p className="cs-eyebrow">Kinds of HVAC company</p>
        <h2 id="companies-title" className="cs-h2">Who you&apos;ll meet, and what limits each of them</h2>
      </div>
      <ul className="cs-cards">
        {companyTypes.map((c) => (
          <li key={c.title} className={`cs-co${c.us ? ' us' : ''}`}>
            {c.us && <span className="flag">This is us</span>}
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── B9 Districts ───────────────────────────────────────
function Districts({ page }: { page: AreaPageData }) {
  const d = page.districts
  if (!d?.items?.length) return null
  const chips = [
    d.zips?.length ? `ZIP ${d.zips.join(' · ')}` : null,
    d.wards?.length ? `Wards ${d.wards.join(', ')}` : null,
    d.communityArea ?? null,
  ].filter(Boolean) as string[]
  return (
    <section className="cs-sec cs-fog cs-stack cs-scroller" style={{ gap: 32 }} aria-labelledby="districts-title">
      <div className="cs-head-row">
        <div className="cs-head">
          {/* Red eyebrow: fixes the white-on-fog contrast issue in the template (playbook Part K) */}
          <p className="cs-eyebrow">{d.eyebrow}</p>
          <h2 id="districts-title" className="cs-h2">{d.heading}</h2>
        </div>
        <ul className="cs-chips">{chips.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <ul className="cs-track" style={{ gap: 16 }}>
        {d.items.map((x) => (
          <li key={x._key} className="cs-district" tabIndex={0}>
            <h3>{x.name}</h3>
            <p>{x.description}</p>
            {x.hvacHere && <p className="here">HVAC here: {x.hvacHere}</p>}
          </li>
        ))}
      </ul>
      <div className="cs-progress" aria-hidden="true"><i /></div>
    </section>
  )
}

// ── B10 Building types ─────────────────────────────────
function Buildings({ page }: { page: AreaPageData }) {
  const types = page.buildings?.types ?? []
  if (!types.length) return null
  return (
    <section className="cs-sec cs-stack" style={{ gap: 32 }} aria-labelledby="buildings-title">
      <div className="cs-head">
        <p className="cs-eyebrow">Your building type</p>
        <h2 id="buildings-title" className="cs-h2">{page.buildings?.heading}</h2>
      </div>
      <ul className="cs-cards">
        {types.map((t) => (
          <li key={t._key} className="cs-bt"><span className="tag">{t.tag}</span><h3>{t.name}</h3><p>{t.text}</p></li>
        ))}
      </ul>
    </section>
  )
}

// ── B11 Permit record ──────────────────────────────────
function Permits({ page }: { page: AreaPageData }) {
  const p = page.permits
  return (
    <section className="cs-sec cs-permits on-dark" aria-labelledby="permits-title">
      <div className="cs-permits-copy">
        <p className="cs-eyebrow">The permit record, honestly</p>
        <h2 id="permits-title" className="cs-h2">Why you won&apos;t find us in the City&apos;s permit file</h2>
        <p>
          Chicago doesn&apos;t require a permit to repair, diagnose or maintain heating and cooling, which is most of what we do.
          The permit file measures construction, not service. So when a company waves a permit count at you, ask how much of
          their work is repair.
        </p>
      </div>
      <ul className="cs-stats">
        {typeof p?.areaCount === 'number' && (
          <li><b>{p.areaCount}</b><span>{p.areaCaption}</span></li>
        )}
        <li><b>{site.permits.citywideFirms}</b><span>Firms that pull HVAC permits citywide, across {site.permits.citywidePermits} permits in 24 months.</span></li>
        <li><b>{site.permits.ours}</b><span>Permits on record for City &amp; Suburban. We said we&apos;d be honest.</span></li>
      </ul>
    </section>
  )
}

// ── B12 FAQ ────────────────────────────────────────────
function Faq({ page }: { page: AreaPageData }) {
  const items = page.faq?.items ?? []
  if (!items.length) return null
  return (
    <section className="cs-sec cs-faq" aria-labelledby="faq-title">
      <div className="cs-head">
        <p className="cs-eyebrow">Questions</p>
        <h2 id="faq-title" className="cs-h2">{page.faq?.heading}</h2>
      </div>
      <div className="cs-faq-list">
        {items.map((f, i) => (
          <details key={f._key} open={i === 0}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

// ── B13 Closing CTA ────────────────────────────────────
function ClosingCta({ page }: { page: AreaPageData }) {
  return (
    <section className="cs-cta-wrap" aria-labelledby="cta-title">
      <div className="cs-cta on-dark">
        <div>
          <h2 id="cta-title">{page.cta?.heading}</h2>
          {page.cta?.text && <p>{page.cta.text}</p>}
        </div>
        <div className="cs-actions">
          <a className="cs-btn cs-btn-red" href={site.phoneHref}><Icon name="phone" size={18} strokeWidth={2} />Call {site.phone}</a>
          <a className="cs-btn cs-btn-ghost" href="#request">Schedule service</a>
        </div>
      </div>
    </section>
  )
}
