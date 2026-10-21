/**
 * Footer of the v3 area page, as in the Paper master design
 * (https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG). Links go to the live site,
 * citysuburbanheating.com. The header is the live site's own (LiveHeader), as on /service-areas.
 */
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { collectionPath } from '@/lib/siteUrl'

import { design } from '../design'
import { telHref, type Template } from '../template'
import { SocialIcons } from './Brand'
import { QuickQuote, Year } from './QuickQuote'
import { Svg } from './Svg'

const live = (path: string) => `${design.live}${path}`

export function V3Footer({ t, area, city }: { t: Template; area?: string; city?: string }) {
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
              <SocialIcons />
            </div>
          </div>
        </div>
        <QuickQuote phone={b.phone} area={area} city={city} />
      </div>
      <div className="bar">
        <span>© <Year /> {b.companyName}. All rights reserved.</span>
        <span><a href={live('/privacy-policy/')}>Privacy policy</a> · <a href={live('/terms-of-use/')}>Terms</a></span>
      </div>
    </footer>
  )
}
