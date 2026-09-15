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
  api/auth/login.ts Admin sign in (Google)
  api/blog/*        Journal read and write endpoints
  api/contact.ts    Contact form, delivered by email
  api/chat/save.ts  Stores a Digital Twin conversation when a visitor saves it
  api/chat/sessions Admin list, read, delete and bulk-delete for transcripts
  sitemap.xml.ts    Sitemap generated at the edge, including journal entries

robots.txt  sitemap.xml  llms.txt  _headers  _redirects
_archive/           Superseded code, kept for reference. Never served.
```

## Running it locally

```bash
npm run dev:site
```

That starts Cloudflare's own dev server (wrangler), which serves the pages *and*
the functions, and reproduces Cloudflare's URL handling. Use it rather than a plain
file server: Cloudflare serves these pages without the `.html` extension, so
`/advice` is the real URL and `/advice.html` redirects to it. A basic static server
such as `python3 -m http.server` cannot resolve `/advice` and every link will 404.

Create a `.dev.vars` file for local secrets (it is gitignored). It mirrors the
environment variables below, for example:

```
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-token
JWT_SECRET=a-long-random-string
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
RESEND_API_KEY=your-key
CONTACT_TO=email@hkborah.com
CONTACT_FROM=HK Borah Website <website@hkborah.com>
```

## Deploying

Target is Cloudflare Pages. Connect the GitHub repository
(`hkborah/hkborah.com`) in the Pages dashboard. `functions/` is picked up
automatically and becomes the API.

### The settings, exactly

| Setting | Value |
|---|---|
| Framework preset | **None** |
| Build command | **`npm ci`** |
| Build output directory | **`/`** |
| Root directory | `/` (default) |

**`npm ci` is required even though nothing is compiled.** Cloudflare only runs
`npm install` when a build command is present. Leave the box empty and the
dependencies are never installed, so bundling the Functions fails with
`Could not resolve "@libsql/client/web"` and `Could not resolve "bcryptjs"`.
The command installs packages and builds nothing; the site is served as-is from
the output directory.

Do not use `npm run build`. That script belonged to the retired React app and
has been removed: it emitted only `index.html` and `assets/`, silently dropping
every other page along with `_headers`, `_redirects`, `_routes.json`, `404.html`,
`robots.txt`, `llms.txt` and `sitemap.xml`.

To publish from a terminal instead of Git, use:

```bash
npm run deploy          # -> wrangler pages deploy .
```

That path bundles the Functions locally, so it does not need the build command.
Note that `wrangler deploy` (without `pages`) is the Workers command and will not
publish this site.

### Google sign-in and the domain

The editor signs in with Google, which checks the page's origin. Every origin you
use must be listed in Google Cloud Console under **APIs & Services → Credentials →
your OAuth client → Authorized JavaScript origins**. Add all of these:

```
https://www.hkborah.com
https://hkborah.com
https://hkborah-com.pages.dev
```

An unlisted origin produces `origin_mismatch` or `401: invalid_client` at sign-in.
Google does not accept wildcards, so per-deployment preview URLs
(`https://<hash>.hkborah-com.pages.dev`) will not work until you either add them
individually or use the project's stable alias. Test on the alias, not a preview
URL. `VITE_GOOGLE_CLIENT_ID` must be the same client ID that the origins belong to,
because the server also checks that the token was issued for it.

Only `hkborah@gmail.com` is permitted to sign in, matching the allowlist in
`functions/api/auth/login.ts`.

Environment variables to set (encrypted):

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | journal | Alias: `TURSO_DATABASE_URL` |
| `DATABASE_AUTH_TOKEN` | journal | Alias: `TURSO_AUTH_TOKEN` |
| `JWT_SECRET` | admin | **Required.** Without it, sign-in and every write return "not configured yet" |
| `VITE_GOOGLE_CLIENT_ID` | admin | Alias: `GOOGLE_CLIENT_ID` |
| `RESEND_API_KEY` | contact form | Enquiries are not sent without it |
| `CONTACT_TO` | contact form | Delivery address. Defaults to `hkborah@gmail.com` |
| `CONTACT_FROM` | contact form | A sender on a Resend-verified domain |
| `SITE_URL` | sitemap | Canonical base URL |

`GOOGLE_CLIENT_SECRET` is not used: sign-in verifies the ID token against
Google's public endpoint and exchanges no authorisation code, so no secret is
involved.

Note the two addresses differ on purpose. The site **publishes**
`email@hkborah.com`, and the contact form **delivers** to `hkborah@gmail.com`,
which is the mailbox that is actually read. Point `CONTACT_TO` somewhere else
whenever the branded address starts working, and update the published address
across the site at the same time.

`functions/README.md` covers the API, the database schema and the pre-launch checks.

## Navigation

One navigation, identical on every page, generated per page so only the current
item carries `aria-current`. **Resist editing it by hand per page**: doing that is
how Blog went missing from two pages without anyone noticing.

Execution is a group that reveals its two practices on hover or keyboard focus,
with no JavaScript: `:focus-within` gives a keyboard user the same links a mouse
user sees. On the mobile stacked navigation there is no hover, so the two links
are shown inline instead of hidden behind an interaction that cannot happen.

## The editor

Sign in with Google as `hkborah@gmail.com`; that account is the allowlist. The
page is split into two tabs, **Blog editor** and **Saved conversations**, using
the same tab component as the rest of the site.

The login function still accepts an email and password with a bcrypt hash, but
nothing in the page calls it any more, so in practice Google is the only route.
Remove that branch from `functions/api/auth/login.ts` and drop `bcryptjs` if
you want the surface reduced to what is actually used.

## Shipping a change to CSS or JS

Assets are cached for ten minutes rather than immutably, because there is no
build step to hash filenames. Freshness comes from the version query on each
reference, so **when you change `hk.css`, `hk.js`, `hk-admin.js`, `hk-blog.js`
or `hk-pdf.js`, bump the version in all of them together**:

```
assets/hk.css?v=26      assets/hk.js?v=26
assets/hk-admin.js?v=26 assets/hk-blog.js?v=26
assets/hk-pdf.js?v=26   (imported from hk.js)
```

Forgetting leaves returning visitors on the old file until the ten-minute
ceiling expires, which is why that ceiling exists.

Do not add more specific rules under `/assets/` in `_headers`. Cloudflare
concatenates overlapping rules into one malformed header instead of letting
the specific rule win, which silently broke caching and, earlier, the CSP.

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
