"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RbwCarouselItem } from "./RbwCarouselItem";
import { WASHES, WashItem } from "./RbwShowroomUI";

export type CarouselItemType = "3d" | "image";

export interface CarouselItemData {
  id: string;
  category: "jeans" | "jackets" | "shorts" | "accessories";
  type: CarouselItemType;
  washKey: "raw" | "black" | "white" | "vintage";
  colorName?: string;
  colorHex?: string;
  availableSizes?: string[];
  fitType?: string;
  discountPct?: number;
  originalPrice?: string;
  name: string;
  sublabel: string;
  tagline: string;
  modelPath?: string;
  imagePath?: string;
  price: string;
  accentHex: string;
  textStyle: string;
  btnText: string;
  btnBg: string;
  btnHover: string;
  btnTextColor: string;
  shopHref: string;
  categoryBadge: string;
}

export const ALL_SHOWROOM_ITEMS: CarouselItemData[] = [
  // ==========================================
  // 1. ALL JEANS (Images)
  // ==========================================
  {
    id: "jeans-raw",
    category: "jeans",
    type: "image",
    washKey: "raw",
    colorName: "Raw Indigo",
    colorHex: "#1E3A8A",
    availableSizes: ["28", "30", "32", "34", "36", "38", "40", "42"],
    fitType: "Straight",
    discountPct: 10,
    originalPrice: "₹2,100",
    name: "RAW",
    sublabel: "Zero Wash Rigid",
    tagline: "RAW YOU NEVER SAW",
    imagePath: "/rbwstore/raw.png",
    price: "₹1,900",
    accentHex: "#C59B27",
    textStyle: "text-raw-textured",
    btnText: "SHOP RAW JEANS →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    shopHref: "/stores/rbw/product/raw-straight-denims",
    categoryBadge: "JEANS",
  },
  {
    id: "jeans-black",
    category: "jeans",
    type: "image",
    washKey: "black",
    colorName: "Sulfur Black",
    colorHex: "#18181B",
    availableSizes: ["28", "30", "32", "34", "36", "38"],
    fitType: "Baggy",
    discountPct: 20,
    originalPrice: "₹2,375",
    name: "BLACK",
    sublabel: "Sulfur Dyed Obsidian",
    tagline: "BOLD YOU NEVER KNEW",
    imagePath: "/rbwstore/black.png",
    price: "₹1,900",
    accentHex: "#8B0015",
    textStyle: "text-black-textured",
    btnText: "SHOP BLACK JEANS →",
    btnBg: "bg-[#8B0015]",
    btnHover: "hover:bg-[#660010]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/product/black-straight-denims",
    categoryBadge: "JEANS",
  },
  {
    id: "jeans-white",
    category: "jeans",
    type: "image",
    washKey: "white",
    colorName: "Chalk White",
    colorHex: "#F5F5F0",
    availableSizes: ["28", "30", "32", "34", "36"],
    fitType: "Bootcut",
    discountPct: 25,
    originalPrice: "₹2,500",
    name: "WHITE",
    sublabel: "Ecru Bull Denim",
    tagline: "WHITE YOU NEVER WORE",
    imagePath: "/rbwstore/white.png",
    price: "₹1,900",
    accentHex: "#0A2A5E",
    textStyle: "text-white-textured",
    btnText: "SHOP WHITE JEANS →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/product/white-straight-denims",
    categoryBadge: "JEANS",
  },

  // ==========================================
  // 2. ALL JACKETS (Outerwear)
  // ==========================================
  {
    id: "jackets-raw",
    category: "jackets",
    type: "image",
    washKey: "raw",
    colorName: "Raw Indigo",
    colorHex: "#1E3A8A",
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    fitType: "Comfort",
    discountPct: 10,
    originalPrice: "₹3,880",
    name: "RAW JACKET",
    sublabel: "Rigid Selvedge",
    tagline: "14.5 OZ RIGID SELVEDGE JACKET",
    imagePath: "/raw_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#C59B27",
    textStyle: "text-raw-textured",
    btnText: "SHOP RAW JACKET →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    shopHref: "/stores/rbw/jackets?wash=raw",
    categoryBadge: "JACKETS",
  },
  {
    id: "jackets-black",
    category: "jackets",
    type: "image",
    washKey: "black",
    colorName: "Jet Black",
    colorHex: "#18181B",
    availableSizes: ["S", "M", "L", "XL"],
    fitType: "Slim",
    discountPct: 15,
    originalPrice: "₹4,100",
    name: "BLACK JACKET",
    sublabel: "Sulfur Jet Black",
    tagline: "14.0 OZ OVERSIZED OBSIDIAN TRUCKER",
    imagePath: "/black_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#8B0015",
    textStyle: "text-black-textured",
    btnText: "SHOP BLACK JACKET →",
    btnBg: "bg-[#8B0015]",
    btnHover: "hover:bg-[#660010]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/jackets?wash=black",
    categoryBadge: "JACKETS",
  },
  {
    id: "jackets-vintage",
    category: "jackets",
    type: "image",
    washKey: "vintage",
    colorName: "Vintage Fade",
    colorHex: "#60A5FA",
    availableSizes: ["M", "L", "XL"],
    fitType: "Comfort",
    discountPct: 20,
    originalPrice: "₹4,360",
    name: "VINTAGE JACKET",
    sublabel: "Stone Washed",
    tagline: "HAND-ABRADED STONEWASH TYPE III",
    imagePath: "/vintage_denim_jacket.png",
    price: "₹3,490",
    accentHex: "#0A2A5E",
    textStyle: "text-white-textured",
    btnText: "SHOP VINTAGE JACKET →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/jackets?wash=vintage",
    categoryBadge: "JACKETS",
  },

  // ==========================================
  // 3. ALL SHORTS (Bottoms)
  // ==========================================
  {
    id: "shorts-raw",
    category: "shorts",
    type: "image",
    washKey: "raw",
    colorName: "Raw Indigo",
    colorHex: "#1E3A8A",
    availableSizes: ["30", "32", "34", "36"],
    fitType: "Shorts",
    discountPct: 10,
    originalPrice: "₹1,650",
    name: "RAW SHORTS",
    sublabel: "Selvedge Hem",
    tagline: "RAW EDGED ATELIER BERMUDA",
    imagePath: "/raw_denim_shorts.png",
    price: "₹1,490",
    accentHex: "#C59B27",
    textStyle: "text-raw-textured",
    btnText: "SHOP RAW SHORTS →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    shopHref: "/stores/rbw/shorts?wash=raw",
    categoryBadge: "SHORTS",
  },
  {
    id: "shorts-black",
    category: "shorts",
    type: "image",
    washKey: "black",
    colorName: "Jet Black",
    colorHex: "#18181B",
    availableSizes: ["30", "32", "34", "36", "38"],
    fitType: "Shorts",
    discountPct: 15,
    originalPrice: "₹1,750",
    name: "BLACK SHORTS",
    sublabel: "Overdyed Obsidian",
    tagline: "OVERDYED OBSIDIAN UTILITY SHORTS",
    imagePath: "/black_denim_shorts.png",
    price: "₹1,490",
    accentHex: "#8B0015",
    textStyle: "text-black-textured",
    btnText: "SHOP BLACK SHORTS →",
    btnBg: "bg-[#8B0015]",
    btnHover: "hover:bg-[#660010]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/shorts?wash=black",
    categoryBadge: "SHORTS",
  },
  {
    id: "shorts-white",
    category: "shorts",
    type: "image",
    washKey: "white",
    colorName: "Chalk White",
    colorHex: "#F5F5F0",
    availableSizes: ["30", "32", "34"],
    fitType: "Shorts",
    discountPct: 20,
    originalPrice: "₹1,860",
    name: "WHITE SHORTS",
    sublabel: "Ecru Canvas",
    tagline: "CRISP ECRU SUMMER RELAXED SHORTS",
    imagePath: "/white_denim_shorts.png",
    price: "₹1,490",
    accentHex: "#0A2A5E",
    textStyle: "text-white-textured",
    btnText: "SHOP WHITE SHORTS →",
    btnBg: "bg-[#0A2A5E]",
    btnHover: "hover:bg-[#061c40]",
    btnTextColor: "text-white",
    shopHref: "/stores/rbw/shorts?wash=white",
    categoryBadge: "SHORTS",
  },

  // ==========================================
  // 4. ACCESSORIES (Caps, Belts, Wallets)
  // ==========================================
  {
    id: "acc-cap",
    category: "accessories",
    type: "image",
    washKey: "vintage",
    colorName: "Indigo Selvedge",
    colorHex: "#1E3A8A",
    availableSizes: ["One Size"],
    fitType: "Straight",
    discountPct: 10,
    originalPrice: "₹1,100",
    name: "DENIM CAP",
    sublabel: "6-Panel Strapback",
    tagline: "100% COTTON RAW SELVEDGE 6-PANEL CAP",
    imagePath: "/rbw_cap.jpg",
    price: "₹990",
    accentHex: "#C59B27",
    textStyle: "text-raw-textured",
    btnText: "SHOP ACCESSORIES →",
    btnBg: "bg-[#C59B27]",
    btnHover: "hover:bg-[#A8821B]",
    btnTextColor: "text-black",
    shopHref: "/stores/rbw?category=accessories",
    categoryBadge: "ACCESSORIES",
  },
];

export const CAROUSEL_NODES = [
  {
    id: "raw",
    imagePath: "/rbwstore/raw.png",
    title: "RAW INDIGO",
    accentHex: "#C59B27",
  },
  {
    id: "black",
    imagePath: "/rbwstore/black.png",
    title: "SULFUR BLACK",
    accentHex: "#8B0015",
  },
  {
    id: "white",
    imagePath: "/rbwstore/white.png",
    title: "CHALK WHITE",
    accentHex: "#0A2A5E",
  },
];

import { useTexture } from "@react-three/drei";

// Preload high-res jeans textures for instant rendering
if (typeof window !== "undefined") {
  CAROUSEL_NODES.forEach((node) => {
    try {
      useTexture.preload(node.imagePath);
    } catch (_) { }
  });
}

const TOTAL_ITEMS = CAROUSEL_NODES.length;
const SLIDE_SPACING = 2.4;

interface RbwOrbitCarouselProps {
  items?: CarouselItemData[];
  activeItem?: CarouselItemData;
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  autoRotate: boolean;
  /** Opt-in premium showroom presentation (used by /stores/rbw only) */
  cinematic?: boolean;
  reducedMotion?: boolean;
  isPaused?: boolean;
  /** Reports the hovered carousel index (or null) so the DOM overlay can react */
  onHoverIndex?: (index: number | null) => void;
  /** Callback triggered when active product is clicked to shop */
  onShopItem?: (item: CarouselItemData) => void;
}

export function RbwOrbitCarousel({
  items = ALL_SHOWROOM_ITEMS,
  activeItem,
  activeIndex,
  onSelectIndex,
  autoRotate,
  cinematic = false,
  reducedMotion = false,
  isPaused = false,
  onHoverIndex,
  onShopItem,
}: RbwOrbitCarouselProps) {
  const currentOffsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const startPointerXRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);
  const autoSlideTimerRef = useRef<number>(0);

  const { gl } = useThree();
  const totalItems = items.length;

  const [mountFlanking, setMountFlanking] = React.useState(false);

  // Phased loading: hero active model grabs full network & GPU priority first, flanking models mount right after
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMountFlanking(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Sync external activeIndex changes with shortest cyclic linear distance
  useEffect(() => {
    const curIdx = ((Math.round(targetOffsetRef.current) % totalItems) + totalItems) % totalItems;
    let diff = activeIndex - curIdx;
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;
    targetOffsetRef.current = Math.round(targetOffsetRef.current) + diff;
    autoSlideTimerRef.current = 0;
  }, [activeIndex, totalItems]);

  // Pointer drag listeners to slide models horizontally
  useEffect(() => {
    const canvasEl = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      startPointerXRef.current = e.clientX;
      dragDistanceRef.current = 0;
      autoSlideTimerRef.current = 0;
      startOffsetRef.current = currentOffsetRef.current;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startPointerXRef.current;
      dragDistanceRef.current = Math.abs(dx);

      // Dragging left advances forward, dragging right goes back
      const deltaOffset = -dx / 300;
      targetOffsetRef.current = startOffsetRef.current + deltaOffset;
      currentOffsetRef.current = startOffsetRef.current + deltaOffset;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Snap to nearest item if dragged sufficiently
      if (dragDistanceRef.current > 15) {
        const snapped = Math.round(targetOffsetRef.current);
        targetOffsetRef.current = snapped;
        const normalizedIndex = ((snapped % totalItems) + totalItems) % totalItems;
        onSelectIndex(normalizedIndex);
      }
    };

    canvasEl.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gl, onSelectIndex, totalItems]);

  useFrame((_, delta) => {
    if (!isDraggingRef.current) {
      // Smooth linear damp to target slide position
      currentOffsetRef.current = THREE.MathUtils.damp(
        currentOffsetRef.current,
        targetOffsetRef.current,
        cinematic ? (reducedMotion ? 14 : 5.2) : 7.5,
        delta
      );

      // Auto-slide to next denim after 5 seconds of inactivity if enabled and not paused
      if (autoRotate && !isPaused) {
        autoSlideTimerRef.current += delta;
        if (autoSlideTimerRef.current >= 5.0) {
          autoSlideTimerRef.current = 0;
          onSelectIndex((activeIndex + 1) % totalItems);
        }
      } else {
        autoSlideTimerRef.current = 0;
      }
    } else {
      autoSlideTimerRef.current = 0;
    }
  });

  return (
    <group>
      {items.map((item, i) => {
        const isActive = i === activeIndex;
        if (!isActive && !mountFlanking) {
          return null;
        }

        return (
          <React.Suspense
            key={item.id}
            fallback={null}
          >
            <RbwCarouselItem
              item={item}
              itemIndex={i}
              totalItems={totalItems}
              currentOffsetRef={currentOffsetRef}
              spacing={SLIDE_SPACING}
              isActive={isActive}
              isInspecting={false}
              cinematic={cinematic}
              reducedMotion={reducedMotion}
              isPaused={isPaused}
              onHoverChange={
                onHoverIndex ? (hovered) => onHoverIndex(hovered ? i : null) : undefined
              }
              onClick={() => {
                if (dragDistanceRef.current < 10) {
                  if (!isActive) {
                    onSelectIndex(i);
                  } else if (onShopItem) {
                    onShopItem(item);
                  }
                }
              }}
            />
          </React.Suspense>
        );
      })}
    </group>
  );
}
