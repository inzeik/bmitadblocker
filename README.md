# BMITADBLOCKER — DNS filtering on NextDNS + Cloudflare Pages

A dashboard and setup page for ad/tracker blocking at DNS level.

- **NextDNS** does the filtering and records the analytics.
- **Cloudflare Pages** hosts the website on a free `*.pages.dev` address.
- **Pages Functions** (folder `functions/`) call the NextDNS API. They hold the secret API key, so it never reaches the browser.

```
Phone  ───────────►  <profile-id>.dns.nextdns.io        (blocking happens here)

Browser ─► /api/*  ─► Pages Function (adds API key) ─► api.nextdns.io  (stats + logs)
```

## Folder structure

```
bmitadblocker/
├── public/                  The website (what visitors download)
│   ├── index.html           Page structure: Setup, Dashboard, Extension tabs + About overlay
│   ├── css/                 One file per part of the UI
│   │   ├── theme.css          colours, fonts, light/dark tokens
│   │   ├── base.css           reset + typography
│   │   ├── nav.css            top bar
│   │   ├── layout.css         page container, headings, cards
│   │   ├── setup.css          Setup tab
│   │   ├── dashboard.css      Dashboard tab
│   │   ├── extension.css      Extension tab
│   │   └── about.css          About overlay
│   └── js/                  One file per feature (ES modules)
│       ├── main.js            entry point, wires everything together
│       ├── config.js          settings (refresh times, time ranges)
│       ├── api.js             ALL data access: live NextDNS or demo fallback
│       ├── mock-data.js       fake data for demo mode
│       ├── setup.js           Setup tab: hostnames, QR, copy buttons
│       ├── dashboard.js       Dashboard tab: fetch + draw
│       ├── theme.js           dark/light toggle
│       ├── navigation.js      tab switching
│       ├── about-modal.js     About overlay
│       └── utils.js           small helpers
├── functions/               Server side (Cloudflare Pages Functions)
│   ├── api/config.js          GET /api/config   -> is NextDNS configured? which profile?
│   ├── api/[[path]].js        GET /api/...      -> proxy to api.nextdns.io (read-only, allow-listed)
│   └── mobileconfig.js        GET /mobileconfig -> iPhone/Mac DNS profile
├── package.json             npm scripts (dev, deploy)
├── .dev.vars.example        template for local secrets
└── README.md
```

## One-time setup

1. **NextDNS** (free plan: 300k queries/month): create an account at my.nextdns.io.
   - *Setup* tab → copy the **Configuration ID** (6 characters).
   - *Account* page → copy your **API key**.
   - *Settings → Logs* → turn **Logs ON** (the live log and device list need it).
2. **Test locally**
   ```
   npm install
   cp .dev.vars.example .dev.vars      # then edit it: API key + profile ID
   npm run dev                         # open http://localhost:8788
   ```
3. **Deploy to pages.dev** (pick one)
   - **CLI:** `npx wrangler login`, then `npm run deploy`. Your site is `https://bmitadblocker.pages.dev`.
   - **GitHub:** push this folder, then Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git. Build command: *(none)*. Output directory: `public`.
   
   Then add the two variables in **Pages → Settings → Variables and Secrets** (Production): `NEXTDNS_API_KEY` (type *Secret*) and `NEXTDNS_PROFILE_ID`. Redeploy once so they apply.

   > Drag-and-drop upload in the dashboard may skip the `functions/` folder. Use the CLI or GitHub.

## Demo mode (safety net for presentations)

The top-right pill shows where data comes from: **NextDNS Live** (green) or **Demo data** (amber).

- Open the site with `?demo` (e.g. `https://bmitadblocker.pages.dev/?demo`) to force fake data.
- If the NextDNS API is unreachable (no Wi-Fi, bad key), the page switches to demo data by itself.

## Before the presentation

1. Set the profile's DNS on your phone (Setup tab).
2. Browse a few ad-heavy sites so real queries appear.
3. Open the Dashboard and check the pill says **NextDNS Live**.
4. Keep a `?demo` tab open as a backup.

## NextDNS API calls used

| Dashboard part | NextDNS endpoint |
|---|---|
| Totals, block rate | `analytics/status` |
| Top blocked domains | `analytics/domains?status=blocked` |
| Connected clients | `analytics/devices` (+ newest log time per device) |
| 24-hour chart | `analytics/status;series` |
| Live query log, last seen | `logs` |

## Good to know

- **Anyone with your pages.dev link can see the dashboard** (domains, device names, IPs). Share it carefully, or protect it with Cloudflare Access (free for small teams).
- The DNS address is always NextDNS's (`<id>.dns.nextdns.io`). A custom DNS hostname is not possible on NextDNS.
- "Online" means the device made a query in the last 5 minutes. NextDNS does not report live connections.
- The QR codes use api.qrserver.com, so they need internet access.
