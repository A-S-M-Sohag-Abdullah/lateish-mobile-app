import { ActivityIndicator, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** The Apple logo, per Apple's "Sign in with Apple" branding guidelines. */
function AppleMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#000000"
        d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1 8 .67.96 1.46 2.04 2.5 2 1-.04 1.38-.65 2.59-.65 1.2 0 1.55.65 2.61.63 1.08-.02 1.76-.98 2.42-1.95.76-1.11 1.07-2.19 1.09-2.25-.02-.01-2.09-.8-2.11-3.18M15.1 6.44c.55-.67.92-1.6.82-2.53-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.54-.84 2.44.88.07 1.79-.44 2.34-1.1"
      />
    </Svg>
  );
}

interface AppleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Icon-only, half-width variant (used side-by-side on the sign-up screen). */
  iconOnly?: boolean;
}

export function AppleButton({
  onPress,
  loading,
  disabled,
  iconOnly,
}: AppleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Apple"
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        "h-[52px] flex-row items-center justify-center gap-3 rounded-lg bg-white active:bg-white/90 disabled:opacity-60",
        iconOnly && "flex-1",
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#1F1F1F" />
      ) : (
        <>
          <AppleMark />
          {iconOnly ? null : (
            <Text className="text-base font-medium text-[#1F1F1F]">
              Continue with Apple
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}
