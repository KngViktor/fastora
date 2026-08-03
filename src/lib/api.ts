// Typed client for the Laravel REST API (fastora-backend) that replaced
// Payload's Local API as this frontend's content source. Endpoint shapes are
// documented in fastora-backend's app/Http/Resources/*.php — kept here as
// hand-written mirrors since the two codebases don't share generated types.

const API_BASE = (process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export interface Media {
  id: number
  url: string
  alt: string | null
  width: number | null
  height: number | null
  mimeType: string | null
  // Laravel's MediaResource has no updatedAt-based cache-busting field (unlike
  // Payload's); kept optional so the shared <Media> component's cache-tag
  // logic degrades gracefully to "no cache tag" instead of a type error.
  updatedAt?: string | null
}

export interface NavItem {
  label: string
  url: string
}

export interface Nav {
  navItems: NavItem[]
}

export interface SiteSettings {
  siteName: string
  tagline: string | null
  logoLight: Media | null
  logoDark: Media | null
  favicon: Media | null
  colors: {
    accent: string | null
    background: string | null
    text: string | null
    surface: string | null
    border: string | null
    mutedText: string | null
    primary: string | null
    darkPanelText: string | null
  }
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  socialLinks: { platform: string; url: string }[]
  footerText: string | null
  newsletterHeading: string | null
  newsletterSubheading: string | null
}

export interface Meta {
  title: string | null
  description: string | null
  image: Media | null
}

// Fallbacks for when the API is briefly unreachable — used with `safely()` in
// the root layout / Header / Footer, which render on every single page (including
// statically-generated shells like /_not-found), so they can't be allowed to throw.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Fastora',
  tagline: null,
  logoLight: null,
  logoDark: null,
  favicon: null,
  colors: {
    accent: null,
    background: null,
    text: null,
    surface: null,
    border: null,
    mutedText: null,
    primary: null,
    darkPanelText: null,
  },
  contactEmail: null,
  contactPhone: null,
  address: null,
  socialLinks: [],
  footerText: null,
  newsletterHeading: null,
  newsletterSubheading: null,
}

export const DEFAULT_NAV: Nav = { navItems: [] }

export interface Service {
  id: number
  title: string
  slug: string
  summary: string
  icon: Media | null
  featuredImage: Media | null
  order: number
  featuredOnHome: boolean
  problem: string | null
  approach: string | null
  deliverables: { label: string }[]
  faqs: { question: string; answer: string }[]
  status: string
  publishedAt: string | null
  updatedAt: string | null
  meta: Meta
}

export interface CaseStudy {
  id: number
  title: string
  slug: string
  summary: string
  clientName: string | null
  industry: string | null
  coverImage: Media | null
  gallery: Media[]
  order: number
  featuredOnHome: boolean
  relatedService: { id: number; title: string; slug: string } | null
  challenge: string | null
  approach: string | null
  results: { metric: string; label: string }[]
  status: string
  publishedAt: string | null
  updatedAt: string | null
  meta: Meta
}

export interface Post {
  id: number
  title: string
  slug: string
  heroImage: Media | null
  content: string | null
  tags: string[]
  categories: { id: number; title: string; slug: string }[]
  authors: { id: number; name: string }[]
  status: string
  publishedAt: string | null
  updatedAt: string | null
  meta: Meta
}

export interface Testimonial {
  id: number
  quote: string
  clientName: string
  role: string | null
  company: string | null
  avatar: Media | null
  rating: number | null
  showOnHome: boolean
}

export type MediaBlockData = { media: Media | null; caption?: string | null }
export type LayoutBlock = { type: string; data: Record<string, unknown> }

export interface Page {
  id: number
  title: string
  slug: string
  pageHeaderEyebrow: string | null
  pageHeaderHeading: string | null
  pageHeaderDescription: string | null
  faqs: { question: string; answer: string }[]
  hero: {
    type: string
    eyebrow: string | null
    richText: string | null
    links: { label: string; url: string; appearance?: string }[]
    media: Media | null
  }
  layout: LayoutBlock[]
  status: string
  publishedAt: string | null
  updatedAt: string | null
  meta: Meta
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'force-cache' })

  if (!res.ok) {
    throw new Error(`Laravel API request failed: ${path} (${res.status})`)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

async function apiFetchOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'force-cache' })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Laravel API request failed: ${path} (${res.status})`)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

/**
 * Wraps an API call so a temporarily unreachable backend degrades to an
 * empty state instead of throwing. Used in two places:
 *
 *  - build time (generateStaticParams, sitemap), so a deploy can't fail
 *    just because the API wasn't reachable from the build machine
 *  - request time (page bodies, layout, blocks), so a backend outage
 *    renders the page's own empty state rather than a 500
 *
 * The error is always logged, so a real outage is still visible in logs
 * rather than silently swallowed.
 */
export async function safely<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.warn('[fastora] build-time API call failed, continuing without it:', error)
    return fallback
  }
}

export const getSiteSettings = () => apiFetch<SiteSettings>('/site-settings')
export const getHeader = () => apiFetch<Nav>('/header')
export const getFooter = () => apiFetch<Nav>('/footer')

export const getServices = (params?: { featuredOnHome?: boolean; limit?: number }) => {
  const qs = new URLSearchParams()
  if (params?.featuredOnHome) qs.set('featuredOnHome', '1')
  if (params?.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch<Service[]>(`/services${suffix}`)
}
export const getServiceBySlug = (slug: string) => apiFetchOrNull<Service>(`/services/${slug}`)

export const getCaseStudies = (params?: { featuredOnHome?: boolean; limit?: number }) => {
  const qs = new URLSearchParams()
  if (params?.featuredOnHome) qs.set('featuredOnHome', '1')
  if (params?.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch<CaseStudy[]>(`/case-studies${suffix}`)
}
export const getCaseStudyBySlug = (slug: string) => apiFetchOrNull<CaseStudy>(`/case-studies/${slug}`)

export const getPosts = (params?: { limit?: number }) => {
  const qs = new URLSearchParams()
  if (params?.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch<Post[]>(`/posts${suffix}`)
}
export const getPostBySlug = (slug: string) => apiFetchOrNull<Post>(`/posts/${slug}`)

export const getTestimonials = (params?: {
  showOnHome?: boolean
  relatedService?: number
  limit?: number
}) => {
  const qs = new URLSearchParams()
  if (params?.showOnHome) qs.set('showOnHome', '1')
  if (params?.relatedService) qs.set('relatedService', String(params.relatedService))
  if (params?.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch<Testimonial[]>(`/testimonials${suffix}`)
}

export const getPages = () => apiFetch<Page[]>('/pages')
export const getPageBySlug = (slug: string) => apiFetchOrNull<Page>(`/pages/${slug}`)
export const getPageSlugs = () => apiFetch<string[]>('/pages/slugs')

export interface ContactPayload {
  name: string
  email: string
  company?: string
  serviceNeeded?: number
  budgetRange?: string
  timeline?: string
  brief: string
  website?: string
}

export async function submitContact(
  payload: ContactPayload,
): Promise<{ success: true } | { error: string }> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const json = await res.json()
  if (!res.ok) {
    return { error: json?.error || 'Something went wrong. Please try again.' }
  }

  return json
}
