import type { CSSProperties } from "react";
import type { ResizeDirection, UseResizableWindowResult } from "../hooks/useResizableWindow";

// Deliberately small and fully invisible (no background/border) — real
// desktop OSes give you a few pixels of edge to grab, not a visible
// handle, and the task calling for this explicitly asks for "near-
// invisible" over "large modern resize handles".
const EDGE_THICKNESS_PX = 6;
const CORNER_SIZE_PX = 14;

// CSS stacking, not DOM order, decides paint order between positioned
// elements: the content area (`position: relative`, for its own absolutely
// -positioned nav arrows) would otherwise paint over these handles
// wherever they overlap it, even though the handles come first in the
// markup — a `position: static` sibling loses to *any* positioned one
// regardless of order, but two positioned siblings with the same z-index
// break the tie by DOM order instead, and the content area comes later.
// `z-10` matches the level `SlideNavigation`'s arrow buttons already use;
// giving the handles that same level (rather than a higher one) means any
// real control that also needs `z-10` — the nav arrows, the title bar's
// buttons, the pagination dots — still wins a direct overlap, since it
// comes later in the DOM than these handles.
const HANDLE_Z_INDEX_CLASS = "z-10";

interface ResizeHandlesProps {
  getHandleProps: UseResizableWindowResult["getHandleProps"];
}

interface HandleConfig {
  direction: ResizeDirection;
  style: CSSProperties;
}

const HANDLES: HandleConfig[] = [
  { direction: "n", style: { top: 0, left: CORNER_SIZE_PX, right: CORNER_SIZE_PX, height: EDGE_THICKNESS_PX } },
  { direction: "s", style: { bottom: 0, left: CORNER_SIZE_PX, right: CORNER_SIZE_PX, height: EDGE_THICKNESS_PX } },
  { direction: "w", style: { top: CORNER_SIZE_PX, bottom: CORNER_SIZE_PX, left: 0, width: EDGE_THICKNESS_PX } },
  { direction: "e", style: { top: CORNER_SIZE_PX, bottom: CORNER_SIZE_PX, right: 0, width: EDGE_THICKNESS_PX } },
  { direction: "nw", style: { top: 0, left: 0, width: CORNER_SIZE_PX, height: CORNER_SIZE_PX } },
  { direction: "ne", style: { top: 0, right: 0, width: CORNER_SIZE_PX, height: CORNER_SIZE_PX } },
  { direction: "sw", style: { bottom: 0, left: 0, width: CORNER_SIZE_PX, height: CORNER_SIZE_PX } },
  { direction: "se", style: { bottom: 0, right: 0, width: CORNER_SIZE_PX, height: CORNER_SIZE_PX } },
];

/** The eight invisible drag handles (four edges, four corners) that make
 *  the case window resizable — see `useResizableWindow` for the drag
 *  logic itself; this component only lays out the hit zones and forwards
 *  each one's pointer handlers. */
export function ResizeHandles({ getHandleProps }: ResizeHandlesProps) {
  return (
    <>
      {HANDLES.map(({ direction, style }) => {
        const { style: cursorStyle, ...pointerHandlers } = getHandleProps(direction);
        return (
          <div
            key={direction}
            aria-hidden="true"
            className={`touch-none absolute ${HANDLE_Z_INDEX_CLASS}`}
            style={{ ...style, ...cursorStyle }}
            {...pointerHandlers}
          />
        );
      })}
    </>
  );
}
