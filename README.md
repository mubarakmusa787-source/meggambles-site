# MegGambles site: recreation

A from-scratch recreation of https://irishqueenoftheslots.com (MegGambles), built as the
base for new features and a design refresh. Plain HTML, CSS and JavaScript modules: no build step.

## Run it

```bash
node server.js            # http://localhost:3000, using the data snapshots in ./data
LIVE=1 node server.js     # same, but /api/* is proxied to the live site
```

## Deploy (static hosting)

The site also runs on static hosts with no server: it falls back to the snapshots in `data/`.

- **Netlify:** drag the folder onto https://app.netlify.com/drop, or connect the GitHub repo. `_redirects` handles routes like `/degen`.
- **Vercel:** import the GitHub repo, framework preset "Other", no build command. `vercel.json` handles the routes.

Hosted copies show the snapshot data, not live data, until a real backend is connected.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Page shell: nav, menus, footer, icon sprite |
| `css/styles.css` | All styles. Colours and fonts are tokens at the top |
| `js/content.js` | Hand-written content: casino cards and perks, schedule, events, links |
| `js/data.js` | Data layer. Every view reads through it, so the data source can be swapped in one place |
| `js/app.js` | Router and views: Home, casino leaderboards, Store, Referral Race, Winners |
| `data/` | Snapshot of the live API taken 7 Nov 2026 (`portal-data`, `raffle-entries`, `referrals`) |
| `assets/` | Images from the live site |
| `reference/` | Screenshots of the original, for comparison |
| `server.js` | Tiny dev server: static files, routes like `/degen` fall back to `index.html`, `/api/*` from snapshots or live |

## Routes

`/` home · `/degen` `/csgobig` `/empiredrop` `/krush` `/stake` leaderboards · `/store` (or `/shop`) ·
`/referrals` · `/winners` · `/#casinos` · `/#community`

## What is not recreated (runs on WenBot's backend)

The live site is a WenBot portal (wenbot.gg). These features depend on its servers and are stubbed here.
Clicking them shows a notice:

- Sign in with Kick, Claim Daily, points balance
- Buying store items and entering raffles
- Submitting referrals
- Clip Studio (`/clip/`, a separate WenBot app; links go to the live one)
- Live leaderboard data (use `LIVE=1` to read it through the proxy)

Store item images are loaded from WenBot's Firebase storage; if they fail, the card shows the item name.
