/** GET /api/blog/latest/:limit - the most recent entries. */
import { createClient } from '@libsql/client/web';
import { json, safeJson, type Env, databaseUrl, databaseToken } from '../../_lib';

export const onRequestGet: PagesFunction<Env> = ({ env, params }) => safeJson(async () => {
    const requested = Number(params.limit);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 50) : 4;

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const result = await db.execute({
        sql: 'SELECT id, title, category, excerpt, image, slug, date, created_at, likes ' +
             'FROM blog_posts ORDER BY created_at DESC LIMIT ?',
        args: [limit],
    });
    return json(result.rows);
});
