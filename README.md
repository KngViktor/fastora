# Fastora

Communications and digital strategy consultancy site. Next.js 16 frontend, reading all content from a separate Laravel + Filament backend.

## How the two halves fit together

This repository is **frontend only**. It renders pages and knows nothing about a database.

| | Repo | Lives at |
|---|---|---|
| Frontend (this repo) | `KngViktor/fastora` | `fastora.africa` |
| Backend, CMS and API | `KngViktor/Fastorabackend` | `api.fastora.africa`, admin at `/admin` |

Content flows one way: editors work in the Filament admin on the backend, which serves JSON from `api.fastora.africa/api`, which this app fetches. To change page copy, images, services, case studies, posts, colours or the logo, use the backend admin — nothing here needs editing.

Requests are one-way, so a backend outage degrades this site rather than breaking it: every fetch goes through `safely()` in [`src/lib/api.ts`](src/lib/api.ts), which retries transient 5xx and then falls back to an empty state.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Resend** for the contact-form notification email
- No database, no ORM, no CMS in this repo

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values.
3. Start the backend first, so there is an API to read from — see that repo's README.
4. `npm run dev`, then open `http://localhost:3000`.

The site renders without the backend running, just with empty content and warnings in the terminal.

### Environment variables

Documented inline in [`.env.example`](.env.example). The ones that matter:

| Variable | Notes |
|---|---|
| `LARAVEL_API_URL` | Base URL of the backend API, including `/api`. Server-side only — never exposed to the browser. |
| `NEXT_PUBLIC_SERVER_URL` | This site's own public URL. Used for absolute URLs in the sitemap, JSON-LD and meta tags. |
| `FASTORA_API_TOKEN` | Shared secret the backend presents when calling `/api/revalidate` to flush caches after an edit. Must match the backend's `FASTORA_API_TOKEN`. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL` | Contact-form notification email. Optional — without them submissions still reach the backend, they just do not send an email. |

## Deploying

Any Node host works; there is nothing to migrate and no database to provision.

1. Point the host at this repo and let it run `npm ci && npm run build`.
2. Set every variable from `.env.example` in the host's environment, with `LARAVEL_API_URL` pointing at the live API.
3. For a Passenger-style host (Hostinger), the start command is `npm run start:server`, which runs [`server.js`](server.js). On Vercel, no start command is needed.

Deploy the backend before the first frontend build, otherwise the build will succeed with empty content and you will need to redeploy to pick it up.

## Editing content

Everything is in the backend admin at `api.fastora.africa/admin`:

- **Page text and images** — Pages → Home, About or Contact
- **Services, case studies, posts, testimonials** — their own sections in the sidebar
- **Logo, colours, contact details, social links** — Site Settings
- **Contact form submissions** — Enquiries
- **SEO title, description, canonical URL, noindex** — the SEO tab on any of the above

Saving triggers a revalidation call to this app, so changes appear without a redeploy.
