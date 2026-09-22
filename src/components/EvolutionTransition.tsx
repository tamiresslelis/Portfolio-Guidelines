import { useEffect, useRef } from "react";
import { EVOLUTION_TRANSITION_DURATION } from "../config/timing";

interface EvolutionTransitionProps {
  active: boolean;
  /** Fires once, after the transition has finished — the caller should
   *  navigate to `/future` at that point (see routes/index.tsx). */
  onComplete: () => void;
}

// Fixed, deterministic positions/delays for the drifting "motes" in the
// bloom beat — no reason for these to be Math.random() (which would also
// make this component render non-deterministically, complicating any
// future SSR/testing of it) when a handful of hand-picked values already
// reads as organic.
const MOTE_LEFT_PERCENTAGES = [12, 26, 41, 54, 68, 79, 91];
const MOTE_DELAYS_SECONDS = [0, 0.4, 0.2, 0.7, 0.1, 0.5, 0.3];

const REDUCED_MOTION_DURATION = 400;

/**
 * The full-viewport "2011 → future" transition, played once when the
 * visitor picks "View portfolio in the future" from the Start Menu.
 * Three CSS-only beats (see the keyframes in styles.css and the comment
 * on each layer below) — deliberately no Three.js/WebGL here, since it
 * needs to start playing instantly while the future experience's own JS
 * chunk downloads in the background (see routes/index.tsx, which kicks
 * off that `import()` the moment this transition starts).
 *
 * Ends in a dark, soft-glow "arrival" state; `FutureLoadingScreen` (the
 * `/future` route's own loading UI) intentionally starts from a matching
 * visual, so the handoff across the route change reads as one continuous
 * moment rather than a cut.
 */
export function EvolutionTransition({ active, onComplete }: EvolutionTransitionProps) {
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      hasCompletedRef.current = false;
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? REDUCED_MOTION_DURATION : EVOLUTION_TRANSITION_DURATION;

    const timer = window.setTimeout(() => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      onComplete();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-hidden bg-black" role="status" aria-live="polite">
      <span className="sr-only">Entering the future experience…</span>

      {/* Beat 1 — Fracture: a bright scanline sweep + a brief horizontal
          jitter, like a CRT losing sync. Skipped under reduced motion —
          those visitors go straight to the arrival state below. */}
      <div
        className="absolute inset-x-0 top-0 h-1 animate-evolution-scanline bg-linear-to-r from-transparent via-white/90 to-transparent motion-reduce:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 animate-evolution-glitch motion-reduce:hidden"
        style={{ animationDelay: "250ms" }}
        aria-hidden="true"
      />

      {/* Beat 2 — Dissolve: the XP blue breaking into sliding slivers,
          fading in over the (still-visible-through-it) desktop. */}
      <div
        className="absolute inset-0 animate-evolution-dissolve bg-repeat motion-reduce:hidden"
        style={{
          animationDelay: "300ms",
          backgroundImage:
            "repeating-linear-gradient(90deg, #5aa0ea 0px, #0a4bb5 6px, transparent 6px, transparent 16px)",
          backgroundSize: "200% 100%",
        }}
        aria-hidden="true"
      />

      {/* Beat 3 — Bloom: the arrival. A soft glow rising from a low
          horizon, drifting motes, and a quiet line of text. Reduced-motion
          visitors land here immediately, at full opacity, no animation. */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-[18%] animate-evolution-bloom motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[animation-delay:0ms]" style={{ animationDelay: "1300ms" }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 78%, rgba(224,178,60,0.35) 0%, rgba(35,90,84,0.55) 40%, #04100e 78%)",
          }}
          aria-hidden="true"
        />
        {MOTE_LEFT_PERCENTAGES.map((left, index) => (
          <span
            key={left}
            className="absolute bottom-[30%] h-1 w-1 rounded-full bg-[#f2d98a] animate-evolution-mote motion-reduce:hidden"
            style={{ left: `${left}%`, animationDelay: `${MOTE_DELAYS_SECONDS[index]}s` }}
            aria-hidden="true"
          />
        ))}
        <p
          className="relative m-0 animate-evolution-text text-xp-sm tracking-[3px] text-[#f2d98a] uppercase opacity-0 motion-reduce:opacity-100"
          style={{ animationDelay: "1500ms" }}
          aria-hidden="true"
        >
          Entering the future
        </p>
      </div>
    </div>
  );
}
