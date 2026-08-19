import { Sparkles } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useNitaStore } from "@/store/nita.store";

/**
 * Floating NITA AI button. Hosted globally (see the tabs layout) so it sits on
 * every signed-in screen; tapping opens the NITA chat panel. Positioned above
 * the bottom tab bar via the safe-area inset.
 */
export function NitaButton() {
  const insets = useSafeAreaInsets();
  const setOpen = useNitaStore((s) => s.setOpen);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open NITA AI"
      onPress={() => setOpen(true)}
      className="absolute right-4 h-[46px] flex-row items-center gap-2 rounded-full bg-white px-5 active:opacity-90"
      style={{
        bottom: insets.bottom + 76,
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
