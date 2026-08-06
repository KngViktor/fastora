import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import { submitContact } from '@/lib/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Length ceilings, matched to the database columns behind them.
 *
 * Without these, `brief` was unbounded on both sides — the Laravel rule is
 * `required|string` with no max — so a multi-megabyte body would be accepted and
 * stored. Truncating is friendlier than rejecting: nobody legitimately writes
 * past these, and a bot does not deserve an error message.
 */
const LIMITS = {
  name: 255,
  email: 254,
  phone: 50,
  websiteUrl: 255,
  company: 255,
  brief: 5000,
  budgetRange: 255,
  preferredTimes: 2000,
  timezone: 100,
} as const

/**
 * Strips CR and LF from anything interpolated into an email header.
 *
 * Resend sends structured JSON rather than assembling raw headers, so injection
 * is unlikely through this path. The stripping is here anyway because the safety
 * currently depends on an implementation detail of someone else's SDK, and a
 * newline in a subject line has no legitimate purpose.
 */
const headerSafe = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()

const clamp = (value: string, max: number): string => value.slice(0, max)

/**
 * Public contact endpoint. Proxies to the Laravel API's /api/contact, which
 * does the real validation and Inquiry creation — this route stays a thin
 * pass-through so the client-side form's fetch target (`/api/contact`) never
 * has to change, and adds a best-effort admin notification email on success.
 * A hidden honeypot field (`website`) silently absorbs bots on both sides.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''

  if (typeof body.website !== 'string' || body.website.trim() === '') {
    if (!name || !email || !brief) {
      return NextResponse.json(
        { error: 'Name, email, and a project brief are required.' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const websiteUrl = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : undefined
  const company = typeof body.company === 'string' ? body.company.trim() : undefined
  const budgetRange = typeof body.budgetRange === 'string' ? body.budgetRange : undefined
  const timeline = typeof body.timeline === 'string' ? body.timeline : undefined
  const serviceNeededRaw = body.serviceNeeded
  const serviceNeeded =
    serviceNeededRaw !== undefined && serviceNeededRaw !== null && serviceNeededRaw !== ''
      ? Number(serviceNeededRaw)
      : undefined

  // Consultation fields. These were missing, so every session request arrived as
  // an ordinary enquiry with the times the visitor offered silently discarded —
  // this route builds an explicit payload, and anything absent from it is dropped.
  // The backend endpoint accepted them all along; it was only ever tested
  // directly, never through this proxy, which is how the gap survived.
  const kind = body.kind === 'consultation' ? 'consultation' : 'general'
  const preferredTimes =
    typeof body.preferredTimes === 'string' ? body.preferredTimes.trim() : undefined
  const timezone = typeof body.timezone === 'string' ? body.timezone.trim() : undefined

  const result = await submitContact({
    name: clamp(name, LIMITS.name),
    email: clamp(email, LIMITS.email),
    phone: phone ? clamp(phone, LIMITS.phone) : undefined,
    websiteUrl: websiteUrl ? clamp(websiteUrl, LIMITS.websiteUrl) : undefined,
    brief: clamp(brief, LIMITS.brief),
    company: company ? clamp(company, LIMITS.company) : undefined,
    budgetRange: budgetRange ? clamp(budgetRange, LIMITS.budgetRange) : undefined,
    timeline,
    kind,
    preferredTimes: preferredTimes ? clamp(preferredTimes, LIMITS.preferredTimes) : undefined,
    timezone: timezone ? clamp(timezone, LIMITS.timezone) : undefined,
    serviceNeeded: serviceNeeded && !Number.isNaN(serviceNeeded) ? serviceNeeded : undefined,
    website: typeof body.website === 'string' ? body.website : undefined,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  // Best-effort admin notification — a failed email must never block the
  // submission itself, since it's already safely saved in the CMS.
  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Fastora <onboarding@resend.dev>',
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        replyTo: headerSafe(email),
        subject: headerSafe(
          `${kind === 'consultation' ? 'Consultation request' : 'New inquiry'} from ${name}${
            company ? ` (${company})` : ''
          }`,
        ),
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          websiteUrl ? `Website: ${websiteUrl}` : null,
          company ? `Company: ${company}` : null,
          budgetRange ? `Budget: ${budgetRange}` : null,
          timeline ? `Timeline: ${timeline}` : null,
          preferredTimes ? `Times they can make: ${preferredTimes}` : null,
          timezone ? `Their timezone: ${timezone}` : null,
          '',
          'Brief:',
          brief,
        ]
          .filter(Boolean)
          .join('\n'),
      })
    } catch (emailError) {
      console.error('Failed to send inquiry notification email:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
