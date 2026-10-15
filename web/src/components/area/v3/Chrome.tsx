/**
 * Utility bar, header and footer of the v3 area page, as in the Paper master design
 * (https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG). Links go to the live site,
 * citysuburbanheating.com; Services and Service Areas open on hover or keyboard focus.
 */
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { areaPath, collectionPath } from '@/lib/siteUrl'

import { design } from '../design'
import { telHref, type Template } from '../template'
import { QuickQuote, Year } from './QuickQuote'
import { Svg } from './Svg'

const live = (path: string) => `${design.live}${path}`
type Area = { name: string; slug: string }

export function V3Header({ t, areas, current }: { t: Template; areas: Area[]; current: string }) {
  const b = t.business
  return (
    <>
      <div className="v3-util">
        <span><Svg.pin size={14} />{b.addressShort}, Chicago, IL 60642</span>
        <span><Svg.clock size={14} />Open {b.hours} · Mon–Sun</span>
        <a href={`mailto:${stegaClean(b.email)}`}><Svg.mail size={14} />{b.email}</a>
        <a className="ph" href={telHref(b.phone)}><Svg.phone size={14} />{b.phone}</a>
      </div>
      <header className="v3-header">
        <a className="logo" href={live('/')} aria-label={`${b.companyName} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={design.images.logo} alt={b.companyName} width={159} height={56} />
        </a>
        <nav aria-label="Main">
          <ul>
            <li><a href={live('/')}>Home</a></li>
            <li><a href={live('/about-us/')}>About us</a></li>
            <li className="dd">
              <a href={live('/services/')} aria-haspopup="true">Services<Svg.chev size={12} /></a>
              <div className="menu">
                {design.groups.map((g) => (
                  <div key={g.key}>
                    <a className="head" href={g.url}>{g.name}</a>
                    {g.items.map((s) => <a key={s.url} href={s.url}>{s.title}</a>)}
                  </div>
                ))}
              </div>
            </li>
            <li className="dd on">
              <Link href={collectionPath} aria-haspopup="true">Service areas<Svg.chev size={12} /></Link>
              <div className="menu narrow">
                <div>
                  {areas.map((a) => (
                    <Link key={a.slug} href={areaPath(a.slug)} aria-current={a.slug === current ? 'page' : undefined}>{a.name}</Link>
                  ))}
                  <Link className="all" href={collectionPath}>All service areas →</Link>
                </div>
              </div>
            </li>
            <li><a href="https://retailservices.wellsfargo.com/pl/0024376626">Finance</a></li>
            <li><a href={live('/blog/')}>Blog</a></li>
          </ul>
        </nav>
        <div className="acts">
          <a className="call" href={telHref(b.phone)}><Svg.phone size={18} stroke="#09263A" />{b.phone}</a>
          <a className="v3-pill red" href={live('/contact-us/')}>Contact us</a>
          {/* Tablets and phones: the nav above is hidden, this menu replaces it */}
          <details className="mob">
            <summary aria-label="Menu"><span /><span /><span /></summary>
            <nav aria-label="Main">
              <a href={live('/')}>Home</a>
              <a href={live('/about-us/')}>About us</a>
              <a href={live('/services/')}>Services</a>
              <Link href={collectionPath}>Service areas</Link>
              <div className="areas">
                {areas.map((a) => <Link key={a.slug} href={areaPath(a.slug)} aria-current={a.slug === current ? 'page' : undefined}>{a.name}</Link>)}
              </div>
              <a href="https://retailservices.wellsfargo.com/pl/0024376626">Finance</a>
              <a href={live('/blog/')}>Blog</a>
            </nav>
          </details>
        </div>
      </header>
    </>
  )
}

export function V3Footer({ t }: { t: Template }) {
  const b = t.business
  return (
    <footer className="v3-footer">
      <div className="main">
        <div className="about">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="v3-logo"><img src={design.images.logo} alt={b.companyName} width={125} height={44} /></span>
          <p>{b.companyName} is a family-owned Chicago heating and cooling company, trusted &quot;from city to suburbs&quot; since {b.foundedYear}. The owner still runs the calls, and the price is agreed before any work starts.</p>
          <div className="rule" />
          <div className="cols">
            <div>
              <h2>Company</h2>
              <a href={live('/about-us/')}>About us</a>
              <Link href={collectionPath}>Service areas</Link>
              <a href="https://retailservices.wellsfargo.com/pl/0024376626">Finance</a>
              <a href={live('/contact-us/')}>Contact us</a>
            </div>
            <div>
              <h2>Services</h2>
              {design.groups.map((g) => <a key={g.key} href={g.url}>{g.name}</a>)}
            </div>
            <div className="contact">
              <h2>Contact</h2>
              <a href={stegaClean(b.mapsUrl)} target="_blank" rel="noopener noreferrer"><Svg.pin size={14} /><span>{b.addressShort}<br />Chicago, IL 60642</span></a>
              <a className="strong" href={telHref(b.phone)}><Svg.phone size={14} /><span>{b.phone}</span></a>
              <a href={`mailto:${stegaClean(b.email)}`}><Svg.mail size={14} /><span>{b.email}</span></a>
            </div>
          </div>
        </div>
        <QuickQuote phone={b.phone} />
      </div>
      <div className="bar">
        <span>© <Year /> {b.companyName}. All rights reserved.</span>
        <span><a href={live('/privacy-policy/')}>Privacy policy</a> · <a href={live('/terms-of-use/')}>Terms</a></span>
      </div>
    </footer>
  )
}
