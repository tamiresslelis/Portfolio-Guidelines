import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { CaseStudy } from "../../data/cases";
import { useResponsivePdfWidth } from "../../hooks/useResponsivePdfWidth";
import { usePdfPagePrefetch } from "../../hooks/usePdfPagePrefetch";
import { usePdfPageBuffer } from "../../hooks/usePdfPageBuffer";
import { PdfDocument } from "./PdfDocument";
import { PdfPage } from "./PdfPage";
import { PageLoadingOverlay } from "./PageLoadingOverlay";

// All four case-study PDFs export at 1600×900 (16:9) — the same ratio
// their original JPG slides used. A future case with a different export
// ratio should update this (or turn it into a per-case field in
// `cases.ts`), otherwise its loading placeholder will be the wrong shape
// for one render before the real page swaps in.
const PDF_PAGE_ASPECT_RATIO = 16 / 9;

// Caps the CSS width react-pdf is asked to render at, independent of the
// devicePixelRatio cap in PdfPage (that one controls the canvas's backing
// -store resolution at a given CSS size; this one controls the CSS size
// itself). 1600 matches these PDFs' native page width in points/CSS px —
// asking for more than that on an ultra-wide maximized window would just
// upscale past the source's own detail for no visual benefit.
const MAX_PDF_WIDTH = 1600;

type NavigationDirection = "next" | "previous" | "unknown";

const LOADING_MESSAGE_BY_DIRECTION: Record<NavigationDirection, string> = {
  next: "Loading next slide…",
  previous: "Loading previous slide…",
  unknown: "Loading slide…",
};

function getNavigationDirection(targetPageNumber: number, activePageNumber: number): NavigationDirection {
  if (targetPageNumber > activePageNumber) return "next";
  if (targetPageNumber < activePageNumber) return "previous";
  return "unknown";
}

interface CaseStudyViewerProps {
  caseStudy: CaseStudy;
  currentSlide: number;
  /** Lets `CaseWindow` disable Next/Prev/pagination while a page is still
   *  rendering, so rapid clicks can't pile up multiple in-flight renders. */
  onPageRenderingChange: (isRendering: boolean) => void;
}

/**
 * Renders the currently-open case study's PDF directly (no JPG conversion
 * step) at a resolution sharp on both standard and high-DPI displays. This
 * is the direct replacement for the old image-based `CaseSlide`, plugged
 * into the same `CaseWindow` slot — everything around it (window chrome,
 * keyboard/swipe navigation, pagination dots, the slide counter) is
 * unchanged and still just moves `currentSlide` back and forth.
 *
 * One `<Document>` stays mounted for as long as this case study is open
 * (keyed only by `caseStudy.pdfUrl`, not by `currentSlide`), so navigating
 * between pages never re-fetches or re-parses the PDF. The current and
 * next-requested pages are rendered through `usePdfPageBuffer`'s two-slot
 * buffer (see that hook for why), with their immediate neighbors' page
 * *data* (not their canvases) prefetched in the background so Prev/Next
 * has as little to do as possible once the visitor actually navigates.
 */
export function CaseStudyViewer({ caseStudy, currentSlide, onPageRenderingChange }: CaseStudyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useResponsivePdfWidth(containerRef, MAX_PDF_WIDTH);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);

  const pageNumber = currentSlide + 1;
  const totalPages = caseStudy.slides.length;

  // A case switch means a different document is about to load — drop the
  // previous one immediately so prefetching below can't fire against a
  // document that's no longer the one being displayed.
  useEffect(() => {
    setPdf(null);
  }, [caseStudy.id]);

  usePdfPagePrefetch(pdf, pageNumber, totalPages);

  const { slots, activeIndex, activePageNumber, isPageRendering, notifySlotRendered } = usePdfPageBuffer(
    pageNumber,
    caseStudy.id,
  );

  useEffect(() => {
    onPageRenderingChange(isPageRendering);
  }, [isPageRendering, onPageRenderingChange]);

  const direction = getNavigationDirection(pageNumber, activePageNumber);
  const pageBoxStyle = width ? { width, height: width / PDF_PAGE_ASPECT_RATIO } : undefined;
  const backSlotIndex: 0 | 1 = activeIndex === 0 ? 1 : 0;

  function renderSlot(slotIndex: 0 | 1) {
    const isActive = slotIndex === activeIndex;
    const slotPageNumber = slots[slotIndex];
    const slide = caseStudy.slides[slotPageNumber - 1];

    return (
      <div
        key={slotIndex}
        className={isActive ? "" : "invisible absolute inset-0"}
        aria-hidden={isActive ? undefined : true}
      >
        <PdfPage
          pageNumber={slotPageNumber}
          width={width}
          aspectRatio={PDF_PAGE_ASPECT_RATIO}
          alt={slide.alt}
          caption={slide.caption}
          // Only the hidden slot needs to report back — the visible slot's
          // page number never changes while it's the one on screen, so it
          // never has anything new to report.
          onRenderSuccess={isActive ? undefined : (page) => notifySlotRendered(slotIndex, page.pageNumber)}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full w-full items-start justify-center">
      {/* `items-start` rather than `items-center`: the PDF is only ever
          fit to the container's *width* (see useResponsivePdfWidth) — its
          height follows from the page's own aspect ratio and can exceed
          the available height on short/wide viewports. Centering on that
          axis would center the overflow too, making its top edge
          unreachable by scrolling in most browsers; anchoring to the top
          keeps the whole page reachable by scrolling down, and the parent
          content area (CaseWindow) is what actually scrolls. */}
      <PdfDocument
        pdfUrl={caseStudy.pdfUrl}
        width={width}
        aspectRatio={PDF_PAGE_ASPECT_RATIO}
        onDocumentLoad={setPdf}
      >
        <div className="relative" style={pageBoxStyle}>
          {renderSlot(activeIndex)}
          {/* The background slot only needs to exist while a transition is
              actually in flight — mounting it unconditionally would also
              redundantly re-render whatever page is already active (every
              page load, not just real navigations), and its own
              onRenderSuccess would then fire for that no-op render too. */}
          {isPageRendering && renderSlot(backSlotIndex)}
          {isPageRendering && <PageLoadingOverlay message={LOADING_MESSAGE_BY_DIRECTION[direction]} />}
        </div>
      </PdfDocument>
    </div>
  );
}
