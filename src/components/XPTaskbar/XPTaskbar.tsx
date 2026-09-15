import { useEffect, useState } from "react";
import xpFlag from "../../assets/desktop/xp-flag.svg";
import styles from "./XPTaskbar.module.css";

interface XPTaskbarProps {
  onStartClick: () => void;
  /** Title of the currently open case window, if any, shown as a taskbar button. */
  activeCaseTitle: string | null;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * The taskbar. The start button intentionally does NOT open a Windows-style
 * start menu — clicking it triggers the short boot/loading screen and
 * returns to the desktop (see `Portfolio.tsx` / `src/config/timing.ts`).
 */
export function XPTaskbar({ onStartClick, activeCaseTitle }: XPTaskbarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={styles.taskbar}>
      <button type="button" className={styles.startButton} onClick={onStartClick}>
        <img src={xpFlag} alt="" className={styles.startFlag} width={18} height={18} />
        <span className={styles.startLabel}>start</span>
      </button>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.taskArea}>
        {activeCaseTitle && (
          <span className={styles.taskButton} title={activeCaseTitle}>
            {activeCaseTitle}
          </span>
        )}
      </div>

      <div className={styles.tray}>
        <time className={styles.clock} dateTime={now.toISOString()}>
          {formatClock(now)}
        </time>
      </div>
    </div>
  );
}
