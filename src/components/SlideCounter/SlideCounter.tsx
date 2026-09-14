import styles from "./SlideCounter.module.css";

interface SlideCounterProps {
  current: number;
  total: number;
}

/** "N / total" readout. Announced politely so screen-reader users hear
 *  slide changes without the whole window being re-announced. */
export function SlideCounter({ current, total }: SlideCounterProps) {
  return (
    <span className={styles.counter} aria-live="polite">
      {current} / {total}
    </span>
  );
}
