import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

/** Bordered select that expands its option list inline beneath the field. */
export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const colors = useThemeColors();

  return (
    <View className="gap-2">
      {label ? (
        <Text className="text-base text-muted-foreground">{label}</Text>
      ) : null}

      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="h-14 flex-row items-center justify-between rounded-xl border border-border bg-white/[0.02] px-4 active:opacity-80"
      >
        <Text className="text-base">{value}</Text>
        {open ? (
          <ChevronUp color={colors.foreground} size={22} />
        ) : (
          <ChevronDown color={colors.foreground} size={22} />
        )}
      </Pressable>

      {open ? (
        <View className="overflow-hidden rounded-xl border border-border bg-popover">
          {options.map((opt, i) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "px-4 py-3.5 active:bg-white/5",
                i > 0 && "border-t border-border/50",
                opt === value && "bg-white/5",
              )}
            >
              <Text className="text-base">{opt}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
