"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import QuickViewModal from "@/component/home/QuickViewModal";
import BrandShowroomSection, {
  BrandConfig,
} from "@/component/experience-center/BrandShowroomSection";
import StickyShopFilters from "@/component/experience-center/StickyShopFilters";
import MobileShowroomExperience from "@/component/experience-center/MobileShowroomExperience";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type BrandName = "RBW" | "THINC" | "WIDE" | "IJNS" | "SECOND ARMY";
export type CategoryType = "JEANS" | "JACKETS" | "SHORTS" | "ACCESSORIES";

export interface ExperienceProduct {
  id: string;
  brand: BrandName;
  category: CategoryType;
  title: string;
  subtitle: string;
  wash: string;
  price: number;
  image: string;
  hoverImage?: string;
  handle: string;
  description: string;
  fitBadge?: string;
  specs: string[];
  sizes?: string[];
  colors?: string[]; // hex dot swatches
  isMockupFeatured?: boolean;
}

// ─── CURATED CATALOG (EXACT MATCH TO DESIGN MOCKUP & BALANCED MIX) ──────────

const FEATURED_SHOWCASE: ExperienceProduct[] = [
  {
    id: "wide-bleached-baggy",
    brand: "WIDE",
    category: "JEANS",
    title: "Bleached Baggy Jeans",
    subtitle: "Loose fit. Big attitude.",
    wash: "Bleached Light Blue",
    price: 1899,
    image: "/baggy_fit_flat.png",
    handle: "wide-bleached-baggy-jeans",
    description: "Wide-leg silhouette in premium 14oz ring-spun denim with vintage bleach treatment.",
    fitBadge: "BAGGY",
    specs: ["14oz Pure Ring-Spun Cotton", "Wide Stacking Hem", "Vintage Bleach Wash"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#7FA6CB", "#1A2A3A"],
    isMockupFeatured: true,
  },
  {
    id: "rbw-straight-mockup",
    brand: "RBW",
    category: "JEANS",
    title: "Straight Fit Jeans",
    subtitle: "Classic. Versatile. Timeless.",
    wash: "Classic Blue",
    price: 1899,
    image: "/straight_fit_flat.png",
    handle: "rbw-straight-fit-jeans",
    description: "14.5oz Japanese selvedge denim in a classic straight leg silhouette.",
    fitBadge: "STRAIGHT FIT",
    specs: ["14.5oz Pure Selvedge", "Custom Copper Rivets", "Button Fly"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#1A3A5C", "#0A0A0A"],
    isMockupFeatured: true,
  },
  {
    id: "thinc-jacket-mockup",
    brand: "THINC",
    category: "JACKETS",
    title: "Essential Denim Jacket",
    subtitle: "Minimal. Modern. Made for you.",
    wash: "Ecru Cream",
    price: 2499,
    image: "/cream_denim_jacket.jpg",
    handle: "thinc-ecru-denim-jacket",
    description: "Clean architect-inspired minimal denim trucker jacket in natural ecru twill.",
    fitBadge: "MINIMAL TRUCKER",
    specs: ["Natural Unbleached Twill", "Matte Brass Hardware", "Clean Welt Pockets"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#1A3A5C", "#244B5A"],
    isMockupFeatured: true,
  },
  {
    id: "wide-cargo-mockup",
    brand: "WIDE",
    category: "JEANS",
    title: "Relaxed Cargo Jeans",
    subtitle: "Loose fit. Big attitude.",
    wash: "Washed Charcoal Black",
    price: 2199,
    image: "/black_cargo_jeans.jpg",
    handle: "wide-relaxed-cargo-jeans",
    description: "Heavyweight washed black cargo denim with utilitarian side flap pockets and wide drape.",
    fitBadge: "CARGO WIDE",
    specs: ["Enzyme Mineral Wash", "Utilitarian Flap Pockets", "Extra Length Stacking"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#1A2A3A", "#3A3A3A"],
    isMockupFeatured: true,
  },
  {
    id: "ijns-shorts-mockup",
    brand: "IJNS",
    category: "SHORTS",
    title: "Denim Shorts",
    subtitle: "Young. Bold. Expressive.",
    wash: "Light Bleach Wash",
    price: 1599,
    image: "/light_denim_shorts.jpg",
    handle: "ijns-light-denim-shorts",
    description: "Summer-ready light wash denim shorts with a raw frayed hem and vintage fade.",
    fitBadge: "RAW HEM SHORT",
    specs: ["Enzyme Stone Wash", "Raw Cut Distressed Hem", "Classic 5-Pocket"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#1A3A5C", "#6B8FB5"],
    isMockupFeatured: true,
  },
  {
    id: "sa-utility-mockup",
    brand: "SECOND ARMY",
    category: "JACKETS",
    title: "Utility Jacket",
    subtitle: "Built for the street.",
    wash: "Olive Military",
    price: 2799,
    image: "/olive_utility_jacket.jpg",
    handle: "second-army-utility-jacket",
    description: "Military specification field jacket with reinforced chest cargo pockets and epaulets.",
    fitBadge: "MIL-SPEC UTILITY",
    specs: ["Heavy Cotton Canvas", "4-Pocket Field Layout", "Reinforced Bar Tack"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#1A3A5C", "#4A5C3A"],
    isMockupFeatured: true,
  },
  {
    id: "rbw-cap-mockup",
    brand: "RBW",
    category: "ACCESSORIES",
    title: "Logo Cap",
    subtitle: "Everyday essential.",
    wash: "Washed Black",
    price: 799,
    image: "/rbw_cap.jpg",
    handle: "rbw-embroidered-logo-cap",
    description: "Everyday unstructured baseball cap in black denim with raised RBW white embroidery.",
    fitBadge: "BASEBALL CAP",
    specs: ["100% Cotton Denim", "3D Raised Embroidery", "Brass Buckle Strap"],
    sizes: ["ONE SIZE"],
    colors: ["#1A3A5C", "#0A0A0A"],
    isMockupFeatured: true,
  },
];

// Additional products for natural marketplace discovery across all brands & categories
const ADDITIONAL_PRODUCTS: ExperienceProduct[] = [
  {
    id: "thinc-minimal-raw",
    brand: "THINC",
    category: "JEANS",
    title: "Minimal Straight Jeans",
    subtitle: "Purity of cut and texture.",
    wash: "Raw Deep Indigo",
    price: 2199,
    image: "/raw_jeans.png",
    hoverImage: "/raw_jeans_v2.png",
    handle: "thinc-minimal-straight-raw",
    description: "Architectural straight cut denim in unwashed Japanese raw indigo selvedge.",
    fitBadge: "STRAIGHT FIT",
    specs: ["13.75oz Raw Indigo", "Blind Stitched Hems", "Minimal Hardware"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#132238", "#1E314B"],
  },
  {
    id: "wide-shadow-baggy",
    brand: "WIDE",
    category: "JEANS",
    title: "Shadow Baggy Jeans",
    subtitle: "Dark. Volume. Statement.",
    wash: "Faded Phantom Black",
    price: 2099,
    image: "/black_jeans_v2.png",
    handle: "wide-shadow-baggy",
    description: "Distressed pitch black loose fit denim tailored for relaxed streetwear drape.",
    fitBadge: "SLOUCH BAGGY",
    specs: ["Slouched Waistband", "Enzyme Mineral Softener", "Extra Length Stacking"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#111111", "#333333"],
  },
  {
    id: "sa-cargo-jeans",
    brand: "SECOND ARMY",
    category: "JEANS",
    title: "Field Cargo Jeans",
    subtitle: "Utility meets street.",
    wash: "Khaki Stone",
    price: 2499,
    image: "/camo_jeans.png",
    handle: "sa-field-cargo-jeans",
    description: "Six-pocket field spec cargo denim built from reinforced durable cotton weave.",
    fitBadge: "FIELD CARGO",
    specs: ["6-Pocket Field Spec", "Double Knee Panel", "Gusseted Crotch"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#7A6040", "#5A4830"],
  },
  {
    id: "ijns-bleach-baggy",
    brand: "IJNS",
    category: "JEANS",
    title: "Bleached Baggy Jeans",
    subtitle: "Y2K volume with modern edge.",
    wash: "Bleach Cloud",
    price: 1899,
    image: "/baggy_fit_flat.png",
    handle: "ijns-bleach-baggy-jeans",
    description: "Exaggerated wide leg jeans in an acid cloud wash with authentic vintage wear.",
    fitBadge: "WIDE BAGGY",
    specs: ["Heavy Bleach Wash", "Wide Puddle Hem", "Distressed Coin Pocket"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#79A3CE", "#ADC9E6"],
  },
  {
    id: "rbw-jeans-black",
    brand: "RBW",
    category: "JEANS",
    title: "Slim Fit Jeans",
    subtitle: "Sharp. Minimal. Built to last.",
    wash: "Sulfur Black",
    price: 1999,
    image: "/black_jeans.png",
    hoverImage: "/black_jeans_v2.png",
    handle: "rbw-black-slim-jeans",
    description: "Deep double-black warp & weft selvedge with a clean tailored silhouette.",
    fitBadge: "SLIM FIT",
    specs: ["Warp & Weft Dyed Black", "Matte Black Hardware", "Redline ID"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#0A0A0A", "#1A1A2E"],
  },
  {
    id: "thinc-black-trucker",
    brand: "THINC",
    category: "JACKETS",
    title: "Architect Denim Jacket",
    subtitle: "Monochrome precision cut.",
    wash: "Jet Black",
    price: 2599,
    image: "/black_denim_jacket.png",
    handle: "thinc-architect-black-jacket",
    description: "Collarless minimal denim overshirt jacket tailored for modern layering.",
    fitBadge: "MINIMAL JACKET",
    specs: ["Concealed Snaps", "Matte Black Hardware", "Internal Chest Pocket"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#111111", "#222222"],
  },
  {
    id: "wide-vintage-trucker",
    brand: "WIDE",
    category: "JACKETS",
    title: "Oversized Denim Overshirt",
    subtitle: "Relaxed vintage silhouette.",
    wash: "Vintage Indigo",
    price: 2299,
    image: "/vintage_denim_jacket.png",
    handle: "wide-oversized-denim-overshirt",
    description: "Heavy drop-shoulder denim trucker jacket with vintage stonewashed fading.",
    fitBadge: "DROP SHOULDER",
    specs: ["100% Ring-Spun Cotton", "Drop Shoulder Fit", "Antiqued Copper Buttons"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#2B4B70", "#4A6E94"],
  },
  {
    id: "ijns-raw-shorts",
    brand: "IJNS",
    category: "SHORTS",
    title: "Raw Edge Jorts",
    subtitle: "Streetwear essential.",
    wash: "Deep Indigo",
    price: 1499,
    image: "/raw_denim_shorts.png",
    handle: "ijns-raw-edge-jorts",
    description: "Baggy fit knee-length denim shorts featuring distressed hems and contrast stitching.",
    fitBadge: "BAGGY SHORT",
    specs: ["Wide Knee-Length Cut", "Frayed Edge Detail", "Chainstitched Seams"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#1E3A5F", "#2B4B70"],
  },
  {
    id: "sa-combat-shorts",
    brand: "SECOND ARMY",
    category: "SHORTS",
    title: "Tactical Cargo Shorts",
    subtitle: "Military spec utility shorts.",
    wash: "Washed Black",
    price: 1699,
    image: "/black_denim_shorts.png",
    handle: "sa-tactical-cargo-shorts",
    description: "Multi-pocket tactical shorts constructed from heavyweight ripstop denim twill.",
    fitBadge: "COMBAT SHORT",
    specs: ["Ripstop Denim", "MOLLE Loop Accents", "Bellows Cargo Pockets"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#171615", "#2C2A27"],
  },
  {
    id: "rbw-jeans-white",
    brand: "RBW",
    category: "JEANS",
    title: "White Selvedge Jeans",
    subtitle: "Pure. Clean. Statement.",
    wash: "Snow White",
    price: 2099,
    image: "/white_jeans.png",
    hoverImage: "/white_jeans_v2.png",
    handle: "rbw-white-selvedge-jeans",
    description: "Optical white weft on natural warp selvedge with refined hand-finishing.",
    fitBadge: "TAPERED FIT",
    specs: ["Optical White Twill", "Japanese Selvedge", "Tortoise Shell Buttons"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#FFFFFF", "#0A0A0A"],
  },
  {
    id: "thinc-tailored-indigo",
    brand: "THINC",
    category: "JEANS",
    title: "Tailored Selvedge Trousers",
    subtitle: "Formal precision meets raw denim.",
    wash: "Clean Indigo Rinse",
    price: 2399,
    image: "/RBW-comfort.png",
    handle: "thinc-tailored-selvedge-trousers",
    description: "Front-creased dress trouser cut in fine gauge Japanese selvedge denim.",
    fitBadge: "TAILORED CUT",
    specs: ["Pressed Front Crease", "Slanted Trouser Pockets", "Horn Fasteners"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#1B304B", "#253F61"],
  },
  {
    id: "wide-painter-denim",
    brand: "WIDE",
    category: "JEANS",
    title: "Wide-Leg Painter Denim",
    subtitle: "Artisan carpenter styling.",
    wash: "Natural Ecru",
    price: 2199,
    image: "/RBW-baggy.png",
    handle: "wide-painter-denim-ecru",
    description: "Full volume painter trousers with hammer loop, utility rule pocket, and contrast stitching.",
    fitBadge: "PAINTER WIDE",
    specs: ["Carpenter Loop", "Reinforced Tool Pockets", "Triple Needle Stitched"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#F0ECE1", "#D6CFC1"],
  },
  {
    id: "sa-military-shorts",
    brand: "SECOND ARMY",
    category: "SHORTS",
    title: "Combat Utility Shorts",
    subtitle: "Built for warm climate operations.",
    wash: "Military Khaki",
    price: 1799,
    image: "/black_denim_shorts_hanger.png",
    handle: "sa-combat-utility-shorts-khaki",
    description: "Reinforced seat and double-needle field construction on classic utility shorts.",
    fitBadge: "UTILITY SHORT",
    specs: ["Reinforced Seat", "Angled Slant Pockets", "Drawcord Waist"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#6B6349", "#4A4533"],
  },
  {
    id: "ijns-white-shorts",
    brand: "IJNS",
    category: "SHORTS",
    title: "Acid Wash Summer Shorts",
    subtitle: "High contrast bright denim.",
    wash: "Crisp Bleach White",
    price: 1599,
    image: "/white_denim_shorts.png",
    handle: "ijns-acid-white-shorts",
    description: "Bright optic white denim shorts with subtle marble stone washing and relaxed thigh fit.",
    fitBadge: "RELAXED SHORT",
    specs: ["100% Cotton", "Lightweight 11oz Denim", "Clean Finished Hem"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#F7F7F7", "#DCDCDC"],
  },
  {
    id: "rbw-heritage-raw-jacket",
    brand: "RBW",
    category: "JACKETS",
    title: "Heritage Trucker Jacket",
    subtitle: "15oz pure indigo selvedge.",
    wash: "Deep Raw Indigo",
    price: 2699,
    image: "/raw_denim_jacket.png",
    handle: "rbw-heritage-raw-trucker",
    description: "Type II trucker jacket with pleated front, donut buttons, and redline selvedge interior placket.",
    fitBadge: "TYPE II TRUCKER",
    specs: ["15oz Japanese Selvedge", "Selvedge Interior Placket", "Solid Brass Buttons"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#122238", "#1A3250"],
  },
  {
    id: "wide-bootcut-retro",
    brand: "WIDE",
    category: "JEANS",
    title: "Bootcut Flare Jeans",
    subtitle: "Subtle flare with modern proportions.",
    wash: "Retro Blue",
    price: 2299,
    image: "/bootcut_fit_flat.png",
    handle: "wide-bootcut-flare-jeans",
    description: "Fitted through the knee with an authentic subtle bootcut kick out over footwear.",
    fitBadge: "BOOTCUT FLARE",
    specs: ["1970s Archive Fade", "Subtle Knee Flare", "Heavy Vintage Hem Stacking"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#2C4E75", "#416999"],
  },
  {
    id: "sa-officer-jeans",
    brand: "SECOND ARMY",
    category: "JEANS",
    title: "Reinforced Officer Trousers",
    subtitle: "Subtle field utility.",
    wash: "Olive Drab",
    price: 2499,
    image: "/olive_jeans.png",
    handle: "sa-officer-trousers-olive",
    description: "Heavy twill officer trousers with hidden cargo pockets and reinforced knee darts.",
    fitBadge: "OFFICER FIT",
    specs: ["Heavy Military Twill", "Articulated Knee Darts", "Hidden Pocket Flaps"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#48533E", "#2F3628"],
  },
  {
    id: "rbw-ankle-taper",
    brand: "RBW",
    category: "JEANS",
    title: "Ankle Taper Selvedge",
    subtitle: "Cropped length with sharp taper.",
    wash: "Clean Rinse",
    price: 1999,
    image: "/RBW-ankle.png",
    handle: "rbw-ankle-taper-jeans",
    description: "Modern cropped inseam engineered to rest cleanly above your sneakers and boots.",
    fitBadge: "ANKLE TAPER",
    specs: ["Cropped Inseam", "Sharp Ankle Taper", "Chambray Pocket Bags"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["#162940", "#264264"],
  },
  {
    id: "sa-canvas-belt",
    brand: "SECOND ARMY",
    category: "ACCESSORIES",
    title: "Tactical Web Belt",
    subtitle: "Heavy duty hardware.",
    wash: "Olive Webbing",
    price: 999,
    image: "/brands/rbw_accessories.jpg",
    handle: "sa-tactical-web-belt",
    description: "Mil-spec high tensile nylon webbing with quick release matte black alloy buckle.",
    fitBadge: "TACTICAL BELT",
    specs: ["High-Tensile Webbing", "Quick-Release Buckle", "Laser Engraved Logo"],
    sizes: ["ONE SIZE"],
    colors: ["#3D4A33", "#1B1B1B"],
  },
  {
    id: "ijns-denim-bucket",
    brand: "IJNS",
    category: "ACCESSORIES",
    title: "Denim Bucket Hat",
    subtitle: "Summer festival essential.",
    wash: "Bleached Indigo",
    price: 899,
    image: "/brands/rbw_accessories_v2.jpg",
    handle: "ijns-denim-bucket-hat",
    description: "Unstructured 100% cotton washed denim bucket hat with tonal topstitching.",
    fitBadge: "BUCKET HAT",
    specs: ["100% Washed Denim", "Stitched Brim", "Soft Cotton Sweatband"],
    sizes: ["S/M", "L/XL"],
    colors: ["#638DB6", "#2F4A6A"],
  },
];

const ALL_PRODUCTS: ExperienceProduct[] = [
  ...FEATURED_SHOWCASE,
  ...ADDITIONAL_PRODUCTS,
];

// Brand showcase cards (model on left, editorial info on right)
const BRAND_STORIES = [
  {
    name: "RBW",
    tagline: "Premium Everyday Denim",
    image: "/brands/rbw_men.jpg",
    bgColor: "#171513",
    cardBorder: "rgba(214, 186, 140, 0.22)",
    accentColor: "#E0CCA9",
    link: "/stores/rbw",
    brandFilter: "RBW" as BrandName,
    fontClass: "font-serif tracking-[0.06em] font-bold",
  },
  {
    name: "THINC",
    tagline: "Minimal. Modern. Made for You.",
    image: "/brands/thinc_men.jpg",
    bgColor: "#23201C",
    cardBorder: "rgba(220, 210, 195, 0.22)",
    accentColor: "#DDD4C8",
    link: "/stores/rbw",
    brandFilter: "THINC" as BrandName,
    fontClass: "font-sans tracking-[0.14em] font-semibold",
  },
  {
    name: "WIDE",
    tagline: "Loose Fit. Big Attitude.",
    image: "/brands/wide_men.jpg",
    bgColor: "#161920",
    cardBorder: "rgba(180, 195, 215, 0.22)",
    accentColor: "#C3D2E2",
    link: "/stores/rbw",
    brandFilter: "WIDE" as BrandName,
    fontClass: "font-serif italic tracking-normal font-black",
  },
  {
    name: "iJNS",
    tagline: "Young. Bold. Expressive.",
    image: "/brands/ijns_men.jpg",
    bgColor: "#2E2721",
    cardBorder: "rgba(225, 185, 150, 0.22)",
    accentColor: "#E6C4A6",
    link: "/stores/rbw",
    brandFilter: "IJNS" as BrandName,
    fontClass: "font-sans tracking-[0.04em] font-black",
  },
  {
    name: "SECOND ARMY",
    tagline: "Utility Meets Street.",
    image: "/brands/second-army_men.jpg",
    bgColor: "#1C1F17",
    cardBorder: "rgba(175, 188, 155, 0.22)",
    accentColor: "#BDCAA9",
    link: "/stores/rbw",
    brandFilter: "SECOND ARMY" as BrandName,
    fontClass: "font-mono tracking-[0.06em] font-bold text-[15px] sm:text-[16px] lg:text-[16.5px]",
  },
];

// ─── BRAND SHOWROOM DEFINITIONS (ORDER: RBW → THINC → WIDE → iJNS → SECOND ARMY) ───
export const BRAND_SHOWROOM_CONFIGS: BrandConfig[] = [
  {
    key: "RBW",
    name: "RBW",
    tagline: "PREMIUM EVERYDAY DENIM",
    description: "Timeless fits. Modern attitude. Denim designed for wherever life takes you.",
    storeLink: "/stores/rbw",
    showroomNumber: "01 / 05",
    composition: "spotlight",
    fontClass: "font-serif tracking-[0.02em] font-normal",
    isDark: false,
    bgImage: "/showroom_lightbox_bg.png",
    stageBg: "#EAE6DF",
    stageBorder: "#D8D0C2",
    accentColor: "#9E7B3B",
    glowColor: "#B9965A",
    headerTextColor: "#17140F",
    taglineColor: "#17140F",
    descColor: "#4A443C",
    badgeBg: "#EFEBE2",
    badgeColor: "#6E5A35",
    badgeBorder: "#D8D0C2",
    badgeText: "HERITAGE ATELIER",
    heroImage: "/brands/rbw_men.jpg",
    ctaBg: "#17140F",
    ctaTextColor: "#FFFFFF",
    ctaBorder: "#17140F",
    ctaButtonText: "EXPLORE RBW STORE",
    navArrowBg: "#FFFFFF",
    navArrowColor: "#17140F",
    navArrowBorder: "#D5CDC0",
    counterColor: "#6E6558",
  },
  {
    key: "THINC",
    name: "THINC",
    tagline: "MINIMAL. MODERN. MADE FOR YOU.",
    description: "Architectural precision, stripped-back styling, and tailored silhouettes crafted in natural ecru twills.",
    storeLink: "/stores/rbw",
    showroomNumber: "02 / 05",
    composition: "trio",
    fontClass: "font-sans tracking-[0.12em] font-bold",
    isDark: false,
    bgImage: "/showroom_lightbox_bg.png",
    stageBg: "#FAF8F5",
    stageBorder: "#DDD5C7",
    accentColor: "#7C7365",
    glowColor: "#8C8273",
    headerTextColor: "#17140F",
    taglineColor: "#17140F",
    descColor: "#4A443C",
    badgeBg: "#EAE4D8",
    badgeColor: "#4E473C",
    badgeBorder: "#D2C8B8",
    badgeText: "MINIMALIST LAB",
    heroImage: "/brands/thinc_men.jpg",
    ctaBg: "#17140F",
    ctaTextColor: "#FFFFFF",
    ctaBorder: "#17140F",
    ctaButtonText: "EXPLORE THINC STORE",
    navArrowBg: "#FFFFFF",
    navArrowColor: "#17140F",
    navArrowBorder: "#D8D0C2",
    counterColor: "#736B5E",
  },
  {
    key: "WIDE",
    name: "WIDE",
    tagline: "LOOSE FIT. BIG ATTITUDE.",
    description: "Exaggerated baggy skater cuts, relaxed carpenter details, and heavyweight enzyme washes with unapologetic volume.",
    storeLink: "/stores/rbw",
    showroomNumber: "03 / 05",
    composition: "streetwear",
    fontClass: "font-serif italic tracking-tight font-black",
    isDark: false,
    bgImage: "/showroom_lightbox_bg.png",
    stageBg: "#EDE9E1",
    stageBorder: "#D0C9BD",
    accentColor: "#356B98",
    glowColor: "#568CB8",
    headerTextColor: "#17140F",
    taglineColor: "#17140F",
    descColor: "#4A443C",
    badgeBg: "#E2EAF1",
    badgeColor: "#245075",
    badgeBorder: "#C5D5E3",
    badgeText: "STREET SILHOUETTES",
    heroImage: "/brands/wide_men.jpg",
    ctaBg: "#17140F",
    ctaTextColor: "#FFFFFF",
    ctaBorder: "#17140F",
    ctaButtonText: "EXPLORE WIDE STORE",
    navArrowBg: "#FFFFFF",
    navArrowColor: "#17140F",
    navArrowBorder: "#CBD5E1",
    counterColor: "#64748B",
  },
  {
    key: "IJNS",
    name: "iJNS",
    tagline: "YOUNG. BOLD. EXPRESSIVE.",
    description: "High-contrast bleached acid fades, distressed raw hems, and expressive Y2K silhouettes designed for the new generation.",
    storeLink: "/stores/rbw",
    showroomNumber: "04 / 05",
    composition: "energetic",
    fontClass: "font-sans tracking-[0.06em] font-black",
    isDark: false,
    bgImage: "/showroom_lightbox_bg.png",
    stageBg: "#FBF9F5",
    stageBorder: "#C8DBEC",
    accentColor: "#1D63ED",
    glowColor: "#3B82F6",
    headerTextColor: "#17140F",
    taglineColor: "#17140F",
    descColor: "#4A443C",
    badgeBg: "#E1EDF8",
    badgeColor: "#164EBA",
    badgeBorder: "#BCD4EB",
    badgeText: "EXPRESSIVE YOUTH",
    heroImage: "/brands/ijns_men.jpg",
    ctaBg: "#17140F",
    ctaTextColor: "#FFFFFF",
    ctaBorder: "#17140F",
    ctaButtonText: "EXPLORE iJNS STORE",
    navArrowBg: "#FFFFFF",
    navArrowColor: "#17140F",
    navArrowBorder: "#C5D9EC",
    counterColor: "#53677F",
  },
  {
    key: "SECOND ARMY",
    name: "SECOND ARMY",
    tagline: "UTILITY MEETS STREET.",
    description: "Military-grade ripstop cotton, reinforced field pockets, articulated knees, and tactical utilitarian hardware.",
    storeLink: "/stores/rbw",
    showroomNumber: "05 / 05",
    composition: "utility",
    fontClass: "font-mono tracking-[0.06em] font-bold",
    isDark: false,
    bgImage: "/showroom_lightbox_bg.png",
    stageBg: "#ECECE4",
    stageBorder: "#D2D4C6",
    accentColor: "#5A6E3E",
    glowColor: "#748756",
    headerTextColor: "#17140F",
    taglineColor: "#17140F",
    descColor: "#4A443C",
    badgeBg: "#E4E8DC",
    badgeColor: "#3E4E2A",
    badgeBorder: "#C8D1BE",
    badgeText: "TACTICAL UTILITY",
    heroImage: "/brands/second-army_men.jpg",
    ctaBg: "#17140F",
    ctaTextColor: "#FFFFFF",
    ctaBorder: "#17140F",
    ctaButtonText: "EXPLORE SECOND ARMY STORE",
    navArrowBg: "#FFFFFF",
    navArrowColor: "#17140F",
    navArrowBorder: "#C6CEBC",
    counterColor: "#616E56",
  },
];

export const ALL_BRANDS_CONFIG: BrandConfig = {
  key: "RBW",
  name: "THE SHOWROOM",
  tagline: "ALL BRANDS. ONE DESTINATION.",
  description: "Timeless fits. Modern attitude. Denim designed for wherever life takes you.",
  storeLink: "/collection/all",
  showroomNumber: "01-05 / ALL",
  composition: "spotlight",
  fontClass: "font-serif tracking-[0.02em] font-normal",
  isDark: false,
  bgImage: "/showroom_lightbox_bg.png",
  stageBg: "#EAE6DF",
  stageBorder: "#D8D0C2",
  accentColor: "#9E7B3B",
  glowColor: "#B9965A",
  headerTextColor: "#17140F",
  taglineColor: "#17140F",
  descColor: "#4A443C",
  badgeBg: "#EFEBE2",
  badgeColor: "#6E5A35",
  badgeBorder: "#D8D0C2",
  badgeText: "CURATED EXHIBITION",
  ctaBg: "#17140F",
  ctaTextColor: "#FFFFFF",
  ctaBorder: "#17140F",
  ctaButtonText: "EXPLORE ALL BRANDS",
  navArrowBg: "#FFFFFF",
  navArrowColor: "#17140F",
  navArrowBorder: "#D5CDC0",
  counterColor: "#6E6558",
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  item: ExperienceProduct;
  onAddToCart: () => void;
  isAdding: boolean;
  onQuickView: () => void;
}

function ProductCard({ item, onAddToCart, isAdding, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col bg-white border border-[#E2DCD0] rounded-[14px] overflow-hidden group shadow-[0_2px_10px_rgba(23,20,15,0.04)] hover:shadow-[0_8px_22px_rgba(23,20,15,0.08)] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container — Consistent 4:5 showroom display */}
      <div
        onClick={onQuickView}
        className="relative m-1.5 sm:m-2 aspect-[4/5] bg-[#F7F4EE] border border-[#EDE7DC] rounded-[8px] sm:rounded-[10px] overflow-hidden flex items-center justify-center p-2 sm:p-3 cursor-pointer select-none"
      >
        {/* Brand Badge — Small & elegant */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 pointer-events-none">
          <span
            className="inline-block px-1.5 py-0.5 sm:px-2 rounded-[3px] text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.14em] uppercase"
            style={{
              background: "rgba(250, 246, 238, 0.95)",
              color: "#8C6D37",
              border: "1px solid #DFD2BC",
            }}
          >
            {item.brand}
          </span>
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((v) => !v);
          }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 p-1 sm:p-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-[#E8E2D4] hover:bg-white transition-all cursor-pointer shadow-xs active:scale-95"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${isWishlisted ? "fill-[#D4503A] text-[#D4503A]" : "text-[#8A857C]"
              }`}
          />
        </button>

        {/* Product Object */}
        <Image
          src={isHovered && item.hoverImage ? item.hoverImage : item.image}
          alt={item.title}
          fill
          className="object-contain p-2 sm:p-2.5 transition-transform duration-400 ease-out group-hover:scale-106"
          unoptimized
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 pt-1 sm:pt-1.5 pb-2.5 sm:pb-3.5 flex-1 justify-between bg-white">
        <div>
          {/* Title */}
          <p
            className="text-[12px] sm:text-[13px] font-bold text-[#17140F] leading-snug cursor-pointer hover:text-[#7A5C28] transition-colors line-clamp-1 font-sans tracking-tight"
            onClick={onQuickView}
          >
            {item.title}
          </p>
          {/* Subtitle */}
          <p className="text-[10px] sm:text-[11px] text-[#78716C] mt-0.5 leading-tight line-clamp-1 font-sans">
            {item.subtitle}
          </p>
        </div>

        {/* Price & Swatches */}
        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
          <p
            className="text-[12px] sm:text-[13px] font-bold text-[#17140F]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            ₹{item.price.toLocaleString("en-IN")}
          </p>

          {/* Color Swatches */}
          {item.colors && item.colors.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {item.colors.map((hex, i) => (
                <span
                  key={i}
                  className="w-[7.5px] h-[7.5px] sm:w-[8.5px] sm:h-[8.5px] rounded-full border border-[#D5CDBD] flex-shrink-0"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add to Bag Button */}
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="w-full flex items-center justify-center py-2 sm:py-2.5 min-h-[35px] sm:min-h-[38px] rounded-[6px] text-[9.5px] sm:text-[10px] font-bold tracking-[0.14em] uppercase transition-all cursor-pointer mt-1 active:scale-[0.98] font-sans"
          style={{
            background: isAdding ? "#4A453E" : "#17140F",
            color: "#FFFFFF",
          }}
        >
          {isAdding ? (
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              ADDED
            </span>
          ) : (
            "ADD TO BAG"
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── MAIN EXPERIENCE CENTER PAGE ─────────────────────────────────────────────

export default function ExperienceCenterPage() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedBrands, setSelectedBrands] = useState<BrandName[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<any | null>(null);
  const [quickViewSize, setQuickViewSize] = useState<string>("32");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Hide global site footer — this page has its own minimal footer strip matching mockup
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => document.body.classList.remove("hide-footer");
  }, []);

  const handleToggleBrand = (brand: BrandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleClearBrands = () => {
    setSelectedBrands([]);
  };

  const handleToggleCategory = (category: CategoryType) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleResetAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSearchQuery("");
    setSortBy("featured");
  };

  const BRANDS_LIST: { label: string; value: BrandName }[] = [
    { label: "RBW", value: "RBW" },
    { label: "THINC", value: "THINC" },
    { label: "WIDE", value: "WIDE" },
    { label: "iJNS", value: "IJNS" },
    { label: "SECOND ARMY", value: "SECOND ARMY" },
  ];

  const CATEGORIES_LIST: { label: string; value: CategoryType }[] = [
    { label: "JEANS", value: "JEANS" },
    { label: "JACKETS", value: "JACKETS" },
    { label: "SHORTS", value: "SHORTS" },
    { label: "ACCESSORIES", value: "ACCESSORIES" },
  ];

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let arr = ALL_PRODUCTS.filter((p) => {
      const matchBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchCat =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      const matchSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.wash.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (Boolean(p.fitBadge) && p.fitBadge!.toLowerCase().includes(query)) ||
        (Array.isArray(p.specs) && p.specs.some((s) => s.toLowerCase().includes(query)));
      return matchBrand && matchCat && matchSearch;
    });

    if (sortBy === "price-asc") arr = [...arr].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") arr = [...arr].sort((a, b) => b.price - a.price);

    return arr;
  }, [selectedBrands, selectedCategories, searchQuery, sortBy]);

  const currentBrandConfig = useMemo(() => {
    if (selectedBrands.length === 1) {
      return (
        BRAND_SHOWROOM_CONFIGS.find((b) => b.key === selectedBrands[0]) ||
        ALL_BRANDS_CONFIG
      );
    }
    return ALL_BRANDS_CONFIG;
  }, [selectedBrands]);

  const handleAddToCart = async (item: ExperienceProduct) => {
    setAddingId(item.id);
    try {
      const variantId = `gid://shopify/ProductVariant/exp_${item.id}`;
      await addToCart(
        variantId,
        1,
        {
          title: item.title,
          price: item.price,
          image: item.image,
        },
        true
      );
      showToast({
        title: "Added to Bag",
        message: `${item.title} added successfully!`,
        type: "success",
        duration: 3000,
      });
    } catch {
      showToast({
        title: "Added to Bag",
        message: `${item.title} added.`,
        type: "info",
        duration: 2500,
      });
    } finally {
      setTimeout(() => setAddingId(null), 800);
    }
  };

  const openQuickView = (item: ExperienceProduct) => {
    setQuickViewSize(item.sizes?.[0] || "32");
    setQuickViewItem({
      id: item.id,
      title: item.title,
      handle: item.handle,
      description: item.description,
      priceRange: {
        minVariantPrice: { amount: item.price.toString(), currencyCode: "INR" },
      },
      images: {
        edges: [
          { node: { url: item.image, altText: item.title } },
          { node: { url: item.hoverImage || item.image, altText: item.title } },
        ],
      },
      options: [
        {
          name: "Size",
          values: item.sizes || ["28", "30", "32", "34", "36", "38"],
        },
      ],
      tags: [`wash:${item.wash}`],
    });
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          EXPERIENCE CENTER: FILTERS & ROTATING SHOWROOM PANEL
      ═══════════════════════════════════════════════════════════════════ */}
      <main className="w-full h-[100dvh] overflow-hidden bg-[#EFE9DF] pb-0 pt-0">
        {/* ─── 1. MOBILE LUXURY SHOWROOM EXHIBITION (<1024px) ─── */}
        <div className="lg:hidden w-full h-[100dvh] overflow-hidden">
          <MobileShowroomExperience
            products={filtered}
            onAddToCart={handleAddToCart}
            addingId={addingId}
            onQuickView={openQuickView}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            onClearBrands={handleClearBrands}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onClearCategories={handleClearCategories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetAll={handleResetAll}
          />
        </div>

        {/* ─── 2. DESKTOP PANORAMIC ARCHITECTURAL SHOWROOM (≥1024px) ─── */}
        <div className="hidden lg:flex flex-col w-full h-[100dvh] overflow-hidden">
          {/* Sticky Filter Toolbar */}
          <StickyShopFilters
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            onClearBrands={handleClearBrands}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onClearCategories={handleClearCategories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetAll={handleResetAll}
            brandsList={BRANDS_LIST}
            categoriesList={CATEGORIES_LIST}
          />

          {/* Unified Single Brand Showroom Runway Section (Full Width Edge-to-Edge) */}
          <div className="w-full flex-1 min-h-0 relative flex flex-col overflow-hidden">
            {filtered.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#EFE9DF]">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                  <Image
                    src="/showroom_lightbox_bg.png"
                    alt="Only Denims Architectural Showroom"
                    fill
                    priority
                    className="object-cover object-center pointer-events-none opacity-30 blur-xs"
                  />
                  <div className="absolute inset-0 bg-[#EFE9DF]/50 pointer-events-none" />
                </div>
                <div className="relative z-10 py-12 px-8 text-center bg-white/95 backdrop-blur-md rounded-[20px] border border-[#ECE7DC] shadow-xl max-w-lg mx-auto">
                  <p className="text-[18px] font-serif font-bold text-[#17140F] mb-1">
                    {searchQuery ? `No products found for “${searchQuery}”` : "No Showroom Pieces Found"}
                  </p>
                  <p className="text-[#78716C] text-xs mb-5 font-sans">
                    {searchQuery
                      ? "Check for typos or try searching for another style, brand, or wash."
                      : "No products matched your active filters."}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-5 py-2.5 rounded-full bg-[#17140F] text-white text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer hover:opacity-85 font-sans transition-opacity"
                      >
                        CLEAR SEARCH
                      </button>
                    )}
                    <button
                      onClick={handleResetAll}
                      className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer font-sans transition-colors"
                    >
                      RESET ALL FILTERS
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <BrandShowroomSection
                key={selectedBrands.join("-") || "ALL"}
                brand={currentBrandConfig}
                products={filtered}
                onAddToCart={handleAddToCart}
                addingId={addingId}
                onQuickView={openQuickView}
                allBrands={[
                  { number: "01", name: "RBW", key: "RBW" },
                  { number: "02", name: "THINC", key: "THINC" },
                  { number: "03", name: "WIDE", key: "WIDE" },
                  { number: "04", name: "iJNS", key: "IJNS" },
                  { number: "05", name: "SECOND ARMY", key: "SECOND ARMY" },
                ]}
                onSelectBrand={handleToggleBrand}
              />
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        quickViewProduct={quickViewItem}
        setQuickViewProduct={setQuickViewItem}
        quickViewSelectedSize={quickViewSize}
        setQuickViewSelectedSize={setQuickViewSize}
        addToCart={(variantId, qty, meta) => {
          addToCart(variantId, qty, meta, true).catch(() => { });
        }}
      />
    </>
  );
}
