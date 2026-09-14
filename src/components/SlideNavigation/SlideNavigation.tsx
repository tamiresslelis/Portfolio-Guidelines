import styles from "./SlideNavigation.module.css";

interface SlideNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

/** Previous/next arrow buttons overlaid on the slide area. */
export function SlideNavigation({ onPrev, onNext, canPrev, canNext }: SlideNavigationProps) {
  return (
    <>
      <button
        type="button"
        className={`${styles.navButton} ${styles.prev}`}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.navButton} ${styles.next}`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
