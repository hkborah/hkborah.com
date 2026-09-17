/**
 * /blog-post?slug=...
 *
 * Serves an entry page with the entry's own title, description, picture and
 * canonical address written into its head.
 *
 * The page body is drawn in the browser from /api/blog/posts. Google runs that
 * JavaScript; LinkedIn, WhatsApp, Slack and X do not. They read the HTML the
 * server sends and nothing else, so every shared entry used to arrive as
 * "Journal | HK Borah" with the site's card picture rather than the entry's
 * own title and picture.
 *
 * Nothing here is needed for the page to work. If the lookup fails, the
 * original page is served untouched and the browser fills it in as before.
 */
import { createClient } from '@libsql/client/web';
import { databaseUrl, databaseToken, imageUrl, type Env } from './api/_lib';

const SITE = 'https://www.hkborah.com';

/** The page as it sits on disk, and the address this handler answers on. */
const SHELL_PATH = '/blog-post';

interface ShellEnv extends Env {
    /* The static files, so this handler can serve the page it rewrites. */
    ASSETS: { fetch: (input: Request) => Promise<Response> };
}

async function findPost(env: ShellEnv, slug: string): Promise<Record<string, unknown> | null> {
    const db = createClient({ url: databaseUrl(env), authToken: databaseToken(env) });
    let result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE slug = ?', args: [slug] });
    if (result.rows.length === 0) {
        result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE id = ?', args: [slug] });
    }
    return (result.rows[0] as Record<string, unknown> | undefined) ?? null;
}

/** Removes anything with no business in a tag, and tidies the whitespace. */
function clean(value: unknown, limit: number): string {
    return String(value ?? '')
        .replace(/[\u0000-\u001f\u007f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
}

/** ISO date for structured data, taken from the date the author displayed. */
function isoDate(display: unknown, createdAt: unknown): string | null {
    const parsed = Date.parse(String(display ?? '').trim());
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
    const seconds = Number(createdAt);
    return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

/**
 * Crawlers are given absolute addresses. A relative one leaves LinkedIn with
 * no picture, which is the whole thing this handler exists to fix.
 */
function absolute(value: string): string {
    if (!value || /^https?:\/\//i.test(value)) return value;
    return `${SITE}${value.startsWith('/') ? '' : '/'}${value}`;
}

/**
 * The entry as structured data, so search engines and AI answers can read it
 * without running the page. The author carries the same @id the rest of the
 * site uses, so this joins the one Person entity rather than creating another.
 */
function structuredData(
    post: Record<string, unknown>, canonical: string, description: string, image: string,
): string {
    const entry: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonical}#entry`,
        headline: clean(post.title, 200),
        url: canonical,
        mainEntityOfPage: canonical,
        author: { '@type': 'Person', '@id': `${SITE}/#hkborah`, name: 'HK Borah', url: `${SITE}/` },
        publisher: { '@type': 'Person', '@id': `${SITE}/#hkborah`, name: 'HK Borah', url: `${SITE}/` },
        isPartOf: { '@type': 'Blog', name: 'HK Borah Journal', url: `${SITE}/blog` },
    };

    if (description) entry.description = description;
    if (image) entry.image = image;

    const date = isoDate(post.date, post.created_at);
    if (date) entry.datePublished = date;

    const section = clean(post.category, 60);
    if (section) entry.articleSection = section;

    // `<` is escaped so the payload can never close the script tag early.
    return `<script type="application/ld+json">${JSON.stringify(entry).replace(/</g, '\\u003c')}</script>`;
}

/**
 * Fetches the page as it sits on disk.
 *
 * Pages normally resolves /blog-post to blog-post.html on its own, but the
 * file is asked for by its full name if that ever stops happening: serving a
 * 404 here would take the whole journal down to fix a preview.
 */
async function fetchShell(env: ShellEnv, url: URL): Promise<Response> {
    const shell = await env.ASSETS.fetch(new Request(new URL(SHELL_PATH, url), { method: 'GET' }));
    if (shell.ok) return shell;
    const named = await env.ASSETS.fetch(new Request(new URL(`${SHELL_PATH}.html`, url), { method: 'GET' }));
    return named.ok ? named : shell;
}

export const onRequestGet: PagesFunction<ShellEnv> = async ({ request, env }) => {
    const url = new URL(request.url);
    const slug = clean(url.searchParams.get('slug') || url.searchParams.get('id'), 200);

    // The query string is not part of the file's name, so the page is fetched
    // by path alone.
    const shell = await fetchShell(env, url);
    if (!shell.ok) return shell;

    const canonical = slug
        ? `${SITE}${SHELL_PATH}?slug=${encodeURIComponent(slug)}`
        : `${SITE}${SHELL_PATH}`;

    let post: Record<string, unknown> | null = null;
    if (slug) {
        try {
            post = await findPost(env, slug);
        } catch (error) {
            // A database outage must not take the page down. The browser makes
            // the same lookup again from the visitor's side.
            console.error('Journal lookup failed:', error);
        }
    }

    const rewriter = new HTMLRewriter();

    // Every entry gets one canonical address, with the slug always in it.
    rewriter.on('meta[property="og:url"]', {
        element(element) { element.setAttribute('content', canonical); },
    });
    rewriter.on('head', {
        element(element) { element.append(`<link rel="canonical" href="${canonical}">`, { html: true }); },
    });

    if (post) {
        const title = `${clean(post.title, 200)} | HK Borah`;
        const description = clean(post.excerpt, 300);
        const image = absolute(imageUrl(String(post.id), String(post.image ?? '')));

        rewriter.on('title', { element(element) { element.setInnerContent(title); } });

        // The name and property forms are both covered, since a crawler may
        // read either.
        for (const name of ['og:title', 'twitter:title']) {
            rewriter.on(`meta[property="${name}"], meta[name="${name}"]`, {
                element(element) { element.setAttribute('content', title); },
            });
        }

        // Only replaced when the entry has an excerpt of its own. Otherwise the
        // page's own description stays, which beats blanking it.
        if (description) {
            rewriter.on('meta[name="description"]', {
                element(element) { element.setAttribute('content', description); },
            });
            for (const name of ['og:description', 'twitter:description']) {
                rewriter.on(`meta[property="${name}"], meta[name="${name}"]`, {
                    element(element) { element.setAttribute('content', description); },
                });
            }
        }

        if (image) {
            for (const name of ['og:image', 'twitter:image']) {
                rewriter.on(`meta[property="${name}"], meta[name="${name}"]`, {
                    element(element) { element.setAttribute('content', image); },
                });
            }
            rewriter.on('meta[property="og:image:alt"], meta[name="twitter:image:alt"]', {
                element(element) { element.setAttribute('content', clean(post.title, 200)); },
            });
            // The dimensions in the page describe the site's card. Once the
            // entry's own picture is used they would simply be wrong.
            rewriter.on('meta[property="og:image:width"], meta[property="og:image:height"]', {
                element(element) { element.remove(); },
            });
        }

        rewriter.on('head', {
            element(element) {
                element.append(structuredData(post, canonical, description, image), { html: true });
            },
        });
    }

    const rewritten = rewriter.transform(shell);
    const headers = new Headers(rewritten.headers);
    // Short, so a corrected headline or a new entry appears promptly, but long
    // enough that a crawler and a burst of visitors share one lookup.
    // no-transform refuses any edge rewrite of this page: the privacy policy
    // promises no third-party tracking script, and Cloudflare's analytics
    // beacon is injected into HTML on its way through. The other pages carry
    // the same instruction in the site's _headers file.
    headers.set('Cache-Control', 'public, max-age=300, must-revalidate, no-transform');

    return new Response(rewritten.body, { status: rewritten.status, headers });
};
