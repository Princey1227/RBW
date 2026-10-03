"use client";

import Image from "next/image";
import { CollectionKey } from "./CollectionData";
import { useTheme } from "../../app/theme-provider";
import { useCart } from "../../context/CartContext";

interface CollectionCategoryCardProps {
    title: string;
    price: number;
    collectionKey: CollectionKey;
}

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

export default function CollectionCategoryCard({
    title,
    price,
    collectionKey,
}: CollectionCategoryCardProps) {
    const { theme } = useTheme();
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const variantId = `gid://shopify/ProductVariant/${collectionKey}_${title.toLowerCase().replace(/\s+/g, "_")}`;
        addToCart(variantId, 1, {
            title: `${collectionKey.toUpperCase()} - ${title}`,
            price,
            image: IMAGE_MAP[collectionKey],
        });
    };

    const headerText = theme === "light" 
        ? "text-slate-800" 
        : "text-[#d7a33c]";
        
    const imageBg = "bg-transparent";
    
    const priceText = theme === "light" ? "text-slate-900" : "text-[#d7a33c]";
    
    const buttonStyle = theme === "light" 
        ? "border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white" 
        : "border-[#d7a33c] text-[#d7a33c] hover:bg-[#d7a33c] hover:text-black";

    return (
        <div
            className="w-[170px] transition-all duration-500 ease-out group cursor-pointer bg-transparent hover:-translate-y-1.5"
        >
            {/* Title */}
            <h3
                className={`
                  text-center
                  font-bold
                  py-3
                  tracking-[0.15em]
                  transition-colors duration-300
                  ${headerText}
                  ${theme === "light" ? "group-hover:text-black" : "group-hover:text-white"}
                `}
                style={{
                    fontFamily: "'Montserrat', sans-serif",
                }}
            >
                {title.replace(/Denims/gi, 'Denim')}
            </h3>

            {/* Image */}
            <div className={`relative w-full h-[220px] transition-colors duration-500 overflow-hidden ${imageBg}`}>
                <Image
                    src={IMAGE_MAP[collectionKey]}
                    alt={title.replace(/Denims/gi, 'Denim')}
                    fill
                    sizes="170px"
                    className="
                      object-cover
                      transition-transform
                      duration-[800ms]
                      ease-out
                      group-hover:scale-110
                    "
                />
            </div>

            {/* Price */}
            <div className="mt-3 text-center px-3 pb-3">
                <p
                    className={`
                      text-xl
                      font-extrabold
                      tracking-wide
                      transition-colors duration-300
                      ${priceText}
                    `}
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                    }}
                >
                    ₹ {price.toLocaleString('en-IN')}
                </p>

                <button
                    onClick={handleAddToCart}
                    className={`
                      mt-3
                      w-full
                      border
                      py-2
                      text-[10px]
                      font-bold
                      tracking-[0.2em]
                      transition-all
                      duration-300
                      ${buttonStyle}
                      group-hover:tracking-[0.25em]
                    `}
                >
                    SHOP NOW
                </button>
            </div>
        </div>
    );
}
