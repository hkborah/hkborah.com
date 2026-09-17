/**
 * Shared helpers for the journal API (Cloudflare Pages Functions).
 *
 * Two jobs:
 *   1. Sign and verify admin tokens properly. The original implementation
 *      returned `btoa(JSON.stringify({...}))` with no signature, so anyone
 *      could mint an admin token by hand.
 *   2. Sanitise entry HTML on write, using HTMLRewriter rather than regex,
 *      because regex sanitisers are routinely bypassed.
 */

/** Minimal shape of the Pages environment we rely on. */
export interface Env {
    /* Canonical names, as documented in the README. */
    DATABASE_URL?: string;
    DATABASE_AUTH_TOKEN?: string;
    VITE_GOOGLE_CLIENT_ID?: string;
    JWT_SECRET?: string;
    SITE_URL?: string;

    /* Aliases, so either naming works in the dashboard. */
    TURSO_DATABASE_URL?: string;
    TURSO_AUTH_TOKEN?: string;
    GOOGLE_CLIENT_ID?: string;
}

/* Configuration is resolved in one place, so the alias rules live here
   rather than in every handler. */

export function databaseUrl(env: Env): string {
    return env.DATABASE_URL || env.TURSO_DATABASE_URL || '';
}

export function databaseToken(env: Env): string {
    return env.DATABASE_AUTH_TOKEN || env.TURSO_AUTH_TOKEN || '';
}

export function googleClientId(env: Env): string {
    return env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || '';
}

/** The only account allowed into the editor. */
const SUPER_ADMIN = 'hkborah@gmail.com';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}

export function badRequest(message: string, status = 400): Response {
    return json({ error: message }, status);
}

/**
 * Runs journal work and turns an outage into a clean 503.
 * Without this an unreachable database surfaces as a 500 and a stack trace.
 */
export async function safeJson(work: () => Promise<Response>): Promise<Response> {
    try {
        return await work();
    } catch (error) {
        console.error('Journal database error:', error);
        return json({ error: 'The journal is temporarily unavailable.' }, 503);
    }
}

/* ------------------------------------------------------------------ */
/* Tokens: base64url(payload) + "." + base64url(HMAC-SHA256)           */
/* ------------------------------------------------------------------ */

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(value: string): Uint8Array {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
    );
}

/** Issues a signed, expiring token. */
export async function signToken(username: string, secret: string): Promise<string> {
    const payload = b64url(encoder.encode(JSON.stringify({
        sub: username,
        exp: Date.now() + TOKEN_TTL_MS,
    })));
    const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload));
    return `${payload}.${b64url(new Uint8Array(signature))}`;
}

/** Returns the payload when the signature and expiry are valid, else null. */
export async function verifyToken(token: string, secret: string): Promise<{ sub: string } | null> {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const valid = await crypto.subtle.verify(
        'HMAC', await hmacKey(secret), unb64url(signature), encoder.encode(payload),
    );
    if (!valid) return null;

    try {
        const data = JSON.parse(new TextDecoder().decode(unb64url(payload)));
        if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
        return data;
    } catch {
        return null;
    }
}

/** Reads the Bearer token from a request and verifies it. */
export async function requireAuth(request: Request, env: Env): Promise<Response | null> {
    // Fail closed. Without a secret the signature check would use a guessable
    // value, which is worse than refusing the request outright.
    if (!env.JWT_SECRET) {
        console.error('JWT_SECRET is not set. Refusing admin requests.');
        return badRequest('Admin sign-in is not configured yet.', 503);
    }

    const header = request.headers.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return badRequest('Authentication required.', 401);

    const payload = await verifyToken(token, env.JWT_SECRET);
    if (!payload) return badRequest('Invalid or expired session.', 403);
    if (payload.sub !== SUPER_ADMIN) return badRequest('Not permitted.', 403);
    return null; // authorised
}

/* ------------------------------------------------------------------ */
/* Sanitising                                                          */
/* ------------------------------------------------------------------ */

/** Elements that must never survive into a stored entry. */
const BLOCKED_ELEMENTS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'link', 'meta', 'base'];

/** Attributes allowed to remain on written content. */
const ALLOWED_ATTRS = new Set(['href', 'title', 'alt', 'src', 'target', 'rel']);

/**
 * Strips dangerous markup from authored HTML.
 * HTMLRewriter parses the document properly, so malformed or obfuscated
 * markup cannot slip past the way it can with regular expressions.
 */
export async function sanitizeHtml(html: string): Promise<string> {
    let rewriter = new HTMLRewriter();

    // Drop whole dangerous subtrees
    for (const tag of BLOCKED_ELEMENTS) {
        rewriter = rewriter.on(tag, {
            element(element) { element.remove(); },
        });
    }

    // Clean attributes on everything that remains
    rewriter = rewriter.on('*', {
        element(element) {
            for (const [name, value] of element.attributes) {
                const lower = name.toLowerCase();

                // Drop event handlers and anything not on the allowlist
                if (lower.startsWith('on') || !ALLOWED_ATTRS.has(lower)) {
                    element.removeAttribute(name);
                    continue;
                }
                // Neutralise script-bearing URLs
                if ((lower === 'href' || lower === 'src')
                    && /^\s*(javascript|data|vbscript):/i.test(value)) {
                    element.removeAttribute(name);
                }
            }
            // External links open safely
            if (element.hasAttribute('href')) {
                element.setAttribute('rel', 'noopener noreferrer');
            }
        },
    });

    const cleaned = await rewriter.transform(new Response(html)).text();
    return cleaned;
}

/** Plain-text excerpt derived from entry HTML. */
export function buildExcerpt(html: string, limit = 100): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

/**
 * Short, stable fingerprint of a stored image.
 *
 * An entry keeps its picture as a base64 data URI inside the row, so there is
 * no filename and no file date to version a URL with. This stands in for one:
 * it goes in the image URL, which lets that URL be cached hard and still serve
 * fresh bytes the moment the picture is replaced.
 */
export function imageFingerprint(image: string): string {
    // FNV-1a. Tiny, and enough to tell one picture from another.
    let hash = 0x811c9dc5;
    for (let index = 0; index < image.length; index += 1) {
        hash ^= image.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(36);
}

/**
 * Turns a stored image value into something a page or a crawler can fetch.
 *
 * Data URIs are never handed out: they made the list endpoint 7.6MB of JSON,
 * and LinkedIn and WhatsApp refuse to fetch one at all, which is why a shared
 * entry showed the site's card instead of the entry's picture. A stored data
 * URI becomes the entry's own image URL. An ordinary URL or path passes through.
 */
export function imageUrl(id: string, image: string): string {
    const value = (image || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || !value.startsWith('data:')) return value;
    return `/api/blog/posts/${encodeURIComponent(id)}/image?v=${imageFingerprint(value)}`;
}

/** URL-safe slug derived from a title. */
export function slugify(title: string): string {
    return title.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

/** Field whitelist so a request body can never set unexpected columns. */
export function pickPostFields(body: Record<string, unknown>) {
    const title = String(body.title ?? '').trim().slice(0, 200);
    return {
        title,
        category: String(body.category ?? '').trim().slice(0, 60),
        content: String(body.content ?? ''),
        image: String(body.image ?? ''),
        slug: String(body.slug ?? '') || slugify(title),
        date: String(body.date ?? ''),
    };
}
