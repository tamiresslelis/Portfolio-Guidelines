interface PageLoadingOverlayProps {
  message: string;
}

/**
 * Shown over the currently-visible PDF page while a different page renders
 * in a hidden buffer slot behind the scenes (see `usePdfPageBuffer` /
 * `CaseStudyViewer`). A translucent scrim over the still-visible old page,
 * not an opaque replacement — Next/Prev never looks like the app froze or
 * blanked out while the new page loads.
 */
export function PageLoadingOverlay({ message }: PageLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#c7c5b8] border-t-xp-titlebar-start"
        aria-hidden="true"
      />
      <p role="status" aria-live="polite" className="m-0 text-xp-sm text-[#444]">
        {message}
      </p>
    </div>
  );
}
