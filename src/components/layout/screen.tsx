import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface ScreenProps {
  title?: string;
  description?: string;
  /** Rendered on the right of the header row (actions, filters, avatar). */
  headerRight?: React.ReactNode;
  scroll?: boolean;
  /**
   * Hosted inside the swipeable pager, which already provides the fixed top
   * bar and safe area — so skip our own DashboardHeader and top inset.
   */
  embedded?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Standard tab-screen frame: safe-area, optional page header, padded body.
 * The equivalent of the web `PageHeader` + dashboard layout padding.
 */
export function Screen({
  title,
  description,
  headerRight,
  scroll = true,
  embedded = false,
  className,
  children,
}: ScreenProps) {
  const body = (
    <View className={cn("gap-4 px-4 pb-8", className)}>{children}</View>
  );

  const inner = (
    <>
      {title ? (
        <View className="flex-row items-start justify-between gap-3 px-4 pb-4 pt-2">
          <View className="flex-1 gap-1">
            <Text variant="h3">{title}</Text>
            {description ? <Text variant="muted">{description}</Text> : null}
          </View>
          {headerRight}
        </View>
      ) : null}

      {scroll ? (
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {body}
        </ScrollView>
      ) : (
        <View className="flex-1">{body}</View>
      )}
    </>
  );

  // Inside the pager the fixed header + top inset are provided once by the
  // shell, so an embedded screen is just its own body.
  if (embedded) {
    return <View className="flex-1 bg-background">{inner}</View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />
      {inner}
    </SafeAreaView>
  );
}
