import { useCallback, useEffect, useState } from "react";
import { BOOT_DURATIONS, type BootMode } from "../config/timing";

interface UseBootSequenceResult {
  /** Current boot mode; `null` means the desktop is showing. */
  bootMode: BootMode;
  /** Convenience flag: `bootMode !== null`. */
  isBooting: boolean;
  /** Starts a boot sequence. Automatically clears itself after its duration. */
  boot: (mode: Exclude<BootMode, null>) => void;
  /**
   * True only during the very first boot, before the visitor has interacted
   * with the page at all. See the comment on the interaction-gating effect
   * below for why the countdown waits for it.
   */
  awaitingFirstInteraction: boolean;
}

// Same event set useStartupSound's own autoplay-unlock fallback listens
// for — deliberately wide (not just "click") since engines and input
// types differ on which they treat as sufficient activation.
const FIRST_INTERACTION_EVENTS: (keyof DocumentEventMap)[] = [
  "pointerdown",
  "keydown",
  "touchend",
];

/**
 * Owns the single timer behind the Windows XP boot/loading screen.
 *
 * Both the one-time initial boot and the repeatable "start button" boot
 * share this hook so their durations (`src/config/timing.ts`) stay defined
 * in exactly one place instead of scattered `setTimeout` calls.
 */
export function useBootSequence(initialMode: BootMode = "initial"): UseBootSequenceResult {
  const [bootMode, setBootMode] = useState<BootMode>(initialMode);
  const [hasInteracted, setHasInteracted] = useState(false);

  const awaitingFirstInteraction = bootMode === "initial" && !hasInteracted;

  // No browser allows audio to autoplay before the visitor has interacted
  // with the page at all — that's a browser policy, not something app code
  // can override (see useStartupSound.ts). The *initial* boot's countdown
  // deliberately doesn't start until that interaction happens, so the one
  // click/tap this requires is spent getting into the site at all, not a
  // second, separate click after the desktop is already showing — the
  // startup chime then plays automatically and audibly the instant the
  // desktop appears, every time, with certainty. The "start" reboot never
  // needs this: by the time it's reachable at all, the visitor has already
  // interacted with the page once (through this very gate).
  useEffect(() => {
    if (!awaitingFirstInteraction) return;

    const handleFirstInteraction = () => setHasInteracted(true);
    FIRST_INTERACTION_EVENTS.forEach((type) =>
      document.addEventListener(type, handleFirstInteraction, { once: true }),
    );

    return () => {
      FIRST_INTERACTION_EVENTS.forEach((type) =>
        document.removeEventListener(type, handleFirstInteraction),
      );
    };
  }, [awaitingFirstInteraction]);

  useEffect(() => {
    if (awaitingFirstInteraction) return;
    if (bootMode === null) return;

    const duration = BOOT_DURATIONS[bootMode];
    const timer = window.setTimeout(() => setBootMode(null), duration);

    return () => window.clearTimeout(timer);
  }, [bootMode, awaitingFirstInteraction]);

  const boot = useCallback((mode: Exclude<BootMode, null>) => {
    setBootMode(mode);
  }, []);

  return { bootMode, isBooting: bootMode !== null, boot, awaitingFirstInteraction };
}
