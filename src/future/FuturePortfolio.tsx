import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FutureScene } from "./scene/FutureScene";
import { FutureHud } from "./ui/FutureHud";
import { FutureLoadingScreen } from "./ui/FutureLoadingScreen";
import { FutureErrorFallback } from "./ui/FutureErrorFallback";
import { InteractionPrompt } from "./ui/InteractionPrompt";
import { ProjectOverlay } from "./ui/ProjectOverlay";
import { FutureErrorBoundary } from "./FutureErrorBoundary";
import { useWebglSupport } from "./hooks/useWebglSupport";
import { projectLandmarks } from "./data/landmarks";
import { MAX_RENDERER_PIXEL_RATIO } from "./constants";

interface FuturePortfolioProps {
  /** Returns to the 2011 desktop — wired by the `/future` route to a
   *  router navigation back to `/`. */
  onExit: () => void;
  /** Hands off to the real case-study viewer already built for the 2011
   *  side — wired by the route to a navigation to `/?case=<id>`. */
  onOpenCaseStudy: (caseStudyId: string) => void;
}

/**
 * The 2026 experience's composition root: this is the ONLY module the
 * portfolio shell imports (via `React.lazy()`, see `routes/future.tsx`),
 * and the only file here allowed to know about the shell at all (`onExit`/
 * `onOpenCaseStudy` are plain callbacks, not router imports) — see the
 * architecture notes on keeping this module independently maintainable.
 *
 * Owns the interaction state that has to live outside `<Canvas>` because
 * it's rendered as DOM: which landmark the player is currently near
 * (drives `InteractionPrompt`) and which one is "activated" (drives
 * `ProjectOverlay`, and is threaded back *into* the canvas so the camera
 * can shift into cinematic focus on it). Both are plain `useState` —
 * low-frequency, interaction-driven changes, not per-frame values.
 */
export default function FuturePortfolio({ onExit, onOpenCaseStudy }: FuturePortfolioProps) {
  const isWebglSupported = useWebglSupport();
  const [nearLandmarkId, setNearLandmarkId] = useState<string | null>(null);
  const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);

  const handleProximityChange = useCallback((id: string, isNear: boolean) => {
    setNearLandmarkId((current) => {
      if (isNear) return id;
      return current === id ? null : current;
    });
  }, []);

  const handleCloseOverlay = useCallback(() => setActiveLandmarkId(null), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Escape backs out one step at a time: close an open project
        // overlay first, only exiting to 2011 once nothing else is open —
        // otherwise a visitor reading a case study would get bounced all
        // the way out of the world by the same key.
        if (activeLandmarkId) {
          setActiveLandmarkId(null);
        } else {
          onExit();
        }
        return;
      }
      if ((event.key === "e" || event.key === "E") && nearLandmarkId && !activeLandmarkId) {
        setActiveLandmarkId(nearLandmarkId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit, nearLandmarkId, activeLandmarkId]);

  // `null` = hasn't checked yet (avoids a hydration-unsafe guess); `false`
  // = checked and unsupported — both cases must avoid mounting <Canvas>,
  // which would otherwise throw and rely on the error boundary to recover.
  if (isWebglSupported === false) {
    return <FutureErrorFallback onExit={onExit} />;
  }

  const activeLandmark = projectLandmarks.find((landmark) => landmark.id === activeLandmarkId) ?? null;
  const nearLandmark = projectLandmarks.find((landmark) => landmark.id === nearLandmarkId) ?? null;

  return (
    <div className="fixed inset-0 z-100 bg-[#04100e]">
      <FutureErrorBoundary fallback={<FutureErrorFallback onExit={onExit} />}>
        {isWebglSupported && (
          <>
            <Canvas shadows dpr={[1, MAX_RENDERER_PIXEL_RATIO]} camera={{ position: [0, 3, 18], fov: 50 }}>
              <Suspense fallback={null}>
                <FutureScene activeLandmark={activeLandmark} onProximityChange={handleProximityChange} />
              </Suspense>
            </Canvas>
            {/* Overlays itself only while drei's global loading manager
                reports something in flight — with no real assets yet
                (only primitive geometry) it simply never shows today, and
                is already correct for when Phase 4/5 adds real ones. */}
            <FutureLoadingScreen />
            <FutureHud onExit={onExit} />
            {nearLandmark && !activeLandmark && (
              <InteractionPrompt label={`Explore ${nearLandmark.company} — ${nearLandmark.title}`} />
            )}
            {activeLandmark && (
              <ProjectOverlay
                landmark={activeLandmark}
                onClose={handleCloseOverlay}
                onOpenFullCaseStudy={onOpenCaseStudy}
              />
            )}
          </>
        )}
      </FutureErrorBoundary>
    </div>
  );
}
