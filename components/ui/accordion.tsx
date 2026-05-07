"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Accordion — minimal, accessible implementation.
 * Uses native <details>/<summary> for a11y + no JS dependency.
 * ChevronDown rotates via CSS on [open].
 */

export function Accordion({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("divide-y divide-border", className)} {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: React.DetailsHTMLAttributes<HTMLDetailsElement>) {
  return (
    <details
      className={cn("group py-4 [&[open]>summary>svg]:rotate-180", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={cn(
        "flex cursor-pointer list-none items-center justify-between text-left text-base font-medium transition-colors hover:text-primary marker:hidden [&::-webkit-details-marker]:hidden",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </summary>
  );
}

export function AccordionContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pt-3 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}
