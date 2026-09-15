/**
 * /api/chat/sessions/:id
 *
 *   GET     the full conversation (admin only)
 *   DELETE  remove it (admin only)
 *
 * The delete path exists so a visitor who asks for their transcript to be
 * removed can actually have that happen.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, requireAuth, databaseUrl, databaseToken, type Env } from '../../_lib';

export const onRequestGet: PagesFunction<Env> = ({ request, env, params }) => safeJson(async () => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const result = await db.execute({
        sql: 'SELECT id, transcript, created_at FROM chat_sessions WHERE id = ?',
        args: [String(params.id)],
    });
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) return badRequest('Conversation not found.', 404);

    let messages: unknown = [];
    try {
        messages = JSON.parse(String(row.transcript || '[]'));
    } catch { /* return what we have rather than failing */ }

    return json({
        id: String(row.id),
        createdAt: row.created_at ? Number(row.created_at) * 1000 : null,
        messages,
    });
});

export const onRequestDelete: PagesFunction<Env> = ({ request, env, params }) => safeJson(async () => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    await db.execute({ sql: 'DELETE FROM chat_sessions WHERE id = ?', args: [String(params.id)] });
    return json({ success: true });
});
