import { XpTooltip } from "./XpTooltip";

interface TimeMachineControlProps {
  onActivate: () => void;
}

const TOOLTIP_TEXT = "See what happened next.";

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="#5a4a1a" strokeWidth="1.4" />
      <path d="M10 5.5V10l3 2" fill="none" stroke="#5a4a1a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The "time machine": a persistent, always-visible taskbar affordance —
 * separate from the Start Menu's "View portfolio in the future" item,
 * which stays as a second, equally valid way in. Styled like an early
 * -computer artifact (beige/gold, a simple clock glyph) in this era;
 * `FutureHud.tsx` renders the same concept restyled as a small glowing
 * artifact for 2026, rather than reusing this exact component — the
 * control should visually *evolve* between eras, not just relabel.
 */
export function TimeMachineControl({ onActivate }: TimeMachineControlProps) {
  return (
    <XpTooltip label={TOOLTIP_TEXT} align="right">
      <button
        type="button"
        onClick={onActivate}
        aria-label={`Time machine: go to the present — ${TOOLTIP_TEXT}`}
        className="flex h-[calc(100%-6px)] flex-shrink-0 items-center gap-1.5 rounded-[3px] border border-[#7a6a3a] bg-linear-to-b from-[#f5e6b8] to-[#c9a94a] px-2.5 text-xp-sm font-semibold text-[#3a2f0f] hover:brightness-105 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] max-[600px]:px-2"
      >
        <ClockIcon />
        <span className="max-[600px]:hidden">Go to the present →</span>
      </button>
    </XpTooltip>
  );
}
