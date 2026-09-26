# TripMonitor

A single, unified codebase for the TripMonitor product: the public marketing
site, the sign-in flow, and the live GPS fleet dashboard. Previously this was
two separate repositories (`TripMonitor` and `map-landing-page`) that had
grown up independently; this is the merged, ready-to-scale version of both.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL. The routes:

| Route      | What it is                                   |
|------------|-----------------------------------------------|
| `/`        | Marketing / landing page                      |
| `/login`   | Sign in                                        |
| `/signup`  | Create account (demo — see note below)         |
| `/app`     | The map dashboard — **requires sign-in**       |

### Demo login

There's no backend yet, so authentication is a static, local check:

```
username: admin
password: admin
```

Signing up doesn't create a new working account (there's nowhere to store
one yet) — it just sends you to `/login`, where the credentials above are
the only ones that work. See `src/contexts/AuthContext.tsx` for exactly
where to plug in a real backend when you have one, and
`docs/GUIDE.md → "Adding real authentication"` for the walkthrough.

### Mapbox token

The dashboard needs a Mapbox token to render the map. Either:

- Set `VITE_MAPBOX_TOKEN` in a `.env` file, or
- Paste it directly into `src/config/mapbox.ts`

Get a free token at https://account.mapbox.com (free tier covers 50,000 map
loads/month).

## Project layout

```
src/
├── main.tsx, App.tsx, index.css      Entry point, router, shared theme
├── contexts/                         App-wide state: theme, language, auth
├── i18n/strings.ts                   Every translated string (EN/AR), one file
├── routes/ProtectedRoute.tsx         Auth-gates a route
├── shared/                           Small reusable UI (ThemeToggle, LanguageToggle)
├── marketing/LandingPage.tsx         The public site (/)
├── auth/                             Login, Signup, and their supporting UI
└── app/                              The product itself — the map dashboard
    ├── components/                  Sidebar, TopBar, MapCanvas, panels, gauges…
    ├── data/                        Vehicle fleet data
    └── types/                       Shared dashboard types
```

**Read `docs/GUIDE.md` before adding a feature** — it covers where new code
should live, how theming and translation work, and walks through the most
common changes (a new page, a new dashboard panel, a new translation key,
wiring up real authentication) step by step.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · Mapbox GL JS
