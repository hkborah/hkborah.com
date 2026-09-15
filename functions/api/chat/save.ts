/**
 * POST /api/chat/save
 *
 * Stores a Digital Twin conversation when the visitor presses Save.
 *
 * This is a public write endpoint, so it is deliberately constrained: a
 * per-IP throttle, hard caps on message count and total size, and a check
 * that the payload actually looks like a conversation. Without those it
 * would be a way for anyone to fill the database.
 *
 * No IP address or user agent is stored. The address is used only to count
 * requests within this worker instance, and never persisted, so the promise
 * that no personal data is captured with a transcript still holds.
 */
import { createClient } from '@libsql/client/web';
import { json, badRequest, safeJson, databaseUrl, databaseToken, type Env } from '../_lib';

/** Ceiling on one saved conversation, in characters. */
const MAX_TRANSCRIPT_CHARS = 60_000;

/** Ceiling on the number of messages in one conversation. */
const MAX_MESSAGES = 60;

/** Ceiling on a single message. */
const MAX_MESSAGE_CHARS = 8_000;

/** Best-effort throttle, per worker instance. */
const recent = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function tooMany(key: string): boolean {
    const now = Date.now();
    const record = recent.get(key);
    if (!record || record.resetAt < now) {
        recent.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    record.count += 1;
    return record.count > MAX_PER_WINDOW;
}

/** Trims a message to the shape we are willing to store. */
function toStoredMessage(entry: unknown): { role: string; content: string } | null {
    if (!entry || typeof entry !== 'object') return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') return null;
    if (typeof content !== 'string') return null;
    const trimmed = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!trimmed) return null;
    return { role, content: trimmed };
}

export const onRequestPost: PagesFunction<Env> = ({ request, env }) => safeJson(async () => {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (tooMany(ip)) {
        return badRequest('Too many saves from this connection. Please try again later.', 429);
    }

    let body: { messages?: unknown };
    try {
        body = await request.json();
    } catch {
        return badRequest('Expected a JSON body.');
    }

    if (!Array.isArray(body.messages)) return badRequest('Expected a list of messages.');

    const messages = body.messages
        .slice(0, MAX_MESSAGES)
        .map(toStoredMessage)
        .filter((entry): entry is { role: string; content: string } => entry !== null);

    // A conversation needs both sides. This also rejects a bare payload
    // posted by something that is not the chat interface.
    const hasQuestion = messages.some((m) => m.role === 'user');
    const hasAnswer = messages.some((m) => m.role === 'assistant');
    if (!hasQuestion || !hasAnswer) {
        return badRequest('Nothing to save yet.');
    }

    const transcript = JSON.stringify(messages);
    if (transcript.length > MAX_TRANSCRIPT_CHARS) {
        return badRequest('That conversation is too long to save.');
    }

    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    const id = crypto.randomUUID();
    await db.execute({
        sql: 'INSERT INTO chat_sessions (id, transcript) VALUES (?, ?)',
        args: [id, transcript],
    });

    return json({ success: true, id });
});
