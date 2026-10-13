// Global blocks G1–G3: the same on every page.
import { site } from '@/lib/site'

export function UtilityBar() {
  return (
    <div className="cs-utility">
      <b>{site.tagline}</b>
      <span className="hours">{site.hours}</span>
      <nav aria-label="Company">
        {site.utilityLinks.map((l) => (
          <a key={l} href="#">{l}</a>
        ))}
      </nav>
    </div>
  )
}

export function Header() {
  return (
    <header className="cs-header">
      <a href="/" className="cs-logo" aria-label={site.name} />
      <nav className="cs-nav" aria-label="Main">
        {site.nav.map((l) => (
          <a key={l} href="#">{l}</a>
        ))}
      </nav>
      <div className="cs-header-actions">
        <a className="cs-call" href={site.phoneHref}>
          <small>CALL</small>
          <b>{site.phone}</b>
        </a>
        <a className="cs-btn cs-btn-red cs-btn-sm" href="#request">Schedule service</a>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="cs-footer">
      <div className="brand">
        <span className="badge"><span className="cs-logo" role="img" aria-label={site.name} /></span>
        <address>
          {site.address}
          <br />
          Family owned since {site.founded}
        </address>
      </div>
      <a href={site.phoneHref}>{site.phone}</a>
    </footer>
  )
}
