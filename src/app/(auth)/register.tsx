import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { AuthLayout } from "@/components/auth/auth-layout";
import { FormError } from "@/components/auth/form-error";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";
import { useTabsStore } from "@/store/tabs.store";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  // Open the pager on Dashboard after auth (see login.tsx).
  const setPage = useTabsStore((s) => s.setPage);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = useMutation({
    mutationFn: () => register({ email: email.trim(), password }),
    onSuccess: () => {
      setPage(0);
      router.replace("/");
    },
  });

  const google = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => setPage(0),
  });

  const setPreviewSignedIn = usePreviewStore((s) => s.setSignedIn);

  // In preview mode the button just opens the dashboard — no API call.
  const handleSignUp = () => {
    if (!PREVIEW_MODE) return signUp.mutate();
    setPreviewSignedIn(true);
    router.replace("/");
  };

  const canSubmit =
    email.trim().length > 0 && password.length >= MIN_PASSWORD_LENGTH;
  const busy = signUp.isPending || google.isPending;

  return (
    <AuthLayout
      tab="signup"
      title="Sign Up"
      subtitle="Continue building your business with clarity and confidence."
    >
      <View className="gap-5">
        <AuthField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <AuthField
          label="Create Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={() => canSubmit && handleSignUp()}
        />
      </View>

      <Link href="/forgot-password" asChild>
        <Text className="mt-3 text-right text-base font-bold text-white underline">
          Forgot Password?
        </Text>
      </Link>

      <FormError error={signUp.error ?? google.error} />

      {password.length > 0 && password.length < MIN_PASSWORD_LENGTH ? (
        <Text className="mt-3 text-sm text-white/60">
          Password must be at least {MIN_PASSWORD_LENGTH} characters.
        </Text>
      ) : null}

      <Button
        variant="brand"
        size="lg"
        className="mt-5"
        onPress={handleSignUp}
        disabled={(!canSubmit && !PREVIEW_MODE) || busy}
        loading={signUp.isPending}
      >
        <Text>Sign Up</Text>
      </Button>

      <OrDivider />

      <GoogleButton
        onPress={() => google.mutate()}
        loading={google.isPending}
        disabled={busy}
      />
    </AuthLayout>
  );
}
