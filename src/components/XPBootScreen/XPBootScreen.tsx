import xpFlag from "../../assets/desktop/xp-flag.svg";
import styles from "./XPBootScreen.module.css";

interface XPBootScreenProps {
  /** Whether the boot screen is currently shown. It stays mounted so the
   *  fade transition between it and the desktop can animate smoothly. */
  visible: boolean;
  /** Status text announced to assistive tech only — the authentic boot
   *  screen has no visible status line, so this isn't rendered on screen. */
  label: string;
}

/**
 * Full-viewport Windows XP boot/loading screen, built entirely with CSS and
 * SVG: black background, flag + "Microsoft Windows xp Professional"
 * wordmark, an animated loading bar, and the copyright/logo footer lines.
 * Purely presentational — how long it stays on screen is decided by
 * `useBootSequence` (see `src/config/timing.ts`), not by this component.
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
        <div className={styles.logoRow}>
          <img src={xpFlag} alt="" className={styles.flag} width={72} height={72} />
          <div className={styles.wordmarkStack}>
            <span className={styles.microsoftLabel}>Microsoft</span>
            <div className={styles.windowsRow}>
              <span className={styles.windowsWord}>Windows</span>
              <span className={styles.xpWord}>xp</span>
            </div>
            <span className={styles.edition}>Professional</span>
          </div>
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressBlocks}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <span className={styles.visuallyHiddenLabel}>{label}</span>

      <p className={styles.copyright}>
        Copyright © 1985-2001
        <br />
        Microsoft Corporation
      </p>
      <p className={styles.msLogo}>Microsoft</p>
    </div>
  );
}
