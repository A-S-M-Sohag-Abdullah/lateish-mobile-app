import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: () => router.replace("/"),
  });

  const setPreviewSignedIn = usePreviewStore((s) => s.setSignedIn);

  // In preview mode the button just opens the dashboard — no API call.
  const handleSignIn = () => {
    if (!PREVIEW_MODE) return signIn.mutate();
    setPreviewSignedIn(true);
    router.replace("/");
  };

  const google = useMutation({ mutationFn: signInWithGoogle });

  const canSubmit = email.trim().length > 0 && password.length > 0;
  const busy = signIn.isPending || google.isPending;

  return (
    <AuthLayout
      tab="signin"
      title="Sign In"
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
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={() => canSubmit && handleSignIn()}
        />
      </View>

      <Link href="/forgot-password" asChild>
        <Text className="mt-3 text-right text-base font-bold text-white underline">
          Forgot Password?
        </Text>
      </Link>

      <FormError error={signIn.error ?? google.error} />

      <Button
        variant="brand"
        size="lg"
        className="mt-5"
        onPress={handleSignIn}
        disabled={(!canSubmit && !PREVIEW_MODE) || busy}
        loading={signIn.isPending}
      >
        <Text>Sign In</Text>
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
