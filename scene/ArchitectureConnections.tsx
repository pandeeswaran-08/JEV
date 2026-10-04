import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { damp } from '@/utils/math';

interface ArchitectureConnectionsProps {
  isExploded: boolean;
}

export const ArchitectureConnections: React.FC<ArchitectureConnectionsProps> = ({
  isExploded,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaleYRef = useRef<number>(1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = isExploded ? 2.25 : 1.0;
    scaleYRef.current = damp(scaleYRef.current, targetScale, 7.0, delta);
    groupRef.current.scale.set(1, scaleYRef.current, 1);
  });

  const cornerPositions: [number, number, number][] = [
    [-3.22, 0, -2.22],
    [3.22, 0, -2.22],
    [-3.22, 0, 2.22],
    [3.22, 0, 2.22],
  ];

  return (
    <group ref={groupRef}>
      {/* 4 Corner Struts */}
      {cornerPositions.map(([x, y, z], i) => (
        <group key={`corner-strut-${i}`} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 5.6, 8]} />
            <meshStandardMaterial
              color="#0d1b2a"
              emissive="#00D9FF"
              emissiveIntensity={0.25}
              metalness={0.9}
              roughness={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Signal Nodes along the strut */}
          {[-2.0, -0.7, 0.7, 2.0].map((ringY, rIdx) => (
            <mesh key={`ring-${rIdx}`} position={[0, ringY, 0]}>
              <torusGeometry args={[0.08, 0.02, 6, 12]} />
              <meshBasicMaterial
                color={
                  rIdx === 0
                    ? '#22C55E' // Layer 01 Green
                    : rIdx === 1
                    ? '#00D9FF' // Layer 02 Cyan
                    : rIdx === 2
                    ? '#8B5CF6' // Layer 03 Violet
                    : '#3B82F6' // Layer 04 Blue
                }
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Central Spinal Bus Conduit into JEV Decision Core */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 5.6, 12]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};
