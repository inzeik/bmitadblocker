// Dashboard tab: fetches data through api.js and draws it.
import { CONFIG } from './config.js';
import * as Api from './api.js';
import { $, h, timeAgo, formatNumber } from './utils.js';

// ---------- state shared between the two refresh loops ----------
let devices = [];
let lastSeenByDevice = new Map();   // deviceId -> Date of its newest query
let latestQuery = null;

const isDashboardOpen = () => $('view-dashboard').classList.contains('active');
const isOnline = (device) => {
  const seen = lastSeenByDevice.get(device.id);
  return Boolean(seen) && Date.now() - seen.getTime() < CONFIG.ONLINE_WINDOW_MIN * 60000;
};

// ---------- renderers (each one draws one card) ----------

function renderStats({ total, blocked, allowed }) {
  $('stat-total').textContent = formatNumber(total);
  $('stat-blocked').textContent = formatNumber(blocked);
  $('stat-allowed').textContent = formatNumber(allowed);
  const rate = total ? Math.round((blocked / total) * 100) : 0;
  $('stat-block-rate').textContent = `${rate}% BLOCK RATE`;
}

function renderLastSeen() {
  $('stat-lastseen').textContent = latestQuery ? timeAgo(latestQuery).toUpperCase() : '—';
}

function renderTopDomains(list) {
  const rows = list.length
    ? list.map((d) => h('div', 'domain-row', h('span', 'domain-name', d.domain), h('span', 'domain-count', formatNumber(d.count))))
    : [h('div', 'domain-row', h('span', 'domain-name', 'No blocked queries yet'))];
  $('top-domains').replaceChildren(...rows);
}

function renderClients() {
  const rows = devices
    .map((d) => ({ ...d, online: isOnline(d) }))
    .sort((a, b) => b.online - a.online || b.queries - a.queries);

  $('clients-body').replaceChildren(...rows.map((d) => {
    const seen = lastSeenByDevice.get(d.id);
    return h('tr', '',
      h('td', '', h('div', 'client-name',
        h('span', `client-status ${d.online ? 'online' : 'offline'}`),
        h('div', '', h('div', 'client-host', d.name), h('div', 'client-os', d.model)))),
      h('td', '', h('span', 'client-ip', d.ip)),
      h('td', '', h('span', 'client-queries', formatNumber(d.queries))),
      h('td', '', h('span', 'client-lastseen', seen ? timeAgo(seen) : '—')),
      h('td', '', h('span', `client-actions ${d.online ? 'allowed-tag' : ''}`, d.online ? 'ONLINE' : 'OFFLINE')));
  }));

  const online = rows.filter((d) => d.online).length;
  $('clients-total').textContent = rows.length;
  $('clients-online').textContent = online;
  $('clients-offline').textContent = rows.length - online;
}

function renderChart(series) {
  const max = Math.max(1, ...series.map((p) => p.total));
  $('chart').replaceChildren(...series.map((p) => {
    const blockedPct = p.total ? (p.blocked / p.total) * 100 : 0;
    const blockedSeg = h('div', 'bar-blocked');
    blockedSeg.style.height = blockedPct + '%';
    const bar = h('div', 'bar', blockedSeg, h('div', 'bar-allowed'));
    bar.style.height = Math.max(3, (p.total / max) * 100) + '%';
    bar.title = `${formatNumber(p.total)} queries, ${formatNumber(p.blocked)} blocked`;
    return bar;
  }));
}

function renderLogs(logs) {
  $('log-body').replaceChildren(...logs.slice(0, CONFIG.MAX_LOG_ROWS).map((l) => {
    const status = l.blocked ? 'blocked' : 'allowed';
    const time = l.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return h('tr', '',
      h('td', 'domain-name log-domain', l.domain),
      h('td', '', h('span', `badge ${status}`, status)),
      h('td', 'log-time', time));
  }));
}

// ---------- refresh loops ----------

async function refreshStats() {
  try {
    const [stats, top, devs, series] = await Promise.all([
      Api.getStats(), Api.getTopBlocked(), Api.getDevices(), Api.getSeries(),
    ]);
    devices = devs;
    renderStats(stats);
    renderTopDomains(top);
    renderChart(series);
    renderClients();
  } catch (err) {
    console.error('[dashboard] stats refresh failed:', err);
  }
}

async function refreshLogs() {
  try {
    const logs = await Api.getLogs();
    lastSeenByDevice = new Map();
    for (const l of logs) if (!lastSeenByDevice.has(l.deviceId)) lastSeenByDevice.set(l.deviceId, l.time);
    latestQuery = logs[0]?.time ?? null;
    renderLogs(logs);
    renderLastSeen();
    renderClients();
  } catch (err) {
    console.error('[dashboard] log refresh failed:', err);
  }
}

export function startDashboard() {
  const refreshAll = () => { refreshLogs(); refreshStats(); };
  refreshAll();
  setInterval(() => isDashboardOpen() && refreshLogs(), CONFIG.REFRESH_LOGS_MS);
  setInterval(() => isDashboardOpen() && refreshStats(), CONFIG.REFRESH_STATS_MS);
  document.addEventListener('view:change', (e) => { if (e.detail === 'dashboard') refreshAll(); });
}
