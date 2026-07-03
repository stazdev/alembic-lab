/**
 * Procedural lathe profiles for glassware (3D apparatus).
 *
 * Most labware is a surface of revolution, so we describe each vessel as a 2D
 * silhouette (radius vs. height) and revolve it with THREE.LatheGeometry. Each
 * profile traces the OUTER wall up, across the rim, and back DOWN the inner
 * wall to the floor — producing a hollow glass shell with real thickness.
 *
 * Pure geometry: no React, no materials.
 */
import { Vector2 } from "three";
import type { ApparatusIconKind } from "@/data/apparatus";

export type VesselShape = "beaker" | "cylinder" | "cone" | "tube" | "florence";

export interface VesselProfile {
  /** Full wall cross-section for the glass lathe (closed on the axis). */
  glass: Vector2[];
  /** Inner cavity cross-section, bottom → rim, used to build the liquid. */
  inner: Vector2[];
  height: number;
}

const WALL = 0.05;
const FLOOR = 0.06;
const LIQUID_INSET = 0.985; // keep liquid just inside the glass wall (no z-fighting)

function v(x: number, y: number): Vector2 {
  return new Vector2(x, y);
}

function arc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  segments: number,
): Vector2[] {
  const points: Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = a0 + (a1 - a0) * (i / segments);
    points.push(v(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return points;
}

function cupProfile(R: number, H: number): VesselProfile {
  return {
    glass: [
      v(0, 0),
      v(R, 0),
      v(R, H),
      v(R - WALL, H),
      v(R - WALL, FLOOR),
      v(0, FLOOR),
    ],
    inner: [v(0, FLOOR), v(R - WALL, FLOOR), v(R - WALL, H)],
    height: H,
  };
}

function coneProfile(): VesselProfile {
  const baseR = 0.8;
  const neckR = 0.26;
  const bodyTop = 1.15;
  const H = 1.7;
  return {
    glass: [
      v(0, 0),
      v(baseR, 0),
      v(neckR, bodyTop),
      v(neckR, H),
      v(neckR - WALL, H),
      v(neckR - WALL, bodyTop),
      v(baseR - WALL, FLOOR),
      v(0, FLOOR),
    ],
    inner: [
      v(0, FLOOR),
      v(baseR - WALL, FLOOR),
      v(neckR - WALL, bodyTop),
      v(neckR - WALL, H),
    ],
    height: H,
  };
}

function tubeProfile(r: number, H: number): VesselProfile {
  const innerR = r - WALL;
  return {
    glass: [
      ...arc(0, r, r, -Math.PI / 2, 0, 12),
      v(r, H),
      v(innerR, H),
      ...arc(0, r, innerR, 0, -Math.PI / 2, 12),
    ],
    inner: [...arc(0, r, innerR, -Math.PI / 2, 0, 12), v(innerR, H)],
    height: H,
  };
}

function florenceProfile(): VesselProfile {
  const bulbR = 0.72;
  const cy = 0.72;
  const neckR = 0.2;
  const H = 2.0;
  const joint = Math.acos(neckR / bulbR);
  const innerR = bulbR - WALL;
  const innerNeckR = neckR - WALL;
  const innerJoint = Math.acos(innerNeckR / innerR);
  return {
    glass: [
      ...arc(0, cy, bulbR, -Math.PI / 2, joint, 24),
      v(neckR, H),
      v(innerNeckR, H),
      ...arc(0, cy, innerR, innerJoint, -Math.PI / 2, 24),
    ],
    inner: [...arc(0, cy, innerR, -Math.PI / 2, innerJoint, 24), v(innerNeckR, H)],
    height: H,
  };
}

export function shapeForIcon(icon: ApparatusIconKind): VesselShape {
  switch (icon) {
    case "erlenmeyer":
      return "cone";
    case "testTube":
      return "tube";
    case "graduatedCylinder":
      return "cylinder";
    case "roundBottom":
    case "volumetricFlask":
      return "florence";
    default:
      return "beaker";
  }
}

export function getVesselProfile(icon: ApparatusIconKind): VesselProfile {
  switch (shapeForIcon(icon)) {
    case "cone":
      return coneProfile();
    case "tube":
      return tubeProfile(0.34, 1.9);
    case "cylinder":
      return cupProfile(0.44, 2.0);
    case "florence":
      return florenceProfile();
    default:
      return cupProfile(0.72, 1.45);
  }
}

/** Truncate the inner profile at the fill line and cap it to the axis. */
export function buildLiquidProfile(
  inner: Vector2[],
  fillFrac: number,
): Vector2[] {
  if (fillFrac <= 0 || inner.length < 2) return [];
  const ys = inner.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const topY = minY + (maxY - minY) * Math.min(1, fillFrac);

  const inset = (x: number) => (x <= 1e-4 ? 0 : x * LIQUID_INSET);
  const points: Vector2[] = [];

  for (let i = 0; i < inner.length; i++) {
    const p = inner[i];
    if (p.y <= topY + 1e-6) {
      points.push(v(inset(p.x), p.y));
    } else {
      const prev = inner[i - 1];
      if (prev && prev.y < topY) {
        const t = (topY - prev.y) / (p.y - prev.y);
        const x = prev.x + (p.x - prev.x) * t;
        points.push(v(inset(x), topY));
      }
      break;
    }
  }

  if (points.length < 2) return [];
  if (points[0].x > 1e-4) points.unshift(v(0, points[0].y));
  const last = points[points.length - 1];
  if (last.x > 1e-4) points.push(v(0, last.y));

  return points.length >= 3 ? points : [];
}

export const VESSEL_3D_ICONS: ApparatusIconKind[] = [
  "beaker",
  "erlenmeyer",
  "roundBottom",
  "testTube",
  "graduatedCylinder",
  "volumetricFlask",
];

export function is3DVessel(icon: ApparatusIconKind): boolean {
  return VESSEL_3D_ICONS.includes(icon);
}
