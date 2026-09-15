/** GET /api/blog/latest/:limit - the most recent entries. */
import { createClient } from '@libsql/client/web';
import { json, type Env } from '../../_lib';

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
    const requested = Number(params.limit);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 50) : 4;

    const db = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
    const result = await db.execute({
        sql: 'SELECT id, title, category, excerpt, image, slug, date, created_at, likes ' +
             'FROM blog_posts ORDER BY created_at DESC LIMIT ?',
        args: [limit],
    });
    return json(result.rows);
};
