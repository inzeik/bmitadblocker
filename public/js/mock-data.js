// Fake data for DEMO mode. Same shapes as the real NextDNS data returned by api.js.
const DOMAINS = ['doubleclick.net','googlesyndication.com','facebook.com','adservice.google.com','analytics.tiktok.com','scorecardresearch.com','criteo.com','taboola.com','outbrain.com','amazon-adsystem.com','google-analytics.com','hotjar.com','youtube.com','google.com','cloudflare.com','github.com','mozilla.org','stackoverflow.com','reddit.com','wikipedia.org'];
const BLOCKED = new Set(['doubleclick.net','googlesyndication.com','adservice.google.com','analytics.tiktok.com','scorecardresearch.com','criteo.com','taboola.com','outbrain.com','amazon-adsystem.com','google-analytics.com','hotjar.com']);

const DEVICES = [
  { id: 'pixel',   name: 'Pixel 8 Pro',  model: 'Android 15', ip: '192.168.1.42',  queries: 8140, online: true  },
  { id: 'iphone',  name: 'Johns-iPhone', model: 'iOS 18',     ip: '192.168.1.57',  queries: 2394, online: true  },
  { id: 'macbook', name: 'Work-MacBook', model: 'macOS 15',   ip: '192.168.1.88',  queries: 1120, online: true  },
  { id: 'tablet',  name: 'Kids-Tablet',  model: 'Android 14', ip: '192.168.1.103', queries: 826,  online: false },
];

const counters = { total: 12480, blocked: 8210 };
const logs = [];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function addLog(device) {
  const domain = pick(DOMAINS);
  const blocked = BLOCKED.has(domain);
  logs.unshift({ domain, blocked, time: new Date(), deviceId: device.id });
  if (logs.length > 100) logs.pop();
  counters.total++;
  if (blocked) counters.blocked++;
  device.queries++;
}

// Seed: a few recent queries, plus one old query from the offline tablet.
const onlineDevices = DEVICES.filter((d) => d.online);
for (let i = 0; i < 8; i++) addLog(pick(onlineDevices));
logs.push({ domain: 'youtube.com', blocked: false, time: new Date(Date.now() - 2 * 3600e3), deviceId: 'tablet' });

const topBlocked = [...BLOCKED].slice(0, 6)
  .map((domain) => ({ domain, count: Math.floor(Math.random() * 800 + 100) }))
  .sort((a, b) => b.count - a.count);

const series = Array.from({ length: 24 }, () => {
  const total = Math.floor(300 + Math.random() * 500);
  return { total, blocked: Math.floor(total * (0.4 + Math.random() * 0.3)) };
});

export const getStats = () => ({ ...counters, allowed: counters.total - counters.blocked });
export const getTopBlocked = () => topBlocked;
export const getSeries = () => series;
export const getDevices = () => DEVICES.map(({ online, ...device }) => ({ ...device }));
export function getLogs() {
  // Each refresh = a few new queries, so the demo looks alive.
  for (let i = 0, n = 1 + Math.floor(Math.random() * 4); i < n; i++) addLog(pick(onlineDevices));
  return [...logs];
}
