"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverClose = RadixPopover.Close;

interface PopoverContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function PopoverContent({
  children,
  side = "right",
  align = "start",
  className,
}: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        side={side}
        align={align}
        sideOffset={10}
        collisionPadding={16}
        className={cn(
          "z-50 w-80 origin-[var(--radix-popover-content-transform-origin)] animate-pop-in rounded-card border border-line bg-surface p-5 shadow-lift",
          className,
        )}
      >
        {children}
        <RadixPopover.Arrow className="fill-surface" width={14} height={7} />
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
