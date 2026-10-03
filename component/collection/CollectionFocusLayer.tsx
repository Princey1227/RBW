import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Image from "next/image";
import CollectionCategoryCard from "./CollectionCategoryCard";

import {
  collectionData,
  CollectionKey,
} from "./CollectionData";

import { useTheme } from "../../app/theme-provider";
import { useCart } from "../../context/CartContext";

const IMAGE_MAP: Record<CollectionKey, string> = {
  raw: "/raw_jeans_v2.png",
  black: "/black_jeans_v2.png",
  white: "/white_jeans_v2.png",
  indigo: "/raw_jeans_v2.png",
  vintage: "/black_jeans_v2.png",
  ecru: "/white_jeans_v2.png",
  olive: "/olive_jeans.png",
  camo: "/camo_jeans.png",
  desert: "/khaki_jeans.png",
};

const getMobileSpecs = (id: string) => {
  switch (id) {
    case "ankle":
      return "Ankle-length crop, modern taper, and clean tailored leg. Woven from 14.5oz shuttle-loomed selvedge denim.";
    case "slim":
      return "Classic slim fit with a tailored thigh and narrow leg opening. Finished with reinforced copper rivets and signature stitching.";
    case "comfort":
      return "Relaxed comfort fit with a straight thigh and comfortable medium rise. Perfect for high-durability daily wear.";
    case "straight":
      return "Timeless straight cut with a classic mid-century silhouette. Showcases vintage drape and clean selvedge chainstitch hem.";
    case "baggy":
      return "Loose baggy fit with exaggerated leg volume and contemporary streetwear drape. Maximum comfort and bold styling.";
    case "bootcut":
      return "Slight flare at the hem, traditional bootcut styling, and a sleek high-rise profile. Ideal over boots or sneakers.";
    case "barrel":
      return "Artistic curved barrel leg silhouette with a relaxed ankle crop. A forward-looking, design-focused fit.";
    default:
      return "Premium custom-fit denim jeans with hand-sanded details, premium metal rivets, and premium shuttle-loomed structure.";
  }
};

interface Props {
  activeCollection: CollectionKey | null;
  sourceRect: DOMRect | null;
  isClosing: boolean;
  onClose: () => void;
}

const CARD_WIDTH = 170;
const GAP = 36;

const COLLECTION_GLOWS: Record<CollectionKey, string> = {
  raw: "from-[#0b1931]/60 to-[#1e3a8a]/20",
  indigo: "from-[#0d2240]/60 to-[#1d4ed8]/20",
  black: "from-[#1f2937]/50 to-transparent",
  vintage: "from-[#374151]/50 to-transparent",
  white: "from-[#f1f5f9]/30 to-transparent",
  ecru: "from-[#fef3c7]/30 to-transparent",
  olive: "from-[#1e2912]/60 to-[#3f6212]/20",
  camo: "from-[#141b0f]/60 to-[#273e1b]/20",
  desert: "from-[#ebdeb9]/40 to-[#f59e0b]/10",
};

export default function CollectionFocusLayer({
  activeCollection,
  sourceRect,
  isClosing,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [isMobile, setIsMobile] = useState(false);

  // Drag-to-scroll refs and states
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startXDrag, setStartXDrag] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const dragDistance = useRef(0);
  const startXDragPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    startXDragPos.current = e.pageX;
    dragDistance.current = 0;
    setStartXDrag(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXDrag) * 1.5; // scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;

    const diff = Math.abs(e.pageX - startXDragPos.current);
    if (diff > 5) {
      dragDistance.current = diff;
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const totalScrollable = scrollWidth - clientWidth;
    if (totalScrollable <= 0) {
      setScrollProgress(0);
      return;
    }
    const progress = (scrollLeft / totalScrollable) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const collection = useMemo(() => {
    if (!activeCollection) return null;

    return collectionData[
      activeCollection
    ];
  }, [activeCollection]);

  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [onClose]);

  if (
    !collection ||
    !sourceRect ||
    !activeCollection
  ) {
    return null;
  }

  const originX =
    sourceRect.left +
    sourceRect.width / 2;

  const originY =
    sourceRect.top +
    sourceRect.height / 2;

  const totalWidth =
    collection.categories.length *
    CARD_WIDTH +
    (collection.categories.length - 1) *
    GAP;

  const startX =
    (window.innerWidth -
      totalWidth) /
    2;

  const targetY = Math.max(
    140,
    window.innerHeight * 0.28
  );

  return (
    <AnimatePresence>
      <>
        {/* Overlay with Premium Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: isClosing ? 0 : 1,
          }}
          transition={{
            duration: 0.3,
          }}
          onClick={onClose}
          className={`
            fixed
            inset-0
            z-[120]
            backdrop-blur-md
            transition-colors duration-300
            ${theme === "light" ? "bg-white/40" : "bg-black/60"}
          `}
        />

        {/* Editorial Accent Glow Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isClosing ? 0 : 1,
            scale: isClosing ? 0.8 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`
            fixed
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[70vw]
            h-[70vw]
            max-w-[700px]
            max-h-[700px]
            rounded-full
            bg-gradient-to-r
            ${activeCollection ? COLLECTION_GLOWS[activeCollection] : "from-transparent to-transparent"}
            blur-[100px]
            pointer-events-none
            z-[122]
          `}
        />

        {/* Giant Editorial Background Watermark */}
        <motion.div
          initial={{ opacity: 0, y: 30, letterSpacing: "0.15em" }}
          animate={{
            opacity: isClosing ? 0 : theme === "light" ? 0.05 : 0.03,
            y: isClosing ? 30 : 0,
            letterSpacing: "0.3em"
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`
            fixed
            left-1/2
            top-[45%]
            -translate-x-1/2
            -translate-y-1/2
            z-[125]
            select-none
            pointer-events-none
            font-extrabold
            text-center
            uppercase
            text-[11vw]
            leading-none
            ${theme === "light" ? "text-slate-900" : "text-white"}
          `}
          style={{
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {activeCollection}
        </motion.div>

        {/* Top Gradient Mask to hide/fade blurred Navbar items underneath */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 inset-x-0 h-[85px] md:h-[105px] bg-gradient-to-b from-background via-background/90 to-transparent z-[135] pointer-events-none"
        />

        {/* Mobile Header Title */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? -20 : 0 }}
            className="fixed top-6 left-6 z-[140] select-none"
          >
            <h2 className="text-[#d7a33c] text-sm font-serif tracking-[0.25em] uppercase">
              {activeCollection}
            </h2>
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: isClosing ? 0 : 1,
            scale: isClosing ? 0.9 : 1,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            duration: 0.25,
          }}
          onClick={onClose}
          className={`
            fixed
            top-4
            right-6
            z-[140]
            border
            px-4
            py-1.5
            text-[10px]
            tracking-[0.22em]
            transition-all
            md:top-6
            md:right-8
            md:px-5
            md:py-2
            md:text-xs
            ${theme === "light"
              ? "border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
              : "border-white/20 text-white hover:bg-white hover:text-black"
            }
          `}
        >
          CLOSE
        </motion.button>

        {/* Categories rendering */}
        {isMobile ? (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="fixed inset-x-0 top-[15%] bottom-[5%] z-[130] overflow-y-auto px-4 pb-12"
          >
            <div className="max-w-md mx-auto space-y-4 pt-4">
              {collection.categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    p-4
                    border
                    rounded-lg
                    flex
                    gap-4
                    items-center
                    ${theme === "light"
                      ? "bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                      : "bg-[#0b0f16]/90 border-[#b88a2c]/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                    }
                  `}
                >
                  {/* Left Side: Product Image with Tag */}
                  <div className="relative w-28 h-36 shrink-0 rounded-md overflow-hidden bg-slate-900/5">
                    <Image
                      src={IMAGE_MAP[activeCollection]}
                      alt={category.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#d7a33c] text-black text-[7px] tracking-[0.2em] font-black px-1.5 py-0.5 rounded font-mono">
                      FIT-{String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Right Side: Details & Action */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 h-36 py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[8px] tracking-[0.25em] text-[#d7a33c] font-mono uppercase block">
                            {activeCollection} SERIES
                          </span>
                          <h3 className={`text-base font-serif tracking-wider font-extrabold mt-1 leading-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                            {category.name} FIT
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-[#d7a33c] font-mono block">
                            ₹ {category.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <p className={`text-[10px] leading-relaxed tracking-wide mt-2.5 line-clamp-2 font-medium ${theme === "light" ? "text-slate-500" : "text-white/40"}`}>
                        {getMobileSpecs(category.id)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const variantId = `gid://shopify/ProductVariant/${activeCollection}_${category.name.toLowerCase().replace(/\s+/g, "_")}`;
                        addToCart(variantId, 1, {
                          title: `${activeCollection?.toUpperCase()} - ${category.name}`,
                          price: category.price,
                          image: IMAGE_MAP[activeCollection],
                        });
                      }}
                      className={`
                        w-full
                        py-2.5
                        text-[8px]
                        font-black
                        tracking-[0.3em]
                        uppercase
                        transition-all
                        duration-300
                        rounded-[4px]
                        border
                        ${theme === "light"
                          ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                          : "bg-[#d7a33c] border-[#d7a33c] text-black hover:bg-[#c5932f]"
                        }
                      `}
                    >
                      SHOP NOW
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
            onClick={(e) => {
              if (dragDistance.current > 5) {
                dragDistance.current = 0;
                return;
              }
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className={`
              fixed
              inset-x-0
              top-[20%]
              bottom-[10%]
              z-[130]
              flex
              items-center
              overflow-x-auto
              snap-x
              snap-mandatory
              scrollbar-none
              [&::-webkit-scrollbar]:hidden
              px-6
              md:px-12
              justify-start
              ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}
            `}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              onClick={(e) => {
                if (dragDistance.current > 5) {
                  dragDistance.current = 0;
                  return;
                }
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
              className="flex gap-6 md:gap-9 mx-auto py-6 min-w-max px-8 pointer-events-auto"
            >
              {collection.categories.map((category, index) => {
                const targetX = startX + index * (CARD_WIDTH + GAP);
                const initialX = originX - targetX - CARD_WIDTH / 2;

                return (
                  <motion.div
                    key={category.id}
                    initial={{
                      opacity: 0,
                      scale: 0.3,
                      x: initialX,
                      y: originY - targetY,
                      rotate: index % 2 === 0 ? -3 : 3,
                    }}
                    animate={
                      isClosing
                        ? {
                          opacity: 0,
                          scale: 0.3,
                          x: initialX,
                          y: originY - targetY,
                          rotate: index % 2 === 0 ? -3 : 3,
                        }
                        : {
                          opacity: 1,
                          scale: 1,
                          x: 0,
                          y: 0,
                          rotate: 0,
                        }
                    }
                    transition={
                      isClosing
                        ? {
                          duration: 0.3,
                          ease: "easeInOut",
                        }
                        : {
                          type: "spring",
                          stiffness: 280,
                          damping: 24,
                          mass: 0.8,
                          delay: index * 0.04,
                        }
                    }
                    whileHover={
                      !isClosing
                        ? {
                          y: -15,
                          scale: 1.04,
                          transition: { type: "spring", stiffness: 400, damping: 15 }
                        }
                        : undefined
                    }
                    className="shrink-0 snap-center py-4"
                    onClick={(e) => {
                      // Prevent click actions if we dragged significantly
                      if (dragDistance.current > 5) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                    }}
                  >
                    <CollectionCategoryCard
                      title={category.name}
                      price={category.price}
                      collectionKey={activeCollection}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scroll Progress Bar for Tablet/Desktop */}
        {!isMobile && collection.categories.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isClosing ? 0 : 0.6, y: isClosing ? 10 : 0 }}
            transition={{ delay: 0.4 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[140] pointer-events-none select-none"
          >
            <div className="w-48 h-[2px] bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d7a33c] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <span className="text-[9px] tracking-[0.25em] text-[#d7a33c]/80 uppercase font-bold">
              Drag or Scroll to Explore
            </span>
          </motion.div>
        )}
      </>
    </AnimatePresence>
  );
}