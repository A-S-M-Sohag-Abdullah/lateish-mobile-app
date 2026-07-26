import {
  Activity,
  ChevronDown,
  Compass,
  Ghost,
  Layers,
  Menu,
  Route,
  Search,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  LeafletMap,
  type LeafletMapHandle,
} from "@/components/sales-map/leaflet-map";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { CHANNEL_LEGEND, SALES_ACCOUNTS } from "@/lib/sales-map-data";
import { useSidebarStore } from "@/store/sidebar.store";

// The map's own dark chrome — fixed surfaces that sit over the light tiles, so
// they don't follow the app's light/dark theme.
const PANEL = "rgba(11, 18, 32, 0.92)";
const FAB_DARK = "rgba(17, 24, 34, 0.95)";

const FAB_ITEMS: { key: string; icon: LucideIcon; active?: boolean }[] = [
  { key: "Plan Route", icon: Route },
  { key: "Discover", icon: Compass },
  { key: "Layers", icon: Layers },
  { key: "Monitor", icon: Activity, active: true },
  { key: "Ghosts", icon: Ghost },
];

export default function SalesMapScreen() {
  const insets = useSafeAreaInsets();
  const openSidebar = useSidebarStore((s) => s.setOpen);
  const mapRef = useRef<LeafletMapHandle>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState("");
  const [legendOpen, setLegendOpen] = useState(true);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);

  const shownCount = useMemo(
    () => SALES_ACCOUNTS.filter((a) => !hidden.has(a.channel)).length,
    [hidden],
  );

  function toggleChannel(slug: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      mapRef.current?.setHidden([...next]);
      return next;
    });
  }

  function comingSoon(feature: string) {
    setToast(`${feature} — coming soon`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  return (
    <View className="flex-1 bg-[#0B1220]">
      <StatusBar style="dark" />

      {/* Full-bleed map (extends under the status bar, like the design). */}
      <LeafletMap ref={mapRef} accounts={SALES_ACCOUNTS} />

      {/* ── Top search bar ── */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute left-0 right-0 top-0 flex-row items-center gap-3 px-4"
        pointerEvents="box-none"
      >
        <Pressable
          accessibilityLabel="Open menu"
          onPress={() => openSidebar(true)}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: PANEL }}
        >
          <Menu color="#FFFFFF" size={22} />
        </Pressable>

        <View
          className="h-12 flex-1 flex-row items-center gap-2.5 rounded-2xl px-4"
          style={{ backgroundColor: PANEL }}
        >
          <View className="shrink-0">
            <Search color="rgba(255,255,255,0.6)" size={20} />
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search location, postcode..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            className="flex-1 text-base text-white"
          />
          <Pressable
            accessibilityLabel="Account"
            className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <User color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </View>

      {/* ── Right action stack ── */}
      <View
        style={{ top: insets.top + 80 }}
        className="absolute right-4 gap-3"
        pointerEvents="box-none"
      >
        {FAB_ITEMS.map(({ key, icon: Icon, active }) => (
          <Pressable
            key={key}
            accessibilityLabel={key}
            onPress={() => comingSoon(key)}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: active ? "#F3F4F6" : FAB_DARK }}
          >
            <Icon color={active ? "#111827" : "#FFFFFF"} size={22} />
          </Pressable>
        ))}
      </View>

      {/* ── Sales Channel legend sheet ── */}
      <View
        style={{ bottom: insets.bottom + 16, backgroundColor: PANEL }}
        className="absolute left-4 w-64 overflow-hidden rounded-2xl"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => setLegendOpen((v) => !v)}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <Text className="text-base font-semibold text-white">
            Sales Channel
          </Text>
          <ChevronDown
            color="rgba(255,255,255,0.7)"
            size={18}
            style={{ transform: [{ rotate: legendOpen ? "0deg" : "-90deg" }] }}
          />
        </Pressable>

        {legendOpen ? (
          <View className="px-4 pb-3">
            {CHANNEL_LEGEND.map((item) => {
              const off = hidden.has(item.slug);
              return (
                <Pressable
                  key={item.slug}
                  onPress={() => toggleChannel(item.slug)}
                  className={cn(
                    "flex-row items-center gap-3 py-1.5",
                    off && "opacity-40",
                  )}
                >
                  <View
                    className="h-3 w-3 rounded-full border border-white/60"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-sm text-white/90">{item.label}</Text>
                </Pressable>
              );
            })}

            <View className="mt-2 border-t border-white/10 pt-2">
              <Text className="text-xs uppercase tracking-wide text-white/50">
                {shownCount} accounts shown
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* ── Inline toast for stubbed actions ── */}
      {toast ? (
        <View
          style={{ bottom: insets.bottom + 24 }}
          className="absolute left-0 right-0 items-center"
          pointerEvents="none"
        >
          <View className="rounded-full bg-black/85 px-4 py-2">
            <Text className="text-sm text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
