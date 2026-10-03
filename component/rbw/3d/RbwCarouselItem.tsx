"use client";

import React, { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { CarouselItemData } from "./RbwOrbitCarousel";

// Configure local Draco decoder for ultra-fast local decoding without external CDN latency
if (typeof window !== "undefined") {
  useGLTF.setDecoderPath("/draco/");
}

// Preload textures and models for seamless instant transitions
if (typeof window !== "undefined") {
  try {
    useTexture.preload("/rbwstore/raw.png");
    useTexture.preload("/rbwstore/black.png");
    useTexture.preload("/rbwstore/white.png");
    useTexture.preload("/raw_denim_jacket.png");
    useTexture.preload("/black_denim_jacket.png");
    useTexture.preload("/vintage_denim_jacket.png");
    useTexture.preload("/raw_denim_shorts.png");
    useTexture.preload("/black_denim_shorts.png");
    useTexture.preload("/white_denim_shorts.png");
  } catch (_) {}
}

/**
 * 3D Model Renderer (used for Jeans character models)
 */
function RbwModelItem({ modelPath }: { modelPath: string }) {
  const gltf = useGLTF(modelPath);
  const scene = gltf.scene;

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const mat = m as any;
            if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
              mat.envMapIntensity = 1.8;
              if (mat.specularIntensity === 0) {
                mat.specularIntensity = 0.5;
              }

              const textureProps = [
                "map",
                "normalMap",
                "roughnessMap",
                "metalnessMap",
                "aoMap",
                "specularIntensityMap",
                "specularColorMap",
                "transmissionMap",
                "thicknessMap",
                "emissiveMap",
              ];
              textureProps.forEach((prop) => {
                const tex = mat[prop];
                if (tex && typeof tex.channel === "number") {
                  const reqAttr = tex.channel === 0 ? "uv" : `uv${tex.channel}`;
                  if (mesh.geometry && mesh.geometry.attributes && !mesh.geometry.attributes[reqAttr]) {
                    tex.channel = 0;
                  }
                }
              });

              mat.needsUpdate = true;
            }
          });
        }
      }
    });
  }, [scene]);

  if (!scene) return null;
  return <primitive object={scene} position={[0, 0, 0]} />;
}

/**
 * Cinematic-only shared state between the carousel slot and its textured plane.
 * Mutable refs (never React state) so nothing re-renders per frame.
 */
interface ItemFx {
  focus: number; // 0 = receding side product, 1 = hero
  enter: number; // 0 → 1 entrance progress
  hover: number; // 0 → 1 hover emphasis (side products only)
}
interface ItemDims {
  h: number; // plane height (world units)
  bottom: number; // plane bottom edge, local to the slot group
}

// Tunables for the cinematic studio presentation
const FLOAT_PX = 7; // very slow 5-8px floating movement
const FLOAT_PERIOD_S = 6.4; // 6.4s slow, calm breathing cycle (no bouncing, no exaggerated motion)
const SHADOW_GAP = 0.008; // gap between hem and realistic studio contact shadow
const REFLECTION_OPACITY = 0.05; // extremely subtle floor reflection (polished studio floor)

let _shadowTex: THREE.CanvasTexture | null = null;
function getShadowTexture(): THREE.CanvasTexture | null {
  if (_shadowTex) return _shadowTex;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return null;
  g.clearRect(0, 0, 256, 128);

  // 1. Soft studio penumbra shadow spreading outwards
  const grdOuter = g.createRadialGradient(128, 64, 0, 128, 64, 115);
  grdOuter.addColorStop(0, "rgba(25, 22, 18, 0.40)");
  grdOuter.addColorStop(0.35, "rgba(25, 22, 18, 0.20)");
  grdOuter.addColorStop(0.70, "rgba(25, 22, 18, 0.06)");
  grdOuter.addColorStop(1, "rgba(25, 22, 18, 0)");
  g.save();
  g.scale(1, 0.44);
  g.fillStyle = grdOuter;
  g.fillRect(0, 0, 256, 290);
  g.restore();

  // 2. High-density core occlusion shadow directly beneath the denim hem
  const grdCore = g.createRadialGradient(128, 64, 0, 128, 64, 52);
  grdCore.addColorStop(0, "rgba(20, 18, 15, 0.75)");
  grdCore.addColorStop(0.40, "rgba(20, 18, 15, 0.45)");
  grdCore.addColorStop(0.80, "rgba(20, 18, 15, 0.15)");
  grdCore.addColorStop(1, "rgba(20, 18, 15, 0)");
  g.save();
  g.scale(1, 0.34);
  g.fillStyle = grdCore;
  g.fillRect(0, 0, 256, 376);
  g.restore();

  _shadowTex = new THREE.CanvasTexture(c);
  return _shadowTex;
}

let _fadeTex: THREE.CanvasTexture | null = null;
function getReflectionFadeTexture(): THREE.CanvasTexture | null {
  if (_fadeTex) return _fadeTex;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return null;
  // Canvas Y=128 is closest to the hem (floor contact), Y=0 is further away
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, "#000000");
  grd.addColorStop(0.68, "#000000");
  grd.addColorStop(0.88, "#555555");
  grd.addColorStop(1, "#ffffff");
  g.fillStyle = grd;
  g.fillRect(0, 0, 16, 128);
  _fadeTex = new THREE.CanvasTexture(c);
  return _fadeTex;
}

/**
 * Floating High-Res Texture Plane (used for Jeans, Jackets & Shorts)
 * Reacts dynamically to studio directional lights, overhead halo, and rim light
 */
function RbwFloatingMeshItem({
  imagePath,
  accentHex,
  cinematic = false,
  fxRef,
  dimsRef,
  reducedMotion = false,
}: {
  imagePath: string;
  accentHex?: string;
  cinematic?: boolean;
  fxRef?: React.MutableRefObject<ItemFx>;
  dimsRef?: React.MutableRefObject<ItemDims>;
  reducedMotion?: boolean;
}) {
  const texture = useTexture(imagePath);
  const meshGroupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const reflMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { size, camera } = useThree();

  // Derive plane dimensions from natural image aspect ratio
  const imgWidth = (texture?.image as HTMLImageElement)?.width || 1024;
  const imgHeight = (texture?.image as HTMLImageElement)?.height || 1024;
  const aspect = imgWidth / imgHeight;

  // Tall items like full-length jeans (aspect ~0.667): height 2.05m, width ~1.37m
  // Squarish items like jackets & shorts (aspect ~1.0): height 1.52m, width 1.42m
  const isTall = aspect < 0.8;
  const planeHeight = isTall ? 2.05 : 1.52;
  const planeWidth = isTall ? 2.05 * aspect : 1.42;
  const baseY = isTall ? 1.02 : 0.98;

  if (dimsRef) {
    dimsRef.current.h = planeHeight;
    dimsRef.current.bottom = baseY - planeHeight / 2;
  }

  // ~7 screen pixels expressed in world units at the product depth
  const fov = (camera as THREE.PerspectiveCamera).fov || 46;
  const floatUnits =
    (FLOAT_PX * (2 * 4.08 * Math.tan((fov * Math.PI) / 360))) / Math.max(1, size.height);

  const shadowTex = cinematic ? getShadowTexture() : null;
  const fadeTex = cinematic ? getReflectionFadeTexture() : null;

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (cinematic) {
      const fx = fxRef?.current;
      if (!fx || !meshGroupRef.current) return;
      const { focus, enter, hover } = fx;

      // Very slow 5–10px floating movement & subtle breathing scale (6.4s sinusoidal wave, zero bouncing)
      const phase = (time / FLOAT_PERIOD_S) * Math.PI * 2;
      const breathe = reducedMotion ? 0 : Math.sin(phase);
      const lift = breathe * floatUnits * 0.5 * focus;
      const breatheScale = reducedMotion ? 1 : 1 + 0.007 * breathe * focus;
      const microZ = reducedMotion ? 0 : 0.015 * breathe * focus;

      // Natural, calm fabric micro-sway in the studio
      const microYaw = reducedMotion ? 0 : Math.sin(time * 0.42) * 0.012 * focus;
      const microPitch = reducedMotion ? 0 : Math.cos(time * 0.38) * 0.006 * focus;

      meshGroupRef.current.position.set(0, baseY + lift + hover * 0.02, microZ);
      meshGroupRef.current.scale.set(breatheScale, breatheScale, breatheScale);
      meshGroupRef.current.rotation.set(microPitch, microYaw, 0);

      // Depth hierarchy: center hero has full brilliance and specular depth;
      // side products recede one layer deeper through gentle opacity and softer focus on the light backdrop.
      const sideBrightness = 0.90;
      const heroBrightness = 1.0;
      const brightness = Math.min(
        1,
        THREE.MathUtils.lerp(sideBrightness, heroBrightness, Math.pow(focus, 1.25)) + hover * 0.10
      );

      const sideOpacity = 0.50;
      const heroOpacity = 1.0;
      const targetOpacity = Math.min(
        1,
        THREE.MathUtils.lerp(sideOpacity, heroOpacity, focus) + hover * 0.28
      );

      if (matRef.current) {
        matRef.current.opacity = enter * targetOpacity;
        matRef.current.color.setScalar(brightness);
        matRef.current.roughness = THREE.MathUtils.lerp(0.86, 0.65, focus);
        matRef.current.envMapIntensity = THREE.MathUtils.lerp(0.35, 0.90, focus);
      }

      // Realistic contact shadow beneath the jeans:
      // Tightens + deepens when closer to floor, gently diffuses when product floats up
      const liftNorm = floatUnits > 0 ? lift / floatUnits : 0;
      if (shadowMatRef.current) {
        shadowMatRef.current.opacity =
          enter *
          THREE.MathUtils.lerp(0.0, 0.65, Math.pow(focus, 1.8)) *
          (1 - 0.16 * liftNorm);
      }

      // Extremely subtle floor reflection: visible ONLY for the central hero product
      if (reflMatRef.current) {
        reflMatRef.current.opacity = enter * REFLECTION_OPACITY * Math.pow(focus, 2.8);
      }
      return;
    }

    const floatSine = Math.sin(time * 1.9);

    if (meshGroupRef.current) {
      // Elegant floating vertical bob inside the glowing 3D stage
      meshGroupRef.current.position.y = baseY + floatSine * 0.045;
      // Gentle 3D atelier yaw oscillation
      meshGroupRef.current.rotation.y = Math.sin(time * 1.3) * 0.07;
      // Subtle pitch tilt breathing
      meshGroupRef.current.rotation.x = Math.cos(time * 1.1) * 0.025;
    }
  });

  return (
    <group>
      {/* Realistic contact shadow beneath the jeans on the studio floor */}
      {cinematic && shadowTex && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, baseY - planeHeight / 2 - SHADOW_GAP, 0]}
          renderOrder={-2}
        >
          <planeGeometry args={[planeWidth * 1.25, 0.85]} />
          <meshBasicMaterial
            ref={shadowMatRef}
            map={shadowTex}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Floating Garment with Studio Lighting Reaction */}
      <group ref={meshGroupRef}>
        <mesh position={[0, 0, 0]} castShadow={false} receiveShadow={false}>
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshStandardMaterial
            ref={matRef}
            map={texture}
            transparent
            opacity={cinematic ? 0 : 1}
            alphaTest={0.01}
            roughness={0.72}
            metalness={0.05}
            envMapIntensity={cinematic ? 0.7 : 1.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Faint polished-floor reflection, fading out quickly below the hem */}
        {cinematic && fadeTex && (
          <mesh
            position={[0, -(planeHeight + 0.035), 0]}
            scale={[1, -1, 1]}
            renderOrder={-1}
          >
            <planeGeometry args={[planeWidth, planeHeight]} />
            <meshBasicMaterial
              ref={reflMatRef}
              map={texture}
              alphaMap={fadeTex}
              color="#9a9a9a"
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

interface RbwCarouselItemProps {
  item: CarouselItemData;
  itemIndex: number;
  totalItems: number;
  currentOffsetRef: React.MutableRefObject<number>;
  spacing: number;
  isActive?: boolean;
  isInspecting?: boolean;
  inspectRotationRef?: React.MutableRefObject<number>;
  inspectPitchRef?: React.MutableRefObject<number>;
  onClick?: () => void;
  /** Opt-in premium showroom presentation (used by /stores/rbw only) */
  cinematic?: boolean;
  reducedMotion?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function RbwCarouselItem({
  item,
  itemIndex,
  totalItems,
  currentOffsetRef,
  spacing,
  isActive = false,
  isInspecting = false,
  inspectRotationRef,
  inspectPitchRef,
  onClick,
  cinematic = false,
  reducedMotion = false,
  onHoverChange,
}: RbwCarouselItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pitchGroupRef = useRef<THREE.Group>(null);
  const yawGroupRef = useRef<THREE.Group>(null);
  const entranceYRef = useRef<number>(0);
  const currentPosRef = useRef({ x: 0, y: -0.98, z: 0.12 });
  const currentScaleRef = useRef<number>(0.94);
  const [hovered, setHovered] = React.useState(false);
  const { viewport, camera, size } = useThree();

  const prevRelRef = useRef<number | null>(null);

  // Cinematic-only state (refs: zero React re-renders per frame)
  const fxRef = useRef<ItemFx>({ focus: 0, enter: 0, hover: 0 });
  const dimsRef = useRef<ItemDims>({ h: 2.05, bottom: 0 });
  const hoveredRef = useRef(false);
  const mountedAtRef = useRef<number | null>(null);
  const enterDelayRef = useRef(0.3);
  const settleRef = useRef(0);
  const wasActiveRef = useRef(isActive);

  // When a product moves into focus it "settles" with a tiny vertical dip
  useEffect(() => {
    if (!cinematic) return;
    if (isActive && !wasActiveRef.current && !reducedMotion) settleRef.current = -0.04;
    wasActiveRef.current = isActive;
  }, [isActive, cinematic, reducedMotion]);

  // Reset body cursor on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = "auto";
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const currentOffset = currentOffsetRef.current;

    // Calculate shortest cyclic relative offset in range [-totalItems/2, +totalItems/2]
    const half = totalItems / 2;
    let rel = (itemIndex - (currentOffset % totalItems) + totalItems) % totalItems;
    if (rel > half) rel -= totalItems;

    const absRel = Math.abs(rel);
    const isMobile = size.width < 768;
    const maxVisibleOffset = isMobile ? 0.70 : 1.5;

    // Proximity to center: 1.0 (dead center hero), 0.0 (fully flanking)
    const proximity = Math.max(0, 1 - absRel);

    // Smooth entrance damping from beneath stage upon first load
    entranceYRef.current = THREE.MathUtils.damp(entranceYRef.current, 0, 4.0, delta);
    const baseY = entranceYRef.current - 0.98;

    // Dynamically calculate architectural pillar horizontal offset
    const pCam = camera as THREE.PerspectiveCamera;
    const d = pCam.position.z - 0.12;
    const vHeight = 2 * d * Math.tan(((pCam.fov || 46) * Math.PI) / 360);
    const vWidth = vHeight * (viewport.width / viewport.height);
    const pillarOffset = (vWidth / 2) * 0.68;
    const mobileSwipeOffset = vWidth * 0.92;
    const activeSpacing = isMobile ? mobileSwipeOffset : pillarOffset;

    let targetX = 0;
    let targetY = baseY;
    let targetZ = 0.12;
    let targetScale = 0.94;
    let targetRotY = 0;

    // ---- Cinematic layout (viewport-aware hero, depth-based side products) ----
    let cinematicEnter = 1;
    let cinematicFocus = 1;
    if (cinematic) {
      if (mountedAtRef.current === null) {
        mountedAtRef.current = state.clock.elapsedTime;
        // first paint: hero leads, side products trail. Later mounts (category switch) are quick.
        enterDelayRef.current = state.clock.elapsedTime > 2.5 ? 0.04 : isActive ? 0.3 : 0.42;
      }
      const elapsed = state.clock.elapsedTime - mountedAtRef.current - enterDelayRef.current;
      const raw = reducedMotion ? 1 : THREE.MathUtils.clamp(elapsed / 0.7, 0, 1);
      cinematicEnter = 1 - Math.pow(1 - raw, 3);

      const H = size.height;
      const pxPerUnit = H / vHeight;
      const topReserve = size.width < 640 ? 128 : size.width < 1024 ? 150 : size.width < 1280 ? 160 : 172;
      const bottomReserve = size.width < 640 ? 240 : size.width < 1024 ? 230 : 212;
      const dims = dimsRef.current;
      const fitScale = (H - topReserve - bottomReserve) / (dims.h * pxPerUnit);
      const heroScaleC = THREE.MathUtils.clamp(fitScale, 0.6, dims.h > 1.8 ? 1.14 : 1.3);
      // world-space y of the hem for the hero, so the product stands just above the title block
      const feetY = vHeight * (bottomReserve / H - 0.5);

      cinematicFocus = isInspecting
        ? isActive
          ? 1
          : 0
        : THREE.MathUtils.smoothstep(proximity, 0, 1);

      if (isInspecting) {
        if (isActive) {
          targetScale = heroScaleC * (isMobile ? 1.0 : 1.04);
          targetX = 0;
          targetZ = 0.28;
          targetY = feetY - dims.bottom * targetScale;
          targetRotY = inspectRotationRef?.current ?? 0;
          groupRef.current.visible = true;
        } else {
          targetX = rel * (activeSpacing * 3.6);
          targetZ = -0.4;
          targetScale = 0.0;
          targetRotY = rel * -0.4;
          targetY = feetY;
        }
      } else {
        groupRef.current.visible = absRel <= maxVisibleOffset;
        // Non-linear depth curve: side products sit distinctly deeper into the studio
        const f = Math.pow(cinematicFocus, 1.3);
        targetZ = THREE.MathUtils.lerp(-0.85, 0.14, f);
        targetScale = heroScaleC * THREE.MathUtils.lerp(0.70, 1.0, f);
        // Compensate perspective so side products sit on architectural gallery lines
        const xComp = (pCam.position.z - targetZ) / d;
        targetX = rel * activeSpacing * xComp;
        targetY = feetY - dims.bottom * targetScale + (1 - f) * 0.08;
        targetRotY = isMobile ? 0 : rel * -0.16;
      }
    } else if (isInspecting) {
      if (isActive) {
        // Center hero model steps forward into 360 spotlight ("came outside")
        targetX = 0;
        targetY = baseY;
        targetZ = 0.28;
        targetScale = isMobile ? 0.92 : 1.0;
        targetRotY = inspectRotationRef?.current ?? 0;
        groupRef.current.visible = true;
      } else {
        // Flanking models slide completely outward offscreen to left and right
        targetX = rel * (activeSpacing * 3.6);
        targetY = baseY;
        targetZ = -0.4;
        targetScale = 0.0;
        targetRotY = rel * -0.4;
      }
    } else {
      if (absRel > maxVisibleOffset) {
        groupRef.current.visible = false;
      } else {
        groupRef.current.visible = true;
      }

      targetZ = THREE.MathUtils.lerp(0.04, 0.12, Math.pow(proximity, 1.3));
      targetX = rel * activeSpacing;
      const heroScale = isMobile ? 0.88 : 0.94;
      targetScale = THREE.MathUtils.lerp(0.70, heroScale, Math.pow(proximity, 1.2));
      targetRotY = isMobile ? 0 : rel * -0.20;
    }

    // Detect wrap-around across cyclic boundary or initial frame mount
    const isFirstFrame = prevRelRef.current === null;
    const isWrapping =
      !isFirstFrame &&
      prevRelRef.current !== null &&
      Math.abs(rel - prevRelRef.current) > 1.0;

    prevRelRef.current = rel;

    let targetPitch = 0;
    if (isInspecting && isActive) {
      targetPitch = inspectPitchRef?.current ?? 0;
    }

    if (isFirstFrame || isWrapping) {
      // Instantly teleport position and rotation to target without sliding across screen
      currentPosRef.current.x = targetX;
      currentPosRef.current.y = targetY;
      currentPosRef.current.z = targetZ;
      currentScaleRef.current = targetScale;
      if (pitchGroupRef.current) {
        pitchGroupRef.current.rotation.x = targetPitch;
      }
      if (yawGroupRef.current) {
        yawGroupRef.current.rotation.y = targetRotY;
      }
    } else {
      // Smooth physics damping (cinematic: 700-900ms deliberate luxury settle)
      const lambda = cinematic && !reducedMotion ? 4.4 : cinematic ? 14 : 7.5;
      currentPosRef.current.x = THREE.MathUtils.damp(currentPosRef.current.x, targetX, lambda, delta);
      currentPosRef.current.y = THREE.MathUtils.damp(currentPosRef.current.y, targetY, lambda, delta);
      currentPosRef.current.z = THREE.MathUtils.damp(currentPosRef.current.z, targetZ, lambda, delta);
      currentScaleRef.current = THREE.MathUtils.damp(currentScaleRef.current, targetScale, lambda, delta);
    }

    // Hide flanking items if shrunk down to preserve rendering efficiency
    if (isInspecting && !isActive && currentScaleRef.current < 0.03) {
      groupRef.current.visible = false;
    }

    if (cinematic) {
      const fx = fxRef.current;
      fx.focus = cinematicFocus;
      fx.enter = cinematicEnter;
      fx.hover = THREE.MathUtils.damp(
        fx.hover,
        hoveredRef.current && !isActive && !isInspecting ? 1 : 0,
        8,
        delta
      );
      settleRef.current = THREE.MathUtils.damp(settleRef.current, 0, 5, delta);

      // entrance: rises ~7cm and scales 0.94 → 1 while fading in
      const enterScale = 0.94 + 0.06 * cinematicEnter;
      const s = currentScaleRef.current * enterScale * (1 + 0.045 * fx.hover);
      groupRef.current.position.set(
        currentPosRef.current.x,
        currentPosRef.current.y - (1 - cinematicEnter) * 0.07 + settleRef.current + fx.hover * 0.025,
        currentPosRef.current.z
      );
      groupRef.current.scale.set(s, s, s);
    } else {
      groupRef.current.position.set(
        currentPosRef.current.x,
        currentPosRef.current.y,
        currentPosRef.current.z
      );
      groupRef.current.scale.set(
        currentScaleRef.current,
        currentScaleRef.current,
        currentScaleRef.current
      );
    }

    if (pitchGroupRef.current) {
      if (isInspecting && isActive) {
        pitchGroupRef.current.rotation.x = targetPitch;
      } else {
        pitchGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          pitchGroupRef.current.rotation.x,
          0,
          0.12
        );
      }
    }

    if (yawGroupRef.current) {
      if (isInspecting && isActive) {
        yawGroupRef.current.rotation.y = targetRotY;
      } else if (!isWrapping) {
        yawGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          yawGroupRef.current.rotation.y,
          targetRotY,
          0.12
        );
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        hoveredRef.current = true;
        onHoverChange?.(true);
        if (typeof document !== "undefined") {
          document.body.style.cursor = isInspecting ? "grab" : "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        hoveredRef.current = false;
        onHoverChange?.(false);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "auto";
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Pivot point at model mid-height (~0.55m) for natural pitch tilt */}
      <group ref={pitchGroupRef} position={[0, 0.55, 0]}>
        <group ref={yawGroupRef} position={[0, -0.55, 0]}>
          {item.type === "3d" && item.modelPath ? (
            <RbwModelItem modelPath={item.modelPath} />
          ) : item.imagePath ? (
            <RbwFloatingMeshItem
              imagePath={item.imagePath}
              accentHex={item.accentHex}
              cinematic={cinematic}
              fxRef={fxRef}
              dimsRef={dimsRef}
              reducedMotion={reducedMotion}
            />
          ) : null}
        </group>
      </group>
    </group>
  );
}
