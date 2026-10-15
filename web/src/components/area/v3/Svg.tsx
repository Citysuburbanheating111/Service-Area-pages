// The v3 page's line icons, path for path as in the Paper master design. Red by default.
import type { ReactNode } from 'react'

type P = { size?: number; stroke?: string; width?: number }

const icon = (paths: (stroke: string, w: number) => ReactNode, defWidth = 2) =>
  function Icon({ size = 16, stroke = '#DD382B', width = defWidth }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        {paths(stroke, width)}
      </svg>
    )
  }

export const Svg = {
  pin: icon((s, w) => <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" stroke={s} strokeWidth={w} /><circle cx="12" cy="9.5" r="2.5" stroke={s} strokeWidth={w} /></>),
  pinOnly: icon((s, w) => <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" stroke={s} strokeWidth={w} />),
  clock: icon((s, w) => <><circle cx="12" cy="12" r="9" stroke={s} strokeWidth={w} /><path d="M12 7v5l3 2" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  mail: icon((s, w) => <><rect x="3" y="5" width="18" height="14" rx="2" stroke={s} strokeWidth={w} /><path d="m3 7 9 6 9-6" stroke={s} strokeWidth={w} /></>),
  phone: icon((s, w) => <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke={s} strokeWidth={w} strokeLinejoin="round" />),
  chev: icon((s, w) => <path d="m6 9 6 6 6-6" stroke={s} strokeWidth={w} strokeLinecap="round" />, 2.5),
  arrow: icon((s, w) => <path d="M5 12h14M13 6l6 6-6 6" stroke={s} strokeWidth={w} strokeLinecap="round" />),
  arrowLeft: icon((s, w) => <path d="M19 12H5M11 6l-6 6 6 6" stroke={s} strokeWidth={w} strokeLinecap="round" />),
  upRight: icon((s, w) => <path d="M7 17 17 7M8 7h9v9" stroke={s} strokeWidth={w} strokeLinecap="round" />, 2.5),
  check: icon((s, w) => <path d="m5 12 5 5 9-10" stroke={s} strokeWidth={w} strokeLinecap="round" />, 2.5),
  checkCircle: icon((s, w) => <><circle cx="12" cy="12" r="9" stroke={s} strokeWidth={w} /><path d="m8 12 3 3 5-6" stroke={s} strokeWidth={w} /></>),
  shield: icon((s, w) => <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" stroke={s} strokeWidth={w} />),
  shieldCheck: icon((s, w) => <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" stroke={s} strokeWidth={w} /><path d="m9 12 2 2 4-4" stroke={s} strokeWidth={w} /></>),
  people: icon((s, w) => <><circle cx="9" cy="8" r="3.5" stroke={s} strokeWidth={w} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3 2.5 3 6" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  user: icon((s, w) => <><circle cx="12" cy="8" r="4" stroke={s} strokeWidth={w} /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={s} strokeWidth={w} /></>),
  info: icon((s, w) => <><circle cx="12" cy="12" r="9" stroke={s} strokeWidth={w} /><path d="M12 11v6M12 7.5v.5" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  search: icon((s, w) => <><circle cx="11" cy="11" r="6" stroke={s} strokeWidth={w} /><path d="m20 20-4.5-4.5" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  docCheck: icon((s, w) => <><path d="M14 3H6v18h12V7z" stroke={s} strokeWidth={w} /><path d="m9 13 2 2 4-4" stroke={s} strokeWidth={w} /></>),
  docLines: icon((s, w) => <><path d="M14 3H6v18h12V7z" stroke={s} strokeWidth={w} /><path d="M9 12h6M9 16h4" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  tag: icon((s, w) => <><path d="M20 12 12 20 4 12V4h8z" stroke={s} strokeWidth={w} strokeLinejoin="round" /><circle cx="8.5" cy="8.5" r="1.5" fill={s} /></>),
  calendar: icon((s, w) => <><rect x="4" y="5" width="16" height="15" rx="2" stroke={s} strokeWidth={w} /><path d="M4 10h16M9 3v4M15 3v4" stroke={s} strokeWidth={w} strokeLinecap="round" /></>),
  wrench: icon((s, w) => <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" stroke={s} strokeWidth={w} strokeLinejoin="round" />),
  clipboard: icon((s, w) => <><path d="M9 4h6v3H9zM7 5H5v16h14V5h-2" stroke={s} strokeWidth={w} /><path d="m9 13 2 2 4-4" stroke={s} strokeWidth={w} /></>),
  database: icon((s, w) => <><ellipse cx="12" cy="6" rx="8" ry="3" stroke={s} strokeWidth={w} /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke={s} strokeWidth={w} /></>),
  building: icon((s, w) => <><rect x="4" y="3" width="16" height="18" stroke={s} strokeWidth={w} /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke={s} strokeWidth={w} /></>),
  tower: icon((s, w) => <><rect x="7" y="2" width="10" height="20" stroke={s} strokeWidth={w} /><path d="M10 6h4M10 10h4M10 14h4M3 22h18" stroke={s} strokeWidth={w} /></>),
  house: icon((s, w) => <><path d="M3 11 12 4l9 7M5 10v10h14V10" stroke={s} strokeWidth={w} strokeLinejoin="round" /><path d="M10 20v-5h4v5" stroke={s} strokeWidth={w} /></>),
  store: icon((s, w) => <><path d="M3 9h18l-2-5H5zM5 9v11h14V9" stroke={s} strokeWidth={w} strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke={s} strokeWidth={w} /></>),
  swipe: icon((s, w) => <path d="M5 12h14M13 6l6 6-6 6M11 6 5 12l6 6" stroke={s} strokeWidth={w} strokeLinecap="round" />, 1.6),
}
