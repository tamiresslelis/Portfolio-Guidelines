import xpFlag from "../assets/desktop/xp-flag.svg";

interface XPBootScreenProps {
  /** Whether the boot screen is currently shown. It stays mounted so the
   *  fade transition between it and the desktop can animate smoothly. */
  visible: boolean;
  /** Status text announced to assistive tech only — the authentic boot
   *  screen has no visible status line, so this isn't rendered on screen. */
  label: string;
}

/**
 * Full-viewport Windows XP boot/loading screen, built entirely with
 * Tailwind utilities and a couple of custom keyframes (src/styles.css):
 * black background, flag + "Microsoft Windows xp Professional" wordmark,
 * an animated loading bar, and the copyright/logo footer lines. Purely
 * presentational — how long it stays on screen is decided by
 * `useBootSequence` (see `src/config/timing.ts`), not by this component.
 */
export function XPBootScreen({ visible, label }: XPBootScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-black transition-opacity duration-400 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <div className="flex flex-col items-center gap-5 sm:gap-8">
        <div className="flex items-center gap-3.5 sm:gap-6">
          <img
            src={xpFlag}
            alt=""
            width={72}
            height={72}
            className="w-14 flex-shrink-0 animate-xp-wave motion-reduce:animate-none sm:w-20"
          />
          <div className="flex flex-col">
            <span className="text-[13px] tracking-[0.2px] text-[#e6e6e6] sm:text-[17px]">
              Microsoft
            </span>
            <div className="flex items-baseline gap-1.5 leading-none sm:gap-2.5">
              <span className="font-[Franklin_Gothic_Medium,Arial_Narrow,var(--font-xp),sans-serif] text-[32px] font-bold tracking-[-0.5px] text-white italic sm:text-[50px]">
                Windows
              </span>
              <span className="font-[Franklin_Gothic_Medium,Arial_Narrow,var(--font-xp),sans-serif] text-[22px] font-bold text-[#ff7a1a] italic sm:text-[36px]">
                xp
              </span>
            </div>
            <span className="mt-0.5 text-[14px] text-[#cfcfcf] sm:text-[19px]">Professional</span>
          </div>
        </div>

        <div
          className="relative h-[9px] w-[130px] overflow-hidden rounded-[5px] border border-[#55606c] bg-[#0c0c0c] sm:w-[180px]"
          aria-hidden="true"
        >
          <div className="absolute top-px bottom-px left-0 flex gap-0.5 animate-xp-slide motion-reduce:animate-none motion-reduce:left-5">
            <span className="h-full w-[13px] rounded-[1px] bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
            <span className="h-full w-[13px] rounded-[1px] bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
            <span className="h-full w-[13px] rounded-[1px] bg-linear-to-b from-[#5aa0ea] to-[#0a4bb5]" />
          </div>
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
