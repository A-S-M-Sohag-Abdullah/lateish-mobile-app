import { View, type ViewStyle } from "react-native";

import { Text } from "@/components/ui/text";

export type TagVariant =
  | "neutral"
  | "outline"
  | "success"
  | "warning"
  | "danger";

// Inline styles rather than NativeWind classes: arbitrary colour/border/radius
// utilities don't render reliably here, so the exact specced values are set
// directly. neutral keeps a transparent 2px border to match bordered heights.
const VARIANT: Record<TagVariant, ViewStyle> = {
  neutral: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "transparent",
    borderWidth: 2,
    borderRadius: 6,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#323749",
    borderWidth: 1,
    // Pill shape with tighter padding (overrides the base padding).
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  success: {
    backgroundColor: "#0A1A12",
    borderColor: "#2B6D4C",
    borderWidth: 2,
    borderRadius: 8,
  },
  warning: {
    backgroundColor: "#3B3416",
    borderColor: "#887832",
    borderWidth: 2,
    borderRadius: 8,
  },
  danger: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.5)",
    borderWidth: 2,
    borderRadius: 8,
  },
};

/** Small pill used for labels like "Example" or "High Confidence". */
export function Tag({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: TagVariant;
}) {
  return (
    <View
      style={[
        { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8 },
        VARIANT[variant],
      ]}
    >
      <Text
        className="font-medium"
        style={{ fontSize: 12, lineHeight: 16, color: "#F3F4F6" }}
      >
        {label}
      </Text>
    </View>
  );
}
