/**
 * Centralized timing configuration for the Windows XP boot sequence.
 *
 * The boot/loading screen is reused for two different interactions, each
 * with its own duration. Every place in the app that needs to trigger a
 * boot sequence should go through `useBootSequence` (see
 * `src/hooks/useBootSequence.ts`) instead of hard-coding a `setTimeout`.
 */

/** Shown once, when the portfolio is opened for the first time. */
export const INITIAL_BOOT_DURATION = 2000;

/** Shown every time the taskbar "start" button is pressed. */
export const START_BOOT_DURATION = 1000;

/**
 * `"initial"` — the one-time boot on first page load.
 * `"start"` — the shorter boot triggered by the start button.
 * `null` — not booting; the desktop (and, optionally, a case window) is shown.
 */
export type BootMode = "initial" | "start" | null;

export const BOOT_DURATIONS: Record<Exclude<BootMode, null>, number> = {
  initial: INITIAL_BOOT_DURATION,
  start: START_BOOT_DURATION,
};

/**
 * How long the 2011 → future evolution transition plays (see
 * `EvolutionTransition.tsx`) before navigating to `/future`. Kept here
 * alongside the boot durations since it's the same kind of concern: one
 * named constant instead of a `setTimeout` magic number.
 */
export const EVOLUTION_TRANSITION_DURATION = 2000;
