import styles from "./XPBootScreen.module.css";

interface XPBootScreenProps {
  /** Whether the boot screen is currently shown. It stays mounted so the
   *  fade transition between it and the desktop can animate smoothly. */
  visible: boolean;
  /** Status text announced to assistive tech and shown under the loading bar. */
  label: string;
}

/**
 * Full-viewport Windows XP-style boot/loading screen, built entirely with
 * CSS and SVG. Purely presentational — how long it stays on screen is
 * decided by `useBootSequence` (see `src/config/timing.ts`), not by this
 * component.
 */
export function XPBootScreen({ visible, label }: XPBootScreenProps) {
  return (
    <div
      className={`${styles.overlay} ${visible ? styles.visible : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <div className={styles.content}>
        <svg
          className={styles.flag}
          viewBox="0 0 32 32"
          width="64"
          height="64"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="13" height="13" fill="#f25022" />
          <rect x="17" y="2" width="13" height="13" fill="#7fba00" />
          <rect x="2" y="17" width="13" height="13" fill="#00a4ef" />
          <rect x="17" y="17" width="13" height="13" fill="#ffb900" />
        </svg>

        <p className={styles.wordmark}>tamires lelis</p>

        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressBlocks}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <p className={styles.label}>{label}</p>
      </div>

      <p className={styles.copyright}>Portfolio experience inspired by Windows® XP</p>
    </div>
  );
}
