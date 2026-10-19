/** Jobber (through Zapier) needs an email to create the client, so the forms require one */
export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

/**
 * Sends a filled request form to /service-area/api/lead/, which emails it to City & Suburban and passes
 * it to Jobber through Zapier. Resolves true only when the lead got through, so the form can tell the
 * visitor to call otherwise.
 */
export async function sendLead(form: HTMLFormElement, extra: Record<string, string>) {
  const fields = Object.fromEntries(Array.from(new FormData(form), ([key, value]) => [key, String(value)]))
  try {
    const response = await fetch('/service-area/api/lead/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...fields, ...extra, page: window.location.pathname }),
    })
    return response.ok
  } catch {
    return false
  }
}
