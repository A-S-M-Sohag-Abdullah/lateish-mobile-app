import { Check, Search } from "lucide-react-native";
import { Pressable, TextInput, View, type ViewProps } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface FieldProps extends ViewProps {
  label: string;
  description?: string;
  /**
   * "label" — muted field label (e.g. "Start date").
   * "heading" — bold section heading with a muted description underneath.
   */
  emphasis?: "label" | "heading";
  children?: React.ReactNode;
}

/** Label (+ optional description) above a control. */
export function Field({
  label,
  description,
  emphasis = "label",
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <View className={cn("gap-3", className)} {...props}>
      <View className="gap-1">
        <Text
          className={
            emphasis === "heading"
              ? "text-lg font-bold text-foreground"
              : "text-base text-muted-foreground"
          }
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-sm text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  align?: "left" | "center";
}

/** Single-select card with a maroon selected state (radio semantics). */
export function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
  align = "left",
}: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "rounded-xl border px-4 py-4 active:opacity-80",
        selected
          ? "border-brand-maroon bg-brand-maroon/10"
          : "border-border bg-secondary",
      )}
    >
      <Text
        className={cn(
          "text-base font-medium text-foreground",
          align === "center" && "text-center",
        )}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          className={cn(
            "mt-1 text-sm text-muted-foreground",
            align === "center" && "text-center",
          )}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

/** Multi-select row with a leading checkbox. */
export function CheckboxRow({ label, checked, onToggle }: CheckboxRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      className="flex-row items-center gap-3 rounded-xl bg-secondary px-4 py-4 active:opacity-80"
    >
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-md border-2",
          checked ? "border-white bg-white" : "border-muted-foreground",
        )}
      >
        {checked ? <Check color="#000000" size={16} strokeWidth={3} /> : null}
      </View>
      <Text
        className={cn(
          "flex-1 text-base",
          checked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

/** Text input with a leading search icon, styled for dark sheets. */
export function SearchField({
  value,
  onChangeText,
  placeholder,
}: SearchFieldProps) {
  const colors = useThemeColors();
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-lg border border-input bg-input/30 px-3">
      <Search color={colors.mutedForeground} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        className="flex-1 text-base text-foreground"
      />
    </View>
  );
}
