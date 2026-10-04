import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraController } from '@/scene/CameraController';
import { JEVLayer } from '@/scene/JEVLayer';
import { DataFlow } from '@/scene/DataFlow';
import { ArchitectureConnections } from '@/scene/ArchitectureConnections';
import {
  GestureState,
  JEVArchitectureConfig,
  JEVComponent,
  PerformanceState,
  ViewMode,
} from '@/types/architecture';
import { damp } from '@/utils/math';

interface ArchitectureSceneProps {
  activeConfig: JEVArchitectureConfig;
  viewMode: ViewMode;
  gestureState: GestureState;
  performanceState: PerformanceState;
  selectedLayerId: string | null;
  selectedComponent: JEVComponent | null;
  onSelectComponent: (layerId: string, component: JEVComponent) => void;
  onSelectLayer: (layerId: string) => void;
  onRecordFrame: (deltaSeconds: number) => void;
  resetSignal: number;
}

const SceneContent: React.FC<ArchitectureSceneProps> = ({
  activeConfig,
  viewMode,
  gestureState,
  performanceState,
  selectedLayerId,
  selectedComponent,
  onSelectComponent,
  onSelectLayer,
  onRecordFrame,
  resetSignal,
}) => {
  const mainGroupRef = useRef<THREE.Group>(null);

  // Performance frame hook & smooth hand gesture rotation
  useFrame((_, delta) => {
    onRecordFrame(delta);

    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y = damp(
        mainGroupRef.current.rotation.y,
        gestureState.rotationY,
        8.0,
        delta
      );
      mainGroupRef.current.rotation.x = damp(
        mainGroupRef.current.rotation.x,
        gestureState.rotationX,
        8.0,
        delta
      );
    }
  });

  const isExploded = viewMode === 'EXPLODED';

  return (
    <>
      {/* Smooth Cinematic Camera Controls */}
      <CameraController
        resetSignal={resetSignal}
        selectedLayerId={selectedLayerId}
        isExploded={isExploded}
      />

      {/* Systems Architecture Laboratory Lighting */}
      <ambientLight intensity={0.65} color="#dbeafe" />
      <directionalLight position={[12, 16, 10]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-12, -8, -10]} intensity={0.4} color="#00D9FF" />
      <pointLight position={[0, -0.8, 0]} intensity={2.0} distance={9} color="#00D9FF" />

      {/* Technical Grid Plane */}
      <gridHelper
        args={[36, 36, '#1e293b', '#070c18']}
        position={[0, isExploded ? -6.8 : -4.2, 0]}
      />

      {/* Main 3D Architecture Stack */}
      <group ref={mainGroupRef}>
        {/* 4 JEV Architecture Layers */}
        {activeConfig.layers.map((layer) => (
          <JEVLayer
            key={layer.id}
            layer={layer}
            isExploded={isExploded}
            isSelected={selectedLayerId === layer.id}
            isAnySelected={selectedLayerId !== null}
            selectedComponent={selectedComponent}
            onSelectComponent={onSelectComponent}
            onSelectLayer={onSelectLayer}
          />
        ))}

        {/* Vertical Bus Struts & Central Spine */}
        <ArchitectureConnections isExploded={isExploded} />

        {/* Visual Animated Data Flow with Multi-Layer Color Spectrum */}
        <DataFlow
          isExploded={isExploded}
          particleCount={performanceState.particleCount}
          activeLayerId={selectedLayerId}
        />
      </group>
    </>
  );
};

export const ArchitectureScene: React.FC<ArchitectureSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [9.5, 6, 11.5], fov: 45 }}
        dpr={props.performanceState.dpr}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          depth: true,
        }}
        className="w-full h-full"
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
