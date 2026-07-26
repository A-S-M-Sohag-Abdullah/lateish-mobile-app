import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

import {
  LOGO_ASPECT_RATIO,
  SPLASH_GRADIENT_DIRECTION,
  SPLASH_GRADIENT_FROM,
  SPLASH_GRADIENT_TO,
  SPLASH_LOGO_WIDTH,
  SPLASH_TIMING,
  type SplashGradient,
} from "@/lib/brand";

const logo = require("../../../assets/logo.png");

interface BrandSplashProps {
  /** While true the splash covers the app; flipping to false fades it out. */
  visible: boolean;
  /** Fired once the fade-out has finished, so the caller can unmount this. */
  onHidden: () => void;
}

/**
 * The animated gradient splash from the design mocks: navy fading into maroon
 * behind the LATE(ish) logo.
 *
 * The native splash screen (configured in app.json) can only show a solid
 * colour behind the logo, so it is set to the navy gradient's midpoint and this
 * component takes over on the first JS frame to supply the real gradients. The
 * logo is drawn at the same size and position in both, making the handover
 * invisible. As a bonus this also gives web a splash, which has no native one.
 *
 * The colour change is a cross-fade of two stacked gradients rather than an
 * interpolation of the colour stops: `colors` is an array prop that the native
 * gradient view cannot animate, whereas opacity can.
 *
 * This deliberately uses React Native's own Animated rather than Reanimated:
 * it is the very first thing that renders, so keeping it off the Reanimated /
 * worklets babel pipeline removes a whole class of startup failure for what is
 * only two opacity fades.
 */
// Web has no native animation module; the native driver is a no-op there and
// warns, so it is only enabled on iOS/Android.
const USE_NATIVE_DRIVER = Platform.OS !== "web";

export function BrandSplash({ visible, onHidden }: BrandSplashProps) {
  const maroon = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [colourShiftDone, setColourShiftDone] = useState(false);

  // Drop the native splash as soon as this has painted, never before — hiding
  // it earlier would flash the app background between the two.
  const handleLayout = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    Animated.timing(maroon, {
      toValue: 1,
      delay: SPLASH_TIMING.holdMs,
      duration: SPLASH_TIMING.transitionMs,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) setColourShiftDone(true);
    });
  }, [maroon]);

  // Hold the splash until the colour shift has played out, even when the app
  // was ready sooner — otherwise a warm start cuts the animation off mid-way.
  useEffect(() => {
    if (visible || !colourShiftDone) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: SPLASH_TIMING.fadeOutMs,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) onHidden();
    });
  }, [visible, colourShiftDone, opacity, onHidden]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { opacity, pointerEvents: visible ? "auto" : "none" },
      ]}
      onLayout={handleLayout}
    >
      <Gradient gradient={SPLASH_GRADIENT_FROM} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: maroon }]}>
        <Gradient gradient={SPLASH_GRADIENT_TO} />
      </Animated.View>

      <View style={styles.center}>
        <Image
          source={logo}
          style={styles.logo}
          contentFit="contain"
          // The splash must be on screen from the first frame, so no fade-in.
          transition={0}
        />
      </View>
    </Animated.View>
  );
}

function Gradient({ gradient }: { gradient: SplashGradient }) {
  return (
    <LinearGradient
      colors={[...gradient.colors]}
      locations={[...gradient.locations]}
      start={SPLASH_GRADIENT_DIRECTION.start}
      end={SPLASH_GRADIENT_DIRECTION.end}
      style={StyleSheet.absoluteFill}
    />
  );
}

// Not Tailwind classes: these are absolute-fill and exact pixel values that
// have to match the native splash configuration, not themeable utilities.
const styles = StyleSheet.create({
  root: {
    // Covers the app while it mounts underneath.
    zIndex: 10,
  },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: SPLASH_LOGO_WIDTH,
    height: SPLASH_LOGO_WIDTH / LOGO_ASPECT_RATIO,
  },
});
