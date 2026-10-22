"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";

interface RbwShowroomStageProps {
  accentColor?: string;
  isPaused?: boolean;
}

export function RbwShowroomStage({ accentColor = "#B9965A", isPaused = false }: RbwShowroomStageProps) {
  const haloRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (haloRef.current && !isPaused) {
      haloRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* ============================================================ */}
      {/* 1. TOP OVERHEAD HALO FIXTURE (Floating cleanly above crown)  */}
      {/* ============================================================ */}
      <group ref={haloRef} position={[0, 1.20, 0.45]}>
        {/* Outer Dark Metallic Housing Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.90, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#141418"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Inner Glowing Emissive Light Core */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.86, 0.012, 16, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={accentColor}
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>

        {/* Minimalist Center Acoustic Cap */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.85, 48]} />
          <meshStandardMaterial
            color="#08080a"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>

        {/* Downward Focused Illumination from Overhead Halo */}
        <pointLight
          position={[0, -0.15, 0]}
          color="#ffffff"
          intensity={3.0}
          distance={3.5}
        />
        {/* Soft Accent Downlight */}
        <pointLight
          position={[0, -0.1, 0]}
          color={accentColor}
          intensity={2.2}
          distance={3.2}
        />
      </group>

      {/* ============================================================ */}
      {/* 2. FLOATING DARK OBSIDIAN REFLECTIVE PEDESTAL                */}
      {/* ============================================================ */}
      <group position={[0, -0.895, 0.45]}>
        {/* Sleek Floating Metallic Pedestal Bevel */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.98, 1.04, 0.03, 64]} />
          <meshStandardMaterial
            color="#0f0f13"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>

        {/* Top Dark Polished Glass Surface with Local Reflection */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.95, 64]} />
          <MeshReflectorMaterial
            blur={[200, 50]}
            resolution={256}
            mixBlur={1}
            mixStrength={16}
            roughness={0.35}
            depthScale={1.0}
            minDepthThreshold={0.2}
            maxDepthThreshold={1.2}
            color="#09090d"
            metalness={0.85}
            mirror={0.45}
          />
        </mesh>

        {/* Perimeter Neon Edge Light (Ultra-fine illuminated contour) */}
        <mesh position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.94, 0.955, 64]} />
          <meshBasicMaterial
            color={accentColor}
            toneMapped={false}
          />
        </mesh>

        {/* Soft Upward Uplight from Pedestal */}
        <pointLight
          position={[0, 0.15, 0]}
          color={accentColor}
          intensity={1.8}
          distance={1.6}
        />
      </group>

      {/* ============================================================ */}
      {/* 3. ATMOSPHERIC ATELIER DUST SPARKLES (Floating around stage) */}
      {/* ============================================================ */}
      <Sparkles
        count={24}
        scale={[3.0, 2.0, 3.0]}
        position={[0, 0.3, 0.45]}
        size={1.2}
        speed={0.3}
        opacity={0.3}
        color={accentColor}
      />
    </group>
  );
}
