interface FutureErrorFallbackProps {
  onExit: () => void;
}

/**
 * Shown when the 3D experience fails to initialize (no WebGL, a driver/
 * GPU issue, or the lazy chunk itself failing to load) — the recruiter
 * never sees a black canvas or a stuck loading state, just a short
 * explanation and an immediate way back into the normal portfolio.
 */
export function FutureErrorFallback({ onExit }: FutureErrorFallbackProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#04100e] px-6 text-center font-sans text-white" role="alert">
      <p className="m-0 max-w-sm text-sm leading-relaxed text-white/85">
        The 2026 experience couldn't load in this browser. That's alright — the full portfolio is still available the regular way.
      </p>
      <button
        type="button"
        onClick={onExit}
        className="rounded-sm border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 focus-visible:bg-white/20"
      >
        Back to the portfolio
      </button>
    </div>
  );
}
