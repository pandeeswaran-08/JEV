import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { damp } from '@/utils/math';

interface DataFlowProps {
  isExploded: boolean;
  particleCount: number;
  activeLayerId?: string | null;
}

export const DataFlow: React.FC<DataFlowProps> = ({
  isExploded,
  particleCount,
  activeLayerId,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const explodedLerpRef = useRef<number>(isExploded ? 1 : 0);

  const count = Math.min(800, Math.max(0, particleCount));

  // Generate particle flow points along vertical conduits and central spine
  const { positions, speeds, offsets, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const offs = new Float32Array(count);
    const sds = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Concentrate 60% of particles near the central JEV Core spine, 40% near corner pillars
      const isSpine = Math.random() < 0.6;
      let x = 0;
      let z = 0;

      if (isSpine) {
        // Near center spine with slight radial dispersion
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.6;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      } else {
        // Near one of 4 corners
        const cornerX = Math.random() > 0.5 ? 2.8 : -2.8;
        const cornerZ = Math.random() > 0.5 ? 1.8 : -1.8;
        x = cornerX + (Math.random() - 0.5) * 0.6;
        z = cornerZ + (Math.random() - 0.5) * 0.6;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = z;

      spd[i] = 0.5 + Math.random() * 0.6;
      offs[i] = Math.random();

      sds[i * 3] = x;
      sds[i * 3 + 1] = Math.random();
      sds[i * 3 + 2] = z;
    }

    return {
      positions: pos,
      speeds: spd,
      offsets: offs,
      seeds: sds,
    };
  }, [count]);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uExploded: { value: isExploded ? 1.0 : 0.0 },
      uSize: { value: 16.0 * (typeof window !== 'undefined' ? window.devicePixelRatio : 1.0) },
    };
  }, [isExploded]);

  useFrame((_, delta) => {
    if (!materialRef.current || count === 0) return;

    const targetExp = isExploded ? 1.0 : 0.0;
    explodedLerpRef.current = damp(explodedLerpRef.current, targetExp, 6.0, delta);

    materialRef.current.uniforms.uTime.value += delta;
    materialRef.current.uniforms.uExploded.value = explodedLerpRef.current;
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={count}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          count={count}
          array={offsets}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          count={count}
          array={seeds}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uExploded;
          uniform float uSize;
          attribute float aSpeed;
          attribute float aOffset;
          attribute vec3 aSeed;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            // Downward top-to-bottom cycle: Intent -> Context -> JEV Core -> Execution -> Result
            float cycle = fract(uTime * aSpeed * 0.28 + aOffset);

            float topY = mix(3.2, 6.5, uExploded);
            float botY = mix(-3.2, -6.5, uExploded);
            float currentY = mix(topY, botY, cycle);

            // Subtle spiral motion around the center
            float angle = uTime * 1.5 + aSeed.y * 6.28;
            float spiralX = sin(angle) * 0.15;
            float spiralZ = cos(angle) * 0.15;

            vec3 pos = vec3(aSeed.x + spiralX, currentY, aSeed.z + spiralZ);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Smooth fade at endpoints
            vAlpha = sin(cycle * 3.14159) * 0.95;

            // Point size with distance attenuation
            gl_PointSize = uSize * (1.0 / -mvPosition.z);

            // Multi-color spectrum based on vertical progress:
            // 0.00 - 0.25: Electric Blue #3B82F6 (Intent)
            // 0.25 - 0.50: Violet #8B5CF6 (Context)
            // 0.50 - 0.75: Cyan #00D9FF (JEV Decision Core)
            // 0.75 - 0.90: Green #22C55E (Execution)
            // 0.90 - 1.00: White #FFFFFF (Result)
            if (cycle < 0.25) {
              vColor = mix(vec3(0.23, 0.51, 0.96), vec3(0.55, 0.36, 0.96), cycle / 0.25);
            } else if (cycle < 0.50) {
              vColor = mix(vec3(0.55, 0.36, 0.96), vec3(0.00, 0.85, 1.00), (cycle - 0.25) / 0.25);
            } else if (cycle < 0.75) {
              vColor = mix(vec3(0.00, 0.85, 1.00), vec3(0.13, 0.77, 0.37), (cycle - 0.50) / 0.25);
            } else {
              vColor = mix(vec3(0.13, 0.77, 0.37), vec3(1.00, 1.00, 1.00), (cycle - 0.75) / 0.25);
            }
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            if (dist > 0.5) discard;

            float glow = smoothstep(0.5, 0.0, dist);
            gl_FragColor = vec4(vColor, glow * vAlpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
