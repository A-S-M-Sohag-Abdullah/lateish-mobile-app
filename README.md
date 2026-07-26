# LATE(ish) Mobile

React Native app for the LATE(ish) platform, sharing the web app's design
tokens, API and auth.

Expo SDK 57 · React Native 0.86 · expo-router · NativeWind v4 · TanStack Query
v5 · Zustand v5 · Supabase.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` / `w` for Android, iOS
(macOS only) or the browser.

One gotcha worth knowing up front: `EXPO_PUBLIC_API_URL` defaults to
`localhost`, which on a phone or emulator means *the device itself*, not your
machine — so sign-in fails until you point it at your LAN IP.

**[RUNNING.md](RUNNING.md) covers all of this in full**, plus emulator setup,
firewall issues and troubleshooting.

## Scripts

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `npm start`         | Metro dev server                 |
| `npm run android`   | Build/open on Android            |
| `npm run ios`       | Build/open on iOS (macOS)        |
| `npm run web`       | Run in the browser               |
| `npm run typecheck` | `tsc --noEmit`                   |
| `npm run format`    | Prettier over `src/`             |
| `npm run doctor`    | Expo dependency/version check    |

## Theming

Tokens are a 1:1 port of `front-end/src/app/globals.css`. The web light theme is
authored in oklch, which React Native does not support, so those values were
converted to their HSL equivalents; the dark theme was already HSL and is
verbatim. They live in two places that must stay in sync:

- `src/global.css` — CSS variables, consumed by Tailwind classes
- `src/lib/theme.ts` — the same values as literals, for SVG icons, navigators
  and anything else that needs a colour string rather than a class

Light/dark/system is user-selectable on the Profile tab and persisted to
AsyncStorage. Default is dark, matching the web app.

## Conventions

See [AGENTS.md](AGENTS.md).

## Status

Scaffolding only. Auth (sign in / sign up / sign out) is wired end-to-end
against the real backend; the four tab screens are placeholders waiting on the
UI designs.
