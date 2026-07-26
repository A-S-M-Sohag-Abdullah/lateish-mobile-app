import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";
import { TextClassContext } from "./text";

const badgeVariants = cva(
  "flex-row items-center justify-center gap-1 self-start rounded-4xl border border-transparent px-2 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive/10 dark:bg-destructive/20",
        outline: "border-border",
        success: "bg-success/10",
        warning: "bg-warning/10",
        info: "bg-info/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const badgeTextVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      outline: "text-foreground",
      success: "text-success",
      warning: "text-warning",
      info: "text-info",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeProps = ViewProps & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { badgeVariants, badgeTextVariants };
