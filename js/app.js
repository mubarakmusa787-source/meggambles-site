import {
  CASINOS, CASINO_ORDER, PERKS_SHOWN, HOUSE_BOARDS, FEATURES, SCHEDULE, COMMUNITY_PERKS,
  EVENTS, BIG_WINS, BOARD_UNITS, DISCORD_URL,
} from './content.js';
import { getPortal, getRaffleEntries, getReferrals, boardsByKey, rankings } from './data.js';

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => Number(n || 0).toLocaleString('en-US');
const money = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const COIN = '<img class="coin-ic" src="/assets/csgocoin.png" alt="coins">';
const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const initials = s => (s || '?').slice(0, 2).toUpperCase();
function maskName(name) {
  const s = String(name || '');
  if (!s || s.toLowerCase() === 'anonymous' || s.length <= 3) return s;
  return s.slice(0, 2) + '*'.repeat(Math.max(1, s.length - 3)) + s.slice(-1);
}
const unitAmt = (key, n) => BOARD_UNITS[key] === 'coins' ? `${COIN} ${num(n)}` : BOARD_UNITS[key] === 'tickets' ? `${num(n)} tickets` : '$' + num(n);
const shortDate = ms => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace('Sep ', 'Sept ');
const monthDay = ms => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

let S = null;       // portal data
let BOARDS = {};    // casino key -> board
const discordUrl = () => S?.streamer?.socials?.discord || DISCORD_URL;
const hrefFor = h => h === 'discord' ? discordUrl() : h;
const isExternal = h => /^https?:/.test(h) || h.startsWith('/clip/');
const linkAttrs = h => {
  const href = hrefFor(h);
  if (h.startsWith('/clip/')) return `href="https://irishqueenoftheslots.com${h}" target="_blank" rel="noopener"`;
  return isExternal(href) ? `href="${esc(href)}" target="_blank" rel="noopener"` : `href="${esc(href)}" data-link`;
};

function poolFor(key) {
  const c = CASINOS[key], b = BOARDS[key];
  if (c.poolLabel) return c.poolLabel;
  const amt = b?.prizePool || c.prizePool || 0;
  return amt ? unitAmt(key, amt) : '';
}
const raceWord = key => BOARD_UNITS[key] === 'tickets' || CASINOS[key].poolLabel ? 'raffle' : 'race';

export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3200);
}
const NEEDS_BACKEND = 'Kick sign-in, points and purchases run on the backend. They aren’t connected in this recreation yet.';

/* ---------- shell: socials, menus, chips ---------- */
function renderShell() {
  const soc = { ...S.streamer.socials, discord: discordUrl() };
  const order = [['kick', 'i-kick'], ['twitter', 'i-x'], ['instagram', 'i-instagram'], ['youtube', 'i-youtube'], ['discord', 'i-discord']];
  const html = order.filter(([k]) => soc[k]).map(([k, i]) => `<a href="${esc(soc[k])}" target="_blank" rel="noopener" aria-label="${k}">${icon(i)}</a>`).join('');
  $('#navSocials').innerHTML = html;
  $('#footSocials').innerHTML = html;

  $('#ddBoards').innerHTML = CASINO_ORDER.map(k => `
    <a class="dd-item" href="/${k}" data-link>
      <img src="${CASINOS[k].art}" alt="">
      <span><b>${esc(CASINOS[k].name)}</b><small>${poolFor(k)} ${raceWord(k)}</small></span>
    </a>`).join('') +
    `<div class="dd-sep">More ways to win</div>` +
    HOUSE_BOARDS.map(h => `
    <a class="dd-item" ${linkAttrs(h.links[0].href)}>
      <img src="${h.art}" alt="">
      <span><b>${esc(h.name)}</b><small>${esc(h.pool)} ${esc(h.per)}</small></span>
    </a>`).join('');

  $('#ddCasinos').innerHTML = CASINO_ORDER.map(k => {
    const c = CASINOS[k];
    return `<a class="dd-item" href="${c.url}" target="_blank" rel="noopener">
      <img src="${c.art}" alt="">
      <span><b>${esc(c.name)}</b><small>${esc(c.tag)} · code ${esc(c.code)}</small></span>
    </a>`;
  }).join('') + `<a class="dd-all" href="/#casinos" data-link>All rooms &amp; offers ›</a>`;

  const a = S.active || {};
  const chips = [];
  if (a.giveaway) chips.push(`<div class="chip"><span class="dot"></span><b>Giveaway live</b><span class="meta">type ${esc(a.giveaway.keyword || '!join')}</span></div>`);
  if (a.bonusHunt) chips.push(`<div class="chip"><span class="dot"></span><b>Bonus Hunt</b><span class="meta">live now</span></div>`);
  $('#activeChips').innerHTML = chips.join('');
}

/* ---------- home ---------- */
function roomCard(k) {
  const c = CASINOS[k];
  const more = c.perks.length - PERKS_SHOWN;
  const perks = c.perks.map((p, i) => `<li${i >= PERKS_SHOWN ? ' class="more"' : ''}>${icon('i-check')}${esc(p)}</li>`).join('');
  const pool = poolFor(k);
  return `<article class="room">
    <img class="room-art" src="${c.art}" alt="${esc(c.name)}" loading="lazy">
    <div class="room-body">
      <div class="room-top"><span class="room-name">${esc(c.name)}</span><span class="room-tag">${esc(c.tag)}</span></div>
      <p class="room-blurb">${esc(c.blurb)}</p>
      <ul class="room-perks">${perks}</ul>
      ${more > 0 ? `<button class="perk-toggle" data-more="${more}">+${more} more perks</button>` : ''}
      <div class="room-foot">
        <span class="room-code">Code <b>${esc(c.code.toUpperCase())}</b></span>
        <a class="pill pill-live" href="${c.url}" target="_blank" rel="noopener">Play, ${pool ? pool + ' ' + raceWord(k) : 'now'}</a>
        <a class="pill pill-ghost" href="/${k}" data-link>Leaderboard</a>
      </div>
    </div>
  </article>`;
}

function houseCard(h) {
  return `<article class="room">
    <img class="room-art" src="${h.art}" alt="${esc(h.name)}" loading="lazy">
    <div class="room-body">
      <div class="room-top"><span class="room-name">${esc(h.name)}</span><span class="room-tag">${esc(h.tag)}</span></div>
      <p class="room-blurb">${esc(h.blurb)}</p>
      <ul class="room-perks">${h.perks.map(p => `<li>${icon('i-check')}${esc(p)}</li>`).join('')}</ul>
      <div class="room-foot">
        <span class="room-pool">${esc(h.pool)}<small>${esc(h.per)}</small></span>
        ${h.links.map(l => `<a class="pill ${l.live ? 'pill-live' : 'pill-ghost'}" ${linkAttrs(l.href)}>${esc(l.label)}</a>`).join('')}
      </div>
    </div>
  </article>`;
}

function viewHome() {
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const soc = S.streamer.socials;
  return `
  <section class="hero" id="home">
    <div class="hero-photo"><img src="/assets/meg-hero-leopard.webp" alt="Meg in a pink leopard jacket"></div>
    <div class="hero-copy">
      <h1 class="hero-logo">MegGambles</h1>
      <p class="hero-tag">For daily giveaways, join us on</p>
      <div class="hero-cta">
        <a class="pill-outline" href="${esc(soc.kick)}" target="_blank" rel="noopener">${icon('i-kick', 'kick-green')}Kick</a>
        <a class="pill-outline" href="${esc(discordUrl())}" target="_blank" rel="noopener">${icon('i-discord', 'discord-blue')}Discord</a>
        <a class="pill-outline" href="${esc(soc.twitter)}" target="_blank" rel="noopener">${icon('i-x')}X</a>
      </div>
      <p class="hero-daily">🎁 Free points every day, just for showing up. <a href="#" data-action="login">Sign in with Kick</a> to start.</p>
    </div>
  </section>

  <div class="feat">${FEATURES.map(([i, a, b]) => `<div>${icon(i)}<span>${a}<br>${b}</span></div>`).join('')}</div>

  <section class="band" id="casinos">
    <div class="band-head">
      <h2>Play at the top sites</h2>
      <div class="sub">Use code <b>MEG</b> for exclusive offers</div>
    </div>
    <div class="rooms">${CASINO_ORDER.map(roomCard).join('')}${HOUSE_BOARDS.map(houseCard).join('')}</div>
  </section>

  <div class="trio" id="community">
    <a class="card stream" href="${esc(soc.kick)}" target="_blank" rel="noopener">
      <div class="stream-art"><img src="/assets/meg-selfie.webp" alt=""><span class="on-kick">${icon('i-kick')}On Kick</span></div>
      <div class="stream-body">
        <h3>Join the stream</h3>
        <div class="stream-sub">Giveaways · Bonus hunts · Community</div>
        <span class="pill pill-live">Watch live ›</span>
      </div>
    </a>
    <div class="card sched">
      <h3 class="card-title">${icon('i-cal')}Weekly schedule</h3>
      <div class="sched-rows">${SCHEDULE.map(r => `<div class="sched-row${r.day === today ? ' today' : ''}"><span class="sched-day">${r.day}</span><span class="sched-what"><span>${esc(r.what)}</span><span>${r.em}</span></span></div>`).join('')}</div>
      <p class="sched-note">Times announced on stream and in Discord. Check Kick for today’s go-live.</p>
    </div>
    <div class="card comm">
      <img src="/assets/community.webp" alt="">
      <div class="comm-body">
        <h3 class="card-title">${icon('i-people')}Join the community</h3>
        <ul>${COMMUNITY_PERKS.map(p => `<li>${icon('i-check')}${esc(p)}</li>`).join('')}</ul>
        <a class="btn-pink wide" href="${esc(discordUrl())}" target="_blank" rel="noopener">${icon('i-discord')}Join Discord today</a>
      </div>
    </div>
  </div>

  <div class="events-head">
    <h2 class="section-title">${icon('i-cal')}Upcoming events</h2>
    <a href="/winners" data-link>Past winners ›</a>
  </div>
  <div class="events-wrap">
    <div class="events-art"><img src="/assets/events-banner.webp" alt="Upcoming events"></div>
    <div class="events">${EVENTS.map(e => `
      <a class="event" ${linkAttrs(e.href)}>
        <img src="${e.img}" alt="" loading="lazy">
        <b>${esc(e.title)}</b><small>${esc(e.sub)}</small>
        <span class="pill pill-live">Find out more</span>
      </a>`).join('')}</div>
  </div>

  <div class="loop">
    <div class="loop-ico">${icon('i-discord')}</div>
    <div><b>Stay in the loop</b><p>Every giveaway, code drop and event is announced in the Discord first. That’s where the community lives.</p></div>
    <a class="btn-pink" href="${esc(discordUrl())}" target="_blank" rel="noopener">Join Discord</a>
  </div>`;
}

/* ---------- leaderboard ---------- */
let countdownTimer = null;
function viewBoard(key) {
  const c = CASINOS[key];
  const b = BOARDS[key] || {};
  const unit = BOARD_UNITS[key];
  const value = r => unit === 'tickets' ? (r.tickets ?? 0) : r.wagered;
  const fmtVal = n => unit === 'tickets' ? `${plain(n)} <span class="lb-unit">tickets</span>` : unit === 'coins' ? `${COIN} ${plain(n)}` : money(n);
  const fmtPrize = p => p ? (unit === 'coins' ? `${COIN} ${num(p)}` : '$' + num(p)) : '';
  let ranks = rankings(b);
  ranks = key === 'csgobig' ? ranks.slice(0, 13) : key === 'stake' ? ranks : ranks.slice(0, 20);
  const pool = b.prizePool || c.prizePool || 0;
  const title = key === 'degen' ? 'Monthly Degen Leaderboard' : c.boardTitle || `${c.name} Leaderboard`;
  const podium = ranks.length >= 3 ? [ranks[1], ranks[0], ranks[2]] : [];
  const medals = { 1: '👑', 2: '🥈', 3: '🥉' };
  const soc = S.streamer.socials;

  return `
  <div class="board-banner"><img src="${c.art}" alt="${esc(c.name)} banner"></div>
  <h1 class="board-title"><span>👑</span>${esc(S.streamer.displayName)}</h1>
  <div class="board-pool">${c.poolLabel ? 'Mystery Raffle' : pool ? `${unit === 'coins' ? COIN + ' ' + num(pool) : '$' + num(pool)} Prize Pool` : 'Leaderboard'}</div>
  <div class="center"><a class="btn-pink" href="${c.url}" target="_blank" rel="noopener">Play on ${esc(c.name)} with code ${esc(c.code.toUpperCase())}</a></div>
  ${b.endAt ? `<div class="countdown" data-end="${b.endAt}">${['Days', 'Hours', 'Minutes', 'Seconds'].map(l => `<div><b>--</b><small>${l}</small></div>`).join('')}</div>` : ''}
  ${c.boardNote ? `<p class="board-note">${esc(c.boardNote)}</p>` : ''}
  ${podium.length ? `<div class="podium">${podium.map(e => `
    <div class="pod rank-${e.rank}">
      <div class="medal">${medals[e.rank]}</div>
      <div class="av">${esc(initials(e.username))}<span class="badge">${e.rank}</span></div>
      <div class="nm">${esc(maskName(e.username))}</div>
      <div class="wg-box"><small>${unit === 'tickets' ? 'Tickets' : 'Total wagered'}</small><b>${fmtVal(value(e))}</b></div>
      ${e.prize ? `<div class="pod-prize">🏆 ${fmtPrize(e.prize)}</div>` : ''}
    </div>`).join('')}</div>` : ''}
  <h2 class="section-title">${icon('i-trophy')}${esc(title)}</h2>
  <div class="lb-table">${(podium.length ? ranks.slice(3) : ranks).map(e => `
    <div class="lb-row">
      <span class="r">${e.rank}</span><span class="lb-av">${esc(initials(e.username))}</span>
      <span class="n">${esc(maskName(e.username))}${e.tier ? `<small>${esc(e.tier)}</small>` : ''}</span>
      ${e.prize ? `<span class="lb-prize">${fmtPrize(e.prize)}</span>` : ''}
      <span class="w">${fmtVal(value(e))}</span>
    </div>`).join('') || '<div class="empty">No wager data yet.</div>'}</div>

  <h2 class="section-title">${icon('i-dice')}Biggest wins</h2>
  <div class="bigwins">${BIG_WINS.map(w => `
    <a href="https://kick.com/meggambles/clips/${w.id}" target="_blank" rel="noopener">
      <div class="thumb"><img src="https://clips.kick.com/clips/${w.sub}/${w.id}/thumbnail.webp" alt="" loading="lazy" onerror="this.remove()"><span>▶ ${Math.floor(w.dur / 60)}:${String(w.dur % 60).padStart(2, '0')}</span></div>
      <b>${esc(w.title)}</b>
    </a>`).join('')}</div>

  <h2 class="section-title">${icon('i-heart')}About</h2>
  <div class="card about">
    <p>Affiliated with <strong>${esc(S.streamer.providerName)}</strong>. Type <code>!verify</code> in chat to link your casino account.</p>
    <p>${[soc.twitter && `<a href="${esc(soc.twitter)}" target="_blank" rel="noopener">X</a>`, soc.instagram && `<a href="${esc(soc.instagram)}" target="_blank" rel="noopener">Instagram</a>`].filter(Boolean).join(' · ')}</p>
  </div>`;
}

function startCountdown() {
  clearInterval(countdownTimer);
  const el = $('.countdown');
  if (!el) return;
  const end = Number(el.dataset.end);
  const tick = () => {
    const ms = Math.max(0, end - Date.now());
    const parts = [ms / 864e5, (ms / 36e5) % 24, (ms / 6e4) % 60, (ms / 1e3) % 60].map(Math.floor);
    el.querySelectorAll('b').forEach((b, i) => { b.textContent = parts[i]; });
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ---------- store ---------- */
function viewStore(entries) {
  const items = S.store?.items || [];
  const stockText = s => s == null ? '' : s === 0 ? '<span class="oos">Out of stock</span>' : s <= 3 ? `${s} left` : `${s} in stock`;
  return `
  <h1 class="page-title"><span>🛒</span>Store</h1>
  <p class="page-sub">Spend your points on rewards. Sign in with Kick to buy, or use <code>!buy</code> in chat.</p>
  <div class="store-grid">${items.map(it => {
    const e = entries?.[it.id];
    const out = !it.isRaffleItem && it.stock === 0;
    return `<article class="item${it.isRaffleItem ? ' raffle' : ''}">
      ${it.isRaffleItem ? '<span class="raffle-tag">🎟 Raffle entry</span>' : ''}
      <div class="item-img" data-name="${esc(it.name)}"><img src="${esc(it.imageUrl)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('noimg');this.remove()"></div>
      <b class="item-name">${esc(it.name)}</b>
      <p class="item-desc">${esc(it.description)}</p>
      <div class="item-price"><span><b>${num(it.price)}</b> points</span>${it.isRaffleItem ? '' : `<small>${stockText(it.stock)}</small>`}</div>
      ${it.isRaffleItem ? `<div class="item-entries">🎟 ${num(e?.total || 0)} entries</div>
        <div class="stepper"><button data-step="-1" aria-label="Fewer tickets">−</button><input type="number" min="1" value="1" aria-label="Tickets"><button data-step="1" aria-label="More tickets">+</button><small>tickets</small></div>
        <button class="btn-gold wide" data-action="login"><span class="dot-green"></span>Sign in to enter raffle</button>`
      : out ? `<button class="btn-muted wide" disabled>Out of stock</button>`
      : `<button class="btn-pink wide" data-action="login"><span class="dot-green"></span>Sign in to buy</button>`}
      <button class="buy-cmd" data-copy="!buy ${esc(it.name)}">📋 !buy ${esc(it.name)}</button>
    </article>`;
  }).join('')}</div>
  <div class="store-hint">🛒 Click <b>Buy</b> to spend your points (sign in with Kick), or use <code>!buy &lt;item&gt;</code> in Kick chat / Discord. 🎟 <b>Raffle</b> items enter you into a draw, and the streamer picks the winner.</div>

  <h2 class="section-title">${icon('i-gift')}How it works</h2>
  <div class="card howto">
    <p>Watch the stream, chat, and you earn <b class="pink">points</b>. Spend them in the store on real prizes, or on raffle tickets for the big-ticket items.</p>
    <h4>1. Get set up</h4>
    <p>Just chat in <a href="${esc(S.streamer.socials.kick)}" target="_blank" rel="noopener">the Kick channel</a>. There’s no sign-up form, and you start earning straight away.</p>
    <p class="dim">To spend points here on the website, hit <b>Sign in with Kick</b> at the top of the page. That links this site to the same account you chat with.</p>
    <h4>2. Earn points</h4>
    <ul>
      <li><b>10 points per minute</b> while you’re active in chat. “Active” means you’ve said something real in the last few minutes. Messages under 5 characters, ALL-CAPS shouting and <code>!commands</code> don’t count.</li>
      <li><b>Subscribers earn double</b>, so 20 per minute.</li>
      <li><b>+25 points</b> the first time you follow the channel.</li>
      <li><b>Daily check-in bonus</b>, given automatically for your first real message each day. It starts at <b>50 points</b> and grows with consecutive days: day 2 pays 100, day 3 pays 150, up to <b>350 a day</b> once you’ve shown up 7 days running. Miss a day and the streak restarts.</li>
    </ul>
    <h4>3. Check your balance</h4>
    <p>Type <code>!points</code> in Kick chat, or sign in here and your balance shows at the top of every page.</p>
    <h4>4. How raffles work</h4>
    <p>Raffles are right here in the store. They’re the cards marked <span class="raffle-tag inline">🎟 Raffle entry</span>. Everything else is a straight purchase.</p>
    <ul>
      <li>Each ticket costs points, and <b>you can buy as many as you like</b>, using the +/- stepper on the card. More tickets, better odds.</li>
      <li>Your ticket count and the total entries show on the card once you’re signed in.</li>
      <li>When the raffle closes, <b>Meg draws the winner live on stream</b> and announces it in chat and Discord. Winners also appear under <a href="/winners" data-link>Past Winners</a>.</li>
    </ul>
    <p class="dim">Some prizes appear twice on purpose: once as a cheap raffle ticket, and once at full price as a direct buy. The raffle is the gamble; the direct buy is guaranteed if you save up.</p>
    <p class="dim">Stuck on something? Ask in chat or in the Discord and Meg or a mod will sort you out.</p>
  </div>`;
}

/* ---------- referrals ---------- */
function viewReferrals(ref) {
  const cfg = ref.config;
  const fmtD = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `
  <h1 class="page-title big"><span>💞</span>$${num(cfg.prizePool)} Referral Race</h1>
  <p class="page-sub wide">Bring your gambling friends and climb the board to win your share of the pool. Points come from your friend’s previous wager, verified by the team.</p>
  <div class="ref-grid">
    <div>
      <div class="ref-head"><h2 class="section-title">${icon('i-trophy')}Standings</h2><small>since ${fmtD(ref.period.start)} · ends ${fmtD(ref.period.end)}</small></div>
      <div class="ref-list">${ref.standings.map(s => `
        <div class="ref-row rank-${s.rank}">
          <span class="r">${s.rank}</span>
          <span class="n">${esc(s.name)}<small>${s.referrals} verified referral${s.referrals === 1 ? '' : 's'}</small></span>
          ${s.prize ? `<span class="lb-prize">$${num(s.prize)}</span>` : ''}
          <span class="pts">${s.points} pts</span>
        </div>`).join('') || '<div class="empty">No verified referrals yet this month.</div>'}</div>
      <p class="fine">Points count once the team has verified your friend’s previous wager. Ties go to whoever has more verified referrals, then whoever got there first.</p>
    </div>
    <aside class="card ref-rules">
      <h4>Point system</h4>
      <ul class="diamonds">${cfg.tiers.map(t => `<li><b>${t.points} pt${t.points === 1 ? '' : 's'}</b> ${esc(t.label)}</li>`).join('')}</ul>
      <h4>Requirements</h4>
      <ul class="checks">${['18+ gamblers only', 'Referrals must be genuine and verified', 'Previous casino wagering proof required', 'Open a ticket in Discord to get your friend verified', 'No alts, fake accounts or abuse'].map(r => `<li>${icon('i-check')}${r}</li>`).join('')}</ul>
      <h4>Prize payouts</h4>
      <div class="payouts">${cfg.payouts.map((p, i) => `<span><b>#${i + 1}</b> $${num(p)}</span>`).join('')}</div>
      <a class="btn-pink" href="${esc(discordUrl())}" target="_blank" rel="noopener">${icon('i-discord')}Open a ticket in Discord</a>
    </aside>
  </div>
  <div class="card submit-ref">
    <h4>Submit a referral</h4>
    <p>Sign in with Kick, tell us who you brought and where they played, then open a ticket in Discord with their wager proof. Once the team verifies it, your points land here.</p>
    <button class="btn-pink" data-action="login">Sign in with Kick</button>
  </div>`;
}

/* ---------- winners ---------- */
function viewWinners() {
  const periods = S.leaderboardPeriods || [];
  const sites = [...new Set(periods.map(p => p.casinoName))];
  const recent = [
    ...(S.giveawayWinners || []).map(w => ({ kind: 'giveaway', name: w.winner, at: w.drawnAt })),
    ...(S.pastWinners || []).map(w => ({ kind: 'point', name: w.winner, item: w.itemName, at: w.drawnAt })),
  ].sort((a, b) => b.at - a.at);
  const range = p => p.startAt ? `${shortDate(p.startAt)} – ${shortDate(p.endDate)}`.replace(/ \d{4} –/, ' –') : `ended ${shortDate(p.endDate)}`;
  return `
  <h1 class="page-title"><span>👑</span>Past winners</h1>
  <div class="card winners">
    <h3 class="gold-title">🏆 Leaderboard Winners</h3>
    <div class="filters" data-filter="site"><button class="on" data-v="all">All sites</button>${sites.map(s => `<button data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <div class="periods">${periods.map(p => `
      <details class="period" data-site="${esc(p.casinoName)}">
        <summary><span><b>${esc(p.casinoName)} · ${esc(p.period)}</b><small>${range(p)}</small></span><small>${p.winners.length} winners ▾</small></summary>
        ${p.winners.length ? `<div class="period-list">${p.winners.map(w => `<div><span class="r">${w.rank}</span><span class="n">${esc(maskName(w.username))}</span><span class="w">${p.casino === 'csgobig' ? COIN + ' ' : '$'}${plain(w.wagered)}</span><span class="lb-prize">${p.casino === 'csgobig' ? COIN + ' ' : '$'}${num(w.prize)}</span></div>`).join('')}</div>` : '<p class="empty">No winners recorded.</p>'}
      </details>`).join('')}</div>

    <h3 class="sub-title">Recent Wins</h3>
    <div class="filters" data-filter="kind"><button class="on" data-v="all">All</button><button data-v="point">Point Raffle</button><button data-v="giveaway">Giveaway</button></div>
    <div class="recent">${recent.map(r => `
      <div class="recent-row" data-kind="${r.kind}">
        <span class="kind">${r.kind === 'giveaway' ? '🎁 Giveaway' : '🎟 Point Raffle'}</span>
        <span class="n">${esc(maskName(r.name))}${r.item ? ` <em>· won “${esc(r.item)}”</em>` : ''}</span>
        <small>${monthDay(r.at)}</small>
      </div>`).join('')}</div>
  </div>`;
}

/* ---------- router ---------- */
const ROUTES = { '': 'home', store: 'store', shop: 'store', referrals: 'referrals', winners: 'winners' };
async function route() {
  const seg = location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
  const name = CASINOS[seg] ? 'board' : ROUTES[seg] ?? 'home';
  const view = $('#view');
  clearInterval(countdownTimer);
  document.body.dataset.view = name;

  if (name === 'home') view.innerHTML = viewHome();
  else if (name === 'board') { view.innerHTML = viewBoard(seg); startCountdown(); }
  else if (name === 'store') {
    view.innerHTML = viewStore(null);
    getRaffleEntries().then(r => { if (document.body.dataset.view === 'store') view.innerHTML = viewStore(r.entries); }).catch(() => {});
  } else if (name === 'referrals') {
    view.innerHTML = '<div class="loading">Loading standings…</div>';
    try { view.innerHTML = viewReferrals(await getReferrals()); } catch { view.innerHTML = '<div class="empty">Couldn’t load the referral standings.</div>'; }
  } else if (name === 'winners') view.innerHTML = viewWinners();

  // Active tab
  const tab = name === 'board' ? 'board' : location.hash === '#community' ? 'community' : name;
  document.querySelectorAll('#linkbar [data-route]').forEach(a => a.classList.toggle('on', a.dataset.route === tab));

  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  else scrollTo(0, 0);
}

function navigate(href) {
  history.pushState(null, '', href);
  closeMenus();
  route();
}

function closeMenus() {
  document.querySelectorAll('.cmd-dd.open').forEach(d => { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); });
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link], #linkbar a[data-route]');
  if (a && !a.target && !e.metaKey && !e.ctrlKey) {
    const url = new URL(a.href, location.href);
    if (url.origin === location.origin) { e.preventDefault(); return navigate(url.pathname + url.hash); }
  }
  const dd = e.target.closest('.cmd-dd > button');
  if (dd) {
    const box = dd.parentElement, open = !box.classList.contains('open');
    closeMenus();
    box.classList.toggle('open', open);
    dd.setAttribute('aria-expanded', String(open));
    return;
  }
  if (!e.target.closest('.dd-menu')) closeMenus();

  const act = e.target.closest('[data-action]');
  if (act) { e.preventDefault(); return toast(NEEDS_BACKEND); }

  const more = e.target.closest('.perk-toggle');
  if (more) {
    const card = more.closest('.room');
    card.classList.toggle('open');
    more.textContent = card.classList.contains('open') ? 'Show fewer' : `+${more.dataset.more} more perks`;
    return;
  }
  const step = e.target.closest('[data-step]');
  if (step) {
    const input = step.parentElement.querySelector('input');
    input.value = Math.max(1, (Number(input.value) || 1) + Number(step.dataset.step));
    return;
  }
  const copy = e.target.closest('[data-copy]');
  if (copy) { navigator.clipboard?.writeText(copy.dataset.copy).then(() => toast(`Copied “${copy.dataset.copy}”. Paste it in Kick chat.`)).catch(() => {}); return; }

  const f = e.target.closest('.filters button');
  if (f) {
    const group = f.parentElement;
    group.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === f));
    const v = f.dataset.v;
    if (group.dataset.filter === 'site') document.querySelectorAll('.period').forEach(p => { p.hidden = v !== 'all' && p.dataset.site !== v; });
    else document.querySelectorAll('.recent-row').forEach(r => { r.hidden = v !== 'all' && r.dataset.kind !== v; });
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });
addEventListener('popstate', route);

/* ---------- starfield ---------- */
function starfield() {
  const cv = $('#starfield'), ctx = cv.getContext('2d');
  const colors = ['#ff2d9e', '#ff6ec7', '#ffd84d', '#ffb3dd', '#ffffff'];
  let stars = [];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = () => {
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    stars = Array.from({ length: Math.round(innerWidth * innerHeight / 9000) }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height, r: (Math.random() * 1.3 + 0.4) * devicePixelRatio,
      c: colors[Math.floor(Math.random() * colors.length)], p: Math.random() * Math.PI * 2, s: 0.5 + Math.random(),
    }));
  };
  const draw = t => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      ctx.globalAlpha = still ? 0.6 : 0.35 + 0.65 * Math.abs(Math.sin(s.p + t / 1000 * s.s));
      ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!still) requestAnimationFrame(draw);
  };
  size(); addEventListener('resize', size); requestAnimationFrame(draw);
}

/* ---------- boot ---------- */
(async function boot() {
  starfield();
  try {
    S = await getPortal();
    BOARDS = boardsByKey(S);
  } catch (err) {
    $('#view').innerHTML = `<div class="empty">Couldn’t load site data (${esc(err.message)}).</div>`;
    return;
  }
  renderShell();
  route();
})();
