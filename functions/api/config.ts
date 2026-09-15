/** GET /api/config - public runtime config the editor needs. */
import { json, type Env } from './_lib';

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
    json({ googleClientId: env.VITE_GOOGLE_CLIENT_ID || '' });
