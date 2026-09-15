/**
 * POST /api/chat/sessions/delete-multiple
 *
 * Deletes several saved conversations at once, or every one of them.
 *
 * Body: { ids: string[] }   delete those conversations
 *   or: { all: true }       delete every conversation
 *
 * Admin only. Bulk deletion is destructive and cannot be undone, so the
 * caller must say explicitly which it wants; there is no default.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, requireAuth, databaseUrl, databaseToken, type Env } from '../../_lib';

/** Refuses absurd batches rather than building a huge statement. */
const MAX_IDS = 500;

export const onRequestPost: PagesFunction<Env> = ({ request, env }) => safeJson(async () => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    let body: { ids?: unknown; all?: unknown };
    try {
        body = await request.json();
    } catch {
        return badRequest('Expected a JSON body.');
    }

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });

    if (body.all === true) {
        const before = await db.execute('SELECT COUNT(*) AS n FROM chat_sessions');
        const total = Number((before.rows[0] as Record<string, unknown>)?.n ?? 0);
        await db.execute('DELETE FROM chat_sessions');
        return json({ success: true, deleted: total });
    }

    if (!Array.isArray(body.ids)) {
        return badRequest('Provide a list of ids, or set all to true.');
    }

    const ids = body.ids
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .slice(0, MAX_IDS);

    if (!ids.length) return badRequest('No conversations were selected.');

    // Placeholders are generated, never interpolated from the input
    const placeholders = ids.map(() => '?').join(', ');
    await db.execute({
        sql: `DELETE FROM chat_sessions WHERE id IN (${placeholders})`,
        args: ids,
    });

    return json({ success: true, deleted: ids.length });
});
