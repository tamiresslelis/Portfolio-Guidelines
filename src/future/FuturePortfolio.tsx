import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { FutureScene } from "./scene/FutureScene";
import { FutureHud } from "./ui/FutureHud";
import { FutureLoadingScreen } from "./ui/FutureLoadingScreen";
import { FutureErrorFallback } from "./ui/FutureErrorFallback";
import { FutureErrorBoundary } from "./FutureErrorBoundary";
import { useWebglSupport } from "./hooks/useWebglSupport";
import { MAX_RENDERER_PIXEL_RATIO } from "./constants";

interface FuturePortfolioProps {
  /** Returns to the 2011 desktop — wired by the `/future` route to a
   *  router navigation back to `/`. */
  onExit: () => void;
}

/**
 * The 2026 experience's composition root: this is the ONLY module the
 * portfolio shell imports (via `React.lazy()`, see `routes/future.tsx`),
 * and the only file here allowed to know about the shell at all (`onExit`
 * is a plain callback, not a router import) — see the architecture notes
 * on keeping this module independently maintainable.
 */
export default function FuturePortfolio({ onExit }: FuturePortfolioProps) {
  const isWebglSupported = useWebglSupport();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  // `null` = hasn't checked yet (avoids a hydration-unsafe guess); `false`
  // = checked and unsupported — both cases must avoid mounting <Canvas>,
  // which would otherwise throw and rely on the error boundary to recover.
  if (isWebglSupported === false) {
    return <FutureErrorFallback onExit={onExit} />;
  }

  return (
    <div className="fixed inset-0 z-100 bg-[#04100e]">
      <FutureErrorBoundary fallback={<FutureErrorFallback onExit={onExit} />}>
        {isWebglSupported && (
          <>
            <Canvas shadows dpr={[1, MAX_RENDERER_PIXEL_RATIO]} camera={{ position: [0, 3, 18], fov: 50 }}>
              <Suspense fallback={null}>
                <FutureScene />
              </Suspense>
            </Canvas>
            {/* Overlays itself only while drei's global loading manager
                reports something in flight — with no real assets yet
                (only primitive geometry) it simply never shows today, and
                is already correct for when Phase 4/5 adds real ones. */}
            <FutureLoadingScreen />
            <FutureHud onExit={onExit} />
          </>
        )}
      </FutureErrorBoundary>
    </div>
  );
}
