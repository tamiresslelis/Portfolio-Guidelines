interface SlideCounterProps {
  current: number;
  total: number;
}

/** "N / total" readout. Announced politely so screen-reader users hear
 *  slide changes without the whole window being re-announced. */
export function SlideCounter({ current, total }: SlideCounterProps) {
  return (
    <span
      className="inline-block rounded-[10px] border border-[#b8b6a8] bg-[#e4e2d6] px-2.5 py-0.5 text-xp-xs font-semibold text-[#333]"
      aria-live="polite"
    >
      {current} / {total}
    </span>
  );
}
