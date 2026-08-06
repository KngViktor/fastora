// The Laravel API serves media from whatever host APP_URL points at (its
// local "public" disk resolves to an absolute URL) — allow that host for
// Next's image optimizer without hardcoding it, since it differs between
// local dev (127.0.0.1:8123) and wherever the API is eventually deployed.
const laravelMediaHost = (() => {
  try {
    return new URL(process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000').hostname
  } catch {
    return null
  }
})()

const isDev = process.env.NODE_ENV === 'development'

/** The media host as a CSP source, protocol included, or nothing if unparseable. */
const laravelMediaOrigin = (() => {
  try {
    return new URL(process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000').origin
  } catch {
    return null
  }
})()

/**
 * Google's analytics hosts, listed once and reused across the directives.
 *
 * Harmless while GA is switched off: naming a host in a CSP permits a request, it
 * does not make one. Keeping them here unconditionally means turning analytics on
 * is purely an environment-variable change, with no risk of the tag being loaded
 * and then blocked by a policy that was built without it.
 */
const GOOGLE_ANALYTICS_HOSTS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
]

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is in script-src deliberately, not by oversight. The
 * alternative is a per-request nonce, which requires every page to be rendered
 * dynamically — that would trade away the static generation this whole site is
 * built on, for a marginal gain. What the policy still buys with inline allowed:
 * scripts, connections and frames are restricted to a named set of hosts, so an
 * injected payload cannot pull in remote code or exfiltrate to an attacker's
 * domain, and the site cannot be framed for clickjacking.
 *
 * style-src also needs it, for the brand-token <style> block the layout renders
 * from the CMS colour settings.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    // React Refresh and the webpack dev runtime both eval.
    isDev ? "'unsafe-eval'" : '',
    ...GOOGLE_ANALYTICS_HOSTS,
  ]
    .filter(Boolean)
    .join(' '),
  "style-src 'self' 'unsafe-inline'",
  // next/font self-hosts, so no external font origin is needed.
  "font-src 'self' data:",
  ['img-src', "'self'", 'data:', 'blob:', laravelMediaOrigin, ...GOOGLE_ANALYTICS_HOSTS]
    .filter(Boolean)
    .join(' '),
  [
    'connect-src',
    "'self'",
    laravelMediaOrigin,
    // The dev server's HMR socket.
    isDev ? 'ws: wss:' : '',
    ...GOOGLE_ANALYTICS_HOSTS,
  ]
    .filter(Boolean)
    .join(' '),
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join('; ')
  .concat(';')

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Security headers on every response.
   *
   * These belong in the app rather than the host's config because the frontend is
   * deployed by pushing code, and a header set here travels with the deploy
   * instead of having to be re-applied in a control panel nobody remembers.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          // Stops browsers second-guessing a declared Content-Type, which is how a
          // harmless-looking upload gets executed as script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Belt and braces with frame-ancestors, for anything that predates CSP.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Send the origin to other sites but the full path within our own, so
          // outbound links cannot leak query strings.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Nothing here uses these, so decline them rather than leaving the
          // permission available to any injected script.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
        ],
      },
    ]
  },

  images: {
    qualities: [75, 100],
    localPatterns: [
      // Kept for any media the API returns as a relative path rather than an
      // absolute URL, which happens when the backend's APP_URL is unset in
      // local development. getMediaUrl() passes those through untouched so
      // Next treats them as local and skips remotePatterns, which since
      // Next.js 16 refuses private IPs. No `search` key, so any cache-busting
      // query string on this path is allowed rather than matched literally.
      {
        pathname: '/api/media/file/**',
      },
      // Static brand assets (logo/icon/favicon) served straight from /public.
      {
        pathname: '/brand/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      ...(laravelMediaHost
        ? [
            {
              protocol: laravelMediaHost === 'localhost' || laravelMediaHost === '127.0.0.1' ? 'http' : 'https',
              hostname: laravelMediaHost,
            },
          ]
        : []),
    ],
  },

  /**
   * The ten services became four, with the old names now listed as what each
   * parent covers rather than pages of their own. These nine URLs were live and
   * indexed, so they redirect to the service that absorbed them instead of
   * 404ing.
   *
   * Permanent, because the move is permanent: a 301 passes on the search ranking
   * the old URL had earned, where a 302 would strand it.
   */
  async redirects() {
    const reparented = {
      'strategic-communications': 'communications-strategy',
      'communication-advisory': 'communications-strategy',
      'reputation-management': 'communications-strategy',
      'brand-consulting': 'brand-positioning',
      'founder-branding': 'brand-positioning',
      'content-strategy': 'content-and-storytelling',
      copywriting: 'content-and-storytelling',
      'social-media-management': 'digital-marketing',
      'marketing-strategy': 'digital-marketing',
    }

    return Object.entries(reparented).map(([from, to]) => ({
      source: `/services/${from}`,
      destination: `/services/${to}`,
      permanent: true,
    }))
  },
}

export default nextConfig
