import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGoBack } from "@/hooks/use-go-back";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthField } from "@/components/auth/auth-field";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AUTH_GRADIENT, SPLASH_GRADIENT_DIRECTION } from "@/lib/brand";
import { useAuthStore } from "@/store/auth.store";

/**
 * Reached from the "Forgot Password?" link on both auth screens. There is no
 * mock for this one — it follows the sign-in screen's visual language.
 *
 * The reset link Supabase emails opens the *web* app's reset page (the project
 * Site URL). Handling the reset in-app would need a deep-linked reset screen
 * plus a Supabase redirect allow-list entry.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const goBack = useGoBack("/login");
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const [email, setEmail] = useState("");

  const send = useMutation({ mutationFn: () => sendPasswordReset(email) });

  const canSubmit = email.trim().length > 0;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[...AUTH_GRADIENT.colors]}
        locations={[...AUTH_GRADIENT.locations]}
        start={SPLASH_GRADIENT_DIRECTION.start}
        end={SPLASH_GRADIENT_DIRECTION.end}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView className="flex-1">
        {/* Outside the scroll view so it stays pinned while the content
            below is vertically centred. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBack()}
          className="ml-4 mt-3 h-11 w-11 items-center justify-center rounded-lg active:bg-white/10"
        >
          <ArrowLeft color="#FFFFFF" size={22} />
        </Pressable>

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center px-6 pb-10"
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
        >
            <View className="mb-8 items-center gap-3">
              <Text className="text-4xl font-bold text-white">
                Reset Password
              </Text>
              <Text className="text-center text-base leading-6 text-white/70">
                {send.isSuccess
                  ? "Check your inbox — we've sent you a link to set a new password."
                  : "Enter your email and we'll send you a link to set a new password."}
              </Text>
            </View>

            {send.isSuccess ? (
              <Button
                variant="brand"
                size="lg"
                onPress={() => router.replace("/login")}
              >
                <Text>Back to Sign In</Text>
              </Button>
            ) : (
              <>
                <AuthField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  onSubmitEditing={() => canSubmit && send.mutate()}
                />

                <FormError error={send.error} />

                <Button
                  variant="brand"
                  size="lg"
                  className="mt-6"
                  onPress={() => send.mutate()}
                  disabled={!canSubmit}
                  loading={send.isPending}
                >
                  <Text>Send Reset Link</Text>
                </Button>
              </>
            )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
