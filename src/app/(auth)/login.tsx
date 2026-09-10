import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

import { AuthLayout, type AuthTab } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

const SLIDE_MS = 260;

/**
 * The signed-out screen. Sign In and Sign Up live here as two panels that the
 * segmented control slides between in place — the gradient and the control stay
 * fixed, so it reads as a real toggle rather than a page navigation.
 *
 * `/register` redirects here with `?mode=signup` so old links still work.
 */
export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthTab>(
    params.mode === "signup" ? "signup" : "signin",
  );

  // Sign In is the left tab, Sign Up the right one: going to Sign Up travels
  // forward (new panel enters from the right), going back travels the other way.
  const forward = useRef(true);
  // Don't animate the panel that's on screen when the route first opens — only
  // the switches the user triggers.
  const [animate, setAnimate] = useState(false);

  const changeMode = (next: AuthTab) => {
    if (next === mode) return;
    forward.current = next === "signup";
    setAnimate(true);
    setMode(next);
  };

  return (
    <AuthLayout mode={mode} onModeChange={changeMode}>
      <Animated.View
        key={mode}
        entering={
          animate
            ? (forward.current ? SlideInRight : SlideInLeft).duration(SLIDE_MS)
            : undefined
        }
        exiting={
          animate
            ? (forward.current ? SlideOutLeft : SlideOutRight).duration(SLIDE_MS)
            : undefined
        }
      >
        {mode === "signin" ? <SignInForm /> : <SignUpForm />}
      </Animated.View>
    </AuthLayout>
  );
}
