/**
 * GET /api/blog/posts/:id/image
 *
 * Serves an entry's picture as an image file.
 *
 * Entries keep their picture inside the row as a base64 data URI. An <img>
 * tag renders that happily, but two things break because of it:
 *
 *   1. LinkedIn, WhatsApp, Slack and the rest will not fetch a data URI, so a
 *      shared entry showed the site's card instead of the entry's picture.
 *   2. Every list request carried all 79 pictures inline, which came to 7.6MB
 *      of JSON before the page could start drawing.
 *
 * Handing the same bytes out as a normal image response fixes both.
 *
 * Only data URIs from our own table are ever served. An external URL is never
 * fetched, so this cannot be turned into a proxy for someone else's server.
 */
import { createClient } from '@libsql/client/web';
import { badRequest, safeJson, headOf, databaseUrl, databaseToken, type Env } from '../../../_lib';

/** Picture types the editor produces, and the only ones served back. */
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Splits a stored data URI into bytes and a content type, or null. */
function decodeDataImage(value: string): { bytes: Uint8Array; type: string } | null {
    const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(value.trim());
    if (!match) return null;

    const type = match[1].toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return null;

    try {
        const binary = atob(match[2]);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return { bytes, type };
    } catch {
        return null;   // malformed base64
    }
}

export const onRequestGet: PagesFunction<Env> = ({ env, params }) => safeJson(async () => {
    const id = String(params.id);
    if (!id) return badRequest('No entry was named.', 404);

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    let result = await db.execute({ sql: 'SELECT image FROM blog_posts WHERE id = ?', args: [id] });
    if (result.rows.length === 0) {
        result = await db.execute({ sql: 'SELECT image FROM blog_posts WHERE slug = ?', args: [id] });
    }

    const row = result.rows[0] as Record<string, unknown> | undefined;
    const decoded = decodeDataImage(String(row?.image ?? ''));
    if (!decoded) return badRequest('That entry has no picture.', 404);

    return new Response(decoded.bytes, {
        headers: {
            'Content-Type': decoded.type,
            // The URL carries a fingerprint of the picture, so a new picture is
            // a new URL and this one can be cached for good.
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
});

/* Crawlers ask whether a picture exists before fetching it. Answer the question
   rather than 404: see headOf. */
export const onRequestHead: PagesFunction<Env> = (context) => headOf(() => onRequestGet(context));
