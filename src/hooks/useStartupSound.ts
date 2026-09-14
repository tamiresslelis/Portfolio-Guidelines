import { useEffect, useRef } from "react";
import type { BootMode } from "../config/timing";
import startupSoundSrc from "../assets/audio/windows-xp-startup.wav";

const SESSION_KEY = "portfolio-startup-sound-played";
const STARTUP_VOLUME = 0.6;

function hasAlreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    // sessionStorage unavailable (private browsing, disabled storage, a
    // sandboxed iframe, ...) — the in-memory ref guard in the hook below
    // still keeps this to at most once for the current page load.
    return false;
  }
}

function markAsPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // ignore — see hasAlreadyPlayed above
  }
}

/**
 * Plays the Windows XP startup sound exactly once per browser session: the
 * first time `bootMode` transitions from the *initial* load into the
 * desktop (`"initial"` -> `null`). It intentionally does NOT fire for the
 * start button's reboot (`"start"` -> `null`), for re-renders, or more
 * than once per session — a sessionStorage flag makes "already played"
 * durable even across a reload within the same tab.
 *
 * Kept separate from `XPBootScreen` (which is purely visual) and driven by
 * the same `bootMode` that `useBootSequence` already owns, so the boot
 * timing logic itself lives in exactly one place.
 */
export function useStartupSound(bootMode: BootMode): void {
  const previousBootMode = useRef<BootMode>(bootMode);
  const hasAttempted = useRef(false);

  useEffect(() => {
    const cameFromInitialBoot = previousBootMode.current === "initial";
    const justReachedDesktop = bootMode === null;
    previousBootMode.current = bootMode;

    if (!cameFromInitialBoot || !justReachedDesktop) return;
    if (hasAttempted.current || hasAlreadyPlayed()) return;

    hasAttempted.current = true;
    markAsPlayed();

    const audio = new Audio(startupSoundSrc);
    audio.volume = STARTUP_VOLUME;
    audio.loop = false;

    const controller = new AbortController();

    audio.play().catch(() => {
      // Autoplay was blocked by the browser. Fall back to playing on the
      // visitor's first interaction with the page instead — still at most
      // once (the listeners are torn down together the moment either one
      // fires), and if that also fails we just give up quietly. Either
      // way, the portfolio stays fully usable without sound.
      const retryOnFirstInteraction = () => {
        controller.abort();
        audio.play().catch(() => {
          // still blocked, or failed for some other reason — nothing to do
        });
      };

      const options: AddEventListenerOptions = { once: true, signal: controller.signal };
      document.addEventListener("pointerdown", retryOnFirstInteraction, options);
      document.addEventListener("keydown", retryOnFirstInteraction, options);
    });

    return () => controller.abort();
  }, [bootMode]);
}
