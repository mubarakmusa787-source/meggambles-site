// Data layer. Every view reads through these functions, so swapping the
// source (snapshot today, live WenBot API or her own backend later) only
// touches this file and server.js.

import { CHANNEL } from './content.js';

const cache = new Map();

async function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path, { headers: { Accept: 'application/json' } }).then(r => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    }).catch(e => { cache.delete(path); throw e; }));
  }
  return cache.get(path);
}

export const getPortal = () => getJSON(`/api/portal-data?channel=${CHANNEL}`);
export const getRaffleEntries = () => getJSON(`/api/raffle-entries?channel=${CHANNEL}`);
export const getReferrals = () => getJSON(`/api/meg-referrals?channel=${CHANNEL}`);

// One shape for every casino board, whichever field the API used.
export function boardsByKey(portal) {
  const out = {};
  if (portal.leaderboard) out.degen = { key: 'degen', ...portal.leaderboard };
  for (const b of portal.boards || []) out[b.key] = b;
  return out;
}

export function rankings(board) {
  return (board?.rankings || []).map(r => ({
    rank: r.rank,
    username: r.name ?? r.username ?? 'Anonymous',
    wagered: r.wagerAmount ?? r.wagered ?? 0,
    tickets: r.tickets,
    tier: r.tier,
    prize: r.prize || 0,
    avatarUrl: r.avatarUrl || null,
  }));
}
