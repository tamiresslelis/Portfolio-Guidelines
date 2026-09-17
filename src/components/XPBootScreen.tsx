import xpFlag from "../assets/desktop/xp-flag.svg";

interface XPBootScreenProps {
  /** Whether the boot screen is currently shown. It stays mounted so the
   *  fade transition between it and the desktop can animate smoothly. */
  visible: boolean;
  /** Status text announced to assistive tech only — the authentic boot
   *  screen has no visible status line, so this isn't rendered on screen. */
  label: string;
  /** True only during the very first boot, before the visitor has clicked,
   *  tapped, or pressed a key anywhere on the page. The countdown to the
   *  desktop is paused until then (see useBootSequence.ts for why), so this
   *  shows a "click to continue" cue instead of animating as if it were
   *  already progressing. */
  awaitingFirstInteraction: boolean;
}

/**
 * Full-viewport Windows XP boot/loading screen, built entirely with
 * Tailwind utilities and a couple of custom keyframes (src/styles.css):
 * black background, flag stacked above the "Microsoft Windows xp
 * Professional" wordmark, an animated loading bar, and the copyright/logo
 * footer lines — matching the reference boot-screen screenshot (flag on
 * top, centered wordmark below it) rather than the flag-beside-text
 * consumer-edition layout. Purely presentational — how long it stays on
 * screen is decided by `useBootSequence` (see `src/config/timing.ts`), not
 * by this component.
 */
export function XPBootScreen({ visible, label, awaitingFirstInteraction }: XPBootScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-black transition-opacity duration-400 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      } ${awaitingFirstInteraction ? "cursor-pointer" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <div className="flex flex-col items-center gap-6 sm:gap-9">
        <img
          src={xpFlag}
          alt=""
          width={96}
          height={96}
          className="w-16 flex-shrink-0 animate-xp-wave motion-reduce:animate-none sm:w-24"
        />

        <div className="-mt-3 flex flex-col items-center sm:-mt-5">
          <span className="text-[12px] tracking-[0.2px] text-[#e6e6e6] sm:text-[15px]">
            Microsoft<sup>®</sup>
          </span>
          <div className="flex items-start gap-1.5 leading-none sm:gap-2">
            <span className="font-[Franklin_Gothic_Medium,Arial_Narrow,var(--font-xp),sans-serif] text-[34px] font-bold tracking-[-0.5px] text-white sm:text-[54px]">
              Windows
            </span>
            <span className="font-[Franklin_Gothic_Medium,Arial_Narrow,var(--font-xp),sans-serif] mt-1 text-[18px] font-bold text-[#ff7a1a] sm:mt-1.5 sm:text-[28px]">
              xp
            </span>
          </div>
          <span className="mt-1 text-[13px] text-[#cfcfcf] sm:mt-1.5 sm:text-[17px]">Professional</span>
        </div>

        <div
          className="relative h-[10px] w-[160px] overflow-hidden rounded-full border border-[#55606c] bg-[#0c0c0c] sm:w-[220px]"
          aria-hidden="true"
        >
          <div
            className={`absolute top-px bottom-px left-0 flex gap-0.5 motion-reduce:animate-none motion-reduce:left-5 ${
              awaitingFirstInteraction ? "left-0" : "animate-xp-slide"
            }`}
          >
            <span className="h-full w-[15px] rounded-full bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
            <span className="h-full w-[15px] rounded-full bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
            <span className="h-full w-[15px] rounded-full bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
          </div>
        </div>

        {/* No browser allows audio to autoplay before the visitor has
            interacted with the page at all — this is what makes the
            startup chime (useStartupSound) able to play automatically the
            instant the desktop appears, every time, instead of needing a
            second click later. Not part of the authentic XP boot screen,
            but there's no way to guarantee that without it. Styled as a
            deliberately eye-catching, pulsing prompt (icon + uppercase,
            letter-spaced label) rather than a quiet caption, so it reads
            immediately as something to act on. */}
        <div
          className={`flex items-center gap-2.5 transition-opacity duration-300 ${
            awaitingFirstInteraction ? "animate-xp-pulse opacity-100 motion-reduce:animate-none" : "opacity-0"
          }`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M9 3.5 9 14M9 3.5c3 0 5.5 2.5 5.5 5.5M5.5 10.5v6.5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-4a2 2 0 0 0-2-2h-.5"
              fill="none"
              stroke="#8fc4ff"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 5.5c1.4 1 2.3 2.6 2.3 4.5M19 2.8c2.2 1.5 3.6 4 3.6 6.8"
              fill="none"
              stroke="#8fc4ff"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] font-semibold tracking-[1.5px] text-[#cfe4ff] uppercase sm:text-[15px]">
            Click or Tap to Start
          </span>
        </div>
      </div>

      {/* Boot status ("Starting up…" vs "Loading…") is announced to
          assistive tech, but isn't part of the authentic visual — the
          real boot screen has no status line. */}
      <span className="sr-only">{label}</span>

      <p className="absolute bottom-3.5 left-4 m-0 text-xp-xs leading-[1.4] text-[#9a9a9a] sm:bottom-7 sm:left-8">
        Copyright © 1985-2001
        <br />
        Microsoft Corporation
      </p>
      <p className="absolute right-4 bottom-3.5 m-0 font-serif text-xp-sm font-bold tracking-[0.5px] text-[#f2f2f2] sm:right-8 sm:bottom-7">
        Microsoft
      </p>
    </div>
  );
}
