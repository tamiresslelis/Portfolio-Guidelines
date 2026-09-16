import { useEffect, useRef } from "react";
import type { BootMode } from "../config/timing";
import startupSoundSrc from "../assets/audio/windows-xp-startup.wav";

const STARTUP_VOLUME = 0.6;

// Every event type modern browsers count as "user activation" that a
// blocked autoplay can be safely retried from inside — deliberately wide
// (not just click) because engines differ on which of these they honor,
// and touch devices never fire a bare "click" from a tap in every case.
const UNLOCK_EVENTS: (keyof DocumentEventMap)[] = [
  "pointerdown",
  "pointerup",
  "touchend",
  "mousedown",
  "keydown",
];

/** Normalizes `HTMLMediaElement.play()` into a real Promise across
 *  engines that don't return one (very old WebKit) and ones that throw
 *  synchronously instead of rejecting. */
function playSafely(audio: HTMLAudioElement): Promise<void> {
  try {
    const result = audio.play();
    return result && typeof result.then === "function" ? result : Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * Plays the Windows XP startup chime every time the boot/loading screen
 * finishes and the desktop appears — the initial load *and* every
 * subsequent Start-button reboot both count, since both are the same
 * black-screen-to-desktop transition. One `Audio` element is created once
 * and reused (rewound to the start each time) rather than allocating a new
 * one per play.
 *
 * Every browser blocks unmuted autoplay before the visitor has interacted
 * with the page at all, so only the very first attempt (right after the
 * initial 2s boot, if the visitor hasn't touched the page yet) is likely to
 * be rejected — that's expected, not a bug. That one blocked attempt falls
 * back to playing on the visitor's next interaction instead. Once the
 * visitor has interacted with the page at all (which clicking Start itself
 * counts as), the browser's autoplay policy stays unlocked for the rest of
 * the session, so every later reboot plays immediately without needing a
 * fallback of its own.
 *
 * Kept separate from `XPBootScreen` (which is purely visual) and driven by
 * the same `bootMode` that `useBootSequence` already owns, so the boot
 * timing logic itself lives in exactly one place.
 */
export function useStartupSound(bootMode: BootMode): void {
  const previousBootMode = useRef<BootMode>(bootMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelPendingUnlock = useRef<(() => void) | null>(null);

  useEffect(() => {
    // A fresh reboot transition supersedes any not-yet-retried fallback
    // from a previous one, so it doesn't also fire (double-playing) the
    // moment this new transition's own interaction/click happens.
    cancelPendingUnlock.current?.();
    cancelPendingUnlock.current = null;

    const justFinishedBooting = previousBootMode.current !== null && bootMode === null;
    previousBootMode.current = bootMode;

    if (!justFinishedBooting) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(startupSoundSrc);
      audioRef.current.volume = STARTUP_VOLUME;
      audioRef.current.loop = false;
    }
    const audio = audioRef.current;
    audio.currentTime = 0;

    playSafely(audio).catch(() => {
      // Autoplay was blocked. Fall back to playing on the visitor's next
      // interaction with the page instead, and if that retry also fails,
      // give up quietly — the portfolio stays fully usable without sound
      // either way.
      const retryOnNextInteraction = () => {
        removeUnlockListeners();
        audio.currentTime = 0;
        playSafely(audio).catch(() => {
          // still blocked, or failed for some other reason — nothing to do
        });
      };

      const removeUnlockListeners = () => {
        UNLOCK_EVENTS.forEach((type) => document.removeEventListener(type, retryOnNextInteraction));
        cancelPendingUnlock.current = null;
      };

      UNLOCK_EVENTS.forEach((type) =>
        document.addEventListener(type, retryOnNextInteraction, { once: true }),
      );
      cancelPendingUnlock.current = removeUnlockListeners;
    });
  }, [bootMode]);

  useEffect(() => {
    return () => cancelPendingUnlock.current?.();
  }, []);
}
