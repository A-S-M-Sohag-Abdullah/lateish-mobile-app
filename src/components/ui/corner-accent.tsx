import { View } from "react-native";

/**
 * Decorative tilted rectangle in the top-right corner of a card. The parent
 * must be `overflow-hidden` (and positioned) so the overhang is clipped.
 */
export function CornerAccent() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -60,
        right: -46,
        width: 150,
        height: 74,
        backgroundColor: "rgba(6, 10, 19, 0.3)",
        transform: [{ skewX: "24deg" }],
        transformOrigin: "left bottom",
      }}
    />
  );
}
