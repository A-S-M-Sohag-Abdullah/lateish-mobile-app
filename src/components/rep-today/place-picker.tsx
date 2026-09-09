import * as Location from "expo-location";
import {
  MapPin,
  Navigation,
  Search,
  ShoppingBag,
  Store,
  Utensils,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

// ── Public type ─────────────────────────────────────────────────────────────
export interface PickedPlace {
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  place_id: string;
  osm_type: string;
  osm_class: string;
}

// ── Nominatim result (via the backend proxy) ────────────────────────────────
interface NomResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  name?: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
  };
}

const VENUE_TYPES: { label: string; icon: LucideIcon; amenity: string }[] = [
  { label: "All Venues", icon: MapPin, amenity: "" },
  { label: "Bars", icon: Wine, amenity: "bar" },
  { label: "Restaurants", icon: Utensils, amenity: "restaurant" },
  { label: "Retail", icon: ShoppingBag, amenity: "alcohol" },
  { label: "Stores", icon: Store, amenity: "convenience" },
];

const GEOCODE_URL = `${env.apiUrl}/geocode/search`;

function extractName(r: NomResult): string {
  return r.name ?? r.display_name.split(",")[0].trim();
}

function buildViewbox(lat: number, lon: number, deltaKm = 5): string {
  const delta = deltaKm / 111; // ~111 km per degree
  return `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
}

async function nominatimSearch(
  query: string,
  amenity: string,
  viewbox?: string,
): Promise<NomResult[]> {
  const isGps = !query.trim();
  const params = new URLSearchParams();
  if (viewbox) {
    params.set("viewbox", viewbox);
    params.set("bounded", "1");
  }
  if (isGps) {
    if (!amenity || !viewbox) return [];
    params.set("amenity", amenity);
  } else {
    params.set("q", amenity ? `${amenity} ${query}` : query);
  }
  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Geocode ${res.status}`);
  return res.json();
}

// The map runs in a WebView (native) / iframe (web) hosting the Google Maps
// JavaScript API — same engine as the Sales Map (src/components/sales-map/
// google-map.tsx), so it matches the rest of the app. Search results are pushed
// in via injected JS and marker taps are posted back out; the window-function +
// postMessage contract is unchanged from the old Leaflet version.
function buildMapHtml(apiKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body, #map { height:100%; margin:0; padding:0; background:#0B1220; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map, infoWindow, markers = {}, selectedId = null;

  function post(o){
    var s = JSON.stringify(o);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent) window.parent.postMessage(s, '*');
  }

  function pinIcon(active){
    var fill = active ? '#2563eb' : '#ef4444';
    var stroke = active ? '#1d4ed8' : '#b91c1c';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">'
      + '<path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"/>'
      + '<circle cx="12" cy="12" r="5" fill="white"/></svg>';
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(24, 32),
      anchor: new google.maps.Point(12, 32),
    };
  }

  window.setResults = function (list) {
    Object.keys(markers).forEach(function (k) { markers[k].setMap(null); });
    markers = {}; selectedId = null;
    if (infoWindow) infoWindow.close();
    if (!list || !list.length) return;
    var bounds = new google.maps.LatLngBounds();
    list.forEach(function (r) {
      var lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      bounds.extend({ lat: lat, lng: lon });
      var m = new google.maps.Marker({
        position: { lat: lat, lng: lon }, map: map, icon: pinIcon(false), title: r.name,
      });
      m.__name = r.name;
      m.addListener('click', function () { post({ type:'select', id:r.place_id }); });
      markers[r.place_id] = m;
    });
    map.fitBounds(bounds, 40);
    google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
      if (map.getZoom() > 15) map.setZoom(15);
    });
  };
  window.selectPlace = function (id, lat, lon) {
    if (selectedId != null && markers[selectedId]) markers[selectedId].setIcon(pinIcon(false));
    selectedId = id;
    var m = markers[id];
    if (m) {
      m.setIcon(pinIcon(true));
      if (!infoWindow) infoWindow = new google.maps.InfoWindow();
      infoWindow.setContent(
        '<div style="font-family:system-ui,sans-serif;font-size:12px;color:#111827;padding:2px 4px">' + (m.__name || '') + '</div>'
      );
      infoWindow.open({ map: map, anchor: m });
      map.panTo({ lat: lat, lng: lon });
      map.setZoom(16);
    }
  };
  window.setCenter = function (lat, lon, z) {
    map.setCenter({ lat: lat, lng: lon });
    map.setZoom(z || 14);
  };

  window.initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 51.5, lng: -0.1 },
      zoom: 12,
      disableDefaultUI: true,
      clickableIcons: false,
    });
    post({ type: 'ready' });
  };
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=initMap" async defer></script>
</body>
</html>`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: PickedPlace) => void;
}

export function PlacePicker({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isWeb = Platform.OS === "web";
  const webRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<NomResult[] | null>(null);
  const gpsCenterRef = useRef<{ lat: number; lon: number } | null>(null);

  const mapHtml = useMemo(() => buildMapHtml(env.googleMapsApiKey), []);

  const [query, setQuery] = useState("");
  const [amenity, setAmenity] = useState("");
  const [results, setResults] = useState<NomResult[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => results.find((r) => r.place_id === selectedId) ?? null,
    [results, selectedId],
  );

  // Call a global function inside the map — injected JS on native, a direct
  // contentWindow call through the (same-origin, srcDoc) iframe on web.
  const call = useCallback((fn: string, ...args: unknown[]) => {
    if (Platform.OS === "web") {
      const win = iframeRef.current?.contentWindow as
        (Window & Record<string, (...a: unknown[]) => void>) | null | undefined;
      if (win && typeof win[fn] === "function") win[fn](...args);
      return;
    }
    const serialized = args.map((a) => JSON.stringify(a)).join(", ");
    webRef.current?.injectJavaScript(
      `window.${fn} && window.${fn}(${serialized}); true;`,
    );
  }, []);

  // Push results into the map (or stash until the map says it's ready).
  const plot = useCallback(
    (list: NomResult[]) => {
      const payload = list.map((r) => ({
        place_id: r.place_id,
        lat: r.lat,
        lon: r.lon,
        name: extractName(r),
      }));
      if (readyRef.current) {
        call("setResults", payload);
      } else {
        pendingRef.current = list;
      }
    },
    [call],
  );

  const runSearch = useCallback(
    async (q: string, amen: string, viewbox?: string) => {
      setLoading(true);
      setError(null);
      setSelectedId(null);
      try {
        const data = await nominatimSearch(q, amen, viewbox);
        if (data.length === 0)
          setError("No venues found. Try a different location or type.");
        setResults(data);
        plot(data);
      } catch {
        setError("Search failed — check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [plot],
  );

  async function handleSearch() {
    const q = query.trim();
    if (!q) {
      setError('Enter a location to search (e.g. "Shoreditch, London")');
      return;
    }
    await runSearch(q, amenity);
  }

  async function handleLocateMe() {
    setLocating(true);
    setError(null);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted")
        perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setError("Location access denied. Allow location or type a city.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lon } = pos.coords;
      gpsCenterRef.current = { lat, lon };
      call("setCenter", lat, lon, 14);
      await runSearch("", amenity, buildViewbox(lat, lon, 5));
    } catch {
      setError("Couldn't get your location.");
    } finally {
      setLocating(false);
    }
  }

  async function handleTypeChange(amen: string) {
    setAmenity(amen);
    const q = query.trim();
    if (gpsCenterRef.current) {
      const { lat, lon } = gpsCenterRef.current;
      await runSearch("", amen, buildViewbox(lat, lon, 5));
    } else if (q) {
      await runSearch(q, amen);
    }
  }

  function selectRow(r: NomResult) {
    setSelectedId(r.place_id);
    call("selectPlace", r.place_id, parseFloat(r.lat), parseFloat(r.lon));
  }

  // Shared handler for messages the map posts out (native WebView + web iframe).
  const handleMessage = useCallback(
    (raw: string) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === "ready") {
          readyRef.current = true;
          if (pendingRef.current) {
            plot(pendingRef.current);
            pendingRef.current = null;
          }
        } else if (msg.type === "select") {
          const r = results.find((x) => x.place_id === msg.id);
          if (r) selectRow(r);
        }
      } catch {
        // ignore malformed messages
      }
    },
    // selectRow/plot are stable enough; results is what we read on "select"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results, plot],
  );

  const onMessage = (e: WebViewMessageEvent) =>
    handleMessage(e.nativeEvent.data);

  // Web: the iframe posts via window.parent.postMessage — listen for it.
  useEffect(() => {
    if (!isWeb || !visible) return;
    const listener = (e: MessageEvent) => {
      if (typeof e.data === "string") handleMessage(e.data);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [isWeb, visible, handleMessage]);

  function handleConfirm() {
    if (!selected) return;
    const a = selected.address;
    onSelect({
      name: extractName(selected),
      address: [a.house_number, a.road].filter(Boolean).join(" "),
      city: a.city ?? a.town ?? a.village ?? "",
      state: a.state ?? a.county ?? "",
      latitude: parseFloat(selected.lat),
      longitude: parseFloat(selected.lon),
      place_id: String(selected.place_id),
      osm_type: selected.type,
      osm_class: selected.class,
    });
    reset();
    onClose();
  }

  function reset() {
    setQuery("");
    setAmenity("");
    setResults([]);
    setSelectedId(null);
    setError(null);
    setLoading(false);
    setLocating(false);
    gpsCenterRef.current = null;
    pendingRef.current = null;
    // The WebView unmounts with the Modal, so require a fresh "ready" next open.
    readyRef.current = false;
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <View className="flex-row items-center gap-2">
            <MapPin color={colors.primary} size={18} />
            <Text className="text-base font-semibold">Find Venue on Map</Text>
          </View>
          <Pressable onPress={close} hitSlop={8} className="active:opacity-70">
            <X color={colors.mutedForeground} size={20} />
          </Pressable>
        </View>

        {/* Search controls */}
        <View className="gap-2 border-b border-border px-4 py-3">
          <View className="flex-row gap-2">
            <View className="h-11 flex-1 flex-row items-center gap-2 rounded-lg border border-input bg-input/30 px-3">
              <Search color={colors.mutedForeground} size={18} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                placeholder="City or area, e.g. Shoreditch, London"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 text-base text-foreground"
              />
            </View>
            <Pressable
              onPress={handleSearch}
              disabled={loading || locating}
              className="h-11 flex-row items-center gap-1.5 rounded-lg bg-primary px-3 active:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <Search color={colors.primaryForeground} size={18} />
              )}
              <Text className="text-sm font-semibold text-primary-foreground">
                Search
              </Text>
            </Pressable>
            <Pressable
              onPress={handleLocateMe}
              disabled={loading || locating}
              accessibilityLabel="Use my location"
              className="h-11 w-11 items-center justify-center rounded-lg border border-input bg-input/30 active:opacity-70 disabled:opacity-50"
            >
              {locating ? (
                <ActivityIndicator color={colors.foreground} size="small" />
              ) : (
                <Navigation color={colors.foreground} size={18} />
              )}
            </Pressable>
          </View>

          {/* Venue type pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {VENUE_TYPES.map((vt) => {
              const active = amenity === vt.amenity;
              const Icon = vt.icon;
              return (
                <Pressable
                  key={vt.label}
                  onPress={() => handleTypeChange(vt.amenity)}
                  className={cn(
                    "flex-row items-center gap-1 rounded-full border px-2.5 py-1",
                    active
                      ? "border-primary bg-primary"
                      : "border-input bg-transparent",
                  )}
                >
                  <Icon
                    color={
                      active ? colors.primaryForeground : colors.mutedForeground
                    }
                    size={13}
                  />
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {vt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Map — WebView on native, iframe on web (react-native-webview has no
            web build). Both host the same Google Maps HTML. */}
        <View className="flex-1">
          {isWeb ? (
            <iframe
              ref={iframeRef}
              srcDoc={mapHtml}
              title="Find venue on map"
              style={{ border: 0, width: "100%", height: "100%" }}
            />
          ) : (
            <WebView
              ref={webRef}
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              onMessage={onMessage}
              style={{ flex: 1, backgroundColor: "#0B1220" }}
              javaScriptEnabled
              domStorageEnabled
            />
          )}
        </View>

        {/* Error */}
        {error ? (
          <View className="border-t border-border bg-destructive/10 px-4 py-2">
            <Text className="text-xs text-destructive">{error}</Text>
          </View>
        ) : null}

        {/* Results list */}
        {results.length > 0 ? (
          <View className="border-t border-border" style={{ maxHeight: 180 }}>
            <Text className="px-4 pb-1 pt-2 text-[11px] text-muted-foreground">
              {results.length} venues — tap a marker or row to select
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {results.map((r) => {
                const active = r.place_id === selectedId;
                const sub = [r.type, r.address.road]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <Pressable
                    key={r.place_id}
                    onPress={() => selectRow(r)}
                    className={cn(
                      "border-b border-border/50 px-4 py-2.5 active:opacity-80",
                      active && "border-l-2 border-l-primary bg-primary/10",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-medium",
                        active && "text-primary",
                      )}
                      numberOfLines={1}
                    >
                      {extractName(r)}
                    </Text>
                    {sub ? (
                      <Text
                        className="mt-0.5 text-[11px] capitalize text-muted-foreground"
                        numberOfLines={1}
                      >
                        {sub}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Confirm */}
        <View
          className="border-t border-border px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {selected ? (
            <Text
              className="mb-2 text-xs text-muted-foreground"
              numberOfLines={1}
            >
              Selected:{" "}
              <Text className="font-medium text-foreground">
                {extractName(selected)}
              </Text>
            </Text>
          ) : null}
          <Pressable
            onPress={handleConfirm}
            disabled={!selected}
            className="h-12 items-center justify-center rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {selected ? "Use This Venue" : "Select a venue"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
