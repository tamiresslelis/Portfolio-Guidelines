import { useCallback, useEffect, useReducer } from "react";

interface BufferState {
  /** The page number each of the two render slots is currently assigned
   *  to. Both slots always hold a real page number — there's no "empty"
   *  slot — only one of them is actually shown at a time. */
  slots: [number, number];
  /** Which slot is currently the one visible to the user. */
  activeIndex: 0 | 1;
}

type BufferAction =
  | { type: "RESET"; pageNumber: number }
  | { type: "SET_BACK_SLOT_TARGET"; pageNumber: number }
  | { type: "PROMOTE"; slotIndex: 0 | 1; pageNumber: number };

function getBackSlotIndex(activeIndex: 0 | 1): 0 | 1 {
  return activeIndex === 0 ? 1 : 0;
}

function bufferReducer(state: BufferState, action: BufferAction): BufferState {
  switch (action.type) {
    case "RESET":
      return { slots: [action.pageNumber, action.pageNumber], activeIndex: 0 };
    case "SET_BACK_SLOT_TARGET": {
      const backIndex = getBackSlotIndex(state.activeIndex);
      if (state.slots[backIndex] === action.pageNumber) return state;
      const slots: [number, number] = [...state.slots];
      slots[backIndex] = action.pageNumber;
      return { ...state, slots };
    }
    case "PROMOTE": {
      const backIndex = getBackSlotIndex(state.activeIndex);
      // Ignore a stale completion: the slot that just finished rendering
      // is no longer the background one (it's already active), or it has
      // since been reassigned to a different target than the one that
      // just finished — both mean this result is for a page the visitor
      // has already navigated away from.
      if (action.slotIndex !== backIndex) return state;
      if (state.slots[backIndex] !== action.pageNumber) return state;
      return { ...state, activeIndex: backIndex };
    }
    default:
      return state;
  }
}

export interface PdfPageBuffer {
  /** Page number assigned to each of the two render slots. Render exactly
   *  one `<PdfPage>` per slot, keyed by its index (0/1) so each slot keeps
   *  a stable component identity across transitions — only ever changing
   *  which slot is *visible*, never mutating the visible slot's own
   *  `pageNumber` prop while it's the one on screen. */
  slots: [number, number];
  /** Which slot is currently visible. */
  activeIndex: 0 | 1;
  /** The page number currently on screen. */
  activePageNumber: number;
  /** True whenever the requested page differs from what's on screen —
   *  i.e. the background slot is fetching/rendering the target page. */
  isPageRendering: boolean;
  /** Call from the background slot's `onRenderSuccess` once it finishes
   *  rendering, passing that slot's index and the page number it just
   *  rendered (stale/abandoned completions are ignored automatically). */
  notifySlotRendered: (slotIndex: 0 | 1, pageNumber: number) => void;
}

/**
 * Drives a two-slot "double buffer" for the currently-visible PDF page, so
 * navigating Next/Prev never blanks the screen while the new page loads.
 *
 * The problem this solves: react-pdf's `<Page>` re-fetches/re-renders
 * whenever its `pageNumber` prop changes, and while that's in flight it
 * unconditionally shows its `loading` fallback in place of the previous
 * page's canvas — there's no way to keep a *single* `<Page>` instance
 * showing its old content while it loads a new page number, even if that
 * page's data is already cached. The only way to keep the outgoing page
 * visible is to render the incoming page in a *separate*, hidden `<Page>`
 * instance and only reveal it once it's actually ready.
 *
 * This hook owns that bookkeeping: two fixed "slots" (0 and 1), each of
 * which is assigned a page number and rendered as its own `<PdfPage>` by
 * the caller. Only one slot is ever visible; the other renders off-screen
 * whenever the caller asks for a page the visible slot isn't already
 * showing. A slot's `pageNumber` is only ever reassigned while it's the
 * hidden one, so the visible slot's own `<Page>` never re-triggers its
 * internal loading/blank state while it's on screen.
 */
export function usePdfPageBuffer(targetPageNumber: number, documentKey: string): PdfPageBuffer {
  const [state, dispatch] = useReducer(
    bufferReducer,
    targetPageNumber,
    (initialPageNumber): BufferState => ({
      slots: [initialPageNumber, initialPageNumber],
      activeIndex: 0,
    }),
  );

  // A new document (a different case study opened) should snap straight to
  // its own first page with no leftover pending transition from whichever
  // document was open before — ordinary navigation within the same
  // document is handled by the effect below instead.
  useEffect(() => {
    dispatch({ type: "RESET", pageNumber: targetPageNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentKey]);

  useEffect(() => {
    dispatch({ type: "SET_BACK_SLOT_TARGET", pageNumber: targetPageNumber });
  }, [targetPageNumber]);

  const notifySlotRendered = useCallback((slotIndex: 0 | 1, pageNumber: number) => {
    dispatch({ type: "PROMOTE", slotIndex, pageNumber });
  }, []);

  const activePageNumber = state.slots[state.activeIndex];

  return {
    slots: state.slots,
    activeIndex: state.activeIndex,
    activePageNumber,
    isPageRendering: targetPageNumber !== activePageNumber,
    notifySlotRendered,
  };
}
