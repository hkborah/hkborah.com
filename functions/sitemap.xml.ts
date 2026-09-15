/**
 * GET /sitemap.xml
 *
 * Lists every public page, plus each published journal entry. Generated at
 * the edge rather than checked in as a static file, so new posts appear
 * without anyone remembering to update it.
 *
 * If the database is unreachable the static pages are still returned, so a
 * sitemap always exists.
 */
import { createClient } from '@libsql/client/web';
import type { Env } from './api/_lib';

const SITE = 'https://www.hkborah.com';

/** Public pages, with the weight each deserves for crawlers. */
const PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/knowledge', priority: '0.9', changefreq: 'monthly' },
    { path: '/advice', priority: '0.9', changefreq: 'monthly' },
    { path: '/execution', priority: '0.9', changefreq: 'monthly' },
    { path: '/execution/business-upgrade', priority: '0.8', changefreq: 'monthly' },
    { path: '/execution/people-development', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.7', changefreq: 'weekly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

/** Escapes a URL for XML. */
function xmlUrl(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
    const parts = [`    <loc>${loc.replace(/&/g, '&amp;')}</loc>`];
    if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
    if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority) parts.push(`    <priority>${priority}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    const today = new Date().toISOString().slice(0, 10);
    const entries = PAGES.map((page) =>
        xmlUrl(`${SITE}${page.path}`, today, page.changefreq, page.priority));

    // Journal entries: included when the database answers
    try {
        const db = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
        const result = await db.execute(
            'SELECT id, slug, date, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 500',
        );
        for (const row of result.rows as Array<Record<string, unknown>>) {
            const key = String(row.slug || row.id);
            const stamp = row.created_at
                ? new Date(Number(row.created_at) * 1000).toISOString().slice(0, 10)
                : today;
            entries.push(xmlUrl(
                `${SITE}/blog-post?slug=${encodeURIComponent(key)}`,
                stamp, 'yearly', '0.6',
            ));
        }
    } catch (error) {
        console.error('Sitemap: journal entries unavailable, serving static pages only.', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
};
