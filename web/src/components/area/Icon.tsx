import { design } from './design'

type Props = { name: string; size?: number; strokeWidth?: number }

// The design's 24×24 line icons. Markup is a static constant from design-data.json, never user content.
export function Icon({ name, size = 20, strokeWidth = 1.8 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: design.icons[name] ?? '' }}
    />
  )
}

/** Google "G" mark (static markup). */
export function GLogo() {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: design.gLogo }} />
}
