/**
 * POST /api/contact
 *
 * Receives the About page enquiry form and emails it to HK Borah.
 * Sending uses Resend (the provider already integrated in the main app).
 *
 * Protections: a honeypot field, a per-IP throttle, length caps, and full
 * HTML escaping of everything the visitor typed, so their input can never
 * inject markup into the email that lands in the inbox.
 */
import { json, badRequest, type Env } from './_lib';

interface ContactEnv extends Env {
    RESEND_API_KEY?: string;
    /** Where enquiries are delivered. Defaults to the public address. */
    CONTACT_TO?: string;
    /** A sender on a domain verified with Resend. */
    CONTACT_FROM?: string;
}

/** Best-effort throttle. For durable limits use KV or Durable Objects. */
const recent = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000; // one hour
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

/** Escapes text for safe inclusion in the notification email. */
function esc(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[ch]);
}

const clean = (value: unknown, max: number) =>
    String(value ?? '').trim().slice(0, max);

export const onRequestPost: PagesFunction<ContactEnv> = async ({ request, env }) => {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (tooMany(ip)) {
        return badRequest('Too many messages from this connection. Please try again later.', 429);
    }

    // Accept both the JavaScript fetch (JSON) and a plain form post, so the
    // form still works for a visitor without JavaScript.
    const contentType = request.headers.get('Content-Type') || '';
    const isFormPost = contentType.includes('application/x-www-form-urlencoded')
        || contentType.includes('multipart/form-data');

    let body: Record<string, unknown>;
    try {
        if (isFormPost) {
            body = Object.fromEntries((await request.formData()).entries());
        } else {
            body = await request.json();
        }
    } catch {
        return badRequest('Could not read that submission.');
    }

    /** A failed send: answer the browser with a redirect, the script with JSON. */
    const fail = (message: string, status: number): Response =>
        isFormPost
            ? Response.redirect(new URL('/about.html?sent=0', request.url).toString(), 303)
            : badRequest(message, status);

    // Honeypot: a real person never fills this in. Answer normally so the
    // bot has nothing to learn, but send nothing.
    if (clean(body.website, 100)) {
        return json({ success: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const company = clean(body.company, 160);
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 4000);

    if (!name || !email || !message) {
        return fail('Please include your name, email and a message.', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return fail('That email address does not look right.', 400);
    }
    if (message.length < 10) {
        return fail('Please add a little more detail to your message.', 400);
    }

    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured; the enquiry was not sent.');
        return fail('The contact form is not configured yet. Please write to email@hkborah.com.', 503);
    }

    const to = env.CONTACT_TO || 'email@hkborah.com';
    const from = env.CONTACT_FROM || 'HK Borah Website <website@hkborah.com>';

    const rows: Array<[string, string]> = [
        ['Name', name],
        ['Email', email],
        ['Business', company || '\u2014'],
        ['Phone', phone || '\u2014'],
    ];

    const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#16161a">
            <p style="margin:0 0 18px;padding-bottom:14px;border-bottom:2px solid #dc483e;
                      font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a7a80">
                New enquiry from hkborah.com
            </p>
            <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:22px">
                ${rows.map(([label, value]) => `
                    <tr>
                        <td style="padding:4px 18px 4px 0;color:#7a7a80;white-space:nowrap">${esc(label)}</td>
                        <td style="padding:4px 0;color:#16161a"><strong>${esc(value)}</strong></td>
                    </tr>`).join('')}
            </table>
            <div style="padding-top:16px;border-top:1px solid #e0e0e4;white-space:pre-wrap">${esc(message)}</div>
        </div>`;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            reply_to: email,
            subject: `Website enquiry from ${name}${company ? ` (${company})` : ''}`,
            html,
        }),
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error('Resend rejected the message:', response.status, detail.slice(0, 300));
        return fail('The message could not be sent just now. Please write to email@hkborah.com.', 502);
    }

    // A plain form post lands back on the page with a confirmation flag
    return isFormPost
        ? Response.redirect(new URL('/about.html?sent=1', request.url).toString(), 303)
        : json({ success: true });
};
