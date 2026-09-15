/**
 * GET /api/blog/posts - public list of published entries.
 * Ordered by created_at so ordering is stable; the `date` column holds a
 * display string and is not reliable for sorting.
 */
import { createClient } from '@libsql/client/web';
import { json, safeJson, type Env, databaseUrl, databaseToken } from '../_lib';

export const onRequestGet: PagesFunction<Env> = ({ env }) => safeJson(async () => {
    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const result = await db.execute(
        'SELECT id, title, category, excerpt, image, slug, date, created_at, likes ' +
        'FROM blog_posts ORDER BY created_at DESC',
    );
    return json(result.rows);
});
