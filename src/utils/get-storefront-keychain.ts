import type { AuthData } from '../types/account-service.js';

export default async (auth: AuthData) => {
  const res = await fetch(
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storefront/v2/keychain',
    {
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
      },
    },
  );

  if (!res.ok) {
    console.error('failed fetching storefront keychain', res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <string[]>(await res.json());

  return {
    success: true as const,
    data: Array.from(new Set(data))
  };
};
