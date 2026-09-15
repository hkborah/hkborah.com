/**
 * GET /api/chat/sessions
 *
 * Lists saved conversations for the editor. Admin only: transcripts are
 * private to the site owner, so this is behind the same signed-token check
 * as every other write path.
 */
import { createClient } from '@libsql/client/web';
import { json, safeJson, requireAuth, databaseUrl, databaseToken, type Env } from '../_lib';

/** Most recent first, capped so the response stays small. */
const MAX_ROWS = 100;

export const onRequestGet: PagesFunction<Env> = ({ request, env }) => safeJson(async () => {
    const denied = await requireAuth(request, env);
    if (denied) return denied;

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const result = await db.execute({
        sql: 'SELECT id, transcript, created_at FROM chat_sessions ORDER BY created_at DESC LIMIT ?',
        args: [MAX_ROWS],
    });

    const sessions = (result.rows as Array<Record<string, unknown>>).map((row) => {
        // Build a short preview rather than shipping every transcript to the
        // browser just to draw a list.
        let messages: Array<{ role: string; content: string }> = [];
        try {
            messages = JSON.parse(String(row.transcript || '[]'));
        } catch { /* a malformed row should not break the list */ }

        const firstQuestion = messages.find((m) => m.role === 'user');
        return {
            id: String(row.id),
            createdAt: row.created_at ? Number(row.created_at) * 1000 : null,
            messageCount: messages.length,
            preview: firstQuestion ? firstQuestion.content.slice(0, 140) : '(no question found)',
        };
    });

    return json(sessions);
});
