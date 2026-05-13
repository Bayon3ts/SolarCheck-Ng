import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-primary text-white hover:bg-primary-dark hover:scale-[1.02] focus-visible:ring-primary/50",
        secondary:
          "rounded-full bg-accent text-text-primary hover:bg-accent-dark hover:scale-[1.02] focus-visible:ring-accent/50",
        outline:
          "rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-[1.02] focus-visible:ring-primary/50",
        ghost:
          "rounded-full text-text-primary hover:bg-gray-100 focus-visible:ring-gray-300",
        dark:
          "rounded-full bg-text-primary text-white hover:bg-black hover:scale-[1.02]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-8 py-3.5",
        sm: "px-5 py-2.5 text-xs",
        lg: "px-10 py-4 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
