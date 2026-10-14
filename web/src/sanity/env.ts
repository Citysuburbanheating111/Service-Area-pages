// Public Sanity settings, read from .env.local (or Vercel environment variables).
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing NEXT_PUBLIC_SANITY_DATASET in .env.local',
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local (sanity.io/manage → project → Project ID)',
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === '') {
    throw new Error(errorMessage)
  }
  return v
}
