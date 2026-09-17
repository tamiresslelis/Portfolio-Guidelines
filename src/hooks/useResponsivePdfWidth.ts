import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks a container's available width via `ResizeObserver` (not
 * `window.innerWidth` — the container can be narrower than the viewport,
 * e.g. the case window's own padding, or the maximized-vs-floating window
 * size) and caps it at `maxWidth`. Feed the result straight into react-pdf's
 * `<Page width={...}>`: it derives its own render scale from that CSS width
 * against the PDF's intrinsic point size, so this hook only ever deals in
 * CSS pixels, never a render/device scale.
 */
export function useResponsivePdfWidth(
  containerRef: RefObject<HTMLElement | null>,
  maxWidth: number,
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef]);

  return Math.min(width, maxWidth);
}
