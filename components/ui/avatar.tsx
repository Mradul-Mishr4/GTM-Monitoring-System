"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// CVA for managing size variants
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full group", // Added 'group' for hover effects
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      avatarVariants({ size }),
      "transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", // Added focus ring
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-110", // Added object-cover and hover zoom effect
      className
    )}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      "bg-gradient-to-br from-muted to-muted-foreground/20 font-semibold text-muted-foreground", // Enhanced gradient background and font style
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// ✨ New component for status indicator
const AvatarStatus = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    status: "online" | "offline";
    position?: "bottom-right" | "top-right";
  }
>(({ className, status, position = "bottom-right", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute block rounded-full ring-2 ring-background",
      status === "online" ? "bg-green-500" : "bg-gray-400",
      position === "bottom-right"
        ? "bottom-0 right-0 h-3 w-3" // Adjusted size
        : "right-0 top-0 h-3 w-3",
      className
    )}
    {...props}
  />
));
AvatarStatus.displayName = "AvatarStatus";

export { Avatar, AvatarImage, AvatarFallback, AvatarStatus };
