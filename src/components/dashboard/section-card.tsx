import { Info, type LucideIcon } from "lucide-react-native";
import {
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Small text pinned top-right, e.g. "0 active" or "No Integrations". */
  status?: string;
  statusClassName?: string;
  /** Overrides the card surface (e.g. "border-0 bg-white/5"). */
  className?: string;
  /** Inline style, e.g. an exact borderRadius. Wins over className. */
  style?: StyleProp<ViewStyle>;
  /** Overrides the title text style (exact size/weight/colour). */
  titleStyle?: StyleProp<TextStyle>;
  /** Overrides the description text style. */
  descriptionStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

/**
 * The repeated dashboard card shell: an icon + title header, an optional
 * right-aligned status, a description line, then card-specific content.
 */
export function SectionCard({
  icon: Icon,
  title,
  description,
  status,
  statusClassName,
  className,
  style,
  titleStyle,
  descriptionStyle,
  children,
}: SectionCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={style}
      className={cn(
        "gap-3 rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Icon color={colors.foreground} size={22} />
          <Text
            className="text-xl font-bold"
            style={titleStyle}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {status ? (
          <Text className={cn("text-sm font-medium", statusClassName)}>
            {status}
          </Text>
        ) : null}
      </View>

      {description ? (
        <Text
          className="text-base leading-6 text-muted-foreground"
          style={descriptionStyle}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

/** The "(i) No active alerts" placeholder used by the empty insight cards. */
export function EmptyState({ label }: { label: string }) {
  const colors = useThemeColors();

  return (
    <View className="items-center justify-center gap-3 rounded-xl border border-border bg-background/40 py-10">
      <Info color={colors.mutedForeground} size={40} strokeWidth={1.5} />
      <Text className="text-base text-muted-foreground">{label}</Text>
    </View>
  );
}
