"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";

function columnHeight(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return 1.1 + (value % 97) / 97;
}

function PaletteColumns({ colors }: { colors: string[] }) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += delta * 0.3;
    group.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {colors.map((color, index) => {
        const height = columnHeight(color);
        return (
          <RoundedBox
            key={color}
            args={[0.9, height, 0.9]}
            radius={0.1}
            position={[(index - (colors.length - 1) / 2) * 1.25, height / 2 - 1.1, 0]}
          >
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
          </RoundedBox>
        );
      })}
    </group>
  );
}

export function PaletteScene({ colors }: { colors: string[] }) {
  return (
    <div className="h-64 overflow-hidden rounded-xl border bg-muted/30">
      <Canvas camera={{ position: [0, 2, 7.5], fov: 36 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} />
        <PaletteColumns colors={colors} />
      </Canvas>
    </div>
  );
}
