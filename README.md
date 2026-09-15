# hkborah.com

The website of HK Borah, business architect. Books for knowledge, a free Digital
Twin for advice, and paid execution when a business is ready to move.

Built as static HTML with a shared design system, plus serverless functions for the
journal, the contact form and the sitemap. No front-end framework, no build step for
the pages themselves.

## What is here

```
index.html                        Home
knowledge.html                    The three books
advice.html                       The free Digital Twin
execution.html                    Diagnostics and the four routes to execution
execution/business-upgrade.html   The Business Loop and the nine seats
execution/people-development.html Diagnose, build, install the rhythm
about.html                        Background, portrait, contact form
blog.html                         Journal listing
blog-post.html                    A single journal entry
privacy.html  terms.html          Plain-language policies
admin.html                        Private journal editor (noindex, not linked publicly)

assets/
  hk.css            The whole design system, hand-authored and commented
  hk.js             Shared behaviour: reveals, tabs, chat, self-check, motion switch
  hk-blog.js        Journal reader
  hk-admin.js       Journal editor
  hk-pdf.js         Branded PDF of a Digital Twin conversation
  books/  logos/  people/  social/  stores/  vendor/

functions/          Cloudflare Pages Functions (see functions/README.md)
  api/_lib.ts       Signed tokens, auth guard, HTML sanitiser
  api/auth/login.ts Admin sign in (Google, or email and password)
  api/blog/*        Journal read and write endpoints
  api/contact.ts    Contact form, delivered by email
  sitemap.xml.ts    Sitemap generated at the edge, including journal entries

robots.txt  sitemap.xml  llms.txt  _headers  _redirects
_archive/           Superseded code, kept for reference. Never served.
```

## Running it locally

The pages are plain files, so any static server works:

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765. The pages, their styles and their scripts all work.
The journal, the contact form and the sitemap need the functions, which run under
Cloudflare's tooling rather than a plain file server:

```bash
npx wrangler pages dev .
```

## Deploying

Target is Cloudflare Pages. Publish the repository root; `functions/` is picked up
automatically and becomes the API.

Environment variables to set (encrypted):

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | journal | libSQL/Turso database URL |
| `DATABASE_AUTH_TOKEN` | journal | Turso auth token |
| `JWT_SECRET` | admin | Signs admin sessions. Long and random |
| `VITE_GOOGLE_CLIENT_ID` | admin | Google sign-in button |
| `RESEND_API_KEY` | contact form | Sends enquiries |
| `CONTACT_TO` | contact form | Where enquiries go |
| `CONTACT_FROM` | contact form | A sender on a verified domain |
| `SITE_URL` | sitemap | Canonical base URL |

`functions/README.md` covers the API, the database schema and the pre-launch checks.

## Design system

Everything visual lives in `assets/hk.css`, organised in numbered sections. The
palette is deliberately small: a near-black page, one elevated panel tone, hairline
borders, a warm grey for body text, and a single vermilion accent. Type is Inter for
body and Space Grotesk for display, with uppercase monospace micro-labels.

Drawn diagrams are inline SVG. They share a stroke grammar (hairline frames, white
data lines, vermilion for risk, hatched fills for liability, marching dashes for
flow) and animate on scroll. All motion respects the header's Motion toggle and the
operating system's reduced-motion setting.

## Notes

- Security: every page ships a strict Content Security Policy. Chat replies and
  journal entries are sanitised before they reach the page. Admin tokens are signed
  and expiring. See `_headers` for the server-side policy.
- SEO and AI: each page carries Open Graph and Twitter tags, canonical URL, and
  structured data with breadcrumbs. `llms.txt` summarises the site for AI assistants,
  including an explicit statement of the Digital Twin's limits.
- `_archive/` holds superseded scripts and earlier versions. It is excluded from
  search engines and redirected away, but if you prefer a clean repository, delete it.
