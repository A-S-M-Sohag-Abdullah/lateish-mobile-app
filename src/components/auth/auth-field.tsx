import { TextInput, type TextInputProps, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends TextInputProps {
  label: string;
}

/**
 * Labelled input for the auth screens. Kept separate from ui/input.tsx because
 * these sit on the fixed dark brand gradient rather than a themed surface, so
 * the colours are white-alpha rather than theme tokens.
 */
export function AuthField({ label, className, ...props }: AuthFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-base font-medium text-white">{label}</Text>
      <TextInput
        className={cn(
          "h-12 rounded-lg border border-white/10 bg-white/[0.07] px-4 text-base text-white",
          "placeholder:text-white/40",
          className,
        )}
        placeholderTextColor="rgba(255,255,255,0.4)"
        {...props}
      />
    </View>
  );
}
