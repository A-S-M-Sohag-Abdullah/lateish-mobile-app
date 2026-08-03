import { useMutation } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import {
  Bell,
  Building2,
  ChevronRight,
  Database,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { Image } from "expo-image";
import { Fragment } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";

interface Row {
  icon: LucideIcon;
  label: string;
  href?: Href;
}

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Account",
    rows: [
      { icon: Building2, label: "Organizations", href: "/organizations" },
      { icon: Tag, label: "Brands", href: "/brands" },
      { icon: MapPin, label: "Territories", href: "/territories" },
      { icon: Users, label: "User Management", href: "/user-management" },
      { icon: Bell, label: "Notifications", href: "/notification-settings" },
    ],
  },
  {
    title: "Data And Security",
    rows: [
      { icon: Lock, label: "Security", href: "/security" },
      { icon: Database, label: "Data Management", href: "/data-management" },
    ],
  },
  {
    title: "Support",
    rows: [
      { icon: HelpCircle, label: "Help Center" },
      { icon: Mail, label: "Contact Support" },
    ],
  },
];

function SettingsRow({ icon: Icon, label, href }: Row) {
  const router = useRouter();
  return (
    <Pressable
      onPress={href ? () => router.push(href) : undefined}
      className="flex-row items-center gap-3 px-4 py-4 active:bg-white/5"
    >
      <Icon color="#FFFFFF" size={20} />
      <Text className="flex-1 text-base">{label}</Text>
      <ChevronRight color="#64748B" size={20} />
    </Pressable>
  );
}

function SettingsSection({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{title}</Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-white/[0.03]">
        {rows.map((row, i) => (
          <Fragment key={row.label}>
            {i > 0 ? <View className="ml-4 h-px bg-border/50" /> : null}
            <SettingsRow {...row} />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);

  const router = useRouter();
  const setPreviewSignedIn = usePreviewStore((s) => s.setSignedIn);

  const signOut = useMutation({
    mutationFn: async () => {
      if (PREVIEW_MODE) {
        setPreviewSignedIn(false);
        router.replace("/login");
        return;
      }
      await logout();
    },
  });

  const name = profile?.full_name || "Unknown";
  const email = profile?.email || "";
  const initials =
    (profile?.full_name || profile?.email || "?")
      .split(/[\s@.]+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-4 pb-28 pt-2 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold">Settings</Text>

        {/* Profile Settings */}
        <View className="gap-2">
          <Text className="text-sm text-muted-foreground">Profile Settings</Text>
          <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1C3A69]">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-lg font-semibold text-white">{initials}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold">{name}</Text>
              <Text className="text-sm text-muted-foreground">{email}</Text>
            </View>
            <Pressable
              onPress={() => router.push("/profile-settings")}
              className="rounded-lg bg-secondary px-5 py-2.5 active:opacity-80"
            >
              <Text className="font-medium">Edit</Text>
            </Pressable>
          </View>
        </View>

        {SECTIONS.map((section) => (
          <SettingsSection key={section.title} title={section.title} rows={section.rows} />
        ))}

        <Button
          variant="destructive"
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
        >
          <Text>Sign out</Text>
        </Button>
      </ScrollView>
    </View>
  );
}
