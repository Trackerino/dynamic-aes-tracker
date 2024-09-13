import env from './env.js';

import type { AuthData } from '../types/account-service.js';
import getNintendoIdToken from './get-nintendo-id-token.js';

let cachedAuth: AuthData | null = null;

export default async () => {
  if (cachedAuth && new Date(cachedAuth.expires_at).getTime() - 1000 * 60 > Date.now()) {
    return cachedAuth;
  }

  const nintendoIdToken = await getNintendoIdToken(env.NINTENDO_NASID);

  const res = await fetch(
    'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.EPIC_CLIENT_ID}:${env.EPIC_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'external_auth',
        token_type: 'eg1',
        external_auth_type: 'nintendo_id_token',
        external_auth_token: nintendoIdToken,
      }),
    },
  );

  if (!res.ok) {
    console.error('failed to authenticate', res.status, res.statusText, await res.text());

    throw new Error('Failed to get token');
  }

  cachedAuth = <AuthData>(await res.json());

  return cachedAuth;
};
