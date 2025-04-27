
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Updated CardTitle to use h3 for semantic correctness
const CardTitle = React.forwardRef<
  HTMLParagraphElement, // Keep as paragraph element ref type for compatibility
  React.HTMLAttributes<HTMLHeadingElement> // Use heading attributes
>(({ className, ...props }, ref) => (
  <h3 // Use h3 tag for semantic structure
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight", // Use text-lg for consistency
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// CardDescription is removed from exports as it's not directly used in timeline.tsx anymore.
// It remains here for potential future use or use in other components.
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Export Card, CardHeader, CardContent, CardFooter, CardTitle
// CardDescription is intentionally not exported here anymore based on the timeline refactor.
export { Card, CardHeader, CardFooter, CardTitle, CardContent }
