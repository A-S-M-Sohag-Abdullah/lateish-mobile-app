import { usePathname, useRouter, type Href } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  CalendarDays,
  ChartColumn,
  ChevronRight,
  Clock,
  Gauge,
  House,
  Map,
  Package,
  Send,
  Settings,
  Sparkles,
  Target,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SPLASH_GRADIENT_DIRECTION,
  SPLASH_GRADIENT_FROM,
} from "@/lib/brand";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar.store";
import { useTabsStore } from "@/store/tabs.store";

const USE_NATIVE_DRIVER = Platform.OS !== "web";
const WIDTH_RATIO = 0.82;

const logo = require("../../../assets/logo.png");
const LOGO_ASPECT = 664 / 563;
const LOGO_WIDTH = 60;

interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Pager page index — jumps the swipeable pager to this page. */
  page?: number;
  /** A real route to push (e.g. /orders). */
  href?: Href;
  // An item with neither is inert in preview (no destination yet).
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: House, page: 0 },
  { label: "Market Targets", icon: Target, page: 1 },
  { label: "Rep Today", icon: CalendarDays, page: 2 },
  { label: "Sales Map", icon: Map, href: "/sales-map" },
  { label: "90-Day Plans / MDI", icon: Send, href: "/mdi" },
  { label: "Activity Logs", icon: Activity, href: "/activity-log" },
  { label: "BDM Efficiency", icon: Gauge, page: 3 },
  { label: "Order Fulfilment", icon: Package, href: "/orders" },
  { label: "SKU Performance", icon: ChartColumn, href: "/sku-performance" },
  { label: "Activity Hub", icon: Clock, href: "/activity-hub" },
  { label: "Settings", icon: Settings, page: 4 },
];

/** Left navigation drawer. Slides in from the left over the current screen. */
export function Sidebar() {
  const open = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);
  const { width } = useWindowDimensions();
  const panelWidth = Math.round(width * WIDTH_RATIO);
  const router = useRouter();
  const pathname = usePathname();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const page = useTabsStore((s) => s.page);
  const setPage = useTabsStore((s) => s.setPage);

  const translateX = useRef(new Animated.Value(-panelWidth)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  const [promoVisible, setPromoVisible] = useState(true);

  useEffect(() => {
    if (open) {
      setMounted(true);
      translateX.setValue(-panelWidth);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 260,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -panelWidth,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 220,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, panelWidth]);

  if (!mounted) return null;

  function go(item: NavItem) {
    setOpen(false);
    if (item.page != null) {
      // Drive the swipeable pager and make sure it's the visible screen
      // (a pushed route like /orders may be on top).
      setPage(item.page);
      router.navigate("/");
    } else if (item.href) {
      router.push(item.href);
    }
  }

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "#000000",
                opacity: backdrop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Close menu"
              onPress={() => setOpen(false)}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: panelWidth,
              transform: [{ translateX }],
            }}
            className="border-r border-border"
          >
            <LinearGradient
              colors={[...SPLASH_GRADIENT_FROM.colors]}
              locations={[...SPLASH_GRADIENT_FROM.locations]}
              start={SPLASH_GRADIENT_DIRECTION.start}
              end={SPLASH_GRADIENT_DIRECTION.end}
              style={StyleSheet.absoluteFill}
            />
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 24,
                paddingHorizontal: 16,
                gap: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Image
                  source={logo}
                  style={{
                    width: LOGO_WIDTH,
                    height: LOGO_WIDTH / LOGO_ASPECT,
                  }}
                  contentFit="contain"
                />

                {promoVisible ? (
                  <View className="gap-3 rounded-2xl border border-border bg-white/5 p-4">
                    <View className="flex-row gap-2">
                      <Sparkles
                        color={colors.accent}
                        fill={colors.accent}
                        size={20}
                      />
                      <Text className="flex-1 text-base text-muted-foreground">
                        You&apos;re currently seeing execution &amp; revenue
                        visibility.
                      </Text>
                      <Pressable
                        accessibilityLabel="Dismiss"
                        onPress={() => setPromoVisible(false)}
                      >
                        <X color={colors.mutedForeground} size={18} />
                      </Pressable>
                    </View>
                    <Text className="text-base text-muted-foreground">
                      Tier 2 unlocks market intelligence and performance
                      analytics.
                    </Text>
                    <Pressable className="flex-row items-center gap-1">
                      <Text
                        className="text-base font-bold"
                        style={{ color: colors.accent }}
                      >
                        Learn more
                      </Text>
                      <ChevronRight color={colors.accent} size={18} />
                    </Pressable>
                  </View>
                ) : null}

                <View className="gap-1">
                  {NAV_ITEMS.map((item) => (
                    <NavRow
                      key={item.label}
                      item={item}
                      active={
                        item.page != null
                          ? pathname === "/" && page === item.page
                          : item.href != null && pathname === item.href
                      }
                      onPress={() => go(item)}
                    />
                  ))}
                </View>
            </ScrollView>
          </Animated.View>
        </View>
    </Modal>
  );
}

function NavRow({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const Icon = item.icon;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 rounded-xl px-4 py-3.5",
        active ? "bg-brand-maroon" : "active:bg-muted",
      )}
    >
      <Icon color={active ? "#FFFFFF" : colors.foreground} size={22} />
      <Text
        className={cn(
          "text-lg font-medium",
          active ? "text-white" : "text-foreground",
        )}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}
