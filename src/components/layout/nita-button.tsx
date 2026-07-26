import { Sparkles } from "lucide-react-native";
import { Pressable } from "react-native";

import { Text } from "@/components/ui/text";

/**
 * Floating NITA AI button. Sits above the tab bar on every signed-in screen,
 * which is why screen content carries extra bottom padding — see Screen.
 */
export function NitaButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open NITA AI"
      onPress={onPress}
      className="absolute bottom-4 right-4 h-[46px] flex-row items-center gap-2 rounded-full bg-white px-5 active:opacity-90"
      style={{
        // boxShadow is the cross-platform prop (iOS shadow + Android elevation)
        // and replaces the deprecated shadow* props. Can't be a Tailwind class.
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Sparkles color="#000000" size={20} fill="#000000" />
      <Text className="text-lg font-bold text-black">NITA AI</Text>
    </Pressable>
  );
}
