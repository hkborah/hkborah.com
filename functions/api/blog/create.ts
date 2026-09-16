/**
 * POST /api/blog/create - publish a new entry (admin only).
 * The original version checked no credentials at all.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, requireAuth, sanitizeHtml, buildExcerpt, slugify,
    pickPostFields, type Env, databaseUrl, databaseToken } from '../_lib';

export const onRequestPost: PagesFunction<Env> = ({ request, env }) => safeJson(async () => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

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

    const id = crypto.randomUUID();
    const slug = fields.slug || slugify(fields.title);

    // A post opens with a believable number of likes rather than zero. The
    // starting value is chosen here and stored, so it is stable across visits
    // and cannot be read out of the page or recomputed by a visitor.
    const startingLikes = 16 + Math.floor(Math.random() * 49); // 16 to 64

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    await db.execute({
        sql: 'INSERT INTO blog_posts (id, title, category, excerpt, content, image, slug, date, likes) ' +
             'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
            id,
            fields.title,
            fields.category,
            buildExcerpt(content),
            content,
            fields.image,
            slug,
            fields.date,
            startingLikes,
        ],
    });

    return json({ success: true, id, slug }, 201);
});
