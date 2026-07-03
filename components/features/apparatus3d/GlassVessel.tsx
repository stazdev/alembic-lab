"use client";

import { useMemo } from "react";
import { DoubleSide } from "three";
import type { ApparatusIconKind } from "@/data/apparatus";
import { getVesselProfile, buildLiquidProfile } from "@/lib/three/vesselProfiles";

interface GlassVesselProps {
  iconKind: ApparatusIconKind;
  fillFrac: number;
  liquidColor: string;
  liquidOpacity?: number;
}

/**
 * A single lathe-revolved glass vessel with a dynamic liquid mesh inside.
 * Glass uses a physically based transmissive material; the liquid geometry is
 * rebuilt from the inner profile whenever the fill fraction changes.
 */
export function GlassVessel({
  iconKind,
  fillFrac,
  liquidColor,
  liquidOpacity = 0.85,
}: GlassVesselProps) {
  const profile = useMemo(() => getVesselProfile(iconKind), [iconKind]);
  const liquidPoints = useMemo(
    () => buildLiquidProfile(profile.inner, fillFrac),
    [profile, fillFrac],
  );
  const centerY = -profile.height / 2;
  const showLiquid = fillFrac > 0.01 && liquidPoints.length >= 3;

  return (
    <group position={[0, centerY, 0]}>
      <mesh castShadow>
        <latheGeometry args={[profile.glass, 72]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.6}
          roughness={0.06}
          ior={1.48}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.4}
          transparent
          side={DoubleSide}
        />
      </mesh>

      {showLiquid && (
        <mesh>
          <latheGeometry args={[liquidPoints, 72]} />
          <meshPhysicalMaterial
            color={liquidColor}
            roughness={0.18}
            transmission={0.25}
            ior={1.34}
            transparent
            opacity={liquidOpacity}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
