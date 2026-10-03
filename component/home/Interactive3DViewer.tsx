"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function DenimModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Auto rotate when user is not interacting
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.35;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* White Denim cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 2.2, 32]} />
        <meshStandardMaterial
          color="#F2EFE9"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Gold stitching loops */}
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[0.92, 0.015, 8, 48]} />
        <meshStandardMaterial color="#DFCFA8" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <torusGeometry args={[0.92, 0.015, 8, 48]} />
        <meshStandardMaterial color="#DFCFA8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Center pocket patch detail */}
      <mesh position={[0, 0, 0.91]}>
        <boxGeometry args={[0.4, 0.4, 0.02]} />
        <meshStandardMaterial color="#E5E0D5" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Interactive3DViewer() {
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden bg-transparent">
      {/* Canvas with explicit absolute sizing styles to prevent collapse */}
      <Canvas
        shadows
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 3.5], fov: 45 }}
      >
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[4, 5, 3]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, -4, -3]} intensity={0.5} />

        <DenimModel />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>

      {/* 3D Guide Overlay text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-center z-10">
        <span className="text-[9px] font-black tracking-[0.25em] text-[#B9965A] uppercase bg-black/80 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/5 shadow-md">
          DRAG TO EXPLORE 360°
        </span>
      </div>
    </div>
  );
}
