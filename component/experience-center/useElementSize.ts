"use client";

import { useEffect, useRef, useState } from "react";

/** Track an element's rendered pixel size (ResizeObserver). Defaults are SSR-safe. */
export function useElementSize<T extends HTMLElement>(initial = { w: 1440, h: 790 }) {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}
