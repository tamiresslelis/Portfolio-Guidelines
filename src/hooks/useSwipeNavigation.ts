import { useEffect, type RefObject } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD_PX = 50;
const MAX_VERTICAL_DRIFT_PX = 75;

/**
 * Minimal touch-swipe detector, built on native touch events — no gesture
 * library required. Swiping left advances to the next slide, swiping right
 * goes back, mirroring the Left/Right arrow keys from
 * `useKeyboardNavigation`. Vertical scrolling is left alone: a swipe with
 * too much vertical drift is ignored.
 */
export function useSwipeNavigation(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers,
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (Math.abs(deltaY) > MAX_VERTICAL_DRIFT_PX) return;
      if (deltaX <= -SWIPE_THRESHOLD_PX) onSwipeLeft?.();
      else if (deltaX >= SWIPE_THRESHOLD_PX) onSwipeRight?.();
    };

    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
