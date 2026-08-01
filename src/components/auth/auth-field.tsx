import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends TextInputProps {
  label: string;
}

/**
 * Labelled input for the auth screens. Kept separate from ui/input.tsx because
 * these sit on the fixed dark brand gradient rather than a themed surface, so
 * the colours are white-alpha rather than theme tokens.
 *
 * Secure fields get a show/hide (eye) toggle automatically.
 */
export function AuthField({
  label,
  className,
  secureTextEntry,
  ...props
}: AuthFieldProps) {
  const isPassword = secureTextEntry === true;
  const [hidden, setHidden] = useState(true);

  return (
    <View className="gap-2">
      <Text className="text-base font-medium text-white">{label}</Text>
      <View className="justify-center">
        <TextInput
          className={cn(
            "h-12 rounded-lg border border-white/10 bg-white/[0.07] px-4 text-base text-white",
            "placeholder:text-white/40",
            isPassword && "pr-12",
            className,
          )}
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            className="absolute bottom-0 right-3 top-0 justify-center active:opacity-70"
          >
            {hidden ? (
              <EyeOff color="rgba(255,255,255,0.6)" size={20} />
            ) : (
              <Eye color="rgba(255,255,255,0.6)" size={20} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
