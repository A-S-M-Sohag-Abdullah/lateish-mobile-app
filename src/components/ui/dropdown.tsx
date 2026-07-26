import { Check, ChevronDown } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
  type LayoutRectangle,
} from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface DropdownProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Applied to the trigger — e.g. "flex-1" to make it fill its column. */
  className?: string;
  /** "sm" is a compact pill; "md" is a full-size form field. */
  size?: "sm" | "md";
  /** Muted trigger text when the value equals this (a placeholder). */
  placeholder?: string;
}

const SIZES = {
  sm: { trigger: "h-9 px-2.5", text: "text-xs", chevron: 14 },
  md: { trigger: "h-12 px-4", text: "text-base", chevron: 18 },
} as const;

const MENU_WIDTH = 190;
const SCREEN_MARGIN = 12;

/**
 * Compact pill that opens a tap-anywhere-to-close menu anchored beneath the
 * trigger. A Modal is used so the list escapes the card's clipping and sits
 * above everything, rather than an inline expander that would push content.
 */
export function Dropdown({
  options,
  value,
  onChange,
  className,
  size = "sm",
  placeholder,
}: DropdownProps) {
  const colors = useThemeColors();
  const sz = SIZES[size];
  const isPlaceholder = value === placeholder;
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  function openMenu() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  // The menu matches the trigger width (so a full-width trigger gets a
  // full-width menu), with a sensible floor, then clamps to stay on-screen.
  const screenWidth = Dimensions.get("window").width;
  const menuWidth = anchor ? Math.max(MENU_WIDTH, anchor.width) : MENU_WIDTH;
  const left = anchor
    ? Math.min(anchor.x, screenWidth - menuWidth - SCREEN_MARGIN)
    : 0;
  const top = anchor ? anchor.y + anchor.height + 4 : 0;

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        onPress={openMenu}
        className={cn(
          "flex-row items-center justify-between gap-1 rounded-lg border border-border bg-background/40 active:opacity-70",
          sz.trigger,
          className,
        )}
      >
        <Text
          className={cn(
            "font-medium",
            sz.text,
            isPlaceholder && "text-muted-foreground",
          )}
          numberOfLines={1}
        >
          {value}
        </Text>
        <ChevronDown color={colors.mutedForeground} size={sz.chevron} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close menu"
        >
          <View
            style={{ position: "absolute", top, left, width: menuWidth }}
            className="overflow-hidden rounded-xl border border-border bg-popover"
          >
            <ScrollView bounces={false} className="max-h-64">
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex-row items-center justify-between gap-2 px-3 py-2.5 active:bg-muted",
                      selected && "bg-muted/60",
                    )}
                  >
                    <Text
                      className={cn("text-sm", selected && "font-semibold")}
                      numberOfLines={1}
                    >
                      {option}
                    </Text>
                    {selected ? (
                      <Check color={colors.foreground} size={16} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
