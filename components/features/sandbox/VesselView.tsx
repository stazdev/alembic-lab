"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ApparatusIconKind } from "@/data/apparatus";
import type { Appearance } from "@/lib/chemistry/resolve";

/*
 * Tier-1 volumetric liquid rendering (§1.2): a vessel silhouette with a liquid
 * whose height ∝ fill fraction, plus effects (bubbles, precipitate, steam) that
 * are driven entirely by the chemistry Appearance — never hard-coded per scene.
 */

type ShapeKey = "beaker" | "erlenmeyer" | "testTube" | "cylinder";

interface Shape {
  clipD: string;
  outline: ReactNode;
  interior: { x: number; width: number; top: number; bottom: number };
}

const SHAPES: Record<ShapeKey, Shape> = {
  beaker: {
    clipD: "M25 34 L25 114 Q25 118 29 118 L71 118 Q75 118 75 114 L75 34 Z",
    interior: { x: 25, width: 50, top: 36, bottom: 116 },
    outline: (
      <>
        <path d="M23 32 L24.5 115 Q25 119 29 119 L71 119 Q75 119 75.5 115 L77 32" />
        <path d="M20 32 L80 32" />
        <path d="M77 32 Q81 31 82.5 34" />
        <path d="M69 50 L75 50 M69 64 L75 64 M69 78 L75 78" />
      </>
    ),
  },
  erlenmeyer: {
    clipD:
      "M41 42 L41 58 L27 112 Q26 116 31 116 L69 116 Q74 116 73 112 L59 58 L59 42 Z",
    interior: { x: 26, width: 48, top: 46, bottom: 114 },
    outline: (
      <>
        <path d="M38 30 L38 57 L24 112 Q23 118 29 118 L71 118 Q77 118 76 112 L62 57 L62 30" />
        <path d="M36 30 L64 30" />
        <path d="M38 50 L62 50" />
      </>
    ),
  },
  testTube: {
    clipD: "M42 30 L42 108 A8 8 0 0 0 58 108 L58 30 Z",
    interior: { x: 42, width: 16, top: 32, bottom: 114 },
    outline: (
      <>
        <path d="M42 24 L42 108 A8 8 0 0 0 58 108 L58 24" />
        <path d="M40 24 L60 24" />
      </>
    ),
  },
  cylinder: {
    clipD: "M38 32 L38 116 L62 116 L62 32 Z",
    interior: { x: 38, width: 24, top: 34, bottom: 116 },
    outline: (
      <>
        <path d="M38 30 L38 116 L62 116 L62 30" />
        <path d="M36 30 L64 30" />
        <path d="M62 30 Q66 29 67 32" />
        <path d="M32 122 L68 122 M38 116 L34.5 122 M62 116 L65.5 122" />
        <path d="M56 46 L62 46 M56 60 L62 60 M56 74 L62 74 M56 88 L62 88" />
      </>
    ),
  },
};

function shapeFor(icon: ApparatusIconKind): ShapeKey {
  switch (icon) {
    case "erlenmeyer":
      return "erlenmeyer";
    case "testTube":
      return "testTube";
    case "graduatedCylinder":
      return "cylinder";
    default:
      return "beaker";
  }
}

interface VesselViewProps {
  iconKind: ApparatusIconKind;
  fillFrac: number;
  appearance: Appearance;
  heating: boolean;
}

export function VesselView({
  iconKind,
  fillFrac,
  appearance,
  heating,
}: VesselViewProps) {
  const rawId = useId();
  const clipId = `vclip-${rawId.replace(/:/g, "")}`;
  const reduced = useReducedMotion();

  const shape = SHAPES[shapeFor(iconKind)];
  const { interior } = shape;
  const cx = interior.x + interior.width / 2;
  const clampFrac = Math.max(0, Math.min(1, fillFrac));
  const liquidTopY =
    interior.bottom - clampFrac * (interior.bottom - interior.top);
  const hasLiquid = clampFrac > 0.004;

  const { liquidColor, liquidOpacity, precipitate, gasRate, boiling } =
    appearance;

  const bubbleCount = hasLiquid && gasRate > 0 && !reduced
    ? Math.round(2 + gasRate * 6)
    : 0;
  const precipCount = precipitate
    ? Math.min(14, Math.round(precipitate.amount / 2) + 4)
    : 0;

  return (
    <svg
      viewBox="0 0 100 140"
      className="h-full w-full text-ink"
      fill="none"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shape.clipD} />
        </clipPath>
      </defs>

      {/* Liquid */}
      {hasLiquid && (
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={0}
            width={100}
            initial={false}
            animate={{ y: liquidTopY, height: Math.max(0, 140 - liquidTopY) }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            fill={liquidColor}
            fillOpacity={liquidOpacity}
          />

          {/* Turbidity band for precipitates */}
          {precipitate && (
            <rect
              x={0}
              y={interior.bottom - 26}
              width={100}
              height={26}
              fill={precipitate.color}
              fillOpacity={0.18}
            />
          )}

          {/* Meniscus */}
          <motion.ellipse
            cx={cx}
            rx={interior.width / 2 - 1}
            ry={2.4}
            initial={false}
            animate={{ cy: liquidTopY }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            fill="#ffffff"
            fillOpacity={0.28}
          />

          {/* Precipitate particles settling at the bottom */}
          {precipitate &&
            Array.from({ length: precipCount }).map((_, i) => {
              const px = interior.x + 3 + ((i * 0.41 + 0.1) % 1) * (interior.width - 6);
              const py = interior.bottom - 2 - ((i * 0.27) % 1) * 18;
              const r = 1 + (i % 3) * 0.4;
              return (
                <motion.circle
                  key={`p-${i}`}
                  cx={px}
                  cy={py}
                  r={r}
                  fill={precipitate.color}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                />
              );
            })}

          {/* Rising gas bubbles */}
          {Array.from({ length: bubbleCount }).map((_, i) => {
            const bx = interior.x + 4 + ((i * 0.37 + 0.15) % 1) * (interior.width - 8);
            const r = 1 + (i % 3) * 0.5;
            const duration = 1.1 + (i % 4) * 0.25;
            const delay = (i * 0.23) % 1.4;
            return (
              <motion.circle
                key={`b-${i}`}
                cx={bx}
                r={r}
                fill="#ffffff"
                initial={{ cy: interior.bottom - 3, opacity: 0 }}
                animate={{
                  cy: [interior.bottom - 3, liquidTopY + 3],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </g>
      )}

      {/* Glass outline */}
      <g
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shape.outline}
      </g>

      {/* Steam when boiling */}
      {boiling && !reduced &&
        [-8, 0, 8].map((dx, i) => (
          <motion.path
            key={`steam-${i}`}
            d={`M${cx + dx} ${interior.top - 4} q 3 -5 0 -10 q -3 -5 0 -10`}
            stroke="#c4c1b6"
            strokeWidth={1.6}
            strokeLinecap="round"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 0.55, 0], y: [4, -8] }}
            transition={{
              duration: 1.8,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Heat waves when heating */}
      {heating &&
        !reduced &&
        [-7, 0, 7].map((dx, i) => (
          <motion.path
            key={`heat-${i}`}
            d={`M${cx + dx} 132 q 2.5 -3 0 -6`}
            stroke="#e79b3f"
            strokeWidth={1.6}
            strokeLinecap="round"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
    </svg>
  );
}
