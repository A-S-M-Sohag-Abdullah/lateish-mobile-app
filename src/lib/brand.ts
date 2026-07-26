/**
 * Brand constants for the launch experience.
 *
 * The splash animates between the two gradients from the design mocks:
 *   from — linear-gradient(178.02deg, #122041 1.67%, #090E1A 72.13%)
 *   to   — linear-gradient(183.23deg, #7C1D1E 2.67%, #060A13 55.86%)
 *
 * CSS gradient angles are measured clockwise from "up", so 180deg is straight
 * down; expo-linear-gradient uses start/end points in unit space instead. Both
 * angles sit within 3.5deg of vertical — a lean too slight to see on a phone —
 * so each is expressed as a plain vertical sweep.
 */
export interface SplashGradient {
  colors: readonly [string, string];
  locations: readonly [number, number];
}

export const SPLASH_GRADIENT_FROM: SplashGradient = {
  colors: ["#122041", "#090E1A"],
  locations: [0.0167, 0.7213],
};

export const SPLASH_GRADIENT_TO: SplashGradient = {
  colors: ["#7C1D1E", "#060A13"],
  locations: [0.0267, 0.5586],
};

export const SPLASH_GRADIENT_DIRECTION = {
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

/**
 * Solid colour for the *native* splash screen, which cannot render a gradient.
 *
 * This is SPLASH_GRADIENT_FROM sampled at the vertical midpoint — where the
 * logo sits — so the handover from the native splash to the JS one is
 * invisible. It matches the start of the animation, not the end.
 */
export const SPLASH_SOLID = "#0C1426";

export const SPLASH_TIMING = {
  /** Navy is held briefly so it reads as continuous with the native splash. */
  holdMs: 250,
  /** Cross-fade from the navy gradient to the maroon one. */
  transitionMs: 900,
  /** Fade of the whole splash once the app is ready behind it. */
  fadeOutMs: 350,
};

/**
 * Background for the signed-out (auth) screens.
 *
 * Reuses the splash's opening gradient so launching straight into sign-in
 * reads as one continuous surface.
 */
export const AUTH_GRADIENT: SplashGradient = SPLASH_GRADIENT_FROM;

/** Logo width in points. The mock draws it at 67pt on a 393pt-wide screen. */
export const SPLASH_LOGO_WIDTH = 68;

/** Intrinsic aspect ratio of assets/logo.png (664 × 563). */
export const LOGO_ASPECT_RATIO = 664 / 563;
