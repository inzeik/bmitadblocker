// Data layer. The dashboard only talks to this file.
//
//   LIVE mode : browser -> /api/* (Cloudflare Pages Function) -> api.nextdns.io
//   DEMO mode : fake data from mock-data.js (used when the API is not configured,
//               when the page is opened with ?demo, or if a live request fails)
//
// Every function returns the same "normalized" shape in both modes, so dashboard.js
// never needs to know which mode is active.
import { CONFIG } from './config.js';
import * as Mock from './mock-data.js';

let mode = 'demo';
const listeners = [];

export const getMode = () => mode;
export function onModeChange(fn) { listeners.push(fn); }
function setMode(next) {
  if (next === mode) return;
  mode = next;
  listeners.forEach((fn) => fn(mode));
}

/** Call once at startup. Decides live vs demo and returns the profile ID to display. */
export async function init() {
  let profileId = CONFIG.DEMO_PROFILE_ID;
  const forceDemo = new URLSearchParams(location.search).has('demo');
  if (!forceDemo) {
    try {
      const cfg = await (await fetch('/api/config')).json();
      if (cfg.configured) { profileId = cfg.profileId; setMode('live'); }
    } catch { /* no Functions available (offline / plain static server) -> demo */ }
  }
  return { profileId };
}

// ---------- internals ----------

async function get(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/${path}${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

/** Run the live request; on any failure switch to demo data so the page never breaks. */
async function withFallback(liveFn, mockFn) {
  if (mode === 'demo') return mockFn();
  try {
    return await liveFn();
  } catch (err) {
    console.warn('[api] live request failed, switching to demo data:', err.message);
    setMode('demo');
    return mockFn();
  }
}

const sum = (list) => list.reduce((n, x) => n + x, 0);

// ---------- public API (normalized shapes) ----------

/** -> { total, blocked, allowed } */
export const getStats = () => withFallback(async () => {
  const { data } = await get('analytics/status', { from: CONFIG.STATS_RANGE });
  const total = sum(data.map((d) => d.queries));
  const blocked = sum(data.filter((d) => d.status === 'blocked').map((d) => d.queries));
  return { total, blocked, allowed: total - blocked };
}, Mock.getStats);

/** -> [{ domain, count }] */
export const getTopBlocked = () => withFallback(async () => {
  const { data } = await get('analytics/domains', {
    status: 'blocked', limit: CONFIG.TOP_DOMAINS, from: CONFIG.STATS_RANGE,
  });
  return data.map((d) => ({ domain: d.domain, count: d.queries }));
}, Mock.getTopBlocked);

/** -> [{ id, name, model, ip, queries }] */
export const getDevices = () => withFallback(async () => {
  const { data } = await get('analytics/devices', { from: CONFIG.STATS_RANGE });
  return data.map((d) => ({
    id: d.id,
    name: d.name || 'Unidentified device',
    model: d.model || '—',
    ip: d.localIp || '—',
    queries: d.queries,
  }));
}, Mock.getDevices);

/** -> [{ total, blocked }] one entry per time bucket, oldest first */
export const getSeries = () => withFallback(async () => {
  const { data } = await get('analytics/status;series', { from: CONFIG.CHART_RANGE });
  const length = data.length ? Math.max(...data.map((d) => d.queries.length)) : 0;
  const blockedRow = data.find((d) => d.status === 'blocked');
  return Array.from({ length }, (_, i) => ({
    total: sum(data.map((d) => d.queries[i] || 0)),
    blocked: blockedRow ? blockedRow.queries[i] || 0 : 0,
  }));
}, Mock.getSeries);

/** -> [{ domain, blocked, time: Date, deviceId }] newest first */
export const getLogs = () => withFallback(async () => {
  const { data } = await get('logs', { limit: 100 });
  return data
    .map((l) => ({
      domain: l.domain,
      blocked: l.status === 'blocked',
      time: new Date(l.timestamp),
      deviceId: l.device?.id ?? '__UNIDENTIFIED__',
    }))
    .sort((a, b) => b.time - a.time);
}, Mock.getLogs);
