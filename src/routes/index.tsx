import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { cases, getCaseById } from "../data/cases";
import { useBootSequence } from "../hooks/useBootSequence";
import { useStartupSound } from "../hooks/useStartupSound";
import { XPBootScreen } from "../components/XPBootScreen";
import { Desktop } from "../components/Desktop";
import { EvolutionTransition } from "../components/EvolutionTransition";

export const Route = createFileRoute("/")({
  // Lets the /future experience hand off to this side's real case-study
  // viewer via a plain URL (?case=<id>) instead of re-implementing case
  // -study reading inside the 3D route — see the effect below, which
  // consumes and then clears this param.
  validateSearch: (search: Record<string, unknown>): { case?: string } => ({
    case: typeof search.case === "string" ? search.case : undefined,
  }),
  component: Home,
});

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
  const navigate = useNavigate();
  const { case: caseIdFromSearch } = Route.useSearch();
  const { bootMode, boot, awaitingFirstInteraction } = useBootSequence("initial");
  // Plays the XP startup chime every time the boot screen finishes and the
  // desktop appears — the initial load and every Start-button reboot alike.
  useStartupSound(bootMode);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isResumeUnlocked, setIsResumeUnlocked] = useState(false);
  const [hasSeenNavigationTooltip, setHasSeenNavigationTooltip] = useState(false);
  const [isEvolvingToFuture, setIsEvolvingToFuture] = useState(false);

  const activeCase = getCaseById(activeCaseId) ?? null;
  const totalSlides = activeCase?.slides.length ?? 0;

  const handleOpenCase = useCallback((id: string) => {
    setIsResumeOpen(false);
    setActiveCaseId(id);
    setCurrentSlide(0);
  }, []);

  // "Open full case study" from the /future experience arrives here as
  // ?case=<id> — open it exactly like clicking its desktop folder would,
  // then clear the param (replace, no new history entry) so it doesn't
  // linger and re-trigger if the visitor navigates here again later.
  useEffect(() => {
    if (!caseIdFromSearch) return;
    if (getCaseById(caseIdFromSearch)) {
      handleOpenCase(caseIdFromSearch);
    }
    void navigate({ to: "/", search: {}, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseIdFromSearch]);

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

  // Once unlocked with the correct password, the resume stays unlocked for
  // the rest of this visit — reopening the folder goes straight to the
  // resume instead of asking again.
  const handleUnlockResume = useCallback(() => {
    setIsResumeUnlocked(true);
  }, []);

  // Start Menu → "Restart Desktop": always shows the (short) boot screen,
  // whether pressed from the desktop, from inside an open case, or from
  // the resume. The taskbar's own former direct behavior, now reachable
  // as a menu item instead of the Start button's click action.
  const handleRestartDesktop = useCallback(() => {
    setActiveCaseId(null);
    setCurrentSlide(0);
    setIsResumeOpen(false);
    boot("start");
  }, [boot]);

  // Start Menu → "View portfolio in the future": kicks off the lazy
  // future-experience chunk's download immediately (the browser caches
  // the module, so by the time EvolutionTransition's animation finishes,
  // `/future`'s own `React.lazy()` import of the same module very likely
  // resolves instantly instead of the visitor watching a second loading
  // state right after the first) and starts the transition; navigation
  // itself happens in `handleEvolutionComplete`, once the transition
  // reaches its own "arrival" visual state.
  const handleViewFuture = useCallback(() => {
    void import("../future/FuturePortfolio");
    setIsEvolvingToFuture(true);
  }, []);

  const handleEvolutionComplete = useCallback(() => {
    void navigate({ to: "/future" });
  }, [navigate]);

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
        onRestartDesktop={handleRestartDesktop}
        onViewFuture={handleViewFuture}
        showNavigationTooltip={activeCase !== null && !hasSeenNavigationTooltip}
        onDismissNavigationTooltip={handleDismissNavigationTooltip}
        isResumeOpen={isResumeOpen}
        isResumeUnlocked={isResumeUnlocked}
        onOpenResume={handleOpenResume}
        onCloseResume={handleCloseResume}
        onUnlockResume={handleUnlockResume}
      />
      <XPBootScreen
        visible={bootMode !== null}
        label={bootMode === "initial" ? "Starting up…" : "Loading…"}
        awaitingFirstInteraction={awaitingFirstInteraction}
      />
      <EvolutionTransition active={isEvolvingToFuture} onComplete={handleEvolutionComplete} />
    </div>
  );
}
