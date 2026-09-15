import { useEffect, useId, useRef, useState } from "react";
import type { CaseStudy } from "../../data/cases";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useSwipeNavigation } from "../../hooks/useSwipeNavigation";
import { CaseSlide } from "../CaseSlide";
import { SlideNavigation } from "../SlideNavigation";
import { SlideCounter } from "../SlideCounter";
import { NavigationTooltip } from "../NavigationTooltip";
import styles from "./CaseWindow.module.css";

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
      className={`${styles.window} ${isMaximized ? styles.maximized : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className={styles.titleBar}>
        <span className={styles.titleIcon} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>
          {caseStudy.title}
        </h2>
        <div className={styles.controls}>
          <span className={`${styles.controlButton} ${styles.disabledButton}`} aria-hidden="true">
            &#x2013;
          </span>
          <button
            type="button"
            className={`${styles.controlButton} ${styles.maximizeButton}`}
            onClick={handleToggleMaximize}
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
            className={`${styles.controlButton} ${styles.closeButton}`}
            onClick={onClose}
            aria-label="Close case study"
          >
            &#x2715;
          </button>
        </div>
      </div>

      <div className={styles.content} ref={contentRef}>
        <CaseSlide slide={slide} />
        <SlideNavigation
          onPrev={handlePrev}
          onNext={handleNext}
          canPrev={currentSlide > 0}
          canNext={currentSlide < totalSlides - 1}
        />
        <NavigationTooltip visible={showNavigationTooltip} onDismiss={onDismissNavigationTooltip} />
      </div>

      <div className={styles.statusBar}>
        <div className={styles.dots}>
          {caseStudy.slides.map((s, index) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
              onClick={() => {
                onDismissNavigationTooltip();
                onGoToSlide(index);
              }}
            />
          ))}
        </div>
        <SlideCounter current={currentSlide + 1} total={totalSlides} />
      </div>
    </div>
  );
}
