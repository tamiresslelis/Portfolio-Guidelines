import { useEffect, useRef, useState, type RefObject } from "react";

// How long to wait after the container stops changing size before actually
// applying the new width. The window-resize drag (see useResizableWindow)
// can fire a ResizeObserver callback dozens of times per second while the
// pointer is moving; without this, every one of those would ask react-pdf
// to re-rasterize the page at a new scale. The very first measurement
// (below) skips this delay so the initial PDF render isn't held up by it.
const RESIZE_DEBOUNCE_MS = 80;

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
  const hasMeasuredRef = useRef(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = entry.contentRect.width;

      if (!hasMeasuredRef.current) {
        hasMeasuredRef.current = true;
        setWidth(nextWidth);
        return;
      }

      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = window.setTimeout(() => {
        debounceTimeoutRef.current = null;
        setWidth(nextWidth);
      }, RESIZE_DEBOUNCE_MS);
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (debounceTimeoutRef.current !== null) window.clearTimeout(debounceTimeoutRef.current);
    };
  }, [containerRef]);

  return Math.min(width, maxWidth);
}
