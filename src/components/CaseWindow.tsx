import { useEffect, useId, useRef, useState } from "react";
import type { CaseStudy } from "../data/cases";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { CaseSlide } from "./CaseSlide";
import { SlideNavigation } from "./SlideNavigation";
import { SlideCounter } from "./SlideCounter";
import { NavigationTooltip } from "./NavigationTooltip";

interface CaseWindowProps {
  caseStudy: CaseStudy;
  currentSlide: number;
  /** Red X / Escape: closes immediately, no boot screen. */
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoToSlide: (index: number) => void;
  showNavigationTooltip: boolean;
  onDismissNavigationTooltip: () => void;
}

const controlButtonBase =
  "flex h-5 w-[22px] items-center justify-center rounded-[2px] text-[11px] leading-none";

/**
 * The XP-chrome window that hosts one case study's slides. Owns keyboard
 * (arrow keys + Escape) and swipe navigation, and basic dialog focus
 * management: focus moves into the window on open and returns to whatever
 * triggered it on close.
 */
export function CaseWindow({
  caseStudy,
  currentSlide,
  onClose,
  onPrev,
  onNext,
  onGoToSlide,
  showNavigationTooltip,
  onDismissNavigationTooltip,
}: CaseWindowProps) {
  const titleId = useId();
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const totalSlides = caseStudy.slides.length;
  const slide = caseStudy.slides[currentSlide];

  // Move focus into the window on open, restore it to whatever triggered
  // the open (the desktop folder icon) on close, and start each newly
  // opened case un-maximized regardless of how the previous one was left.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    windowRef.current?.focus();
    setIsMaximized(false);

    return () => {
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStudy.id]);

  const handleToggleMaximize = () => {
    setIsMaximized((maximized) => !maximized);
  };

  const handlePrev = () => {
    onDismissNavigationTooltip();
    onPrev();
  };

  const handleNext = () => {
    onDismissNavigationTooltip();
    onNext();
  };

  useKeyboardNavigation(true, { onPrev: handlePrev, onNext: handleNext, onClose });
  useSwipeNavigation(contentRef, { onSwipeLeft: handleNext, onSwipeRight: handlePrev });

  return (
    <div
      ref={windowRef}
      className={
        isMaximized
          ? "absolute top-0 left-0 z-10 flex h-[calc(100dvh-34px)] w-screen flex-col overflow-hidden bg-xp-window-bg outline-none"
          : "absolute top-1/2 left-1/2 z-10 flex h-[min(640px,86dvh)] w-[min(920px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xp-window border border-xp-window-border bg-xp-window-bg shadow-xp-window outline-none max-[600px]:top-0 max-[600px]:left-0 max-[600px]:h-[calc(100dvh-34px)] max-[600px]:w-screen max-[600px]:translate-x-0 max-[600px]:translate-y-0 max-[600px]:rounded-none"
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="flex h-8 flex-shrink-0 items-center gap-2 border-b border-xp-window-border bg-linear-to-b from-xp-titlebar-mid via-xp-titlebar-start via-45% to-xp-titlebar-end py-0 pr-1.5 pl-2.5">
        <span className="h-4 w-4 flex-shrink-0 rounded-[2px] bg-[#ffd45e]" aria-hidden="true" />
        <h2
          id={titleId}
          className="m-0 min-w-0 flex-1 overflow-hidden text-xp-base font-bold text-ellipsis whitespace-nowrap text-white"
          style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.35)" }}
        >
          {caseStudy.title}
        </h2>
        <div className="flex flex-shrink-0 gap-[3px]">
          {/* Minimize: present for authentic XP chrome, but visually
              disabled — this window only supports closing (X / Escape). */}
          <span
            className={`${controlButtonBase} border border-[#b6bed2] bg-linear-to-b from-[#eef1f8] to-[#d6dceb] text-[#c1c9dc]`}
            aria-hidden="true"
          >
            &#x2013;
          </span>
          {/* Maximize/restore: the one window-control button that's
              actually wired up, so it gets the "enabled" silver treatment
              (matching the slide nav arrows) rather than the muted look of
              the disabled minimize button. */}
          <button
            type="button"
            onClick={handleToggleMaximize}
            className={`${controlButtonBase} border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]`}
            aria-label={isMaximized ? "Restore case study window" : "Maximize case study window"}
            aria-pressed={isMaximized}
          >
            {isMaximized ? (
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <rect x="3.5" y="0.75" width="7.75" height="7.75" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <rect x="0.75" y="3.5" width="7.75" height="7.75" fill="#e8e8e8" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            ) : (
              "□"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${controlButtonBase} border border-[#7a1c14] bg-linear-to-b from-xp-close-start to-xp-close-end text-white hover:brightness-110 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]`}
            aria-label="Close case study"
          >
            &#x2715;
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-xp-window-content-bg px-14 py-5 max-[768px]:px-12 max-[768px]:py-4 max-[600px]:px-11 max-[600px]:py-3"
      >
        <CaseSlide slide={slide} />
        <SlideNavigation
          onPrev={handlePrev}
          onNext={handleNext}
          canPrev={currentSlide > 0}
          canNext={currentSlide < totalSlides - 1}
        />
        <NavigationTooltip visible={showNavigationTooltip} onDismiss={onDismissNavigationTooltip} />
      </div>

      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-[#b8b6a8] bg-linear-to-b from-[#f2f1e8] to-[#e4e2d3] px-3 py-1.5">
        <div className="flex items-center gap-1.5 max-[600px]:hidden">
          {caseStudy.slides.map((s, index) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onDismissNavigationTooltip();
                onGoToSlide(index);
              }}
              className={`h-2 w-2 rounded-full border p-0 ${
                index === currentSlide
                  ? "border-xp-titlebar-start bg-xp-titlebar-start"
                  : "border-[#8a8a7a] bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
        <SlideCounter current={currentSlide + 1} total={totalSlides} />
      </div>
    </div>
  );
}
