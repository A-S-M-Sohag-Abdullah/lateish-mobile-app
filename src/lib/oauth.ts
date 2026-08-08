import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "./supabase";

// Required on Android so the auth tab closes itself once the redirect fires.
WebBrowser.maybeCompleteAuthSession();

/**
 * The URL Supabase sends the browser back to. Resolves to `lateish://` in a
 * build and an `exp://…` URL inside Expo Go — **both must be added to the
 * Supabase dashboard under Authentication → URL Configuration → Redirect URLs**,
 * or the provider rejects the round-trip.
 *
 * Resolved on demand rather than at import: this module is pulled in by the
 * auth store, so anything that throws here would take down app startup.
 */
export function getOauthRedirectUri(): string {
  return makeRedirectUri();
}

/**
 * Turn the URL the browser redirected back to into a Supabase session.
 *
 * Two shapes are possible depending on the project's flow type: PKCE returns a
 * `code` to exchange, the implicit flow returns the tokens directly.
 */
async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw new Error(error.message);
    return;
  }

  const { access_token, refresh_token } = params;
  if (!access_token) throw new Error("Sign-in did not return a session");

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw new Error(error.message);
}

/**
 * Social sign-in via an in-app browser tab.
 *
 * `detectSessionInUrl` is off on mobile (there is no URL bar), so the redirect
 * is captured from the browser result and exchanged by hand. The auth store's
 * onAuthStateChange listener picks it up from there. Works for any Supabase
 * OAuth provider on iOS, Android and web — no native module required.
 */
async function signInWithProvider(
  provider: "google" | "apple",
  label: string,
): Promise<void> {
  const redirectUri = getOauthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUri,
      // Open the URL ourselves rather than letting supabase-js navigate.
      skipBrowserRedirect: true,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.url) throw new Error(`Could not start ${label} sign-in`);

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  // "cancel" / "dismiss" mean the user backed out — not an error worth showing.
  if (result.type !== "success") return;

  await createSessionFromUrl(result.url);
}

export function signInWithGoogle(): Promise<void> {
  return signInWithProvider("google", "Google");
}

export function signInWithApple(): Promise<void> {
  return signInWithProvider("apple", "Apple");
}
