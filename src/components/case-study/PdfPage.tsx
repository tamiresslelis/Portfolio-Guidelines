import { Page } from "react-pdf";
import { PdfPlaceholder } from "./PdfPlaceholder";

// Caps how many physical pixels the canvas backing store renders at.
// Without a cap, a 3x-DPR phone would ask for a 3x-resolution canvas for
// no visible benefit over 2x at normal viewing distance, at 2.25x the
// memory/GPU cost — see PdfPage's usage below and the DPR explanation in
// the project README.
const MAX_DEVICE_PIXEL_RATIO = 2;

interface PdfPageProps {
  pageNumber: number;
  /** Desired CSS width. react-pdf derives its own render scale from this
   *  against the PDF's intrinsic page size — never pre-multiply this by
   *  devicePixelRatio yourself, or the page renders far larger than
   *  intended (react-pdf already applies the DPR multiplier internally,
   *  once, when sizing the canvas's backing store). */
  width: number;
  aspectRatio: number;
  /** Read by assistive tech in place of the (disabled) text layer — see
   *  the module doc comment for why. */
  alt: string;
  caption?: string;
}

/**
 * Renders one page of the currently-open case study's PDF at a sharp,
 * viewport-appropriate resolution. Must be rendered as a descendant of
 * `PdfDocument`/react-pdf's `<Document>` — `<Page>` reads the loaded PDF
 * from context automatically rather than needing it passed as a prop.
 *
 * Text and annotation layers are both disabled. This was verified, not
 * assumed: enabling them against these PDFs (exported from a design tool
 * with subset-encoded fonts) produced a text layer whose extracted
 * content was garbled — control characters interleaved with the visible
 * words (e.g. "Case ItaúForeign CurrencyTransactions") — because
 * the fonts carry no usable ToUnicode mapping, and every extracted span
 * was vertically misaligned with its counterpart on the canvas. Turning
 * the layers on here would add selection/search UI for text that
 * selects wrong and reads as noise to a screen reader, for zero benefit:
 * these slides are visual compositions (screenshots and design artwork
 * with any text already baked into the page raster) rather than
 * documents meant to be read as flowing text. The `alt` text (carried
 * over from the previous JPG-based slides almost unchanged) is what
 * assistive tech reads instead, via `role="img"`.
 */
export function PdfPage({ pageNumber, width, aspectRatio, alt, caption }: PdfPageProps) {
  if (!width) return null;

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

  return (
    <figure
      className="m-0 flex h-full w-full flex-col items-center justify-center"
      role="img"
      aria-label={alt}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        devicePixelRatio={devicePixelRatio}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        // Same suspense footgun as <Document> — see PdfDocument.tsx. Without
        // this, jumping to a page whose data isn't prefetched yet throws a
        // promise instead of rendering `loading` below.
        suspense={false}
        loading={<PdfPlaceholder width={width} aspectRatio={aspectRatio} />}
        className="border border-black/15 bg-white"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xp-sm text-[#444]" aria-hidden="true">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
