import { useRouter } from "expo-router";
import {
  CalendarDays,
  Gauge,
  House,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import { useTabsStore } from "@/store/tabs.store";

// Must mirror the pager's tab order (see components/layout/tabs-pager.tsx).
const ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: House, label: "Dashboard" },
  { icon: Target, label: "Targets" },
  { icon: CalendarDays, label: "Rep Today" },
  { icon: Gauge, label: "BDM" },
  { icon: Settings, label: "Settings" },
];

/**
 * Static bottom bar for full-screen pushed routes (MDI, etc.) so the tab bar
 * stays visible off the pager. Tapping returns to the pager at that page. The
 * pager itself keeps its own animated (swipe-tracking) bar.
 */
export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const setPage = useTabsStore((s) => s.setPage);

  function go(i: number) {
    setPage(i);
    router.navigate("/");
  }

  return (
    <View
      style={{
        paddingTop: 8,
        paddingBottom: insets.bottom,
        backgroundColor: colors.background,
      }}
      className="border-t border-border/60"
    >
      <View className="h-14 flex-row">
        {ITEMS.map(({ icon: Icon, label }, i) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            onPress={() => go(i)}
            className={cn("flex-1 items-center justify-center gap-1")}
          >
            <Icon color="#FFFFFF" size={22} />
            <Text className="text-xs font-medium text-white" numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
