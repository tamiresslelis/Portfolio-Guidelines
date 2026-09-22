interface FutureHudProps {
  onExit: () => void;
}

/**
 * The only permanent DOM chrome layered over the canvas: an identity
 * line, a one-line controls hint, and the "time machine" back to 2011 —
 * deliberately restrained rather than a generic game HUD (health bars,
 * minimaps, a nav bar of pages that don't exist yet), matching "this is
 * still a design portfolio" over "this is a game." A top-right Projects/
 * About/Resume nav is intentionally not here yet — with only one
 * landmark wired up so far, a nav bar pointing at sections that don't
 * exist would be a fake affordance, not a real one; it belongs once
 * there's more than one destination to navigate between.
 */
export function FutureHud({ onExit }: FutureHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-sans sm:p-6">
      <div className="pointer-events-none">
        <p className="m-0 text-sm font-medium tracking-wide text-white/90">Tamires Lelis</p>
        <p className="m-0 text-xs text-white/60">2026 — Career Journey (preview)</p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="pointer-events-none m-0 text-xs text-white/60">
          WASD/arrows to move · Shift to run · click the ground to walk there
        </p>

        {/* The "time machine": a small glowing artifact rather than a
            plain exit button, evolving from the taskbar's own time
            -machine control in 2011 (see TimeMachineControl.tsx) — same
            concept, styled for this era instead of copy-pasted. */}
        <button
          type="button"
          onClick={onExit}
          title="Where it all started."
          className="pointer-events-auto flex flex-shrink-0 items-center gap-2 rounded-full border border-white/20 bg-black/40 py-1.5 pr-3 pl-2 text-xs font-medium text-white/90 backdrop-blur-sm hover:bg-black/60 focus-visible:bg-black/60"
        >
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ background: "radial-gradient(circle, #f2d98a 0%, #8fc4ff 100%)" }}
            aria-hidden="true"
          />
          Back to 2011 →
        </button>
      </div>
    </div>
  );
}
