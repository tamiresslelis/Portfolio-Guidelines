import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { MOBILE_WINDOW_BREAKPOINT_PX } from "../config/window";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface WindowRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ResizeHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  style: { cursor: string };
}

interface UseResizableWindowOptions {
  /** The window element to measure/resize. Read fresh on every resize
   *  start, so it works whether the window is currently using its default
   *  CSS-driven size or an already-customized `rect`. */
  windowRef: RefObject<HTMLElement | null>;
  minWidth: number;
  minHeight: number;
  taskbarHeightPx: number;
  /** True while resizing should be unavailable entirely (maximized) — the
   *  hook also disables itself on its own below `MOBILE_WINDOW_BREAKPOINT_PX`,
   *  regardless of this flag. */
  disabled: boolean;
}

export interface UseResizableWindowResult {
  /** The window's custom size/position, or `null` to use its default
   *  CSS-driven centered layout. Becomes non-null the first time the
   *  visitor drags a handle. */
  rect: WindowRect | null;
  isResizing: boolean;
  /** False on mobile viewports or while `disabled` — callers should skip
   *  rendering resize handles (and ignore `rect`) when this is false. */
  isResizingEnabled: boolean;
  getHandleProps: (direction: ResizeDirection) => ResizeHandleProps;
  /** Drops back to the default CSS-driven layout — used when a new case
   *  study opens, so one case's custom size never carries into the next. */
  resetRect: () => void;
}

const CURSOR_BY_DIRECTION: Record<ResizeDirection, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

interface DragState {
  direction: ResizeDirection;
  pointerId: number;
  startRect: WindowRect;
  startClientX: number;
  startClientY: number;
}

function useIsMobileViewport(breakpointPx: number): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpointPx,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [breakpointPx]);

  return isMobile;
}

/**
 * Adds mouse/touch resizing to an absolutely-positioned window element,
 * via Pointer Events + pointer capture rather than a global mousemove/
 * mouseup listener pair: capturing the pointer on the handle that started
 * the drag means that same handle keeps receiving `pointermove`/
 * `pointerup` even once the cursor leaves it, so no `window`-level
 * listeners need to be added or cleaned up by hand.
 *
 * All resize state (the custom rect, whether a drag is in progress) lives
 * entirely in this hook, local to whichever component calls it — nothing
 * here touches context or app-wide state, so dragging a window's edge only
 * re-renders that window, not the rest of the app.
 */
export function useResizableWindow({
  windowRef,
  minWidth,
  minHeight,
  taskbarHeightPx,
  disabled,
}: UseResizableWindowOptions): UseResizableWindowResult {
  const isMobileViewport = useIsMobileViewport(MOBILE_WINDOW_BREAKPOINT_PX);
  const isResizingEnabled = !disabled && !isMobileViewport;

  const [rect, setRect] = useState<WindowRect | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const dragStateRef = useRef<DragState | null>(null);
  const latestPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getMaxSize = useCallback(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight - taskbarHeightPx,
    }),
    [taskbarHeightPx],
  );

  const clampRect = useCallback(
    (candidate: WindowRect): WindowRect => {
      const max = getMaxSize();
      const width = Math.min(Math.max(candidate.width, minWidth), max.width);
      const height = Math.min(Math.max(candidate.height, minHeight), max.height);
      const left = Math.min(Math.max(candidate.left, 0), Math.max(max.width - width, 0));
      const top = Math.min(Math.max(candidate.top, 0), Math.max(max.height - height, 0));
      return { top, left, width, height };
    },
    [getMaxSize, minWidth, minHeight],
  );

  const applyLatestPointerPosition = useCallback(() => {
    animationFrameRef.current = null;
    const drag = dragStateRef.current;
    const pointer = latestPointerRef.current;
    if (!drag || !pointer) return;

    const deltaX = pointer.clientX - drag.startClientX;
    const deltaY = pointer.clientY - drag.startClientY;
    const { direction, startRect } = drag;

    let { top, left, width, height } = startRect;

    if (direction.includes("e")) width = startRect.width + deltaX;
    if (direction.includes("w")) {
      width = startRect.width - deltaX;
      left = startRect.left + deltaX;
    }
    if (direction.includes("s")) height = startRect.height + deltaY;
    if (direction.includes("n")) {
      height = startRect.height - deltaY;
      top = startRect.top + deltaY;
    }

    // Squeezing past the minimum from the left/top would otherwise drag
    // that edge along with the shrinking size instead of holding it at the
    // minimum — re-anchor to where the opposite (fixed) edge actually is.
    if (direction.includes("w") && width < minWidth) {
      left = startRect.left + startRect.width - minWidth;
    }
    if (direction.includes("n") && height < minHeight) {
      top = startRect.top + startRect.height - minHeight;
    }

    setRect(clampRect({ top, left, width, height }));
  }, [clampRect, minWidth, minHeight]);

  const scheduleUpdate = useCallback(
    (clientX: number, clientY: number) => {
      latestPointerRef.current = { clientX, clientY };
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = requestAnimationFrame(applyLatestPointerPosition);
    },
    [applyLatestPointerPosition],
  );

  const beginResize = useCallback(
    (direction: ResizeDirection) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizingEnabled) return;
      const windowElement = windowRef.current;
      if (!windowElement) return;

      const bounds = windowElement.getBoundingClientRect();
      const startRect: WindowRect = {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      };

      dragStateRef.current = {
        direction,
        pointerId: event.pointerId,
        startRect,
        startClientX: event.clientX,
        startClientY: event.clientY,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      setRect(startRect);
      setIsResizing(true);
    },
    [isResizingEnabled, windowRef],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      scheduleUpdate(event.clientX, event.clientY);
    },
    [scheduleUpdate],
  );

  const endResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current = null;
    latestPointerRef.current = null;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsResizing(false);
  }, []);

  const getHandleProps = useCallback(
    (direction: ResizeDirection): ResizeHandleProps => ({
      onPointerDown: beginResize(direction),
      onPointerMove: handlePointerMove,
      onPointerUp: endResize,
      onPointerCancel: endResize,
      style: { cursor: CURSOR_BY_DIRECTION[direction] },
    }),
    [beginResize, handlePointerMove, endResize],
  );

  const resetRect = useCallback(() => setRect(null), []);

  // Re-clamp whenever the browser viewport itself changes size, so a
  // previously custom-sized window can never end up bigger than the
  // current viewport or positioned with its title bar out of reach.
  useEffect(() => {
    const handleViewportResize = () => {
      setRect((current) => (current ? clampRect(current) : current));
    };
    window.addEventListener("resize", handleViewportResize);
    return () => window.removeEventListener("resize", handleViewportResize);
  }, [clampRect]);

  // A mobile viewport means manual sizing is off the table entirely — drop
  // any custom rect so a later resize back to a desktop width starts from
  // a clean slate instead of an arbitrary leftover size. Maximizing does
  // *not* clear it: `rect` below already resolves to `null` while
  // `disabled` (maximized) is true, and restoring un-maximizes back to
  // whatever custom size was set before, matching how double-click-to-
  // maximize is expected to behave.
  useEffect(() => {
    if (isMobileViewport) setRect(null);
  }, [isMobileViewport]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    rect: isResizingEnabled ? rect : null,
    isResizing,
    isResizingEnabled,
    getHandleProps,
    resetRect,
  };
}
