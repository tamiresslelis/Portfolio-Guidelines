import { useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Warms PDF.js's page cache for the pages next to `currentPageNumber` so
 * Prev/Next feels instant, without mounting extra `<Page>` canvases for
 * them. `pdf.getPage()` fetches and parses a page's content stream once
 * and caches the resulting proxy on the document (react-pdf's own `<Page>`
 * additionally caches by `[pdf, pageNumber]`), so by the time the visitor
 * navigates there, only the (fast) canvas rasterization step is left to do
 * — the expensive fetch+parse already happened here, in the background,
 * for exactly one neighbor on each side. This intentionally does not
 * render/rasterize the neighbors: doing that would mean up to 3 full-size
 * canvases mounted at once for no visible benefit, since only the current
 * page is ever on screen.
 */
export function usePdfPagePrefetch(
  pdf: PDFDocumentProxy | null,
  currentPageNumber: number,
  totalPages: number,
): void {
  useEffect(() => {
    if (!pdf) return;

    const neighbors = [currentPageNumber - 1, currentPageNumber + 1].filter(
      (pageNumber) => pageNumber >= 1 && pageNumber <= totalPages,
    );

    for (const pageNumber of neighbors) {
      pdf.getPage(pageNumber).catch(() => {
        // Best-effort warmup only — a failed prefetch isn't user-visible
        // (the same page load is retried for real when actually navigated
        // to), so there's nothing to surface here.
      });
    }
  }, [pdf, currentPageNumber, totalPages]);
}
