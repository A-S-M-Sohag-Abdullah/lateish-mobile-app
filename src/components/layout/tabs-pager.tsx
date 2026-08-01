import {
  CalendarDays,
  Gauge,
  House,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BdmPage } from "@/components/tab-pages/bdm-page";
import { DashboardPage } from "@/components/tab-pages/dashboard-page";
import { MarketTargetsPage } from "@/components/tab-pages/market-targets-page";
import { ProfilePage } from "@/components/tab-pages/profile-page";
import { RepTodayPage } from "@/components/tab-pages/rep-today-page";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { usePagerLock } from "@/store/pager-lock.store";
import { useTabsStore } from "@/store/tabs.store";

const PILL_W = 74;
const PILL_H = 56;
const MAROON = "#8B2226"; // brand.maroon
const USE_NATIVE_DRIVER = Platform.OS !== "web";

const PAGES: {
  Component: ComponentType;
  icon: LucideIcon;
  label: string;
}[] = [
  { Component: DashboardPage, icon: House, label: "Dashboard" },
  { Component: MarketTargetsPage, icon: Target, label: "Targets" },
  { Component: RepTodayPage, icon: CalendarDays, label: "Rep Today" },
  { Component: BdmPage, icon: Gauge, label: "BDM" },
  { Component: ProfilePage, icon: Settings, label: "Settings" },
];

/**
 * Swipeable, drag-following tab shell. The top bar stays fixed; only the page
 * bodies live in a horizontal paging ScrollView, so dragging tracks the finger.
 * The bottom bar's maroon pill is tied to the live scroll offset so it slides
 * continuously with the pages. Pages mount lazily (current ± 1) so the heavy
 * screens don't all render up front.
 */
export function TabsPager() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const page = useTabsStore((s) => s.page);
  const setPage = useTabsStore((s) => s.setPage);
  // A nested horizontal scroller can freeze the pager's own swipe.
  const locked = usePagerLock((s) => s.locked);

  const scrollRef = useRef<ScrollView>(null);
  // Seed with the window height so pages render on the very first frame instead
  // of blanking until onLayout reports the real height (async on web → a visible
  // blink). onLayout corrects it below; the overshoot is clipped (see overflow-
  // hidden on the container) and content is top-aligned, so the fix is unseen.
  const [pagerH, setPagerH] = useState(height);
  // Mount the first two immediately, then bring the rest in one shot after the
  // first paint. Once every page is mounted this set never changes again, so
  // `pageViews` stays referentially stable and no heavy screen ever re-renders
  // on a swipe/tap — which is what keeps the pill and scroll smooth.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));
  const allMounted = mounted.size === PAGES.length;

  useEffect(() => {
    if (allMounted) return;
    const id = requestAnimationFrame(() =>
      setMounted(new Set(PAGES.map((_, i) => i))),
    );
    return () => cancelAnimationFrame(id);
  }, [allMounted]);

  // Live horizontal offset drives the sliding pill.
  const scrollX = useRef(new Animated.Value(page * width)).current;

  // Guards so the imperative scrollTo below never fights a finger-driven page
  // change: gesture updates set these before touching the store.
  const didInit = useRef(false);
  const lastPage = useRef(page);
  const lastWidth = useRef(width);
  const visibleIdx = useRef(page);
  // True only while the user is physically dragging. A programmatic scroll
  // (tab tap / sidebar) sets it false so the listener below stays out of the
  // way — otherwise its mid-flight setPage calls fight the animation and the
  // screen oscillates back and forth (only visible in release builds).
  const userDragging = useRef(false);

  // A JS listener on the scroll event (fires reliably on Android for slow drags,
  // unlike onMomentumScrollEnd) advances the active page as it crosses each
  // page boundary. Only acts during a real finger drag; programmatic scrolls
  // are finalised by onMomentumEnd instead.
  // Memoised so the mid-swipe page re-renders don't rebuild the native event
  // binding, which is what made the pill stutter.
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: USE_NATIVE_DRIVER,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (!userDragging.current || width <= 0) return;
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          if (idx < 0 || idx >= PAGES.length || idx === visibleIdx.current)
            return;
          visibleIdx.current = idx;
          lastPage.current = idx; // effect sees we're already here, skips scrollTo
          setPage(idx);
        },
      }),
    [scrollX, width, setPage],
  );

  useEffect(() => {
    if (width <= 0 || pagerH <= 0) return;

    const firstRun = !didInit.current;
    const pageChanged = page !== lastPage.current;
    const widthChanged = width !== lastWidth.current;

    if (firstRun || pageChanged || widthChanged) {
      didInit.current = true;
      lastPage.current = page;
      lastWidth.current = width;
      userDragging.current = false; // this scroll is programmatic
      // Animate only for a real (tab-tap / sidebar) jump; snap silently on the
      // first layout and on rotation so nothing visibly rubber-bands.
      const animated = !firstRun && !widthChanged;
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ x: page * width, animated }),
      );
    }
  }, [page, width, pagerH]);

  // Safety net: correct to the exact settled page after a fling (the listener
  // already handles the common case).
  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    visibleIdx.current = p;
    if (p !== page) {
      lastPage.current = p;
      setPage(p);
    }
  }

  // Tab tap: fire the (native-driven) scroll synchronously so it starts on the
  // press instead of waiting for React to commit the page-state change and its
  // re-render — that commit is what made taps feel laggy on Android.
  function goTo(i: number) {
    if (i === page) return;
    visibleIdx.current = i;
    lastPage.current = i; // effect will see we're already here and skip scrollTo
    userDragging.current = false; // this scroll is programmatic
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  }

  // Memoised for the same reason as onScroll: a stable interpolation node keeps
  // the native-driven pill smooth through the mid-swipe re-renders.
  const pillTranslate = useMemo(() => {
    const slot = width / PAGES.length;
    return scrollX.interpolate({
      inputRange: PAGES.map((_, i) => i * width),
      outputRange: PAGES.map((_, i) => i * slot + (slot - PILL_W) / 2),
      extrapolate: "clamp",
    });
  }, [scrollX, width]);

  // The pages take no props, so keep their elements stable across page changes.
  // Otherwise every tab tap re-renders all mounted screens on the JS thread and
  // stalls the scroll animation.
  const pageViews = useMemo(
    () =>
      PAGES.map(({ Component }, i) => (
        <View key={i} style={{ width, height: pagerH }}>
          {mounted.has(i) && pagerH > 0 ? <Component /> : null}
        </View>
      )),
    [mounted, pagerH, width],
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="bg-background">
        <DashboardHeader />
      </SafeAreaView>

      <View
        className="flex-1 overflow-hidden"
        onLayout={(e) => setPagerH(e.nativeEvent.layout.height)}
      >
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={!locked}
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => {
            userDragging.current = true;
          }}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
        >
          {pageViews}
        </Animated.ScrollView>
      </View>

      <View
        style={{
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
        }}
      >
        <View style={{ height: PILL_H, flexDirection: "row" }}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: PILL_W,
              height: PILL_H,
              borderRadius: PILL_H / 2,
              backgroundColor: MAROON,
              transform: [{ translateX: pillTranslate }],
            }}
          />
          {PAGES.map(({ icon: Icon, label }, i) => {
            const focused = i === page;
            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                onPress={() => goTo(i)}
                className="flex-1 items-center justify-center gap-1"
              >
                <Icon color="#FFFFFF" size={22} />
                <Text
                  className="text-xs font-medium text-white"
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
