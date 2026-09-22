/**
 * Shown by the `/future` route's `<Suspense>` while the future
 * experience's own JS chunk (Three.js/R3F/drei) downloads and evaluates —
 * this component must stay free of any import from `src/future/`, or it
 * would pull the very chunk it's supposed to cover the wait for into the
 * main bundle. Visually continues the evolution transition's "arrival"
 * beat (dark background, soft warm glow, same uppercase caption style)
 * so the handoff across the route change reads as one continuous moment.
 */
export function FutureChunkLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-[#04100e] font-sans"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-16 w-16 animate-xp-pulse rounded-full motion-reduce:animate-none"
        style={{ background: "radial-gradient(circle, rgba(224,178,60,0.4) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <p className="m-0 text-xs tracking-[2px] text-[#f2d98a] uppercase">Preparing the future</p>
    </div>
  );
}
