import * as Location from "expo-location";
import {
  Activity,
  ChevronDown,
  Circle,
  Compass,
  Crosshair,
  Flame,
  Ghost,
  Info,
  Layers,
  LocateFixed,
  Lock,
  Menu,
  Plus,
  Route,
  Search,
  Sparkles,
  Swords,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useQuery } from "@tanstack/react-query";

import { AccountForm } from "@/components/accounts/account-form";
import {
  GoogleSalesMap,
  type GoogleSalesMapHandle,
} from "@/components/sales-map/google-map";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import {
  CHANNEL_LEGEND,
  LAYER_META,
  type MapLayer,
  type SalesAccount,
} from "@/lib/sales-map-data";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar.store";

interface ApiAccount {
  id: string;
  name: string;
  channel: string | null;
  account_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  place_id: string | null;
}

interface ApiActiveBrand {
  id: string;
  name: string;
}

// The three Sales Map layers from the spec (mirrors sales-map-inner.tsx).
//
// Layer 1 (existing) is every account regardless of source or brand.
// Layers 2/3 only apply to `source: "auto_populate"` accounts and only once a
// brand is selected — "visited"/"won" are inherently per-brand questions:
//   - won (verified win)   → Layer 1 (it's a real listing now)
//   - visited but not won  → Layer 3 (Visited, Not Converted)
//   - neither              → Layer 2 (Target Accounts)
function accountLayer(
  source: string | null,
  hasBrand: boolean,
  isVerifiedWin: boolean,
  isVisited: boolean,
): MapLayer {
  if (source !== "auto_populate" || !hasBrand) return "existing";
  if (isVerifiedWin) return "existing";
  if (isVisited) return "visited";
  return "target";
}

const LAYER_2_3: {
  id: Exclude<MapLayer, "existing">;
  label: string;
  description: string;
}[] = [
  {
    id: "target",
    label: "Target Accounts",
    description: "On your list, not yet visited",
  },
  {
    id: "visited",
    label: "Visited, Not Converted",
    description: "BDM has tried, no win yet",
  },
];

interface RouteItem {
  id: string;
  account_id: string | null;
  account_name: string | null;
  due_date: string;
}

// The map's own dark chrome — fixed surfaces that sit over the light tiles, so
// they don't follow the app's light/dark theme.
const PANEL = "rgba(11, 18, 32, 0.92)";
const FAB_DARK = "rgba(17, 24, 34, 0.95)";

// "Views" — every not-yet-built map layer, grouped under one button (mirrors
// the web's locked-features dropdown).
const LOCKED_VIEWS: { key: string; icon: LucideIcon; label: string }[] = [
  { key: "whitespace", icon: Sparkles, label: "Whitespace" },
  { key: "competitors", icon: Swords, label: "Competitors" },
  { key: "what-if", icon: Crosshair, label: "What-If" },
  { key: "discover", icon: Compass, label: "Discover" },
  { key: "opportunities", icon: Flame, label: "Opportunities" },
  { key: "monitor", icon: Activity, label: "Monitor" },
  { key: "lapsed-accounts", icon: Ghost, label: "Lapsed Accounts" },
];

export default function SalesMapScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const openSidebar = useSidebarStore((s) => s.setOpen);
  const mapRef = useRef<GoogleSalesMapHandle>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const [search, setSearch] = useState("");
  const [legendOpen, setLegendOpen] = useState(true);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [layerVisibility, setLayerVisibility] = useState<
    Record<MapLayer, boolean>
  >({
    existing: true,
    target: true,
    visited: true,
  });
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [routeShowing, setRouteShowing] = useState(false);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const {
    data: accountRows,
    isLoading,
    isError,
  } = useQuery({
    // Distinct key — this returns a flat array, whereas ["accounts", orgId]
    // elsewhere (rep-today) holds the paginated { data, pagination } shape;
    // sharing the key makes whichever loads first hand the other the wrong
    // shape. A prefix invalidate of ["accounts", orgId] still refetches this.
    queryKey: ["accounts", orgId, "all"],
    // listAll (not one page) — clustering handles "too many pins"; a page of
    // 20/500 silently drops the rest of the account list off the map.
    queryFn: () => api.getAll<ApiAccount>(`/organizations/${orgId}/accounts`),
    enabled: !!orgId,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands-active", orgId],
    queryFn: () =>
      api.get<ApiActiveBrand[]>(`/organizations/${orgId}/brands/active`),
    enabled: !!orgId,
  });

  const hasBrand = !!selectedBrandId;

  // "Verified win" / "visited" are inherently per-brand (a venue can carry
  // Brand A but not Brand B) — only fetched once a brand is picked.
  const { data: verifiedWinIds } = useQuery({
    queryKey: ["verified-wins", orgId, selectedBrandId],
    queryFn: () =>
      api.get<string[]>(
        `/organizations/${orgId}/accounts/verified-wins?brand_id=${encodeURIComponent(selectedBrandId)}`,
      ),
    enabled: !!orgId && hasBrand,
  });
  const { data: visitedIds } = useQuery({
    queryKey: ["visited-accounts", orgId, selectedBrandId],
    queryFn: () =>
      api.get<string[]>(
        `/organizations/${orgId}/accounts/visited?brand_id=${encodeURIComponent(selectedBrandId)}`,
      ),
    enabled: !!orgId && hasBrand,
  });

  const verifiedWinSet = useMemo(
    () => new Set(verifiedWinIds ?? []),
    [verifiedWinIds],
  );
  const visitedSet = useMemo(() => new Set(visitedIds ?? []), [visitedIds]);

  const routeQuery = useQuery({
    queryKey: ["route", orgId],
    queryFn: () =>
      api.get<RouteItem[]>(`/organizations/${orgId}/log-interactions/route`),
    enabled: false,
  });

  // Only accounts with coordinates can be plotted. Each carries the layer it
  // falls in for the current brand selection + its verified-win flag.
  const accounts = useMemo<SalesAccount[]>(
    () =>
      (accountRows ?? [])
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => {
          const isWin = verifiedWinSet.has(a.id);
          return {
            id: a.id,
            name: a.name,
            channel: a.channel ?? "",
            accountType: a.account_type ?? "",
            city: [a.city, a.state].filter(Boolean).join(", "),
            address: a.address ?? "",
            lat: a.latitude as number,
            lng: a.longitude as number,
            layer: accountLayer(
              a.source,
              hasBrand,
              isWin,
              visitedSet.has(a.id),
            ),
            isVerifiedWin: isWin,
          };
        }),
    [accountRows, hasBrand, verifiedWinSet, visitedSet],
  );

  // Legend shows only channels that actually appear on the map.
  const legend = useMemo(
    () =>
      CHANNEL_LEGEND.filter((c) => accounts.some((a) => a.channel === c.slug)),
    [accounts],
  );

  // Per-layer totals for the Layers panel — independent of the search/channel
  // filters, same as the web's layerCounts.
  const layerCounts = useMemo(() => {
    const c: Record<MapLayer, number> = { existing: 0, target: 0, visited: 0 };
    for (const a of accounts) c[a.layer ?? "existing"]++;
    return c;
  }, [accounts]);

  // Mirrors the web's filteredAccounts — used for the "X of Y shown" footer.
  const shownCount = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      if (!layerVisibility[a.layer ?? "existing"]) return false;
      if (hidden.has(a.channel)) return false;
      return (
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
      );
    }).length;
  }, [accounts, hidden, search, layerVisibility]);

  const isFiltered =
    search !== "" ||
    hidden.size > 0 ||
    !layerVisibility.existing ||
    !layerVisibility.target ||
    !layerVisibility.visited;

  function hiddenLayerList(vis: Record<MapLayer, boolean>): MapLayer[] {
    return (Object.keys(vis) as MapLayer[]).filter((k) => !vis[k]);
  }

  function onSearch(v: string) {
    setSearch(v);
    mapRef.current?.setSearch(v);
  }

  function toggleChannel(slug: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      mapRef.current?.setHidden([...next]);
      return next;
    });
  }

  function toggleLayer(id: MapLayer) {
    setLayerVisibility((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      mapRef.current?.setHiddenLayers(hiddenLayerList(next));
      return next;
    });
  }

  // The map WebView fully reloads whenever the account list changes (new HTML —
  // e.g. switching brand re-tags every point's layer), which resets the in-map
  // channel/layer/search filters. Re-push them ~after the rebuild so those
  // don't silently reset.
  useEffect(() => {
    const t = setTimeout(() => {
      mapRef.current?.setHidden([...hidden]);
      mapRef.current?.setHiddenLayers(hiddenLayerList(layerVisibility));
      if (search) mapRef.current?.setSearch(search);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function comingSoon() {
    showToast("Coming soon — This feature is under development.");
  }

  function handleLockedViewTap(label: string) {
    showToast(`${label} — coming to Tier 2 later this year.`);
    setViewsOpen(false);
  }

  // Show the device's current position on the map with a "you are here" marker,
  // and keep it live — as the device moves, the marker follows in real time.
  // Tapping again stops tracking; only the first fix pans the map, so panning
  // to look at other markers isn't fought by every subsequent update.
  async function toggleTracking() {
    if (tracking) {
      watchSubscriptionRef.current?.remove();
      watchSubscriptionRef.current = null;
      setTracking(false);
      return;
    }
    if (locating) return;
    setLocating(true);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== "granted") {
        showToast("Location permission denied");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      lastLocationRef.current = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      mapRef.current?.setUserLocation(
        pos.coords.latitude,
        pos.coords.longitude,
        true,
      );

      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000,
          distanceInterval: 8,
        },
        (update) => {
          lastLocationRef.current = {
            lat: update.coords.latitude,
            lng: update.coords.longitude,
          };
          mapRef.current?.setUserLocation(
            update.coords.latitude,
            update.coords.longitude,
            false,
          );
        },
      );
      setTracking(true);
    } catch {
      showToast("Couldn't get your location");
    } finally {
      setLocating(false);
    }
  }

  // Stop the GPS watcher when the screen unmounts — don't keep tracking in
  // the background.
  useEffect(() => {
    return () => {
      watchSubscriptionRef.current?.remove();
    };
  }, []);

  // The map's WebView fully reloads whenever the account list changes (new
  // HTML, fresh page — see GoogleSalesMap), which wipes the "you are here"
  // overlay along with everything else. Re-apply the last known fix after a
  // reload so live tracking doesn't silently disappear mid-walk just because
  // an account was added/edited elsewhere.
  useEffect(() => {
    if (!tracking || !lastLocationRef.current) return;
    const t = setTimeout(() => {
      if (lastLocationRef.current) {
        mapRef.current?.setUserLocation(
          lastLocationRef.current.lat,
          lastLocationRef.current.lng,
          false,
        );
      }
    }, 800);
    return () => clearTimeout(t);
    // Only re-run when the account list itself changes (i.e. the map
    // rebuilds) — not when `tracking` toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  async function planRouteClick() {
    if (routeShowing) {
      mapRef.current?.clearRoute();
      setRouteShowing(false);
      return;
    }
    const result = await routeQuery.refetch();
    const items = result.data ?? [];
    const coords = items
      .map((item) => accounts.find((a) => a.id === item.account_id))
      .filter((a): a is SalesAccount => !!a)
      .map((a) => ({ lat: a.lat, lng: a.lng }));

    if (coords.length >= 2) {
      mapRef.current?.drawRoute(coords);
      setRouteShowing(true);
      showToast(`Route planned — ${coords.length} stops.`);
    } else {
      showToast(
        items.length === 0
          ? "No scheduled visits found. Log interactions with a due date to plan a route."
          : "Not enough accounts with map coordinates to draw a route.",
      );
      setRouteShowing(false);
    }
  }

  const dropdownOpen = layersOpen || viewsOpen || brandOpen;

  return (
    <View className="flex-1 bg-[#0B1220]">
      {/* Full-bleed map (extends under the status bar, like the design).
          Held until accounts resolve so it mounts once with real data. */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-white/60">Loading map…</Text>
        </View>
      ) : !env.googleMapsApiKey ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-white/60">
            Map cannot load — missing Google Maps API key.
          </Text>
        </View>
      ) : (
        <GoogleSalesMap
          ref={mapRef}
          accounts={accounts}
          apiKey={env.googleMapsApiKey}
        />
      )}

      {/* Backdrop to close an open dropdown on outside tap. */}
      {dropdownOpen ? (
        <Pressable
          className="absolute inset-0"
          onPress={() => {
            setLayersOpen(false);
            setViewsOpen(false);
            setBrandOpen(false);
          }}
        />
      ) : null}

      {/* ── Empty-state banner ── */}
      {!isLoading && !isError && accounts.length === 0 ? (
        <View
          style={{ top: insets.top + 132 }}
          className="absolute left-4 right-4 z-10 flex-row items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3"
          pointerEvents="none"
        >
          <Info color="#D97706" size={16} />
          <View className="flex-1">
            <Text className="text-sm font-medium text-amber-600">
              No accounts to show
            </Text>
            <Text className="text-xs text-amber-700">
              No accounts with coordinates found. Add accounts with location
              data to populate the map.
            </Text>
          </View>
        </View>
      ) : null}

      {/* ── Error banner ── */}
      {isError ? (
        <View
          style={{ top: insets.top + 132 }}
          className="absolute left-4 right-4 z-10 flex-row items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
          pointerEvents="none"
        >
          <Info color="#DC2626" size={16} />
          <View className="flex-1">
            <Text className="text-sm font-medium text-red-600">
              Couldn't load accounts
            </Text>
            <Text className="text-xs text-red-700">
              Something went wrong fetching account data. Pull to refresh or try
              again.
            </Text>
          </View>
        </View>
      ) : null}

      {/* ── Top toolbar ── */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute left-0 right-0 top-0 z-20 gap-2.5 px-4"
        pointerEvents="box-none"
      >
        <View className="flex-row items-center gap-3">
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
              onChangeText={onSearch}
              placeholder="Search existing accounts…"
              placeholderTextColor="rgba(255,255,255,0.6)"
              className="flex-1 text-base text-white"
            />
          </View>
        </View>

        {/* Action chips — Add Account / More, then Brand + Layers fixed at the
            row's end (matching the web's toolbar). Brand + Layers stay OUTSIDE
            the ScrollView deliberately — RN ScrollView clips overflow, which
            would cut off their dropdowns. */}
        <View className="flex-row items-center gap-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            className="flex-1"
          >
            <Pressable
              onPress={() => setAddAccountOpen(true)}
              className="h-10 flex-row items-center gap-1.5 rounded-lg bg-primary px-4 active:opacity-90"
            >
              <Plus color={colors.primaryForeground} size={16} />
              <Text className="text-sm font-semibold text-primary-foreground">
                Add Account
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="More"
              onPress={comingSoon}
              className="h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: PANEL }}
            >
              <Circle color="#FFFFFF" size={16} />
            </Pressable>
          </ScrollView>

          {/* Brand — scopes the per-brand "Verified Win" flag + Layers 2/3
              (a win/visit is inherently per-brand). Doesn't hide/show pins. */}
          <View>
            <Pressable
              accessibilityLabel="Select brand"
              onPress={() => {
                setBrandOpen((v) => !v);
                setLayersOpen(false);
                setViewsOpen(false);
              }}
              className={cn(
                "h-10 max-w-[132px] flex-row items-center gap-1.5 rounded-lg px-3",
                brandOpen && "border border-primary",
              )}
              style={{ backgroundColor: PANEL }}
            >
              <Text
                className="flex-shrink text-sm font-medium text-white"
                numberOfLines={1}
              >
                {brands.find((b) => b.id === selectedBrandId)?.name ??
                  "All Brands"}
              </Text>
              <ChevronDown color="#FFFFFF" size={14} />
            </Pressable>

            {brandOpen ? (
              <View
                className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-lg border border-white/10"
                style={{ backgroundColor: PANEL }}
              >
                <ScrollView style={{ maxHeight: 260 }}>
                  {[{ id: "", name: "All Brands" }, ...brands].map((b) => (
                    <Pressable
                      key={b.id || "all"}
                      onPress={() => {
                        setSelectedBrandId(b.id);
                        setBrandOpen(false);
                      }}
                      className={cn(
                        "px-3 py-2.5 active:bg-white/5",
                        b.id === selectedBrandId && "bg-white/5",
                      )}
                    >
                      <Text className="text-sm text-white" numberOfLines={1}>
                        {b.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          {/* Layers — toggle each Sales Map layer on/off. Layers 2/3 only hold
              accounts once a brand is selected (see accountLayer). */}
          <View>
            <Pressable
              accessibilityLabel="Layers"
              onPress={() => {
                setLayersOpen((v) => !v);
                setBrandOpen(false);
                setViewsOpen(false);
              }}
              className={cn(
                "h-10 w-10 items-center justify-center rounded-lg",
                layersOpen && "border border-primary",
              )}
              style={{ backgroundColor: PANEL }}
            >
              <Layers color="#FFFFFF" size={16} />
            </Pressable>

            {layersOpen ? (
              <View
                className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-lg border border-white/10"
                style={{ backgroundColor: PANEL }}
              >
                <Text className="border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/50">
                  Map Layers
                </Text>
                <Pressable
                  onPress={() => toggleLayer("existing")}
                  className={cn(
                    "flex-row items-center gap-2.5 px-3 py-2.5",
                    !layerVisibility.existing && "opacity-40",
                  )}
                >
                  <View
                    className="h-3 w-3 rounded-full border border-white/60"
                    style={{ backgroundColor: LAYER_META.existing.color }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-white">
                      Layer 1 — Existing Accounts
                    </Text>
                    <Text className="text-xs text-white/50">
                      Where you already are
                    </Text>
                  </View>
                  <Text className="text-xs text-white/50">
                    {layerCounts.existing}
                  </Text>
                </Pressable>
                {LAYER_2_3.map((layer, i) => (
                  <Pressable
                    key={layer.id}
                    onPress={() => hasBrand && toggleLayer(layer.id)}
                    disabled={!hasBrand}
                    className={cn(
                      "flex-row items-center gap-2.5 px-3 py-2.5",
                      (!layerVisibility[layer.id] || !hasBrand) && "opacity-40",
                    )}
                  >
                    <View
                      className="h-3 w-3 rounded-full border border-white/60"
                      style={{ backgroundColor: LAYER_META[layer.id].color }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-white">
                        Layer {i === 0 ? 2 : 3} — {layer.label}
                      </Text>
                      <Text className="text-xs text-white/50">
                        {hasBrand
                          ? layer.description
                          : "Select a brand to see this layer"}
                      </Text>
                    </View>
                    <Text className="text-xs text-white/50">
                      {hasBrand ? layerCounts[layer.id] : "—"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* ── Right Panel ── */}
      <View
        style={{ top: insets.top + 132 }}
        className="absolute right-4 z-20 gap-2.5"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={planRouteClick}
          disabled={routeQuery.isFetching}
          className="h-10 flex-row items-center gap-1.5 rounded-lg px-3.5 active:opacity-90"
          style={{ backgroundColor: routeShowing ? "#8B2226" : PANEL }}
        >
          {routeQuery.isFetching ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Route color="#FFFFFF" size={16} />
          )}
          <Text className="text-sm font-semibold text-white">
            {routeShowing ? "Route Active" : "Plan Route"}
          </Text>
        </Pressable>

        <View>
          <Pressable
            onPress={() => {
              setViewsOpen((v) => !v);
              setLayersOpen(false);
            }}
            className={cn(
              "h-10 flex-row items-center gap-1.5 rounded-lg px-3.5 active:opacity-90",
              viewsOpen && "border border-primary",
            )}
            style={{ backgroundColor: PANEL }}
          >
            <Layers color="#FFFFFF" size={16} />
            <Text className="text-sm font-semibold text-white">Views</Text>
            <ChevronDown
              color="#FFFFFF"
              size={14}
              style={{ transform: [{ rotate: viewsOpen ? "180deg" : "0deg" }] }}
            />
          </Pressable>

          {viewsOpen ? (
            <View
              className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-lg border border-white/10"
              style={{ backgroundColor: PANEL }}
            >
              <Text className="border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/50">
                More views — Tier 2
              </Text>
              {LOCKED_VIEWS.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleLockedViewTap(item.label)}
                  className="flex-row items-center gap-2.5 px-3 py-2.5 active:bg-white/5"
                >
                  <item.icon color="rgba(255,255,255,0.5)" size={16} />
                  <Text
                    className="flex-1 text-sm text-white/60"
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <Lock color="rgba(255,255,255,0.5)" size={12} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View className="my-1 h-px bg-white/10" />

        <Pressable
          accessibilityLabel="Zoom in"
          onPress={() => mapRef.current?.zoomIn()}
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: PANEL }}
        >
          <ZoomIn color="#FFFFFF" size={18} />
        </Pressable>
        <Pressable
          accessibilityLabel="Zoom out"
          onPress={() => mapRef.current?.zoomOut()}
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: PANEL }}
        >
          <ZoomOut color="#FFFFFF" size={18} />
        </Pressable>

        {/* Locate me — real GPS, drops the "you are here" marker and, once
            active, keeps tracking live as the device moves. Tap again to
            stop. */}
        <Pressable
          accessibilityLabel={
            tracking ? "Stop tracking my location" : "Show my location"
          }
          onPress={toggleTracking}
          disabled={locating}
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: tracking ? "#2563EB" : FAB_DARK }}
        >
          {locating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <LocateFixed color="#FFFFFF" size={18} />
          )}
        </Pressable>
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
            {legend.length > 0 ? (
              <ScrollView
                style={{ maxHeight: 240 }}
                showsVerticalScrollIndicator={false}
              >
                {legend.map((item) => {
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
                      <Text
                        className="flex-1 text-sm text-white/90"
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Text className="py-1 text-sm text-white/60">
                {isLoading ? "Loading accounts…" : "No mapped accounts yet."}
              </Text>
            )}

            <View className="mt-2 border-t border-white/10 pt-2">
              <Text className="text-xs uppercase tracking-wide text-white/50">
                {isLoading
                  ? "Loading accounts…"
                  : isError
                    ? "Failed to load accounts"
                    : isFiltered
                      ? `${shownCount} of ${accounts.length} accounts shown`
                      : `${accounts.length} accounts shown`}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* ── Add Account form ── */}
      <AccountForm
        visible={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        orgId={orgId}
      />

      {/* ── Inline toast ── */}
      {toast ? (
        <View
          style={{ bottom: insets.bottom + 24 }}
          className="absolute left-0 right-0 z-40 items-center"
          pointerEvents="none"
        >
          <View className="max-w-[90%] rounded-full bg-black/85 px-4 py-2">
            <Text className="text-center text-sm text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
