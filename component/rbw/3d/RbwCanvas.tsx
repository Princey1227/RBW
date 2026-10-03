"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { RbwOrbitCarousel, CarouselItemData } from "./RbwOrbitCarousel";

type RbwAtmosphereKey = "raw" | "black" | "white";

interface LightPreset {
  ambient: number;
  ambientColor: string;
  spot: number;
  spotColor: string;
  key: number;
  keyColor: string;
  fill: number;
  fillColor: string;
  rim: number;
  rimColor: string;
  bounce: number;
  bounceColor: string;
}

// High-end daylight fashion photography studio lighting per wash.
// RAW: crisp natural daylight with subtle indigo bounce
// BLACK: high dynamic-range studio key light to carve deep obsidian denim
// WHITE: calibrated soft ivory daylight so ecru denim texture is beautifully sculpted without clipping
const LIGHT_PRESETS: Record<RbwAtmosphereKey, LightPreset> = {
  raw: {
    ambient: 1.08,
    ambientColor: "#f5f3ef",
    spot: 2.2,
    spotColor: "#ffffff",
    key: 2.2,
    keyColor: "#fffaf4",
    fill: 0.95,
    fillColor: "#e6eaf4",
    rim: 2.0,
    rimColor: "#ffffff",
    bounce: 0.7,
    bounceColor: "#ede7dd",
  },
  black: {
    ambient: 1.05,
    ambientColor: "#f5f3ef",
    spot: 2.5,
    spotColor: "#ffffff",
    key: 2.3,
    keyColor: "#ffffff",
    fill: 0.90,
    fillColor: "#e4e1dc",
    rim: 2.2,
    rimColor: "#ffffff",
    bounce: 0.65,
    bounceColor: "#e6e2da",
  },
  white: {
    ambient: 1.0,
    ambientColor: "#f5f3ef",
    spot: 1.9,
    spotColor: "#fffbf5",
    key: 1.85,
    keyColor: "#fff9f0",
    fill: 0.9,
    fillColor: "#e8e5df",
    rim: 2.2,
    rimColor: "#fffdfa",
    bounce: 0.65,
    bounceColor: "#ede8df",
  },
};

/**
 * Dark fashion photography studio lighting.
 * Animates smoothly over ~800ms when wash atmosphere changes.
 */
function CinematicLights({
  atmosphere,
  reducedMotion,
}: {
  atmosphere: RbwAtmosphereKey;
  reducedMotion: boolean;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const bounceRef = useRef<THREE.PointLight>(null);

  const target = useMemo(() => {
    const p = LIGHT_PRESETS[atmosphere];
    return {
      p,
      ambient: new THREE.Color(p.ambientColor),
      spot: new THREE.Color(p.spotColor),
      key: new THREE.Color(p.keyColor),
      fill: new THREE.Color(p.fillColor),
      rim: new THREE.Color(p.rimColor),
      bounce: new THREE.Color(p.bounceColor),
    };
  }, [atmosphere]);

  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current;
    }
  }, []);

  useFrame((_, delta) => {
    const rate = reducedMotion ? 20 : 3.6;
    const a = 1 - Math.exp(-rate * delta);
    const { p } = target;
    const damp = (cur: number, to: number) => THREE.MathUtils.lerp(cur, to, a);

    if (ambientRef.current) {
      ambientRef.current.intensity = damp(ambientRef.current.intensity, p.ambient);
      ambientRef.current.color.lerp(target.ambient, a);
    }
    if (spotRef.current) {
      spotRef.current.intensity = damp(spotRef.current.intensity, p.spot);
      spotRef.current.color.lerp(target.spot, a);
    }
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
    if (bounceRef.current) {
      bounceRef.current.intensity = damp(bounceRef.current.intensity, p.bounce);
      bounceRef.current.color.lerp(target.bounce, a);
    }
  });

  const start = LIGHT_PRESETS.raw;
  return (
    <>
      {/* Target for overhead spotlight */}
      <object3D ref={spotTargetRef} position={[0, 0.35, 0.12]} />

      {/* Atmospheric ambient room tone */}
      <ambientLight ref={ambientRef} intensity={start.ambient} color={start.ambientColor} />

      {/* Soft overhead fashion studio spotlight with gentle penumbra falloff */}
      <spotLight
        ref={spotRef}
        position={[0, 5.2, 1.4]}
        intensity={start.spot}
        color={start.spotColor}
        angle={Math.PI / 4.8}
        penumbra={0.88}
        distance={10}
        decay={1.1}
      />

      {/* Key: front/above camera-right for dimensional fabric modeling */}
      <directionalLight
        ref={keyRef}
        position={[2.2, 4.2, 3.6]}
        intensity={start.key}
        color={start.keyColor}
      />

      {/* Fill: soft, cool camera-left */}
      <directionalLight
        ref={fillRef}
        position={[-3.2, 2.2, 2.6]}
        intensity={start.fill}
        color={start.fillColor}
      />

      {/* Subtle warm rim light from behind/above to sculpt fabric silhouette */}
      <directionalLight
        ref={rimRef}
        position={[0, 4.4, -3.2]}
        intensity={start.rim}
        color={start.rimColor}
      />

      {/* Subtle denim-colored ambient bounce from the showroom floor */}
      <pointLight
        ref={bounceRef}
        position={[0, -1.8, 0.6]}
        intensity={start.bounce}
        color={start.bounceColor}
        distance={6}
      />
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
        {/* Subtle HDR Environment Reflections for Light Fashion Studio */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={cinematic ? 0.7 : 1.0}
            position={[0, 5, 0]}
            scale={[4, 4, 1]}
            target={[0, 0, 0]}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={cinematic ? 0.6 : 1.2}
            position={[-4, 2, -2]}
            scale={[1, 6, 1]}
            color="#f5f3ef"
          />
          <Lightformer
            form="rect"
            intensity={cinematic ? 0.6 : 1.2}
            position={[4, 2, -2]}
            scale={[1, 6, 1]}
            color={cinematic ? LIGHT_PRESETS[atmosphere].bounceColor : "#edeae4"}
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
