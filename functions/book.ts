/**
 * GET /book
 *
 * The single destination behind every "Book a Call" button on the site.
 *
 * Every booking link points here, so where it goes is decided in one place
 * rather than in thirty links across twelve pages. Change `BOOK_URL` in the
 * Pages environment and every button follows, with no code change and no
 * redeploy of the pages.
 *
 * The default keeps today's behaviour: the booking section on the execution
 * page. Point it at a scheduler, a form, or a calling API when that exists.
 */
import type { Env } from './api/_lib';

interface BookEnv extends Env {
    /** Where booking links should land. */
    BOOK_URL?: string;
}

export const onRequestGet: PagesFunction<BookEnv> = ({ request, env }) => {
    const destination = env.BOOK_URL || '/execution#book';

    // Absolute, so a fragment survives and an external URL works too
    const target = destination.startsWith('http')
        ? destination
        : new URL(destination, request.url).toString();

    return Response.redirect(target, 302);
};
