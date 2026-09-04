# LATE(ish) Mobile — Build & Distribution Guide

How to build the app with **EAS Build** and hand it to the client for **Android**
and **iOS**. Run every command from the `mobile/` folder.

> **`PREVIEW_MODE` is now `false`** (`src/lib/preview.ts`) — builds use **real
> authentication + the live API**. Which backend/Supabase a build talks to is
> selected by the `env` block of its profile in `eas.json` (see below).

---

## 0. One-time setup

```bash
npm install -g eas-cli      # the build tool
eas login                   # free Expo account (expo.dev/signup)
```

Config already in the repo:
- **`app.json`** — name `LATE(ish)`, slug `lateish`, bundle id `com.lateish.app` (iOS + Android), icons, splash.
- **`eas.json`** — build profiles. Each carries an `env` block that decides which
  **backend + Supabase** the build is compiled against:
  - `preview` → internal **APK**, points at the **LAN dev backend**
    (`http://192.168.0.121:5000`) + the **test** Supabase (`kwxdbljetrfqjvzbekde`).
    On-network dev testing only — a client off your LAN can't use it.
  - `production` → store builds (Android **AAB** / iOS for **TestFlight**), points at
    the **deployed backend** (`https://lateish-rjf8.vercel.app/api/v1`) + the
    **production** Supabase (`okjgofomfvbbwpxolkmo`). Auto-increments build number.
  - `production-apk` → **extends `production`** (same production env) but outputs a
    **direct-install APK** — for handing a production build to the client without the
    Play Store. Command: `eas build --platform android --profile production-apk`.
- **`.easignore`** — keeps `node_modules`, `.expo`, `android`, `ios`, etc. out of the upload.

> **Production prerequisites** (so a `production` / `production-apk` build actually
> works for the client): the **production Supabase** (`okjgofomfvbbwpxolkmo`) must be
> migrated (`npm run migrate`) so the push + preference tables and the
> `supabase_realtime` publication exist, and its **Google/Apple auth providers** must
> be enabled with `lateish://` in the redirect-URL allow-list. See
> `../PUSH_NOTIFICATIONS_SETUP.md` and `../APPLE_LOGIN_SETUP.md`.
>
> **Sales Map (Google Maps):** needs `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` baked
> into the build (already set in `eas.json`'s `preview`/`production` profiles)
> — **any build made before this key was added needs a rebuild** to pick it
> up. No backend involvement: the app calls Google's Maps JS API (Sales Map)
> and Places API (Add Account's venue-name autocomplete) directly with this
> key — see `../project_mobile_sales_map_v2` (Google Maps runs inside the
> existing WebView, not `react-native-maps`; autocomplete predictions don't
> work on the Expo *web* target specifically, due to Google's CORS policy on
> the Places REST API — native iOS/Android are unaffected).

### ⚠️ This folder MUST be its own git repo
`mobile/` is git-ignored by the parent repo. EAS uses git to decide what to upload,
so if it isn't its own repo the build fails with
`package.json does not exist in /home/expo/workingdir/build/mobile` (see Troubleshooting).
It has already been initialised. **Commit changes before every build:**

```bash
git add -A && git commit -m "…"
```

---

## 1. Android → build & distribute (no paid account needed)

```bash
eas build --platform android --profile preview
```

First run prompts (answer **Yes** to each):
- *Create an EAS project?* → **Y** (writes a `projectId` into `app.json`).
- *Install expo-updates & configure EAS Update?* → **Y** (enables OTA updates; then re-run the build once — see Troubleshooting).
- *Generate a new Android Keystore?* → **Y** (EAS creates & stores the signing key).

Output: a cloud build (~10–20 min + queue) with an **APK download link**.

**Give it to the client:** send the build URL (or the `.apk`). On their Android phone:
1. Open the link / scan the QR → Download.
2. Allow "install from unknown sources" for the browser.
3. Open the app — launches straight into the UI preview.

Link stays live ~30 days and works for anyone you send it to.

> The `preview` APK points at the **LAN** backend — good for testing on your own
> network, useless to a remote client.

### 1b. Android production APK — for the client (production backend)

To hand the client an installable Android build that talks to the **deployed
backend + production Supabase** (no Play Store, no Google account):

```bash
eas build --platform android --profile production-apk
```

- Reuses the existing Android keystore (no prompts), uses the production `env`, and
  outputs an **APK download link**.
- Send the client the link → he installs directly (allow "install from unknown
  sources"). Same FCM push + real login as the store build.
- Make sure the **production prerequisites** above are done, or login/push won't work.

---

## 2. iOS → build & distribute via TestFlight

iOS needs a **paid Apple Developer account** ($99/yr). We sign in with the client's
**Apple ID email + password**. Every Apple account has **2-factor auth**, so on login
Apple sends a **6-digit code to the client's trusted device** — you need that code.

### 2a. Before you start
- You have the client's **Apple ID email + password**.
- The client is **reachable to relay the 2FA code** when you run the build (the code goes
  to *their* device, not yours).
- The client has logged into [developer.apple.com](https://developer.apple.com) once and
  **accepted any pending agreements** (a stale license agreement is the #1 cause of
  iOS build/submit failures).

### 2b. Build
```bash
eas build --platform ios --profile production
```
- When asked *"Log in to your Apple account?"* → **Yes**.
- Enter the client's **Apple ID email** and **password**.
- Apple pushes a **6-digit 2FA code to the client's device** → client sends it to you → type it in.

Then a series of interactive prompts (in order):

1. **`⚠️ Detected that your app uses Expo Go for development…`** — harmless warning
   for a preview build. Ignore it (or `export EAS_BUILD_NO_EXPO_GO_WARNING=true`).
2. **`iOS app only uses standard/exempt encryption? (Y/n)`** → **Y**. The app uses only
   standard HTTPS/TLS/system crypto — no custom encryption — so it's **export-exempt**
   (`ITSAppUsesNonExemptEncryption = false`) and skips the export-compliance paperwork.
   `app.json` already declares this under `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`,
   so App Store Connect won't ask again after upload — but eas-cli may still prompt here; answer **Y**.
3. **`Select a Team »`** — the Apple **Developer Team** that will *own* the app. The client's
   Apple ID belongs to several teams; **the client chose `ARTHUR PLAT - Individual`
   (team id `3UCFPF9QLM`)**. This is a client decision — see Troubleshooting.
4. **`Select a Provider »`** — the App Store Connect org for distribution. **Must match the
   team → also `ARTHUR PLAT`.** Never mix team and provider entities.
5. **`Generate a new Apple Distribution Certificate? (Y/n)`** → **Y** to let EAS create &
   manage it — *unless* the account is at Apple's 3-cert limit (see Troubleshooting).
6. **`Generate a new Apple Provisioning Profile? (Y/n)`** → **Y**. Provisioning profiles
   **are** app-specific (unlike distribution certs), so this is always safe — no effect on
   the client's other apps.
7. EAS auto-creates the App ID (`com.lateish.app`) if it doesn't exist.

- Cloud build ~20–30 min → `.ipa`.
- EAS **caches the Apple session (~2 weeks)**, so builds within that window won't re-prompt for 2FA.
  First build sets up credentials; later builds reuse them.

### 2c. Upload to TestFlight
```bash
eas submit --platform ios --profile production
```
Interactive prompts (in order):

1. **`What would you like to submit?`** → **`Select a build from EAS`** (lists your finished
   cloud builds — no URL/ID copying). *(Shortcut: `eas submit -p ios --profile production --latest`
   skips this and grabs the newest build.)*
2. **`Which build would you like to submit?`** → pick the **latest `finished` production build**.
3. **`Generate a new App Store Connect API Key? (Y/n)`** → **Y**. This is the key EAS uses to
   *upload* to App Store Connect (separate from the Apple ID login used to *build*). EAS creates,
   stores, and **reuses it for all future submissions**. No tight per-account cap like certs.
4. **`Select role for the generated API key:`** → **`ADMIN (default)`**. On a *first-ever*
   submission EAS must **create the app record** in App Store Connect, which can trip the
   narrower `APP_MANAGER` role on permissions — ADMIN avoids a blocked upload. (It's the
   client's own account and EAS stores the key securely.)
5. If the app doesn't exist yet, EAS creates it (Name `LATE(ish)`, Bundle ID `com.lateish.app`,
   SKU `lateish`) — or make it manually in **App Store Connect → Apps → “+”**.

- Upload runs a few min, then Apple **"processes"** the build ~5–15 min before it appears in TestFlight.
- **First submission only:** App Store Connect may ask for **Export Compliance** — since
  `ITSAppUsesNonExemptEncryption: false` is set, it should auto-clear; if asked, answer *uses
  only exempt encryption*.

### 2d. Get it on devices
Everyone installs through Apple's **TestFlight** app (not the normal App Store).

| | Internal Testing | External Testing |
|---|---|---|
| Testers | up to **100** | up to **10,000** |
| Must be team members? | **Yes** (add in Users and Access) | **No** |
| Review needed? | **No** — instant | **One-time Beta App Review** (hrs–1 day) |
| Best for | small fixed team | **large teams / share a link** |

**For a large team → External Testing + Public Link:**
1. App Store Connect → your app → **TestFlight → External Testing → create a group**.
2. Add the build → submit for Beta App Review (add a test note + contact).
3. Once approved → open the group → **enable Public Link** → copy the URL.
4. Share that one link with everyone. Each person: open link → install **TestFlight** → Install.

Builds expire after **90 days**; push a new build to refresh.

> **Direct-install alternative (not for big teams):** ad-hoc distribution
> (`eas device:create` then `eas build -p ios --profile preview`) gives an install link,
> but every device UDID must be registered individually (max 100/yr). Use TestFlight instead.

---

## 3. Over-the-air (OTA) updates — no rebuild

`expo-updates` / EAS Update is configured (channels `preview` / `production`).
After **JavaScript / asset-only** changes:

```bash
eas update --channel preview      # or: production
```

Installed apps pick it up on next launch — no rebuild, no reinstall.
**Native changes** (new native libs, `app.json` plugin/icon changes) still need a full `eas build`.

---

## 4. Build both platforms at once
```bash
eas build --platform all --profile preview
```

---

## Troubleshooting — issues we hit & fixes

### Build fails instantly: `package.json does not exist in /home/expo/workingdir/build/mobile`
**Cause:** `mobile/` is git-ignored by the parent repo, so EAS (which uses git) archived
no files for it. **Fix:** make `mobile/` its own git repo:
```bash
cd mobile
git init
git add -A
git commit -m "mobile app"
```
Then re-run the build. Always commit before building.

### Upload is huge (~417 MB) / slow
**Cause:** no `.easignore`, so `node_modules` was uploaded. **Fix:** the `.easignore`
in the repo excludes `node_modules`, `.expo`, `android`, `ios`, etc. → uploads drop to a few MB.

### `Command must be re-run to pick up new updates configuration` after installing expo-updates
**Not a real failure.** EAS edited `app.json` mid-build (added `updates.url` +
`runtimeVersion`). Just **re-run** the same `eas build` command.

### `npm warn EBADENGINE … required node 22.13+, current 22.12`
**Harmless** local npm warnings. EAS builds in the cloud with a compatible Node. Ignore
(or bump local Node to 22.13+ via nvm).

### iOS: "Select a Team" / "Select a Provider" — which one?
The client's Apple ID is a member of **many** teams/providers (personal + several LLCs),
so EAS can't guess. **This is the client's decision — always ask them**, because the team
you pick *permanently owns* the app (bundle-id registration, App Store/TestFlight listing,
billing) and is painful to move later. None of the entities is named "Lateish".

- **The client chose `ARTHUR PLAT - Individual` (team id `3UCFPF9QLM`).**
- **Provider must match the team → also `ARTHUR PLAT`.** Never mix (e.g. team = ARTHUR PLAT,
  provider = SCHEJ) — keep the entity identical across both prompts.
- To skip these prompts on later builds, pin `"appleTeamId": "3UCFPF9QLM"` in `eas.json`.

### iOS: `Maximum number of Distribution Certificates generated` (only 3 allowed)
Apple caps an account at **3 distribution certificates**, and they are **account-wide, not
app-specific** — so all 3 usually belong to the client's *other* apps. `ARTHUR PLAT` was
already at the limit, so "generate new" failed and EAS offered to **revoke** one.

**Do NOT revoke blindly — ask the client first.** Revoking is safe for apps *already shipped*
to the App Store, but it **breaks any other build pipeline / local setup that relies on that
cert's private key**. You can't tell which of the three that is; only the client can.

Two safe resolutions (client picks):
1. **Reuse (best, no revocation):** client sends a `.p12` distribution cert + password from an
   existing app → re-run the build and choose **"Use an existing certificate"** instead of
   generating one.
2. **Revoke only the cert the client names:** select *just* that one in the revoke prompt,
   then EAS generates a fresh cert for Lateish.

### iOS: `Failed to sync capabilities` → `APPLE_ID_AUTH: OFF` / "bundle 'FVKDUPSG7Y' cannot be deleted"
**Cause:** EAS auto-syncs the App ID's capabilities to match the app config and tried
to **turn OFF Sign in with Apple** (`APPLE_ID_AUTH`) — but that App ID is the **primary
App ID for the `com.lateish.web.auth` Services ID** (Apple login), so Apple refuses to
remove it. The patch is atomic, so Push got rolled back too.

**Fix:** manage the capabilities by hand and disable the sync.
1. `app.json` declares `ios.usesAppleSignIn: true` so the entitlement matches the App ID.
2. In the Apple console (Identifiers → `com.lateish.app` → Capabilities) enable ✅
   **Push Notifications** and leave ✅ **Sign in with Apple** on. Save.
3. Build with the sync off (PowerShell):
   ```powershell
   $env:EXPO_NO_CAPABILITY_SYNC="1"; eas build -p ios --profile production
   ```
   (bash: `EXPO_NO_CAPABILITY_SYNC=1 eas build …`). Persist with `setx EXPO_NO_CAPABILITY_SYNC 1`.

### iOS: `maximum allowed number of team scoped Keys for this service` (APNs push key)
**Cause:** an **APNs Auth Key is team-wide** (one serves every app, sandbox + production),
and Apple caps how many you can have. The client's shared team already had its
team-scoped Sandbox+Production APNs slots full (from other apps' "Expo Push Notifications
Key" entries), so generating a new one failed.

**Fix (client's call — shared account):**
1. **Reuse (non-destructive):** get the existing APNs key's `.p8` + Key ID and
   `eas credentials` → iOS → Push Notifications → **Add a new push key** → "Generate?" **No**
   → give the `.p8` path + Key ID. (`.p8` can't be re-downloaded, so it must be a saved copy.)
2. **Or revoke an unused slot:** with the client's OK, revoke a team-scoped
   Sandbox+Production APNs key they're sure no live app uses (Apple → Keys → Revoke), then
   re-run the build and answer **Yes** to generate a fresh key. Never revoke another live
   app's key (e.g. one named for a different client).

### Android keystore
EAS generated and stores it. Before a real Play Store launch, **back it up**:
`eas credentials` → Android → download keystore, and keep it safe (losing it blocks
future updates to the same listing).

---

## Runtime bugs that only appeared in the standalone build (not Expo Go / web) — fixed

The release build enables Android **edge-to-edge** (content draws behind the status &
navigation bars) and runs in release timing, which Expo Go masked.

1. **Sidebar & Notifications panel drew under the status/nav bars.**
   Fix: read safe-area insets (`useSafeAreaInsets`) and pad content by
   `insets.top` / `insets.bottom`; set `statusBarTranslucent` + `navigationBarTranslucent`
   on those Modals (`sidebar.tsx`, `ui/right-sheet.tsx`) so edge-to-edge is consistent.

2. **Tapping a bottom tab made the screen swipe back and forth.**
   Cause: the scroll listener fired `setPage` for every boundary the *programmatic*
   animation crossed, fighting the animation. Fix (`layout/tabs-pager.tsx`): the listener
   now only runs during a real finger drag (`onScrollBeginDrag`); taps/sidebar jumps set
   `userDragging = false` and `onMomentumEnd` finalizes the page.

3. **Rep Today tab row ("Momentum / Territory / …") couldn't scroll — the whole screen swiped.**
   Cause: a horizontal `ScrollView` nested inside the horizontal pager. Fix: a
   `pager-lock` store (`store/pager-lock.store.ts`); the tab row freezes the pager's swipe
   on touch-down (`rep-tabs.tsx` `onTouchStart`) and releases it on touch end.

---

## Handy links
- Builds dashboard: https://expo.dev/accounts/sohag_abdullah26/projects/lateish/builds
- EAS Build docs: https://docs.expo.dev/build/introduction/
- EAS Submit (iOS): https://docs.expo.dev/submit/ios/
- TestFlight: https://docs.expo.dev/build/internal-distribution/ and App Store Connect
