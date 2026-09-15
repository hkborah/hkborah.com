/**
 * POST /api/auth/login
 *
 * Two ways in:
 *   { credential }          Google Sign-In ID token (the normal route)
 *   { email, password }     legacy email + password, bcrypt hashes
 *
 * Only one account is permitted, matching the original app's allowlist.
 * The issued token is HMAC-signed and expires; the original returned an
 * unsigned base64 blob that anyone could forge.
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client/web';
import { json, badRequest, signToken, type Env } from '../_lib';

const SUPER_ADMIN = 'hkborah@gmail.com';
const GOOGLE_TOKEN_INFO = 'https://oauth2.googleapis.com/tokeninfo';

/** Best-effort throttle. For durable limits use KV or Durable Objects. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function throttled(key: string): boolean {
    const now = Date.now();
    const record = attempts.get(key);
    if (!record || record.resetAt < now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    record.count += 1;
    return record.count > MAX_ATTEMPTS;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const clientKey = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (throttled(clientKey)) {
        return badRequest('Too many attempts. Please wait a few minutes.', 429);
    }

    let body: { credential?: string; email?: string; password?: string };
    try {
        body = await request.json();
    } catch {
        return badRequest('Expected a JSON body.');
    }

    /* ---- Google Sign-In ---- */
    if (body.credential) {
        const response = await fetch(
            `${GOOGLE_TOKEN_INFO}?id_token=${encodeURIComponent(body.credential)}`,
        );
        if (!response.ok) return badRequest('Google could not verify that sign-in.', 401);

        const info = await response.json() as {
            email?: string; email_verified?: string; aud?: string; sub?: string;
        };
        const email = (info.email || '').toLowerCase();

        // Reject tokens minted for a different application
        if (env.VITE_GOOGLE_CLIENT_ID && info.aud !== env.VITE_GOOGLE_CLIENT_ID) {
            return badRequest('That sign-in was issued for a different app.', 401);
        }
        if (email !== SUPER_ADMIN) {
            return badRequest('Access denied. Only the site owner can sign in.', 403);
        }

        const db = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
        const existing = await db.execute({
            sql: 'SELECT id FROM users WHERE username = ?',
            args: [email],
        });
        if (existing.rows.length === 0) {
            await db.execute({
                sql: 'INSERT INTO users (id, username, password, google_id) VALUES (?, ?, ?, ?)',
                args: [crypto.randomUUID(), email, 'google-oauth', info.sub ?? null],
            });
        }

        return json({ success: true, token: await signToken(email, env.JWT_SECRET) });
    }

    /* ---- Email + password ---- */
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');
    if (!email || !password) return badRequest('Email and password are required.');

    const db = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
    const result = await db.execute({
        sql: 'SELECT username, password FROM users WHERE username = ?',
        args: [email],
    });
    const user = result.rows[0] as unknown as
        { username: string; password: string | null } | undefined;

    // One message for both failure modes, so the response cannot be used
    // to discover which accounts exist.
    const denied = badRequest('Those details did not match.', 401);
    if (!user || !user.password) return denied;
    if (email !== SUPER_ADMIN) return denied;

    const stored = user.password;
    const ok = stored.startsWith('$2')
        ? await bcrypt.compare(password, stored)
        : password === stored; // plaintext (legacy) - migrate on success
    if (!ok) return denied;

    if (!stored.startsWith('$2')) {
        const hashed = await bcrypt.hash(password, 10);
        await db.execute({
            sql: 'UPDATE users SET password = ? WHERE username = ?',
            args: [hashed, email],
        });
    }

    return json({ success: true, token: await signToken(email, env.JWT_SECRET) });
};
