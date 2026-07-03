"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import type { ApparatusIconKind } from "@/data/apparatus";
import { GlassVessel } from "./GlassVessel";

interface VesselSceneProps {
  iconKind: ApparatusIconKind;
  fillFrac: number;
  liquidColor: string;
  interactive?: boolean;
}

/**
 * WebGL scene for a single glass vessel. Lighting comes from a procedural
 * environment built from Lightformers (no external HDR — CSP-safe, offline).
 */
export function VesselScene({
  iconKind,
  fillFrac,
  liquidColor,
  interactive = true,
}: VesselSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4.4], fov: 28 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />

      <GlassVessel
        iconKind={iconKind}
        fillFrac={fillFrac}
        liquidColor={liquidColor}
      />

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.28}
        blur={2.6}
        scale={5}
        far={3}
      />

      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 3, 3]}
          scale={[8, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 1, 2]}
          scale={[3, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1}
          position={[4, 2, -2]}
          scale={[3, 4, 1]}
        />
      </Environment>

      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.6}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.9}
        />
      )}
    </Canvas>
  );
}
