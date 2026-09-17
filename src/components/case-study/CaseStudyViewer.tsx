import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { CaseStudy } from "../../data/cases";
import { useResponsivePdfWidth } from "../../hooks/useResponsivePdfWidth";
import { usePdfPagePrefetch } from "../../hooks/usePdfPagePrefetch";
import { PdfDocument } from "./PdfDocument";
import { PdfPage } from "./PdfPage";

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

interface CaseStudyViewerProps {
  caseStudy: CaseStudy;
  currentSlide: number;
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
 * between pages never re-fetches or re-parses the PDF — only the single
 * `<Page>` for the current page number is ever rendered, with its
 * immediate neighbors' page data (not their canvases) prefetched in the
 * background so Prev/Next feels instant without keeping a stack of
 * high-resolution canvases mounted.
 */
export function CaseStudyViewer({ caseStudy, currentSlide }: CaseStudyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useResponsivePdfWidth(containerRef, MAX_PDF_WIDTH);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);

  const pageNumber = currentSlide + 1;
  const totalPages = caseStudy.slides.length;
  const slide = caseStudy.slides[currentSlide];

  // A case switch means a different document is about to load — drop the
  // previous one immediately so prefetching below can't fire against a
  // document that's no longer the one being displayed.
  useEffect(() => {
    setPdf(null);
  }, [caseStudy.id]);

  usePdfPagePrefetch(pdf, pageNumber, totalPages);

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
        <PdfPage
          pageNumber={pageNumber}
          width={width}
          aspectRatio={PDF_PAGE_ASPECT_RATIO}
          alt={slide.alt}
          caption={slide.caption}
        />
      </PdfDocument>
    </div>
  );
}
