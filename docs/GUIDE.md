# Guide: working in this codebase

This file is the map. Read the relevant section before you add something —
it'll tell you where it goes and what pattern to follow, so the codebase
stays consistent as it grows instead of accumulating one-off patterns per
feature.

## Mental model

Three areas share one app:

- **`marketing/`** — the public site. Nobody is signed in here.
- **`auth/`** — sign in / sign up. The bridge between the two.
- **`app/`** — the actual product (the map dashboard). Always behind
  `ProtectedRoute`.

All three share the same **theme** (`contexts/ThemeContext.tsx`), the same
**translations** (`contexts/LanguageContext.tsx` + `i18n/strings.ts`), and
the same **auth state** (`contexts/AuthContext.tsx`). That's the whole
point of having merged the two original repos: one dark/light toggle, one
language toggle, one login, instead of three copies that drift apart.

Providers are mounted once, at the top of `src/App.tsx`. Any component
anywhere in the tree can just call `useTheme()`, `useLanguage()`, or
`useAuth()` — no prop drilling needed for these three things.

---

## Recipe: adding a new page

1. Create the component wherever it semantically belongs (`marketing/`,
   `auth/`, or a new folder if it's a genuinely new area).
2. Add a `<Route>` for it in `src/App.tsx`.
3. If it needs to be signed-in-only, wrap the element in `ProtectedRoute`:

```tsx
<Route
  path="/app/settings"
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

That's the entire pattern — `ProtectedRoute` (in `src/routes/`) already
handles redirecting to `/login` and sending the visitor back to where they
were headed after they sign in.

---

## Recipe: adding a translation key

All strings live in `src/i18n/strings.ts` as one typed object, `en` and
`ar` side by side. Nothing else in the app should have translation strings
hardcoded — the whole point of the typed `TranslationKey` is that a typo
or a missing translation is a compile error, not a silent blank string in
production.

1. Add the key to **both** `strings.en` and `strings.ar` in
   `src/i18n/strings.ts`.
2. Use it: `const { t } = useLanguage(); … {t('your_new_key')}`.

Naming convention: prefix by area — `landing_*` for the marketing site,
`auth_*` for login/signup, everything else (dashboard) is unprefixed
since it was the original app and the names are already scoped by context
(`filter_*`, `legend_*`, etc.).

**Scope note:** the marketing page's deep interactive sections (the route
builder, live cockpit, geofence, and ROI calculator demos) are large,
animation-heavy, and mostly still English-only — only their headings and a
few key labels were wired up to `t()` in this pass. If you're translating
more of them, follow the exact same pattern already used for their
headings (search `RouteBuilderSection` for `t("landing_route_planner")`
as a working example to copy).

---

## Recipe: theming (dark/light mode)

Every color in the app resolves from a single set of CSS variables in
`src/index.css`: light values under `:root`, dark values under `.dark`.
`ThemeContext` just toggles the `.dark` class on `<html>` — nothing else.

**If a component's colors don't respond to the toggle**, it's almost
always because it's using a hardcoded hex value (like `#00ff6e`) instead
of a variable. Two ways to reference the shared tokens:

- Tailwind utility classes: `bg-background`, `text-foreground`,
  `border-border`, `bg-primary`, or the marketing-flavoured aliases
  `bg-ground`, `text-text`, `bg-surface`, `border-edge`, `text-neon` (these
  point at the exact same variables — see the comment block at the top of
  `index.css`).
- Raw CSS: `var(--background)`, `var(--foreground)`, etc.

**Adding a new token:** add the light value under `:root` and the dark
value under `.dark` in `index.css`. Don't invent a third, unthemed color
for new UI — reuse an existing token unless the design genuinely calls
for a new one.

**Intentionally-dark elements:** the hero's live-map mockup and the "Live
Cockpit" demo section are deliberately NOT theme-reactive — they're meant
to always look like a screenshot of the product's live console, the way a
code editor screenshot on a docs site doesn't re-theme with the page. If
you want more of the marketing page to become theme-aware, follow the
pattern already used for the page chrome (Nav, section backgrounds,
Footer) — they use the shared tokens and already just work.

**No global `overflow: hidden`:** the map dashboard needs a fixed,
non-scrolling viewport, but the marketing/auth pages need to scroll
normally. Rather than a global rule, the dashboard's own root element sets
its own `overflow: hidden`. If you add another full-screen, app-like route,
follow that same pattern (scope it locally) rather than touching the
global `html, body, #root` rule in `index.css`.

---

## Recipe: adding a dashboard panel/component

Dashboard-only code lives under `src/app/`. Follow the existing pattern:

- New UI panel → `src/app/components/YourPanel.tsx`
- New shared data shape → `src/app/types/index.ts`
- Pull in `useLanguage()` for any user-facing text (add the keys first, see
  above) — don't hardcode English strings in dashboard components.
- If it needs theme awareness, use the CSS variables (`var(--card)`,
  `var(--border)`, etc.) exactly like the existing panels do — don't accept
  a `darkMode` prop; call `useTheme()` directly if you need the boolean in
  JS (e.g. to pick a Mapbox style), the way `MapDashboard.tsx` does for
  `MapCanvas`.

---

## Recipe: adding real authentication

Right now, `src/contexts/AuthContext.tsx` checks against a single hardcoded
`admin` / `admin` pair and stores a boolean flag in `localStorage`. That's
scaffolding, not security — replace it when you have a backend:

1. In `AuthContext.tsx`, replace the body of `login()` with your real API
   call (e.g. `fetch('/api/login', …)`), and make it `async`.
2. Update the one call site in `src/auth/Login.tsx` to `await` it and
   handle a real error response instead of a boolean.
3. Consider replacing the `localStorage` flag with a real session
   (httpOnly cookie, JWT, etc.) — nothing else in the app needs to change,
   since every component reads auth state through `useAuth()`, never by
   touching `localStorage` directly.
4. Signup (`src/auth/Signup.tsx`) currently doesn't create an account at
   all — it's a placeholder that redirects to `/login`. Wire it to your
   real signup endpoint the same way.

---

## Shared UI

Before writing a one-off button for something toggle-like, check
`src/shared/` first — `ThemeToggle` and `LanguageToggle` already exist and
are used in three different places (marketing Nav, auth pages, dashboard
TopBar) via a `variant` prop rather than three separate implementations.
If you need a new small piece of UI reused in more than one of
`marketing/` `auth/` `app/`, put it in `shared/` rather than duplicating it.

---

## Known scope / honest limitations

This merge focused on architecture — one router, one theme, one language
system, one auth boundary — over rewriting every pixel. A few things are
worth knowing about before you build on top of them:

- **`marketing/LandingPage.tsx` is one large file** (~2,300 lines). It was
  originally generated as a single file and works fine as-is, but it's the
  first thing to split up if you're regularly editing it — pull each
  `function XSection()` out into its own file under a new
  `marketing/sections/` folder. Nothing about the current structure blocks
  that; it just hasn't been done yet.
- **Auth is a static demo** (see above) — don't ship this to real users
  without replacing it.
- **Signup doesn't create real accounts** — see above.
- Most of the marketing page's deep interactive content is still
  English-only (see the i18n section above for what to do about that).
