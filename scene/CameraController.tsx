import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { damp } from '@/utils/math';

interface CameraControllerProps {
  resetSignal?: number;
  selectedLayerId?: string | null;
  isExploded?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  resetSignal = 0,
  selectedLayerId = null,
  isExploded = false,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  // Desired camera position and target
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(9, 6, 11));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Compute desired camera and target coordinates when selection or exploded changes
  useEffect(() => {
    if (!selectedLayerId) {
      // Overview
      targetCamPos.current.set(9.5, isExploded ? 7.5 : 5.5, 11.5);
      targetLookAt.current.set(0, 0, 0);
    } else {
      let targetY = 0;
      switch (selectedLayerId) {
        case 'jev-layer-04':
          targetY = isExploded ? 5.4 : 2.4;
          targetCamPos.current.set(7.5, targetY + 1.8, 8.5);
          targetLookAt.current.set(0, targetY, 0);
          break;
        case 'jev-layer-03':
          targetY = isExploded ? 1.8 : 0.8;
          targetCamPos.current.set(7.5, targetY + 1.5, 8.5);
          targetLookAt.current.set(0, targetY, 0);
          break;
        case 'jev-layer-02':
          targetY = isExploded ? -1.8 : -0.8;
          targetCamPos.current.set(7.0, targetY + 1.4, 7.8);
          targetLookAt.current.set(0, targetY, 0);
          break;
        case 'jev-layer-01':
          targetY = isExploded ? -5.4 : -2.4;
          targetCamPos.current.set(7.5, targetY + 1.5, 8.5);
          targetLookAt.current.set(0, targetY, 0);
          break;
        default:
          targetCamPos.current.set(9.5, 6, 11.5);
          targetLookAt.current.set(0, 0, 0);
      }
    }
  }, [selectedLayerId, isExploded]);

  // Reset signal listener
  useEffect(() => {
    if (resetSignal > 0 && controlsRef.current) {
      targetCamPos.current.set(9.5, 6, 11.5);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [resetSignal]);

  // Smooth cinematic camera damping
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Smoothly interpolate target lookAt point
    controlsRef.current.target.x = damp(controlsRef.current.target.x, targetLookAt.current.x, 4.0, delta);
    controlsRef.current.target.y = damp(controlsRef.current.target.y, targetLookAt.current.y, 4.0, delta);
    controlsRef.current.target.z = damp(controlsRef.current.target.z, targetLookAt.current.z, 4.0, delta);

    // Smoothly interpolate camera position
    camera.position.x = damp(camera.position.x, targetCamPos.current.x, 3.5, delta);
    camera.position.y = damp(camera.position.y, targetCamPos.current.y, 3.5, delta);
    camera.position.z = damp(camera.position.z, targetCamPos.current.z, 3.5, delta);

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={6}
      maxDistance={26}
      minPolarAngle={Math.PI / 10}
      maxPolarAngle={Math.PI / 2 + 0.15}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
    />
  );
};
