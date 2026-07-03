import type { ReactNode } from "react";
import type { ApparatusIconKind } from "@/data/apparatus";
import { cn } from "@/lib/utils";

/*
 * Hand-drawn line icons for lab apparatus. Charcoal linework (currentColor)
 * with a yellow "liquid" accent (fill-accent) — a lightweight stand-in for the
 * production glTF 3D models (Phase 0 asset spike). Consistent 48×48 grid.
 */

interface IconProps {
  kind: ApparatusIconKind;
  className?: string;
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const LIQUID = "fill-accent";

const ICONS: Record<ApparatusIconKind, ReactNode> = {
  beaker: (
    <>
      <path className={LIQUID} stroke="none" d="M16.4 27 L17 37 Q17 38.6 19 38.6 L29 38.6 Q31 38.6 31 37 L31.6 27 Z" />
      <path d="M15 11 L17 37 Q17 39 19 39 L29 39 Q31 39 31 37 L33 11" />
      <path d="M13 11 L35 11" />
      <path d="M33 11 Q35.5 10.5 36.5 12.5" />
      <path d="M29 17 L32 17 M29 21 L32 21 M29 25 L32 25" />
    </>
  ),
  erlenmeyer: (
    <>
      <path className={LIQUID} stroke="none" d="M14.7 31 L12.8 36 Q12 38.6 15 38.6 L33 38.6 Q36 38.6 35.2 36 L33.3 31 Z" />
      <path d="M19 11 L19 18 L12 36 Q11 39 15 39 L33 39 Q37 39 36 36 L29 18 L29 11" />
      <path d="M17 11 L31 11" />
      <path d="M19 16 L29 16" />
    </>
  ),
  volumetricFlask: (
    <>
      <path className={LIQUID} stroke="none" d="M15.8 33 A9 9 0 0 0 32.2 33 Z" />
      <path d="M21 10 L21 23 A11 11 0 1 0 27 23 L27 10" />
      <path d="M19 10 L29 10" />
      <path d="M21 19 L27 19" />
    </>
  ),
  roundBottom: (
    <>
      <path className={LIQUID} stroke="none" d="M14.5 32 A11 11 0 0 0 33.5 32 Z" />
      <path d="M20 10 L20 20 A12 12 0 1 0 28 20 L28 10" />
      <path d="M18 10 L30 10" />
      <path d="M20 18 L28 18" />
    </>
  ),
  testTube: (
    <>
      <path className={LIQUID} stroke="none" d="M19 24 L19 33 A5 5 0 0 0 29 33 L29 24 Z" />
      <path d="M19 8 L19 33 A5 5 0 0 0 29 33 L29 8" />
      <path d="M16.5 8 L31.5 8" />
    </>
  ),
  graduatedCylinder: (
    <>
      <path className={LIQUID} stroke="none" d="M20 28 L20 36 L28 36 L28 28 Z" />
      <path d="M20 13 L20 36 L28 36 L28 13" />
      <path d="M20 13 L18 11 M28 13 Q30.5 11.5 31.5 13" />
      <path d="M16 40 L32 40 M20 36 L17 40 M28 36 L31 40" />
      <path d="M25 18 L28 18 M25 22 L28 22 M25 26 L28 26" />
    </>
  ),
  burette: (
    <>
      <path className={LIQUID} stroke="none" d="M21 20 L21 33 L27 33 L27 20 Z" />
      <path d="M21 7 L21 33 L24 36 L27 33 L27 7" />
      <path d="M19.5 7 L28.5 7" />
      <circle cx="24" cy="38" r="2.2" />
      <path d="M24 38 L28.5 38 M24 40.2 L24 43" />
      <path d="M21 13 L23.5 13 M21 17 L23.5 17 M21 21 L23.5 21 M21 25 L23.5 25" />
    </>
  ),
  pipette: (
    <>
      <path className={LIQUID} stroke="none" d="M22 34 L22 40 L24 43 L26 40 L26 34 Z" />
      <path d="M22 7 C22 15 18 18 18 23 C18 28 22 31 22 40 L24 44 L26 40 C26 31 30 28 30 23 C30 18 26 15 26 7" />
      <path d="M21 7 L27 7" />
    </>
  ),
  funnel: (
    <>
      <path className={LIQUID} stroke="none" d="M18 16 L30 16 L26 24 L22 24 Z" />
      <path d="M13 12 L35 12 L27 26 L27 39 L21 39 L21 26 Z" />
    </>
  ),
  watchGlass: (
    <>
      <path className={LIQUID} stroke="none" d="M18 25 Q24 29 30 25 Q24 27 18 25 Z" />
      <path d="M10 23 Q24 36 38 23" />
      <path d="M10 23 Q24 27 38 23" />
    </>
  ),
  hotplate: (
    <>
      <path d="M12 29 L36 29" />
      <path d="M13 31 L35 31 L33 41 L15 41 Z" />
      <circle cx="30" cy="36" r="2.4" />
      <path className={LIQUID} stroke="currentColor" d="M18 25 q2.5 -3 0 -6 M24 25 q2.5 -3 0 -6 M30 25 q2.5 -3 0 -6" />
    </>
  ),
  bunsen: (
    <>
      <path className={LIQUID} stroke="none" d="M24 30 C20 26 21 19 24 13 C27 19 28 26 24 30 Z" />
      <path d="M17 41 L31 41 M24 41 L24 38" />
      <path d="M21 38 L27 38 L27 30 L21 30 Z" />
    </>
  ),
  waterBath: (
    <>
      <path className={LIQUID} stroke="none" d="M14.5 28 Q19 26 24 28 T35.4 28 L34 38 Q34 39.5 32 39.5 L16 39.5 Q14 39.5 14 38 Z" />
      <path d="M12 21 L36 21 L34 38 Q34 40 32 40 L16 40 Q14 40 14 38 Z" />
      <path d="M20 17 q2.5 -3 0 -6 M28 17 q2.5 -3 0 -6" />
    </>
  ),
  spectrophotometer: (
    <>
      <rect x="9" y="16" width="30" height="18" rx="3" />
      <rect className={LIQUID} stroke="none" x="13" y="20" width="11" height="10" rx="1.5" />
      <circle cx="31" cy="22" r="1.3" />
      <circle cx="35" cy="22" r="1.3" />
      <path d="M28 30 L36 30" />
    </>
  ),
  phMeter: (
    <>
      <rect x="10" y="14" width="17" height="13" rx="3" />
      <rect className={LIQUID} stroke="none" x="13" y="17" width="11" height="6" rx="1.2" />
      <path d="M27 20 L34 20 L34 40 M32.4 40 L35.6 40 L34 43 Z" />
    </>
  ),
  balance: (
    <>
      <path className={LIQUID} stroke="none" d="M27 35 L33 35 L33 38 L27 38 Z" />
      <path d="M13 34 L35 34 L33 40 L15 40 Z" />
      <path d="M17 27 Q24 31 31 27" />
      <path d="M24 31 L24 27" />
      <path d="M17 27 Q24 25 31 27" />
    </>
  ),
  thermometer: (
    <>
      <line className={LIQUID} stroke="currentColor" strokeWidth={2.2} x1="24" y1="34" x2="24" y2="14" />
      <circle className={LIQUID} stroke="none" cx="24" cy="35" r="3.2" />
      <path d="M21.5 10 A2.5 2.5 0 0 1 26.5 10 L26.5 31 A5 5 0 1 1 21.5 31 Z" />
      <path d="M27 15 L29 15 M27 19 L28.5 19 M27 23 L29 23 M27 27 L28.5 27" />
    </>
  ),
  fumeHood: (
    <>
      <rect x="9" y="10" width="30" height="30" rx="3" />
      <path d="M12 22 L36 22" />
      <path d="M21 22 L27 22" strokeWidth={2.4} />
      <path className={LIQUID} stroke="none" d="M21.5 31 L21.5 29 L26.5 29 L26.5 31 Z" />
      <path d="M21.5 27 L21.5 33 L26.5 33 L26.5 27" />
      <path d="M12 35 L36 35" />
    </>
  ),
  goggles: (
    <>
      <path d="M8 22 L11 20 M40 22 L37 20" />
      <rect x="10" y="19" width="12" height="11" rx="4" />
      <rect x="26" y="19" width="12" height="11" rx="4" />
      <path d="M22 24 Q24 22.5 26 24" />
    </>
  ),
  gloves: (
    <>
      <path className={LIQUID} stroke="none" d="M18 38 L31 38 L31 42 L18 42 Z" />
      <path d="M18 42 L18 30 Q18 26 22 26 L22 20 Q22 17.5 24 17.5 Q26 17.5 26 20 L26 26 L28 26 Q31 26 31 30 L31 42" />
      <path d="M18 38 L31 38" />
    </>
  ),
};

export function ApparatusIcon({ kind, className }: IconProps) {
  return <Frame className={className}>{ICONS[kind]}</Frame>;
}
