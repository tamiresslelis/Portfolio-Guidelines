import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { cases, getCaseById } from "../data/cases";
import { useBootSequence } from "../hooks/useBootSequence";
import { useStartupSound } from "../hooks/useStartupSound";
import { XPBootScreen } from "../components/XPBootScreen";
import { Desktop } from "../components/Desktop";

export const Route = createFileRoute("/")({ component: Home });

/**
 * The whole experience's top-level state. Everything the app needs to
 * remember lives in plain `useState` here — no global state library
 * required:
 *  - `bootMode` (via `useBootSequence`): which boot/loading screen, if any,
 *    is currently showing.
 *  - `activeCaseId` / `currentSlide`: which case window is open, if any,
 *    and which slide it's on.
 *  - `isResumeOpen`: whether the resume window is open. Mutually exclusive
 *    with `activeCaseId` — opening one explicitly closes the other, so
 *    only one window is ever on screen at a time, matching every other
 *    "return to desktop" path (Start, close, boot).
 *  - `hasSeenNavigationTooltip`: whether the "use ← → or swipe" hint has
 *    already been shown once this session.
 */
function Home() {
  const { bootMode, boot, awaitingFirstInteraction } = useBootSequence("initial");
  // Plays the XP startup chime every time the boot screen finishes and the
  // desktop appears — the initial load and every Start-button reboot alike.
  useStartupSound(bootMode);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [hasSeenNavigationTooltip, setHasSeenNavigationTooltip] = useState(false);

  const activeCase = getCaseById(activeCaseId) ?? null;
  const totalSlides = activeCase?.slides.length ?? 0;

  const handleOpenCase = useCallback((id: string) => {
    setIsResumeOpen(false);
    setActiveCaseId(id);
    setCurrentSlide(0);
  }, []);

  // Red X / Escape: return to the desktop immediately, no boot screen.
  const handleCloseCase = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
  }, []);

  const handleOpenResume = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
    setIsResumeOpen(true);
  }, []);

  const handleCloseResume = useCallback(() => {
    setIsResumeOpen(false);
  }, []);

  // Start button: always shows the (short) boot screen, whether pressed
  // from the desktop, from inside an open case, or from the resume.
  const handleStartClick = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
    setIsResumeOpen(false);
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
    <div className="relative h-dvh w-full overflow-hidden">
      <Desktop
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
        isResumeOpen={isResumeOpen}
        onOpenResume={handleOpenResume}
        onCloseResume={handleCloseResume}
      />
      <XPBootScreen
        visible={bootMode !== null}
        label={bootMode === "initial" ? "Starting up…" : "Loading…"}
        awaitingFirstInteraction={awaitingFirstInteraction}
      />
    </div>
  );
}
