import { redirect } from 'next/navigation'

// No home page design yet. Send visitors to the service area list.
export default function Home() {
  redirect('/service-areas')
}
