// Brand marks and review links from the Paper design system v3.1, "Trust & Reviews"
// (https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG, page "Design System"): always the real
// multi-colour Google G and the Yelp burst, never a letter "G" in a circle.
import { stegaClean } from 'next-sanity'

import { design } from '../design'

// The live site's own profiles (its footer links)
export const YELP_URL = 'https://www.yelp.com/biz/city-and-suburban-heating-and-cooling-chicago'
export const SOCIAL = [
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61576251038690' },
  { name: 'Instagram', url: 'https://www.instagram.com/city_suburban_heating_cooling' },
  { name: 'Yelp', url: YELP_URL },
] as const

export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z" fill="#4285F4" />
      <path d="M24 46c6 0 11-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8 41.3 15.4 46 24 46z" fill="#34A853" />
      <path d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3v-5.7H4.5A22 22 0 0 0 2 24c0 3.6.9 6.9 2.5 9.9l7.3-5.6z" fill="#FBBC04" />
      <path d="M24 10.3c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C35 3.8 30 1.8 24 1.8 15.4 1.8 8 6.5 4.5 13.9l7.3 5.7c1.7-5.2 6.5-9.3 12.2-9.3z" fill="#EA4335" />
    </svg>
  )
}

export function YelpBurst({ size = 16, fill = '#D32323' }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <ellipse cx="21.7" cy="14.2" rx="6.2" ry="11.5" transform="rotate(-10 21.7 14.2)" fill={fill} />
      <ellipse cx="13.5" cy="23.6" rx="5" ry="7.8" transform="rotate(-72 13.5 23.6)" fill={fill} />
      <ellipse cx="16.9" cy="35.4" rx="5" ry="7.8" transform="rotate(-140 16.9 35.4)" fill={fill} />
      <ellipse cx="26.8" cy="37.6" rx="5" ry="7.8" transform="rotate(165 26.8 37.6)" fill={fill} />
      <ellipse cx="35" cy="28" rx="5" ry="7.8" transform="rotate(95 35 28)" fill={fill} />
    </svg>
  )
}

const SOCIAL_ICONS = {
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.7V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V9c0-.6.4-1 1-1z" fill="#FFFFFF" /></svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="#FFFFFF" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.3" fill="#FFFFFF" />
    </svg>
  ),
  Yelp: <YelpBurst size={20} fill="#FFFFFF" />,
}

/** Footer: Facebook, Instagram and Yelp in red circles */
export function SocialIcons() {
  return (
    <div className="v3-social">
      {SOCIAL.map((s) => (
        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>{SOCIAL_ICONS[s.name]}</a>
      ))}
    </div>
  )
}

/**
 * The hero's rating row, on navy: Google first, a divider, then Yelp (the live site's Yelp rating
 * image, whose "4.9" is white). Both link out to the review pages.
 */
export function RatingRow({ rating, count, mapsUrl }: { rating?: string | number; count?: string | number; mapsUrl: string }) {
  return (
    <div className="v3-rating">
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Google rating ${stegaClean(rating)} out of 5, ${stegaClean(count)} Google reviews`}>
        <GoogleG size={22} />
        <b>{rating}</b>
        <span className="stars" aria-hidden="true">★★★★★</span>
        <u>{count} Google reviews</u>
      </a>
      <span className="div" aria-hidden="true" />
      <a href={YELP_URL} target="_blank" rel="noopener noreferrer" aria-label="Yelp rating 4.9 out of 5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={design.images.yelpRating} alt="" width={160} height={28} />
      </a>
    </div>
  )
}

/** The partner line under the services: copy left, American Standard logo right */
export function PartnerLine() {
  return (
    <p className="v3-partner">
      <span>Partnered with the Best in the Business</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={design.images.partner} alt="American Standard" width={170} height={28} loading="lazy" decoding="async" />
    </p>
  )
}

const BAND = [
  { label: '5 Star Service', icon: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" strokeLinejoin="round" /> },
  { label: 'Transparent Pricing', icon: <><path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z" strokeLinejoin="round" /><circle cx="7.5" cy="7.5" r="1.5" fill="#FFFFFF" stroke="none" /></> },
  { label: 'Financing', icon: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9c-.4-.9-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.5-1.5M12 6v1.5M12 16.5V18" strokeLinecap="round" /></> },
  { label: 'Certified Professional', icon: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14l-1.5 7.5L12 19l5 2.5-1.5-7.5M9.5 9l1.8 1.8L14.8 7.5" strokeLinecap="round" strokeLinejoin="round" /></> },
  { label: 'Top Quality Work', icon: <><path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.4-7.5 10-4.3-1.6-7.5-5.4-7.5-10v-6z" strokeLinejoin="round" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" /></> },
]

/** The blue trust band that follows the reviews */
export function TrustBand() {
  return (
    <ul className="v3-band" aria-label="Why customers choose us">
      {BAND.map((b) => (
        <li key={b.label}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" aria-hidden="true">{b.icon}</svg>
          <span>{b.label}</span>
        </li>
      ))}
    </ul>
  )
}

/** End of every review track: an invitation to write a review */
export function WriteReview({ mapsUrl }: { mapsUrl: string }) {
  return (
    <div className="v3-write">
      <p>We&apos;d love to hear about your experience –{' '}<a href={mapsUrl} target="_blank" rel="noopener noreferrer">write a review</a></p>
      <div className="btns">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"><GoogleG size={16} />Review on Google</a>
        <a href={YELP_URL} target="_blank" rel="noopener noreferrer"><YelpBurst size={16} />Review on Yelp</a>
      </div>
    </div>
  )
}
