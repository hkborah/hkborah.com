/**
 * GET /api/blog/posts - public list of published entries.
 * Ordered by created_at so ordering is stable; the `date` column holds a
 * display string and is not reliable for sorting.
 */
import { createClient } from '@libsql/client/web';
import { json, safeJson, imageUrl, type Env, databaseUrl, databaseToken } from '../_lib';

export const onRequestGet: PagesFunction<Env> = ({ env }) => safeJson(async () => {
    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const result = await db.execute(
        'SELECT id, title, category, excerpt, image, slug, date, created_at, likes ' +
        'FROM blog_posts ORDER BY created_at DESC',
    );

    // Each stored picture is a base64 data URI. Sending them all inline made
    // this response 7.6MB for 79 entries, so every row gets its own image URL
    // instead. The browser then fetches each picture separately, and only when
    // the card is actually on screen.
    const posts = result.rows.map((row) => ({
        ...row,
        image: imageUrl(String(row.id), String(row.image ?? '')),
    }));

    return json(posts);
});
