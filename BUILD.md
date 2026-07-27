# LATE(ish) Mobile — Build & Distribution Guide

How to build the app with **EAS Build** and hand it to the client for **Android**
and **iOS**. Run every command from the `mobile/` folder.

> This currently ships the **UI-preview** build: `PREVIEW_MODE` (`src/lib/preview.ts`)
> is on, so it bypasses login and shows mock data. Before a real release, wire the
> API and turn `PREVIEW_MODE` off, then rebuild.

---

## 0. One-time setup

```bash
npm install -g eas-cli      # the build tool
eas login                   # free Expo account (expo.dev/signup)
```

Config already in the repo:
- **`app.json`** — name `LATE(ish)`, slug `lateish`, bundle id `com.lateish.app` (iOS + Android), icons, splash.
- **`eas.json`** — build profiles:
  - `preview` → internal distribution; Android outputs a direct-install **APK**.
  - `production` → store builds (Android AAB / iOS for TestFlight), auto-increments build number.
- **`.easignore`** — keeps `node_modules`, `.expo`, `android`, `ios`, etc. out of the upload.

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
- Say **Yes** to auto-create the App ID (`com.lateish.app`), Distribution Certificate, and Provisioning Profile.
- Cloud build ~20–30 min → `.ipa`.
- EAS **caches the Apple session (~2 weeks)**, so builds within that window won't re-prompt for 2FA.
  First build sets up credentials; later builds reuse them.

### 2c. Upload to TestFlight
```bash
eas submit --platform ios --profile production
```
- Sign in with the same Apple ID (may ask for a 2FA code again if the session expired).
- If the app doesn't exist yet, let EAS create it, or create it manually
  in **App Store Connect → Apps → “+”** (Name `LATE(ish)`, Bundle ID `com.lateish.app`, SKU `lateish`).
- Apple "processes" the build ~5–15 min.

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
