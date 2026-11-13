"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  createEarthSurfaceTexture,
  createDetailedMantleTexture,
  createDetailedOuterCoreTexture,
  createDetailedInnerCoreTexture,
  createCutawayFaceTexture,
} from "@/lib/coreTextures";

interface EarthCore3DProps {
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  isolateMode: boolean;
  explosionFactor: number; // 0 to 1
  cutawayMode: "cutaway" | "full";
  autoRotate: boolean;
  cameraPreset?: "default" | "cutaway" | "core" | "pole";
}

function CoreModelScene({
  selectedLayerId,
  onSelectLayer,
  isolateMode,
  explosionFactor,
  cutawayMode,
  autoRotate,
}: EarthCore3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // 1. Instant procedural textures (guarantees immediate rendering on Frame 0)
  const proceduralEarthTex = useMemo(() => createEarthSurfaceTexture(), []);
  const upperMantleTex = useMemo(() => createDetailedMantleTexture(true), []);
  const lowerMantleTex = useMemo(() => createDetailedMantleTexture(false), []);
  const outerCoreTex = useMemo(() => createDetailedOuterCoreTexture(), []);
  const innerCoreTex = useMemo(() => createDetailedInnerCoreTexture(), []);
  const cutawayFaceTex = useMemo(() => createCutawayFaceTexture(), []);

  // 2. High-res NASA 2K texture upgrade
  const [nasaEarthTex, setNasaEarthTex] = useState<THREE.Texture | null>(null);
  const [nasaNormalTex, setNasaNormalTex] = useState<THREE.Texture | null>(null);
  const [cloudsTex, setCloudsTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/earth_atmos_2048.jpg", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setNasaEarthTex(t);
    });
    loader.load("/textures/earth_normal_2048.jpg", (t) => {
      setNasaNormalTex(t);
    });
    loader.load("/textures/earth_clouds_1024.png", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setCloudsTex(t);
    });
  }, []);

  // Radii proportional to true Earth dimensions
  const R_CRUST = 1.6;
  const R_UPPER_MANTLE = 1.58;
  const R_LOWER_MANTLE = 1.43;
  const R_OUTER_CORE = 0.88;
  const R_INNER_CORE = 0.35;

  // Staggered explosion offsets along explosion vector
  const zInnerCore = 0;
  const zOuterCore = explosionFactor * 0.9;
  const zLowerMantle = explosionFactor * 1.8;
  const zUpperMantle = explosionFactor * 2.7;
  const zCrust = explosionFactor * 3.6;

  // Cutaway: 270 deg (phiLength = 1.5 * PI) for quarter wedge cutout, or 360 deg
  const phiLength = cutawayMode === "cutaway" ? Math.PI * 1.5 : Math.PI * 2;

  // Subtle auto-rotation
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.05;
    }
  });

  const isSel = (id: string) => selectedLayerId === id;
  const isVis = (id: string) => !isolateMode || selectedLayerId === id;

  const currentEarthMap = nasaEarthTex || proceduralEarthTex;

  return (
    <group ref={groupRef} rotation={[0.25, -0.65, 0]}>
      {/* Central Core Thermal PointLight */}
      <pointLight position={[0, 0, 0]} intensity={3.5} color="#fef08a" distance={10} />

      {/* 1. INNER CORE (Lõi trong) */}
      {isVis("inner-core") && (
        <group position={[0, 0, zInnerCore]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer("inner-core");
            }}
          >
            <sphereGeometry args={[R_INNER_CORE, 48, 48, 0, phiLength]} />
            <meshStandardMaterial
              map={innerCoreTex}
              emissive="#fef08a"
              emissiveIntensity={isSel("inner-core") ? 1.0 : 0.45}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Thermal radiant glow aura */}
          <mesh scale={[1.25, 1.25, 1.25]}>
            <sphereGeometry args={[R_INNER_CORE, 32, 32]} />
            <meshBasicMaterial
              color="#facc15"
              transparent
              opacity={isSel("inner-core") ? 0.45 : 0.22}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* 2. OUTER CORE (Lõi ngoài) */}
      {isVis("outer-core") && (
        <group position={[0, 0, zOuterCore]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer("outer-core");
            }}
          >
            <sphereGeometry args={[R_OUTER_CORE, 64, 64, 0, phiLength]} />
            <meshStandardMaterial
              map={outerCoreTex}
              emissive="#ea580c"
              emissiveIntensity={isSel("outer-core") ? 0.8 : 0.4}
              roughness={0.3}
              metalness={0.5}
              side={explosionFactor > 0.05 ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>
        </group>
      )}

      {/* 3. LOWER MANTLE (Manti dưới) */}
      {isVis("lower-mantle") && (
        <group position={[0, 0, zLowerMantle]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer("lower-mantle");
            }}
          >
            <sphereGeometry args={[R_LOWER_MANTLE, 64, 64, 0, phiLength]} />
            <meshStandardMaterial
              map={lowerMantleTex}
              emissive="#7f1d1d"
              emissiveIntensity={isSel("lower-mantle") ? 0.75 : 0.3}
              roughness={0.7}
              side={explosionFactor > 0.05 ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>
        </group>
      )}

      {/* 4. UPPER MANTLE (Manti trên) */}
      {isVis("upper-mantle") && (
        <group position={[0, 0, zUpperMantle]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer("upper-mantle");
            }}
          >
            <sphereGeometry args={[R_UPPER_MANTLE, 64, 64, 0, phiLength]} />
            <meshStandardMaterial
              map={upperMantleTex}
              emissive="#b45309"
              emissiveIntensity={isSel("upper-mantle") ? 0.75 : 0.25}
              roughness={0.6}
              side={explosionFactor > 0.05 ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>
        </group>
      )}

      {/* 5. CRUST (Vỏ Trái Đất) */}
      {isVis("crust") && (
        <group position={[0, 0, zCrust]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer("crust");
            }}
          >
            <sphereGeometry args={[R_CRUST, 64, 64, 0, phiLength]} />
            <meshStandardMaterial
              map={currentEarthMap}
              normalMap={nasaNormalTex || undefined}
              normalScale={new THREE.Vector2(0.8, 0.8)}
              roughness={0.5}
              metalness={0.1}
              side={explosionFactor > 0.05 ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>

          {/* Dynamic Clouds Layer */}
          {cloudsTex && (
            <mesh ref={cloudsRef} scale={[1.008, 1.008, 1.008]}>
              <sphereGeometry args={[R_CRUST, 48, 48, 0, phiLength]} />
              <meshStandardMaterial
                map={cloudsTex}
                transparent
                opacity={0.36}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Atmospheric Glow Rim */}
          <mesh scale={[1.035, 1.035, 1.035]}>
            <sphereGeometry args={[R_CRUST, 32, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* Semicircular Solid Cutaway Face Caps (Capping both vertical cuts cleanly) */}
      {cutawayMode === "cutaway" && explosionFactor < 0.08 && (
        <group>
          {/* Plane 1: at phi = 0 */}
          <mesh rotation={[0, 0, 0]}>
            <circleGeometry args={[R_CRUST, 64, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial
              map={cutawayFaceTex}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Plane 2: at phi = 1.5 * PI (rotated 90 deg) */}
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[R_CRUST, 64, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial
              map={cutawayFaceTex}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function EarthCore3D({
  selectedLayerId,
  onSelectLayer,
  isolateMode,
  explosionFactor,
  cutawayMode,
  autoRotate,
  cameraPreset = "default",
}: EarthCore3DProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Smoothly set camera preset positions
  useEffect(() => {
    if (!controlsRef.current) return;
    if (cameraPreset === "default") {
      controlsRef.current.object.position.set(3.2, 1.8, 4.6);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === "cutaway") {
      controlsRef.current.object.position.set(2.4, 0.9, 3.4);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === "core") {
      controlsRef.current.object.position.set(1.2, 0.5, 1.8);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === "pole") {
      controlsRef.current.object.position.set(0.1, 5.2, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  }, [cameraPreset]);

  return (
    <Canvas
      camera={{ position: [3.2, 1.8, 4.6], fov: 40 }}
      className="w-full h-full"
    >
      {/* Background Deep Space Starfield */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Sun Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[12, 8, 10]} intensity={2.2} castShadow />
      <directionalLight position={[-10, -6, -8]} intensity={0.45} color="#38bdf8" />

      {/* Smooth OrbitControls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.8}
        maxDistance={12.0}
        rotateSpeed={0.8}
      />

      <CoreModelScene
        selectedLayerId={selectedLayerId}
        onSelectLayer={onSelectLayer}
        isolateMode={isolateMode}
        explosionFactor={explosionFactor}
        cutawayMode={cutawayMode}
        autoRotate={autoRotate}
      />
    </Canvas>
  );
}
