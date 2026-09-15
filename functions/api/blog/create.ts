/**
 * POST /api/blog/create - publish a new entry (admin only).
 * The original version checked no credentials at all.
 */
import { createClient } from '@libsql/client/web';
import {
    json, badRequest, requireAuth, sanitizeHtml, buildExcerpt, slugify, pickPostFields,
    type Env,
} from '../_lib';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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

    const db = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
    await db.execute({
        sql: 'INSERT INTO blog_posts (id, title, category, excerpt, content, image, slug, date, likes) ' +
             'VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
        args: [
            id,
            fields.title,
            fields.category,
            buildExcerpt(content),
            content,
            fields.image,
            slug,
            fields.date,
        ],
    });

    return json({ success: true, id, slug }, 201);
};
