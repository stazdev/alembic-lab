"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";

/** One electron shell: a faint orbit ring with electrons that circle it. */
function Shell({
  radius,
  count,
  speed,
  electronColor,
}: {
  radius: number;
  count: number;
  speed: number;
  electronColor: string;
}) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += speed * delta;
  });

  const positions = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius];
      }),
    [count, radius],
  );

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.006, 10, 100]} />
        <meshBasicMaterial color="#cfc9b8" transparent opacity={0.55} />
      </mesh>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={electronColor}
            emissive={electronColor}
            emissiveIntensity={0.25}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Bohr / shell model of an atom: a category-colored nucleus with each electron
 * shell drawn from `shells` (electrons per principal level). Rings sit in the
 * XZ plane and rotate at their own pace; a slow camera orbit adds depth.
 */
export function AtomicModelScene({
  shells,
  color,
}: {
  shells: number[];
  color: string;
}) {
  const n = shells.length;
  const base = 0.62;
  const outer = 2.55;
  const step = n > 1 ? (outer - base) / (n - 1) : 0;

  return (
    <Canvas
      camera={{ position: [0, 1.7, 6.6], fov: 34 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} />

      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>

      {shells.map((count, i) => (
        <Shell
          key={i}
          radius={base + i * step}
          count={count}
          speed={0.55 - i * 0.05}
          electronColor="#1f1f1f"
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
