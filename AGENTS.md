# LATE(ish) Mobile — agent notes

React Native app for the LATE(ish) platform. The web app in [`../front-end`](../front-end)
is the source of truth for design tokens, API contracts and auth behaviour —
port from it rather than inventing new patterns.

## Expo HAS CHANGED

This is Expo SDK 57 / React Native 0.86 / React 19.2. APIs and conventions may
differ from your training data. Read the exact versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Stack

| Concern      | Choice                                                     |
| ------------ | ---------------------------------------------------------- |
| Routing      | expo-router (file-based, in `src/app`), typed routes on     |
| Styling      | NativeWind v4 (Tailwind 3.4) — `className`, not StyleSheet  |
| Server state | TanStack Query v5                                          |
| Client state | Zustand v5                                                 |
| Auth/data    | Supabase JS + the LATE(ish) REST API                        |
| Icons        | lucide-react-native (same icon set as web)                  |

## Rules

- **Styling is Tailwind classes.** Do not add `StyleSheet.create`. The only
  acceptable inline styles are values Tailwind cannot express in RN (e.g.
  `flex: 1` on `GestureHandlerRootView`).
- **The app is in UI preview mode.** `PREVIEW_MODE` in `src/lib/preview.ts`
  bypasses auth and feeds the dashboard from `src/lib/mock-data.ts`. When
  wiring real data, gate on that flag rather than adding a second switch, and
  delete `mock-data.ts` once nothing imports it.
- **All API calls go through TanStack Query** — `useQuery`/`useMutation`, never
  a raw `useEffect` + `api.*`. Same rule as the web app.
- **The splash and auth screens are fixed-dark brand surfaces**, not themed
  app chrome — they use the `brand-*` colours and white-alpha utilities and
  ignore the light/dark preference on purpose. Everything behind the login wall
  uses theme tokens.
- **Colours come from tokens**, never hex literals. Use `bg-card`,
  `text-muted-foreground`, etc. When a literal value is unavoidable (SVG icons,
  navigators, `placeholderTextColor`) use `useThemeColors()`.
- **Two places define the palette** and must stay in sync: `src/global.css`
  (Tailwind classes) and `src/lib/theme.ts` (literal values). Both are ports of
  `front-end/src/app/globals.css` — light-mode tokens were converted from oklch
  to HSL because React Native has no oklch support.
- **Font weights swap font family, not `fontWeight`.** Inter ships one static
  file per weight, so `tailwind.config.js` re-maps `font-medium`,
  `font-semibold`, ... to the matching `Inter_*` family. Any new weight must
  also be loaded in `src/app/_layout.tsx`.
- **No `Alert.alert` for confirmations** — mirror the web rule and use an
  inline or component-based confirmation UI.
- Env vars must be `EXPO_PUBLIC_*` and read as literal
  `process.env.EXPO_PUBLIC_X` lookups (Expo inlines them at build time —
  dynamic keys silently become `undefined`). Add new ones to `src/lib/env.ts`
  and `.env.example`.
- After changing `tailwind.config.js`, `global.css`, `babel.config.js`,
  `metro.config.js` or `.env`, restart with `npx expo start --clear`.

## Layout

```
src/
  app/              expo-router routes
    (auth)/         login, register — redirects to / when a session exists
    (tabs)/         signed-in shell — redirects to /login when it doesn't
  components/
    brand/          wordmark
    layout/         Screen frame (safe area + page header)
    providers/      QueryProvider
    ui/             Text, Button, Card, Input, Badge — ports of the web ui/
  contexts/         theme-context (persists light/dark/system)
  hooks/            useThemeColors
  lib/              env, supabase, api, theme, utils(cn)
  store/            auth.store (Zustand)
  types/            shared API types, ported from the web app
```
