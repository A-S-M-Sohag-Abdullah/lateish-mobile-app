/**
 * Runtime environment.
 *
 * Expo inlines any `EXPO_PUBLIC_*` variable from .env at bundle time, so these
 * are read as literal `process.env.EXPO_PUBLIC_X` lookups — destructuring
 * `process.env` or building the key dynamically would break the transform.
 *
 * Nothing here throws. A missing variable at module scope would crash the app
 * before any UI exists, which surfaces as an unreadable "Something went wrong"
 * screen; instead the problem is logged and `isConfigured` reports it.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const missing: string[] = [];
if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");

if (missing.length > 0) {
  console.error(
    `[env] Missing ${missing.join(", ")}. Copy .env.example to .env, fill it ` +
      `in, then restart with \`npx expo start --clear\`. Anything that talks ` +
      `to Supabase will fail until then.`,
  );
}

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  supabaseUrl,
  supabaseAnonKey,
  /** False when the Supabase variables are absent — auth cannot work. */
  isConfigured: missing.length === 0,
};
