import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { env } from "@/lib/env";

export interface PlaceSelection {
  name: string;
  city: string;
  region: string;
  /** Full formatted address, e.g. "24 Old St, London EC1V 9AB, UK" */
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
  /** Google place types, e.g. ["bar", "point_of_interest", ...] */
  types: string[];
}

interface Prediction {
  place_id: string;
  description: string;
}

interface GoogleAddressComponent {
  long_name: string;
  types: string[];
}

interface GooglePlaceDetails {
  name?: string;
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  geometry?: { location?: { lat: number; lng: number } };
  place_id?: string;
  types?: string[];
}

// Called directly from the app (no backend proxy) — the key is a plain
// EXPO_PUBLIC_* value, same tolerance as the web app's NEXT_PUBLIC_ key
// (publicly visible in that bundle too). Note: on the Expo *web* target this
// fetch is subject to normal browser CORS, and Google's Places REST endpoints
// don't allow cross-origin browser calls — predictions there come back empty
// and the user falls back to typing manually / "pick from map". Native
// (iOS/Android) fetch has no such restriction and works normally.
const PLACES_URL = "https://maps.googleapis.com/maps/api/place";

function newSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onPlaceSelect: (place: PlaceSelection) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Venue-name autocomplete, calling Google's Places API directly with
 * EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Mirrors the web app's GooglePlacesInput,
 * which binds Google's browser Autocomplete widget directly to an <input> —
 * there's no DOM here, so this fetches predictions itself and renders them as
 * an inline list, same pattern as SelectField's expand-in-place dropdown.
 */
export function GooglePlacesInput({
  value,
  onChangeText,
  onPlaceSelect,
  placeholder,
  className,
}: Props) {
  const colors = useThemeColors();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const sessionTokenRef = useRef(newSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    if (query.length < 2 || !env.googleMapsApiKey) {
      setPredictions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const params = new URLSearchParams({
          input: query,
          types: "establishment",
          sessiontoken: sessionTokenRef.current,
          key: env.googleMapsApiKey,
        });
        const res = await fetch(`${PLACES_URL}/autocomplete/json?${params}`);
        const json = await res.json();
        if (requestId !== requestIdRef.current) return; // a newer keystroke won
        setPredictions(json.predictions ?? []);
      } catch {
        if (requestId === requestIdRef.current) setPredictions([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  async function selectPrediction(prediction: Prediction) {
    setPredictions([]);
    onChangeText(prediction.description.split(",")[0] ?? prediction.description);
    if (!env.googleMapsApiKey) return;
    try {
      const params = new URLSearchParams({
        place_id: prediction.place_id,
        fields: "name,formatted_address,address_components,geometry,place_id,types",
        sessiontoken: sessionTokenRef.current,
        key: env.googleMapsApiKey,
      });
      const res = await fetch(`${PLACES_URL}/details/json?${params}`);
      const json = await res.json();
      const place: GooglePlaceDetails | undefined = json.result;
      if (!place?.name) return;

      let city = "";
      let region = "";
      for (const comp of place.address_components ?? []) {
        if (comp.types.includes("locality")) city = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) region = comp.long_name;
      }

      onChangeText(place.name);
      onPlaceSelect({
        name: place.name,
        city,
        region,
        address: place.formatted_address ?? "",
        latitude: place.geometry?.location?.lat ?? null,
        longitude: place.geometry?.location?.lng ?? null,
        placeId: place.place_id ?? prediction.place_id,
        types: place.types ?? [],
      });
    } catch {
      // ignore — the user can still fill the rest of the form by hand
    } finally {
      // A fresh session token per completed search, matching Google's
      // billing guidance (one token spans one autocomplete → details flow).
      sessionTokenRef.current = newSessionToken();
    }
  }

  const showList = focused && (predictions.length > 0 || loading) && value.trim().length >= 2;

  return (
    <View className="gap-1">
      <View className="relative">
        <Input
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          autoCorrect={false}
          className={className ?? "h-12"}
        />
        {loading ? (
          <View className="absolute right-3 top-0 h-12 justify-center">
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          </View>
        ) : null}
      </View>

      {showList ? (
        <View className="overflow-hidden rounded-xl border border-border bg-popover">
          {predictions.map((p, i) => (
            <Pressable
              key={p.place_id}
              onPress={() => selectPrediction(p)}
              className={cnBorder(i)}
            >
              <Text className="text-sm" numberOfLines={2}>
                {p.description}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function cnBorder(i: number) {
  return i > 0
    ? "border-t border-border/50 px-4 py-3 active:bg-white/5"
    : "px-4 py-3 active:bg-white/5";
}
