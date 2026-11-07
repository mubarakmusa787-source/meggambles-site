// Data layer. Every view reads through these functions, so swapping the
// source (snapshot today, live WenBot API or her own backend later) only
// touches this file and server.js.

import { CHANNEL } from './content.js';

const cache = new Map();

async function fetchJSON(path) {
  const r = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

// Try the API first (server.js, or a real backend later). On a static host
// (Netlify, Vercel) there is no API, so fall back to the snapshot in /data.
function getJSON(apiPath, snapshot) {
  if (!cache.has(apiPath)) {
    cache.set(apiPath, fetchJSON(apiPath)
      .catch(() => fetchJSON(snapshot))
      .catch(e => { cache.delete(apiPath); throw e; }));
  }
  return cache.get(apiPath);
}

export const getPortal = () => getJSON(`/api/portal-data?channel=${CHANNEL}`, '/data/portal-data.json');
export const getRaffleEntries = () => getJSON(`/api/raffle-entries?channel=${CHANNEL}`, '/data/raffle-entries.json');
export const getReferrals = () => getJSON(`/api/meg-referrals?channel=${CHANNEL}`, '/data/referrals.json');

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
