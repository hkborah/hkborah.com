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
    DATABASE_URL: string;
    DATABASE_AUTH_TOKEN: string;
    JWT_SECRET: string;
    VITE_GOOGLE_CLIENT_ID?: string;
    SITE_URL?: string;
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
