import { useCallback, useState } from "react";
import { cases, getCaseById } from "../../data/cases";
import { useBootSequence } from "../../hooks/useBootSequence";
import { XPBootScreen } from "../XPBootScreen";
import { PortfolioDesktop } from "../PortfolioDesktop";
import styles from "./Portfolio.module.css";

/**
 * Top-level state container for the whole experience. Everything the app
 * needs to remember lives in plain `useState` here — no global state
 * library required:
 *  - `bootMode` (via `useBootSequence`): which boot/loading screen, if any,
 *    is currently showing.
 *  - `activeCaseId` / `currentSlide`: which case window is open, if any,
 *    and which slide it's on.
 *  - `hasSeenNavigationTooltip`: whether the "use ← → or swipe" hint has
 *    already been shown once this session.
 */
export function Portfolio() {
  const { bootMode, boot } = useBootSequence("initial");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasSeenNavigationTooltip, setHasSeenNavigationTooltip] = useState(false);

  const activeCase = getCaseById(activeCaseId) ?? null;
  const totalSlides = activeCase?.slides.length ?? 0;

  const handleOpenCase = useCallback((id: string) => {
    setActiveCaseId(id);
    setCurrentSlide(0);
  }, []);

  // Red X / Escape: return to the desktop immediately, no boot screen.
  const handleCloseCase = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
  }, []);

  // Start button: always shows the (short) boot screen, whether pressed
  // from the desktop or from inside an open case.
  const handleStartClick = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
    boot("start");
  }, [boot]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  }, []);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((slide) => Math.min(slide + 1, totalSlides - 1));
  }, [totalSlides]);

  const handleGoToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(Math.min(Math.max(index, 0), Math.max(totalSlides - 1, 0)));
    },
    [totalSlides],
  );

  const handleDismissNavigationTooltip = useCallback(() => {
    setHasSeenNavigationTooltip(true);
  }, []);

  return (
    <div className={styles.portfolio}>
      <PortfolioDesktop
        cases={cases}
        activeCase={activeCase}
        currentSlide={currentSlide}
        onOpenCase={handleOpenCase}
        onCloseCase={handleCloseCase}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        onGoToSlide={handleGoToSlide}
        onStartClick={handleStartClick}
        showNavigationTooltip={activeCase !== null && !hasSeenNavigationTooltip}
        onDismissNavigationTooltip={handleDismissNavigationTooltip}
      />
      <XPBootScreen
        visible={bootMode !== null}
        label={bootMode === "initial" ? "Starting up…" : "Loading…"}
      />
    </div>
  );
}
