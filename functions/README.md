# Journal backend (Cloudflare Pages Functions)

These functions serve the blog API that `blog.html`, `blog-post.html` and
`admin.html` call. They are written for **Cloudflare Pages**, which is what
serves this static site, and they talk to the same libSQL/Turso database and
the same `blog_posts` / `users` tables as the original app.

## Why these exist instead of reusing the app's versions

The versions in the original repository had two serious holes:

1. **The login function issued an unsigned token.** It returned
   `btoa(JSON.stringify({...}))` with no signature, so anyone could mint an
   admin token by hand in a browser console.
2. **No write endpoint checked credentials.** `create`, `PUT` and `DELETE`
   wrote to the database with no `Authorization` check at all. Combined with
   (1), the blog was effectively open to the world.

There was also a **committed `JWT_SECRET`** in `.replit`, in a public
repository. Treat that value as compromised and rotate it.

These functions fix all three: tokens are HMAC-SHA256 signed and expiring,
every write calls `requireAuth`, and stored HTML is sanitised with
`HTMLRewriter` rather than a regex.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/config` | public | Google client ID for the sign-in button |
| POST | `/api/auth/login` | public | Google credential, or email + password |
| GET | `/api/blog/posts` | public | All entries, newest first |
| GET | `/api/blog/latest/:limit` | public | Most recent N entries |
| GET | `/api/blog/posts/:id` | public | One entry, by id or by slug |
| POST | `/api/blog/create` | **admin** | Publish a new entry |
| PUT | `/api/blog/posts/:id` | **admin** | Update an entry |
| DELETE | `/api/blog/posts/:id` | **admin** | Delete an entry |
| POST | `/api/contact` | public | About page enquiry form, emailed to you |
| POST | `/api/chat/save` | public | Stores a Digital Twin conversation when a visitor presses Save |
| GET | `/api/chat/sessions` | **admin** | Lists saved conversations with a preview |
| GET | `/api/chat/sessions/:id` | **admin** | One full conversation |
| DELETE | `/api/chat/sessions/:id` | **admin** | Deletes a conversation, for deletion requests |
| POST | `/api/chat/sessions/delete-multiple` | **admin** | Deletes a batch, or all of them with `{ all: true }` |
| POST | `/api/blog/posts/:id/like` | public | Adds one like, returns the new total |

Admin requests carry `Authorization: Bearer <token>`.

## Deploying

1. Put this `functions/` folder at the root of the Pages project, next to the
   HTML files. Pages picks it up automatically.
2. Add the runtime dependency:
   ```bash
   npm install @libsql/client bcryptjs
   ```
3. Set these as Pages environment variables (encrypted):

   | Variable | Required | Purpose |
   |---|---|---|
   | `DATABASE_URL` | yes | libSQL/Turso database URL. Alias: `TURSO_DATABASE_URL` |
   | `DATABASE_AUTH_TOKEN` | yes | Turso auth token. Alias: `TURSO_AUTH_TOKEN` |
   | `JWT_SECRET` | **yes** | Signs admin sessions. Generate a new, long random value |
   | `VITE_GOOGLE_CLIENT_ID` | yes | Google client ID. Alias: `GOOGLE_CLIENT_ID` |
   | `RESEND_API_KEY` | for the form | Sends the contact form |
   | `CONTACT_TO` | optional | Where enquiries are delivered. Defaults to `hkborah@gmail.com` |
   | `CONTACT_FROM` | optional | A sender on a Resend-verified domain |
   | `SITE_URL` | optional | Canonical base URL for the sitemap |

   The Turso and Google variables accept either name, so the `TURSO_*` and
   `GOOGLE_CLIENT_ID` names already used in the dashboard work as they are.

   `GOOGLE_CLIENT_SECRET` is **not used**. Sign-in verifies the Google ID token
   against Google's public endpoint, which needs no secret, and no authorisation
   code is exchanged. Setting it is harmless; it simply does nothing.

   `JWT_SECRET` is the one that bites if it is missing. Without it the site
   refuses admin sign-in and all writes with "Admin sign-in is not configured
   yet", rather than falling back to a guessable signing key. Generate it with
   `openssl rand -hex 64`.
   | `RESEND_API_KEY` | Sends the contact form (Resend) |
   | `CONTACT_TO` | Where enquiries go. Defaults to `email@hkborah.com` |
   | `CONTACT_FROM` | A sender on a Resend-verified domain |

   Generate the secret with something like `openssl rand -hex 64`.

## Database

The functions expect the existing tables. Nothing needs migrating.

`chat_sessions` holds saved conversations: `id`, `transcript` (a JSON array of
`{ role, content }`), and `created_at`. `/api/chat/save` is the only public
write path in the API, so it is throttled per address and capped at 60 messages
and 60,000 characters. No IP address or user agent is stored with a transcript,
which is what lets the site promise that no personal data is captured with one.

## Likes and publish dates

A post opens with a like count chosen at random between **16 and 64**. That
number is decided in `create.ts` when the post is published and stored, so it is
stable across visits. It is deliberately computed server-side: a value generated
in the browser could be read out of the page, and the visitor is only ever able
to add one to whatever is stored.

`/api/blog/posts/:id/like` increments with a single `UPDATE ... SET likes =
likes + 1`, so simultaneous likes cannot lose a count, and returns the stored
total for the page to display. There is no decrement and no way to set an
absolute value from the browser.

The publish date is auto-filled with today in the editor and can be changed
before publishing. It is stored in the `blog_posts.date` column as a display
string, the same shape the previous site used, so existing entries need no
migration.

## Saved conversations and privacy

A transcript is only written when a visitor presses Save, and the site says so
plainly on the Advice page, the homepage and in the privacy policy. Those three
places, plus `llms.txt`, describe storage in the same terms. **If the behaviour
ever changes, change all four together** — the site's credibility rests on the
disclosure matching what the code actually does.

```sql
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  slug TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  likes INTEGER DEFAULT 0
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  google_id TEXT
);
```

## Signing in

Only `hkborah@gmail.com` is permitted, matching the original allowlist.
Sign in with that Google account, or with an email and password already
stored in `users` (bcrypt hashes are supported, and a legacy plaintext
password is upgraded to a bcrypt hash on the first successful sign-in).

## Before you go live

- [ ] Rotate `JWT_SECRET` and remove the old committed value from the repo.
- [ ] Confirm `_headers` is deployed so the security headers apply.
- [ ] Test that a signed-out browser cannot create a post:
      `curl -X POST https://www.hkborah.com/api/blog/create -d '{}'`
      must answer `401`, never `201`.
- [ ] Images are downscaled in the browser before upload. If you later store
      originals, move them to object storage instead of the database.
- [ ] Verify a sending domain in Resend, then set `CONTACT_FROM` to an
      address on it. Until then the contact form will report that it is not
      configured rather than silently losing the message.
- [ ] Send yourself a test enquiry and reply to it, to confirm the reply
      address is carried through correctly.
