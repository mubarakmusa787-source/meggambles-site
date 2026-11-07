// Hand-written site content: everything that is not live data.
// Edit this file to change copy, perks, schedule, events and links.

export const CHANNEL = 'meggambles';
export const DISCORD_URL = 'https://discord.gg/megrewards';
export const CLIP_STUDIO_URL = 'https://wenbot.gg'; // Clip Studio is a separate WenBot app (/clip/ on the live site)

// Leaderboard units: everything else is in dollars.
export const BOARD_UNITS = { csgobig: 'coins', stake: 'tickets' };

export const CASINO_ORDER = ['degen', 'csgobig', 'empiredrop', 'krush', 'stake'];

export const CASINOS = {
  degen: {
    name: 'Degen', tag: 'Slots and originals', code: 'Meg', url: 'https://degen.com/?ref=Meg',
    art: '/assets/cards/degen.webp',
    blurb: 'Her main board. Slots, originals and the biggest monthly prize pool.',
    perks: [
      '15% instant rakeback',
      '100% deposit match up to $1,500 (min $20 deposit, max bet $10, 30× rollover)',
      '3 free poker tournaments every week',
      '2 mini-game events and 2 Guess the Balance events every week',
      'Weekly raffles and giveaways',
      'Saturday free spins and Wednesday bonus code drops',
      'VIP rewards and exclusive bonuses',
    ],
  },
  csgobig: {
    name: 'CSGOBig', tag: 'Cases and coins', code: 'Meg', url: 'https://csgobig.com/r/Meg',
    art: '/assets/cards/csgobig.webp',
    blurb: 'Case openings and battles, with a coin race that pays out every two weeks.',
    perks: [
      'Extra 10% deposit bonus on 500+ credits, on top of the 5% site bonus (one claim per player)',
      'Weekly wager rewards: 10K wager 50 credits, 25K 125, 50K 200, 100K 350. Every milestone, every week',
      '10% weekly lossback, claimable every Monday (min 100 credits net loss)',
      'Free case battles and giveaways, plus a free battle every day',
      'VIP access for consistently active players',
      'Open a ticket with your weekly wager stats to claim',
    ],
  },
  empiredrop: {
    name: 'EmpireDrop', tag: 'Boxes and battles', code: 'Meg', url: 'https://empiredrop.com/?r=Meg',
    art: '/assets/cards/empiredrop.webp',
    blurb: 'Mystery boxes and case battles, with a monthly race and offers through the month.',
    perks: [
      '200% first deposit bonus up to €5,000 (min €20 deposit, 10× wager)',
      'Leaderboard races with real prize pools, paid by EmpireDrop',
      'Daily giveaways, plus tips for players under code MEG',
      'Up to 25% weekly lossback',
      'Free daily VIP boxes and daily VIP deposit bonuses',
      'VIP program for high rollers: birthday bonuses, VIP challenges, random balance juices and a big VIP gift every 3 months',
      'Play in euros or dollars',
    ],
  },
  krush: {
    name: 'Krush', tag: 'Boxes and battles', code: 'Meg', url: 'https://krush.gg/?ref=meg',
    art: '/assets/cards/krush.webp', prizePool: 1000,
    blurb: 'Mystery boxes and battles under code MEG, with a $1,000 monthly leaderboard just for her players.',
    perks: [
      '$1,000 monthly leaderboard, just for MegGambles players',
      '10% first-time deposit bonus',
      '5% daily deposit bonus',
      '$5,000 weekly leaderboard on the site',
      'VIP program: a VIP host and founders group chat, 10–25% VIP deposit bonus, 10–15% weekly lossback, random VIP juices and weekly offers',
      'Krush 2.0 coming soon: redesign, keno, rewards and more',
      'Tips for players under code MEG',
      '3 free cases',
    ],
  },
  stake: {
    name: 'Stake', tag: 'Raffle and originals', code: 'Meg', url: 'https://stake.com/?c=meg',
    art: '/assets/cards/stake.webp', poolLabel: 'Mystery', boardTitle: 'Stake Raffle Leaderboard',
    blurb: 'Mystery draws every month. Wager to earn more tickets for the raffle — more tickets, better odds.',
    boardNote: 'Tickets are entries, not places. Wager to earn more tickets for the raffle — more tickets means better odds in the draw, not a guaranteed prize.',
    perks: [
      'Mystery draws every month',
      'Wager to earn more tickets for the raffle, boosted by your Stake rank',
      'More tickets means better odds in the draw, not a guaranteed prize',
      'Code MEG on sign-up',
    ],
  },
};

export const PERKS_SHOWN = 4;

export const HOUSE_BOARDS = [
  {
    name: 'Clipping Leaderboard', tag: 'Clip the stream', art: '/assets/cards/clips.webp',
    pool: '$1,000', per: 'every month',
    blurb: 'Clip the stream, submit it in the Clip Studio and climb the board. The top ten split $1,000 cash every month.',
    perks: [
      '$1,000 cash every month, split across the top 10',
      '#1 takes $300, #2 $200, #3 $125, down to $20 for #10',
      'Channel points for ranks 11 to 50',
      'Approved clips score; a fresh board every month',
    ],
    links: [{ label: 'Leaderboard', href: '/clip/?view=Leaderboard', live: true }, { label: 'Submit a clip', href: '/clip/' }],
  },
  {
    name: 'Refer a Friend', tag: 'Referral race', art: '/assets/cards/refer.webp',
    pool: '$2,000', per: 'every month',
    blurb: 'Bring your gambling friends and climb the board. Points come from your friend’s verified previous wager.',
    perks: [
      '$2,000 every month, split across the top 10',
      'Points come from your friend’s previous wager, verified by the team',
      'Open a ticket in Discord to get your friend verified',
      '18+ gamblers only. Genuine referrals, no alts',
    ],
    links: [{ label: 'Leaderboard', href: '/referrals', live: true }, { label: 'Open a ticket', href: 'discord' }],
  },
];

export const FEATURES = [
  ['i-gift', 'Daily', 'Giveaways'], ['i-cal', 'Weekly', 'Events'], ['i-people', 'Amazing', 'Community'],
  ['i-crown', 'Exclusive', 'Bonuses'], ['i-trophy', 'Big', 'Leaderboards'], ['i-game', 'Live', 'Streams'],
  ['i-diamond', 'VIP', 'Rewards'], ['i-bag', 'Merch', 'Shop'],
];

export const SCHEDULE = [
  { day: 'Mon', what: 'Mini Games', em: '🎮' },
  { day: 'Tue', what: 'Poker', em: '🃏' },
  { day: 'Wed', what: 'Mini Games + Bonus Code Drops', em: '🎁' },
  { day: 'Thu', what: 'Guess the Balance', em: '💰' },
  { day: 'Fri', what: 'Raffles', em: '🎟' },
  { day: 'Sat', what: 'GTB + Free Spins!', em: '🎰' },
  { day: 'Sun', what: 'Poker Night', em: '🃏' },
];

export const COMMUNITY_PERKS = [
  'Friendly & supportive members', 'Exclusive content & offers', 'Giveaways, events & competitions',
  'Real gameplay & honest reviews', 'VIP access & special perks', 'A place for true gamblers ♥',
];

export const EVENTS = [
  { title: '$2,000 Referral Race', sub: 'Refer a friend', href: '/referrals', img: '/assets/events/refer.webp' },
  { title: 'Saturday Free Spins', sub: 'Every Saturday', href: '/#casinos', img: '/assets/events/spins.webp' },
  { title: 'Wednesday Code Drops', sub: 'Every Wednesday', href: 'discord', img: '/assets/events/codes.webp' },
  { title: 'Free Poker Tournaments', sub: '3 per week', href: 'discord', img: '/assets/events/poker.webp' },
  { title: 'Monthly Giveaway', sub: 'Enter in the shop', href: '/store', img: '/assets/events/giveaway.webp' },
  { title: 'Clipping Leaderboard', sub: 'Clip the stream, get paid', href: '/clip/?view=Leaderboard', img: '/assets/events/clips.webp' },
];

export const BIG_WINS = [
  { id: 'clip_01KW2077G1JBQV6SK0KY72JHTC', sub: 'b7', title: '$25K HIT!!! 💜', dur: 100 },
  { id: 'clip_01KWPMYCNHTAYNBDRYWTCDDW7N', sub: 'c6', title: '500x KENO for $10K HOLYYY', dur: 59 },
];
