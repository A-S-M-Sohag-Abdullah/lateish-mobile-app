import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/utils";
import { TextClassContext } from "./text";

/**
 * Same variant/size vocabulary as front-end/src/components/ui/button.tsx.
 * Heights are larger than web: 44px is the minimum comfortable touch target.
 */
const buttonVariants = cva(
  "flex-row shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        outline: "border-border bg-background active:bg-muted dark:border-input",
        secondary: "bg-secondary active:opacity-80",
        ghost: "active:bg-muted dark:active:bg-muted/50",
        destructive: "bg-destructive/10 active:bg-destructive/20 dark:bg-destructive/20",
        accent: "bg-accent active:opacity-90",
        /** Fixed brand maroon — used on the auth screens, which are not themed. */
        brand: "bg-brand-maroon active:bg-brand-maroon-pressed",
        link: "",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-5",
        icon: "h-11 w-11 px-0",
        "icon-sm": "h-9 w-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** Text colour per variant, handed down through TextClassContext. */
const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive",
      accent: "text-accent-foreground",
      brand: "text-white",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-base",
      icon: "text-base",
      "icon-sm": "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? <ActivityIndicator size="small" /> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { buttonVariants, buttonTextVariants };
