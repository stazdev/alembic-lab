"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200} skipDelayDuration={400}>
      {children}
    </RadixTooltip.Provider>
  );
}

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            "z-50 max-w-xs origin-[var(--radix-tooltip-content-transform-origin)] animate-pop-in rounded-ctrl bg-dark px-3 py-1.5 text-xs font-medium text-on-dark shadow-lift",
            className,
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-dark" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
