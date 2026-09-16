/**
 * POST /api/blog/posts/:id/like
 *
 * Adds one to a post's like count and returns the new total.
 *
 * The stored number starts at a random value between 16 and 64, decided once
 * when the post is published and never recomputed. That decision is made in
 * this API, never in the browser, so the starting value cannot be read out of
 * the page, replayed or forged. All a visitor can do is add one.
 *
 * The increment is a single statement rather than read-then-write, so two
 * people liking at the same moment cannot lose a count.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, databaseUrl, databaseToken, type Env } from '../../../_lib';

/** Blunt protection against a script hammering the endpoint. */
const recent = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 60;

function tooMany(key: string): boolean {
    const now = Date.now();
    const record = recent.get(key);
    if (!record || record.resetAt < now) {
        recent.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    record.count += 1;
    return record.count > MAX_PER_WINDOW;
}

export const onRequestPost: PagesFunction<Env> = ({ request, env, params }) => safeJson(async () => {
    const id = String(params.id);
    if (!id) return badRequest('No post was named.');

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (tooMany(ip)) {
        return badRequest('Too many likes from this connection. Please try again later.', 429);
    }

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });

    // Match on the slug too, so a link shared by its slug still works
    const updated = await db.execute({
        sql: 'UPDATE blog_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ? OR slug = ?',
        args: [id, id],
    });
    if (!updated.rowsAffected) return badRequest('Post not found.', 404);

    const result = await db.execute({
        sql: 'SELECT likes FROM blog_posts WHERE id = ? OR slug = ?',
        args: [id, id],
    });
    const likes = Number((result.rows[0] as Record<string, unknown>)?.likes ?? 0);

    return json({ success: true, likes });
});
