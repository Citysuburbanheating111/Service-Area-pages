import { serviceIcons } from '@/lib/site'

type Props = { name: keyof typeof serviceIcons; size?: number; strokeWidth?: number }

// The design's line icons. Markup is a static constant from src/lib/site.ts, never user content.
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
      dangerouslySetInnerHTML={{ __html: serviceIcons[name] }}
    />
  )
}
