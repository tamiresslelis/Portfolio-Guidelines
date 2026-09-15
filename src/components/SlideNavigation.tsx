interface SlideNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

const buttonClasses =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#8a8a8a] bg-linear-to-b from-xp-silver-start to-xp-silver-end text-[#2a2a2a] shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-opacity hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] disabled:cursor-default disabled:opacity-35 disabled:hover:from-xp-silver-start disabled:hover:to-xp-silver-end max-[600px]:h-11 max-[600px]:w-11";

/** Previous/next arrow buttons overlaid on the slide area. */
export function SlideNavigation({ onPrev, onNext, canPrev, canNext }: SlideNavigationProps) {
  return (
    <>
      <button
        type="button"
        className={`${buttonClasses} left-2.5`}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M10 2 4 8l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`${buttonClasses} right-2.5`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M6 2l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
