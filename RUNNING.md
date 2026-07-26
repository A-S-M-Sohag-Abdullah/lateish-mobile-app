# Running the app

How to get LATE(ish) Mobile onto a phone, emulator or browser during
development. For project conventions see [AGENTS.md](AGENTS.md).

## Prerequisites

- Node.js 22.13+ (Expo SDK 57 requires it)
- The LATE(ish) backend checked out alongside this folder
- **Expo Go** on your phone — the quickest way to run, no Android Studio or
  Xcode needed. Every native module this app uses (reanimated,
  gesture-handler, svg, secure-store, async-storage) is bundled in Expo Go, so
  a custom dev build is not required yet.

## 1. Start the backend

```bash
cd backend
npm run dev
```

It listens on port 5000 and binds all interfaces, so a phone on the same
network can reach it.

## 2. Point the app at the backend

`EXPO_PUBLIC_API_URL` in `mobile/.env` defaults to `http://localhost:5000/api/v1`.

**On a phone or Android emulator, `localhost` means the device itself, not your
PC** — leaving the default there produces a network error on sign-in. Set it to
match where you're running:

| Target                       | `EXPO_PUBLIC_API_URL`                     |
| ---------------------------- | ----------------------------------------- |
| Physical phone (Expo Go)     | `http://<your-LAN-IP>:5000/api/v1`        |
| Android emulator             | `http://10.0.2.2:5000/api/v1`             |
| iOS simulator / web preview  | `http://localhost:5000/api/v1` (default)  |

Find your LAN IP on Windows:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.' } |
  Select-Object InterfaceAlias, IPAddress
```

(`ipconfig` works too — look for the IPv4 address of your active adapter.)

Changing `.env` requires a Metro restart with `--clear`; see below.

## 3. Start Metro

```bash
cd mobile
npx expo start
```

Then choose a target:

| Target           | How                                                        |
| ---------------- | ---------------------------------------------------------- |
| Physical phone   | Scan the terminal QR code with Expo Go. Phone and PC must be on the same Wi-Fi. |
| Android emulator | Press `a` (needs Android Studio with an AVD running)        |
| iOS simulator    | Press `i` (macOS only)                                      |
| Browser          | Press `w` — fastest check for layout and theming, but it's react-native-web, not the real renderer |

Other keys in the Metro terminal: `r` reloads, `j` opens the debugger, `m`
toggles the dev menu.

## What you should see

First the splash: the LATE(ish) logo over a gradient that shifts from navy to
maroon.

It exists in two halves. The **native** splash (configured in `app.json`) can
only render a solid colour behind the logo, so it uses the navy gradient's
midpoint, `#0C1426`. `BrandSplash` then takes over on the first JS frame with
the real gradients, drawing the logo at the same size and position so the
handover is invisible. The splash holds until the colour shift has finished
even if the app was ready sooner, so a warm start doesn't cut the animation
off; timings live in `SPLASH_TIMING` in `src/lib/brand.ts`.

**Web has no native splash at all**, so there you see only the `BrandSplash`
half — still correct, just preceded by a brief blank page while the JS bundle
downloads.

Then the Sign In screen.

**The app is currently in UI preview mode** (`PREVIEW_MODE` in
`src/lib/preview.ts`). Sign In and Sign Up go straight to the dashboard without
calling the API, so no account or running backend is needed to walk the
screens. The dashboard renders static data from `src/lib/mock-data.ts`.

Tabs are Dashboard, Targets, Rep Today, BDM and Orders; the dashboard's gear
icon opens Profile, which has the light/dark/system switch and Sign Out.
Targets, BDM and Orders are placeholders pending designs.

Set `PREVIEW_MODE` to `false` to restore real authentication — every bypass in
the app checks that one flag.

## Google sign-in

The Google button needs one piece of Supabase configuration that cannot be done
from the code. In the Supabase dashboard under **Authentication → URL
Configuration → Redirect URLs**, add the URL the app redirects back to:

- dev build / production — `lateish://`
- Expo Go — the `exp://<your-ip>:8081/--/*` URL Expo prints at startup

Without it the provider rejects the round-trip and the browser tab closes
without a session. Email sign-in is unaffected.

## Everyday commands

```bash
npx expo start --clear   # REQUIRED after editing .env, tailwind.config.js,
                         # src/global.css, babel.config.js or metro.config.js
npm run typecheck        # tsc --noEmit
npm run format           # prettier over src/
npx expo-doctor          # dependency and config sanity check
```

## Troubleshooting

**Phone can't reach Metro or the API.** Usually one of two things:

1. Windows Firewall is blocking port 8081 (Metro) or 5000 (API). Allow Node.js
   on private networks when prompted.
2. The network profile is set to Public, which blocks device-to-device traffic
   outright. Switch it to Private.

If Metro itself won't connect, `npx expo start --tunnel` routes around the LAN
entirely — slower, but it works from anywhere.

**Sign-in fails with a network error.** Almost always the `localhost` problem in
step 2. Confirm the backend is up by opening `http://<your-LAN-IP>:5000/api/v1`
in your phone's browser.

**Styles don't update after a Tailwind change.** NativeWind compiles at bundle
time, so restart with `npx expo start --clear`.

**`Missing EXPO_PUBLIC_SUPABASE_URL` on launch.** `.env` is missing or
incomplete — copy `.env.example` to `.env`, fill it in, and restart with
`--clear`.

## When a dev build becomes necessary

Expo Go covers the current dependency set. Adding a native module it doesn't
ship — `react-native-maps` for the Sales Map screen is the likely first one —
means switching to a dev build:

```bash
npx expo run:android    # or: npx expo run:ios (macOS)
```

That generates the `android/` and `ios/` folders (both gitignored) and installs
a custom client. Day-to-day workflow is otherwise unchanged: `npx expo start`
and open the installed app instead of Expo Go.
