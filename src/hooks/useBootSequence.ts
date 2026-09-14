import { useCallback, useEffect, useState } from "react";
import { BOOT_DURATIONS, type BootMode } from "../config/timing";

interface UseBootSequenceResult {
  /** Current boot mode; `null` means the desktop is showing. */
  bootMode: BootMode;
  /** Convenience flag: `bootMode !== null`. */
  isBooting: boolean;
  /** Starts a boot sequence. Automatically clears itself after its duration. */
  boot: (mode: Exclude<BootMode, null>) => void;
}

/**
 * Owns the single timer behind the Windows XP boot/loading screen.
 *
 * Both the one-time initial boot and the repeatable "start button" boot
 * share this hook so their durations (`src/config/timing.ts`) stay defined
 * in exactly one place instead of scattered `setTimeout` calls.
 */
export function useBootSequence(initialMode: BootMode = "initial"): UseBootSequenceResult {
  const [bootMode, setBootMode] = useState<BootMode>(initialMode);

  useEffect(() => {
    if (bootMode === null) return;

    const duration = BOOT_DURATIONS[bootMode];
    const timer = window.setTimeout(() => setBootMode(null), duration);

    return () => window.clearTimeout(timer);
  }, [bootMode]);

  const boot = useCallback((mode: Exclude<BootMode, null>) => {
    setBootMode(mode);
  }, []);

  return { bootMode, isBooting: bootMode !== null, boot };
}
