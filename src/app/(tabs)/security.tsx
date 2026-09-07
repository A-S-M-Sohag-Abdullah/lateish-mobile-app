import { useMutation } from "@tanstack/react-query";
import { Check, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormError } from "@/components/auth/form-error";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useGoBack } from "@/hooks/use-go-back";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-2">
      <Text className="text-base text-muted-foreground">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        placeholder="••••••••••••"
        placeholderTextColor={colors.mutedForeground}
        className="h-14"
      />
    </View>
  );
}

export default function SecurityScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const save = useMutation({
    // Session-authenticated — works for password and Google-only accounts alike,
    // so Google users can set a password for the first time here too.
    mutationFn: () => api.post("/users/change-password", { newPassword: next }),
    onSuccess: () => {
      setNext("");
      setConfirm("");
    },
  });

  const mismatch = confirm.length > 0 && next !== confirm;
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
  const canSubmit =
    next.length >= MIN_PASSWORD_LENGTH && next === confirm && !save.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => goBack()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Password and Security</Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-16 pt-8"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Text className="-mb-2 text-sm text-muted-foreground">
          Set a new password for your account.
        </Text>

        <PasswordField
          label="New Password"
          value={next}
          onChangeText={(v) => {
            setNext(v);
            save.reset();
          }}
        />
        <PasswordField
          label="Confirm New Password"
          value={confirm}
          onChangeText={setConfirm}
        />

        {tooShort ? (
          <Text className="-mt-3 text-sm text-muted-foreground">
            Password must be at least {MIN_PASSWORD_LENGTH} characters.
          </Text>
        ) : null}
        {mismatch ? (
          <Text className="-mt-3 text-sm text-red-500">Passwords do not match.</Text>
        ) : null}

        <FormError error={save.error} />

        {save.isSuccess ? (
          <View className="flex-row items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5">
            <Check color="#22C55E" size={16} />
            <Text className="text-sm text-green-500">Password updated successfully.</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => save.mutate()}
          disabled={!canSubmit}
          className="mt-2 h-14 items-center justify-center rounded-xl bg-white active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-black">
            {save.isPending ? "Updating…" : "Save and Update"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
