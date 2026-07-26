import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/utils";

export type InputProps = TextInputProps & { className?: string };

export function Input({ className, editable, ...props }: InputProps) {
  return (
    <TextInput
      editable={editable}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base text-foreground",
        "placeholder:text-muted-foreground focus:border-ring dark:bg-input/30",
        editable === false && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}
