import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"; // Assuming cn is a utility for Tailwind merge

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 shadow-sm transition-all duration-200 ease-in-out " + // Added rounded-xl, shadow-sm, transition
    "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current " + // Adjusted translate-y, text-current for better inheritance
    "hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", // Added hover and focus styles
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-background to-accent/20 text-foreground border-border", // Enhanced default with gradient
        destructive:
          "border-red-400/70 bg-gradient-to-br from-red-50 dark:from-red-950 to-red-100 dark:to-red-900 text-destructive " + // More prominent destructive gradient
          "[&>svg]:text-red-500 dark:[&>svg]:text-red-400", // Explicit SVG color for destructive
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-semibold leading-snug tracking-normal text-lg",
      className
    )} // Font weight, leading, tracking, text size
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm text-foreground/80 [&_p]:leading-relaxed",
      className
    )} // Added text-foreground/80 for softer look
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
