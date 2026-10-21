// Brand marks and review links from the Paper design system v3.1, "Trust & Reviews"
// (https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG, page "Design System"): always the real
// multi-colour Google G and the Yelp burst, never a letter "G" in a circle.
// The texts, links, Yelp rating, trust band and partner logo come from the Service area template in
// Sanity ("Trust + partner"), so every area page changes together.
import { stegaClean } from 'next-sanity'
import type { ReactNode } from 'react'

import { urlFor } from '@/sanity/lib/image'

import { design } from '../design'
import type { Template } from '../template'

type Trust = Template['trust']
const url = (s?: string) => stegaClean(s) ?? ''

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

// Yelp's own burst, the shape the live site uses in its footer
const YelpLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="2.5 0 15 20" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#DD382B" d="M17.175,14.971c-0.112,0.77-1.686,2.767-2.406,3.054c-0.246,0.1-0.487,0.076-0.675-0.069c-0.122-0.096-2.446-3.859-2.446-3.859c-0.194-0.293-0.157-0.682,0.083-0.978c0.234-0.284,0.581-0.393,0.881-0.276c0.016,0.01,4.21,1.394,4.332,1.482c0.178,0.148,0.263,0.379,0.225,0.646L17.175,14.971L17.175,14.971z M11.464,10.789c-0.203-0.307-0.199-0.666,0.009-0.916c0,0,2.625-3.574,2.745-3.657c0.203-0.135,0.452-0.141,0.69-0.025c0.691,0.335,2.085,2.405,2.167,3.199v0.027c0.024,0.271-0.082,0.491-0.273,0.623c-0.132,0.083-4.43,1.155-4.43,1.155c-0.322,0.096-0.68-0.06-0.882-0.381L11.464,10.789z M9.475,9.563C9.32,9.609,8.848,9.757,8.269,8.817c0,0-3.916-6.16-4.007-6.351c-0.057-0.212,0.011-0.455,0.202-0.65C5.047,1.211,8.21,0.327,9.037,0.529c0.27,0.069,0.457,0.238,0.522,0.479c0.047,0.266,0.433,5.982,0.488,7.264C10.098,9.368,9.629,9.517,9.475,9.563z M9.927,19.066c-0.083,0.225-0.273,0.373-0.54,0.421c-0.762,0.13-3.15-0.751-3.647-1.342c-0.096-0.131-0.155-0.262-0.167-0.394c-0.011-0.095,0-0.189,0.036-0.272c0.061-0.155,2.917-3.538,2.917-3.538c0.214-0.272,0.595-0.355,0.952-0.213c0.345,0.13,0.56,0.428,0.536,0.749C10.014,14.479,9.977,18.923,9.927,19.066z M3.495,13.912c-0.235-0.009-0.444-0.148-0.568-0.382c-0.089-0.17-0.151-0.453-0.19-0.794C2.63,11.701,2.761,10.144,3.07,9.648c0.145-0.226,0.357-0.345,0.592-0.336c0.154,0,4.255,1.667,4.255,1.667c0.321,0.118,0.521,0.453,0.5,0.833c-0.023,0.37-0.236,0.655-0.551,0.738L3.495,13.912z" />
  </svg>
)

const BoxStar = () => (
  <span className="box"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.95 6.4 7 .75-5.25 4.7 1.5 6.9L12 17.4l-6.2 3.55 1.5-6.9L2.05 9.35l7-.75z" fill="#FFFFFF" /></svg></span>
)

const SOCIAL_ICONS: Record<'Facebook' | 'Instagram' | 'Yelp', ReactNode> = {
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
export function SocialIcons({ trust }: { trust: Trust }) {
  const links = [
    { name: 'Facebook' as const, href: url(trust.facebookUrl) },
    { name: 'Instagram' as const, href: url(trust.instagramUrl) },
    { name: 'Yelp' as const, href: url(trust.yelpUrl) },
  ].filter((l) => l.href)
  return (
    <div className="v3-social">
      {links.map((s) => (
        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>{SOCIAL_ICONS[s.name]}</a>
      ))}
    </div>
  )
}

/**
 * The hero's rating row, on navy: Google first, a divider, then Yelp (its burst, the rating in white
 * and five red star boxes, as the live site's Yelp rating image). Both link out to the review pages.
 */
export function RatingRow({ rating, count, mapsUrl, trust }: { rating?: string | number; count?: string | number; mapsUrl: string; trust: Trust }) {
  return (
    <div className="v3-rating">
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Google rating ${stegaClean(rating)} out of 5, ${stegaClean(count)} Google reviews`}>
        <GoogleG size={22} />
        <b>{rating}</b>
        <span className="stars" aria-hidden="true">★★★★★</span>
        <u>{count} Google reviews</u>
      </a>
      <span className="div" aria-hidden="true" />
      <a className="yelp" href={url(trust.yelpUrl)} target="_blank" rel="noopener noreferrer" aria-label={`Yelp rating ${stegaClean(trust.yelpRating)} out of 5`}>
        <YelpLogo />
        <b>{trust.yelpRating}</b>
        <span className="boxes" aria-hidden="true"><BoxStar /><BoxStar /><BoxStar /><BoxStar /><BoxStar /></span>
      </a>
    </div>
  )
}

/** The partner line under the services: copy left, partner logo right */
export function PartnerLine({ trust }: { trust: Trust }) {
  const logo = trust.partnerLogo?.asset ? urlFor(trust.partnerLogo).width(340).auto('format').url() : design.images.partner
  return (
    <p className="v3-partner">
      <span>{trust.partnerText}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={stegaClean(trust.partnerName) ?? ''} width={170} height={28} loading="lazy" decoding="async" />
    </p>
  )
}

const BAND_ICONS: Record<string, ReactNode> = {
  star: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" strokeLinejoin="round" />,
  tag: <><path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z" strokeLinejoin="round" /><circle cx="7.5" cy="7.5" r="1.5" fill="#FFFFFF" stroke="none" /></>,
  dollar: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9c-.4-.9-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.5-1.5M12 6v1.5M12 16.5V18" strokeLinecap="round" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14l-1.5 7.5L12 19l5 2.5-1.5-7.5M9.5 9l1.8 1.8L14.8 7.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  shield: <><path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.4-7.5 10-4.3-1.6-7.5-5.4-7.5-10v-6z" strokeLinejoin="round" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" /></>,
}

/** The blue trust band that follows the reviews */
export function TrustBand({ trust }: { trust: Trust }) {
  return (
    <ul className="v3-band" aria-label="Why customers choose us">
      {trust.band.map((b) => (
        <li key={b._key}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" aria-hidden="true">{BAND_ICONS[stegaClean(b.icon) ?? ''] ?? BAND_ICONS.star}</svg>
          <span>{b.label}</span>
        </li>
      ))}
    </ul>
  )
}

/** End of every review track: an invitation to write a review */
export function WriteReview({ trust, mapsUrl }: { trust: Trust; mapsUrl: string }) {
  const google = url(trust.googleReviewUrl) || mapsUrl
  return (
    <div className="v3-write">
      <p>{trust.writeReviewText}{' '}<a href={google} target="_blank" rel="noopener noreferrer">{trust.writeReviewLink}</a></p>
      <div className="btns">
        <a href={google} target="_blank" rel="noopener noreferrer"><GoogleG size={16} />Review on Google</a>
        <a href={url(trust.yelpUrl)} target="_blank" rel="noopener noreferrer"><YelpBurst size={16} />Review on Yelp</a>
      </div>
    </div>
  )
}
