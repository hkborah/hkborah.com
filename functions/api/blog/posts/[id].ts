/**
 * /api/blog/posts/:id
 *
 *   GET     by id, falling back to slug (public)
 *   PUT     update (admin only)
 *   DELETE  remove (admin only)
 *
 * Writes were completely unauthenticated in the original implementation.
 * They now require a signed admin token, and entry HTML is sanitised
 * before it is stored.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, requireAuth, sanitizeHtml, buildExcerpt, slugify,
    pickPostFields, type Env, databaseUrl, databaseToken } from '../../_lib';

/** Largest accepted entry body. The original allowed 50MB of base64 images. */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

async function findPost(env: Env, id: string) {
    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    let result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE id = ?', args: [id] });
    if (result.rows.length === 0) {
        result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE slug = ?', args: [id] });
    }
    return result.rows[0] as Record<string, unknown> | undefined;
}

export const onRequestGet: PagesFunction<Env> = ({ env, params }) => safeJson(async () => {
    const post = await findPost(env, String(params.id));
    return post ? json(post) : badRequest('Post not found.', 404);
});

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    const id = String(params.id);
    if (!(await findPost(env, id))) return badRequest('Post not found.', 404);

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return badRequest('Expected a JSON body.');
    }

    const fields = pickPostFields(body);
    if (!fields.title) return badRequest('A headline is required.');

    const content = await sanitizeHtml(fields.content);
    if (content.replace(/<[^>]*>/g, '').trim().length < 20) {
        return badRequest('The entry is too short to publish.');
    }

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    await db.execute({
        sql: 'UPDATE blog_posts SET title = ?, category = ?, excerpt = ?, content = ?, ' +
             'image = ?, slug = ?, date = ? WHERE id = ?',
        args: [
            fields.title,
            fields.category,
            buildExcerpt(content),
            content,
            fields.image.slice(0, MAX_BODY_BYTES),
            fields.slug || slugify(fields.title),
            fields.date,
            id,
        ],
    });

    return json({ success: true, id });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    const id = String(params.id);
    if (!(await findPost(env, id))) return badRequest('Post not found.', 404);

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    await db.execute({ sql: 'DELETE FROM blog_posts WHERE id = ?', args: [id] });
    return json({ success: true });
};
