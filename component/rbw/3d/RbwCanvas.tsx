"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { RbwOrbitCarousel, CarouselItemData } from "./RbwOrbitCarousel";

type RbwAtmosphereKey = "raw" | "black" | "white";

interface LightPreset {
  ambient: number;
  key: number;
  keyColor: string;
  fill: number;
  fillColor: string;
  rim: number;
  rimColor: string;
  accent: number;
  accentColor: string;
}

// Showroom lighting per wash. WHITE gets a slightly warmer, calmer key (so the
// denim keeps its weave instead of clipping) and a brighter cool rim for silhouette.
const LIGHT_PRESETS: Record<RbwAtmosphereKey, LightPreset> = {
  raw: {
    ambient: 0.9, key: 2.8, keyColor: "#ffffff",
    fill: 1.2, fillColor: "#bfdbfe",
    rim: 3.8, rimColor: "#ffffff",
    accent: 1.6, accentColor: "#d9bd8a",
  },
  black: {
    ambient: 0.85, key: 3.1, keyColor: "#fff6ee",
    fill: 1.0, fillColor: "#e8cfd4",
    rim: 3.8, rimColor: "#ffffff",
    accent: 1.6, accentColor: "#c9a48f",
  },
  white: {
    ambient: 0.8, key: 2.45, keyColor: "#fff4e2",
    fill: 1.0, fillColor: "#c4d6f2",
    rim: 3.4, rimColor: "#ffffff",
    accent: 1.2, accentColor: "#fff1d8",
  },
};

/**
 * Lights that glide toward the active wash's preset (~1s), so switching
 * RAW → BLACK → WHITE re-lights the room instead of snapping.
 */
function CinematicLights({
  atmosphere,
  reducedMotion,
}: {
  atmosphere: RbwAtmosphereKey;
  reducedMotion: boolean;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const accentRef = useRef<THREE.PointLight>(null);

  const target = useMemo(() => {
    const p = LIGHT_PRESETS[atmosphere];
    return {
      p,
      key: new THREE.Color(p.keyColor),
      fill: new THREE.Color(p.fillColor),
      rim: new THREE.Color(p.rimColor),
      accent: new THREE.Color(p.accentColor),
    };
  }, [atmosphere]);

  useFrame((_, delta) => {
    const rate = reducedMotion ? 20 : 3.2;
    const a = 1 - Math.exp(-rate * delta);
    const { p } = target;
    const damp = (cur: number, to: number) => THREE.MathUtils.lerp(cur, to, a);

    if (ambientRef.current) ambientRef.current.intensity = damp(ambientRef.current.intensity, p.ambient);
    if (keyRef.current) {
      keyRef.current.intensity = damp(keyRef.current.intensity, p.key);
      keyRef.current.color.lerp(target.key, a);
    }
    if (fillRef.current) {
      fillRef.current.intensity = damp(fillRef.current.intensity, p.fill);
      fillRef.current.color.lerp(target.fill, a);
    }
    if (rimRef.current) {
      rimRef.current.intensity = damp(rimRef.current.intensity, p.rim);
      rimRef.current.color.lerp(target.rim, a);
    }
    if (accentRef.current) {
      accentRef.current.intensity = damp(accentRef.current.intensity, p.accent);
      accentRef.current.color.lerp(target.accent, a);
    }
  });

  const start = LIGHT_PRESETS.raw;
  return (
    <>
      <ambientLight ref={ambientRef} intensity={start.ambient} />
      {/* key: front/above, slightly camera-right */}
      <directionalLight ref={keyRef} position={[2.5, 4.5, 3.8]} intensity={start.key} color={start.keyColor} />
      {/* fill: soft, cool, camera-left */}
      <directionalLight ref={fillRef} position={[-3, 2.5, 2.5]} intensity={start.fill} color={start.fillColor} />
      {/* rim: from behind/above to carve the silhouette */}
      <directionalLight ref={rimRef} position={[0, 4.2, -3.0]} intensity={start.rim} color={start.rimColor} />
      <pointLight ref={accentRef} position={[0, 0.6, 2.2]} intensity={start.accent} color={start.accentColor} distance={6} />
    </>
  );
}

interface RbwCanvasProps {
  items: CarouselItemData[];
  activeItem: CarouselItemData;
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  autoRotate: boolean;
  isInspecting?: boolean;
  setIsInspecting?: (inspecting: boolean) => void;
  rotationStep?: number;
  /** Opt-in premium showroom presentation (used by /stores/rbw only) */
  cinematic?: boolean;
  atmosphere?: RbwAtmosphereKey;
  reducedMotion?: boolean;
  onHoverIndex?: (index: number | null) => void;
}

export default function RbwCanvas({
  items,
  activeItem,
  activeIndex,
  onSelectIndex,
  autoRotate,
  isInspecting = false,
  setIsInspecting,
  rotationStep = 0,
  cinematic = false,
  atmosphere = "raw",
  reducedMotion = false,
  onHoverIndex,
}: RbwCanvasProps) {
  const accentColor = activeItem?.accentHex || "#C59B27";

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden bg-transparent ${
        isInspecting
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      }`}
    >
      <Canvas
        camera={{ position: [0, 0.12, 4.2], fov: 46 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
      >
        {/* Subtle HDR Environment Reflections */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={cinematic ? 0.9 : 1.0}
            position={[0, 5, 0]}
            scale={[3, 3, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={cinematic ? 1.2 : 1.5}
            position={[-4, 2, -2]}
            scale={[1, 6, 1]}
            color="#93c5fd"
          />
          <Lightformer
            form="rect"
            intensity={cinematic ? 1.2 : 1.8}
            position={[4, 2, -2]}
            scale={[1, 6, 1]}
            color={cinematic ? LIGHT_PRESETS[atmosphere].accentColor : accentColor}
          />
        </Environment>

        {cinematic ? (
          <CinematicLights atmosphere={atmosphere} reducedMotion={reducedMotion} />
        ) : (
          <>
        {/* Studio Lighting */}
        <ambientLight intensity={0.9} />

        <directionalLight
          position={[2.5, 4.5, 3.8]}
          intensity={2.8}
        />

        <directionalLight
          position={[-3, 2.5, 2.5]}
          intensity={1.2}
          color="#bfdbfe"
        />

        <directionalLight
          position={[0, 4.2, -3.0]}
          intensity={3.8}
          color="#ffffff"
        />

        <pointLight
          position={[0, 0.3, 2.4]}
          intensity={1.8}
          color="#ffffff"
        />

        <pointLight
          position={[0, 0.0, 1.8]}
          intensity={2.2}
          color={accentColor}
          distance={5.0}
        />

        {/* Luminous Center Rings (Matching Reference Image) */}
        {/* 1. Overhead Halo Fixture */}
        <group position={[0, 0.92, 0.12]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.026, 16, 64]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.055, 16, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        </group>

        {/* 2. Floor Glowing Light Ring */}
        <group position={[0, -0.98, 0.12]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.08, 0.026, 16, 64]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.08, 0.06, 16, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} toneMapped={false} />
          </mesh>
        </group>

          </>
        )}

        {/* 3D Carousel of Jeans & Garments */}
        <RbwOrbitCarousel
          items={items}
          activeIndex={activeIndex}
          onSelectIndex={onSelectIndex}
          autoRotate={autoRotate}
          isInspecting={isInspecting}
          setIsInspecting={setIsInspecting}
          rotationStep={rotationStep}
          cinematic={cinematic}
          reducedMotion={reducedMotion}
          onHoverIndex={onHoverIndex}
        />
      </Canvas>
    </div>
  );
}
