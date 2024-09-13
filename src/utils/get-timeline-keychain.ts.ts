import type { AuthData } from '../types/account-service.js';
import { FortniteCalendarTimelineData } from '../types/fn-calendar-timeline.js';

export default async (auth: AuthData) => {
  const res = await fetch(
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/calendar/v1/timeline',
    {
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
      },
    },
  );

  if (!res.ok) {
    console.error('failed fetching timeline data', res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <FortniteCalendarTimelineData>(await res.json());

  return {
    success: true as const,
    data: Array.from(new Set(data.channels.tk.states.flatMap(x => x.state.k)))
  };
};
