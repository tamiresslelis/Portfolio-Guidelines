interface PdfPlaceholderProps {
  /** Target CSS width, matching whatever the real page will render at, so
   *  swapping the placeholder for the loaded page causes no layout shift. */
  width: number;
  aspectRatio: number;
}

/** Reserves the exact space the PDF page will occupy once loaded, with a
 *  small spinner instead of leaving an empty white area. Shown by
 *  `PdfDocument`'s `loading` prop while the file is being fetched/parsed. */
export function PdfPlaceholder({ width, aspectRatio }: PdfPlaceholderProps) {
  if (!width) return null;

  return (
    <div
      className="flex items-center justify-center border border-black/15 bg-white"
      // `height` computed explicitly rather than relying on the CSS
      // `aspect-ratio` property: React's inline-style handling appends
      // "px" to any plain-number style value it doesn't recognize as
      // unitless, and `aspectRatio` isn't on that (React-maintained, pre-
      // dates the CSS property) list — `aspectRatio: 16/9` silently became
      // the invalid value "1.77...px" and was ignored, so the placeholder
      // rendered with no height at all. Explicit width/height avoids
      // depending on that list ever being updated.
      style={{ width, height: width / aspectRatio }}
    >
      <span className="sr-only">Loading case study…</span>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#c7c5b8] border-t-xp-titlebar-start"
        aria-hidden="true"
      />
    </div>
  );
}
