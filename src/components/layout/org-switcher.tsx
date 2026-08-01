import { useRouter } from "expo-router";
import { Check, ChevronDown, Plus } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

/** Org avatar (logo initials). */
function OrgAvatar({ initials, size = 20 }: { initials: string; size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center rounded bg-primary"
    >
      <Text
        className="font-bold text-primary-foreground"
        style={{ fontSize: size * 0.42 }}
      >
        {initials}
      </Text>
    </View>
  );
}

/**
 * Organization switcher for the header — replaces the search bar. Shows the
 * current org and, on tap, a dropdown to switch orgs or create a new one.
 * Ported from front-end/src/components/layout/org-switcher.tsx.
 */
export function OrgSwitcher() {
  const { currentOrg, organizations, switchOrg } = useOrganizations();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  if (!currentOrg) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-9 flex-row items-center gap-2 rounded-lg border border-border bg-secondary px-2.5 active:opacity-80"
      >
        <OrgAvatar initials={currentOrg.logoInitials} />
        <Text className="max-w-[130px] font-medium" numberOfLines={1}>
          {currentOrg.name}
        </Text>
        <ChevronDown color={colors.mutedForeground} size={16} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1"
          onPress={() => setOpen(false)}
          style={{ paddingTop: insets.top + 52, paddingLeft: 16 }}
        >
          <View
            className="w-72 overflow-hidden rounded-xl border border-border bg-popover"
            onStartShouldSetResponder={() => true}
          >
            <Text className="border-b border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground">
              Organizations
            </Text>

            {organizations.map((org) => {
              const active = org.id === currentOrg.id;
              return (
                <Pressable
                  key={org.id}
                  onPress={() => {
                    switchOrg(org.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex-row items-center gap-3 px-3 py-2.5 active:bg-white/5",
                    active && "bg-white/5",
                  )}
                >
                  <OrgAvatar initials={org.logoInitials} size={28} />
                  <View className="flex-1">
                    <Text className="font-medium" numberOfLines={1}>
                      {org.name}
                    </Text>
                    <Text className="text-xs capitalize text-muted-foreground">
                      {org.plan} plan
                    </Text>
                  </View>
                  {active ? <Check color={colors.foreground} size={16} /> : null}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setOpen(false);
                router.push("/setup");
              }}
              className="flex-row items-center gap-2 border-t border-border/60 px-3 py-3 active:bg-white/5"
            >
              <Plus color={colors.mutedForeground} size={16} />
              <Text className="text-sm text-muted-foreground">New Organization</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
