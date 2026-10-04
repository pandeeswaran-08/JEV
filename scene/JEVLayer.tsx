import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { JEVComponent, JEVLayerData } from '@/types/architecture';
import { damp } from '@/utils/math';

interface JEVLayerProps {
  layer: JEVLayerData;
  isExploded: boolean;
  isSelected: boolean;
  isAnySelected: boolean;
  selectedComponent: JEVComponent | null;
  onSelectComponent: (layerId: string, component: JEVComponent) => void;
  onSelectLayer: (layerId: string) => void;
}

export const JEVLayer: React.FC<JEVLayerProps> = ({
  layer,
  isExploded,
  isSelected,
  isAnySelected,
  selectedComponent,
  onSelectComponent,
  onSelectLayer,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRingsRef = useRef<THREE.Group>(null);
  const [hoveredComponentIndex, setHoveredComponentIndex] = useState<number | null>(null);

  const isCore = layer.id === 'jev-layer-02';
  const targetY = isExploded ? layer.explodedYOffset : layer.yOffset;

  // Base geometries
  const baseBoxGeometry = useMemo(
    () => new THREE.BoxGeometry(layer.width, layer.height, layer.depth),
    [layer.width, layer.height, layer.depth]
  );

  const baseEdgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(baseBoxGeometry),
    [baseBoxGeometry]
  );

  // Component geometry
  const componentCount = layer.components.length;
  const compBoxGeometry = useMemo(() => new THREE.BoxGeometry(1.2, 0.22, 1.4), []);
  const compEdgesGeometry = useMemo(() => new THREE.EdgesGeometry(compBoxGeometry), [compBoxGeometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Frame-rate independent smooth dampening to target exploded/normal Y
    groupRef.current.position.y = damp(groupRef.current.position.y, targetY, 7.5, delta);

    // Rotate core concentric rings
    if (coreRingsRef.current) {
      coreRingsRef.current.rotation.y += delta * 0.45;
      coreRingsRef.current.rotation.z += delta * 0.22;
    }
  });

  const layerOpacity = isSelected ? 0.98 : isAnySelected ? 0.45 : 0.88;
  const emissiveIntensity = isSelected ? (isCore ? 0.75 : 0.5) : isAnySelected ? 0.08 : (isCore ? 0.4 : 0.2);

  return (
    <group ref={groupRef} position={[0, layer.yOffset, 0]}>
      {/* Floating 3D Layer Title in Exploded View (Section 12 requirement) */}
      {isExploded && (
        <Html
          position={[-layer.width / 2 - 0.4, layer.height / 2 + 0.35, 0]}
          center
          distanceFactor={18}
          className="pointer-events-none select-none"
        >
          <div
            className="px-3 py-1.5 rounded-lg backdrop-blur-md bg-[#050816dd] border whitespace-nowrap shadow-2xl font-serif"
            style={{
              borderColor: `${layer.color}80`,
              boxShadow: `0 0 16px ${layer.glowColor}40`,
            }}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest block text-slate-400">
              LAYER {layer.layerNumber}
            </span>
            <span
              className="text-xs md:text-sm font-bold tracking-wide"
              style={{ color: layer.color }}
            >
              {layer.title}
            </span>
          </div>
        </Html>
      )}

      {/* Base Layer Block Deck */}
      <mesh
        geometry={baseBoxGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer(layer.id);
        }}
      >
        <meshStandardMaterial
          color={isSelected ? '#0c162c' : '#070c18'}
          roughness={0.2}
          metalness={0.9}
          emissive={layer.color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={layerOpacity}
        />
      </mesh>

      {/* Layer Wireframe Accent Edges */}
      <lineSegments geometry={baseEdgesGeometry}>
        <lineBasicMaterial
          color={isSelected ? '#ffffff' : layer.glowColor}
          transparent
          opacity={isSelected ? 1.0 : isAnySelected ? 0.35 : 0.75}
        />
      </lineSegments>

      {/* JEV DECISION CORE SPECIAL 3D STRUCTURE (Section 6 requirement) */}
      {isCore && (
        <group ref={coreRingsRef} position={[0, 0, 0]}>
          {/* Inner Glowing Cyan Energy Core */}
          <mesh>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial
              color="#00D9FF"
              emissive="#00D9FF"
              emissiveIntensity={isSelected ? 1.3 : 0.9}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Central 3D Core Labels (Section 6) */}
          <Html position={[0, 0, 0]} center distanceFactor={14} className="pointer-events-none select-none">
            <div className="text-center font-serif py-1 px-2 rounded backdrop-blur-sm bg-black/60 border border-cyan-400/50 shadow-2xl">
              <div className="text-sm font-black tracking-widest text-[#00D9FF] leading-tight">
                JEV
              </div>
              <div className="text-[9px] font-bold tracking-wider text-white uppercase whitespace-nowrap">
                DECISION CORE
              </div>
            </div>
          </Html>

          {/* Core Concentric Rings with Cyan Illumination */}
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.4, 0.038, 12, 48]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.85} />
          </mesh>

          <mesh rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
            <torusGeometry args={[1.8, 0.028, 12, 48]} />
            <meshBasicMaterial color="#67E8F9" transparent opacity={0.7} />
          </mesh>

          <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
            <torusGeometry args={[2.2, 0.022, 12, 48]} />
            <meshBasicMaterial color="#06B6D4" transparent opacity={0.55} />
          </mesh>
        </group>
      )}

      {/* Floating Core Pipeline Sequence in Exploded View (Section 6: INPUT -> EVALUATION -> DECISION -> CONFIDENCE) */}
      {isCore && isExploded && (
        <Html position={[layer.width / 2 + 0.4, 0, 0]} center distanceFactor={16} className="pointer-events-none select-none">
          <div className="p-2.5 rounded-xl backdrop-blur-md bg-[#050816e0] border border-cyan-500/50 shadow-2xl font-serif text-[10px] space-y-1 text-slate-300">
            <div className="font-bold text-cyan-300 uppercase tracking-widest border-b border-slate-800 pb-1 text-center">
              CORE EVALUATION
            </div>
            <div className="text-center font-bold text-white">INPUT</div>
            <div className="text-center text-cyan-400 font-sans font-bold">↓</div>
            <div className="text-center font-bold text-white">EVALUATION</div>
            <div className="text-center text-cyan-400 font-sans font-bold">↓</div>
            <div className="text-center font-bold text-white">DECISION</div>
            <div className="text-center text-cyan-400 font-sans font-bold">↓</div>
            <div className="text-center font-bold text-white">CONFIDENCE</div>
          </div>
        </Html>
      )}

      {/* Corner Mounting Studs with Layer Glow */}
      {[
        [-layer.width / 2 + 0.18, -layer.depth / 2 + 0.18],
        [layer.width / 2 - 0.18, -layer.depth / 2 + 0.18],
        [-layer.width / 2 + 0.18, layer.depth / 2 - 0.18],
        [layer.width / 2 - 0.18, layer.depth / 2 - 0.18],
      ].map(([cx, cz], i) => (
        <mesh key={`pin-${i}`} position={[cx, 0, cz]}>
          <cylinderGeometry args={[0.08, 0.08, layer.height + 0.12, 8]} />
          <meshStandardMaterial
            color={layer.color}
            emissive={layer.color}
            emissiveIntensity={isSelected ? 0.85 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Internal Architectural Components on the Layer Deck */}
      {layer.components.map((comp, idx) => {
        const cols = Math.min(componentCount, 4);
        const colIdx = idx % cols;
        const rowIdx = Math.floor(idx / cols);

        const xSpan = (layer.width - 1.8) / Math.max(1, cols - 1);
        const zSpan = componentCount > 4 ? 1.9 : 0;

        let posX = componentCount === 1 ? 0 : -((cols - 1) * xSpan) / 2 + colIdx * xSpan;
        let posZ = componentCount > 4 ? (rowIdx === 0 ? -1.1 : 1.1) : 0;

        if (isCore) {
          // Push components radially outward to leave space for central sphere
          const angle = (idx / componentCount) * Math.PI * 2;
          posX = Math.cos(angle) * 2.3;
          posZ = Math.sin(angle) * 1.5;
        }

        const posY = layer.height / 2 + 0.11;
        const isCompSelected = isSelected && selectedComponent?.name === comp.name;
        const isHovered = hoveredComponentIndex === idx;

        return (
          <group
            key={comp.name}
            position={[posX, posY, posZ]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredComponentIndex(idx);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredComponentIndex(null);
              document.body.style.cursor = 'auto';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent(layer.id, comp);
            }}
          >
            {/* Component Chassis */}
            <mesh geometry={compBoxGeometry}>
              <meshStandardMaterial
                color={isCompSelected ? '#162b4d' : isHovered ? '#11223b' : '#091222'}
                metalness={0.85}
                roughness={0.25}
                emissive={isCompSelected ? layer.color : isHovered ? layer.glowColor : '#000000'}
                emissiveIntensity={isCompSelected ? 0.75 : isHovered ? 0.4 : 0.08}
              />
            </mesh>

            {/* Component Edges */}
            <lineSegments geometry={compEdgesGeometry}>
              <lineBasicMaterial
                color={isCompSelected ? '#ffffff' : isHovered ? layer.glowColor : layer.color}
                transparent
                opacity={isCompSelected ? 1.0 : isHovered ? 0.85 : 0.5}
              />
            </lineSegments>

            {/* Glowing Activity Node */}
            <mesh position={[0.42, 0.12, 0.48]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial
                color={isCompSelected ? '#ffffff' : layer.color}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
