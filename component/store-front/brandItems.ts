import { ALL_SHOWROOM_ITEMS, type CarouselItemData } from "@/component/rbw/3d/RbwOrbitCarousel";
import type { ClientProduct, ClientStoreConfig, StoreColor } from "@/lib/stores/types";

export type Atmosphere = "raw" | "black" | "white";

/** Relative luminance of a #rrggbb colour, 0 (black) … 1 (white). */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Picks which of RBW's three studio lighting recipes suits a brand colour. */
export function atmosphereFor(hex: string): Atmosphere {
  const l = luminance(hex);
  if (l < 0.06) return "black";
  if (l > 0.55) return "white";
  return "raw";
}

export const fmtPrice = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

/** Product shown for a category × colour on the carousel: the first fit that exists. */
export function representative(products: ClientProduct[], config: ClientStoreConfig, categoryId: string, colorId: string) {
  const fits = config.fits[categoryId] || [];
  const matches = products.filter((p) => p.categoryId === categoryId && p.colorId === colorId);
  if (!matches.length) return undefined;
  return [...matches].sort((a, b) => {
    const ia = a.fit ? fits.indexOf(a.fit) : -1;
    const ib = b.fit ? fits.indexOf(b.fit) : -1;
    return ia - ib;
  })[0];
}

/**
 * One carousel card per category × colour that has a product. Visual style
 * (text texture, button colours) is borrowed from RBW's own jeans cards for the
 * matching lighting recipe, so a brand's carousel looks exactly like RBW's.
 */
export function buildCarouselItems(config: ClientStoreConfig, products: ClientProduct[]): CarouselItemData[] {
  const tpl = (atm: Atmosphere) =>
    ALL_SHOWROOM_ITEMS.find((i) => i.category === "jeans" && i.washKey === atm) ?? ALL_SHOWROOM_ITEMS[0];
  const items: CarouselItemData[] = [];
  for (const cat of config.categories) {
    for (const color of config.colors) {
      const rep = representative(products, config, cat.id, color.id);
      if (!rep) continue;
      const atm = atmosphereFor(color.hex);
      const base = tpl(atm);
      const catProducts = products.filter((p) => p.categoryId === cat.id && p.colorId === color.id);
      const lowest = Math.min(...catProducts.map((p) => p.price));
      const fits = config.fits[cat.id] || [];
      items.push({
        ...base,
        id: `${cat.id}__${color.id}`,
        category: cat.id as CarouselItemData["category"],
        type: "image",
        washKey: color.id as CarouselItemData["washKey"],
        atmosphere: atm,
        colorName: color.name,
        colorHex: color.hex,
        availableSizes: undefined,
        fitType: undefined,
        discountPct: undefined,
        originalPrice: undefined,
        name: rep.name,
        sublabel: fits.length ? `${fits.length} fit${fits.length > 1 ? "s" : ""}` : cat.label,
        tagline: color.name.toUpperCase(),
        modelPath: undefined,
        imagePath: rep.imageUrls[0],
        price: catProducts.length > 1 ? `from ${fmtPrice(lowest)}` : fmtPrice(lowest),
        accentHex: color.hex,
        btnText: `SHOP ${color.name.toUpperCase()} →`,
        shopHref: "#",
        categoryBadge: cat.label.toUpperCase(),
      });
    }
  }
  return items;
}

export function colorsForCategory(config: ClientStoreConfig, products: ClientProduct[], categoryId: string): StoreColor[] {
  return config.colors.filter((c) => products.some((p) => p.categoryId === categoryId && p.colorId === c.id));
}
