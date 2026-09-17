interface PdfErrorStateProps {
  pdfUrl: string;
  width: number;
  aspectRatio: number;
  onRetry: () => void;
}

const buttonClasses =
  "min-w-[75px] rounded-[3px] border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end px-3 py-1 text-sm text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]";

/** Shown by `PdfDocument`'s `error` prop when the PDF fails to load
 *  (network failure, invalid URL, corrupted file, worker crash, ...) —
 *  keeps the case window intact instead of the whole app breaking, and
 *  reserves the same space the loaded page would occupy so recovering
 *  from a retry doesn't shift the layout either. */
export function PdfErrorState({ pdfUrl, width, aspectRatio, onRetry }: PdfErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 border border-black/15 bg-white px-6 text-center"
      // See PdfPlaceholder.tsx for why height is computed explicitly
      // rather than passed through the CSS `aspect-ratio` property.
      style={width ? { width, height: width / aspectRatio } : undefined}
    >
      <p className="m-0 text-sm text-[#555]">This case study couldn't be loaded.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onRetry} className={buttonClasses}>
          Retry
        </button>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClasses} inline-flex items-center justify-center`}
        >
          Open PDF
        </a>
      </div>
    </div>
  );
}
