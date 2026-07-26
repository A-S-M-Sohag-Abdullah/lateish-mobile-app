import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/lib/utils";

/**
 * Lets a container (Button, Badge, ...) set the text colour for any <Text>
 * nested inside it, replacing the web's CSS inheritance which RN does not have.
 */
export const TextClassContext = createContext<string | undefined>(undefined);

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-base",
      h1: "text-3xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-semibold",
      large: "text-lg font-medium",
      lead: "text-base text-muted-foreground",
      p: "text-base",
      small: "text-sm",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type TextComponentProps = TextProps & VariantProps<typeof textVariants>;

export function Text({ className, variant, ...props }: TextComponentProps) {
  const inherited = useContext(TextClassContext);
  return (
    <RNText
      className={cn(textVariants({ variant }), inherited, className)}
      {...props}
    />
  );
}

export { textVariants };
