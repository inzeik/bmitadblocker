// Settings you may want to tweak. Nothing secret lives here.
export const CONFIG = {
  DEMO_PROFILE_ID: 'abc123',   // shown on the Setup page when no real profile is configured
  STATS_RANGE: '-24h',         // time window for totals, top domains, devices
  CHART_RANGE: '-24h',         // time window for the bar chart
  REFRESH_LOGS_MS: 5000,       // live query log refresh
  REFRESH_STATS_MS: 15000,     // totals / chart / devices refresh
  ONLINE_WINDOW_MIN: 5,        // a device is "online" if it queried in the last N minutes
  MAX_LOG_ROWS: 12,
  TOP_DOMAINS: 6,
};
