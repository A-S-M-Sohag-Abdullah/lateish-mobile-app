import { useRouter } from "expo-router";
import { Bell, Menu, Search, Settings } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { useNotificationsStore } from "@/store/notifications.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { useTabsStore } from "@/store/tabs.store";

/**
 * The app's single top bar: menu, search, notifications, settings. Used on every
 * screen so the header is identical throughout.
 *
 * Search and the menu are inert in the UI preview; the gear opens Settings.
 */
export function DashboardHeader() {
  const router = useRouter();
  const colors = useThemeColors();
  const openSidebar = useSidebarStore((s) => s.setOpen);
  const openNotifications = useNotificationsStore((s) => s.setOpen);
  const setPage = useTabsStore((s) => s.setPage);

  function openSettings() {
    setPage(4);
    router.navigate("/");
  }

  return (
    <View className="flex-row items-center gap-3 px-4 py-2">
      <IconButton label="Open menu" onPress={() => openSidebar(true)}>
        <Menu color={colors.foreground} size={26} />
      </IconButton>

      <View className="h-12 flex-1 flex-row items-center gap-2.5 rounded-2xl bg-muted px-4">
        {/* shrink-0 keeps the icon at full size when the row gets tight. */}
        <View className="shrink-0">
          <Search color={colors.mutedForeground} size={20} />
        </View>
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-base text-foreground"
        />
      </View>

      <IconButton label="Notifications" onPress={() => openNotifications(true)}>
        <Bell color={colors.foreground} size={24} />
        <View className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-red-500" />
      </IconButton>

      <IconButton label="Settings" onPress={openSettings}>
        <Settings color={colors.foreground} size={24} />
      </IconButton>
    </View>
  );
}

function IconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-muted"
    >
      {children}
    </Pressable>
  );
}
