import { useEffect, useRef, useState, type ReactNode } from "react";

// A short pause before showing, like a native desktop tooltip — instant
// would feel like a modern web hover-card, not an OS-level hint.
const HOVER_SHOW_DELAY_MS = 400;
// Touch devices have no hover: a tap reveals the tooltip briefly instead of
// leaving it stuck open until the visitor taps elsewhere.
const TOUCH_AUTO_HIDE_MS = 2500;

type Align = "left" | "right" | "center";

const ALIGN_CLASSES: Record<Align, string> = {
  left: "left-0",
  right: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

interface XpTooltipProps {
  label: string;
  children: ReactNode;
  /** Horizontal anchor for the bubble relative to its trigger — "left"/
   *  "right" keep it from clipping off-screen near the taskbar's edges. */
  align?: Align;
}

/**
 * A small hover/focus/tap tooltip styled after classic Windows XP tooltips
 * (pale yellow, thin dark border, square corners, no fade) — shared by the
 * system tray clock and the "Since 2011" taskbar item.
 *
 * Purely presentational and behavioral: it does not manage accessible
 * names. The trigger passed as `children` should carry its own
 * `aria-label`, since the visual bubble here is `aria-hidden` — decoration
 * for sighted users, not the trigger's description.
 */
export function XpTooltip({ label, children, align = "center" }: XpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (showTimeoutRef.current !== null) window.clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current !== null) window.clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = null;
    hideTimeoutRef.current = null;
  };

  useEffect(() => clearTimers, []);

  const handleMouseEnter = () => {
    clearTimers();
    showTimeoutRef.current = window.setTimeout(() => setIsVisible(true), HOVER_SHOW_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearTimers();
    setIsVisible(false);
  };

  const handleFocus = () => {
    clearTimers();
    setIsVisible(true);
  };

  const handleBlur = () => {
    clearTimers();
    setIsVisible(false);
  };

  const handleClick = () => {
    clearTimers();
    setIsVisible(true);
    hideTimeoutRef.current = window.setTimeout(() => setIsVisible(false), TOUCH_AUTO_HIDE_MS);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
    >
      {children}
      <span
        role="tooltip"
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full z-30 mb-1.5 rounded-none border border-black bg-[#ffffe1] px-1.5 py-1 text-xp-xs whitespace-nowrap text-[#111] ${
          isVisible ? "visible opacity-100" : "invisible opacity-0"
        } ${ALIGN_CLASSES[align]}`}
      >
        {label}
      </span>
    </span>
  );
}
