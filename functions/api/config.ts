/** GET /api/config - public runtime config the editor needs. */
import { json, googleClientId, type Env } from './_lib';

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
    json({ googleClientId: googleClientId(env) });
