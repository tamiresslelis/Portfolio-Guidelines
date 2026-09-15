import { useEffect, useRef } from "react";
import type { BootMode } from "../config/timing";
import startupSoundSrc from "../assets/audio/windows-xp-startup.wav";

const SESSION_KEY = "portfolio-startup-sound-played";
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
 * Plays the Windows XP startup sound exactly once per browser session: the
 * first time `bootMode` transitions from the *initial* load into the
 * desktop (`"initial"` -> `null`). It intentionally does NOT fire for the
 * start button's reboot (`"start"` -> `null`), for re-renders, or more
 * than once per session — a sessionStorage flag makes "already played"
 * durable even across a reload within the same tab.
 *
 * Every browser blocks unmuted autoplay before the visitor has interacted
 * with the page at all, so the first attempt here will usually be
 * rejected — that's expected, not a bug. What matters is what happens
 * next: `sessionStorage` is only marked "played" once the audio element's
 * `playing` event actually fires, never just because we *attempted* it.
 * That distinction is the difference between "plays once, eventually" and
 * "silently uses up its one shot on a blocked attempt and never plays for
 * the rest of the session" — the latter is what a premature mark causes.
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

    const audio = new Audio(startupSoundSrc);
    audio.volume = STARTUP_VOLUME;
    audio.loop = false;

    // The single source of truth for "it actually played": a native
    // media event, not a resolved play() promise (some engines don't
    // return one) and not "we called play()" (autoplay can be blocked).
    audio.addEventListener("playing", markAsPlayed, { once: true });

    let unlockAttached = false;
    const removeUnlockListeners = () => {
      UNLOCK_EVENTS.forEach((type) => document.removeEventListener(type, retryOnFirstInteraction));
      unlockAttached = false;
    };

    // Autoplay was blocked. Fall back to playing on the visitor's first
    // interaction with the page instead — still at most once (every
    // listener is torn down together the instant any one of them fires),
    // and if that retry also fails we just give up quietly. Either way,
    // the portfolio stays fully usable without sound, and a future
    // reload this session gets a fresh chance since nothing was marked.
    const retryOnFirstInteraction = () => {
      removeUnlockListeners();
      playSafely(audio).catch(() => {
        // still blocked, or failed for some other reason — nothing to do
      });
    };

    playSafely(audio).catch(() => {
      unlockAttached = true;
      UNLOCK_EVENTS.forEach((type) =>
        document.addEventListener(type, retryOnFirstInteraction, { once: true }),
      );
    });

    return () => {
      audio.removeEventListener("playing", markAsPlayed);
      if (unlockAttached) removeUnlockListeners();
    };
  }, [bootMode]);
}
