import { useRouter } from "expo-router";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  SlidersHorizontal,
  Tag,
} from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";

const ORG_FIELDS = [
  { label: "Organization Name", value: "Lateish Beverages" },
  { label: "Organization Type", value: "Brand" },
  { label: "Primary Contact", value: "john.doe@lateish.com" },
  { label: "Time Zone", value: "(GMT+05:30) Asia/Kolkata" },
  { label: "Organization Size", value: "51 – 200 employees" },
];

function EditButton() {
  return (
    <Pressable className="flex-row items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 active:opacity-80">
      <Pencil color="#FFFFFF" size={14} />
      <Text className="text-sm font-medium">Edit</Text>
    </Pressable>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-base">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border/50" />;
}

export default function OrganizationBrandScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Organization and Brand</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Organization Information */}
        <View className="rounded-2xl border border-border bg-white/[0.03] p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
                <Building2 color="#3B82F6" size={18} />
              </View>
              <Text className="text-lg font-bold">Organization Information</Text>
            </View>
            <EditButton />
          </View>
          {ORG_FIELDS.map((f, i) => (
            <Fragment key={f.label}>
              {i > 0 ? <Divider /> : null}
              <Field label={f.label} value={f.value} />
            </Fragment>
          ))}
        </View>

        {/* Brand Information */}
        <View className="rounded-2xl border border-border bg-white/[0.03] p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-purple-500/15">
                <Tag color="#A855F7" size={18} />
              </View>
              <Text className="text-lg font-bold">Brand Information</Text>
            </View>
            <EditButton />
          </View>

          {/* Brand Logo */}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm text-muted-foreground">Brand Logo</Text>
            <View className="h-20 w-28 items-center justify-center gap-1 rounded-lg border border-border bg-[#0B1526]">
              <Text className="text-base font-bold tracking-wide text-white">
                LATEISH
              </Text>
              <Text className="text-[9px] tracking-[3px] text-muted-foreground">
                BEVERAGES
              </Text>
            </View>
          </View>
          <Divider />
          <Field label="Brand Name" value="Lateish" />
          <Divider />
          <Field label="Brand Tagline" value="Fueling Moments, Building Brands" />
          <Divider />

          <ColorRow label="Primary Brand Color" hex="#2457F5" />
          <Divider />
          <ColorRow label="Secondary Brand Color" hex="#00B3A5" />
        </View>

        {/* Brand Preferences */}
        <Pressable className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4 active:opacity-80">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <SlidersHorizontal color="#D9A521" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold">Brand Preferences</Text>
            <Text className="text-sm text-muted-foreground">
              Set default currency, date format and more.
            </Text>
          </View>
          <ChevronRight color="#64748B" size={20} />
        </Pressable>

        {/* Save */}
        <Pressable
          onPress={() => router.back()}
          className="mt-1 h-14 items-center justify-center rounded-xl bg-white active:opacity-90"
        >
          <Text className="text-base font-semibold text-black">Save and Update</Text>
        </Pressable>
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

function ColorRow({ label, hex }: { label: string; hex: string }) {
  return (
    <Pressable className="flex-row items-center justify-between py-3 active:opacity-70">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        <View className="h-6 w-6 rounded-md" style={{ backgroundColor: hex }} />
        <Text className="text-base">{hex}</Text>
        <ChevronRight color="#64748B" size={18} />
      </View>
    </Pressable>
  );
}
