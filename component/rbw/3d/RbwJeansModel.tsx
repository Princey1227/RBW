"use client";

import React, { useEffect, useRef } from "react";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface RbwJeansModelProps {
  modelPath: string;
  autoRotate?: boolean;
  scale?: number;
}

export function RbwJeansModel({ modelPath, autoRotate = true, scale = 1.35 }: RbwJeansModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

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
              mat.envMapIntensity = 1.4;

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

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <Float
        speed={1.4}
        rotationIntensity={0.12}
        floatIntensity={0.2}
        floatingRange={[-0.03, 0.03]}
      >
        {/* Model is centered around Y=1, so offsetting Y by -1.0 places pivot at origin */}
        <primitive object={scene} position={[0, -1.0, 0]} scale={scale} />
      </Float>
    </group>
  );
}

// Preload models for immediate wash-switching responsiveness
useGLTF.preload("/raw.glb");
useGLTF.preload("/blue.glb");
useGLTF.preload("/white.glb");
