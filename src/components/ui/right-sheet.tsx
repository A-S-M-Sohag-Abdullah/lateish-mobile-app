import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Web has no native animation module; the native driver warns and no-ops there.
const USE_NATIVE_DRIVER = Platform.OS !== "web";
const OPEN_MS = 260;
const CLOSE_MS = 220;

interface RightSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Panel width as a fraction of the screen; the rest shows the dimmed page. */
  widthRatio?: number;
  children: React.ReactNode;
}

/**
 * A panel that slides in from the right edge, covering most of the screen while
 * the page behind stays visible (dimmed) at the left. The slide is driven by
 * Animated, so it works under the new architecture and on web. Reusable.
 */
export function RightSheet({
  visible,
  onClose,
  widthRatio = 0.88,
  children,
}: RightSheetProps) {
  const { width } = useWindowDimensions();
  const panelWidth = Math.round(width * widthRatio);

  const translateX = useRef(new Animated.Value(panelWidth)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.setValue(panelWidth);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: OPEN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: OPEN_MS,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: panelWidth,
          duration: CLOSE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: CLOSE_MS,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, panelWidth]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
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
              accessibilityLabel="Close"
              onPress={onClose}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: panelWidth,
              transform: [{ translateX }],
            }}
            className="overflow-hidden rounded-l-3xl border-l border-border bg-background"
          >
            {children}
          </Animated.View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}
