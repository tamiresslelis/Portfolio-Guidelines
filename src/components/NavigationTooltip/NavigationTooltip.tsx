import { useEffect } from "react";
import styles from "./NavigationTooltip.module.css";

const AUTO_DISMISS_MS = 4000;

interface NavigationTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * First-time hint pointing visitors at the slide navigation. Shown once per
 * session (tracked by `hasSeenNavigationTooltip` in `Portfolio.tsx`) and
 * dismissed automatically, on close, or on the first navigation action.
 */
export function NavigationTooltip({ visible, onDismiss }: NavigationTooltipProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className={styles.tooltip} role="status">
      <p className={styles.text}>Use ← → or swipe to browse slides</p>
      <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss hint">
        ×
      </button>
    </div>
  );
}
