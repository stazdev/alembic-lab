"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// WebGL cannot render on the server — load the scene client-only (§3.2).
const AtomicModelScene = dynamic(
  () => import("./AtomicModelScene").then((m) => m.AtomicModelScene),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
      </div>
    ),
  },
);

export function AtomicModel3D({
  shells,
  color,
  className,
}: {
  shells: number[];
  color: string;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <AtomicModelScene shells={shells} color={color} />
    </div>
  );
}
