import type { AuthData } from '../types/account-service.js';
import { FortniteCalendarTimelineData } from '../types/fn-calendar-timeline.js';
import { FortniteStorefrontCatalogData } from '../types/fn-storefront-catalog.js';

export default async (auth: AuthData) => {
  const res = await fetch(
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storefront/v2/catalog',
    {
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
      },
    },
  );

  if (!res.ok) {
    console.error('failed fetching storefront catalog', res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <FortniteStorefrontCatalogData>(await res.json());

  const metaEntries = data.storefronts
    .flatMap((storefront) => storefront.catalogEntries)
    .map((offer) => offer.metaInfo?.find((meta) => meta.key === 'EncryptionKey')?.value || offer.meta?.EncryptionKey)
    .filter((k) => k) as string[];

  return {
    success: true as const,
    data: Array.from(new Set(metaEntries))
  };
};
