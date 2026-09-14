import { useEffect, useId, useRef } from "react";
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

  const totalSlides = caseStudy.slides.length;
  const slide = caseStudy.slides[currentSlide];

  // Move focus into the window on open, and restore it to whatever
  // triggered the open (the desktop folder icon) on close.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    windowRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStudy.id]);

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
      className={styles.window}
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
          <span className={styles.controlButton} aria-hidden="true">
            &#x2013;
          </span>
          <span className={styles.controlButton} aria-hidden="true">
            &#x25a1;
          </span>
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
