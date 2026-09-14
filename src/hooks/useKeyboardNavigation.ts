import { useEffect } from "react";

interface KeyboardNavigationHandlers {
  onPrev?: () => void;
  onNext?: () => void;
  onClose?: () => void;
}

/**
 * Binds Left/Right arrow-key slide navigation and Escape-to-close while
 * `active` is true. Meant for the case window: Escape closes it immediately
 * (no boot screen — see `src/config/timing.ts` for why that distinction
 * matters), Left/Right move between slides.
 */
export function useKeyboardNavigation(
  active: boolean,
  { onPrev, onNext, onClose }: KeyboardNavigationHandlers,
): void {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          onPrev?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "Escape":
          onClose?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onPrev, onNext, onClose]);
}
