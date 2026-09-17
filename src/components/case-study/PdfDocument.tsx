import { useCallback, useState, type ReactNode } from "react";
import { Document, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfPlaceholder } from "./PdfPlaceholder";
import { PdfErrorState } from "./PdfErrorState";

// react-pdf's own docs warn this must be set in the same module that
// renders <Document>/<Page> — setting it in a separate file that isn't
// guaranteed to execute first can leave pdf.js with its unset default and
// fail every render with a worker error. `new URL(..., import.meta.url)`
// is Vite's recommended way to reference a node_modules file as a real,
// correctly-hashed asset URL that also respects the deployed base path,
// so this works in both `npm run dev` and the GitHub Pages production
// build without any manual copy step.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfDocumentProps {
  pdfUrl: string;
  /** CSS width the loading/error placeholders should reserve — matches
   *  whatever the real page will render at, so there's no layout shift
   *  between "loading" and "loaded". */
  width: number;
  aspectRatio: number;
  onDocumentLoad: (pdf: PDFDocumentProxy) => void;
  children: ReactNode;
}

/**
 * Thin wrapper around react-pdf's `<Document>`: owns the PDF.js worker
 * configuration, the loading/error visuals (kept visually consistent with
 * the rest of the XP window instead of react-pdf's plain-text defaults),
 * and a manual retry path for when loading fails. Callers get the loaded
 * `PDFDocumentProxy` via `onDocumentLoad` and render whatever `<Page>`s
 * they need as `children` — `<Page>` reads the document from context
 * automatically when nested like this, so nothing else needs to be
 * threaded through manually.
 */
export function PdfDocument({ pdfUrl, width, aspectRatio, onDocumentLoad, children }: PdfDocumentProps) {
  const [retryToken, setRetryToken] = useState(0);
  const handleRetry = useCallback(() => setRetryToken((token) => token + 1), []);

  return (
    <Document
      // Remounts react-pdf's <Document> — and so re-triggers the fetch —
      // whenever the case study changes or the visitor asks for a retry.
      key={`${pdfUrl}:${retryToken}`}
      file={pdfUrl}
      // react-pdf defaults to `suspense={true}`: while the file is
      // loading, it throws a promise instead of rendering `loading`/
      // `error`, which — since this component is itself inside the
      // lazy() Suspense boundary CaseWindow sets up around the whole
      // viewer — bubbles up to that boundary's generic fallback instead
      // of this sized, in-place placeholder. `suspense={false}` is what
      // actually makes the `loading`/`error` props below take effect.
      suspense={false}
      loading={<PdfPlaceholder width={width} aspectRatio={aspectRatio} />}
      error={<PdfErrorState pdfUrl={pdfUrl} width={width} aspectRatio={aspectRatio} onRetry={handleRetry} />}
      onLoadSuccess={onDocumentLoad}
    >
      {children}
    </Document>
  );
}
